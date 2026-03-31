import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, BrowserContext } from 'playwright';
import { SCRAPER_NAVIGATION_TIMEOUT_MS } from '#config/constants.js';

// Register stealth plugin — patches fingerprints to avoid bot detection
chromium.use(StealthPlugin());

/**
 * Launches a stealth-patched Chromium browser instance.
 * All scrapers use this shared launch function to ensure
 * consistent stealth configuration across platforms.
 */
export const launchStealthBrowser = async (): Promise<Browser> => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
  });
  return browser;
};

/**
 * Creates a new browser context with human-like settings:
 * - Random viewport size
 * - Common user agent
 * - Locale and timezone set to India
 */
export const createStealthContext = async (browser: Browser): Promise<BrowserContext> => {
  const viewportWidths = [1366, 1440, 1536, 1920];
  const viewportHeights = [768, 900, 864, 1080];
  const widthIndex = Math.floor(Math.random() * viewportWidths.length);
  const heightIndex = Math.floor(Math.random() * viewportHeights.length);

  const context = await browser.newContext({
    viewport: {
      width: viewportWidths[widthIndex] ?? 1440,
      height: viewportHeights[heightIndex] ?? 900,
    },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  // Set default navigation timeout
  context.setDefaultNavigationTimeout(SCRAPER_NAVIGATION_TIMEOUT_MS);
  context.setDefaultTimeout(SCRAPER_NAVIGATION_TIMEOUT_MS);

  return context;
};
