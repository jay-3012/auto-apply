import type { Page } from 'playwright';
import { launchStealthBrowser, createStealthContext } from './base-scraper.js';
import { delay } from '#utils/delay.js';
import { Platform } from '#types/db.types.js';
import type { IScrapedJob } from '#types/scraper.types.js';
import type { RoleConfigAttributes } from '../db/models/role-config.model.js';
import {
  INTERNSHALA_BASE_URL,
  SCRAPER_MIN_DELAY_MS,
  SCRAPER_MAX_DELAY_MS,
  SCRAPER_MAX_PAGES,
  DEFAULT_SCRAPE_LIMIT,
} from '#config/constants.js';

// ─── Selectors ──────────────────────────────────────────────────
const SEL_JOB_CARD = '.individual_internship, .internship_meta, .job, .individual_job';
const SEL_JOB_TITLE = '.job-internship-name a, h3.job-internship-name, .individual_internship a.view_detail_button';
const SEL_COMPANY = '.company_name a, p.company-name, .company_and_premium a';
const SEL_LOCATION = '.locations a, span.locations, .individual_internship .locations';
const SEL_SALARY = '.salary span, .stipend, .desktop-text .salary';
const SEL_VIEW_DETAIL = 'a.view_detail_button, a[href*="/job/detail/"], .job-internship-name a';

/**
 * Builds Internshala search URL from role keywords and location.
 */
const buildSearchUrl = (roleName: string, keywords: string[]): string => {
  const allTerms = [roleName, ...keywords];
  const slug = allTerms
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return `${INTERNSHALA_BASE_URL}/jobs/${slug}-jobs`;
};

/**
 * Extracts job listings from a single Internshala search results page.
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
      const linkEl = await card.$(SEL_VIEW_DETAIL);

      const title = await titleEl?.textContent() ?? '';
      const company = await companyEl?.textContent() ?? '';
      const location = await locationEl?.textContent() ?? null;
      const salary = await salaryEl?.textContent() ?? null;
      const href = await linkEl?.getAttribute('href') ?? '';

      if (!title.trim() || !company.trim()) continue;

      const url = href.startsWith('http') ? href : `${INTERNSHALA_BASE_URL}${href}`;

      const idMatch = href.match(/\/(\d+)/);
      const externalId = idMatch?.[1] ?? `is-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      jobs.push({
        title: title.trim(),
        company: company.trim(),
        platform: Platform.INTERNSHALA,
        url,
        jdText: '',
        salary: salary?.trim() ?? null,
        location: location?.trim() ?? null,
        externalId: `internshala-${externalId}`,
      });
    } catch {
      continue;
    }
  }

  return jobs;
};

/**
 * Fetches the full job description from an individual Internshala job page.
 */
const fetchJobDescription = async (page: Page, jobUrl: string): Promise<string> => {
  try {
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });
    await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

    const jdSelectors = [
      '.text-container .internship_details',
      '.job-description-text-container',
      '#job-detail',
      '.detail_view .text-container',
      '.about_company_text_container',
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

    const bodyText = await page.$eval('main, .detail_view, .container', (el) => el.textContent ?? '').catch(() => '');
    return bodyText.trim() || 'Job description not available';
  } catch {
    return 'Job description not available';
  }
};

/**
 * Scrapes Internshala for job listings matching the given role configs.
 */
export const scrapeInternshala = async (roleConfigs: RoleConfigAttributes[]): Promise<IScrapedJob[]> => {
  const allJobs: IScrapedJob[] = [];
  let browser = null;

  try {
    browser = await launchStealthBrowser();
    const context = await createStealthContext(browser);
    const page = await context.newPage();

    for (const role of roleConfigs) {
      const searchUrl = buildSearchUrl(role.roleName, role.keywords);
      console.log(`[internshala] Scraping: ${searchUrl}`);

      try {
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
        await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);

        let pageNum = 1;
        while (pageNum <= SCRAPER_MAX_PAGES && allJobs.length < DEFAULT_SCRAPE_LIMIT) {
          const pageJobs = await scrapeJobsFromPage(page);
          if (pageJobs.length === 0) break;

          for (const job of pageJobs) {
            if (allJobs.length >= DEFAULT_SCRAPE_LIMIT) break;
            job.jdText = await fetchJobDescription(page, job.url);
            allJobs.push(job);
            await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
          }

          pageNum++;
          const nextPageUrl = `${searchUrl}/page-${pageNum}`;
          try {
            await page.goto(nextPageUrl, { waitUntil: 'domcontentloaded' });
            await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
          } catch {
            break;
          }
        }
      } catch (error) {
        console.error(`[internshala] Error scraping role "${role.roleName}":`, error);
      }

      await delay(SCRAPER_MIN_DELAY_MS, SCRAPER_MAX_DELAY_MS);
    }

    await context.close();
  } catch (error) {
    console.error('[internshala] Fatal scraper error:', error);
  } finally {
    await browser?.close();
  }

  console.log(`[internshala] Scraped ${allJobs.length} jobs total`);
  return allJobs;
};
