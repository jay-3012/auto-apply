import { Redis } from 'ioredis';
import { env } from '#config/env.js';

// Shared Redis connection for BullMQ
export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
