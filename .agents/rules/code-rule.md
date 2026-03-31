---
trigger: always_on
---

# AI Job Applier — Code Rules & Standards (TypeScript)

> These rules apply to every file, every layer, every contributor. No exceptions. Consistency is what keeps a six-layer async system maintainable.

---

## General Principles

- **Clarity over cleverness.** If a junior developer cannot read your code and understand what it does in 30 seconds, rewrite it.
- **One responsibility per file.** A scraper file scrapes. A service file contains business logic. A controller file handles HTTP. Never mix these.
- **No magic numbers.** Every constant lives in a config file or environment variable. No hardcoded strings, URLs, timeouts, or thresholds scattered across the codebase.
- **Fail loudly in development, gracefully in production.** Errors should crash in dev so you catch them. In production, log and recover.
- **Never commit secrets.** API keys, credentials, and tokens live in `.env` only. `.env` is always in `.gitignore`.
- **TypeScript strict mode is always on.** No exceptions. `any` is banned. If you cannot type it, you do not understand it well enough to write it.

---

## Project Structure

```
/
├── src/
│   ├── config/          → env vars, constants, LiteLLM config
│   ├── db/
│   │   ├── models/      → one file per Sequelize model
│   │   └── migrations/  → one file per schema change
│   ├── queues/          → BullMQ queue definitions and worker registrations
│   ├── jobs/            → one file per BullMQ job processor
│   ├── scrapers/        → one file per platform
│   ├── intelligence/    → fitScore, atsScore, tailor, humanize, research
│   ├── resume/          → GitHub push, compile trigger, PDF retrieval
│   ├── apply/           → playwright apply, nodemailer apply
│   ├── api/
│   │   ├── routes/      → one file per resource
│   │   └── controllers/ → one file per resource, mirrors routes
│   ├── services/        → cross-cutting business logic
│   ├── middleware/      → auth, error handler, request logger
│   ├── types/           → shared TypeScript interfaces and enums
│   └── utils/           → pure helper functions, no side effects
├── tests/
│   ├── unit/
│   └── integration/
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .env.example
└── package.json
```

---

## TypeScript Configuration

**`tsconfig.json` — required settings:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "paths": {
      "#config/*": ["./src/config/*"],
      "#db/*": ["./src/db/*"],
      "#types/*": ["./src/types/*"],
      "#utils/*": ["./src/utils/*"]
    }
  }
}
```

- `strict: true` is non-negotiable — never disable it
- `noUncheckedIndexedAccess: true` forces you to handle undefined on array and object access
- Path aliases (`#config/`, `#db/`, etc.) are used for all internal imports — no `../../../` chains

---

## Naming Conventions

### Files

- All files: `kebab-case` — `naukri-scraper.ts`, `ats-score.ts`, `apply-controller.ts`
- Model files: singular noun — `job-listing.model.ts`, `application.model.ts`
- Type files: descriptive noun — `job.types.ts`, `ai.types.ts`
- Test files: mirror the source — `naukri-scraper.test.ts`

### Variables and Functions

- Variables and functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Classes and interfaces: `PascalCase`
- Enums: `PascalCase` name, `UPPER_SNAKE_CASE` values
- Boolean variables: prefix with `is`, `has`, `can`, `should` — `isActive`, `hasApplied`
- Async functions: always `async/await`, never raw `.then()` chains

### Types and Interfaces

- Interfaces for object shapes: `IJobListing`, `IApplication`
- Types for unions, computed types, and aliases: `JobStatus`, `Platform`
- Enums for fixed value sets defined in the DB schema

```ts
// types/job.types.ts
export enum JobStatus {
  PENDING = "PENDING",
  FILTERED = "FILTERED",
  REVIEW = "REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum Platform {
  NAUKRI = "naukri",
  INDEED = "indeed",
  WELLFOUND = "wellfound",
  INTERNSHALA = "internshala",
}

export interface IJobListing {
  id: string;
  title: string;
  company: string;
  platform: Platform;
  url: string;
  jdText: string;
  salary: string | null;
  status: JobStatus;
}
```

---

## TypeScript Rules

### No `any` — Ever

```ts
// Wrong
const result: any = await llmClient.complete(prompt);

// Correct — define the return type
const result: LLMResponse = await llmClient.complete(prompt);
```

If you are dealing with an unknown external API response, use `unknown` and narrow the type explicitly.

```ts
const raw: unknown = await response.json();
if (!isLLMResponse(raw))
  throw new AppError("Unexpected LLM response shape", 500);
const data: LLMResponse = raw;
```

### Return Types on All Functions

Every function must have an explicit return type. Never rely on inference for function signatures.

```ts
// Wrong
const buildPrompt = (jd: string, resume: string) => {
  return `Analyze this resume against the JD...`;
};

// Correct
const buildPrompt = (jd: string, resume: string): string => {
  return `Analyze this resume against the JD...`;
};

// Async functions
const fetchJobs = async (roleConfig: IRoleConfig): Promise<IJobListing[]> => { ... };
```

### Options Objects Over Multiple Parameters

```ts
// Wrong
const tailorResume = async (tex: string, jd: string, gaps: string[], role: string): Promise<string> => { ... }

// Correct
interface TailorResumeOptions {
  texContent: string;
  jdText: string;
  gapAnalysis: string[];
  roleName: string;
}
const tailorResume = async (options: TailorResumeOptions): Promise<string> => { ... }
```

### Null Safety

```ts
// Wrong — will crash if salary is null
const display = job.salary.trim();

// Correct — handle null explicitly
const display = job.salary?.trim() ?? "Not specified";
```

---

## Sequelize + TypeScript Rules

- Every model uses `Model` generic typing from `sequelize-typescript` or manual type assertions
- All model attributes are typed via an `Attributes` interface
- Association methods are typed explicitly — never assume `.getJobListing()` exists without declaring it

```ts
// db/models/application.model.ts
import { Model, DataTypes, Optional } from 'sequelize';

interface ApplicationAttributes {
  id: string;
  jobId: string;
  resumeId: string;
  atsScore: number;
  fitScore: number;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  result: 'APPLIED' | 'FAILED' | null;
}

type ApplicationCreationAttributes = Optional<ApplicationAttributes, 'id' | 'result'>;

class Application extends Model<ApplicationAttributes, ApplicationCreationAttributes>
  implements ApplicationAttributes { ... }
```

- Every schema change has a migration file — never use `sync({ force: true })` outside tests
- Always use transactions for multi-table writes — typed with `Transaction` from Sequelize

---

## BullMQ + TypeScript Rules

Every job payload is a typed interface — never pass untyped objects into queues.

```ts
// types/queue.types.ts
export interface ProcessJobPayload {
  jobListingId: string;
}

export interface ApplyJobPayload {
  applicationId: string;
}

// queues/process-job.queue.ts
import { Queue } from "bullmq";
import type { ProcessJobPayload } from "#types/queue.types.js";

export const processJobQueue = new Queue<ProcessJobPayload>("process-job", {
  connection: redisConnection,
});
```

- Always define `attempts` and `backoff` for jobs that call external services
- Never store large payloads in job data — pass only IDs, fetch from DB inside the processor
- Always log job ID on start, completion, and failure

---

## Playwright + TypeScript Rules

- Scraper return type is always `Promise<IScrapedJob[]>` where `IScrapedJob` is defined in `types/`
- Platform selectors are typed as `Record<string, string>` constants at the top of each scraper file
- Always type the browser, context, and page variables explicitly

```ts
import type { Browser, BrowserContext, Page } from "playwright";

const scrapeNaukri = async (
  roleConfig: IRoleConfig,
): Promise<IScrapedJob[]> => {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();
    // ...
  } finally {
    await browser?.close();
  }
};
```

---

## AI / LiteLLM + TypeScript Rules

- All LLM response shapes are typed — never leave them as `unknown` after the guard
- Prompt builder functions always return `string` with explicit return type annotation
- Temperature and token limits are typed constants, never inline numbers

```ts
// intelligence/llm-client.ts
export interface LLMRequest {
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
}

// intelligence/ats-score.ts
const ATS_TEMPERATURE = 0.2;
const ATS_MAX_TOKENS = 1000;

export const scoreAts = async (options: AtsScoreOptions): Promise<AtsScoreResult> => { ... };
```

---

## API + TypeScript Rules

- All request bodies are typed with interfaces and validated before use
- All route handlers are typed with Express's `Request`, `Response`, `NextFunction`
- Consistent response envelope enforced via a typed helper

```ts
// utils/response.ts
export const success = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ success: true, data });
};

export const failure = (res: Response, error: AppError): void => {
  res
    .status(error.statusCode)
    .json({
      success: false,
      error: { code: error.code, message: error.message },
    });
};
```

---

## Error Handling Rules

```ts
// utils/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

- All custom errors extend `AppError`
- One global error middleware catches everything — typed as `ErrorRequestHandler` from Express
- Never expose raw Sequelize errors or stack traces to the client in production

---

## Git Rules

- Branch naming: `feature/`, `fix/`, `chore/` — `feature/naukri-scraper`, `fix/ats-prompt`
- Commit messages: imperative present tense — `Add Naukri scraper`, `Fix ATS score threshold`
- Never commit to `main` directly — always via pull request
- Every PR must pass `tsc --noEmit`, ESLint, and tests before merge

---

## What Is Never Allowed

- `any` type — use `unknown` and narrow, or define the interface
- `// @ts-ignore` or `// @ts-expect-error` without a written explanation in the comment
- `console.log` in production code — use the structured logger
- Inline SQL — always use Sequelize methods
- Storing resume `.tex` content in BullMQ job payloads — store in DB, pass the ID
- Committing `.env` under any circumstances
- Bypassing the human approval step programmatically — must always be an explicit user-triggered API call

---

_Strict TypeScript is not bureaucracy — it is the cheapest form of documentation and the fastest way to catch bugs before they reach production._
