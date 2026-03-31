import { JobListing } from '../db/models/job-listing.model.js';
import { JobStatus, Platform } from '#types/db.types.js';
import type { GetJobsOptions, PaginatedResult } from '#types/scraper.types.js';
import type { JobListingAttributes } from '../db/models/job-listing.model.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '#config/constants.js';
import type { WhereOptions } from 'sequelize';

/**
 * Fetches paginated job listings with optional status and platform filters.
 */
export const getJobs = async (options: GetJobsOptions): Promise<PaginatedResult<JobListing>> => {
  const page = Math.max(options.page || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(options.limit || DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT);
  const offset = (page - 1) * limit;

  const where: WhereOptions<JobListingAttributes> = {};

  if (options.status && Object.values(JobStatus).includes(options.status as JobStatus)) {
    where.status = options.status as JobStatus;
  }

  if (options.platform && Object.values(Platform).includes(options.platform as Platform)) {
    where.platform = options.platform as Platform;
  }

  const { rows: data, count: total } = await JobListing.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Fetches a single job listing by its ID.
 * Returns null if not found.
 */
export const getJobById = async (id: string): Promise<JobListing | null> => {
  return JobListing.findByPk(id);
};
