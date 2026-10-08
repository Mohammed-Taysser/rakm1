# Project Deep-Dives

> The "tell me about a project you're proud of" question is almost guaranteed in every interview — often more than once (one screening, one technical, one with the hiring manager). Interviewers use it to see how you think, not just what you built. This file gives you a reusable way to present any project plus deep, project-specific talking points, technical challenges, and likely follow-up questions for each of your real flagship projects. **Pick the project that best showcases the skill the role cares about** (use the skills map near the end), tell a tight story, then let them pull you deeper with follow-ups. Don't memorize answers word-for-word — internalize the decisions and trade-offs so you can speak to them naturally and survive a "why?" three levels deep.

This file is organized as:

1. a reusable structure for presenting any project
2. one detailed section per flagship project (Foody, Pharmacy FEFO, Hirely, CineBite, Trust-Node, Nova ERP, Dynamic SaaS, Rosine) plus an "Other notable projects" roundup
3. a skills-to-projects map
4. common mistakes to avoid

---

## How to Present a Project (reusable structure)

Use this 7-beat structure. The whole spoken pitch should be **60-90 seconds** — then stop and let them ask. Going longer is the #1 mistake.

1. **One-line pitch.** What it is, for whom, in one breath. "Foody is a restaurant management platform — order intake, kitchen displays, and inventory — built as a production-grade Express/TypeScript backend."
2. **Problem / context.** Why it exists, what was hard, why naive solutions fail. Anchor the listener in a real constraint (multi-tenant data isolation, expiry-driven dispensing, PDF generation at scale).
3. **Your role.** Be explicit and honest: solo side project, lead, or part of a team. "I built this end-to-end" vs "I owned the auth and real-time modules on a team of four." Don't claim the whole thing if it was a team effort.
4. **Architecture summary.** 3-4 sentences. The shape (layered/DDD, monorepo, modules), the data store, the async story (queues), the boundaries. Draw it if you have a whiteboard.
5. **Key technical challenges & how you solved them.** This is the meat. Pick 2-3 _concrete_ problems and walk through the decision: what you tried, what the trade-off was, what you chose and why. This is where you prove seniority.
6. **Results / impact.** Even for side projects: test coverage, p95 latency, throughput, "handles N tenants with zero data leakage," "cut PDF generation from synchronous 8s to a queued job." If you have no production metrics, talk about correctness guarantees and what you load-tested.
7. **What you'd do differently.** Always have one honest answer. It signals reflection and seniority. "I'd extract the shared types into a published package earlier" or "I over-applied CQRS in CineBite — great for learning, overkill for the domain size."

> **Golden rule:** every architectural choice in your story must survive the question "why not the simpler alternative?" If you can't justify Redis, BullMQ, DDD, or CQRS for a given project, don't lead with it.

---

## Foody — Restaurant Management Platform

> **Real scenarios (git-verified):** [33-real-world-scenarios.md](33-real-world-scenarios.md) → **Foody section** (export, money; + winston logging, order state machine, deep-diff audit, RBAC permission-groups). Full commit log: `git-history/side-projects__foody.md`.

### One-line pitch

A production-grade restaurant management backend (orders, kitchen displays, inventory) built on Express + TypeScript with a layered/DDD architecture, real-time kitchen displays over Socket.IO, and a full ops story (Docker, CI, Sentry, Swagger).

### The problem / context

Restaurants need orders to flow from intake to the kitchen in real time, inventory to stay consistent under concurrent orders, and the system to be observable when something breaks mid-service. The interesting constraints are real-time fan-out to kitchen display screens, transactional integrity on stock, and keeping business rules clean as the domain grows.

### Tech stack

Express + TypeScript, PostgreSQL + Prisma, Redis + BullMQ, JWT (access + refresh) with Passport, Zod validation, Swagger/OpenAPI, Jest + Supertest, Winston logging + Sentry, Socket.IO. Docker Compose + GitHub Actions CI.

### Architecture summary

Four layers: **presentation** (Express routes/controllers, Zod request validation, Swagger), **application** (use cases / services orchestrating the flow), **domain** (entities, value objects, domain events, business rules — framework-agnostic), and **infrastructure** (Prisma repositories, Redis, BullMQ, Socket.IO adapters). Dependencies point inward; the domain knows nothing about Express or Prisma. Domain events (e.g. OrderPlaced) decouple side effects like notifying kitchen displays from the core transaction. Repository pattern abstracts Prisma behind interfaces.

### What to emphasize / strongest talking points

- Clean layered/DDD boundaries with the **dependency rule** strictly enforced — domain is pure.
- **Domain events** decoupling side effects from core writes (this is the most senior-sounding bit).
- Real **production hygiene**: structured Winston logging, Sentry error tracking, OpenAPI docs, CI pipeline, containerized.
- Dual-token JWT (access + refresh) auth done properly with Passport strategies.
- Real-time kitchen displays — a tangible, demonstrable feature.

### Key technical challenges & solutions

1. **Keeping business rules out of controllers/ORM.** Solution: domain layer with entities and value objects; repositories return domain objects, not Prisma rows. Lets me unit-test rules without a DB.
2. **Real-time kitchen displays.** Socket.IO rooms per kitchen/station; an OrderPlaced domain event triggers an emit to the relevant room. The emit lives in infrastructure, subscribed to the domain event — so the use case doesn't know about sockets.
3. **Concurrent inventory consistency.** Stock decrements wrapped in Prisma transactions; conditional updates (decrement only if sufficient stock) to avoid oversell under concurrency.
4. **Async/background work.** BullMQ + Redis for jobs that shouldn't block the request (e.g. notifications, heavier processing), keeping request latency low.

### Likely follow-up questions (with answer hints)

- **"Walk me through what happens when an order is placed."** Trace it: validated at presentation (Zod) → application use case → domain creates Order, raises OrderPlaced → repository persists in a transaction → event handler emits over Socket.IO to the kitchen room. Shows you understand your own layering.
- **"Why DDD/layered for a restaurant app — isn't that over-engineering?"** Honest answer: partly a deliberate practice ground, but justified by non-trivial business rules and the value of testable, framework-independent domain logic. Note you'd scale the ceremony to the domain.
- **"How do you prevent overselling inventory under concurrent orders?"** Transactional decrement with a conditional `WHERE stock >= qty`; row-level locking / atomic update so two orders can't both succeed on the last item.
- **"Access + refresh tokens — how does refresh work and where do you store them?"** Short-lived access JWT, longer-lived refresh token; refresh endpoint validates and rotates. Discuss storage trade-offs (httpOnly cookie vs body) and revocation.
- **"How would you scale Socket.IO to multiple instances?"** Socket.IO Redis adapter for cross-instance pub/sub so an emit on instance A reaches a client connected to instance B; sticky sessions at the load balancer.
- **"What does a domain event actually buy you here?"** Decoupling: the core write doesn't depend on every side effect; you can add new reactions (analytics, notifications) without touching the use case. Trade-off: indirection.
- **"How is this tested?"** Domain logic unit-tested in isolation (no DB); Supertest for HTTP integration against a test DB; CI runs the suite on every push.
- **"What would you do differently?"** Maybe an outbox pattern for events to guarantee delivery even if the process crashes after commit; currently events fire in-process.

---

## Pharmacy FEFO v2 — Multi-Tenant Stock Management

> **Real scenarios (git-verified):** [33-real-world-scenarios.md](33-real-world-scenarios.md) → **pharmacy-fefo section** (FEFO index, tenant scoping, idempotency, BullMQ digest). Full commit log: `git-history/side-projects__pharmacy-fefo.md`.

### One-line pitch

A multi-tenant pharmacy stock platform whose core rule is **FEFO** — First-Expiry-First-Out dispensing — with strict tenant isolation enforced at the data-access layer and an immutable stock-movement ledger.

### The problem / context

Pharmacies must dispense the stock that expires soonest, not just any stock, or they bleed money to expiry and risk dispensing expired product. It's multi-tenant, so one pharmacy must **never** see another's data — and that guarantee can't depend on every developer remembering to add a `WHERE tenantId = ...`. Stock changes must be auditable.

### Tech stack

NestJS + TypeScript, PostgreSQL + Prisma, Redis + BullMQ, JWT + argon2 password hashing. Monorepo with pnpm workspaces (backend, frontend, packages/shared). Docker Compose + GitHub Actions.

### Architecture summary

pnpm monorepo: a NestJS backend, a frontend, and a shared package for types/contracts so the API and client can't drift. Tenant isolation is enforced via a **Prisma client extension** that injects the tenant filter into every query — isolation is structural, not per-query discipline. Stock is modeled as an **immutable movement ledger** (append-only); current quantity is derived from movements, never mutated in place. A settings-driven domain lets tenants configure behavior.

### What to emphasize / strongest talking points

- **Tenant isolation via a Prisma client extension** — the standout. Isolation enforced once, centrally, so no individual query can leak. This is the answer to "how do you do multi-tenancy safely."
- **FEFO dispensing logic** — a real, non-trivial domain algorithm.
- **Immutable ledger** for stock movements — auditability and correctness by construction.
- argon2 (not bcrypt) — shows you know current password-hashing best practice.
- Shared-types package in a monorepo — prevents API/client contract drift.

### Key technical challenges & solutions

1. **Bulletproof tenant isolation.** Solution: a Prisma client extension scoped per request that automatically adds the tenant predicate to reads and the tenant id to writes. Even if a developer forgets, the extension enforces it. Far safer than relying on every query.
2. **FEFO selection.** When dispensing N units, sort available batches by expiry date ascending and consume across batches until N is satisfied, recording a movement per batch. Handle partial-batch and multi-batch fulfillment.
3. **Stock correctness under concurrency.** Append-only ledger + transactional writes; quantity is a function of movements, so you never have a stale "current stock" field to race on. Optionally cached/snapshotted for read performance.
4. **Keeping frontend and backend contracts in sync.** Shared package with DTOs/types consumed by both sides of the monorepo.

### Likely follow-up questions (with answer hints)

- **"How exactly do you guarantee one tenant can't read another's data?"** Prisma client extension injects `tenantId` into every query at the data layer; tenant id comes from the authenticated request context, not user input. Defense in depth: also enforced in guards. (Mention Postgres RLS as an even stronger alternative.)
- **"Walk me through dispensing 50 units with FEFO."** Fetch batches with stock > 0, order by expiry asc, greedily consume oldest-first across batches, write a movement ledger entry per consumed batch inside one transaction; fail the whole thing if total available < requested.
- **"Why an immutable ledger instead of just updating a quantity column?"** Auditability (every change is traceable), no lost-update races on a mutable counter, easy reconciliation and time-travel. Trade-off: reads must aggregate — mitigated with snapshots/caching.
- **"What are the trade-offs of your isolation approach vs Postgres Row-Level Security vs separate schemas/databases?"** App-layer extension is simple and portable but trusts the app; RLS enforces in the DB itself; schema/db-per-tenant gives hard isolation but operational cost. Pick by risk tolerance and scale.
- **"Why argon2 over bcrypt?"** argon2id is the current recommended memory-hard KDF, resistant to GPU/ASIC attacks; bcrypt is fine but argon2 is the modern default.
- **"How do you handle the tenant context flowing through the request?"** Extracted from the JWT, placed in request-scoped context (NestJS request scope / AsyncLocalStorage), read by the Prisma extension.
- **"How would you test that isolation actually holds?"** Integration tests that create two tenants, write data as each, and assert cross-tenant reads return nothing — a regression guard on the most critical invariant.
- **"What's in your shared package and why?"** DTOs, enums, validation schemas — single source of truth so backend and frontend can't disagree on the contract.

---

## Hirely — Resume Builder SaaS

> **Real scenarios (git-verified):** [33-real-world-scenarios.md](33-real-world-scenarios.md) → **hirely section** (DDD arch-check, HMAC webhooks; + export idempotency keys, BullMQ pdf/email queues + S3 — _failed-job replay, **not** a formal DLQ_). Full commit log: `git-history/side-projects__hirely.md`.

### One-line pitch

A resume-builder SaaS with an API + dedicated Workers service, where PDF generation and email are handled as **reliable background jobs** with idempotency keys and a dead-letter queue.

### The problem / context

Generating a polished PDF resume is slow and resource-heavy — you can't do it inside an HTTP request. It must be offloaded, retried safely (without producing duplicate exports or duplicate emails on retry), and recover from poison messages. There's also export history that must reflect exactly what the user generated at that point in time.

### Tech stack

Monorepo with separate API and Workers, PostgreSQL + Prisma, Redis + BullMQ (PDF generation & email), JWT, S3/local storage, Gotenberg for PDF rendering, Nodemailer. DDD aggregates (User, Resume, Plan, Export).

### Architecture summary

API enqueues jobs; a **separate Workers process** consumes BullMQ queues for PDF generation (via Gotenberg) and email (Nodemailer), so heavy work never blocks the API and can scale independently. DDD aggregates model the domain (User, Resume, Plan, Export). **Snapshot pattern** captures the resume's exact state at export time so history is immutable even if the resume changes later. **Idempotency keys** prevent duplicate work on retries; **failed-job tracking** (BullMQ's failed set) lets me inspect and **manually replay** jobs that exhaust retries (not a formal dead-letter queue). Generated files go to S3 (or local in dev).

### What to emphasize / strongest talking points

- **Separation of API and Workers** — independent scaling, resilience, the right shape for heavy async work.
- **Idempotency keys** — the senior answer to "how do retries not cause duplicates."
- **Dead-letter queue** — you thought about failure, not just the happy path.
- **Snapshot pattern for export history** — correctness over time; history can't be retroactively mutated.
- Gotenberg for PDF — pragmatic choice (HTML→PDF service) over fighting a headless-browser setup yourself.

### Key technical challenges & solutions

1. **Slow PDF generation.** Offload to BullMQ; API returns immediately with a job/export id, client polls or gets notified on completion. Worker calls Gotenberg, uploads to S3, updates the Export aggregate.
2. **Safe retries / no duplicate exports or emails.** Idempotency key per job; before doing work, check whether that key already produced a result — if so, return it instead of redoing. Makes the operation effectively exactly-once from the user's view.
3. **Poison messages.** BullMQ retry with backoff; after max attempts the job lands in a dead-letter queue for inspection/alerting instead of silently vanishing or looping forever.
4. **Export history integrity.** Snapshot the resume content into the Export record at generation time, so later edits to the resume don't alter past exports.

### Likely follow-up questions (with answer hints)

- **"Why a separate Workers service instead of running jobs in the API process?"** Independent scaling (scale workers for load without scaling the API), failure isolation, and the API stays responsive. Trade-off: more moving parts/deploys.
- **"How do idempotency keys work in your system?"** Caller supplies (or system derives) a unique key; you store the key→result; on retry you detect the key and short-circuit. Discuss where you store it and TTL.
- **"What's in your dead-letter queue and what do you do with it?"** Jobs that failed all retries; you inspect, alert, and can replay after fixing the cause. Prevents data loss and infinite retry loops.
- **"Why the snapshot pattern for exports?"** A resume is mutable; an export is a point-in-time artifact. Snapshotting decouples them so history stays accurate.
- **"How do you handle a job that succeeds at the work but crashes before recording success?"** This is the at-least-once problem — idempotency makes the replay safe; ideally record completion transactionally with the side effect or use an outbox.
- **"How does the client know the PDF is ready?"** Polling the export status, or push (websocket/email link). Discuss the trade-off.
- **"Why Gotenberg over Puppeteer/wkhtmltopdf?"** Gotenberg is a containerized, stateless HTML→PDF service — less to maintain than running headless Chrome in-process, scales as its own container.
- **"How are S3 vs local storage abstracted?"** Storage behind an interface/port; S3 adapter in prod, local adapter in dev — same code path.

---

## CineBite — Movie Review Platform (DDD/CQRS learning project)

> **Note:** CineBite has no committed history in the local repos, so it isn't in the `git-history/` archive — keep it as a DDD/CQRS _learning_ talking point, not a git-evidenced one.

### One-line pitch

A movie-review platform built as a **deliberate DDD + full CQRS** study: bounded contexts, a four-layer architecture, ports & adapters, and NestJS's CommandBus/QueryBus/EventBus.

### The problem / context

This one I'm upfront about: it's a learning project to master strategic and tactical DDD and CQRS properly rather than half-applying them. The "problem" is the architecture itself — modeling a domain with clean bounded contexts and separating the write model from the read model.

### Tech stack

NestJS + TypeScript, SQLite + TypeORM, `@nestjs/cqrs` (CommandBus, QueryBus, EventBus). Value objects, ports & adapters.

### Architecture summary

Two **bounded contexts** — Movie and Bite (review) — each with its own four-layer DDD stack. **Full CQRS**: commands go through the CommandBus to command handlers that mutate aggregates; queries go through the QueryBus to read-optimized handlers; domain events flow through the EventBus. **Ports & adapters** isolate the domain from TypeORM/SQLite. Value objects encapsulate invariants (e.g. a Rating that can't be out of range).

### What to emphasize / strongest talking points

- You can articulate **CQRS, bounded contexts, value objects, aggregates, and ports/adapters** and — crucially — **when they're worth it and when they're overkill**.
- Honest framing: a learning vehicle, which shows self-awareness and a growth mindset.
- Clean separation of read/write paths.

### Key technical challenges & solutions

1. **Defining bounded context boundaries.** Decided Movie and Bite are separate contexts with their own models; they communicate via events/ids, not shared tables — preventing a tangled monolith model.
2. **Command/query separation.** Writes through CommandBus → handlers → aggregate; reads through QueryBus → read handlers that can use a different, denormalized shape. Avoids one model serving two masters.
3. **Keeping the domain framework-free.** Ports define what the domain needs; TypeORM adapters implement them — domain has no TypeORM imports.

### Likely follow-up questions (with answer hints)

- **"What is CQRS and what problem does it solve?"** Separating the write model (commands, validation, invariants) from the read model (queries, denormalized for display). Solves the tension of one model optimized for both. Note: doesn't require separate databases.
- **"Did this project actually need CQRS?"** Be honest: no, the domain is small; you'd consider it over-engineering in production. The value was learning to apply it correctly. This honesty scores well.
- **"How did you decide the bounded contexts?"** By cohesion of language and rules — Movie (catalog) vs Bite (user reviews) have different ubiquitous language and lifecycles.
- **"Aggregate vs entity vs value object — give examples from this project."** Aggregate = consistency boundary (Movie with its reviews or a Review aggregate); entity = identity (Movie); value object = defined by attributes, immutable (Rating, Title).
- **"What's the EventBus doing here?"** Decouples reactions to domain events (e.g. updating a movie's average rating when a Bite is added) from the command that caused them.
- **"Would you use SQLite/TypeORM in production?"** SQLite was right for a learning project (zero setup); for production you'd move to Postgres. TypeORM is fine; Prisma is your usual production choice.
- **"What's the downside of CQRS you experienced?"** More boilerplate, more indirection, eventual-consistency complexity if read/write models diverge — only pays off at sufficient complexity/scale.

---

## Trust-Node — Delivery Management with Real-Time Tracking

> **Real scenarios (git-verified):** [33-real-world-scenarios.md](33-real-world-scenarios.md) → **trust-node section** (PostGIS, atomic invoice↔order assignment; + service-layer error centralization + projections). Full commit log: `git-history/side-projects__trust-node.md`.

### One-line pitch

A delivery-management backend with **real-time location tracking** over Socket.IO, built on Express + TypeScript and deployed behind an Nginx reverse proxy.

### The problem / context

Delivery platforms need live driver locations streamed to customers/dispatch with low latency, plus the usual order/delivery lifecycle. The interesting parts are real-time location fan-out and a production deployment topology.

### Tech stack

Express + TypeScript, PostgreSQL + Prisma, IORedis, JWT, Zod validation, Vitest. Socket.IO for real-time location. Docker + Nginx reverse proxy.

### Architecture summary

Express/TypeScript API with Prisma over Postgres; Zod validates inputs; JWT secures endpoints. Socket.IO streams driver location updates to subscribers (rooms per delivery/driver). IORedis supports caching / pub-sub. Deployed via Docker with Nginx as a reverse proxy in front (TLS termination, routing, websocket upgrade handling). Tested with Vitest.

### What to emphasize / strongest talking points

- **Real-time location tracking** — concrete, demoable, and a different real-time use case from Foody's kitchen displays (high-frequency position updates vs discrete order events).
- **Nginx reverse proxy** in front — shows deployment/ops awareness, including the websocket-upgrade gotcha.
- Vitest (modern, fast) rather than defaulting to Jest — you choose tools deliberately.

### Key technical challenges & solutions

1. **Streaming frequent location updates efficiently.** Socket.IO rooms scoped to a delivery so only relevant clients receive a driver's updates; throttle/sample high-frequency GPS pings to avoid flooding.
2. **Websockets through Nginx.** Configure Nginx to pass the `Upgrade`/`Connection` headers so websocket connections survive the proxy — a classic real-world gotcha.
3. **Scaling real-time across instances.** Socket.IO Redis adapter (via IORedis) so emits propagate across nodes; sticky sessions at the proxy.

### Likely follow-up questions (with answer hints)

- **"How do you handle high-frequency location updates without overwhelming clients/server?"** Room scoping, throttling/sampling on the server, and only persisting at a coarser interval than you stream.
- **"What did you have to configure in Nginx for websockets?"** The `Upgrade` and `Connection: upgrade` headers and HTTP/1.1; otherwise the proxy drops the websocket handshake.
- **"How would you scale this to many concurrent drivers across multiple servers?"** Socket.IO Redis adapter for cross-instance fan-out, sticky sessions, and consider a dedicated real-time tier.
- **"Do you persist every location ping?"** No — stream live, persist at intervals or store a track summary; full-fidelity persistence is expensive and rarely needed.
- **"Why IORedis specifically?"** Robust, performant Redis client with good cluster/pub-sub support — used here for the Socket.IO adapter and caching.
- **"How is location data secured?"** JWT-authenticated sockets; clients can only join rooms for deliveries they're authorized to see.
- **"Why Vitest over Jest?"** Faster, native ESM/TS support, Vite-aligned. Jest is fine but Vitest fit the toolchain.

---

## Nova ERP React — Comprehensive ERP Frontend (Dynamic Egypt)

> **Real scenarios (git-verified):** [33-real-world-scenarios.md](33-real-world-scenarios.md) → **nova-erp section** (AbortController, memoized nav, invoice-totals hook); and **nova-hr** (visible-column export, Arabic/RTL, react-window, error boundaries). Commit logs: `git-history/work-dynamic__nova-erp-react.md`, `…__nova-hr-react.md`.

### One-line pitch

A large, modular ERP frontend (accounts, purchase, sales, warehouse, master-data, ticketing) in React 19 + TypeScript, with a hardened HTTP layer that does **automatic 401 refresh-token retry**, full i18n with Arabic RTL, and SignalR real-time.

### The problem / context

Enterprise ERP is sprawling — many feature areas, role-based access, bilingual (English/Arabic with RTL), and it can't log users out every time an access token expires mid-session. It needs a maintainable module structure and a robust API layer.

### Tech stack

React 19 + TypeScript + Vite, Ant Design + Tailwind, Context-based auth & theme (no Redux), i18next (en/ar) + RTL, Microsoft SignalR, React Router v7, Recharts, axios.

### Architecture summary

**Feature-module structure** — each domain (accounts, sales, warehouse, etc.) is a self-contained module with its own pages/services/components. A central **API service layer** wraps axios in an `HTTPService` with interceptors. Auth and theme are handled via **React Context (deliberately no Redux)**. i18next provides en/ar translations with full RTL layout switching. SignalR provides real-time updates. React Router v7 handles routing; Recharts for dashboards.

### What to emphasize / strongest talking points

- **The HTTPService with 401 refresh-token retry** — the strongest talking point: on a 401, queue the failed request, refresh the token once, then replay the queued requests transparently. Users never see a flicker.
- **Context over Redux** — a defensible architecture decision; you can explain _why_ you didn't reach for Redux.
- **Full i18n + Arabic RTL** — non-trivial, real-world, and not every candidate has done RTL.
- **Feature-module structure at scale** — maintainability of a genuinely large app.
- React 19 + Router v7 — current.

### Key technical challenges & solutions

1. **Seamless token refresh on 401.** Axios response interceptor catches 401, triggers a single refresh, and **queues concurrent failed requests** so you don't fire N refreshes; once refreshed, replay all queued requests with the new token. Prevents the thundering-herd refresh bug.
2. **State management without Redux.** Context for cross-cutting concerns (auth, theme); local/server state kept close to where it's used. Avoids Redux boilerplate for an app that didn't need a global store.
3. **Arabic RTL + i18n.** i18next for strings; direction switching at the layout root; Ant Design's RTL config and Tailwind logical properties so the whole UI mirrors correctly.
4. **Scaling a large codebase.** Feature modules with clear boundaries and a shared API/service layer keep teams from stepping on each other.

### Likely follow-up questions (with answer hints)

- **"Walk me through your 401 refresh-retry. What happens if 5 requests 401 at once?"** Single refresh in flight; the other 4 are queued (subscribed to the refresh promise) and replayed once the new token arrives — not 5 refreshes. This is the killer detail; know it cold.
- **"Why Context instead of Redux?"** The app's shared global state is limited (auth, theme); server data is fetched per-feature. Context avoided Redux boilerplate. Trade-off: Context can cause re-render fan-out — mitigate by splitting contexts / memoization.
- **"How did you implement RTL for Arabic?"** Direction toggle at the root, AntD RTL provider, logical CSS properties; test the mirrored layout, not just translated text.
- **"How are feature modules structured and why?"** Each domain owns its routes/pages/services/components; shared concerns in a common layer — improves cohesion and team scalability.
- **"How do you handle real-time with SignalR in React?"** A connection managed in a context/service, subscribe components to relevant events, clean up on unmount; reconnection handling.
- **"Where does the access token live and what are the security trade-offs?"** Discuss memory vs storage vs httpOnly cookie; XSS vs CSRF trade-offs; what you chose and why.
- **"How do you keep bundle size reasonable in a huge app?"** Route-based code splitting / lazy loading per feature module, Vite's build optimizations.
- **"What's the role of the API service layer vs calling axios directly?"** Centralizes interceptors, base config, error handling, and the refresh logic — components don't deal with raw HTTP.

---

## Dynamic SaaS React — Multi-Tenant SaaS Dashboard (Dynamic Egypt)

> **Real scenarios:** see [33-real-world-scenarios.md](33-real-world-scenarios.md) (frontend SaaS patterns are under the React projects). Commit log: `git-history/work-dynamic__dynamic-sass-react.md`.

### One-line pitch

A multi-tenant SaaS admin dashboard (organizations, billing, users, tenants, modules) in React 19 with JWT + **RBAC-driven role-based routing** and a clean public-vs-dashboard layout split.

### The problem / context

A SaaS control plane needs to manage organizations and tenants, gate features by role/permission, separate marketing/auth pages from the authenticated app, and stay maintainable with disciplined commit hygiene across a team.

### Tech stack

React 19, Tailwind 4, Ant Design 6, Vite, TypeScript, JWT + RBAC, Husky + Commitlint.

### Architecture summary

Two top-level layouts — **PublicLayout** (login/marketing) vs **DashboardLayout** (authenticated app) — with **role-based routing** that gates routes by the user's permissions from the JWT. Multi-tenant concepts (organizations, tenants, modules) drive the UI. Husky + Commitlint enforce commit conventions and pre-commit checks.

### What to emphasize / strongest talking points

- **RBAC + role-based routing** — guard routes and conditionally render by permission, not just hide buttons.
- **Layout separation** (public vs dashboard) — clean routing architecture.
- **Multi-tenant frontend** modeling — organizations/tenants/modules.
- **Husky + Commitlint** — team discipline / DX maturity.
- Latest stack (React 19, Tailwind 4, AntD 6).

### Key technical challenges & solutions

1. **Role-based access in the UI.** Routes wrapped in permission guards; navigation and actions conditionally rendered by role. Emphasize that the frontend gate is UX — the backend is the real authority.
2. **Public vs authenticated layout split.** Separate layout trees and route groups so unauthenticated and authenticated experiences don't bleed into each other; redirect logic at the boundary.
3. **Multi-tenant UI state.** Current organization/tenant context drives data fetching and available modules.

### Likely follow-up questions (with answer hints)

- **"How does role-based routing work, and is it secure?"** Route guards check permissions from the JWT to decide render/redirect — but stress it's **UX only**; the backend must enforce authorization independently. Frontend RBAC is bypassable.
- **"How do you model permissions on the frontend?"** Roles/permissions decoded from the token; a hook/util like `can(permission)` drives guards and conditional rendering.
- **"Why split into PublicLayout and DashboardLayout?"** Different chrome, different auth requirements, cleaner routing and code splitting between the two experiences.
- **"How do you handle a logged-in user hitting a public route (or vice versa)?"** Redirect logic at layout/route boundaries based on auth state.
- **"What do Husky and Commitlint enforce and why?"** Pre-commit lint/format and conventional commit messages — consistency, automatable changelogs, smoother team collaboration.
- **"How is multi-tenancy reflected in the frontend?"** Active org/tenant in context; scopes API calls and which modules/features show.
- **"Tailwind 4 and AntD 6 together — any friction?"** Manage style-layering/specificity; use AntD for complex components, Tailwind for layout/spacing; keep design tokens consistent.

---

## Rosine — Classic MERN E-Commerce (Freelance)

> **Full commit log:** `git-history/freelance__rosine.md` (classic MERN; archived but not separately scenario-mined).

### One-line pitch

A full classic **MERN** e-commerce store — products, cart, orders, reviews, pagination, image uploads — React + Redux frontend, Express/MongoDB backend, JWT auth, deployed to Heroku.

### The problem / context

A real freelance e-commerce build: customers browse/search products, manage a cart, check out, leave reviews; admins manage catalog with image uploads. Classic CRUD-heavy commerce with the usual concerns — auth, file uploads, pagination, order flow.

### Tech stack

React 16 + Redux + Ant Design, Express + MongoDB/Mongoose, JWT + bcrypt, Multer + Cloudinary (image uploads), pagination. Deployed on Heroku.

### Architecture summary

Classic MERN split: React/Redux SPA talking to an Express REST API over MongoDB via Mongoose. Redux holds global client state (cart, auth, product lists). JWT + bcrypt for auth. Multer handles multipart uploads, pushed to Cloudinary for storage/CDN. Server-side pagination for product listings.

### What to emphasize / strongest talking points

- **Real client work shipped to production** (freelance, deployed) — you delivered for a paying client, end to end.
- The **full commerce flow**: cart → order → reviews, plus admin catalog management.
- **Image uploads to Cloudinary** via Multer — a concrete integration.
- Demonstrates the **classic MERN stack** explicitly (relevant when the JD literally says MERN/MongoDB).
- Good contrast piece: shows your range from older MERN to current TypeScript/DDD work.

### Key technical challenges & solutions

1. **Image uploads.** Multer parses multipart form-data; stream/upload to Cloudinary; store the returned URL in MongoDB rather than the binary. Offloads storage/CDN.
2. **Cart & order state.** Redux for cart across the app; order creation snapshots line items/prices so later product changes don't alter past orders.
3. **Pagination & performance.** Server-side pagination (skip/limit) with total counts; avoid shipping the whole catalog.
4. **Auth.** bcrypt-hashed passwords, JWT for stateless sessions, protected admin routes.

### Likely follow-up questions (with answer hints)

- **"How did you handle image uploads?"** Multer for multipart, upload to Cloudinary, persist the URL; never store binaries in Mongo.
- **"How do you model an order vs a cart?"** Cart is mutable client state; an order snapshots items and prices at purchase time so it's immutable history.
- **"How did you paginate, and what about deep pagination performance?"** skip/limit for the build; note that large skips are slow and you'd move to cursor/range-based pagination at scale.
- **"Why Redux here?"** Cart/auth/product state shared widely across an SPA — Redux fit. (Contrast with Nova ERP where you chose Context — shows you pick per-context.)
- **"How would you prevent overselling stock?"** Atomic stock checks on order creation; in Mongo, conditional `findOneAndUpdate` with a stock guard or transactions.
- **"This is React 16 + Redux — how would you build it today?"** React 19 + hooks, React Query for server state, maybe TypeScript end-to-end; Redux Toolkit if you still needed global state. Shows growth.
- **"Anything about deploying to Heroku you had to handle?"** Env config, build step, MongoDB Atlas connection, Cloudinary keys as config vars.

---

## Other Notable Projects (roundup)

Keep these as supporting evidence — pull one out when it matches a specific JD requirement.

- **Nova HR / Mokambo POS / RTX Customer & Operation / Jolie Stores (e-commerce) / WhatsAd / QP Express** — additional Dynamic Egypt React 19 + TS + Vite + AntD + Tailwind apps. Use to show **breadth across business domains** (HR, POS, e-commerce, customer ops) on a consistent, modern frontend stack. Mokambo POS is good for "fast, keyboard-driven, offline-tolerant UI"; Jolie Stores for e-commerce frontend.
- **Shuhna** — **Next.js 14 + TS** frontend, Express + **MySQL + Sequelize** + Passport backend, separate admin SPA, multi-tenant, Docker. Your go-to for **Next.js (SSR/App Router)** and **SQL with Sequelize** (different ORM from Prisma — shows range), plus another multi-tenant example.
- **Whats-Add** (projects/node) — WhatsApp marketing backend: Express + TS, MongoDB/Mongoose, **BullMQ + Redis**, JWT, **rate limiting**. Good for queue-driven messaging and API rate-limiting talking points.
- **Admin Coffee** (freelance) — React 18 + TS + Vite, **React Query**, Tailwind, **Azure AD / MSAL auth**, **Cypress + Jest**, React Hook Form. Your example for **enterprise SSO (Azure AD/MSAL)**, **React Query** server-state, and **E2E testing with Cypress**.
- **learn-background-task** — Node + TS learning repo across 8 progressive modules: BullMQ, Redis, node-cron, **worker_threads**, pub/sub, pdfkit, sharp. Use to demonstrate **depth on background processing fundamentals** — and honestly frame it as a study project that fed into Hirely/Foody.
- **fintech-orders-task** (a fintech take-home task) — **NestJS + Kafka** event-driven microservices (Orders ↔ Inventory), idempotent consumer (`ProcessedEvent` dedup) + retries, Docker Compose. Real scenarios: 33 → (Kafka + idempotent consumer). Log: private `git-history/` archive.
- **ramify** — Prisma + Redis tree app showing **performance fundamentals**: N+1 fix (preload + in-memory Map), Redis cache with graceful degradation, Decimal precision, cursor pagination, multi-stage Docker. Real scenarios: 33 → (N+1), (Redis cache); ramify section. Log: `git-history/side-projects__ramify.md`.
- **shuhna-BE** (backend) — Express + **Sequelize** logistics: 8-category **wallet ledger + settlement cycle**, tiered pricing matrix (5 models), **bulk AWB PDF** generation, inner-join soft-delete. Real scenarios: 33 → (wallet); shuhna-BE section. Log: `git-history/freelance-shuhna__shuhna-BE.md`.
- **sms-reviews** — Apollo GraphQL + **BullMQ** cron SMS scheduling, safe Handlebars (`{{{ }}}`) templating, bulk contact upload. Real scenarios: 33 → sms-reviews section. Log: `git-history/work-cairo-tech__sms-reviews.md`.
- **shift-swap** — large Apollo GraphQL + Prisma + BullMQ + **BigQuery** monorepo: **28 composite indexes**, pooled-overtime **2h-lock state machine** (GraphQL shield), BigQuery dual-write, feature-flag/free-trial gating. Real scenarios: 33 → (28 indexes), (pooled-OT). Log: `git-history/work-cairo-tech__shift-swap.md`.

---

## Map Your Projects to Skills

Pick the project in each row that best fits what the interviewer is probing. ✅ = strong demonstrator, ▫ = present/secondary.

| Skill                            | Best project(s) to cite                                                                                                           | Others                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Multi-tenancy (isolation)**    | Pharmacy FEFO ✅ (AsyncLocalStorage + Prisma client extension)                                                                    | Dynamic SaaS ✅, Shuhna ▫                      |
| **Real-time**                    | Trust-Node ✅ (location tracking), Foody ✅ (kitchen displays)                                                                    | Nova ERP ▫ (SignalR)                           |
| **Queues / background jobs**     | Pharmacy FEFO ✅ (BullMQ digest + auto-quarantine), Hirely ✅ (pdf/email queues), sms-reviews ✅ (cron SMS)                       | Foody ▫, Whats-Add ▫, learn-background-task ✅ |
| **Idempotency / reliability**    | Pharmacy FEFO ✅ (Redis Idempotency-Key), fintech-orders-task ✅ (event dedup), Hirely ✅ (export keys; failed-job replay, **not** a DLQ) | —                                              |
| **Auth (JWT access+refresh)**    | Foody ✅, Nova ERP ✅ (401 refresh-retry)                                                                                         | Pharmacy FEFO ▫ (argon2), Rosine ▫             |
| **Enterprise SSO**               | Admin Coffee ✅ (Azure AD / MSAL)                                                                                                 | —                                              |
| **RBAC / authorization**         | Dynamic SaaS ✅ (role-based routing)                                                                                              | Nova ERP ▫                                     |
| **DDD / clean architecture**     | Foody ✅, CineBite ✅, Hirely ✅ (aggregates)                                                                                     | Pharmacy FEFO ▫                                |
| **CQRS**                         | CineBite ✅ (full CommandBus/QueryBus/EventBus)                                                                                   | —                                              |
| **Caching (Redis)**              | Foody ✅, Pharmacy FEFO ✅, Trust-Node ▫                                                                                          | Hirely ▫                                       |
| **Testing**                      | Foody ✅ (Jest+Supertest), Trust-Node ✅ (Vitest), Admin Coffee ✅ (Cypress+Jest)                                                 | —                                              |
| **i18n / RTL**                   | Nova ERP ✅ (i18next en/ar + RTL)                                                                                                 | —                                              |
| **SQL / relational modeling**    | Pharmacy FEFO ✅, Foody ✅ (Postgres+Prisma), Shuhna ✅ (MySQL+Sequelize)                                                         | Trust-Node ▫                                   |
| **NoSQL / MongoDB**              | Rosine ✅, Whats-Add ✅                                                                                                           | —                                              |
| **Monorepo**                     | Pharmacy FEFO ✅ (pnpm + shared pkg), Hirely ✅                                                                                   | —                                              |
| **PDF / file processing**        | Hirely ✅ (Gotenberg), learn-background-task ▫ (pdfkit/sharp)                                                                     | —                                              |
| **File uploads / storage**       | Hirely ✅ (S3), Rosine ✅ (Cloudinary)                                                                                            | —                                              |
| **Frontend state without Redux** | Nova ERP ✅ (Context)                                                                                                             | Dynamic SaaS ▫                                 |
| **Redux**                        | Rosine ✅                                                                                                                         | —                                              |
| **React Query / server state**   | Admin Coffee ✅                                                                                                                   | —                                              |
| **Next.js / SSR**                | Shuhna ✅                                                                                                                         | —                                              |
| **DevOps (Docker / CI / proxy)** | Foody ✅, Pharmacy FEFO ✅, Trust-Node ✅ (Nginx)                                                                                 | Shuhna ▫                                       |
| **Observability**                | Foody ✅ (Winston + Sentry)                                                                                                       | —                                              |
| **API docs (OpenAPI)**           | Foody ✅ (Swagger)                                                                                                                | —                                              |
| **Rate limiting**                | Whats-Add ✅                                                                                                                      | —                                              |

---

## Common Mistakes When Discussing Projects

1. **Too much detail / no off-ramp.** Don't narrate every file. Give the 60-90s pitch and stop — let them steer with follow-ups. Rambling reads as inability to summarize.
2. **Can't explain _why_.** "I used DDD/CQRS/Redis/BullMQ" with no justification is a red flag. Every choice needs a reason _and_ an acknowledged trade-off. If you can't justify it (e.g. CQRS in CineBite), say so honestly — that scores higher than bluffing.
3. **Taking all the credit / vague on your role.** State exactly what you did. Overclaiming on team projects collapses the moment they probe a part you didn't build. "I" vs "we" should be accurate.
4. **No metrics or outcomes.** Even side projects: test coverage, latency, throughput, "isolation verified by integration tests," "cut PDF gen out of the request path." "It works" is not impact.
5. **Can't go deep when asked.** The pitch is shallow on purpose, but you must be able to descend 3+ levels on the parts you highlighted. Don't headline a feature (401 refresh-retry, FEFO, idempotency) you can't whiteboard. **Only put in the pitch what you can defend in depth.**
6. **Picking the wrong project for the question.** Use the skills map. Don't tell the MongoDB story to a "how do you do multi-tenancy" question when Pharmacy FEFO is right there.
7. **No "what I'd do differently."** Lacking this signals no reflection. Have a genuine one per project (outbox for Foody events, less CQRS in CineBite, earlier shared-types extraction, cursor pagination for Rosine).
8. **Hiding the learning projects badly.** CineBite and learn-background-task are strengths _if framed as deliberate practice_. Be honest they're study projects — pretending they're production invites a fall.
