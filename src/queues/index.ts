import { Queue } from 'bullmq';
import { redisConnection } from './connection.js';
import type { ProcessJobPayload, ApplyJobPayload } from '#types/queue.types.js';

export const scrapeJobsQueue = new Queue('scrape-jobs', {
  connection: redisConnection,
});

export const processJobQueue = new Queue<ProcessJobPayload>('process-job', {
  connection: redisConnection,
});

export const applyJobQueue = new Queue<ApplyJobPayload>('apply-job', {
  connection: redisConnection,
});

export const setupCronJobs = async (): Promise<void> => {
  // Clear any existing repeatable jobs to avoid duplicates during dev
  const repeatableJobs = await scrapeJobsQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await scrapeJobsQueue.removeRepeatableByKey(job.key);
  }

  await scrapeJobsQueue.add(
    'scrape-all-platforms',
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Every hour
      },
    },
  );
};
