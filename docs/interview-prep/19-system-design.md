# System Design

> System design questions appear in almost every mid-to-senior MERN/full-stack interview. At the junior level you are asked _how_ to build a feature; at the senior level you are asked to reason about _trade-offs_ — what breaks at 10x scale, where the bottlenecks are, why you chose Mongo over Postgres, how you keep the system available when a node dies. The interviewer is not looking for one "correct" architecture; they want to see structured thinking, awareness of constraints, and the ability to defend decisions. The model answers below are grounded in real systems the author has built: a multi-tenant pharmacy SaaS with FEFO (First-Expiry-First-Out) inventory, the Dynamic SaaS platform, the Hirely resume pipeline (BullMQ workers that render PDFs and send email), Foody (real-time food ordering with Socket.IO), and Trust-Node (delivery tracking). Use these as concrete anchors when an interviewer asks "have you actually built something like this?"

---

## How to Approach Any System Design Question (Framework)

The single biggest mistake candidates make is jumping straight to drawing boxes. Slow down and drive the conversation through these eight steps. Spend the first 5-10 minutes on steps 1-4; they determine everything downstream.

**1) Clarify requirements (functional + non-functional).**
Never design what you assume. Ask questions until the scope is bounded. Separate two kinds of requirements:

- _Functional:_ what the system does. "Users place an order, the kitchen sees it in real time, the order moves through states." For a URL shortener: create short link, redirect, track clicks.
- _Non-functional:_ the qualities. Latency targets (p99 < 200ms?), availability (99.9% vs 99.99%?), consistency (can data be stale?), durability, security/tenancy, read-vs-write heavy.
  Write these down. Constraints you surface here justify every later decision.

**2) Estimate scale (back-of-envelope).**
Translate vague requirements into numbers, even rough ones. This drives storage and architecture choices.

- _Users:_ DAU, MAU, peak concurrency.
- _QPS:_ `QPS = daily requests / 86,400`. For peaks multiply average by 2-10x. Example: 10M redirects/day -> ~115 QPS average, ~1,000 QPS peak.
- _Data:_ per-record size x records/day x retention. 10M URLs/day x 500 bytes x 5 years ~= 9 TB.
- _Read/write ratio:_ a URL shortener might be 100:1 read-heavy (cache aggressively); a chat app is more balanced. This ratio decides whether you invest in read replicas/caches or in write throughput.

**3) Define the API.**
A small set of endpoints/contracts forces clarity. REST verbs, request/response shapes, status codes, idempotency keys. This is also where you decide REST vs GraphQL vs WebSocket. Show the _shape_ of the data flowing.

**4) Data model & storage choice.**
List entities and their relationships, then choose stores. SQL when you need transactions, joins, strong consistency (payments, inventory, billing). NoSQL/document (MongoDB) when the access pattern is key-based, the schema is flexible, or you need horizontal write scale. It is normal to use both (polyglot persistence): Postgres for billing, Mongo for catalog, Redis for sessions/cache, S3 for blobs, Elasticsearch for search.

**5) High-level architecture & components.**
Draw the request flow: Client -> CDN -> Load Balancer -> API/app servers (stateless) -> cache -> DB, plus async paths (queue -> workers) and out-of-band stores (blob, search). Name each component and what it does.

**6) Deep-dive on bottlenecks.**
The interviewer will pick one component. Common ones: the hot database, the single queue, socket fan-out, the payment path. Show how you'd find the bottleneck (metrics, slow-query logs) and fix it.

**7) Scale it.**
Apply the standard levers: caching (Redis, CDN), database read replicas, sharding/partitioning, horizontal scaling behind a load balancer, async processing via message queues, CDN for static/blob content, and connection pooling. Each lever has a cost — name it.

**8) Discuss trade-offs.**
Close by naming what you gave up. "I chose eventual consistency for the feed to get write throughput; the cost is a user might not see their own post for a second, which I mitigate by writing-through their own cache." Senior signal = you volunteer the downsides before being asked.

---

## Core Building Blocks (concepts cheat-sheet)

**Load balancing.** Distributes traffic across N app servers. L4 (TCP) vs L7 (HTTP, can route by path/header). Algorithms: round-robin, least-connections, IP-hash (sticky). Enables horizontal scaling and removes single points of failure. Needs health checks to drop dead nodes.

**Horizontal vs vertical scaling.** Vertical = bigger machine (simple, but ceilinged and a single point of failure). Horizontal = more machines (near-unlimited, but requires statelessness and a load balancer). Senior answer: scale vertically first for simplicity, design stateless so you _can_ scale horizontally later.

**Caching.** Store hot data closer/faster. Layers: browser cache, CDN (edge), application cache (Redis/Memcached), DB query cache. Patterns: cache-aside (app checks cache, on miss loads DB and populates), write-through (write to cache+DB together), write-behind. Always set TTLs and have an invalidation story. Watch for cache stampede (use locks / request coalescing) and the thundering herd on expiry.

**Database replication (read replicas).** Primary handles writes, replicas serve reads. Scales read-heavy workloads. Cost: replication lag -> reads may be stale (read-your-own-writes problems). Route critical reads to primary.

**Sharding / partitioning.** Split data across nodes by a shard key (e.g., tenant_id, user_id, hash of URL). Scales writes and storage beyond one machine. Costs: cross-shard queries are hard, rebalancing is painful, hot shards if the key is skewed. Choose a high-cardinality, evenly-distributed key.

**SQL vs NoSQL.** SQL (Postgres/MySQL): strong schema, ACID transactions, joins, great for relational/financial data. NoSQL document (MongoDB): flexible schema, denormalized for read patterns, horizontal scale, no multi-document ACID historically (Mongo now has transactions but they're costly). Rule of thumb: relationships + transactions -> SQL; key-access + scale + flexible shape -> document.

**Message queues & async processing.** Decouple producers from consumers (BullMQ/Redis, RabbitMQ, Kafka, SQS). Smooth traffic spikes, retry failures, offload slow work (PDF render, email, image processing) out of the request path. Concepts: at-least-once delivery, consumer groups, backpressure, dead-letter queues.

**Rate limiting.** Protect the system and ensure fairness. Algorithms: fixed window, sliding window log/counter, token bucket, leaky bucket. Distributed limiting via Redis counters with atomic INCR + EXPIRE or Lua scripts. Return `429` with `Retry-After`.

**CAP theorem & consistency.** Under a network partition you choose Consistency or Availability (you can't have both). Strong consistency = every read sees the latest write (good for money, inventory). Eventual consistency = replicas converge over time (good for feeds, likes, analytics). Most systems pick AP with tunable consistency.

**Idempotency.** The same operation applied multiple times has the same effect once. Critical for retries and at-least-once queues. Implement with idempotency keys (client-generated UUID stored server-side) so a retried payment or job doesn't double-charge / double-send.

**N+1 problem.** Fetching a list then issuing one query per item (1 + N queries). Kills DB performance. Fix with joins, `IN` queries, batching, Mongo `$lookup`/`populate` carefully, or DataLoader in GraphQL.

**Indexing.** Indexes turn O(n) scans into O(log n) lookups. Index columns/fields used in filters, sorts, joins. Costs: slower writes, more storage. Compound indexes must match query order (leftmost-prefix rule). Watch for unused/duplicate indexes.

**Connection pooling.** DB connections are expensive to open. A pool reuses a fixed set. Essential in serverless/high-concurrency Node where each request could otherwise open a connection and exhaust the DB's max connections.

**Statelessness.** App servers hold no per-user session state in memory; session lives in Redis or a signed JWT. Any server can handle any request -> trivial horizontal scaling and zero-downtime deploys.

**API gateway.** Single entry point: routing, auth, rate limiting, request aggregation, SSL termination, logging. Common in microservices to hide internal topology.

**Pub/Sub.** Publishers emit events to channels/topics; subscribers receive them, decoupled. Redis Pub/Sub, Kafka, NATS. Used for fan-out (notify all socket servers of a new message), event-driven architectures, cache invalidation.

**WebSockets for real-time.** Persistent bidirectional connection. Use for chat, live orders, presence, dashboards. Costs: stateful connections (one server holds the socket), so scaling needs a shared backplane (Redis adapter) and sticky sessions or a connection registry.

**Blob/object storage (S3).** Store large binary files (images, PDFs, videos) outside the DB. Serve via CDN. Use presigned URLs so clients upload/download directly without proxying through your app servers.

**Search (Elasticsearch).** Full-text search, fuzzy matching, faceting, relevance ranking — things SQL `LIKE` can't do well. Keep it in sync with the primary store via change streams / CDC. It's a derived index, not a source of truth.

**Observability.** Logs (structured), metrics (RED: Rate, Errors, Duration / USE: Utilization, Saturation, Errors), traces (distributed tracing across services), and alerting. You cannot scale what you cannot measure.

---

## Worked Design Problems

### 1) Multi-Tenant SaaS (grounded in Pharmacy FEFO / Dynamic SaaS)

**Requirements.**

- _Functional:_ multiple independent organizations (tenants — e.g., individual pharmacies) sign up; each has users with roles (owner, pharmacist, cashier); tenant data is fully isolated; per-tenant configuration; subscription billing with plan tiers and usage limits; admin/super-admin console.
- _Non-functional:_ strict data isolation (a pharmacy must never see another's inventory), 99.9% availability, predictable per-tenant performance ("noisy neighbor" containment), auditability for regulated data, easy onboarding of a new tenant.

**Scale estimate.** 2,000 tenants, ~20 users each = 40k users, ~5k DAU. Each pharmacy: ~10k SKUs, ~500 transactions/day. Writes ~1M/day (~12 QPS avg, ~120 peak), reads heavier (dashboards, FEFO lookups) ~10:1. Total catalog ~20M rows. This is comfortably single-database scale — isolation, not raw scale, is the hard part.

**API sketch.**

```
POST /api/v1/auth/login            -> { token (JWT with tenantId, roles) }
GET  /api/v1/inventory?expiringBefore=2026-09-01   (FEFO-sorted)
POST /api/v1/inventory/batches     { sku, qty, expiryDate, lotNumber }
POST /api/v1/sales                 { items[], idempotencyKey }   // decrements FEFO
GET  /api/v1/billing/subscription
POST /api/v1/admin/tenants         (super-admin only)
```

Every request carries a JWT containing `tenantId` and `roles`; a middleware injects `tenantId` into every query.

**Data model.** Three isolation strategies — pick by trade-off:

1. _Shared DB, shared schema (row-level, `tenant_id` column on every table)._ Cheapest, easiest to operate, hardest isolation. Every query MUST filter by `tenant_id`; enforce centrally (a base repository / Mongoose plugin / Postgres Row-Level Security). One missed filter = data leak. Good default for most B2B SaaS.
2. _Shared DB, schema-per-tenant._ Each tenant gets a Postgres schema. Stronger isolation, harder migrations (run across N schemas), connection/catalog bloat at thousands of tenants.
3. _Database-per-tenant._ Strongest isolation, per-tenant backups/restore, easy "delete a tenant," can meet compliance. Most expensive operationally; used for enterprise/regulated tiers.

Common pattern (what the pharmacy SaaS uses): row-level isolation by default, with an upgrade path to DB-per-tenant for large/regulated customers.

```
tenants(id, name, plan, status, created_at, db_shard)
users(id, tenant_id, email, password_hash, role)            // role: owner|pharmacist|cashier
products(id, tenant_id, sku, name, ...)                      INDEX (tenant_id, sku)
batches(id, tenant_id, product_id, lot, qty, expiry_date)   INDEX (tenant_id, product_id, expiry_date)  // FEFO
sales(id, tenant_id, user_id, total, idempotency_key, created_at)
subscriptions(tenant_id, plan, status, current_period_end, stripe_customer_id)
audit_log(id, tenant_id, user_id, action, entity, before, after, ts)
```

FEFO is the key domain detail: when selling, you decrement from the batch with the earliest `expiry_date` first — `ORDER BY expiry_date ASC` over `(tenant_id, product_id)` and consume across batches in a transaction.

**Architecture.** Client (SPA) -> CDN -> Load Balancer -> stateless Node/Express API (tenant-resolution middleware reads JWT -> sets `req.tenantId`) -> MongoDB/Postgres (with mandatory tenant filter) + Redis (sessions, per-tenant cache, rate-limit counters). Billing integrates Stripe via webhooks (`invoice.paid`, `customer.subscription.deleted`) that update `subscriptions`. A separate super-admin app manages tenants. RBAC enforced by middleware mapping roles -> permissions on each route.

**Scaling & bottlenecks.** Noisy neighbor: cap per-tenant QPS with Redis rate limits keyed by `tenantId`; consider per-tenant connection quotas. Hot tenants can be migrated to a dedicated shard (the `db_shard` column routes them). Read-heavy dashboards: per-tenant Redis cache + read replicas. The biggest risk is a missing `tenant_id` filter, so enforce it at the data-access layer, not per-query, and add tests.

**Trade-offs.** Row-level isolation gives cheap operations and easy cross-tenant analytics but relies on application discipline for security. DB-per-tenant flips that. JWT-embedded tenant id is fast (no lookup) but means changing a user's tenant/role requires token expiry or a revocation list.

---

### 2) Background Job / Async Processing System (grounded in Hirely: resume -> PDF + email)

**Requirements.**

- _Functional:_ user submits resume data; system renders a PDF, stores it, emails it to the user; user can see job status (queued/processing/done/failed); failed jobs retry then go to a dead-letter queue for inspection.
- _Non-functional:_ the HTTP request returns immediately (PDF render is slow, 1-5s); at-least-once processing with idempotency (never email twice, never double-render); resilient to worker crashes; observable (queue depth, failure rate); scalable workers.

**Scale estimate.** 50k resume generations/day = ~0.6 jobs/s average, but bursty (career-fair spikes to 50/s). PDF render ~2s CPU-bound. At 50/s peak with 2s each you need ~100 concurrent worker slots. PDFs ~200 KB -> 10 GB/day to blob storage.

**API sketch.**

```
POST /api/jobs/resume   { resumeData, idempotencyKey }  -> 202 { jobId }
GET  /api/jobs/:jobId    -> { status, progress, resultUrl? }
// internal: worker consumes from BullMQ "resume" queue
```

Returning `202 Accepted` with a `jobId` is the whole point — the slow work happens off the request path.

**Data model.**

```
jobs(id, user_id, type, status, attempts, idempotency_key UNIQUE, result_url, error, created_at, updated_at)
// BullMQ stores its own job state in Redis; the `jobs` table is the durable, queryable mirror
```

The `idempotency_key UNIQUE` constraint is the safety net: a retried POST hits the same row and returns the existing job instead of enqueuing a duplicate.

**Architecture (component flow).**

1. API validates, upserts a `jobs` row by idempotency key, enqueues to BullMQ (`resume` queue on Redis), returns `202 { jobId }`.
2. A pool of worker processes (separate from API servers) pulls jobs. Each: render PDF (headless Chromium/Puppeteer or a PDF lib) -> upload to S3 -> get URL -> send email (SES/SendGrid) -> mark `jobs.status = done`, store `result_url`.
3. Failures: BullMQ retries with exponential backoff (e.g., 3 attempts, 2^n seconds). After max attempts the job moves to a **dead-letter queue**; an alert fires; an operator can inspect and replay.
4. Status endpoint reads the `jobs` table (or BullMQ) for the client to poll, or push updates via WebSocket/SSE.

**Idempotency in detail.** Two layers:

- the API dedupes enqueue by idempotency key
- the worker is idempotent — before emailing, check a flag `email_sent`; before rendering, check if `result_url` already exists

Because queues are at-least-once, a job _will_ occasionally be delivered twice (e.g., worker crashes after emailing but before ack). Worker-side idempotency prevents the double email.

**Scaling & bottlenecks.** PDF render is CPU-bound -> scale workers horizontally; BullMQ concurrency setting + more worker pods. Redis is the queue broker — monitor memory and use a dedicated Redis. Email provider rate limits -> a token-bucket limiter or a dedicated low-concurrency email queue. Bottleneck during spikes is worker capacity; autoscale workers on queue depth (e.g., scale up when `waiting > 500`). Separate queues by priority (interactive vs batch) so a backlog of bulk jobs doesn't delay a user's single resume.

**Trade-offs.** At-least-once + idempotency is simpler and more robust than exactly-once (which is effectively impossible in distributed systems). Polling for status is simple but chatty; WebSocket/SSE is realtime but adds stateful connections. Using Redis/BullMQ is fast and easy but less durable than Kafka/SQS for very high volumes or strict ordering — for Hirely's scale BullMQ is the right call.

---

### 3) Real-Time Food Ordering / Kitchen Display System (grounded in Foody)

**Requirements.**

- _Functional:_ customer places an order; the restaurant's kitchen display (KDS) sees it instantly; staff move the order through states (placed -> accepted -> preparing -> ready -> out-for-delivery -> delivered); customer sees live status; multiple kitchens, each only sees its own orders.
- _Non-functional:_ low latency for updates (<1s perceived), reliable delivery of state changes, scale to many concurrent sockets, recover gracefully on disconnect/reconnect, the order record must be durable even if a socket message is lost.

**Scale estimate.** 1,000 restaurants, peak 50 concurrent orders each during dinner rush = 50k active orders; ~20k concurrent socket connections (kitchens + customers tracking). Order events ~5 per order lifecycle -> a few hundred events/s at peak. Manageable, but socket fan-out across multiple servers is the challenge.

**API sketch.**

```
REST (source of truth):
POST /api/orders            { restaurantId, items[], idempotencyKey } -> { orderId, status:'placed' }
PATCH /api/orders/:id/status { status }   // staff transition; validated against state machine
GET  /api/orders/:id

WebSocket (Socket.IO):
client emits: join { room: 'restaurant:123' } or 'order:456'
server emits: order:new, order:statusChanged
```

Important pattern: **REST writes the durable state, then the server emits a socket event.** Sockets are a notification layer, not the system of record.

**Data model.**

```
orders(id, restaurant_id, customer_id, status, total, idempotency_key, created_at)   INDEX (restaurant_id, status)
order_items(id, order_id, menu_item_id, qty, price)
order_events(id, order_id, from_status, to_status, actor_id, ts)   // audit trail of the lifecycle
restaurants(id, name, ...)
```

Status transitions are a state machine; reject illegal jumps (e.g., delivered -> preparing).

**Architecture (component flow).**

1. Customer POSTs order -> API persists to DB (idempotent) -> emits `order:new` to room `restaurant:123`.
2. The kitchen's KDS is joined to `restaurant:123`; it receives the event and renders the ticket.
3. Staff taps "preparing" -> PATCH persists -> server emits `order:statusChanged` to both `restaurant:123` and `order:456` rooms. The customer's app is in `order:456` and updates live.
4. **Scaling sockets:** with multiple Socket.IO server instances behind a load balancer, a client connected to server A won't receive an event emitted from server B. Solve with the **Socket.IO Redis adapter** (Redis Pub/Sub backplane): an emit on any server is published to Redis and fanned out to all servers, which deliver to their local sockets in the room. Use sticky sessions (or WebSocket-only transport) at the LB so a connection stays on one server.

**Scaling & bottlenecks.** Each server holds N open connections (memory + file descriptors) — scale horizontally, ~10-50k sockets per node. Redis adapter is the fan-out hub; one Redis can handle the pub/sub volume here, but it's a SPOF -> use Redis with replication/Sentinel. Rooms keep fan-out targeted (only the relevant kitchen/customer, not a broadcast). On reconnect, the client refetches current order state via REST (sockets may have missed events while disconnected) — never trust sockets for missed-message recovery; REST is the reconciliation path.

**Trade-offs.** Socket.IO gives rooms, reconnection, and fallback transports out of the box vs raw `ws` (lighter but you build all that). Redis adapter is simple and fast but caps you at Redis throughput; at extreme scale you'd move to Kafka or a dedicated socket service. Emitting after the DB write guarantees durability but adds a tiny latency; emitting first would be faster but risks showing an order that failed to persist.

---

### 4) URL Shortener

**Requirements.**

- _Functional:_ given a long URL, return a short code; redirecting the short URL goes to the original; optional custom alias, expiry, and click analytics.
- _Non-functional:_ extremely read-heavy, low-latency redirects (<50ms), high availability, codes are short and unique, links effectively permanent.

**Scale estimate.** 100M new URLs/year (~3/s avg). Reads 100:1 -> ~300 redirects/s avg, ~3,000 peak. Storage: 100M/year x ~500 bytes x 5 years = ~250 GB — fits comfortably; the read latency, not storage, is the design driver. Cache hit ratio will be high (a few hot links dominate traffic).

**Key design: generating the short code.**

- _Base62 encoding of an auto-increment ID:_ take a unique counter, encode in `[a-zA-Z0-9]` (62 chars). 7 chars = 62^7 ~= 3.5 trillion combinations. Sequential and guaranteed unique, but predictable/enumerable. Use a distributed counter (e.g., a ticket/ID service or DB sequence handed out in ranges per node).
- _Hashing (MD5/SHA of URL, take first N chars):_ fast but collisions possible -> need a collision check + rehash. Same URL maps to same code (dedup), which may or may not be desired.
  Base62-of-counter is the cleaner answer; mention key generation service (pre-generate keys, hand them out) to avoid DB hot spots.

**API sketch.**

```
POST /api/shorten   { url, customAlias?, expiresAt? } -> { shortUrl }
GET  /:code         -> 301/302 redirect to original
GET  /api/:code/stats -> { clicks, byDay, referrers }
```

Use **302** (temporary) if you want every click to hit your server for analytics; **301** (permanent) is cacheable by browsers/CDN but you lose per-click tracking.

**Data model.**

```
urls(code PK, long_url, user_id, created_at, expires_at)        // KV access by code
clicks(id, code, ts, ip, referrer, user_agent, country)        // append-only, often async
```

This is a perfect document/KV workload (Mongo, DynamoDB, or even Redis-backed) — single-key lookups, no joins.

**Architecture.** Write path: API -> generate code (counter service) -> store in DB -> warm cache. Read path: GET /:code -> check Redis cache -> on hit, redirect; on miss, read DB, populate cache, redirect. Clicks recorded asynchronously (push to a queue/Kafka -> analytics store) so analytics never slow the redirect. CDN can cache redirects at the edge for the hottest links.

**Scaling & bottlenecks.** Redirects are read-dominated -> Redis cache absorbs the vast majority (cache the `code -> long_url` map). DB read replicas for cache misses. Shard the `urls` table by `code` (hash) when it grows. The counter/ID service must not be a bottleneck — hand out ID ranges in blocks so each app node generates locally. Analytics writes are high-volume but tolerate eventual consistency -> queue + batch insert.

**Trade-offs.** 301 = faster (cached) but no analytics; 302 = analytics but every hit costs you a request. Counter-based codes are short and dense but enumerable (a competitor can scrape all links) — hashing or adding randomness fixes that at the cost of length/dedup. Storing clicks synchronously gives real-time stats but slows redirects; async is the right call.

---

### 5) Real-Time Chat Application

**Requirements.**

- _Functional:_ 1:1 and group chat; message history; delivery receipts (sent/delivered/read); online presence; typing indicators; push notifications when offline.
- _Non-functional:_ low latency (<100ms in-region), messages durable and ordered within a conversation, scale to millions of connections, eventual delivery to offline users.

**Scale estimate.** 10M DAU, ~1M concurrent connections, average 40 messages/user/day = 400M messages/day (~4,600 writes/s avg, ~20k peak). Storage at ~300 bytes/message = ~120 GB/day -> partition + tier old messages to cold storage.

**API / protocol sketch.**

```
WebSocket events:
 client -> server: message:send { conversationId, clientMsgId, body }
 server -> client: message:new, message:delivered, message:read, presence:update, typing
REST:
 GET /conversations/:id/messages?before=<cursor>&limit=50   // history, cursor pagination
 POST /conversations { participantIds }
```

`clientMsgId` (idempotency) dedupes resends and lets the client reconcile its optimistic UI.

**Data model.**

```
conversations(id, type, created_at)
participants(conversation_id, user_id, last_read_msg_id)
messages(id, conversation_id, sender_id, body, created_at, client_msg_id)
   PARTITION/SHARD KEY: conversation_id   INDEX (conversation_id, created_at)
presence: Redis  user:<id> -> { status, lastSeen, serverId }  (TTL heartbeat)
```

Messages are time-series within a conversation -> shard by `conversation_id`, store sorted by time. Cassandra/Mongo suit this; the access pattern is "give me the last N messages in conversation X."

**Architecture (component flow).**

1. Client opens a WebSocket to a chat server (via LB with sticky sessions). The server registers `user -> serverId` in Redis.
2. `message:send` -> server persists message (durable, source of truth) -> determines recipients -> for each online recipient, look up their `serverId` in Redis and route the event via a **Pub/Sub backplane** (Redis/Kafka) to the server holding that socket, which pushes `message:new`. Sender gets `message:sent`.
3. On the recipient's ack, emit `message:delivered`; when they open the chat, client sends read -> update `last_read_msg_id`, emit `message:read`.
4. Offline recipients: enqueue a push notification (APNs/FCM); they fetch missed messages via REST history on reconnect.
5. Presence/typing: ephemeral, Redis with TTL heartbeats; broadcast `presence:update` to contacts via pub/sub.

**Scaling & bottlenecks.** Connection count is the dominant constraint -> many chat servers, each holding a slice of sockets, coordinated by Redis/Kafka pub/sub for cross-server delivery. Message store sharded by conversation. Fan-out for large groups (10k members) is expensive — use a write-to-store-once + read-fan-out for huge groups, or async fan-out workers. Presence at scale is chatty; batch and TTL it.

**Trade-offs.** Strong ordering within a conversation (single shard) vs global ordering (impossible/expensive — don't promise it). Storing every message durably is required but costly -> tier old messages to cheap storage. Optimistic send (show immediately) improves UX but needs reconciliation via `clientMsgId`. Sticky sessions simplify socket routing but complicate load balancing and rolling deploys.

---

### 6) Rate Limiter

**Requirements.**

- _Functional:_ limit a client (by API key / user / IP) to N requests per window; return `429` with `Retry-After` when exceeded; support different limits per route/tier.
- _Non-functional:_ very low overhead (<1ms), accurate enough, works across a distributed fleet of app servers (a global limit, not per-node), fail-open or fail-closed by policy.

**Scale estimate.** If the API does 10k QPS and every request checks the limiter, the limiter store must handle 10k+ ops/s with sub-ms latency -> Redis with atomic operations is the standard answer.

**Algorithms (the heart of this question).**

- _Fixed window counter:_ `INCR key:{user}:{window}` with `EXPIRE`. Simple, O(1). Flaw: burst at the window boundary — 2N requests can pass across the seam of two adjacent windows.
- _Sliding window log:_ store a timestamp per request (Redis sorted set), drop entries older than the window, count the rest. Accurate but memory-heavy (one entry per request).
- _Sliding window counter:_ weighted blend of current + previous fixed window. Approximates sliding behavior with O(1) memory. Common production choice.
- _Token bucket:_ a bucket holds up to B tokens, refilled at rate R/sec; each request consumes one; empty bucket -> reject. Allows controlled bursts up to B, smooths to rate R. Great general-purpose choice.
- _Leaky bucket:_ requests queued and processed at a fixed rate; smooths output but adds latency.

**Distributed implementation.** Centralize state in Redis so the limit is global across all app nodes. Use a Lua script (or `INCR`+`EXPIRE` atomically) to avoid race conditions between read-modify-write. Token bucket in Lua: read tokens + last-refill, compute refill, decrement, write back — all atomically server-side.

```
-- token bucket (pseudo-Lua), keyed per client
tokens = min(B, tokens + (now - last_refill) * R)
if tokens >= 1 then tokens -= 1; allow else deny end
set tokens, last_refill, EXPIRE
```

**Architecture.** Implement as middleware (Express) or at the API gateway/edge (best — reject before hitting app logic). Key = `ratelimit:{apiKey|userId|ip}`. On allow, proceed; on deny, return `429 { Retry-After }`. Tier limits looked up per key.

**Scaling & bottlenecks.** Redis becomes the hot path — use a dedicated Redis, pipeline/Lua to minimize round trips, and shard by key if one Redis isn't enough. Trade a tiny accuracy loss for speed by allowing slightly-stale local counters (token bucket with periodic Redis sync). Decide failure policy: if Redis is down, fail-open (allow, prioritize availability) or fail-closed (deny, prioritize protection)?

**Trade-offs.** Fixed window = cheapest, least accurate. Sliding log = most accurate, most memory. Token bucket = best balance and allows bursts. Edge/gateway limiting protects more of the stack but is coarser; per-route app limiting is precise but later in the request path.

---

### 7) News Feed / Activity Feed

**Requirements.**

- _Functional:_ users follow others; the feed shows recent posts from followees, newest first; supports likes/comments counts; infinite scroll.
- _Non-functional:_ fast feed reads (<200ms), scale to users with millions of followers, freshness within seconds, eventual consistency acceptable.

**Scale estimate.** 50M users, average 200 followees, 100M posts/day. Feed reads dominate (users scroll constantly): ~500M feed reads/day. The hard part is the "celebrity" with 50M followers — a single post = 50M feed insertions if naive.

**The central decision: fan-out on write vs fan-out on read.**

- _Fan-out on write (push):_ when a user posts, write that post's id into every follower's precomputed feed list (in Redis/Cassandra). Feed reads are then a cheap lookup of a ready list -> very fast reads. Cost: a post by someone with M followers triggers M writes; celebrities make this explode, and inactive followers' feeds are computed needlessly.
- _Fan-out on read (pull):_ store posts once; at read time, fetch recent posts from all followees and merge. Cheap writes, expensive reads (gather + sort across N followees), worse for users following thousands.
- _Hybrid (the real answer):_ push for normal users; for celebrities/high-fanout accounts, don't push — pull their posts at read time and merge into the precomputed feed. Best of both.

**API sketch.**

```
POST /api/posts            { body, mediaUrl? }
GET  /api/feed?cursor=<id>&limit=20   // cursor (keyset) pagination, NOT offset
POST /api/users/:id/follow
```

Cursor pagination (`WHERE created_at < cursor`) beats `OFFSET` which gets slower and skips/dupes items as new posts arrive.

**Data model.**

```
posts(id, user_id, body, media_url, created_at, like_count, comment_count)   INDEX (user_id, created_at)
follows(follower_id, followee_id, created_at)   INDEX (follower_id)
feeds: Redis list/sorted-set per user  feed:<userId> -> [postId,...]   (precomputed, push model)
```

**Architecture (component flow).**

1. Post created -> persist to `posts` -> publish to a fan-out worker (queue).
2. Worker reads the author's followers; for non-celebrity authors, pushes the post id into each follower's `feed:<id>` (capped to last ~1,000). Celebrity authors are flagged and skipped.
3. Feed read: load the precomputed `feed:<userId>` list, plus pull recent posts from any celebrities the user follows, merge by time, hydrate post bodies + counts from cache/DB.
4. Counts (likes/comments) updated asynchronously and cached; exact real-time counts aren't required.

**Scaling & bottlenecks.** Fan-out workers scale horizontally and absorb write bursts; cap stored feed length so memory is bounded. Hydration (turning post ids into full posts) is an N+1 risk -> batch-fetch via `IN`/MGET and cache hot posts. Celebrity pull keeps the worst-case write bounded. Shard feeds and posts by user id.

**Trade-offs.** Push = fast reads, heavy/wasteful writes and storage. Pull = lean writes, slow reads. Hybrid adds complexity but is what large feeds actually do. Eventual consistency (your post appears in followers' feeds after a short delay) is the accepted price for write throughput; mitigate by writing the author's own post straight into their own feed view immediately.

---

### 8) E-Commerce Checkout / Inventory (grounded in the author's e-commerce work)

**Requirements.**

- _Functional:_ cart -> checkout -> reserve inventory -> take payment -> create order -> decrement stock -> confirmation. Must never oversell limited stock; payment must be charged exactly once even with retries/double-clicks.
- _Non-functional:_ strong consistency on inventory and money (this is where eventual consistency is _wrong_), high availability of the storefront, idempotent payment, durable orders.

**Scale estimate.** 1M products, 100k orders/day (~1.2/s avg, flash-sale peaks to 1,000/s on a few hot SKUs). Browsing is read-heavy (10k QPS, cache it); checkout is write-heavy and contended on the hot SKUs — concurrency control on those rows is the real challenge.

**API sketch.**

```
POST /api/cart/items        { sku, qty }
POST /api/checkout          { cartId, idempotencyKey, paymentMethod }  -> { orderId }
POST /api/payments/webhook  (from Stripe: payment_intent.succeeded)
```

The `idempotencyKey` (client-generated per checkout attempt) is non-negotiable — it prevents double orders from double-clicks and retries.

**Data model.**

```
products(id, sku, name, price)
inventory(sku PK, available, reserved, version)        // version = optimistic lock
orders(id, user_id, status, total, idempotency_key UNIQUE, created_at)
order_items(order_id, sku, qty, price)
payments(id, order_id, provider_intent_id, status, amount)
reservations(id, sku, qty, order_id, expires_at)       // hold stock during checkout
```

Inventory and payments belong in a **transactional SQL store** (Postgres) even if the catalog lives in Mongo.

**Preventing overselling (the core concurrency problem).** Two correct techniques:

- _Optimistic locking:_ read `inventory` with its `version`; on decrement, `UPDATE inventory SET available = available - :qty, version = version + 1 WHERE sku = :sku AND version = :v AND available >= :qty`. If 0 rows updated, someone else changed it -> retry or fail. Great for low contention.
- _Pessimistic / atomic conditional update:_ `UPDATE ... SET available = available - :qty WHERE sku = :sku AND available >= :qty` in a transaction. The `available >= qty` guard makes oversell impossible — if it would go negative, no row updates and you reject. Best for hot SKUs.
  Wrap reserve + order + payment in a DB transaction (or saga across services).

**Idempotent payments.** Store an `idempotency_key` on the order (UNIQUE). On checkout, upsert the order by key: if it exists, return the existing order rather than charging again. Pass the same key to Stripe (which supports idempotency keys natively) so a retried charge is deduped provider-side too. The Stripe **webhook** is the source of truth for payment success — don't mark the order paid from the client response; wait for `payment_intent.succeeded`. Make the webhook idempotent (it can be delivered multiple times) by keying on `provider_intent_id`.

**Architecture (component flow).** Browse: client -> CDN -> API -> Redis cache -> Mongo catalog. Checkout: API -> begin tx -> reserve inventory (atomic conditional decrement into `reserved`) -> create `order` (pending, by idempotency key) -> create Stripe PaymentIntent -> return client secret. Client confirms payment -> Stripe webhook -> mark order paid, convert reservation to a real decrement, emit confirmation (email/queue). A reaper job releases reservations whose `expires_at` passed (abandoned checkouts) back to `available`.

**Scaling & bottlenecks.** Hot-SKU contention during flash sales is the killer: serialize updates on that one row (the conditional `UPDATE` is the lock) — this naturally caps throughput per SKU, which is acceptable since you only have so much stock. Optionally pre-decrement into Redis with an atomic `DECR` guarded at zero for ultra-hot drops, reconciling to the DB asynchronously. Read replicas + cache for browsing. Payment provider is external -> async via webhook, with retries and a dead-letter for failed webhooks.

**Trade-offs.** Strong consistency on inventory caps write throughput per SKU but is mandatory (overselling = refunds, angry customers, oversold-then-cancelled orders). Reservations improve UX (stock held while you pay) but add a reaper and complexity vs decrement-at-payment (simpler, but risks "out of stock" at the final step). Optimistic locking is cheaper under low contention; conditional/pessimistic updates win on hot rows.

---

## Common Mistakes / Red Flags

- **Drawing boxes before clarifying requirements or estimating scale.** Always do steps 1-2 first.
- **No numbers.** "It needs to be fast/scalable" without QPS, data size, or read/write ratio. Estimates drive every decision.
- **Over-engineering for scale you don't have.** Proposing Kafka, microservices, and sharding for 100 users. Start simple; scale when numbers demand it. Senior signal is knowing _when_ a lever is warranted.
- **Ignoring trade-offs.** Presenting one architecture as obviously correct. Every choice costs something — name it.
- **Forgetting the async/failure paths.** What happens when a worker crashes mid-job? When the payment webhook is delivered twice? When Redis is down?
- **Treating sockets/queues as durable.** Sockets miss messages on disconnect; queues are at-least-once. The DB is the source of truth; design reconciliation paths.
- **No idempotency on writes that can be retried** (payments, jobs, orders) — leads to double charges and duplicate work.
- **Picking eventual consistency for money/inventory** or strong consistency for likes/feeds. Match the consistency model to the domain.
- **Stateful app servers** (in-memory sessions) that prevent horizontal scaling.
- **The N+1 query** when hydrating lists; not mentioning indexes.
- **No observability story** — can't say how you'd detect or diagnose the bottleneck you just designed around.
- **Not knowing your own projects deeply.** If you list Foody/Hirely on your resume, be ready to defend the socket/queue choices.

---

## Further Reading

- [The System Design Primer](https://github.com/donnemartin/system-design-primer) — the canonical free GitHub repo covering every concept here with diagrams.
- [ByteByteGo (Alex Xu)](https://bytebytego.com/) — _System Design Interview_ books vol 1 & 2 and the blog; the gold standard for interview prep.
- [High Scalability](http://highscalability.com/) — real-world architecture deep-dives ("how X is built at scale").
- [AWS Architecture Center](https://aws.amazon.com/architecture/) & the [Designing Data-Intensive Applications (Kleppmann)](https://dataintensive.net/) book — for the storage, replication, and consistency theory behind the patterns above.
