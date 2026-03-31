import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { scrapeJobsQueue, processJobQueue, applyJobQueue } from '#queues/index.js';

export const adminRouter = express.Router();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(scrapeJobsQueue),
    new BullMQAdapter(processJobQueue),
    new BullMQAdapter(applyJobQueue),
  ],
  serverAdapter,
});

// Basic auth middleware stub for admin (should be replaced with actual auth)
adminRouter.use('/queues', (req, res, next) => {
  // In production, secure this route!
  next();
}, serverAdapter.getRouter());
