import { Redis } from 'ioredis';
import { env } from '#config/env.js';
import { REDIS_SEEN_JOBS_KEY } from '#config/constants.js';

/**
 * Standalone Redis client for non-BullMQ operations (dedup, general-purpose).
 * BullMQ has its own connection in queues/connection.ts — this is separate
 * because BullMQ requires maxRetriesPerRequest: null, which interferes
 * with normal Redis commands.
 */
export const redisClient = new Redis(env.REDIS_URL);

/**
 * Checks if a job has already been seen (exists in the Redis SET).
 * Key format: "{platform}:{externalId}"
 */
export const isJobSeen = async (key: string): Promise<boolean> => {
  const result = await redisClient.sismember(REDIS_SEEN_JOBS_KEY, key);
  return result === 1;
};

/**
 * Marks a job as seen by adding it to the Redis SET.
 * Key format: "{platform}:{externalId}"
 * SET has no expiry — jobs are never shown again once seen.
 */
export const markJobSeen = async (key: string): Promise<void> => {
  await redisClient.sadd(REDIS_SEEN_JOBS_KEY, key);
};
