import { z } from 'zod';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().transform(Number).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SESSION_SECRET: z.string().default('dev-session-secret-change-in-production'),
  SEARCH_LOCATION: z.string().default('Bangalore'),
  SCRAPE_CONCURRENCY: z.string().transform(Number).default(2),
  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  RESUME_REPO_OWNER: z.string().default('jay-3012'),
  RESUME_REPO_NAME: z.string().default('auto-apply-resume'),
  SEARXNG_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
