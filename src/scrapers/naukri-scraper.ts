import type { Page } from 'playwright';
import { launchStealthBrowser, createStealthContext } from './base-scraper.js';
import { delay } from '#utils/delay.js';
import { Platform } from '#types/db.types.js';
import type { IScrapedJob } from '#types/scraper.types.js';
import type { RoleConfigAttributes } from '../db/models/role-config.model.js';
import {
  NAUKRI_BASE_URL,
  SCRAPER_MIN_DELAY_MS,
  SCRAPER_MAX_DELAY_MS,
  SCRAPER_MAX_PAGES,
  DEFAULT_SCRAPE_LIMIT,
} from '#config/constants.js';
import { env } from '#config/env.js';

// ─── Selectors ──────────────────────────────────────────────────
const SEL_JOB_CARD = '.srp-jobtuple-wrapper, article.jobTuple, .cust-job-tuple, .list-header-section';
const SEL_JOB_TITLE = 'a.title, .row1 .jobTitle a, a[class*="title"]';
const SEL_COMPANY = 'a.comp-name, .row2 .comp-name, span.comp-name, a[class*="comp-name"]';
const SEL_LOCATION = '.locWdth, .location span, span.loc, span[class*="loc"]';
const SEL_SALARY = '.sal-wrap span, span.ni-job-tuple-icon-srp-rupee + span, span[class*="sal"]';
const SEL_JOB_LINK = 'a.title, a[class*="title"]';

/**
 * Builds Naukri search URL from role keywords and location.
 */
const buildSearchUrl = (roleName: string, keywords: string[], location: string, pageNum = 1): string => {
  const allTerms = [roleName, ...keywords.slice(0, 2)];
  const slug = allTerms
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
  const locationSlug = location.toLowerCase().replace(/\s+/g, '-');

  if (pageNum <= 1) {
    return `${NAUKRI_BASE_URL}/${slug}-jobs-in-${locationSlug}?k=${encodeURIComponent(roleName)}`;
  }
  return `${NAUKRI_BASE_URL}/${slug}-jobs-in-${locationSlug}-${pageNum}?k=${encodeURIComponent(roleName)}`;
};

/**
 * Extracts job data from a Naukri search results page.
 */
const scrapeJobsFromPage = async (page: Page): Promise<IScrapedJob[]> => {
  const jobs: IScrapedJob[] = [];

  await page.waitForSelector(SEL_JOB_CARD, { timeout: 20000 }).catch(() => null);
  await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

  // Scroll to trigger lazy-loaded content
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 500);
    await delay(300, 600);
  }

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

      const idMatch = href.match(/(\d{5,})/);
      const externalId = idMatch?.[1] ?? `nk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const url = href.startsWith('http') ? href : `${NAUKRI_BASE_URL}${href}`;

      jobs.push({
        title: title.trim(),
        company: company.trim(),
        platform: Platform.NAUKRI,
        url,
        jdText: '',
        salary: salary?.trim() ?? null,
        location: location?.trim() ?? null,
        externalId: `naukri-${externalId}`,
      });
    } catch {
      continue;
    }
  }

  return jobs;
};

/**
 * Fetches the full job description from an individual Naukri job page.
 */
const fetchJobDescription = async (page: Page, jobUrl: string): Promise<string> => {
  try {
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });
    await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

    const jdSelectors = [
      '.styles_JDC__dang-inner-html___',
      '.job-desc',
      '.jd-desc',
      'section.job-desc',
      '#job_desc',
      '[class*="job-description"]',
      '.dang-inner-html',
      '.other-details + .job-desc',
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

    const bodyText = await page.$eval(
      'main, .job-details, .jd-container, .styles_jd-container__',
      (el) => el.textContent ?? '',
    ).catch(() => '');

    return bodyText.trim() || 'Job description not available';
  } catch {
    return 'Job description not available';
  }
};

/**
 * Scrapes Naukri for job listings matching the given role configs.
 */
export const scrapeNaukri = async (roleConfigs: RoleConfigAttributes[]): Promise<IScrapedJob[]> => {
  const allJobs: IScrapedJob[] = [];
  let browser = null;

  try {
    browser = await launchStealthBrowser();
    const context = await createStealthContext(browser);
    const page = await context.newPage();

    // Visit homepage first to establish session cookies
    await page.goto(NAUKRI_BASE_URL, { waitUntil: 'domcontentloaded' });
    await delay(2000, 4000);

    for (const role of roleConfigs) {
      console.log(`[naukri] Scraping role: "${role.roleName}" in "${env.SEARCH_LOCATION}"`);

      try {
        for (let pageNum = 1; pageNum <= SCRAPER_MAX_PAGES; pageNum++) {
          if (allJobs.length >= DEFAULT_SCRAPE_LIMIT) break;

          const searchUrl = buildSearchUrl(role.roleName, role.keywords, env.SEARCH_LOCATION, pageNum);
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
        console.error(`[naukri] Error scraping role "${role.roleName}":`, error);
      }

      await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
    }

    await context.close();
  } catch (error) {
    console.error('[naukri] Fatal scraper error:', error);
  } finally {
    await browser?.close();
  }

  console.log(`[naukri] Scraped ${allJobs.length} jobs total`);
  return allJobs;
};
