---
trigger: always_on
---

# AI Job Applier — Frontend Code Rules & Standards (Angular + TypeScript)

> Rules for the Angular dashboard. Covers project structure, TypeScript standards, styling conventions, API client generation via OpenAPI/Swagger codegen, and component patterns. Every rule here is non-negotiable.

---

## General Principles

- **Angular strict mode is always on.** No implicit any, strict templates, strict dependency injection.
- **Generated API clients are never edited manually.** The OpenAPI codegen output is treated as a build artifact — regenerate, never patch.
- **Components are dumb by default.** Business logic lives in services, not components. Components render and emit events.
- **One component per file.** No barrel exports that hide what a module actually contains.
- **Tailwind utility classes only.** No custom CSS files unless absolutely unavoidable. No inline `style` attributes.

---

## Project Structure

```
/frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/              → AuthGuard, AuthService, auth interceptor
│   │   │   ├── interceptors/      → HTTP interceptors (auth token, error handler)
│   │   │   └── services/          → App-wide singleton services
│   │   ├── shared/
│   │   │   ├── components/        → Reusable dumb components (button, badge, card)
│   │   │   ├── directives/        → Custom Angular directives
│   │   │   ├── pipes/             → Custom Angular pipes
│   │   │   └── types/             → Shared TypeScript interfaces and enums
│   │   ├── features/
│   │   │   ├── dashboard/         → Job listing cards, filters, stats summary
│   │   │   ├── job-review/        → Single job detail, resume diff, approve/reject
│   │   │   ├── resume/            → Resume editor, version history, PDF preview
│   │   │   ├── applications/      → Application tracker, status history
│   │   │   └── settings/          → Role config, thresholds, profile setup
│   │   └── app.routes.ts          → Lazy-loaded route definitions
│   ├── generated/
│   │   └── api/                   → OpenAPI codegen output — never edit manually
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── assets/
│   └── styles.css                 → Tailwind directives only (@tailwind base/components/utilities)
├── openapi.json                   → Copied from backend Swagger output
├── openapitools.json              → OpenAPI Generator config
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
└── angular.json
```

---

## TypeScript Configuration

**`tsconfig.json` — required settings:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictTemplates": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@generated/*": ["src/generated/*"],
      "@env/*": ["src/environments/*"]
    }
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

- `strictTemplates: true` catches template binding errors at compile time — never disable it
- Path aliases are mandatory — no relative `../../../` imports anywhere in the codebase

---

## OpenAPI Codegen Setup

The backend exposes a Swagger spec at `/api/docs/json`. The frontend consumes this spec to auto-generate all API models and service clients.

**`openapitools.json`:**

```json
{
  "$schema": "node_modules/@openapitools/openapi-generator-cli/config.schema.json",
  "spaces": 2,
  "generator-cli": { "version": "7.4.0" },
  "generator": "typescript-angular",
  "input-spec": "./openapi.json",
  "output": "./src/generated/api",
  "additional-properties": {
    "ngVersion": "17",
    "providedIn": "root",
    "supportsES6": true,
    "withInterfaces": true,
    "useSingleRequestParameter": true,
    "enumPropertyNaming": "UPPERCASE"
  }
}
```

**`package.json` scripts:**

```json
{
  "scripts": {
    "codegen": "openapi-generator-cli generate",
    "codegen:fetch": "curl http://localhost:3000/api/docs/json -o openapi.json && npm run codegen"
  }
}
```

### Rules for Codegen

- Run `npm run codegen` every time the backend API changes — never manually update generated files
- Generated files live in `src/generated/api/` — this entire directory is gitignored except `openapi.json`
- Import generated models and services via the `@generated/*` path alias
- Never extend or wrap generated interfaces — if you need extra fields, compose them

```ts
// Wrong — extending generated interface
interface IJobListingExtended extends JobListing {
  isExpanded: boolean;
}

// Correct — compose with a local interface
interface JobListingViewModel {
  data: JobListing; // generated type
  isExpanded: boolean; // local UI state
}
```

---

## Naming Conventions

### Files

- Components: `kebab-case` with type suffix — `job-card.component.ts`, `resume-diff.component.ts`
- Services: `kebab-case` with `.service` — `job-review.service.ts`
- Guards: `kebab-case` with `.guard` — `auth.guard.ts`
- Pipes: `kebab-case` with `.pipe` — `ats-score-color.pipe.ts`
- Directives: `kebab-case` with `.directive` — `delay-render.directive.ts`
- Type files: `kebab-case` with `.types` — `job.types.ts`

### Classes and Selectors

- Components: `PascalCase` class, `app-` prefixed selector

```ts
@Component({ selector: 'app-job-card', ... })
export class JobCardComponent { }
```

- Feature components use feature-scoped prefix: `app-dashboard-`, `app-review-`

### Variables

- Component inputs: `camelCase` noun — `jobListing`, `atsScore`, `isLoading`
- Component outputs: `camelCase` past-tense verb — `approved`, `rejected`, `resumeEdited`
- Observables: suffix with `$` — `jobs$`, `loading$`, `error$`
- Signals: no suffix — `jobs`, `loading`, `selectedJob`

---

## Component Rules

### Structure — always in this order inside every component class:

```ts
@Component({ ... })
export class JobCardComponent {
  // 1. Inputs
  @Input({ required: true }) job!: JobListing;
  @Input() isSelected = false;

  // 2. Outputs
  @Output() approved = new EventEmitter<string>();
  @Output() rejected = new EventEmitter<string>();

  // 3. Injected services
  private readonly jobReviewService = inject(JobReviewService);

  // 4. Signals / state
  isExpanded = signal(false);

  // 5. Computed
  atsBadgeColor = computed(() =>
    this.job.atsScore >= 75 ? 'green' : this.job.atsScore >= 55 ? 'amber' : 'red'
  );

  // 6. Lifecycle hooks
  ngOnInit(): void { }

  // 7. Public methods (called from template)
  onApprove(): void {
    this.approved.emit(this.job.id);
  }

  // 8. Private methods
  private formatSalary(salary: string | null): string {
    return salary ?? 'Not specified';
  }
}
```

- Use `inject()` for dependency injection — never constructor injection
- Use Angular signals (`signal()`, `computed()`, `effect()`) for local component state — not `BehaviorSubject`
- Use `OnPush` change detection on every component — no exceptions

```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
```

- All `@Input()` that are required use `{ required: true }` — no `!` assertions without it
- Maximum template lines per component: **80**. If it exceeds this, split into sub-components.

---

## Service Rules

- Services contain all API calls, data transformation, and business logic
- Components never call generated API services directly — always go through a feature service

```ts
// Wrong — component calling generated service directly
export class DashboardComponent {
  private readonly api = inject(JobsService); // generated service
}

// Correct — component calls feature service
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
}

// Feature service wraps the generated client
@Injectable({ providedIn: "root" })
export class DashboardService {
  private readonly api = inject(JobsService); // generated service

  getReviewJobs(): Observable<JobListing[]> {
    return this.api.getJobs({ status: "REVIEW" });
  }
}
```

- All service methods return `Observable<T>` — never subscribe inside a service
- Error handling in services uses `catchError` from RxJS — never try/catch in services

---

## Routing Rules

- All feature modules are lazy-loaded via `loadComponent`
- Route paths are `kebab-case` — `/job-review/:id`, `/role-settings`
- Every protected route uses `canActivate: [AuthGuard]` — never inline auth checks

---

## Tailwind Styling Rules

### Core Rules

- Tailwind utility classes only — no separate `.css` files per component
- `styles.css` contains only `@tailwind base`, `@tailwind components`, `@tailwind utilities`
- No inline `style` attributes — if Tailwind cannot express it, add it to `tailwind.config.js`
- No `!important` — ever

### Class Ordering Convention

Always in this order: layout → sizing → spacing → typography → color → border → effects

```html
<!-- layout → size → spacing → text → color → border → effects -->
<div
  class="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
></div>
```

### Design Tokens — defined in `tailwind.config.js`

```js
theme: {
  extend: {
    colors: {
      brand: { 500: '#6366f1', 600: '#4f46e5' },
      success: { 100: '#dcfce7', 700: '#15803d' },
      warning: { 100: '#fef9c3', 700: '#a16207' },
      danger:  { 100: '#fee2e2', 700: '#b91c1c' },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
  },
}
```

### ATS Score Colors — always use the pipe, never hardcode in templates

```ts
// shared/pipes/ats-score-color.pipe.ts
@Pipe({ name: "atsColor", standalone: true })
export class AtsScoreColorPipe implements PipeTransform {
  transform(score: number): string {
    if (score >= 75) return "bg-success-100 text-success-700";
    if (score >= 55) return "bg-warning-100 text-warning-700";
    return "bg-danger-100 text-danger-700";
  }
}
```

---

## State Management Rules

- Use Angular signals for local and shared UI state — no NgRx for this project's scope
- Global state (current user, role config, counts) lives in `core/services/`
- Async data is always `Observable<T>` resolved with `AsyncPipe` — never subscribe in components

```html
<!-- Correct — AsyncPipe in template -->
@if (jobs$ | async; as jobs) { @for (job of jobs; track job.id) {
<app-job-card [job]="job" />
} }
```

---

## What Is Never Allowed

- `any` type — including in generated code usage; cast to the correct generated type
- `// @ts-ignore` or `// @ts-expect-error` without an explanation comment
- Direct mutation of `@Input()` values inside a component — emit an output instead
- Subscribing inside a component without using `AsyncPipe` or `takeUntilDestroyed()`
- Editing files inside `src/generated/api/` manually
- Custom CSS classes that duplicate what Tailwind already provides
- `ChangeDetectionStrategy.Default` on any component
- Calling generated API services directly from a component

---

_The Angular frontend is the only thing the user ever sees. It should be fast, type-safe, and impossible to misuse._
