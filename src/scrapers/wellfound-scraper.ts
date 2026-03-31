import type { Page } from 'playwright';
import { launchStealthBrowser, createStealthContext } from './base-scraper.js';
import { delay } from '#utils/delay.js';
import { Platform } from '#types/db.types.js';
import type { IScrapedJob } from '#types/scraper.types.js';
import type { RoleConfigAttributes } from '../db/models/role-config.model.js';
import {
  WELLFOUND_BASE_URL,
  SCRAPER_MIN_DELAY_MS,
  SCRAPER_MAX_DELAY_MS,
  SCRAPER_MAX_PAGES,
  DEFAULT_SCRAPE_LIMIT,
} from '#config/constants.js';
import { env } from '#config/env.js';

// ─── Selectors ──────────────────────────────────────────────────
const SEL_JOB_CARD = '[data-test="JobCard"], .styles_component__ICDTn, .job-card';
const SEL_JOB_TITLE = 'a[class*="jobTitle"], h2 a, [data-test="JobTitle"]';
const SEL_COMPANY = 'a[class*="company"], [data-test="CompanyName"], span.company-name';
const SEL_LOCATION = '[class*="location"], [data-test="Location"]';
const SEL_SALARY = '[class*="salary"], [data-test="Salary"]';
const SEL_JOB_LINK = 'a[class*="jobTitle"], h2 a';

/**
 * Builds Wellfound search URL from role config and location.
 */
const buildSearchUrl = (roleName: string, location: string): string => {
  const roleSlug = roleName.toLowerCase().replace(/\s+/g, '-');
  const locationSlug = location.toLowerCase().replace(/\s+/g, '-');
  return `${WELLFOUND_BASE_URL}/role/${roleSlug}/${locationSlug}`;
};

/**
 * Extracts job data from a Wellfound listing page.
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
      const linkEl = await card.$(SEL_JOB_LINK);

      const title = await titleEl?.textContent() ?? '';
      const company = await companyEl?.textContent() ?? '';
      const location = await locationEl?.textContent() ?? null;
      const salary = await salaryEl?.textContent() ?? null;
      const href = await linkEl?.getAttribute('href') ?? '';

      if (!title.trim() || !company.trim()) continue;

      const url = href.startsWith('http') ? href : `${WELLFOUND_BASE_URL}${href}`;
      const urlParts = url.split('/');
      const externalId = urlParts[urlParts.length - 1] ?? `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      jobs.push({
        title: title.trim(),
        company: company.trim(),
        platform: Platform.WELLFOUND,
        url,
        jdText: '',
        salary: salary?.trim() ?? null,
        location: location?.trim() ?? null,
        externalId: `wellfound-${externalId}`,
      });
    } catch {
      continue;
    }
  }

  return jobs;
};

/**
 * Fetches the full job description by navigating to the individual job page.
 */
const fetchJobDescription = async (page: Page, job: IScrapedJob): Promise<string> => {
  try {
    await page.goto(job.url, { waitUntil: 'domcontentloaded' });
    await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

    const jdSelectors = [
      '[data-test="JobDescription"]',
      '.job-description',
      '[class*="description"]',
      '.styles_description__',
      'section[class*="body"]',
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

    const bodyText = await page.$eval('main, [role="main"], .content', (el) => el.textContent ?? '').catch(() => '');
    return bodyText.trim() || 'Job description not available';
  } catch {
    return 'Job description not available';
  }
};

/**
 * Scrapes Wellfound for job listings matching the given role configs.
 */
export const scrapeWellfound = async (roleConfigs: RoleConfigAttributes[]): Promise<IScrapedJob[]> => {
  const allJobs: IScrapedJob[] = [];
  let browser = null;

  try {
    browser = await launchStealthBrowser();
    const context = await createStealthContext(browser);
    const page = await context.newPage();

    for (const role of roleConfigs) {
      const searchUrl = buildSearchUrl(role.roleName, env.SEARCH_LOCATION);
      console.log(`[wellfound] Scraping: ${searchUrl}`);

      try {
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
        await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

        let pageNum = 0;
        while (pageNum < SCRAPER_MAX_PAGES && allJobs.length < DEFAULT_SCRAPE_LIMIT) {
          const pageJobs = await scrapeJobsFromPage(page);
          if (pageJobs.length === 0) break;

          for (const job of pageJobs) {
            if (allJobs.length >= DEFAULT_SCRAPE_LIMIT) break;
            job.jdText = await fetchJobDescription(page, job);
            allJobs.push(job);
            await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
          }

          const nextButton = await page.$('button[aria-label="Next"], a[rel="next"], [class*="next"]');
          if (!nextButton) break;

          await nextButton.click();
          await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
          pageNum++;
        }
      } catch (error) {
        console.error(`[wellfound] Error scraping role "${role.roleName}":`, error);
      }

      await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
    }

    await context.close();
  } catch (error) {
    console.error('[wellfound] Fatal scraper error:', error);
  } finally {
    await browser?.close();
  }

  console.log(`[wellfound] Scraped ${allJobs.length} jobs total`);
  return allJobs;
};
