import dotenv from 'dotenv';

dotenv.config();

import Incident from '../modules/incident/incident.model.js';
import connectDB from '../config/db.js';
import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import Metric from '../modules/monitoring/monitoring.model.js';
import AlertRule from '../modules/alerts/alertRule.model.js';
import Alert from '../modules/alerts/alert.model.js';
import { INCIDENT_STATUS } from '../modules/incident/incident.constants.js';
import { shouldEscalateSeverity } from '../modules/incident/incident.utils.js';

if (!redisConnection) {
    console.log('Redis is disabled; monitoring worker will not start.');
    process.exit(0);
}

await connectDB();

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

const worker = new Worker(
    'monitoring-queue',
    async (job) => {
        console.log(`Processing Job: ${job.name}`);

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

            if (!activeIncident) {
                try {
                    activeIncident = await Incident.create({
                        service: metric.service,
                        metricType: metric.metricType,
                        title: `${metric.metricType.toUpperCase()} issue detected on ${metric.service}`,
                        description: `${metric.metricType.toUpperCase()} crossed threshold value ${rule.threshold}. Current value is ${metric.value}.`,
                        severity: incomingSeverity,
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

            if (shouldEscalateSeverity(activeIncident.severity, incomingSeverity)) {
                const previousSeverity = activeIncident.severity;

                activeIncident.severity = incomingSeverity;

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
        }
    },
    {
        connection: redisConnection,
    }
);

worker.on('completed', (job) => {
    console.log(`Completed Job ${job.id}`);
});

worker.on('failed', (job, err) => {
    console.log(`Failed Job ${job?.id}`);
    console.log(err.message);
});