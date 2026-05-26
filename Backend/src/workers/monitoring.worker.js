import { Worker } from 'bullmq';

import { redisConnection } from '../config/redis.js';

import Metric from '../modules/monitoring/monitoring.model.js';

const worker = new Worker(
    'monitoring-queue',

    async (job) => {
        console.log(
            `Processing Job: ${job.name}`
        );

        if (
            job.name === 'metric-ingestion'
        ) {
            const { metricId } = job.data;

            const metric =
                await Metric.findById(metricId);

            if (!metric) {
                throw new Error(
                    'Metric not found'
                );
            }

            console.log('Metric Received:');

            console.log({
                service: metric.service,
                metricType: metric.metricType,
                value: metric.value,
            });

            // future:
            // evaluate rules
            // create alerts
            // create incidents
        }
    },

    {
        connection: redisConnection,
    }
);

worker.on('completed', (job) => {
    console.log(
        `Completed Job ${job.id}`
    );
});

worker.on('failed', (job, err) => {
    console.log(
        `Failed Job ${job.id}`
    );

    console.log(err.message);
});