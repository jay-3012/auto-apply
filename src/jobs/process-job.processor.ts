import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../queues/connection.js';
import type { ProcessJobPayload } from '#types/queue.types.js';

export const processJobWorker = new Worker<ProcessJobPayload>(
  'process-job',
  async (job: Job<ProcessJobPayload>) => {
    console.log(`[process-job] Started job ${job.id} for jobListingId ${job.data.jobListingId}`);
    // Stub implementation
    console.log(`[process-job] Running intelligence layer...`);
    return { success: true };
  },
  { connection: redisConnection },
);

processJobWorker.on('completed', (job) => {
  console.log(`[process-job] Completed job ${job.id}`);
});
processJobWorker.on('failed', (job, err) => {
  console.error(`[process-job] Failed job ${job?.id}:`, err);
});
