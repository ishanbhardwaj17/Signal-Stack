import dotenv from 'dotenv';

dotenv.config();

import Incident from '../modules/incident/incident.model.js';
import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import Metric from '../modules/monitoring/monitoring.model.js';
import AlertRule from '../modules/alerts/alertRule.model.js';
import Alert from '../modules/alerts/alert.model.js';
import { INCIDENT_STATUS } from '../modules/incident/incident.constants.js';
import { shouldEscalateSeverity } from '../modules/incident/incident.utils.js';
import {
    calculateSlaDueAt,
    getSlaDelayMs,
} from '../modules/incident/incident.sla.js';
import {
    scheduleIncidentAnalysis,
    scheduleSlaCheck,
} from '../queues/monitoring.queue.js';
import {
    runQueuedIncidentAnalysis,
} from '../modules/ai/ai.service.js';
import { autoAssignIncident } from '../modules/incident/assignment.service.js';
import {
    buildIncidentEventPayload,
    buildLiveFeedEvent,
} from '../modules/incident/incident.service.js';
import { emitSocketEvent } from '../socket/socket.events.js';

let monitoringWorker = null;

const evaluateCondition = (
    metricValue,
    operator,
    threshold
) => {
    switch (operator) {
        case '>':
            return metricValue > threshold;
        case '<':
            return metricValue < threshold;
        case '>=':
            return metricValue >= threshold;
        case '<=':
            return metricValue <= threshold;
        case '==':
            return metricValue === threshold;
        default:
            return false;
    }
};

const processMonitoringJob = async (job) => {
        console.log(`Processing Job: ${job.name}`);

        if (job.name === 'sla-check') {
            const { incidentId } = job.data;

            const incident =
                await Incident.findById(incidentId);

            if (!incident) {
                return;
            }

            if (
                incident.status === INCIDENT_STATUS.RESOLVED ||
                incident.status === INCIDENT_STATUS.CLOSED
            ) {
                console.log(
                    `Incident ${incidentId} already resolved`
                );

                return;
            }

            incident.slaBreached = true;

            incident.timeline.push({
                action: 'SLA_BREACHED',
                current: `SLA breached for ${incident.severity} incident`,
                timestamp: new Date(),
            });

            await incident.save();

            const payload =
                await buildIncidentEventPayload(
                    incidentId
                );

            emitSocketEvent(
                'incident:slaBreached',
                payload
            );
            emitSocketEvent(
                'incident:feed',
                buildLiveFeedEvent(
                    'SLA_BREACHED',
                    payload,
                    {
                        message: 'Incident SLA has been breached',
                    }
                )
            );

            console.log(
                `SLA Breached for Incident ${incidentId}`
            );

            return;
        }

        if (
            job.name ===
            'incident-ai-analysis'
        ) {
            const { incidentId } =
                job.data;

            console.log(
                `Running AI analysis for ${incidentId}`
            );

            try {
                await runQueuedIncidentAnalysis(
                    incidentId
                );

                console.log(
                    `AI analysis completed`
                );
            } catch (error) {
                console.log(
                    `AI analysis failed`
                );

                console.log(error.message);
            }

            return;
        }

        if (job.name !== 'metric-ingestion') {
            return;
        }

        const { metricId } = job.data;

        const metric = await Metric.findById(metricId);

        if (!metric) {
            throw new Error('Metric not found');
        }

        console.log('Metric Received');
        console.log({
            service: metric.service,
            metricType: metric.metricType,
            value: metric.value,
        });

        const matchingRules = await AlertRule.find({
            service: metric.service,
            metricType: metric.metricType,
            isActive: true,
        });

        console.log(`Found ${matchingRules.length} matching rules`);

        for (const rule of matchingRules) {
            const isBreached = evaluateCondition(
                metric.value,
                rule.operator,
                rule.threshold
            );

            if (!isBreached) {
                continue;
            }

            console.log('Threshold Breached');

            const incomingSeverity = rule.severity.toUpperCase();

            const alert = await Alert.create({
                service: metric.service,
                metricType: metric.metricType,
                metricValue: metric.value,
                threshold: rule.threshold,
                operator: rule.operator,
                severity: incomingSeverity,
                message: `${metric.metricType.toUpperCase()} threshold breached on ${metric.service}`,
            });

            console.log('Alert Created');
            console.log(alert);

            let activeIncident = await Incident.findOne({
                service: metric.service,
                metricType: metric.metricType,
                status: {
                    $in: [
                        INCIDENT_STATUS.OPEN,
                        INCIDENT_STATUS.TRIAGED,
                        INCIDENT_STATUS.IN_PROGRESS,
                        INCIDENT_STATUS.MONITORING,
                    ],
                },
            });
            console.log(
  activeIncident
    ? `Reusing Incident ${activeIncident._id}`
    : 'No active incident found'
);

            if (!activeIncident) {
                try {
                    activeIncident = await Incident.create({
                        service: metric.service,
                        metricType: metric.metricType,
                        title: `${metric.metricType.toUpperCase()} issue detected on ${metric.service}`,
                        description: `${metric.metricType.toUpperCase()} crossed threshold value ${rule.threshold}. Current value is ${metric.value}.`,
                        severity: incomingSeverity,
                        slaDueAt: calculateSlaDueAt(incomingSeverity),
                        category: 'monitoring',
                        source: 'monitoring',
                        triggeredByAlert: alert._id,
                        timeline: [
                            {
                                action: 'Incident auto-created',
                                current: `Alert triggered for ${metric.metricType}`,
                                timestamp: new Date(),
                            },
                        ],
                    });

                    console.log('Incident Created Successfully');

                    const createdPayload =
                        await buildIncidentEventPayload(
                            activeIncident._id
                        );

                    emitSocketEvent(
                        'incident:created',
                        createdPayload
                    );
                    emitSocketEvent(
                        'incident:feed',
                        buildLiveFeedEvent(
                            'CREATED',
                            createdPayload,
                            {
                                message: `Monitoring created a ${createdPayload.severity.toLowerCase()} incident`,
                            }
                        )
                    );

                    await autoAssignIncident(activeIncident);

                    const assignedPayload =
                        await buildIncidentEventPayload(
                            activeIncident._id
                        );

                    emitSocketEvent(
                        'incident:assigned',
                        assignedPayload
                    );
                    emitSocketEvent(
                        'incident:feed',
                        buildLiveFeedEvent(
                            'ASSIGNED',
                            assignedPayload,
                            {
                                message: `Incident auto-assigned to ${assignedPayload.assignedTo?.name || 'an engineer'}`,
                            }
                        )
                    );


                    await scheduleSlaCheck(
                        activeIncident._id,
                        getSlaDelayMs(
                            incomingSeverity
                        )
                    );

                    await scheduleIncidentAnalysis(
                        activeIncident._id
                    );

                    console.log(
                        `SLA Check Scheduled for ${activeIncident._id}`
                    );

                    console.log(
                        `AI Analysis Job Scheduled for ${activeIncident._id}`
                    );

                    console.log('Incident Created');
                    console.log(activeIncident);
                } catch (error) {
                    console.log('Incident Creation Failed');
                    console.log(error.message);
                }
            }

            if (!activeIncident) {
                continue;
            }

            await Alert.findByIdAndUpdate(alert._id, {
                incidentId: activeIncident._id,
            });

            activeIncident.timeline.push({
                action: 'Alert linked',
                current: `${metric.metricType.toUpperCase()} value ${metric.value} breached threshold ${rule.threshold}`,
                timestamp: new Date(),
            });

            let severityEscalated = false;

            if (shouldEscalateSeverity(activeIncident.severity, incomingSeverity)) {
                const previousSeverity = activeIncident.severity;

                activeIncident.severity = incomingSeverity;
                severityEscalated = true;

                activeIncident.slaDueAt =
                    calculateSlaDueAt(
                        incomingSeverity
                    );

                activeIncident.timeline.push({
                    action: 'SLA_UPDATED',

                    previous: previousSeverity,

                    current: incomingSeverity,

                    timestamp: new Date(),
                });

                activeIncident.timeline.push({
                    action: 'SEVERITY_ESCALATED',
                    previous: previousSeverity,
                    current: incomingSeverity,
                    timestamp: new Date(),
                });

                console.log(
                    `Severity escalated from ${previousSeverity} to ${incomingSeverity}`
                );
            }

            await activeIncident.save();

            const alertPayload =
                await buildIncidentEventPayload(
                    activeIncident._id
                );

            emitSocketEvent(
                'incident:feed',
                buildLiveFeedEvent(
                    'ALERT_TRIGGERED',
                    alertPayload,
                    {
                        message: `${metric.metricType.toUpperCase()} hit ${metric.value} on ${metric.service}`,
                        meta: {
                            metricType:
                                metric.metricType,
                            metricValue:
                                metric.value,
                            threshold:
                                rule.threshold,
                            operator:
                                rule.operator,
                            alertId:
                                alert._id.toString(),
                        },
                    }
                )
            );

            if (severityEscalated) {
                const payload =
                    await buildIncidentEventPayload(
                        activeIncident._id
                    );

                emitSocketEvent(
                    'incident:severityEscalated',
                    payload
                );
                emitSocketEvent(
                    'incident:feed',
                    buildLiveFeedEvent(
                        'SEVERITY_ESCALATED',
                        payload,
                        {
                            message: `Severity escalated to ${payload.severity}`,
                        }
                    )
                );
            }
        }
};

export const initMonitoringWorker = () => {
    if (monitoringWorker || !redisConnection) {
        return monitoringWorker;
    }

    monitoringWorker = new Worker(
        'monitoring-queue',
        processMonitoringJob,
        {
            connection: redisConnection,
        }
    );

    monitoringWorker.on('completed', (job) => {
        console.log(`Completed Job ${job.id}`);
    });

    monitoringWorker.on('failed', (job, err) => {
        console.log(`Failed Job ${job?.id}`);
        console.log(err.message);
    });

    console.log('Monitoring worker initialized');

    return monitoringWorker;
};
