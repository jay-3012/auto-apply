import type { Request, Response, NextFunction } from 'express';
import { getJobs, getJobById } from '../../services/job.service.js';
import { JobListing } from '../../db/models/job-listing.model.js';
import { Application } from '../../db/models/application.model.js';
import { JobStatus } from '#types/db.types.js';
import { Sequelize } from 'sequelize';
import { success } from '#utils/response.js';
import { AppError } from '#utils/app-error.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '#config/constants.js';

/**
 * GET /api/jobs
 * Returns paginated job listings with optional status and platform filters.
 *
 * Query params:
 *   - status: PENDING | FILTERED | REVIEW | APPROVED | REJECTED
 *   - platform: naukri | indeed | wellfound | internshala
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 100)
 */
export const listJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query['status'] as string | undefined;
    const platform = req.query['platform'] as string | undefined;
    const page = parseInt(req.query['page'] as string, 10) || DEFAULT_PAGE;
    const limit = parseInt(req.query['limit'] as string, 10) || DEFAULT_PAGE_LIMIT;

    const result = await getJobs({ status, platform, page, limit });
    success(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/jobs/:id
 * Returns a single job listing by ID with full jdText.
 */
export const getJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params['id'] as string;
    const job = await getJobById(id);

    if (!job) {
      throw new AppError('Job listing not found', 404, 'JOB_NOT_FOUND');
    }

    success(res, job);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/jobs/stats
 * Returns job and application statistics.
 */
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviewCount = await JobListing.count({ where: { status: JobStatus.REVIEW } });
    const appliedCount = await Application.count();
    const pendingCount = await JobListing.count({ where: { status: JobStatus.PENDING } });
    
    success(res, {
      reviewCount,
      appliedCount,
      pendingCount,
      failedCount: 0 // Placeholder
    });
  } catch (error) {
    next(error);
  }
};
