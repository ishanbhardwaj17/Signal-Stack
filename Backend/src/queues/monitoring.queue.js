import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const monitoringQueue = new Queue(
  'monitoring-queue',
  {
    connection: redisConnection,
  }
);

export const scheduleSlaCheck = async (
  incidentId,
  delay
) => {
  const job = await monitoringQueue.add(
    'sla-check',

    {
      incidentId,
    },

    {
      delay,
    }
  );

  console.log(
    `Scheduled SLA Job ${job.id}`
  );

  return job;
};