# Predicted Interview Questions — Back-end Role (NestJS · MongoDB · Next.js · Docker) (124 questions)

> **How to use this:** This is your morning-of revision sheet. Read each question, then say the answer **out loud** before reading mine — recall beats re-reading. Don't memorize word-for-word; memorize the _shape_ of the answer and connect it to your real projects (Foody, Pharmacy FEFO, CineBite, Nova ERP). Keep answers tight in the room — give the crisp version, then ask "want me to go deeper?"
>
> **What this interviewer emphasized:** back-end architecture (NestJS/Node), professional MongoDB + Next.js integration, **SECURITY**, **fast data response/performance**, and **CLEAN CODE**. Weight your prep there.
>
> **Convention:** 🔥 = highest-probability question. If you only have limited time, drill every 🔥 first.

---

## How This Round Will Likely Flow

A one-hour online technical with the Tech Manager will probably go:

1. **Intro / CV walk-through (5-10 min)** — "Tell me about yourself", walk through a project. _Tip: have a 60-sec pitch ending in "back-end focused, NestJS + Mongo". Pick ONE project to go deep on (CineBite or Nova ERP) and steer questions there._
2. **Back-end / NestJS (15 min)** — the core. DI, modules, guards/pipes, structure. _Tip: be concrete, name decorators._
3. **MongoDB (10-15 min)** — modeling, embed vs reference, indexes, aggregation, performance. _Tip: this is where "fast data response" lives — always mention indexes._
4. **Small live-coding / design task (10-15 min)** — likely a CRUD resource, a schema design, an aggregation, or a JWT-guarded route. _Tip: clarify requirements first, think aloud, mention validation + security unprompted._
5. **Next.js integration (5-10 min)** — SSR/SSG, how the front talks to the Nest API. _Tip: keep it back-end-flavored — env-based base URL, cookies, CORS._
6. **Security & clean code (5-10 min)** — they stressed both. _Tip: drop "fintech = security-critical" naturally._
7. **Your questions (5 min)** — always have 3 ready.

---

## 🔥 Top 15 Most Likely Questions (quick-fire)

1. 🔥 **Tell me about yourself / a project you built.** → 60-sec pitch: mid-level full-stack, back-end focused, MERN + NestJS; deep-dive CineBite/Nova ERP; end on "I care about clean, secure, performant APIs."
2. 🔥 **Why NestJS over plain Express?** → Opinionated structure, built-in DI, TypeScript-first, modules, decorators, testability — scales cleanly in teams. Express is unopinionated; you reinvent structure.
3. 🔥 **Explain Dependency Injection in Nest.** → You declare deps in the constructor; Nest's IoC container instantiates and injects them (singletons by default). Decouples classes, makes testing/mocking trivial.
4. 🔥 **Embed vs reference in MongoDB — how do you decide?** → Embed when data is read together, owned by parent, bounded (1-to-few). Reference when shared, unbounded, or queried independently. Mantra: "data accessed together is stored together."
5. 🔥 **How do indexes speed up queries?** → They're a B-tree so Mongo seeks instead of doing a COLLSCAN. Index fields in query filters/sorts. Verify with `.explain()` — want `IXSCAN`, not `COLLSCAN`.
6. 🔥 **Guard vs Interceptor vs Pipe vs Middleware vs Filter?** → Middleware: pre-route. Guard: authZ (can this request proceed?). Pipe: transform/validate input. Interceptor: wrap before/after (logging, transform response). Filter: catch exceptions.
7. 🔥 **How do you secure a Nest endpoint?** → `ValidationPipe` (whitelist) on DTOs, `JwtAuthGuard` + `RolesGuard`, never trust client input, parameterize queries, rate-limit, HTTPS. Fintech → defense in depth.
8. 🔥 **Where do you store JWTs?** → **httpOnly, Secure, SameSite cookie** — not localStorage (XSS-readable). Short-lived access token + refresh token rotation.
9. 🔥 **How do you prevent NoSQL injection in Mongo?** → Validate/cast types via DTOs + `ValidationPipe`, never pass raw req body into a query operator position; an object like `{ $gt: "" }` where a string is expected is the classic attack. Use Mongoose schema types.
10. 🔥 **What's the Node event loop (briefly)?** → Single-threaded; non-blocking I/O offloaded to libuv thread pool/OS; callbacks queued and run when the stack is clear. Great for I/O-bound, bad for CPU-bound.
11. 🔥 **`populate()` — what's the cost?** → It's a convenience that does extra queries (an extra round trip per populated path) — like a JOIN done app-side. Fine for small sets; for hot paths consider embedding or `$lookup`. Add `.lean()` when you don't need Mongoose docs.
12. 🔥 **Name a SOLID principle with an example.** → Single Responsibility: a controller handles HTTP, a service handles business logic, a repository handles data — don't mix. Or Dependency Inversion: depend on an interface/token, inject the impl.
13. 🔥 **How do you paginate, and why is `skip` slow at scale?** → `skip` still scans+discards skipped docs, so deep pages get slow. Use **cursor/keyset pagination**: `find({ _id: { $gt: lastId } }).limit(n)`.
14. 🔥 **How do you handle money in Mongo?** → **Decimal128**, never floats (binary floating point can't represent 0.1 exactly). In Mongoose: `type: mongoose.Schema.Types.Decimal128`.
15. 🔥 **How do you keep code clean?** → Layering (controller/service/repo), DTOs + validation at the boundary, small single-purpose functions, meaningful names, consistent error handling via filters, tests. Refactor when you touch it.

---

## NestJS (deep — the main back-end)

1. 🔥 **Why NestJS over Express?** → Structure + DI + TS out of the box; modules enforce boundaries; decorators make code declarative; first-class testing. Built _on top of_ Express (or Fastify), so you keep the ecosystem.
2. 🔥 **What is a Module?** → A class with `@Module({ imports, controllers, providers, exports })` that groups related features and defines DI scope. App = a tree of modules (`AppModule` root). Export a provider to share it.
3. 🔥 **What is a Provider / Service?** → Any class Nest can inject (`@Injectable()`). Services hold business logic; controllers stay thin and just translate HTTP ↔ service calls.
4. 🔥 **What does a Controller do?** → Handles routing & HTTP. `@Controller('users')` + `@Get()/@Post()` + param decorators (`@Body()`, `@Param()`, `@Query()`). Should contain _no_ business logic.
5. 🔥 **Explain DI and how Nest resolves it.** → IoC container reads constructor types/tokens, instantiates the dependency graph, injects singletons by default. You never `new` a service.
6. 🔥 **Request lifecycle order?** → Middleware → Guards → Interceptors (pre) → Pipes → **Route handler** → Interceptors (post) → Exception filters (on error). Knowing this order impresses.
7. 🔥 **Guards vs Interceptors vs Pipes vs Middleware vs Filters?** (see Top-15 #6) → Add: middleware is Express-style and runs first/lowest-level; guards return boolean for authZ; pipes transform+validate; interceptors use RxJS to wrap; filters centralize error responses.
8. 🔥 **ValidationPipe & DTOs?** → DTO is a class with `class-validator` decorators (`@IsEmail()`, `@IsInt()`). Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` strips unknown props and coerces types — also a security control.
   ```ts
   export class CreateUserDto {
     @IsEmail() email: string;
     @MinLength(8) password: string;
   }
   ```
9. **Injection scopes?** → `DEFAULT` (singleton, shared), `REQUEST` (new instance per request — use sparingly, perf cost), `TRANSIENT` (new instance per consumer).
10. 🔥 **How do you handle exceptions?** → Throw `HttpException` subclasses (`NotFoundException`, `BadRequestException`); Nest's built-in filter maps them to status codes. For cross-cutting shaping, write a global `@Catch()` exception filter.
11. 🔥 **How do you structure a Nest project?** → Feature modules (`users/`, `auth/`, `orders/`), each with controller/service/dto/schema. Keep business logic in services, optionally a repository layer to isolate Mongoose. `common/` for guards/filters/pipes, `config/` for env. Clean architecture = dependencies point inward.
12. 🔥 **JWT auth in Nest with Passport?** → `@nestjs/passport` + `passport-jwt`. A `JwtStrategy` validates the token and returns the user (attached to `req.user`); a `JwtAuthGuard` (`AuthGuard('jwt')`) protects routes. `JwtModule` signs tokens with a secret from config.

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('reports') getReports() {}
```

13. 🔥 **Mongoose integration in Nest?** → `MongooseModule.forRoot(uri)` once; per feature `MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])`; inject with `@InjectModel(User.name) private model: Model<UserDocument>`. Define schemas with `@Schema()`/`@Prop()`.
14. **Config management?** → `@nestjs/config` (`ConfigModule.forRoot({ isGlobal: true })`), read with `ConfigService.get()`. Validate env vars with a Joi schema at boot so the app fails fast on misconfig. Never hardcode secrets.
15. **How do you test a Nest service?** → `Test.createTestingModule({ providers: [Service, { provide: getModelToken(User.name), useValue: mockModel }] })`, then assert. DI makes mocking the model trivial — that's a selling point of Nest.
16. **How do you do role-based access?** → Custom `@Roles()` decorator sets metadata; `RolesGuard` reads it via `Reflector` and compares to `req.user.roles`.
17. **When would you use CQRS?** (you used it in CineBite) → When read and write models diverge enough that combining them hurts clarity/scale — separate Commands (writes) and Queries (reads), often with `@nestjs/cqrs`. Overkill for simple CRUD; I reached for it when the write side had complex domain logic.
18. **What are custom decorators / `@Param` extractors?** → `createParamDecorator` to pull e.g. `@CurrentUser()` off the request — keeps controllers clean.

---

## MongoDB & Mongoose (deep — their database)

1. 🔥 **SQL vs NoSQL — when do you pick Mongo?** → Mongo for flexible/evolving schemas, hierarchical/document-shaped data, high write throughput, horizontal scaling. SQL for strong relational integrity and complex multi-table transactions. In fintech, ledgers often want SQL guarantees — be honest that it's case-by-case.
2. 🔥 **How do you model documents?** → Model around _access patterns_, not entities. Ask "what queries run most?" and shape docs so a screen = ideally one query.
3. 🔥 **Embed vs reference?** (see Top-15 #4) → Embed: 1-to-few, read together, bounded (e.g. address in user). Reference: many/shared/unbounded, queried alone (e.g. orders → user). Avoid unbounded arrays (the 16MB doc limit).
4. 🔥 **How do indexes work / when to add?** → B-tree enabling `IXSCAN` instead of `COLLSCAN`. Index fields used in filters, sorts, and uniqueness. Cost: slower writes + storage, so don't over-index. Confirm with `.explain("executionStats")`.
5. 🔥 **Compound indexes & ESR rule?** → Order fields **Equality → Sort → Range**. e.g. query `status = X`, sort by `createdAt`, range on `amount` → index `{ status: 1, createdAt: 1, amount: 1 }`. Index prefixes can serve multiple queries.
6. 🔥 **Aggregation pipeline — explain with an example.** → A staged data-processing pipeline; each stage transforms the stream. Push `$match` (and `$sort` that can use an index) as early as possible.
   ```js
   db.orders.aggregate([
     { $match: { status: "paid" } },
     { $group: { _id: "$userId", total: { $sum: "$amount" } } },
     { $sort: { total: -1 } },
     { $limit: 10 },
   ]);
   ```
7. 🔥 **`populate()` and its cost?** (see Top-15 #11) → App-side join via extra queries; convenient but watch hot paths and N+1. Alternatives: embed, or server-side `$lookup`.
8. 🔥 **What does `.lean()` do?** → Returns plain JS objects instead of hydrated Mongoose documents — skips getters/setters/change-tracking → much faster + less memory. Use for read-only endpoints. Trade-off: no `.save()`/virtuals.
9. **Transactions in Mongo?** → Multi-document ACID via sessions on a replica set: `session.startTransaction()` … `commitTransaction()`. Use for money transfers (debit + credit must both succeed). In Mongoose pass `{ session }` to each op.
10. **Schema validation?** → Two layers: Mongoose schema (`required`, `enum`, `min/max`, types) at app level, and optional JSON-Schema validation at the DB level (`$jsonSchema`) as a safety net.
11. 🔥 **Design a schema for [feature], e.g. a portfolio of holdings.** → `User` doc; `Holding` collection referencing `userId`, with `{ symbol, quantity: Decimal128, avgCost: Decimal128, updatedAt }`; index `{ userId: 1, symbol: 1 }` unique. Embed only if holdings are small & always read with the user. _(Ask which access pattern matters before answering.)_
12. 🔥 **How do you fix a slow query / N+1?** → 1) `.explain()` to find COLLSCAN, 2) add the right index, 3) `.lean()` + project only needed fields, 4) replace per-item lookups with one `$in` query or `$lookup`, 5) paginate.
13. 🔥 **Pagination & why is `skip` slow?** (see Top-15 #13) → `skip(n)` walks and discards n docs → O(n). Keyset/cursor: `find({ _id: { $gt: lastSeenId } }).sort({_id:1}).limit(20)` → O(limit).
14. **Mongoose middleware / hooks — example?** → `pre('save')` to hash a password before persisting; `pre('find')` to soft-delete-filter. Keep cross-cutting persistence concerns here.
    ```ts
    UserSchema.pre("save", async function () {
      if (this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 12);
    });
    ```
15. 🔥 **Decimal128 for money?** (see Top-15 #14) → Avoids float rounding errors; mandatory in fintech. Convert at the edges; do arithmetic carefully (cast to a decimal lib or store integer cents as an alternative).
16. **Projection — why bother?** → Return only needed fields (`find(filter, { name: 1 })`) → less network + memory, and avoids leaking sensitive fields (e.g. `password`, `__v`).
17. **Replica set vs sharding?** → Replica set = copies for HA/read scaling/failover. Sharding = horizontal partitioning by shard key for write/storage scale. Most apps start with a replica set.
18. **`findOneAndUpdate` atomicity / `$inc`?** → Single-doc ops are atomic; use `$inc`/`$set` operators instead of read-modify-write to avoid race conditions (e.g. decrement stock).

---

## Next.js (frontend integration — back-end dev still asked)

1. 🔥 **SSR vs SSG vs ISR vs CSR — when each?** → SSG: build-time, static/marketing pages. SSR: per-request, personalized/SEO + fresh data. ISR: static + periodic regeneration (`revalidate`). CSR: dashboards behind auth where SEO doesn't matter. Pick by freshness vs performance.
2. 🔥 **App Router vs Pages Router?** → App Router (`app/`) is the modern default: React Server Components, nested layouts, streaming, `fetch` caching. Pages Router (`pages/`) uses `getServerSideProps`/`getStaticProps`. New work → App Router.
3. 🔥 **Server vs Client Components?** → Server Components (default) run on the server, can hit the DB/API directly, ship zero JS, keep secrets safe. Client Components (`"use client"`) for state/effects/browser APIs/event handlers. Push interactivity to the leaves.
4. 🔥 **Data fetching in App Router?** → `async` Server Component with `await fetch(url, { cache, next: { revalidate } })`, or call services directly. Caching is controlled per-fetch.
5. 🔥 **How does a Next.js frontend talk to a NestJS API?** → REST over an env-based base URL (`process.env.NEXT_PUBLIC_API_URL` for client, a private var for server-side). Auth via httpOnly cookies (sent automatically) or Bearer tokens. Configure **CORS** on Nest to allow the front-end origin with credentials.
6. 🔥 **Where do you put secrets in Next.js?** → Server-only env vars (no `NEXT_PUBLIC_` prefix) — those never reach the browser. `NEXT_PUBLIC_*` is inlined into the client bundle, so only public values. Call third-party secret APIs from Server Components/route handlers, never the client.
7. **Caching in Next.js?** → App Router caches `fetch` by default; control with `cache: 'no-store'` (dynamic) or `next: { revalidate: 60 }` (ISR-style). `revalidatePath`/`revalidateTag` to invalidate.
8. 🔥 **Why Next.js over plain React?** → SSR/SSG for SEO + faster first paint, file-based routing, built-in API/route handlers, image/font optimization, code-splitting, Server Components. CRA-style React is client-only with no SSR.
9. **Route Handlers / Server Actions?** → `app/api/.../route.ts` for REST-ish endpoints; Server Actions for mutations from components without a manual API call. As a back-end dev: useful for a BFF layer, but the real domain API stays in Nest.
10. **Hydration — what is it & a common bug?** → Server-rendered HTML gets "hydrated" with JS to become interactive; mismatches (e.g. `Date.now()`/`window` during render) cause hydration errors. Keep server/client render deterministic.

---

## Node.js (fundamentals)

1. 🔥 **Explain the event loop concisely.** → Single JS thread; libuv handles async I/O off-thread; completed callbacks are queued in phases (timers, I/O, check) and run when the call stack is empty. Microtasks (Promises) run between phases.
2. 🔥 **Sync vs async / non-blocking?** → Blocking ops stall the single thread → everyone waits. Non-blocking I/O lets Node serve many concurrent requests. Never do heavy sync work in a request path.
3. **Why is Node good for I/O-bound work?** → Cheap concurrency: thousands of waiting I/O ops without thread-per-request overhead. Ideal for API gateways, real-time, CRUD-over-DB — exactly this stack.
4. 🔥 **Handling CPU-bound work?** → Offload to `worker_threads`, a child process, or an external service/queue — otherwise it blocks the loop and tanks latency for all requests.
5. **Streams — what & why?** → Process data in chunks instead of buffering it all (files, HTTP, uploads). Lower memory, backpressure handled. `pipe()` to chain.
6. 🔥 **How do you scale Node?** → It's single-threaded, so run multiple instances: `cluster`/PM2 per CPU core, plus horizontal scaling behind a load balancer. Keep the app **stateless** (sessions/JWT in token or shared store) so any instance can serve any request.
7. **Error handling in async code?** → `try/catch` around `await`; never swallow; propagate to Nest's exception filter. Handle `unhandledRejection`. Don't leave promises unawaited.
8. **Common perf pitfalls?** → Sync calls in hot paths, no DB indexes, N+1 queries, oversized payloads (no projection/pagination), no caching, memory leaks from unbounded caches/listeners.

---

## Architecture & Clean Code (they stressed this)

1. 🔥 **What is SOLID? Name one with an example.** → **S**RP, **O**pen/closed, **L**iskov, **I**nterface segregation, **D**ependency inversion. Example (DIP): services depend on injected abstractions, not concretes — Nest's DI is DIP in practice. (SRP example in Top-15 #12.)
2. **DRY / KISS / YAGNI?** → DRY: one source of truth, extract repetition. KISS: simplest thing that works. YAGNI: don't build for imagined futures. Balance — premature abstraction violates KISS.
3. 🔥 **Separation of concerns / layering?** → Controller (HTTP) → Service (business logic) → Repository/Model (data). Each layer testable in isolation; swapping the DB shouldn't touch controllers.
4. 🔥 **How do you keep a codebase clean?** → Consistent structure & naming, lint/format (ESLint+Prettier), small functions, DTOs at boundaries, centralized error handling, code reviews, tests, refactor as you go (boy-scout rule).
5. 🔥 **Error-handling strategy?** → Throw typed exceptions in services; a global filter maps them to consistent JSON ({ statusCode, message, error }); log with context; never leak stack traces/internal details to clients (security).
6. **Why DTOs + validation?** → Define and enforce the contract at the edge; reject bad input early; decouple API shape from DB schema; double as documentation and a security boundary.
7. **Naming conventions?** → Intention-revealing, no abbreviations, verbs for functions/nouns for things, consistent casing. `getActiveUsers()` beats `getData2()`.
8. 🔥 **When do you refactor?** → When adding a feature is hard, on duplication (rule of three), or when reviewing reveals smells — but behind tests, and not mixed into unrelated feature commits.
9. 🔥 **How would you structure a new feature/module?** → Generate a module; add controller + service + DTOs + Mongoose schema; wire `forFeature`; add validation, guards, tests; keep it self-contained and exported only if shared.
10. 🔥 **REST API design basics?** → Nouns/plural resources (`/users/:id/orders`), HTTP verbs for actions, correct status codes (200/201/204/400/401/403/404/409/422/500), versioning (`/v1`), pagination, consistent error shape.
11. **Status codes you'd actually use?** → 200 OK, 201 Created, 204 No Content, 400 bad input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict (dup), 422 validation, 429 rate-limited, 500 server error.
12. 🔥 **How do you review code?** → Correctness first, then security (input/authz/secrets), then readability/naming, tests, and edge cases. Be kind, ask questions, suggest don't demand.

---

## Security (they stressed this — condensed; see `24-security-deep-dive.md` for depth)

1. 🔥 **How do you validate input?** → DTOs + `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` — type-coerce, strip unknown fields, reject extras. Validate at the boundary, never trust the client.
2. 🔥 **NoSQL injection — what & prevention?** → Attacker sends an operator object (`{ $ne: null }`, `{ $gt: "" }`) where a value is expected, bypassing checks. Prevent: validate/cast types via DTOs, enforce Mongoose schema types, never spread raw `req.body` into a query.
3. 🔥 **Authentication vs authorization?** → AuthN = _who are you_ (login, verify JWT). AuthZ = _what can you do_ (roles/permissions, `RolesGuard`). Different layers.
4. 🔥 **JWT handling & where to store tokens?** → Short-lived signed access token + refresh token; store in **httpOnly + Secure + SameSite cookies**, not localStorage. Validate signature & expiry server-side; rotate refresh tokens; keep the secret in env.
5. 🔥 **Password hashing?** → `bcrypt` (or argon2) with a salt and a sane cost factor (~12). Never store plaintext, never MD5/SHA-1, never encrypt-reversibly. Hash in a `pre('save')` hook.
6. 🔥 **Common OWASP risks you guard against?** → Broken access control, injection, broken auth, sensitive-data exposure, security misconfig. Mitigate: authz on every route, validation, hashing, HTTPS, secrets in env, `helmet`, rate limiting, CORS allow-list.
7. 🔥 **How do you secure a Nest endpoint?** (see Top-15 #7) → Guard (JWT + roles) + ValidationPipe + projection (don't leak fields) + rate limit + audit log for sensitive actions.
8. **Secrets management?** → Env vars (`@nestjs/config`), validated at boot; never commit `.env`; use a vault/secret manager in prod; rotate; never log secrets or send them to the client.
9. 🔥 **Why does security matter extra in fintech?** → Money + PII + regulatory exposure; a breach is financial and legal, not just reputational. So: least privilege, audit trails, encryption in transit & at rest, idempotency on money ops, defense in depth.
10. **Other quick wins?** → `helmet` for headers, rate limiting (`@nestjs/throttler`), CSRF protection for cookie auth, dependency scanning (`npm audit`), no verbose error leaks.

---

## Docker (named in the job stack)

1. 🔥 **What problem does Docker solve?** → "Works on my machine" — packages app + deps + runtime into a portable image that runs identically anywhere (dev, CI, prod).
2. 🔥 **Image vs container?** → Image = immutable blueprint (layers). Container = a running instance of an image. One image → many containers.
3. **Dockerfile basics?** → `FROM`, `WORKDIR`, `COPY package*.json`, `RUN npm ci`, `COPY . .`, `RUN build`, `EXPOSE`, `CMD`. Copy lockfile first so the `npm ci` layer caches.
4. 🔥 **Multi-stage builds — why?** → Build in a fat stage (toolchain, devDeps), copy only the compiled `dist` + prod `node_modules` into a slim runtime image → smaller, faster, fewer vulnerabilities (no build tools in prod).

   ```dockerfile
   FROM node:20-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS prod
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY --from=build /app/dist ./dist
   USER node
   CMD ["node", "dist/main.js"]
   ```

5. 🔥 **docker-compose for local dev (app + Mongo)?** → One file spins up the Nest app + MongoDB together with a shared network; env vars wire them.
   ```yaml
   services:
     api:
       build: .
       ports: ["3000:3000"]
       environment:
         MONGO_URI: mongodb://mongo:27017/app
       depends_on: [mongo]
     mongo:
       image: mongo:7
       volumes: ["mongo-data:/data/db"]
   volumes: { mongo-data: {} }
   ```
6. **Volumes — why?** → Persist data outside the container's writable layer so it survives restarts/rebuilds (Mongo data lives in a named volume).
7. 🔥 **Why containerize a Node app?** → Reproducible builds, easy onboarding, parity dev↔prod, simple horizontal scaling/orchestration (k8s), isolated deps.
8. 🔥 **Why run as non-root?** → Limits blast radius if the container is compromised. `USER node` in the Dockerfile. Also: pin base image versions, use slim/alpine, scan images.

---

## Likely Live-Coding / Practical Tasks (approach + sketches)

> **Always:** clarify requirements → state assumptions → think aloud → handle edge cases → mention validation + security unprompted → mention how you'd test it.

1. 🔥 **Build a CRUD REST resource in NestJS.** → Controller + service + DTOs + Mongoose schema; ValidationPipe; proper status codes; service throws `NotFoundException`.
   ```ts
   @Controller("products")
   export class ProductsController {
     constructor(private svc: ProductsService) {}
     @Post() create(@Body() dto: CreateProductDto) {
       return this.svc.create(dto);
     }
     @Get() findAll(@Query() q: PageDto) {
       return this.svc.findAll(q);
     }
     @Get(":id") findOne(@Param("id") id: string) {
       return this.svc.findOne(id);
     }
     @Patch(":id") update(
       @Param("id") id: string,
       @Body() dto: UpdateProductDto,
     ) {
       return this.svc.update(id, dto);
     }
     @Delete(":id") @HttpCode(204) remove(@Param("id") id: string) {
       return this.svc.remove(id);
     }
   }
   ```
2. 🔥 **Write an aggregation (totals / group-by).** → `$match` → `$group` (`$sum`) → `$sort` → `$limit`. (See MongoDB #6.) Mention pushing `$match` first and indexing the match field.
3. 🔥 **Model a schema for a given feature.** → Ask access patterns first; decide embed vs reference; add indexes; use Decimal128 for money; show the `@Schema()`/`@Prop()` class.
4. 🔥 **JWT-protected route + role guard.**
   ```ts
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
   @Get('audit') getAudit(@CurrentUser() user) { return this.svc.audit(); }
   ```
5. 🔥 **Fix/optimize a slow query or N+1.** → `.explain()` → add index → `.lean()` + projection → replace loop-of-queries with one `$in`/`$lookup` → paginate. Narrate the diagnosis.
6. 🔥 **Implement pagination.** → Prefer keyset: `find({ _id: { $gt: cursor } }).sort({ _id: 1 }).limit(20).lean()`; return `nextCursor`. Mention skip's O(n) cost if they ask for page numbers.
7. **Implement an idempotent endpoint (fintech-relevant).** → Client sends an `Idempotency-Key`; store it with the result; on retry return the stored response instead of re-processing. Critical for payment retries. Use a unique index on the key.
8. **Aggregation with `$lookup` (join).** → Join two collections server-side when you must; note it's heavier than separate indexed queries for large sets.
9. **Small JS algorithm / string task.** → e.g. group/dedupe, frequency count with a `Map`, reverse words, validate parentheses with a stack. Talk through complexity (O(n)), edge cases (empty, nulls), then code clean.
10. **Atomic counter / stock decrement.** → `findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true })` — atomic, no race condition; null result = insufficient stock.

---

## Behavioral Quick-Hits (condensed → see `21-behavioral-hr.md`)

1. **Tell me about yourself.** → 60-sec arc: who you are → relevant experience → why back-end/this role. End on the company's stack.
2. **Hardest bug you've solved?** → Pick a real one (e.g. a slow Mongo query / N+1 or a race condition); STAR; emphasize the diagnosis method and what you learned.
3. **A project you're proud of.** → CineBite (CQRS) or Nova ERP; your specific contribution, a hard decision, the impact.
4. **Tell me about a conflict.** → Disagreement on approach → you listened, used data/a prototype, aligned on the trade-off. Show maturity, not "I was right."
5. **Why this company?** → Fintech + the stack you love (NestJS/Mongo) + growth in a domain where clean, secure, performant code actually matters.
6. **Why are you leaving / looking?** → Forward-looking and positive: bigger back-end ownership, fintech challenge — never trash your current employer.
7. **Deadline pressure?** → Prioritized must-haves, communicated early, cut scope not quality/security, delivered. Brief STAR.
8. **A time you received tough feedback?** → Took it well, acted on it, improved (e.g. test coverage / code review habits).

---

## Final Reminders

- **Think out loud** — they're evaluating _how_ you reason, not just the final answer.
- It's fine to say **"I'd confirm the exact syntax, but here's my approach…"** — confident reasoning beats fake certainty.
- **Connect every answer to a real project** (Foody, Pharmacy FEFO, CineBite, Nova ERP) — concrete > theoretical.
- **Ask clarifying questions** before coding/designing — it's a senior signal, not a weakness.
- **Lead with security & performance** unprompted when relevant — that's what this interviewer cares about, and it's fintech.
- Keep answers **tight**; offer to go deeper rather than monologuing.
- Have **3 questions ready** for them (e.g. team structure, how they handle DB migrations/scaling, what "clean code" means on their team).
- Breathe. You know this stack. Stay calm and be the steady, clear back-end engineer they're hiring for.
