import { env } from '../../config/env.js';

export const searchCompany = async (companyName: string): Promise<string> => {
  const url = env.SEARXNG_URL;
  if (!url) {
    console.warn('[searxng] SEARXNG_URL is not configured. Returning empty search results.');
    return 'No search results available because SearXNG is not configured.';
  }

  try {
    const query = encodeURIComponent(`"${companyName}" reviews culture layoffs`);
    const response = await fetch(`${url}/search?q=${query}&format=json`);

    if (!response.ok) throw new Error(`SearXNG error: ${response.status}`);

    const data = await response.json() as any;
    const results = data.results?.map((r: any) => `- ${r.title}: ${r.content}`).join('\n') || '';

    return results || 'No relevant search results found.';
  } catch (error) {
    console.error('[searxng] Search failed:', error);
    return 'Search failed due to technical error.';
  }
};
