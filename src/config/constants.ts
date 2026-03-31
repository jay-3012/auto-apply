// ─── Scraper Timing ─────────────────────────────────────────────
export const SCRAPER_MIN_DELAY_MS = 500;
export const SCRAPER_MAX_DELAY_MS = 2500;
export const SCRAPER_NAVIGATION_TIMEOUT_MS = 30000;
export const SCRAPER_MAX_PAGES = 5; // Max pagination pages per role per platform

// ─── Redis Keys ─────────────────────────────────────────────────
export const REDIS_SEEN_JOBS_KEY = 'seen-jobs';

// ─── Platform Base URLs ─────────────────────────────────────────
export const WELLFOUND_BASE_URL = 'https://wellfound.com';
export const INTERNSHALA_BASE_URL = 'https://internshala.com';
export const INDEED_BASE_URL = 'https://in.indeed.com';
export const NAUKRI_BASE_URL = 'https://www.naukri.com';

// ─── Scraper Results ────────────────────────────────────────────
export const DEFAULT_SCRAPE_LIMIT = 50; // Max jobs per platform per run

// ─── API Defaults ───────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
