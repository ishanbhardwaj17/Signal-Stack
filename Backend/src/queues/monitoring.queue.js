import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const monitoringQueue = new Queue(
  'monitoring-queue',
  {
    connection: redisConnection,
  }
);