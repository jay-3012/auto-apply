import type { Page } from 'playwright';
import { launchStealthBrowser, createStealthContext } from './base-scraper.js';
import { delay } from '#utils/delay.js';
import { Platform } from '#types/db.types.js';
import type { IScrapedJob } from '#types/scraper.types.js';
import type { RoleConfigAttributes } from '../db/models/role-config.model.js';
import {
  INDEED_BASE_URL,
  SCRAPER_MIN_DELAY_MS,
  SCRAPER_MAX_DELAY_MS,
  SCRAPER_MAX_PAGES,
  DEFAULT_SCRAPE_LIMIT,
} from '#config/constants.js';
import { env } from '#config/env.js';

// ─── Selectors ──────────────────────────────────────────────────
const SEL_JOB_CARD = '.job_seen_beacon, .resultContent, div[data-jk], .slider_container .slider_item';
const SEL_JOB_TITLE = 'h2.jobTitle a, .jobTitle > a, a[data-jk]';
const SEL_COMPANY = '[data-testid="company-name"], span.companyName, .company_location .companyName';
const SEL_LOCATION = '[data-testid="text-location"], div.companyLocation, .company_location .companyLocation';
const SEL_SALARY = '.salary-snippet-container, .metadata.salary-snippet-container, [class*="salary"]';

/**
 * Builds Indeed search URL with query and location filters.
 */
const buildSearchUrl = (query: string, location: string, start = 0): string => {
  const params = new URLSearchParams({
    q: query,
    l: location,
    start: start.toString(),
    fromage: '7',
  });
  return `${INDEED_BASE_URL}/jobs?${params.toString()}`;
};

/**
 * Builds a search query from role name and keywords.
 */
const buildSearchQuery = (roleName: string, keywords: string[]): string => {
  const terms = [roleName, ...keywords.slice(0, 3)];
  return terms.join(' ');
};

/**
 * Extracts job data from Indeed search results page.
 */
const scrapeJobsFromPage = async (page: Page): Promise<IScrapedJob[]> => {
  const jobs: IScrapedJob[] = [];

  await page.waitForSelector(SEL_JOB_CARD, { timeout: 15000 }).catch(() => null);
  await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

  const jobCards = await page.$$(SEL_JOB_CARD);

  for (const card of jobCards) {
    try {
      const titleEl = await card.$(SEL_JOB_TITLE);
      const companyEl = await card.$(SEL_COMPANY);
      const locationEl = await card.$(SEL_LOCATION);
      const salaryEl = await card.$(SEL_SALARY);

      const title = await titleEl?.textContent() ?? '';
      const company = await companyEl?.textContent() ?? '';
      const location = await locationEl?.textContent() ?? null;
      const salary = await salaryEl?.textContent() ?? null;

      const jobKey = await card.getAttribute('data-jk') ??
                     await titleEl?.getAttribute('data-jk') ?? '';
      const href = await titleEl?.getAttribute('href') ?? '';

      if (!title.trim() || !company.trim()) continue;

      const externalId = jobKey || `ind-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const url = href.startsWith('http')
        ? href
        : `${INDEED_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;

      jobs.push({
        title: title.trim(),
        company: company.trim(),
        platform: Platform.INDEED,
        url,
        jdText: '',
        salary: salary?.trim() ?? null,
        location: location?.trim() ?? null,
        externalId: `indeed-${externalId}`,
      });
    } catch {
      continue;
    }
  }

  return jobs;
};

/**
 * Fetches the full job description from an individual Indeed job page.
 */
const fetchJobDescription = async (page: Page, jobUrl: string): Promise<string> => {
  try {
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });
    await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

    const jdSelectors = [
      '#jobDescriptionText',
      '.jobsearch-JobComponent-description',
      '[id*="jobDescription"]',
      '.job-description',
    ];

    for (const selector of jdSelectors) {
      const el = await page.$(selector);
      if (el) {
        const text = await el.textContent();
        if (text && text.trim().length > 50) {
          return text.trim();
        }
      }
    }

    return 'Job description not available';
  } catch {
    return 'Job description not available';
  }
};

/**
 * Scrapes Indeed for job listings matching the given role configs.
 */
export const scrapeIndeed = async (roleConfigs: RoleConfigAttributes[]): Promise<IScrapedJob[]> => {
  const allJobs: IScrapedJob[] = [];
  let browser = null;

  try {
    browser = await launchStealthBrowser();
    const context = await createStealthContext(browser);
    const page = await context.newPage();

    for (const role of roleConfigs) {
      const query = buildSearchQuery(role.roleName, role.keywords);
      console.log(`[indeed] Scraping: "${query}" in "${env.SEARCH_LOCATION}"`);

      try {
        for (let pageNum = 0; pageNum < SCRAPER_MAX_PAGES; pageNum++) {
          if (allJobs.length >= DEFAULT_SCRAPE_LIMIT) break;

          const offset = pageNum * 10;
          const searchUrl = buildSearchUrl(query, env.SEARCH_LOCATION, offset);
          await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
          await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

          const pageJobs = await scrapeJobsFromPage(page);
          if (pageJobs.length === 0) break;

          const detailPage = await context.newPage();
          for (const job of pageJobs) {
            if (allJobs.length >= DEFAULT_SCRAPE_LIMIT) break;
            job.jdText = await fetchJobDescription(detailPage, job.url);
            allJobs.push(job);
            await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
          }
          await detailPage.close();
        }
      } catch (error) {
        console.error(`[indeed] Error scraping role "${role.roleName}":`, error);
      }

      await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
    }

    await context.close();
  } catch (error) {
    console.error('[indeed] Fatal scraper error:', error);
  } finally {
    await browser?.close();
  }

  console.log(`[indeed] Scraped ${allJobs.length} jobs total`);
  return allJobs;
};
