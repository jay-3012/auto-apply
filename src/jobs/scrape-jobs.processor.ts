import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../queues/connection.js';
import { runAllScrapers } from '../services/scraper.service.js';

export const scrapeJobsWorker = new Worker(
  'scrape-jobs',
  async (job: Job) => {
    console.log(`[scrape-jobs] Started job ${job.id}`);

    const result = await runAllScrapers();

    console.log(
      `[scrape-jobs] Completed. ` +
      `Total: ${result.total}, New: ${result.newJobs}, ` +
      `Duplicates: ${result.duplicates}, Failed: ${result.failed}`,
    );

    return result;
  },
  {
    connection: redisConnection,
    concurrency: 1, // Only one scrape cycle at a time
  },
);

scrapeJobsWorker.on('completed', (job) => {
  console.log(`[scrape-jobs] Completed job ${job.id}`);
});
scrapeJobsWorker.on('failed', (job, err) => {
  console.error(`[scrape-jobs] Failed job ${job?.id}:`, err);
});
