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

// Connect MongoDB
await connectDB();

// Rule Evaluation Function
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

// Create Worker
const worker = new Worker(
    'monitoring-queue',

    async (job) => {
        console.log(
            `Processing Job: ${job.name}`
        );

        // Handle Metric Ingestion Jobs
        if (job.name === 'metric-ingestion') {
            const { metricId } = job.data;

            // Fetch metric from DB
            const metric = await Metric.findById(
                metricId
            );

            if (!metric) {
                throw new Error(
                    'Metric not found'
                );
            }

            console.log('Metric Received');

            console.log({
                service: metric.service,
                metricType: metric.metricType,
                value: metric.value,
            });

            // Find Matching Rules
            const matchingRules =
                await AlertRule.find({
                    service: metric.service,
                    metricType: metric.metricType,
                    isActive: true,
                });

            console.log(
                `Found ${matchingRules.length} matching rules`
            );

            // Evaluate Each Rule
            for (const rule of matchingRules) {
                const isBreached =
                    evaluateCondition(
                        metric.value,
                        rule.operator,
                        rule.threshold
                    );

                if (isBreached) {
                    console.log(
                        'Threshold Breached'
                    );

                    // Create Alert
                    const alert =
                        await Alert.create({
                            service: metric.service,

                            metricType:
                                metric.metricType,

                            metricValue:
                                metric.value,

                            threshold:
                                rule.threshold,

                            operator:
                                rule.operator,

                            severity:
                                rule.severity,

                            message: `${metric.metricType.toUpperCase()} threshold breached on ${metric.service}`,
                        });

                    console.log(
                        'Alert Created'
                    );

                    console.log(alert);
                    // Check for existing active incident
                    let activeIncident =
                        await Incident.findOne({
                            service: metric.service,

                            metricType:
                                metric.metricType,

                            status: {
                                $in: [
                                    INCIDENT_STATUS.OPEN,
                                    INCIDENT_STATUS.TRIAGED,
                                    INCIDENT_STATUS.IN_PROGRESS,
                                    INCIDENT_STATUS.MONITORING,
                                ],
                            },
                        });

                    // If no active incident exists, create one
                    if (!activeIncident) {
                        try {
                            activeIncident =
                                await Incident.create({
                                    service:
                                        metric.service,

                                    metricType:
                                        metric.metricType,

                                    title: `${metric.metricType.toUpperCase()} issue detected on ${metric.service}`,

                                    description: `${metric.metricType.toUpperCase()} crossed threshold value ${rule.threshold}. Current value is ${metric.value}.`,

                                    severity:
                                        rule.severity.toUpperCase(),

                                    category:
                                        'monitoring',

                                    source:
                                        'monitoring',

                                    triggeredByAlert:
                                        alert._id,

                                    timeline: [
                                        {
                                            action:
                                                'Incident auto-created from monitoring alert',

                                            current:
                                                INCIDENT_STATUS.OPEN,
                                        },
                                    ],
                                });

                            console.log(
                                'Incident Created'
                            );

                            console.log(activeIncident);
                        } catch (error) {
                            console.log(
                                'Incident Creation Failed'
                            );

                            console.log(
                                error.message
                            );
                        }
                    }

                    if (activeIncident) {
                        await Alert.findByIdAndUpdate(
                            alert._id,
                            {
                                incidentId:
                                    activeIncident._id,
                            }
                        );
                    }
                }
            }
        }
    },

    {
        connection: redisConnection,
    }
);

// Worker Events
worker.on('completed', (job) => {
    console.log(
        `Completed Job ${job.id}`
    );
});

worker.on('failed', (job, err) => {
    console.log(
        `Failed Job ${job?.id}`
    );

    console.log(err.message);
});