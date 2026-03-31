import { RoleConfig } from '../db/models/role-config.model.js';
import { JobListing } from '../db/models/job-listing.model.js';
import { JobStatus, Platform } from '#types/db.types.js';
import type { IScrapedJob, ScrapeRunResult, PlatformScrapeResult } from '#types/scraper.types.js';
import { isJobSeen, markJobSeen } from '#utils/redis-client.js';
import { processJobQueue } from '#queues/index.js';
import { scrapeWellfound } from '../scrapers/wellfound-scraper.js';
import { scrapeInternshala } from '../scrapers/internshala-scraper.js';
import { scrapeIndeed } from '../scrapers/indeed-scraper.js';
import { scrapeNaukri } from '../scrapers/naukri-scraper.js';

/**
 * Initializes a blank PlatformScrapeResult.
 */
const emptyPlatformResult = (): PlatformScrapeResult => ({
  scraped: 0,
  new: 0,
  duplicates: 0,
  error: null,
});

/**
 * Deduplicates a batch of scraped jobs against the Redis seen-jobs SET.
 * Returns only jobs that have not been seen before, and marks them as seen.
 */
const deduplicateJobs = async (jobs: IScrapedJob[]): Promise<{ newJobs: IScrapedJob[]; duplicateCount: number }> => {
  const newJobs: IScrapedJob[] = [];
  let duplicateCount = 0;

  for (const job of jobs) {
    const key = `${job.platform}:${job.externalId}`;
    const seen = await isJobSeen(key);

    if (seen) {
      duplicateCount++;
      continue;
    }

    await markJobSeen(key);
    newJobs.push(job);
  }

  return { newJobs, duplicateCount };
};

/**
 * Persists a batch of scraped jobs to the database and enqueues
 * each one for processing by the intelligence layer.
 */
const persistAndEnqueue = async (jobs: IScrapedJob[]): Promise<void> => {
  for (const job of jobs) {
    const listing = await JobListing.create({
      title: job.title,
      company: job.company,
      platform: job.platform,
      url: job.url,
      jdText: job.jdText,
      salary: job.salary,
      location: job.location,
      externalId: job.externalId,
      status: JobStatus.PENDING,
    });

    await processJobQueue.add(
      `process-${listing.id}`,
      { jobListingId: listing.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );
  }
};

/**
 * Runs a single platform scraper and returns categorized results.
 */
const runPlatformScraper = async (
  platform: Platform,
  scraperFn: (configs: RoleConfig[]) => Promise<IScrapedJob[]>,
  roleConfigs: RoleConfig[],
): Promise<{ result: PlatformScrapeResult; newJobs: IScrapedJob[] }> => {
  const result = emptyPlatformResult();

  try {
    const jobs = await scraperFn(roleConfigs);
    result.scraped = jobs.length;

    const { newJobs, duplicateCount } = await deduplicateJobs(jobs);
    result.new = newJobs.length;
    result.duplicates = duplicateCount;

    return { result, newJobs };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    result.error = message;
    console.error(`[scraper-service] ${platform} failed:`, message);
    return { result, newJobs: [] };
  }
};

/**
 * Orchestrates all 4 scrapers:
 * 1. Fetches active RoleConfig records from DB
 * 2. Runs all 4 scrapers in parallel (Promise.allSettled)
 * 3. Deduplicates via Redis SADD
 * 4. Writes new listings to JobListing table (status: PENDING)
 * 5. Enqueues process-job for each new listing
 * 6. Returns aggregated stats
 */
export const runAllScrapers = async (): Promise<ScrapeRunResult> => {
  console.log('[scraper-service] Starting scrape cycle...');

  // 1. Fetch active role configs
  const roleConfigs = await RoleConfig.findAll({
    where: { isActive: true },
  });

  if (roleConfigs.length === 0) {
    console.warn('[scraper-service] No active role configs found. Skipping scrape.');
    return {
      total: 0,
      newJobs: 0,
      duplicates: 0,
      failed: 0,
      byPlatform: {
        [Platform.WELLFOUND]: emptyPlatformResult(),
        [Platform.INTERNSHALA]: emptyPlatformResult(),
        [Platform.INDEED]: emptyPlatformResult(),
        [Platform.NAUKRI]: emptyPlatformResult(),
      },
    };
  }

  console.log(`[scraper-service] Found ${roleConfigs.length} active role(s). Launching scrapers...`);

  // 2. Run all scrapers in parallel
  const [wellfoundResult, internshalaResult, indeedResult, naukriResult] = await Promise.allSettled([
    runPlatformScraper(Platform.WELLFOUND, scrapeWellfound, roleConfigs),
    runPlatformScraper(Platform.INTERNSHALA, scrapeInternshala, roleConfigs),
    runPlatformScraper(Platform.INDEED, scrapeIndeed, roleConfigs),
    runPlatformScraper(Platform.NAUKRI, scrapeNaukri, roleConfigs),
  ]);

  // 3. Collect results
  const platformResults: Record<Platform, PlatformScrapeResult> = {
    [Platform.WELLFOUND]: emptyPlatformResult(),
    [Platform.INTERNSHALA]: emptyPlatformResult(),
    [Platform.INDEED]: emptyPlatformResult(),
    [Platform.NAUKRI]: emptyPlatformResult(),
  };

  const allNewJobs: IScrapedJob[] = [];
  let failedCount = 0;

  const scraperOutputs = [
    { platform: Platform.WELLFOUND, settled: wellfoundResult },
    { platform: Platform.INTERNSHALA, settled: internshalaResult },
    { platform: Platform.INDEED, settled: indeedResult },
    { platform: Platform.NAUKRI, settled: naukriResult },
  ];

  for (const { platform, settled } of scraperOutputs) {
    if (settled.status === 'fulfilled') {
      platformResults[platform] = settled.value.result;
      allNewJobs.push(...settled.value.newJobs);
      if (settled.value.result.error) failedCount++;
    } else {
      platformResults[platform] = {
        ...emptyPlatformResult(),
        error: settled.reason instanceof Error ? settled.reason.message : 'Unknown error',
      };
      failedCount++;
    }
  }

  // 4. Persist and enqueue all new jobs
  await persistAndEnqueue(allNewJobs);

  // 5. Aggregate totals
  const totalScraped = Object.values(platformResults).reduce((sum, r) => sum + r.scraped, 0);
  const totalDuplicates = Object.values(platformResults).reduce((sum, r) => sum + r.duplicates, 0);

  const result: ScrapeRunResult = {
    total: totalScraped,
    newJobs: allNewJobs.length,
    duplicates: totalDuplicates,
    failed: failedCount,
    byPlatform: platformResults,
  };

  console.log(
    `[scraper-service] Scrape cycle complete. ` +
    `Total: ${result.total}, New: ${result.newJobs}, ` +
    `Duplicates: ${result.duplicates}, Failed platforms: ${result.failed}`,
  );

  return result;
};
