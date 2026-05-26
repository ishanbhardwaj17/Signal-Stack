import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';

const worker = new Worker(
    'monitoring-queue',

    async (job) => {
        console.log('Processing Job...');
        console.log(job.name);
        console.log(job.data);

        await new Promise((resolve) =>
            setTimeout(resolve, 2000)
        );

        console.log('Job Completed');
    },

    {
        connection: redisConnection,
    }
);

worker.on('completed', (job) => {
    console.log(`Completed Job ${job.id}`);
});

worker.on('failed', (job, err) => {
    console.log(`Failed Job ${job.id}`);
    console.log(err.message);
});