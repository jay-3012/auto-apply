---
trigger: always_on
---

# AI Job Applier — GitHub Rules & Branch Strategy

> Every line of code in this repository goes through a defined branch, a pull request, and a passing CI pipeline before it touches `main`. No exceptions, no shortcuts, no direct pushes.

---

## Repository Structure

The project lives across two GitHub repositories:

```
github.com/you/ai-job-applier          → Main application repository
                                          (backend, frontend, scrapers, tests)

github.com/you/ai-job-applier-resume   → LaTeX resume repository
                                          (base .tex, job-specific branches, GitHub Actions)
```

Both repositories are private. The resume repository is kept separate because it is accessed by the GitHub Actions compile pipeline independently and should never be mixed with application code.

---

## Branch Strategy

### Permanent Branches

| Branch    | Purpose                                                            | Direct Push |
| --------- | ------------------------------------------------------------------ | ----------- |
| `main`    | Production-ready code. Deployed to Railway automatically on merge. | ❌ Never    |
| `develop` | Integration branch. All feature branches merge here first.         | ❌ Never    |

### Temporary Branches

All work happens on temporary branches. They are created from `develop`, merged via PR, and deleted after merge.

| Prefix      | When to Use                                    | Example                       |
| ----------- | ---------------------------------------------- | ----------------------------- |
| `feature/`  | New functionality                              | `feature/naukri-scraper`      |
| `fix/`      | Bug fixes                                      | `fix/ats-score-threshold`     |
| `chore/`    | Config, deps, tooling, docs                    | `chore/update-eslint-config`  |
| `refactor/` | Code restructuring, no behavior change         | `refactor/intelligence-layer` |
| `test/`     | Adding or fixing tests only                    | `test/sprint-3-cypress`       |
| `hotfix/`   | Critical production fix — branches from `main` | `hotfix/playwright-crash`     |

### Resume Repository Branches

| Branch               | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `main`               | Base `.tex` resume — never modified by automation      |
| `job-{jobListingId}` | One branch per tailored resume, created by the backend |

Resume branches are never merged back to `main`. They exist only to trigger the GitHub Actions compile pipeline and store the tailored version.

---

## Branch Naming Rules

- Always `kebab-case` — `feature/naukri-scraper`, never `feature/NaukriScraper` or `feature/naukri_scraper`
- Always use the correct prefix — no unprefixed branches except `main` and `develop`
- Include the ticket or sprint reference where relevant — `feature/sprint-2-naukri-scraper`
- Maximum 60 characters
- No special characters except `/` and `-`
- Branch names must describe what the branch does, not who is working on it — `feature/resume-diff-view`, never `feature/johns-work`

---

## Commit Message Rules

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type       | When                                      |
| ---------- | ----------------------------------------- |
| `feat`     | New feature                               |
| `fix`      | Bug fix                                   |
| `chore`    | Build, config, tooling, dependency update |
| `refactor` | Code change with no feature or fix        |
| `test`     | Adding or updating tests                  |
| `docs`     | Documentation only                        |
| `perf`     | Performance improvement                   |
| `ci`       | CI pipeline changes                       |

### Rules

- Subject line: imperative present tense, max 72 characters — `feat(scrapers): add Naukri stealth scraper`
- Never past tense — `Added Naukri scraper` is wrong, `Add Naukri scraper` is correct
- Scope is the layer or module — `scrapers`, `intelligence`, `dashboard`, `apply`, `db`, `queue`, `resume`, `api`
- Body explains _why_, not _what_ — the diff already shows what changed
- No period at the end of the subject line
- Reference sprint in footer where relevant — `Sprint: 2`

### Good Examples

```
feat(scrapers): add Wellfound JSON API scraper

Wellfound exposes job data via an internal JSON API visible
in the network tab. Using this instead of HTML scraping
gives us structured data without brittle CSS selectors.

Sprint: 2
```

```
fix(intelligence): correct fit score threshold comparison

Score was being compared with > instead of >= causing jobs
at exactly the threshold to be incorrectly filtered out.

Sprint: 3
```

```
chore(ci): add tsc and eslint checks to PR pipeline
```

### What Never Goes in a Commit

- Commented-out code
- `console.log` statements
- `.env` file or any file containing secrets
- `node_modules/`
- Generated files from `src/generated/api/` — these are in `.gitignore`

---

## Pull Request Rules

### Every PR Must Have

- A descriptive title following the same format as commit messages
- A filled-out PR description (template below)
- At least one reviewer assigned (use yourself on a solo project — self-review is still a review)
- All CI checks passing before merge
- No unresolved comments

### PR Title Format

Same as commit messages: `feat(dashboard): add resume diff component`

### PR Description Template

```markdown
## What

Brief description of what this PR does.

## Why

Why this change is needed. Link to the sprint goal or bug it addresses.

## Sprint

Sprint N — [layer name]

## Changes

- List of notable changes
- One line per significant change

## Testing

- What was tested
- Which Cypress specs cover this

## Screenshots (if UI change)

Before / After screenshots or a screen recording.

## Checklist

- [ ] tsc --noEmit passes
- [ ] ESLint passes with zero warnings
- [ ] New functions have unit tests
- [ ] New API routes have integration tests
- [ ] Swagger spec updated if API changed
- [ ] Frontend codegen re-run if API changed
- [ ] No .env or secrets committed
- [ ] data-cy attributes added to new interactive elements
```

### PR Size Rules

- Maximum 400 lines changed per PR — if it exceeds this, split it
- One concern per PR — a PR that adds a scraper should not also refactor the queue setup
- Draft PRs are allowed and encouraged for early feedback — prefix the title with `[WIP]`

### Merge Strategy

- All merges to `develop` use **Squash and Merge** — keeps history clean
- All merges from `develop` to `main` use **Merge Commit** — preserves the integration record
- `hotfix/` branches merge to both `main` and `develop` — always both, never just one
- Delete the source branch after merge — no stale branches

---

## CI Pipeline (GitHub Actions)

Every push to any branch and every PR triggers the CI pipeline.

### Pipeline File: `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main, develop]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint . --max-warnings=0
      - run: npm run test:unit
      - run: npm run test:integration

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint . --max-warnings=0
      - run: npx ng build --configuration=production
      - uses: cypress-io/github-action@v6
        with:
          working-directory: frontend
          start: npm run start:test
          wait-on: "http://localhost:4200"
```

### Rules

- A PR cannot be merged if any CI job fails — this is enforced via GitHub branch protection rules
- `tsc --noEmit` failure = merge blocked
- ESLint with any warning = merge blocked (`--max-warnings=0`)
- Any failing test = merge blocked
- CI must pass on the PR branch, not just locally

---

## Branch Protection Rules

Set these in GitHub → Repository Settings → Branches for both `main` and `develop`:

| Rule                                | Setting                                  |
| ----------------------------------- | ---------------------------------------- |
| Require pull request before merging | ✅ Enabled                               |
| Required approvals                  | 1 (self-review on solo project)          |
| Dismiss stale reviews on new push   | ✅ Enabled                               |
| Require status checks to pass       | ✅ Enabled                               |
| Required status checks              | `backend`, `frontend` (CI jobs)          |
| Require branches to be up to date   | ✅ Enabled                               |
| Restrict direct pushes              | ✅ Enabled — no one, including the owner |
| Allow force pushes                  | ❌ Disabled                              |
| Allow deletions                     | ❌ Disabled for `main` and `develop`     |

---

## Deploy Rules

### Automatic Deployment

- Merge to `main` → Railway automatically deploys the backend
- Merge to `main` → Vercel automatically deploys the Angular frontend
- Both deployments must succeed before the sprint is marked done

### Manual Deployment Gate

- Never merge `develop` → `main` mid-sprint
- `develop` → `main` merge happens only at the end of a sprint after all acceptance criteria pass and all Cypress tests are green
- Tag every `main` merge with a sprint version: `v1.0.0-sprint-1`, `v1.0.0-sprint-2`, etc.

### Tagging Convention

```
v{major}.{minor}.{patch}-sprint-{n}

v1.0.0-sprint-1   → Sprint 1 complete
v1.0.0-sprint-2   → Sprint 2 complete
v1.0.0-sprint-6   → MVP complete
v1.1.0-sprint-7   → Post-MVP iteration begins
```

---

## .gitignore Rules

Both repositories must include:

```
# Environment
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Build output
dist/
.angular/

# Generated API client — regenerate with npm run codegen
src/generated/api/

# Cypress artifacts
cypress/screenshots/
cypress/videos/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/
```

### Resume Repository `.gitignore`

```
# LaTeX build artifacts
*.aux
*.log
*.synctex.gz
*.fls
*.fdb_latexmk
*.out
*.toc

# Compiled PDFs — generated by GitHub Actions, not committed
*.pdf
```

PDFs in the resume repository are never committed — they are always generated by the GitHub Actions Tectonic pipeline and accessed via the artifact download URL.

---

## What Is Never Allowed

- Direct push to `main` or `develop` — ever, under any circumstance
- Force push to any branch that has an open PR
- Merging a PR with failing CI
- Merging a PR with unresolved review comments
- Committing `.env`, secrets, API keys, or tokens
- Committing `node_modules/` or `dist/`
- Committing generated API client files (`src/generated/api/`)
- Committing compiled PDFs to the resume repository
- Rewriting git history on `main` or `develop` with `git rebase --force` or `git push --force`
- Leaving stale branches open more than 7 days after their PR is merged

---

_The branch strategy and CI rules exist for one reason: so that `main` is always deployable, always green, and always trustworthy. Every rule here protects that guarantee._
