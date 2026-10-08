# Real-World Scenarios & Issues I Faced

> A study bank of **real engineering scenarios** from my own projects — each one a problem I hit, how I solved it, and the takeaway to study. These are written as scenarios (not commit logs): use them to answer "tell me about a time you…" and to revise the _why_ behind each decision. (The raw commit-by-commit proof, with diffs, lives in my private `git-history/` archive if I ever need to cite the exact change.)
>
> Format per scenario: **Problem → How I solved it → Takeaway** + the topic files to study (`→ NN`).

---

## How to use this

- **Drill the takeaways**, not the commits — each scenario maps to a concept in the topic files.
- For each, practice a 60-second spoken version: _situation, the hard part, what I chose, the trade-off._
- The 🔥 ones are the highest-frequency interview prompts.

---

## pharmacy-fefo

_NestJS · Prisma · Redis · BullMQ (multi-tenant pharmacy stock)_

🔥 **Multi-tenant isolation without `where: { tenantId }` everywhere**

- **Problem:** 9 models had to be scoped to the current tenant on every query; one forgotten filter = a cross-tenant data leak (the #1 multi-tenant bug).
- **How I solved it:** bound the tenant per request with **AsyncLocalStorage**, then wrote a **Prisma client extension** that auto-injects `tenantId` into the `data` of creates and the `where` of reads for scoped models — and passes through untouched on public auth routes.
- **Takeaway:** push cross-cutting rules into a layer a developer _can't_ forget; isolation becomes structural, not a code-review hope. → 17, 09, 12

🔥 **Making dispense/write-off safe to retry (idempotency)**

- **Problem:** stock mutations are retried on timeouts; a double-dispense corrupts inventory.
- **How I solved it:** an interceptor that atomically claims a Redis key (`SET NX EX 24h`) per `Idempotency-Key`, caches the first response and **replays** it on retry; in-progress returns 409; the key is released on error so a genuine retry can proceed.
- **Takeaway:** idempotency = "same key → same effect once"; the atomic claim is what prevents the race. → 23, 10, 14

🔥 **Composite indexes tuned to the exact query (FEFO)**

- **Problem:** the hot query is "active batches for a product, soonest-expiry first," per tenant — a naive query scans and sorts on the fly.
- **How I solved it:** a composite index `(tenantId, productId, status, expiryDate)` that mirrors the filter **and** the sort order, so the planner can seek then read in order; plus `@@unique(tenantId, barcode)`.
- **Takeaway:** index column order should match `WHERE` + `ORDER BY`; "an index" isn't enough, it has to fit the query shape. → 12, 13

**Per-tenant scheduled digest + auto-quarantine (queues)**

- **Problem:** each tenant wants a daily near-expiry/low-stock email at _their_ local hour, expired stock must be quarantined, and a failing email mustn't wedge the system.
- **How I solved it:** an hourly cron that processes each tenant only at its configured local hour (timezone-aware), auto-quarantines expired batches (audited), then enqueues the email to a **BullMQ** worker; skips sending when there are no findings.
- **Takeaway:** move slow/fallible work (email) off the request and out of the cron thread via a queue; make scheduling tenant- and timezone-aware. → 14, 32

**FEFO dispense as a pure, testable function**

- **Problem:** allocating a requested quantity across batches by expiry, tracking shortfall, is core domain logic that must be unit-testable.
- **How I solved it:** a pure `planFefo(batches, requested)` (greedy over pre-sorted batches → allocations + shortfall), with locking/eligibility handled by the caller.
- **Takeaway:** keep domain logic pure (no DB/IO) so it's trivially testable; isolate side effects at the edges. → 17, 16

---

## fintech-orders-task

_NestJS · Kafka (a fintech take-home task)_

🔥 **Two services that talk over Kafka (event-driven)**

- **Problem:** an Orders service (REST) and an Inventory service must communicate asynchronously and survive restarts.
- **How I solved it:** Orders publishes `OrderCreated/Confirmed/Failed`; Inventory consumes, checks stock, emits the result; Kafka's partitions/retries handle redelivery; the whole thing runs in docker-compose.
- **Takeaway:** events decouple services and give eventual consistency; you trade simplicity for resilience and scalability. → 30, 19

🔥 **Exactly-once _effect_ on at-least-once delivery**

- **Problem:** Kafka delivers at-least-once, so the same event can be processed twice → double inventory change.
- **How I solved it:** a `ProcessedEvent` table with a unique `(tenantId, eventId)` constraint; the consumer checks-before-process and no-ops on duplicates.
- **Takeaway:** you can't get exactly-once delivery, but you can get exactly-once _effect_ with an idempotent consumer + a dedup key. → 30, 23

---

## foody

_Express · TypeScript · Prisma (restaurant backend)_

🔥 **One export endpoint for CSV, Excel, and PDF**

- **Problem:** admins needed the _same filtered dataset_ exported in three formats, and the PDF renderer broke in CI.
- **How I solved it:** a single export service — `json2csv` for CSV, `exceljs` for XLSX, **Puppeteer** HTML→PDF — that respects the active DB filters; fixed CI by running headless Chrome with `--no-sandbox` and tightening Jest teardown so it didn't hang.
- **Takeaway:** centralize the serialization, keep the filter logic shared; Puppeteer is powerful but heavy — a candidate to move behind a queue. → 10, 07

🔥 **Money that doesn't drift (Decimal)**

- **Problem:** prices/totals computed with JS `Number` accumulate floating-point error.
- **How I solved it:** moved monetary fields and math to `Prisma.Decimal`, converting at the API edge.
- **Takeaway:** never use binary floats for money — fixed-precision Decimal (or integer minor units) is the rule. → 23

**Order lifecycle as a state machine**

- **Problem:** orders move PENDING→CONFIRMED→PREPARING→READY→DELIVERED; invalid jumps (and double-pay) must be rejected.
- **How I solved it:** explicit transition validation per status with cancel/pay handlers that include idempotency checks, plus a job log + worker for async side effects.
- **Takeaway:** model lifecycles as explicit transitions, not scattered `if`s; reject illegal states centrally. → 17, 14

**Audit trail with before/after diffs**

- **Problem:** compliance needed to know who changed what.
- **How I solved it:** an `AuditLog` capturing actor, action, and the **before/after entity state** via `deep-diff`.
- **Takeaway:** capture deltas, not just events; mind the storage cost and never log secrets/PII. → 23, 32

**Fine-grained RBAC via permission groups**

- **Problem:** roles alone were too coarse.
- **How I solved it:** permissions + permission-groups loaded in the authenticate middleware; an `authorize` middleware checks the required permission per route.
- **Takeaway:** prefer permission checks over role names for flexibility; load them efficiently to avoid an N+1 on every request. → 11, 24

**Structured logging with rotation**

- **Problem:** ad-hoc logs weren't queryable in production.
- **How I solved it:** winston structured JSON with daily file rotation + morgan request logs carrying user id and response time.
- **Takeaway:** logs should be queryable data (JSON + correlation), not a wall of text. → 32

---

## hirely

_Express · Prisma · BullMQ (resume SaaS, DDD)_

🔥 **DDD boundaries the linter actually enforces**

- **Problem:** layered/DDD code rots when developers import across boundaries.
- **How I solved it:** a domain layer (aggregates, value objects, domain events), use cases and query repositories, plus an ESLint `arch:check` rule that **fails the build** on cross-module imports; one DI container per module.
- **Takeaway:** architecture you can't enforce will erode — encode the dependency rule in tooling. → 17

🔥 **Idempotent, replayable export pipeline**

- **Problem:** PDF/email exports are expensive and retried; failures need recovery.
- **How I solved it:** BullMQ pdf + email queues with retry/backoff, an S3 adapter (SigV4) for storage, a cleanup worker for expired exports, and an optional **idempotency key** (unique per user) that replays an existing export instead of re-running.
- **Takeaway:** be honest about failure handling — I track failed jobs (BullMQ's failed set) and **replay them manually**; that's recovery, **not** a formal dead-letter queue. → 14, 10

**Webhooks verified and replayable**

- **Problem:** billing-provider webhooks can be forged, duplicated, or lost.
- **How I solved it:** verify the provider's **HMAC** signature, persist failed webhooks, and support idempotent replay; enforce per-plan limits.
- **Takeaway:** verify signatures on the raw body, dedup by event id, and store-then-process so nothing is lost. → 10, 11

---

## trust-node

_Express · Prisma · PostGIS · Zod (delivery backend)_

🔥 **Real geospatial queries (PostGIS)**

- **Problem:** "nearest rider" and "is this point in our coverage polygon" can't be done well with app-side math.
- **How I solved it:** `geography(Point,4326)`/`geometry(Polygon,4326)` columns with a safe rollout (nullable → backfill → index → feature-flag reads), using `ST_Distance`/`ST_DWithin`/`ST_Contains` via raw queries, backed by spatial indexes.
- **Takeaway:** for distance/containment, let the database do it with spatial types + indexes; roll out schema changes in safe phases. → 13, 19

🔥 **Assigning orders to an invoice without double-assigning (concurrency)**

- **Problem:** two concurrent requests could assign the same order to different invoices.
- **How I solved it:** wrapped validate→create→assign in a transaction; the assignment uses `updateMany` with an `invoiceId: null` guard + a count check, raising `CONFLICT` if an order was already taken.
- **Takeaway:** make the conflict impossible at the write (conditional update), don't just check-then-write. → 13, 23

**Thin controllers via service-layer errors**

- **Problem:** 404/validation handling was duplicated across 20+ controllers.
- **How I solved it:** a `getResourceByIdOrThrow()` pattern in services and a Prisma error mapper, moving hundreds of lines out of controllers; list/detail projections cut over-fetching across 40+ files.
- **Takeaway:** centralize cross-cutting error handling; project only the fields you need. → 08, 17, 13

---

## ramify

_Prisma · Redis · React-Flow (tree/discussion app)_

🔥 **Killing an N+1 in a tree recalculation**

- **Problem:** recalculating a tree queried each node's parent — O(n) round-trips.
- **How I solved it:** preload all parents once into a `Map`, then during a topological sort track updated values **in memory**, writing in a batch.
- **Takeaway:** the N+1 fix is "batch the reads, compute in memory, write once"; recognize it whenever you see a query inside a loop. → 13, 12

🔥 **Cache that degrades gracefully when Redis is down**

- **Problem:** a hard Redis dependency means an outage takes the whole API down.
- **How I solved it:** cached hot results in Redis with invalidation, but wrapped every cache call in try/catch (with `maxRetriesPerRequest: null`) so a Redis failure falls back to the DB instead of erroring.
- **Takeaway:** treat the cache as an optimization, not a dependency — always have a fallback path. → 14, 32

**Decimal precision in financial values**

- **Problem:** numeric drift in computed values.
- **How I solved it:** migrated the columns to a precise numeric type and centralized the Decimal→number conversion at the response layer (with tests).
- **Takeaway:** decide precision at the schema, convert at the boundary, and test the rounding. → 23, 13

---

## shuhna-BE

_Express · Sequelize (logistics backend, freelance)_

🔥 **A business wallet ledger + settlement cycle**

- **Problem:** businesses needed cash-in/out tracking with fees and periodic settlement.
- **How I solved it:** an 8-category transaction ledger (cash-out/in, fees, recharge, adjustments, compensation…), a delivery↔wallet bridge, balance tracking, and a settlement cycle that flags settled deliveries and creates a fee transaction per payout.
- **Takeaway:** money systems are append-only ledgers — every movement is a typed, auditable transaction, never a mutated balance. → 23

**Bulk imports: validate everything, then commit**

- **Problem:** bulk delivery uploads must not partially apply on a bad row.
- **How I solved it:** validate _all_ rows first (`validateDelivery()`), then create inside a single transaction; bulk AWB PDFs generated in a batch via Puppeteer.
- **Takeaway:** validate-then-transaction for bulk ops; all-or-nothing beats half-imported data. → 10

**Soft-delete done right with joins**

- **Problem:** soft-deleted rows kept showing up via relations.
- **How I solved it:** required **inner joins** on relations so soft-deleted parents drop their children, which also avoided an N+1.
- **Takeaway:** soft delete needs every read path (including joins) to filter — easy to forget. → 13

**Tiered delivery pricing**

- **Problem:** pricing varied by pickup/dropoff sector, delivery type, and parcel size.
- **How I solved it:** a 5-model pricing schema (sectors/tiers/transit/types/sizes) linked to businesses, with a response shaper that nests the flat matrix.
- **Takeaway:** model pricing dimensions explicitly; shape the response for the client at the edge. → 13, 10

---

## shift-swap

_Apollo GraphQL · Prisma · BullMQ · BigQuery (large monorepo)_

🔥 **28 composite indexes to kill slow queries at scale**

- **Problem:** queries over `Shift`/`ShiftWorkerMatch`/`ActivityLog` got slow as data grew.
- **How I solved it:** a migration adding 28 composite indexes matched to the hot relation/filter/sort paths.
- **Takeaway:** at scale, index strategy is a deliberate, measured exercise — profile, then index the real access patterns. → 13

**A time-boxed state machine (pooled overtime)**

- **Problem:** workers could apply/refuse a pooled-overtime shift only within a 2-hour window.
- **How I solved it:** a timeout utility + GraphQL **shield** rules that block the actions after the window expires, with a cron resetting state and full activity-log audit.
- **Takeaway:** enforce time-based business rules at the authorization layer, and keep an audit trail of the lifecycle. → 28, 17

**OLTP + OLAP via dual-write to BigQuery**

- **Problem:** analytics queries over millions of activity logs hurt the operational DB.
- **How I solved it:** dual-wrote activity logs to Postgres (operational) and **BigQuery** (analytics), reading warehouse data for reports.
- **Takeaway:** separate OLTP from OLAP; dual-write is one option (with its consistency cost). → 19, 32

**Feature flags / free-trial gating**

- **Problem:** trial accounts needed feature limits (max shifts/SMS, no new sites).
- **How I solved it:** company-level feature flags + config-driven thresholds enforced in shield rules.
- **Takeaway:** gate features with flags + server-side checks, never just by hiding UI. → 24, 11

---

## sms-reviews

_Apollo GraphQL · BullMQ (SMS platform)_

**Scheduled SMS via a queue layer**

- **Problem:** SMS had to be sent on schedules, reliably.
- **How I solved it:** a BullMQ scheduling layer (base queue + clock queue + workers) backed by Redis.
- **Takeaway:** for timed/recurring work, a real queue beats `setInterval` — it survives restarts and scales. → 14

**Safe template interpolation**

- **Problem:** user templates with placeholders risked injection / broken escaping.
- **How I solved it:** Handlebars with controlled **triple-brace** raw output only where intended, plus placeholder validation.
- **Takeaway:** treat templating as an injection surface; default to escaping, opt into raw deliberately. → 24

---

## smart-task-scheduler

_Express · BullMQ_

**Webhook-triggered background jobs**

- **Problem:** external systems needed to trigger jobs that run off the request path.
- **How I solved it:** webhook endpoints that enqueue BullMQ jobs, a separate worker process, and persistent job-run logs (`GET /logs`).
- **Takeaway:** decouple trigger from execution with a queue + worker; persist run history for observability. → 14, 10

---

## nova-erp-react

_React 19 · Ant Design · Zod (ERP frontend)_

🔥 **Cancelling in-flight requests on unmount (AbortController)**

- **Problem:** navigating away mid-request caused set-state-after-unmount warnings and wasted responses.
- **How I solved it:** a centralized `AbortController` map in the HTTP service + interceptors that abort on unmount and clean up on response/error.
- **Takeaway:** every fetch tied to a component should be cancellable; centralize it so it's automatic. → 03, 27

🔥 **Killing O(n)-per-keystroke in a 1000-route search**

- **Problem:** the command search re-flattened the whole navigation tree on every keystroke.
- **How I solved it:** memoized the flattened tree once and pre-built a link→route index in the provider.
- **Takeaway:** profile the hot path; memoize derived structures instead of recomputing per render/keystroke. → 04

**One pure hook for invoice math, reused on 41 pages**

- **Problem:** item discount → document discount → tax → totals was duplicated and error-prone.
- **How I solved it:** a single pure `useCalculateInvoiceTotals` hook composing the steps, reused across 41 transaction pages.
- **Takeaway:** extract complex domain math into a pure, tested unit and reuse it — don't reimplement per screen. → 04, 23

**Generic, column-selectable export**

- **Problem:** dozens of pages needed Excel export with selectable columns and the server's filename.
- **How I solved it:** a generic Blob-export modal that reads `Content-Disposition` for the filename and lets users pick header/detail columns, rolled out across ~46 pages.
- **Takeaway:** build the export as one reusable component; read the filename from the response, not the client. → 10, 04

---

## nova-hr-react

_React 18 · MUI · SignalR (HR ERP frontend)_

🔥 **Excel/CSV export that matches the visible columns**

- **Problem:** exports dumped _all_ columns, ignoring which ones the user had hidden.
- **How I solved it:** passed the table's hidden-columns set into the export payload builder so it filters to shown columns — applied across 15 report pages.
- **Takeaway:** export should reflect the on-screen view; thread UI state (visible columns, filters) into the export. → 04, 10

🔥 **Arabic-correct sorting + RTL fixes (i18n)**

- **Problem:** Arabic name columns sorted wrong and autocompletes rendered LTR in RTL mode.
- **How I solved it:** a locale-aware `arabicSortCompare` applied to 46+ columns and direction fixes for autocomplete.
- **Takeaway:** i18n is more than translation — collation and layout direction are real edge cases. → 29

🔥 **Virtualizing huge dropdowns (react-window)**

- **Problem:** autocompletes with thousands of employees froze the UI.
- **How I solved it:** a `VirtualizedListbox` (react-window) rendering only visible rows, with grouped items and dynamic heights.
- **Takeaway:** virtualize any list that can grow large; render what's visible, not the whole set. → 04

**App-wide error boundaries**

- **Problem:** one component crash blanked the whole app.
- **How I solved it:** error boundaries wrapping ~94 components with a fallback UI + error logging.
- **Takeaway:** isolate failures with boundaries so a single error degrades one panel, not the app. → 03

**Real-time notifications over SignalR**

- **Problem:** dashboards needed live updates.
- **How I solved it:** a SignalR connection managed through a React Context with reconnection handling.
- **Takeaway:** own the socket lifecycle (connect/reconnect/cleanup) in one place, expose it via context. → 15, 04

---

## rtx-operation-react & qp-express-react

_React · AG-Grid (logistics ops)_

🔥 **A slow export that timed out → push status over Socket.IO**

- **Problem:** exporting large order sets as a long HTTP request timed out.
- **How I solved it:** moved the export to a Socket.IO `start_export` event with the server pushing progress/status; also fixed the download to stream a Blob with the correct `.xlsx` extension.
- **Takeaway:** for long jobs, kick off async work and stream status instead of holding an HTTP request open. → 15, 27, 10

🔥 **Server-side pagination instead of fetching everything**

- **Problem:** the orders report pulled the entire dataset into the browser and filtered client-side.
- **How I solved it:** moved filtering/sorting/pagination to the server via query params, resetting the page on filter changes to avoid stale offsets.
- **Takeaway:** paginate and filter on the server for large datasets; keep page state coherent with filters. → 10, 04

**Robust bulk import + flexible search input**

- **Problem:** bulk order imports needed column validation; users pasted order IDs separated by commas/spaces/tabs.
- **How I solved it:** `readXlsxFile` schema validation that rejects bad/extra columns, and a `parseSerials()` helper that normalizes mixed separators and strips non-digits.
- **Takeaway:** validate imported files against a schema; be liberal in what you accept for search input. → 10

**Loading guards to prevent double-submit / wasted calls**

- **Problem:** users double-clicked actions and effects fired API calls on first render.
- **How I solved it:** disable buttons while a request is pending and skip the initial auto-fetch where it wasn't wanted.
- **Takeaway:** guard async actions with pending state; not every mount needs to fetch. → 16

---

## PTSware-Front

_React 18 · MUI · Redux Toolkit · i18next — POS system (built largely from scratch)_

🔥 **Advanced filter builder with a backend operator schema**

- **Problem:** client-side filtering wasn't enough — needed server-defined columns with type-aware operators (=, <, >, between, like), and the inputs kept losing focus on every keystroke.
- **How I solved it:** the server returns filter metadata; the dialog maps state by **UUID keys** (not array indices) so re-renders don't unmount inputs, with `useCallback`-memoized rows; operators are chosen by column type; DatePicker for ranges.
- **Takeaway:** stable keys are the fix for focus-loss in dynamic forms; drive filter UIs from server metadata. → 04, 10

🔥 **Cross-browser ticket-price sort bug**

- **Problem:** ticket ordering came out different across browsers.
- **How I solved it:** the sort comparator returned a boolean (`a > b`) instead of a number — changed it to `a - b`.
- **Takeaway:** `Array.sort` needs a numeric comparator; a boolean one is undefined-order. → 01, 20

**Store selection via request headers (multi-store)**

- **Problem:** a multi-store POS without putting the store in the URL.
- **How I solved it:** an axios interceptor injects `store_id` from a Redux slice (persisted to localStorage); a navbar dropdown switches stores and every call re-scopes immediately. → 17, 08

**POS draft-invoice flow in a custom hook**

- **Problem:** customer-switching, draft fetching, discount calc, and SweetAlert dialogs were tangled across components.
- **How I solved it:** a `usePosDraftInvoices` hook that centralizes the customer-change flow, Redux dispatch, and dialog orchestration. → 04

**Cash-session open/close with reconciliation**

- **Problem:** no formal cash-drawer tracking.
- **How I solved it:** open/close dialogs with opening/closing cash, a dedicated session API, and validation. → 16

**Full i18n + RTL (Arabic/English)**

- **Problem:** hardcoded English, no RTL.
- **How I solved it:** i18next with ar/en JSON, `document.dir` toggling, Cairo font for Arabic, a Redux language slice. → 29

---

## trust-react

_React 19 · Ant Design · AG-Grid · Leaflet — delivery-ops frontend (grew it from a prototype)_

🔥 **Dispatch hub aggregator (real-time ops view)**

- **Problem:** operators had no live coordination view of riders/trips/orders across hubs.
- **How I solved it:** a Dispatch page with store-grouped, status-tinted order/trip cards, a rider popup (shift mgmt, trip reassignment, live tracking via Leaflet), and elapsed-time timers. → 15, 04

🔥 **Permission matrix: superuser vs role, with bulk role edits**

- **Problem:** per-user tweaks couldn't override role defaults, and admin access mixed `is_superuser` and group checks.
- **How I solved it:** Users/Roles tabs; a role-permissions PATCH that replaces all users of a role (admin-only + confirm); route guards prioritize `is_superuser`, falling back to group. → 11, 24

**Batch order import with Zod validation**

- **Problem:** no bulk import; manual entry was the bottleneck.
- **How I solved it:** XLSX parse → field-level Zod schema → a modal listing violations by column; timestamp row-keys (no `crypto.randomUUID` on non-HTTPS); rider dropdown gated by store hub-owner status. → 10

**Field-level API error surfacing**

- **Problem:** errors nested in `details: { field: [msg] }` never reached the form fields.
- **How I solved it:** flattened that structure in a shared error util and rendered per-field hints. → 10, 08

**Trip-action modals lifted out of row renders (perf)**

- **Problem:** modals re-instantiated per table row caused thrash + stale data.
- **How I solved it:** lifted Assign-Orders / Assign-Rider / Route modals to page level with shared open + active-trip state. → 04

**State-machine guard on trip delete**

- **Problem:** trips could be deleted mid-delivery.
- **How I solved it:** a `DELETABLE_TRIP_STATUSES` allowlist gating the action before the API call. → 17

---

## mokambo-react

_React · Ant Design · TypeScript — POS (Frappe backend)_

🔥 **Parallel bootstrap with partial-failure recovery**

- **Problem:** loading categories/products/cities/payment-methods serially was slow and one failure stalled the whole boot.
- **How I solved it:** `Promise.allSettled` with per-result handling (fulfilled → setState, rejected → toast) so the app continues on partial data. → 07, 04

🔥 **Editable multi-payment table with a submit guard**

- **Problem:** split payments (cash + card) needed inline editing and "paid must equal outstanding."
- **How I solved it:** an Ant Table with `InputNumber` cells, the payment array in context, and a submit guard that rejects mismatches. → 04

**Discount engine (percentage vs fixed) with live totals**

- **Problem:** flexible discounts had to recompute totals + remaining amount in real time.
- **How I solved it:** `useMemo` watchers on form fields recompute totals; payment method defaults by invoice type. → 04

**Frappe error-type guards**

- **Problem:** Frappe error shapes differ from Axios (`exc_type` vs message) and crashed the toast.
- **How I solved it:** a `getErrorMessage` that discriminates Frappe vs Axios vs Network/Canceled errors. → 03

**Action-component composition**

- **Problem:** a 234-line monolith handled refund/print/email/edit/delete/add-rider.
- **How I solved it:** split each into its own action component owning its modal/API/loading. → 17, 04

**Shift open/close state machine**

- **Problem:** invoices must only submit within an open shift.
- **How I solved it:** OpenShift/CloseShift contexts; checkout guards on `openShiftId`; the close page reconciles shift payments. → 17

---

## shuhna-FE

_Next.js 14 · Ant Design · TypeScript — delivery platform (substantial contribution)_

🔥 **Bulk delivery upload with row-level validation**

- **Problem:** Excel imports of 1000+ deliveries needed per-row validation, zone lookups, and type-specific required fields before submit.
- **How I solved it:** XLSX parse → accumulate per-row errors → resolve zone IDs → enforce type rules (CRP/exchange need item counts; COD sign by type); errors reported by row number. → 10

🔥 **Flatten a 3-level cascade to kill re-render thrash**

- **Problem:** governorate→city→zone cascades (27 govs, 150+ cities) re-fetched on every change.
- **How I solved it:** one `zoneList()` call on mount, flattened via `extractZones()` into enriched display names and passed to all selects — removing 140+ lines of cascade logic. → 04

**Type-driven schema variation (delivery types)**

- **Problem:** CRP/send/exchange/cash-collection each need different fields, COD sign, and payload shape.
- **How I solved it:** a `getDeliveryBody()` builder + conditional fields keyed on the delivery type. → 02, 10

**Blob export with timestamped filenames**

- **Problem:** Excel/PDF exports must stream as files, not JSON.
- **How I solved it:** `responseType:'blob'` + a `downloadFile()` helper (Blob URL + anchor), filename stamped with dayjs; PDF capped at 100 selections. → 10

**Auth context + 401 interceptor lifecycle**

- **Problem:** stale cookie user info; logout didn't invalidate in-flight calls.
- **How I solved it:** an AuthProvider with lazy `fetchUserInfo`; a 401 response interceptor clears the token and redirects. → 11

**OTP-gated bank-info updates**

- **Problem:** bank/settlement detail changes need verification.
- **How I solved it:** a bank-info modal that generates + validates an OTP before create/update. → 11

---

## shuhna-admin-FE

_React · Ant Design · next-intl — delivery-platform admin SPA_

🔥 **Wallet settlement + live net calculation**

- **Problem:** operators reconcile cash-in/out per business and need net = COD − fees computed live when proposing a transaction.
- **How I solved it:** a `useMemo` reducer over selected deliveries renders a 3-line breakdown and auto-fills the amount. → 23

**Multi-type delivery payload composition**

- **Problem:** one form, 4 delivery types with different required fields/nesting.
- **How I solved it:** conditional sections keyed on a type watcher + a payload builder (exchange gets return details, send skips them). → 10

**Bulk status update via selection + modal**

- **Problem:** updating many deliveries one at a time.
- **How I solved it:** table row-selection → a status modal → a batch API → optimistic refresh. → 10

**Reusable button component (40+ files)**

- **Problem:** repeated variant/size/loading/icon button styling.
- **How I solved it:** a `ShuhnaButton` forwardRef wrapping Spin with conditional Tailwind classes. → 04

**RTL/LTR adaptive admin via next-intl**

- **Problem:** one app for Arabic (RTL) and English (LTR).
- **How I solved it:** next-intl + a `useTextDirection()` hook controlling flex/badge order; locale in a cookie. → 29

**Route debrief analytics**

- **Problem:** post-completion route review.
- **How I solved it:** a debrief page with animated stats (react-countup): success rate, pending tasks, total COD. → 19

---

## dynamic-sass-react

_React 19 · Ant Design 6 · TypeScript — multi-tenant SaaS dashboard_

🔥 **JWT refresh + AbortController request dedup**

- **Problem:** transparent token refresh on 401, and duplicate in-flight requests under poor networks.
- **How I solved it:** an HTTPService base class with request dedup (AbortController per method+url+params) and an auto-refresh retry gate. → 27, 11

🔥 **Generic Entity service (typed CRUD)**

- **Problem:** per-entity CRUD boilerplate everywhere.
- **How I solved it:** an `EntityService<T, Create, Update>` base; subclasses set the endpoint and add domain methods (`inviteMember`, `checkAvailability`). → 02, 17

**`useApiSettled` batch hook**

- **Problem:** batched calls needed per-result error handling without cascading failure.
- **How I solved it:** a hook wrapping `Promise.allSettled` with type-safe settlement mapping + i18n errors. → 07

**Debounced subdomain availability + auto-slug**

- **Problem:** real-time subdomain check without hammering the API; auto-fill subdomain from name.
- **How I solved it:** `Form.useWatch` + 400ms debounce → `checkAvailability`; `slugify(name)` sets the subdomain. → 27

**Multi-step tenant creation with reactive plan fetch**

- **Problem:** the plan list depends on product + billing interval.
- **How I solved it:** a Steps modal with `Form.useWatch` driving conditional plan fetch and a gated Next button. → 04

**Generic `<DataTable>` pagination abstraction**

- **Problem:** server-side pagination duplicated per page.
- **How I solved it:** a reusable table taking `tableParams` + `onTableParamsChange`, reused across all lists. → 04

---

## jolie-stores

_Next.js · TypeScript — e-commerce frontend_

🔥 **Pre-checkout cart validation (price/stock integrity)**

- **Problem:** the cart could desync from backend pricing/stock before payment.
- **How I solved it:** a `validateCart()` call on checkout mount comparing each item (price/qty/stock) to fresh backend state and surfacing mismatches. → 10, 23

**Env-based CDN image URL resolution**

- **Problem:** image URLs hardcoded across 7+ components.
- **How I solved it:** a `getImageUrl()` util that prefixes paths with a `PUBLIC_BASE_URL` env var, unifying all image calls. → 18

**Next/Image LCP optimization**

- **Problem:** hero/gallery images shifted layout and hurt LCP.
- **How I solved it:** fixed gallery heights per breakpoint, `priority` on the LCP image, `object-cover` for aspect ratio. → 27, 04

**Safe rich product descriptions**

- **Problem:** backend HTML descriptions rendered as plain text.
- **How I solved it:** `html-react-parser` to render sanitized HTML. → 24

**Configurable offer pricing**

- **Problem:** strikethrough markup duplicated/hardcoded.
- **How I solved it:** an `OFFER_PERCENT` env constant applied consistently across cards. → 04

---

## rtx-customer-react

_React · MUI — customer-facing logistics_

🔥 **Token expiry + auth recovery across 8+ endpoints**

- **Problem:** silent failures when the JWT expired mid-session.
- **How I solved it:** a centralized 401 handler — toast the backend message, clear localStorage, redirect to login after a delay. → 11

**Dual-mode pagination (client vs server)**

- **Problem:** pagination/filters broke past 200 orders.
- **How I solved it:** a `GeneralTable` supporting client slicing or server pagination via an `apiPagination` flag. → 10

**Redux table-state centralization (6+ pages)**

- **Problem:** table data in scattered local state was lost on refresh.
- **How I solved it:** moved table data/count/cursor into Redux, synced across pages, cleared on route change. → 05

**Arabic/Persian numeral normalization on import**

- **Problem:** Excel imports broke when users typed Arabic-Indic digits.
- **How I solved it:** detect + convert Arabic/Persian digits to Western via a lookup map before processing. → 29

**Shopify integration (store mgmt + order import)**

- **Problem:** no Shopify store/order import.
- **How I solved it:** new routes + APIs for stores and `import_orders`, with lazy-loaded pages. → 10

---

## bensalman-react

_React 18 · Redux Toolkit · WebSocket · Ant Design — restaurant chair-reservation + kitchen ordering_

🔥 **Real-time kitchen status over WebSocket**

- **Problem:** kitchen staff need live order-status without polling.
- **How I solved it:** a WebSocket `/status` connection that parses typed payloads and atomically updates orders/statuses/products in Redux, with error fallback. → 15

🔥 **Per-item loading state in the cart**

- **Problem:** items can be modified concurrently; the whole cart shouldn't block.
- **How I solved it:** a `loading: string[]` in the cart slice (push/splice item names across the thunk lifecycle) to disable only that item's controls. → 05, 04

**Optimistic quantity updates**

- **Problem:** +/- buttons must feel instant despite async APIs.
- **How I solved it:** update qty locally immediately, debounce the API, then sync cart totals from the response. → 04

**Axios interceptors for auth + global 401 logout**

- **Problem:** every call needs the token; a 401 should log out globally.
- **How I solved it:** a request interceptor injects the token; a response interceptor dispatches `logout` on 401. → 11

**Multi-chair reservation + reassignment**

- **Problem:** primary reservation vs guest invite, and swapping chairs without a reload.
- **How I solved it:** an `invite` flag on the API + a reassignment modal that re-fetches chairs and lifts state back to the parent. → 17

---

## portfolio

_React 18 · TypeScript · Vite — personal portfolio (from scratch)_

🔥 **Type-safe project filtering (MixItUp)**

- **Problem:** 30+ projects across 7 categories needed filtering + dynamic counts.
- **How I solved it:** union types for 53 tags + a filter enum + a strict `SingleProject` interface; MixItUp via `useRef`/`useEffect`; counts via `.filter().includes()`. → 02, 04

**Dark mode via Context + localStorage**

- **Problem:** a theme toggle with persistence and a stable context value.
- **How I solved it:** a ThemeContext (useCallback/useMemo) hydrating from localStorage and toggling a `body.dark` class. → 04

**Native lazy-loading + LCP**

- **Problem:** large hero/thumbnails blocked LCP.
- **How I solved it:** native `loading="lazy"` + webp-with-jpg-fallback + a priority hint on the avatar (dropped the lazy-load library). → 27

**SEO + GA4 + a11y suite**

- **Problem:** invisible to social crawlers; accessibility gaps.
- **How I solved it:** OG/Twitter/canonical meta + robots.txt/sitemap.xml, GA4 via env var, ARIA-live + labels on the contact form. → 27, 29

**TS strict + tooling**

- **Problem:** type safety + dead code.
- **How I solved it:** `strict`, `noUnusedLocals/Parameters`, ESLint; migrated defaultProps → JS defaults. → 02

---

## nft

_Next.js 14 · Chakra UI · TypeScript — NFT marketplace (from scratch)_

**Dynamic `[id]` product pages with async states**

- **Problem:** parametrized product pages with loading/error/success.
- **How I solved it:** a Next App-Router dynamic route + a `'use client'` component with a 3-state render. → 06

**Reusable countdown timer (no leaks)**

- **Problem:** real-time auction countdowns without memory leaks.
- **How I solved it:** a Timer using `useEffect` cleanup + date arithmetic. → 03

**Theme/config via provider**

- **Problem:** enforce dark mode + button defaults app-wide.
- **How I solved it:** Chakra `extendTheme` (default color mode, button colorScheme, container width). → 04

**Metadata template system**

- **Problem:** per-page titles with a shared prefix.
- **How I solved it:** the Next Metadata API `template: 'NFT | %s'` with per-page overrides. → 06, 27

---

## cad4ever · whats-ad-react · claw-code

_smaller / specialized projects_

- **cad4ever** _(React · Mantine — CAD marketplace)_ — product-detail pages with **syntax highlighting** (`react-syntax-highlighter`), hover image-swap, a `useHelmet` SEO hook, embla carousel tuning, lazy routes via Suspense. → 27, 04
- **whats-ad-react** _(React · Ant Design — WhatsApp/SMS bulk-campaign CRUD)_ — **per-phone process tracking** with `useMemo` status aggregation, bilingual (AR/EN) locales, template-download for imports, protected routes + AuthContext, a centralized Axios/CRUD client with 404-HTML detection + i18n errors. → 10, 11
- **claw-code** _(Rust — AI-agent harness)_ — a port of an agent runtime: a **Vim modal editor** (crossterm), an **LSP client** (stdio), an **axum SSE** server for session streaming, git slash-commands (libgit2), **sandboxed tool execution** (Linux namespaces/seccomp), MCP stdio + plugin hooks, and an OAuth provider abstraction. _(Systems/Rust breadth — not MERN, but shows depth.)_ → 19, 30

---

## Scenarios by skill (quick revision)

| Skill                       | Study these scenarios                                                                |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Multi-tenancy               | pharmacy-fefo (AsyncLocalStorage + Prisma extension)                                 |
| Idempotency / retries       | pharmacy-fefo (Redis key), fintech-orders-task (event dedup), hirely (export keys)                |
| Queues / background jobs    | pharmacy-fefo (digest), hirely (pdf/email), sms-reviews (cron), smart-task-scheduler |
| DB indexing / query perf    | pharmacy-fefo (FEFO index), shift-swap (28 indexes), ramify (N+1)                    |
| Transactions / concurrency  | trust-node (invoice assignment), foody (order state machine)                         |
| Data export (Excel/CSV/PDF) | foody, nova-hr (visible columns), nova-erp (generic), rtx (Socket.IO), shuhna (AWB)  |
| Caching & resilience        | ramify (graceful degradation)                                                        |
| Geospatial                  | trust-node (PostGIS)                                                                 |
| Money / decimals            | foody, ramify, shuhna (wallet ledger)                                                |
| Event-driven / OLAP         | fintech-orders-task (Kafka), shift-swap (BigQuery dual-write)                                     |
| Frontend performance        | nova-erp (AbortController, memo nav), nova-hr (virtualization, boundaries)           |
| i18n / RTL                  | nova-hr (Arabic sort)                                                                |
| Architecture / DDD          | hirely (arch-check), trust-node (service layer)                                      |
