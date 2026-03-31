---
trigger: always_on
---

# AI Job Applier — Sprint Planning

> Six sprints. Each sprint is one week. Every sprint ends with a working, deployable increment. No sprint scope creeps into the next.

## Sprint Overview

| Sprint | Focus           | Deliverable                                |
| ------ | --------------- | ------------------------------------------ |
| 1      | Foundation      | DB, API scaffold, BullMQ, Railway deploy   |
| 2      | Scrapers        | 4-platform scraper, dedup, role filter     |
| 3      | Intelligence    | Fit score, ATS, tailor, humanize, research |
| 4      | Resume Pipeline | .tex edit, GitHub push, PDF compile        |
| 5      | Dashboard       | Angular UI, job cards, approve/reject flow |
| 6      | Apply Layer     | Playwright apply, Nodemailer, tracking     |

## Sprint 1 — Foundation

**Goal:** Every other sprint builds on this. Nothing gets built until this is solid.

### Scope

**Backend scaffold**

- Initialize Node.js + Express project with TypeScript strict mode
- Configure `tsconfig.json`, ESLint, Prettier, path aliases
- Set up `dotenv` and typed `config/env.ts` — all env vars typed and validated on startup
- Global error handler middleware, request logger middleware, health check route `GET /health`

**Database**

- PostgreSQL instance provisioned on Railway
- Sequelize initialized with connection pooling
- All five models created with full TypeScript attribute interfaces: `Resume`, `JobListing`, `Application`, `CompanyInfo`, `RoleConfig`
- All associations defined: `Application` belongs to `JobListing`, `Application` belongs to `Resume`
- Initial migration files created and run successfully

**Queue**

- Redis instance provisioned on Railway
- BullMQ initialized with Redis connection
- `scrape-jobs` queue and `process-job` queue defined in `queues/`
- Repeatable `scrape-jobs` task registered — fires every 60 minutes
- BullMQ Board wired at `/admin/queues` behind auth

**API**

- Swagger / OpenAPI spec generation configured via `swagger-jsdoc` and `swagger-ui-express`
- Spec served at `GET /api/docs` and JSON at `GET /api/docs/json`
- Stub routes created for all resources: `/api/jobs`, `/api/applications`, `/api/resumes`, `/api/roles`
- Passport.js local auth configured — `POST /api/auth/login`, `POST /api/auth/logout`

**Deployment**

- Railway project with three services: Web, PostgreSQL, Redis
- Environment variables set in Railway dashboard
- CI: `tsc --noEmit` + ESLint on every push to `main`

### Acceptance Criteria

- `GET /health` returns `200` in production
- All five Sequelize models sync without errors
- BullMQ repeatable job visible in BullMQ Board
- Swagger UI renders at `/api/docs` with all stub routes documented
- `POST /api/auth/login` returns a session cookie

## Sprint 2 — Scrapers

**Goal:** Fresh jobs flowing into the database every hour from all four platforms.

### Scope

**Playwright setup**

- Install `playwright`, `playwright-extra`, `puppeteer-extra-plugin-stealth`
- Chromium installed and confirmed working on Railway
- `delay()` utility in `utils/` — randomized ms between min/max

**Scraper modules** — one file each in `scrapers/`

- `wellfound-scraper.ts` — JSON API extraction from network tab
- `internshala-scraper.ts` — HTML scrape with pagination
- `indeed-scraper.ts` — JS-rendered scrape with pagination handling
- `naukri-scraper.ts` — JS-rendered with session/cookie handling

**Each scraper must:**

- Accept an array of `RoleConfig` and build search queries from them
- Extract: title, company, platform, url, jdText, salary (nullable), location
- Return typed `IScrapedJob[]`
- Close browser in `finally` block — no zombie processes

**Deduplication**

- Redis `SADD` on a `seen-jobs` SET using platform + external job ID as key
- Skip any job whose key already exists in the SET
- SET has no expiry — jobs are never shown again once seen

**Job processor**

- `scrape-jobs` BullMQ processor picks up the task, runs all four scrapers in parallel
- Each new listing written to `JobListing` table with `status: PENDING`
- Each new listing enqueued as a `process-job` task with `{ jobListingId }` payload

**API**

- `GET /api/jobs` — returns paginated job listings with status filter query param
- `GET /api/jobs/:id` — returns single job listing

### Acceptance Criteria

- Running each scraper manually returns at least 10 listings per platform
- Zero duplicate job IDs in the database after running the cron twice
- `GET /api/jobs?status=PENDING` returns newly scraped listings
- BullMQ Board shows completed `scrape-jobs` tasks with no failures

## Sprint 3 — Intelligence Layer

**Goal:** Every pending job is scored, researched, and has a tailored resume version ready for review.

### Scope

**LiteLLM setup**

- LiteLLM proxy configured in `intelligence/llm-client.ts`
- Groq (Llama 3.3 70B) as primary, Gemini 2.0 Flash as fallback
- Both API keys stored in env, loaded via `config/env.ts`
- Token usage logged per call in development

**Prompt modules** — one file each in `intelligence/`

- `fit-score.ts` — system + user prompt, returns `{ score: number, reasoning: string }`
- `ats-score.ts` — returns `{ score: number, gapAnalysis: string[] }`
- `tailor-resume.ts` — Pass 1, returns modified `.tex` string
- `humanize-resume.ts` — Pass 2, takes Pass 1 output, returns final `.tex` string
- `company-research.ts` — takes SearXNG results, returns structured company brief

**SearXNG**

- SearXNG deployed as a Railway service, `research/searxng-client.ts` wraps HTTP calls
- Company research queries: `"{company}" culture reviews`, `"{company}" layoffs news`

**process-job processor**

- Picks up `{ jobListingId }` from queue
- Step 1: fit score — below threshold? Update status to `FILTERED`, stop
- Step 2: ATS score + gap analysis
- Step 3: tailor resume (Pass 1)
- Step 4: humanize resume (Pass 2)
- Step 5: company research
- Creates `Application` record with all scores and AI output
- Updates `JobListing` status to `REVIEW`

**API**

- `GET /api/jobs?status=REVIEW` — returns jobs ready for dashboard
- `GET /api/applications/:id` — returns full application detail with scores and reasoning

### Acceptance Criteria

- A job below the fit threshold never reaches `REVIEW` status
- Tailored `.tex` output is structurally valid LaTeX (no broken syntax)
- Company research brief contains all five required sections
- `Application` record created with non-null `atsScore`, `fitScore`, `aiReasoning`, `gapAnalysis`

## Sprint 4 — Resume Pipeline

**Goal:** Every tailored resume compiles to a clean PDF, accessible from the dashboard.

### Scope

**GitHub integration**

- GitHub Personal Access Token stored in env
- `resume/github-client.ts` wraps Octokit
- On each tailored resume: create branch `job-{jobListingId}`, push tailored `.tex` file
- Base resume `.tex` on `main` branch — never modified

**GitHub Actions workflow**

- `.github/workflows/compile-resume.yml` in the resume repo
- Triggers on push to any `job-*` branch
- Uses `tectonic-typesetting/setup-tectonic` action
- Compiles `.tex` → PDF, uploads as artifact
- On success: calls back to `POST /api/resumes/compiled` with `{ branchName, artifactUrl }`

**Resume model**

- `Resume` record created per tailored version with `texContent`, `pdfUrl`, `version`, `isBase: false`
- `Application` updated with `resumeId` FK pointing to the tailored version

**API**

- `POST /api/resumes/compiled` — webhook from GitHub Actions, updates `Resume.pdfUrl`
- `GET /api/resumes/:id` — returns resume record with PDF URL
- `PATCH /api/resumes/:id` — accepts edited `.tex` from dashboard, triggers recompile

### Acceptance Criteria

- Every approved tailored resume produces a valid, downloadable PDF
- PDF URL stored in `Resume` table within 90 seconds of `.tex` push
- Editing `.tex` via `PATCH` triggers a fresh compile and updates the PDF URL
- Base resume on `main` branch is never modified

## Sprint 5 — Dashboard (Angular)

**Goal:** A fully functional review dashboard where every job can be inspected and actioned.

### Scope

**Angular project setup**

- Angular 17+ project initialized with standalone components, strict TypeScript
- Tailwind CSS configured, design tokens added to `tailwind.config.js`
- Path aliases configured in `tsconfig.json`
- OpenAPI codegen configured — `npm run codegen` generates all API clients from backend Swagger spec
- Passport session auth — login page, `AuthGuard` on all protected routes

**Features**

- `DashboardComponent` — paginated grid of job cards filtered by status
- `JobCardComponent` — title, company, platform badge, ATS score badge (color via pipe), salary, time scraped, AI reasoning preview
- `JobReviewComponent` — full detail view: JD text, company brief, ATS score + gap analysis list, resume diff side-by-side, PDF preview iframe, three action buttons
- `ResumeDiffComponent` — side-by-side diff of base `.tex` vs tailored `.tex` with line-level highlights
- `ResumeEditorComponent` — inline `.tex` editor, recompile trigger, PDF preview refresh
- `ApplicationsComponent` — tracker table: job title, platform, status badge, applied date, result
- `SettingsComponent` — role config management: add/remove roles, set keywords, set ATS threshold per role

**All components:**

- `OnPush` change detection
- Signals for local state
- `AsyncPipe` for all observables — no manual subscriptions

### Acceptance Criteria

- Approve button calls `PATCH /api/applications/:id` with `{ decision: 'APPROVED' }` and updates card status
- Reject button archives the job and removes it from the review list
- Resume diff clearly shows changed lines
- PDF preview renders the compiled resume inline
- Settings page saves role config and reflects changes on next scrape cycle

## Sprint 6 — Apply Layer

**Goal:** Approved applications are submitted automatically. Every result is logged.

### Scope

**Apply queue**

- `apply-jobs` BullMQ queue defined
- When `Application.decision` is set to `APPROVED`, a new `apply-job` task is enqueued with `{ applicationId }`
- Queue processor in `jobs/apply-job.processor.ts`

**Playwright apply**

- `apply/playwright-apply.ts` — platform-specific apply logic per platform enum
- Stealth browser, randomized delays (500ms–2500ms) between every interaction
- Upload tailored PDF, fill name/email/phone from profile config
- Capture confirmation screenshot on success
- On success: update `Application.result = 'APPLIED'`, store screenshot URL
- On failure: update `Application.result = 'FAILED'`, log error, surface in dashboard

**Nodemailer email apply**

- `apply/email-apply.ts` — detects email-based listings from JD text patterns
- AI generates a short role-specific cover note (one paragraph)
- Nodemailer sends via configured SMTP with tailored PDF attached
- On send: update `Application.result = 'APPLIED'`

**API**

- `PATCH /api/applications/:id` — accepts `{ decision }` and `{ result }` updates
- `GET /api/applications?result=FAILED` — returns failed applications for dashboard retry view

**Dashboard updates**

- Failed applications section in `ApplicationsComponent`
- Manual retry button for failed applications

### Acceptance Criteria

- Approved job triggers Playwright apply within 60 seconds
- Confirmation screenshot stored and accessible from dashboard
- Failed applications appear in the failed section with error reason
- `Application.appliedAt` timestamp is accurate
- Email apply sends successfully with PDF attached and AI cover note in body

## Definition of Done (All Sprints)

A sprint is only done when all of the following are true:

- All acceptance criteria pass
- `tsc --noEmit` passes with zero errors
- ESLint passes with zero warnings
- All new functions in `intelligence/` and `services/` have unit tests
- All new API routes have integration tests
- Swagger spec updated to reflect any new or changed endpoints
- Frontend codegen re-run after any backend API change
- Changes deployed to Railway and verified in production
