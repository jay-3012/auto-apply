---
trigger: always_on
---

# AI Job Applier — Architecture & Project Flow

> A breakdown of the system architecture, data flow, service responsibilities, and component interactions that power the AI Job Applier platform.

---

## System Overview

AI Job Applier is composed of six distinct layers, each with a clearly defined responsibility. They communicate through a shared PostgreSQL database and a Redis-backed BullMQ queue. Any individual layer can be updated or replaced without affecting the others.

```
CRON LAYER         →   BullMQ Scheduler (every 1 hour)
SCRAPER LAYER      →   Playwright stealth across 4 platforms + Redis dedup
INTELLIGENCE LAYER →   Fit score → ATS score → Tailor → Humanize → Research
RESUME LAYER       →   .tex edit → GitHub push → Tectonic compile → PDF
DASHBOARD LAYER    →   Angular UI — review every job before anything is sent
APPLY LAYER        →   Playwright Easy Apply + Nodemailer email apply
```

---

## Layer 1 — Cron Layer

BullMQ registers a repeatable `scrape-jobs` task on server startup that fires every 60 minutes. Redis persists queue state across server restarts. If a scraping cycle fails midway, BullMQ retries with exponential backoff without duplicating work. The interval is configurable via environment variables.

BullMQ is used over node-cron because it provides persistence, retry logic, concurrency control, and a visible job history — all essential for a long-running background process hosted on Railway.

---

## Layer 2 — Scraper Layer

Each platform has a dedicated scraper module built with Playwright and the `playwright-extra` stealth plugin. The stealth plugin patches browser fingerprints — randomizing user agent strings, WebGL fingerprints, canvas fingerprints, and action timing to avoid bot detection.

**Scraping flow per platform:**

```
Launch stealth browser
  → Navigate to job search URL filtered by role + location
  → Wait for JS-rendered listings
  → Extract: title, company, location, salary, JD text, apply URL
  → For each listing:
       Check Redis SET — seen before? Skip.
       New? Add to Redis SET + write to JobListing table (status: PENDING)
       Push as process-job task to BullMQ queue
```

Before scraping, the scraper reads active `RoleConfig` records from the database — roles you confirmed during onboarding. It builds platform-specific search queries from role names and their keywords. Only matching listings enter the pipeline.

| Platform    | Approach                       | Complexity  |
| ----------- | ------------------------------ | ----------- |
| Wellfound   | JSON API from network tab      | Low         |
| Internshala | HTML scrape                    | Low         |
| Indeed      | JS-rendered + pagination       | Medium      |
| Naukri      | JS-rendered + session handling | Medium-High |

---

## Layer 3 — Intelligence Layer

The AI brain. Each `process-job` task runs through five sequential steps, all routed through LiteLLM which proxies between Groq (Llama 3.3 70B, primary) and Gemini 2.0 Flash (fallback). LiteLLM handles rate limit detection, failover, and token tracking transparently.

**Step 1 — Role Fit Score**
AI receives your base resume + full JD. Returns a fit score (0–100) and a reasoning paragraph. Score below your configured threshold (e.g. 65)? Job is marked `FILTERED` and never reaches your dashboard.

**Step 2 — ATS Compatibility Score**
Deeper keyword-level analysis. AI identifies which required skills are covered, missing, or partially covered. Returns a structured ATS score and a gap analysis — a plain-English list of what to add or emphasize. This directly informs the next step.

**Step 3 — Resume Tailoring (Pass 1 — Substance)**
AI rewrites your `.tex` resume content using the gap analysis: reorders bullet points for relevance, incorporates missing keywords naturally, adjusts your professional summary for this specific role, and surfaces relevant projects. The AI works only with what is already in your resume — no fabrication.

**Step 4 — Humanization (Pass 2 — Voice)**
Second AI pass focused purely on natural language. Detects and rewrites AI-sounding patterns — overly formal phrasing, repetitive structure, buzzword density. Uses your original writing style as a reference. Output reads as if you personally tailored it.

**Step 5 — Company Research**
SearXNG (self-hosted open-source search engine) is queried for the company name alongside terms like "culture", "layoffs", and "reviews". Raw results are passed to the AI, which produces a structured brief: company size and stage, what they do, culture signals, red flags, and an overall recommendation.

---

## Layer 4 — Resume Pipeline Layer

Your resume lives as a `.tex` file in a GitHub repository you own. The base file on `main` is never modified.

```
AI produces tailored .tex content
  → GitHub API creates a new branch named job-{id}
  → Tailored .tex is pushed to that branch
  → GitHub Actions workflow triggers
  → Tectonic compiler builds the PDF
  → PDF uploaded as Actions artifact
  → Download URL written to Application record in DB
  → Dashboard renders the PDF alongside the job card
```

Tectonic is used because it is self-contained, automatically downloads only required LaTeX packages, and runs in seconds inside GitHub Actions with no manual package management. Each job gets its own branch — making it trivial to audit exactly what changed per application.

---

## Layer 5 — Dashboard Layer

Built with Angular and Tailwind CSS. Communicates with the Express backend via REST API. Auth handled by Passport.js with a local strategy — single-user self-hosted tool, no OAuth needed.

**Per job card you see:**

- Role title, company, platform badge, location, salary, time scraped
- AI fit reasoning — one paragraph explaining why you match
- ATS score with colour indicator (green / amber / red) + gap analysis bullets
- Company research brief — five-point summary
- Resume diff view — side-by-side base vs tailored with changes highlighted
- Tailored PDF preview rendered inline

**Your three actions:**

| Action  | What Happens                                                                                 |
| ------- | -------------------------------------------------------------------------------------------- |
| Approve | Job moves to application queue. Playwright submits on next apply cycle.                      |
| Edit    | Opens inline resume editor. Tweak the .tex, trigger recompile, review new PDF, then approve. |
| Reject  | Archived permanently. Job ID added to Redis dedup set. Never reprocessed.                    |

Every single job — regardless of how routine the Easy Apply is — requires your explicit approval before anything is submitted. No exceptions.

---

## Layer 6 — Apply Layer

**Easy Apply flow (Playwright stealth):**

```
Pick approved job from queue
  → Launch stealth browser
  → Navigate to listing URL
  → Detect apply button (platform-specific selector)
  → Fill form: upload tailored PDF, name, email, phone
  → Answer standard screening questions where detectable
  → Submit
  → Capture confirmation screenshot
  → Update Application: status → APPLIED, timestamp, screenshot URL
```

Human-like behavior throughout: randomized delays (500ms–2500ms), natural pointer movement, randomized scroll behavior before form interactions.

**Email Apply flow (Nodemailer):**
For listings specifying email application, Nodemailer composes a role-specific introduction email with the tailored PDF attached and sends via your configured SMTP credentials.

**Failure handling:** Failed applications are logged with error details and surfaced in a separate dashboard section for manual review and retry decision.

---

## Database Schema (Sequelize + PostgreSQL)

### Resume

| Column     | Type    | Description                         |
| ---------- | ------- | ----------------------------------- |
| id         | UUID    | Primary key                         |
| version    | String  | Version label                       |
| texContent | Text    | Full LaTeX source                   |
| pdfUrl     | String  | Compiled PDF download URL           |
| isBase     | Boolean | True for original unmodified resume |

### JobListing

| Column   | Type   | Description                                       |
| -------- | ------ | ------------------------------------------------- |
| id       | UUID   | Primary key                                       |
| title    | String | Role title                                        |
| company  | String | Company name                                      |
| platform | Enum   | naukri / indeed / wellfound / internshala         |
| url      | String | Direct listing URL                                |
| jdText   | Text   | Full job description                              |
| salary   | String | Salary range if available                         |
| status   | Enum   | PENDING / FILTERED / REVIEW / APPROVED / REJECTED |

### Application

| Column        | Type      | Description                    |
| ------------- | --------- | ------------------------------ |
| id            | UUID      | Primary key                    |
| jobId         | UUID      | FK → JobListing                |
| resumeId      | UUID      | FK → Resume (tailored version) |
| atsScore      | Integer   | ATS score 0–100                |
| fitScore      | Integer   | Role fit score 0–100           |
| aiReasoning   | Text      | AI fit explanation             |
| gapAnalysis   | JSON      | Missing keywords list          |
| decision      | Enum      | PENDING / APPROVED / REJECTED  |
| result        | Enum      | APPLIED / FAILED / NULL        |
| appliedAt     | Timestamp | Submission timestamp           |
| screenshotUrl | String    | Confirmation screenshot        |

### CompanyInfo

| Column          | Type   | Description                |
| --------------- | ------ | -------------------------- |
| id              | UUID   | Primary key                |
| companyName     | String | Normalized name            |
| researchSummary | Text   | AI-generated brief         |
| glassdoorRating | Float  | Rating from search results |
| redFlags        | JSON   | Array of red flag strings  |

### RoleConfig

| Column          | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| id              | UUID    | Primary key                      |
| roleName        | String  | e.g. "Backend Engineer"          |
| keywords        | JSON    | Search keywords for this role    |
| minAtsThreshold | Integer | Minimum ATS score to proceed     |
| isActive        | Boolean | Whether role is actively tracked |

---

## Infrastructure Layout

```
Railway Project
├── Web Service       → Express API + BullMQ workers
├── PostgreSQL Plugin → Primary database
└── Redis Plugin      → Queue backend + deduplication store

GitHub (your account)
├── main branch       → Base .tex resume (never modified)
├── job-{id} branches → One tailored .tex per application
└── .github/workflows → Tectonic compile + PDF artifact action

SearXNG Instance      → Self-hosted on Railway (company research)
Angular Frontend      → Deployed on Vercel or Railway static site
```

---

## End-to-End Request Trace

```
01. BullMQ cron fires → adds scrape-jobs task
02. Scraper worker picks up task
03. Playwright scrapes all 4 platforms
04. Each listing deduplicated via Redis
05. New listings saved to DB (status: PENDING)
06. Each listing added as process-job task
07. Intelligence worker picks up process-job
08. Fit score computed → below threshold? Mark FILTERED, stop
09. ATS score + gap analysis computed
10. Resume tailored — Pass 1 (substance)
11. Resume humanized — Pass 2 (voice)
12. Tailored .tex pushed to GitHub branch job-{id}
13. GitHub Actions compiles PDF → URL stored in DB
14. Company research via SearXNG → AI summary stored
15. JobListing status updated to REVIEW
16. Job appears in Angular dashboard
17. You review: card + company brief + ATS score + resume diff
18. You click Approve
19. Application record created (status: APPROVED)
20. Apply worker picks up approved application
21. Playwright submits Easy Apply with tailored PDF
22. Confirmation screenshot captured
23. Application status updated to APPLIED
24. Dashboard reflects final status
```

---

_Every layer is independently testable and deployable. New platforms, AI providers, and application methods can be added without restructuring what already works._
