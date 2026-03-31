/**
 * Returns a promise that resolves after a random delay between minMs and maxMs.
 * Used to simulate human-like timing in scraper interactions.
 */
export const delay = (minMs: number, maxMs: number): Promise<void> => {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
};
