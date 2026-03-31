import { Router } from 'express';
import { listJobs, getJob } from '../controllers/jobs.controller.js';

const router = Router();

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: List job listings
 *     description: Returns paginated job listings with optional status and platform filters.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, FILTERED, REVIEW, APPROVED, REJECTED]
 *         description: Filter by job status
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [naukri, indeed, wellfound, internshala]
 *         description: Filter by platform
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of job listings
 */
router.get('/', listJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get a single job listing
 *     description: Returns a job listing by ID with the full job description text.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job listing UUID
 *     responses:
 *       200:
 *         description: Job listing details
 *       404:
 *         description: Job listing not found
 */
router.get('/:id', getJob);

export const jobsRouter = router;
