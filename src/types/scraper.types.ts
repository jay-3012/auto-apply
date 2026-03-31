import type { Platform } from './db.types.js';

export interface IScrapedJob {
  title: string;
  company: string;
  platform: Platform;
  url: string;
  jdText: string;
  salary: string | null;
  location: string | null;
  externalId: string; // Platform-specific unique ID for dedup
}

export interface ScrapeRunResult {
  total: number;
  newJobs: number;
  duplicates: number;
  failed: number;
  byPlatform: Record<Platform, PlatformScrapeResult>;
}

export interface PlatformScrapeResult {
  scraped: number;
  new: number;
  duplicates: number;
  error: string | null;
}

export interface GetJobsOptions {
  status?: string;
  platform?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
