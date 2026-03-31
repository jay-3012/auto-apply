---
trigger: always_on
---

# AI Job Applier — Cypress Testing Strategy

> Cypress covers end-to-end and component testing for the Angular dashboard. A test script is written automatically at the end of every sprint covering everything delivered in that sprint. Tests are never written retroactively for old sprints — they ship with the sprint.

---

## Setup & Configuration

### Installation

```bash
npm install cypress @cypress/angular --save-dev
npm install cypress-real-events @testing-library/cypress --save-dev
```

### `cypress.config.ts`

```ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    env: {
      apiUrl: "http://localhost:3000/api",
    },
  },
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "src/**/*.cy.ts",
    supportFile: "cypress/support/component.ts",
  },
});
```

### Folder Structure

```
cypress/
├── e2e/
│   ├── sprint-1/          → auth, health, API stubs
│   ├── sprint-2/          → scraper trigger, job listing API
│   ├── sprint-3/          → intelligence pipeline, scoring
│   ├── sprint-4/          → resume compile, PDF availability
│   ├── sprint-5/          → dashboard UI, approve/reject flow
│   └── sprint-6/          → apply flow, status tracking
├── fixtures/
│   ├── job-listing.json
│   ├── application.json
│   └── resume.json
├── support/
│   ├── e2e.ts             → global hooks, custom commands
│   ├── component.ts       → component test support
│   └── commands.ts        → typed custom commands
└── tsconfig.json
```

### Custom Commands (`support/commands.ts`)

```ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      approveJob(jobId: string): Chainable<void>;
      rejectJob(jobId: string): Chainable<void>;
      interceptApi(
        method: string,
        path: string,
        fixture: string,
      ): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", () => {
  cy.request("POST", `${Cypress.env("apiUrl")}/auth/login`, {
    username: "test",
    password: "test",
  }).then(({ body }) => {
    window.localStorage.setItem("session", body.token);
  });
});

Cypress.Commands.add("interceptApi", (method, path, fixture) => {
  cy.intercept(method, `${Cypress.env("apiUrl")}${path}`, { fixture }).as(
    path.replace("/", ""),
  );
});
```

---

## Rules

- Every spec file is TypeScript — no `.js` Cypress files
- Tests use `data-cy` attributes for selectors — never CSS classes or element tags
- All API calls in E2E tests are intercepted with `cy.intercept()` — tests never hit a live backend
- Component tests use `cy.mount()` — no TestBed
- Each sprint's test folder is created and populated before the sprint is marked done
- `cypress run` must pass with zero failures before merging any PR

```html
<!-- Angular template — always add data-cy on interactive elements -->
<button data-cy="approve-btn" (click)="onApprove()">Approve</button>
<button data-cy="reject-btn" (click)="onReject()">Reject</button>
<div data-cy="ats-score">{{ job.atsScore }}</div>
```

---

## Sprint 1 Tests — Foundation

**File:** `cypress/e2e/sprint-1/foundation.cy.ts`

```ts
describe("Sprint 1 — Foundation", () => {
  it("health check returns 200", () => {
    cy.request(`${Cypress.env("apiUrl").replace("/api", "")}/health`)
      .its("status")
      .should("eq", 200);
  });

  it("unauthenticated request to /api/jobs returns 401", () => {
    cy.request({
      url: `${Cypress.env("apiUrl")}/jobs`,
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 401);
  });

  it("login with valid credentials returns session", () => {
    cy.request("POST", `${Cypress.env("apiUrl")}/auth/login`, {
      username: "test",
      password: "test",
    })
      .its("status")
      .should("eq", 200);
  });

  it("swagger UI is accessible at /api/docs", () => {
    cy.request(`${Cypress.env("apiUrl").replace("/api", "")}/api/docs`)
      .its("status")
      .should("eq", 200);
  });

  it("login page renders and submits", () => {
    cy.visit("/login");
    cy.get('[data-cy="username-input"]').type("test");
    cy.get('[data-cy="password-input"]').type("test");
    cy.get('[data-cy="login-btn"]').click();
    cy.url().should("include", "/dashboard");
  });
});
```

---

## Sprint 2 Tests — Scrapers

**File:** `cypress/e2e/sprint-2/scrapers.cy.ts`

```ts
describe("Sprint 2 — Scrapers", () => {
  beforeEach(() => {
    cy.login();
  });

  it("GET /api/jobs returns paginated results", () => {
    cy.interceptApi(
      "GET",
      "/jobs?status=PENDING&page=1&limit=20",
      "job-listing.json",
    );
    cy.request(`${Cypress.env("apiUrl")}/jobs?status=PENDING`)
      .its("body.data")
      .should("be.an", "array");
  });

  it("GET /api/jobs/:id returns single job with jdText", () => {
    cy.request(`${Cypress.env("apiUrl")}/jobs/test-job-id`)
      .its("body.data")
      .should("have.property", "jdText");
  });

  it("no duplicate job IDs exist in the database", () => {
    cy.request(`${Cypress.env("apiUrl")}/jobs?limit=100`)
      .its("body.data")
      .then((jobs: { id: string }[]) => {
        const ids = jobs.map((j) => j.id);
        expect(new Set(ids).size).to.eq(ids.length);
      });
  });

  it("jobs have required fields: title, company, platform, url", () => {
    cy.request(`${Cypress.env("apiUrl")}/jobs?limit=5`)
      .its("body.data")
      .each((job: Record<string, unknown>) => {
        expect(job).to.have.all.keys("title", "company", "platform", "url");
      });
  });
});
```

---

## Sprint 3 Tests — Intelligence

**File:** `cypress/e2e/sprint-3/intelligence.cy.ts`

```ts
describe("Sprint 3 — Intelligence", () => {
  beforeEach(() => {
    cy.login();
  });

  it("FILTERED jobs do not appear in REVIEW status", () => {
    cy.request(`${Cypress.env("apiUrl")}/jobs?status=REVIEW`)
      .its("body.data")
      .each((job: { fitScore: number }) => {
        expect(job.fitScore).to.be.gte(65);
      });
  });

  it("application record has atsScore, fitScore, aiReasoning, gapAnalysis", () => {
    cy.request(`${Cypress.env("apiUrl")}/applications/test-app-id`)
      .its("body.data")
      .should(
        "have.all.keys",
        "atsScore",
        "fitScore",
        "aiReasoning",
        "gapAnalysis",
      );
  });

  it("gapAnalysis is a non-empty array", () => {
    cy.request(`${Cypress.env("apiUrl")}/applications/test-app-id`)
      .its("body.data.gapAnalysis")
      .should("be.an", "array")
      .and("have.length.gte", 1);
  });

  it("company research has required sections", () => {
    cy.request(`${Cypress.env("apiUrl")}/companies/test-company`)
      .its("body.data.researchSummary")
      .should("be.a", "string")
      .and("have.length.gte", 100);
  });
});
```

---

## Sprint 4 Tests — Resume Pipeline

**File:** `cypress/e2e/sprint-4/resume-pipeline.cy.ts`

```ts
describe("Sprint 4 — Resume Pipeline", () => {
  beforeEach(() => {
    cy.login();
  });

  it("application has a resumeId after processing", () => {
    cy.request(`${Cypress.env("apiUrl")}/applications/test-app-id`)
      .its("body.data.resumeId")
      .should("not.be.null");
  });

  it("resume record has a valid pdfUrl", () => {
    cy.request(`${Cypress.env("apiUrl")}/resumes/test-resume-id`)
      .its("body.data.pdfUrl")
      .should("match", /^https:\/\//);
  });

  it("PATCH /api/resumes/:id with new tex triggers recompile", () => {
    cy.request({
      method: "PATCH",
      url: `${Cypress.env("apiUrl")}/resumes/test-resume-id`,
      body: {
        texContent:
          "\\documentclass{article}\\begin{document}Test\\end{document}",
      },
    })
      .its("status")
      .should("eq", 200);
  });

  it("base resume on main branch is never isBase: false", () => {
    cy.request(`${Cypress.env("apiUrl")}/resumes?isBase=true`)
      .its("body.data[0].isBase")
      .should("eq", true);
  });
});
```

---

## Sprint 5 Tests — Dashboard

**File:** `cypress/e2e/sprint-5/dashboard.cy.ts`

```ts
describe("Sprint 5 — Dashboard", () => {
  beforeEach(() => {
    cy.login();
    cy.interceptApi("GET", "/jobs?status=REVIEW", "job-listing.json");
    cy.visit("/dashboard");
  });

  it("dashboard renders job cards", () => {
    cy.get('[data-cy="job-card"]').should("have.length.gte", 1);
  });

  it("job card shows title, company, ATS score badge", () => {
    cy.get('[data-cy="job-card"]')
      .first()
      .within(() => {
        cy.get('[data-cy="job-title"]').should("not.be.empty");
        cy.get('[data-cy="company-name"]').should("not.be.empty");
        cy.get('[data-cy="ats-score"]').should("exist");
      });
  });

  it("approve button calls PATCH with decision APPROVED", () => {
    cy.intercept("PATCH", "**/applications/**", { statusCode: 200 }).as(
      "approve",
    );
    cy.get('[data-cy="job-card"]').first().click();
    cy.get('[data-cy="approve-btn"]').click();
    cy.wait("@approve").its("request.body.decision").should("eq", "APPROVED");
  });

  it("reject button removes job from review list", () => {
    cy.intercept("PATCH", "**/applications/**", { statusCode: 200 }).as(
      "reject",
    );
    cy.get('[data-cy="job-card"]')
      .its("length")
      .then((count: number) => {
        cy.get('[data-cy="job-card"]').first().click();
        cy.get('[data-cy="reject-btn"]').click();
        cy.wait("@reject");
        cy.get('[data-cy="job-card"]').should("have.length", count - 1);
      });
  });

  it("resume diff view renders two panes", () => {
    cy.get('[data-cy="job-card"]').first().click();
    cy.get('[data-cy="resume-diff"]').within(() => {
      cy.get('[data-cy="original-pane"]').should("exist");
      cy.get('[data-cy="tailored-pane"]').should("exist");
    });
  });

  it("settings page saves role config", () => {
    cy.visit("/settings");
    cy.get('[data-cy="add-role-input"]').type("Backend Engineer");
    cy.get('[data-cy="add-role-btn"]').click();
    cy.get('[data-cy="role-list"]').should("contain", "Backend Engineer");
  });
});
```

---

## Sprint 6 Tests — Apply Layer

**File:** `cypress/e2e/sprint-6/apply.cy.ts`

```ts
describe("Sprint 6 — Apply Layer", () => {
  beforeEach(() => {
    cy.login();
  });

  it("approved application status updates to APPLIED", () => {
    cy.request("PATCH", `${Cypress.env("apiUrl")}/applications/test-app-id`, {
      decision: "APPROVED",
    });
    cy.wait(65000);
    cy.request(`${Cypress.env("apiUrl")}/applications/test-app-id`)
      .its("body.data.result")
      .should("eq", "APPLIED");
  });

  it("failed application appears in failed list", () => {
    cy.request(`${Cypress.env("apiUrl")}/applications?result=FAILED`)
      .its("body.data")
      .should("be.an", "array");
  });

  it("applied application has appliedAt timestamp", () => {
    cy.request(`${Cypress.env("apiUrl")}/applications/test-app-id`)
      .its("body.data.appliedAt")
      .should("not.be.null");
  });

  it("dashboard applications tab shows correct status badges", () => {
    cy.interceptApi("GET", "/applications", "application.json");
    cy.visit("/applications");
    cy.get('[data-cy="status-badge"]').should("exist");
    cy.get('[data-cy="retry-btn"]').should("exist");
  });
});
```

---

## CI Integration

```yaml
# .github/workflows/cypress.yml
name: Cypress Tests
on: [push, pull_request]
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - uses: cypress-io/github-action@v6
        with:
          start: npm run start:test
          wait-on: "http://localhost:4200"
```

- `cypress run` must pass with zero failures before any PR merges to `main`
- Failure screenshots uploaded as CI artifacts automatically
- Run current + previous sprint specs in CI — full suite runs weekly

---

_Tests are not an afterthought. They are the proof that the sprint is done._
