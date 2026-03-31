import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../queues/connection.js';

export const scrapeJobsWorker = new Worker(
  'scrape-jobs',
  async (job: Job) => {
    console.log(`[scrape-jobs] Started job ${job.id}`);
    // Stub implementation
    console.log('[scrape-jobs] Scraping platforms...');
    return { success: true };
  },
  { connection: redisConnection },
);

scrapeJobsWorker.on('completed', (job) => {
  console.log(`[scrape-jobs] Completed job ${job.id}`);
});
scrapeJobsWorker.on('failed', (job, err) => {
  console.error(`[scrape-jobs] Failed job ${job?.id}:`, err);
});
