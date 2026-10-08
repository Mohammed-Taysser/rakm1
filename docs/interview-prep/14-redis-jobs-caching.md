# Redis, Caching & Background Jobs (46 questions)

> Redis and background-job processing are where a backend stops being a CRUD wrapper and becomes a real system. Almost every project in this bank leans on them: **Foody** caches menus/restaurant data, **Hirely** runs a PDF-generation + email pipeline through BullMQ so the HTTP request returns instantly, **Pharmacy** drives FEFO (First-Expiry-First-Out) reminders and stock jobs, **Smart Task Scheduler** uses delayed/repeatable jobs, **Whats-Add** queues outbound messages, and the dedicated **learn-background-task** project deliberately compares the four ways to "do work later" in Node: timers, node-cron, BullMQ queues, and worker*threads, plus Redis pub/sub. **Trust-Node** stores sessions in Redis via IORedis. Interviewers probe this area to see whether you understand \_why* in-memory data stores are fast, how caching can silently corrupt correctness if invalidation is wrong, and whether you grasp that queued jobs run _at-least-once_ — so your handlers must be idempotent. This file goes deep on all three: Redis internals, caching strategy, and BullMQ.

## Quick Revision Checklist

- Redis is an **in-memory**, **single-threaded** key-value data store; speed comes from RAM + no lock contention on the command loop.
- Core data types: **strings, hashes, lists, sets, sorted sets, streams, bitmaps, HyperLogLog** — pick by access pattern, not habit.
- Persistence: **RDB** = point-in-time snapshots (fast restart, can lose data); **AOF** = append log (durable, larger/slower). Often run both.
- Set **maxmemory** + an **eviction policy** (`allkeys-lru`, `volatile-lru`, `allkeys-lfu`, `noeviction`) or Redis OOMs.
- `MULTI/EXEC` = transactions (queued, not rolled back on logic errors); `WATCH` = optimistic locking; **Lua scripts** run atomically.
- **Pub/sub** is fire-and-forget (no persistence, no replay); **Streams** add persistence + consumer groups + acks.
- Caching patterns: **cache-aside** (lazy), **read-through**, **write-through**, **write-behind**, **write-around** — know the trade-offs.
- The two hard things: **cache invalidation** and **naming things**. Always set a **TTL** as a safety net.
- **Cache stampede / thundering herd**: many misses hit the DB at once — mitigate with locks, request coalescing, jitter, stale-while-revalidate.
- Rate limiting: **fixed window** (INCR+EXPIRE), **sliding window** (sorted set), **token bucket** — sliding window via Lua is accurate + atomic.
- **Distributed locks**: `SET key val NX PX ttl`; Redlock for multi-node — but locks have caveats (clock skew, fencing tokens).
- Background jobs offload slow/CPU work (PDFs, emails, images) **out of the request cycle** so HTTP responds fast.
- BullMQ primitives: **Queue** (producer), **Worker** (consumer), **Job**, **QueueEvents**, **FlowProducer** (parent/child jobs).
- Job options: `attempts`, `backoff` (exponential), `delay`, `priority`, `repeat` (cron), `removeOnComplete/Fail`.
- Jobs are **at-least-once** — handlers MUST be **idempotent**. Use a job/business id + a Redis SETNX guard or DB upsert.
- **Failed jobs** stay in a failed set = your dead-letter queue; inspect, retry, or move them deliberately.
- **Graceful shutdown**: call `worker.close()` on SIGTERM so in-flight jobs finish before the process exits.
- Scale workers **horizontally** by running more worker processes against the same queue; control fan-out with `concurrency`.
- node-cron / setInterval run _in-process_ and die with the process; BullMQ jobs survive restarts. Don't confuse the two.

## Basic

### Q1: What is Redis?

**A:** Redis (REmote DIctionary Server) is an open-source, in-memory data-structure store used as a database, cache, and message broker. It keeps the entire dataset in RAM (with optional disk persistence), supports rich data types beyond plain strings, and is famously fast — typically sub-millisecond operations.

**Tip:** Say "in-memory data-structure store," not "key-value cache." The data-structure part (sorted sets, streams, etc.) is what distinguishes it from Memcached.

### Q2: What are the main use cases for Redis?

**A:** Caching (most common), session storage, rate limiting, distributed locks, pub/sub messaging, job/message queues (BullMQ is built on Redis), leaderboards/ranking (sorted sets), real-time counters, and HyperLogLog cardinality estimates.

**Tip:** Map it to your projects: Trust-Node sessions, Foody caching, BullMQ queues in Hirely/Pharmacy, pub/sub in learn-background-task.

### Q3: Why is Redis so fast?

**A:** Three reasons:

1. data lives in RAM, so no disk seeks on reads
2. it's single-threaded for command execution, so there are no locks or context-switching on the hot path
3. it uses an efficient event loop (I/O multiplexing) and optimized C data structures

**Tip:** Single-threaded is a _feature_ here — it gives atomicity for free per command, since two commands never interleave.

### Q4: What does single-threaded mean for Redis, and what's the implication?

**A:** A single thread executes commands one at a time, sequentially. Implication: each command is atomic, but a **slow command blocks everything** (e.g., `KEYS *` on a large DB, or a big `SORT`). Modern Redis offloads some background tasks (I/O, expiry, persistence) to helper threads, but the command processing core is single-threaded.

**Tip:** Never run `KEYS *` in production — use `SCAN` (cursor-based, non-blocking).

### Q5: What are Redis's main data types and when do you use each?

**A:**

- **String** — caching JSON/HTML, counters (`INCR`), flags. Up to 512MB.
- **Hash** — objects with fields (a user record: `HSET user:1 name Ali age 30`). Memory-efficient for many small fields.
- **List** — ordered, dupes allowed; queues/stacks via `LPUSH`/`RPOP`, recent-items feeds.
- **Set** — unique unordered members; tags, "is member?" checks, set algebra (`SINTER`).
- **Sorted Set (ZSet)** — members with scores, auto-sorted; leaderboards, priority queues, sliding-window rate limiters.
- **Stream** — append-only log with IDs and consumer groups; event sourcing, durable messaging.
- **Bitmap** — bit-level flags on a string; daily active-user tracking.
- **HyperLogLog** — approximate unique counts in ~12KB regardless of cardinality.

**Tip:** "Sorted set for leaderboards and rate limiting" is the answer interviewers want to hear unprompted.

### Q6: Show the most common Redis commands you'd actually use.

**A:**

```
SET key value EX 60        # set with 60s expiry
GET key
DEL key
EXPIRE key 60 / TTL key    # set/inspect remaining TTL
INCR counter / INCRBY x 5  # atomic counters
HSET user:1 name Ali       # hash field
HGETALL user:1
LPUSH q a / RPOP q         # list as queue
SADD tags node redis       # set add
ZADD board 100 alice       # sorted set add (score 100)
ZREVRANGE board 0 9 WITHSCORES  # top 10
```

**Tip:** `EX`/`PX` set TTL atomically with the value — better than `SET` then `EXPIRE` (which can leave a key without TTL if the process dies between).

### Q7: How does Redis handle expiry / TTL?

**A:** You attach a TTL with `EXPIRE`, `PEXPIRE`, or the `EX`/`PX` option on `SET`. Redis uses **lazy expiration** (a key is checked when accessed) combined with **active expiration** (a background cycle samples and evicts expired keys). `TTL key` returns seconds left, `-1` = no expiry, `-2` = key doesn't exist.

**Tip:** Because expiry is lazy + sampled, an expired key may briefly still occupy memory before being collected — don't assume instant freeing.

### Q8: What is caching and why do we do it?

**A:** Caching stores the result of an expensive operation (a DB query, an API call, a computed page) in fast storage so future requests are served without redoing the work. Benefits: lower latency, less load on the database, higher throughput, cost savings.

**Tip:** Frame the cost: a Redis GET is ~0.1ms; a complex Mongo aggregation might be 50-200ms. Caching that is a 500x win on a hot path.

### Q9: What is the cache-aside (lazy-loading) pattern?

**A:** The application checks the cache first. On a **hit**, it returns the cached value. On a **miss**, it reads from the DB, writes the result into the cache with a TTL, and returns it. The cache only fills on demand.

**Tip:** This is the default pattern for read-heavy MERN apps — and the one to show in code. See the cache-aside snippet below.

### Q10: What's the difference between a cache hit and a cache miss, and why does hit ratio matter?

**A:** A **hit** = data found in cache; a **miss** = not found, so you fall back to the source. **Hit ratio** = hits / (hits + misses). A high ratio means the cache is doing its job; a low ratio means you're caching the wrong things, TTLs are too short, or keys are too granular (no reuse).

**Tip:** Track it. If hit ratio is low, your cache is pure overhead — you pay the lookup cost and still hit the DB.

### Q11: What are background jobs and why use them?

**A:** Background jobs move slow or non-critical work out of the HTTP request/response cycle into a separate worker process. The request returns immediately (e.g., "your report is being generated"), and the heavy work — PDF generation, sending emails, image processing, calling slow third-party APIs — runs asynchronously.

**Tip:** Hirely is the canonical example: the API enqueues a "generate PDF + email candidate" job and responds in ~50ms instead of blocking for 5 seconds on Puppeteer + SMTP.

### Q12: What is BullMQ and what problem does it solve?

**A:** BullMQ is a Node.js library that implements robust, Redis-backed message queues. It gives you reliable job queuing with retries, backoff, delays, priorities, repeatable (cron) jobs, concurrency control, and event monitoring — all persisted in Redis so jobs survive process restarts.

**Tip:** "Redis-backed" is the key phrase — that's why jobs aren't lost on a crash, unlike a plain `setTimeout`.

### Q13: What's the difference between a Queue and a Worker in BullMQ?

**A:** A **Queue** is the producer side — you call `queue.add(name, data, opts)` to enqueue jobs. A **Worker** is the consumer side — you give it a processor function and it pulls jobs off the queue and runs them, respecting concurrency. They're separate objects, often in separate processes (API enqueues, worker process consumes).

**Tip:** Separating them lets you scale producers (web servers) and consumers (workers) independently.

## Intermediate

### Q14: Compare cache-aside, read-through, write-through, write-behind, and write-around.

**A:**

- **Cache-aside (lazy):** app manages cache; load on miss. Simple, resilient to cache failure, but first request is slow and data can go stale.
- **Read-through:** cache itself loads from DB on miss (via a provider). App only talks to cache. Cleaner but needs cache-layer support.
- **Write-through:** writes go to cache _and_ DB synchronously. Cache always fresh; writes are slower.
- **Write-behind (write-back):** write to cache, flush to DB asynchronously later. Fast writes, but risk of data loss if cache dies before flush.
- **Write-around:** writes go straight to DB, bypassing cache; cache fills on read. Good when written data isn't immediately re-read (avoids cache churn).

**Tip:** Most Node apps use cache-aside for reads + explicit invalidation (or write-through) on writes.

### Q15: Why is cache invalidation called one of the two hard problems in computer science?

**A:** Phil Karlton: "There are only two hard things in computer science: cache invalidation and naming things." Invalidation is hard because you must know _exactly when_ underlying data changed and _which_ cached entries depend on it — across multiple keys, services, and derived views. Get it wrong and you serve stale or incorrect data, often silently.

**Tip:** Strategies: TTL (time-based, simple), explicit invalidation on write (delete the key), versioned keys (`user:1:v3`), and event-driven invalidation (pub/sub a "user updated" message).

### Q16: What is a cache stampede / thundering herd, and how do you prevent it?

**A:** When a popular key expires, many concurrent requests all miss simultaneously and hammer the database at once, possibly overwhelming it. Mitigations:

1. a **lock / mutex** so only one request recomputes while others wait or serve stale
2. **request coalescing** (single-flight) so duplicate in-flight computations share one result
3. **TTL jitter** (randomize expiry so keys don't all expire together)
4. **stale-while-revalidate** (serve the old value while one worker refreshes in the background)

**Tip:** Name "stale-while-revalidate" explicitly — it's the pattern that keeps latency flat under load.

### Q17: What should you cache, and what should you not cache?

**A:** **Cache:** read-heavy, expensive-to-compute, infrequently-changing data — product catalogs, config, reference data, rendered pages, session lookups, aggregations. **Don't cache:** highly volatile data that changes every request, per-user secrets unless scoped/secured, data where staleness is unacceptable (account balances at point of transaction), or things so cheap they're not worth a round trip.

**Tip:** The decision is read:write ratio × cost-to-compute × tolerance-for-staleness.

### Q18: What are the caching layers in a typical web stack?

**A:** Browser cache (HTTP cache headers, service worker) → CDN/edge cache (static assets, cached responses) → application cache (Redis/in-process) → database cache (query/buffer pool). Each layer absorbs load before it reaches the next.

**Tip:** Cheapest cache is the one closest to the user (browser/CDN). Redis is the app-layer workhorse.

### Q19: How do you implement rate limiting with Redis? Compare the algorithms.

**A:**

- **Fixed window:** `INCR user:limit` with `EXPIRE` on first hit; reject if count > N. Simple but allows bursts at window boundaries (2N in a short span).
- **Sliding window log:** store request timestamps in a sorted set, `ZREMRANGEBYSCORE` to drop old ones, count the rest. Accurate, more memory.
- **Sliding window counter:** weighted blend of current + previous window. Good accuracy/memory trade-off.
- **Token bucket:** tokens refill over time; each request consumes one. Allows controlled bursts.

**Tip:** Do the read-modify-write in a **Lua script** so the whole check-and-increment is atomic — otherwise concurrent requests can both pass.

### Q20: What is an idempotency key and how does Redis help?

**A:** An idempotency key is a client-supplied unique id for an operation (e.g., a payment). The server records the key in Redis with `SET key result NX EX ttl`. If the same key arrives again (retry, double-click), `NX` fails and you return the stored result instead of performing the operation twice.

**Tip:** This is how you make non-idempotent POSTs safe against retries — critical for payments and "send email once" semantics.

### Q21: What's the difference between RDB and AOF persistence?

**A:** **RDB** takes periodic point-in-time **snapshots** of the dataset — compact, fast to load on restart, but you lose any writes since the last snapshot if Redis crashes. **AOF** (Append-Only File) logs **every write command**; on restart it replays the log. AOF is more durable (can fsync every second or every write) but files are larger and recovery is slower.

**Tip:** Production often enables both: AOF for durability, RDB for fast restarts/backups. With `appendfsync everysec` you risk at most ~1 second of writes.

### Q22: What are eviction policies and why do they matter?

**A:** When Redis hits `maxmemory`, the eviction policy decides what to drop: `noeviction` (reject writes — errors), `allkeys-lru` / `volatile-lru` (least recently used, all keys vs only keys with TTL), `allkeys-lfu` / `volatile-lfu` (least frequently used), `volatile-ttl` (shortest TTL first), `allkeys-random`.

**Tip:** For a pure cache, `allkeys-lru` (or `allkeys-lfu`) is standard. If Redis also stores must-keep data (like sessions/queues), use `volatile-*` so only expirable keys get evicted — and never `noeviction` by accident if you expect overflow.

### Q23: How do MULTI/EXEC transactions work in Redis, and what's a common misconception?

**A:** `MULTI` starts a transaction; commands are **queued**, then `EXEC` runs them atomically (no other client interleaves). The misconception: it is **not** like a SQL transaction — there's **no rollback** on a runtime error (e.g., wrong type op). Syntactically invalid commands abort the whole transaction at queue time, but a command that fails logically at EXEC still lets the others run.

**Tip:** Pair `WATCH key` before `MULTI` for **optimistic locking**: if the watched key changes before `EXEC`, the transaction aborts and you retry.

### Q24: What is Lua scripting in Redis used for?

**A:** `EVAL`/`EVALSHA` run a Lua script atomically on the server — the whole script executes as one unit with no other commands interleaving. Used for complex atomic read-modify-write logic: rate limiters, conditional updates, "check-and-set with computation." It also reduces round trips.

**Tip:** Lua is the go-to when `MULTI/WATCH` can't express the logic you need atomically (e.g., "decrement only if value > 0").

### Q25: How do Redis pub/sub and Redis Streams differ?

**A:** **Pub/sub** is fire-and-forget broadcast: publishers send to channels, subscribers connected _at that moment_ receive messages. No persistence, no replay, no acknowledgment — if a subscriber is offline or slow, the message is gone. **Streams** are an append-only persisted log with message IDs, **consumer groups** (work distribution + acks via `XACK`), and the ability to replay history.

**Tip:** Pub/sub for real-time fan-out where loss is acceptable (live notifications). Streams (or a real queue like BullMQ) when you need delivery guarantees.

### Q26: What is pipelining and how is it different from a transaction?

**A:** Pipelining sends multiple commands in one batch without waiting for each reply, drastically cutting network round-trip overhead. It's a **performance** optimization, not an atomicity guarantee — other clients' commands can interleave between your pipelined commands. `MULTI/EXEC` is about **atomicity**, not throughput (though it also batches).

**Tip:** Use pipelining to send 1000 INCRs as one round trip; use MULTI when those 1000 must run with nothing in between.

### Q27: How do you store sessions in Redis, and why is it better than in-memory?

**A:** Serialize the session into a key (e.g., `sess:<id>`) with a TTL matching the session lifetime; on each request, look it up by the session cookie. It beats in-process memory because it's **shared across multiple app instances** (horizontal scaling / load balancing) and **survives app restarts** — in-memory sessions would log everyone out and break under more than one server.

**Tip:** Trust-Node does this with IORedis + connect-redis. Mention sticky-sessions-vs-shared-store: Redis removes the need for sticky load balancing.

### Q28: What are job options in BullMQ (attempts, backoff, delay, priority, repeat)?

**A:**

- `attempts` — max retry count before the job is marked failed.
- `backoff` — delay between retries; `{ type: 'exponential', delay: 1000 }` waits 1s, 2s, 4s...
- `delay` — don't start until N ms pass (delayed jobs).
- `priority` — lower number = higher priority.
- `repeat` — `{ pattern: '0 9 * * *' }` cron-style recurring jobs.
- `removeOnComplete` / `removeOnFail` — auto-cleanup so Redis doesn't fill with finished jobs.

**Tip:** Exponential backoff + capped attempts is the standard resilient config for flaky external calls (SMTP, third-party APIs).

### Q29: How does concurrency work in a BullMQ Worker?

**A:** The `concurrency` option (e.g., `new Worker(name, fn, { concurrency: 5 })`) lets one worker process up to N jobs in parallel. For more total throughput, run multiple worker processes — they coordinate through Redis so each job is delivered to exactly one worker.

**Tip:** Concurrency is great for I/O-bound jobs (emails, HTTP calls). For CPU-bound work it won't help (Node is single-threaded) — use multiple processes or worker_threads.

### Q30: How do you create a repeatable / cron job in BullMQ?

**A:** Add a job with a `repeat` option:

```js
await queue.add(
  "fefo-expiry-check",
  {},
  { repeat: { pattern: "0 8 * * *" }, removeOnComplete: true }, // every day 08:00
);
```

BullMQ schedules the next occurrence automatically. You add it once at startup; BullMQ deduplicates by repeat key.

**Tip:** Pharmacy's daily FEFO expiry scan is exactly this. Unlike node-cron, it survives restarts and runs on whichever worker is free.

## Advanced

### Q31: Why must BullMQ job handlers be idempotent?

**A:** BullMQ (and virtually every distributed queue) provides **at-least-once** delivery. A job can run more than once: a worker may crash after doing the work but before acknowledging completion, a retry may fire on a transient error, or a job may be re-queued. If your handler isn't idempotent, you double-send emails, double-charge, or create duplicate records.

**Tip:** Make handlers idempotent with a dedupe guard: `SET job:done:<id> 1 NX EX ttl` before side effects, or use DB upserts / unique constraints keyed on a business id. This is the single most important queue concept.

### Q32: How do you implement a dead-letter queue pattern in BullMQ?

**A:** BullMQ keeps exhausted jobs in a **failed set** automatically — that's effectively a built-in DLQ; you inspect it with `queue.getFailed()` and retry or discard. For an explicit DLQ, listen for the `failed` event on a `QueueEvents` (or in the worker) and, once `attemptsMade >= attempts`, push the job's data to a separate `dead-letter` queue for manual review/alerting.

```js
worker.on("failed", async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    await deadLetterQueue.add("dead", {
      original: job.data,
      error: err.message,
    });
  }
});
```

**Tip:** Don't silently swallow permanently-failed jobs — route them somewhere a human or alert can see.

### Q33: What's the difference between at-least-once and exactly-once delivery, and can you achieve exactly-once?

**A:** **At-least-once:** every message is delivered, possibly more than once (the BullMQ default). **At-most-once:** delivered zero or one time, never duplicated, but may be lost. **Exactly-once** delivery is effectively impossible in a distributed system (the two-generals/network-partition problem). What you actually achieve is **exactly-once _processing_** = at-least-once delivery + **idempotent handlers**.

**Tip:** If an interviewer asks "how do you guarantee exactly-once?", the correct answer is "you don't guarantee exactly-once _delivery_; you make processing idempotent."

### Q34: How do you gracefully shut down a BullMQ worker?

**A:** On `SIGTERM`/`SIGINT`, call `await worker.close()`. This stops the worker from picking up new jobs and waits for in-flight jobs to finish (up to a timeout) before resolving, so you don't kill a job mid-write. Then close the queue and Redis connections.

```js
process.on("SIGTERM", async () => {
  await worker.close(); // finish in-flight jobs, stop fetching new ones
  await connection.quit();
  process.exit(0);
});
```

**Tip:** Without this, container orchestrators (Docker/K8s) SIGKILL the process and you get orphaned half-done jobs that must be retried.

### Q35: How do you scale workers horizontally?

**A:** Run more worker _processes_ (or containers/pods), all pointing at the same Redis and the same queue name. Redis acts as the coordination layer, so each job is handed to exactly one worker. Tune per-worker `concurrency` for I/O-bound work, scale process count for CPU-bound work or raw throughput.

**Tip:** This is the queue's superpower: producers and consumers decouple, and you scale consumers based purely on backlog depth (`queue.getWaitingCount()`).

### Q36: When should you NOT use a queue?

**A:** When the work is fast and the caller needs the result synchronously (a queue adds latency + complexity). When you need a strict immediate ordering guarantee that a concurrent worker pool can't provide. When the operation is trivially cheap. When adding Redis/infra overhead outweighs the benefit. And when strong transactional consistency with the request is required — a queued job is eventually-consistent.

**Tip:** "Don't queue a 5ms operation just because you can" is a good signal of judgment.

### Q37: Compare BullMQ, Bull, Agenda, and node-cron.

**A:**

- **node-cron** — in-process scheduler for time-based tasks; no persistence, no retries, dies with the process. Good for simple periodic jobs on a single instance.
- **Agenda** — MongoDB-backed job scheduler; good if you're already on Mongo and want scheduling without Redis.
- **Bull** — older, mature Redis-backed queue (callback-era API).
- **BullMQ** — the modern rewrite of Bull: TypeScript-first, better architecture (separate Worker/QueueEvents), FlowProducer for job graphs, actively maintained.

**Tip:** For new Node projects needing reliable queues, BullMQ is the default. node-cron is fine for trivial in-process timers but not for work that must not be lost.

### Q38: When do you use worker_threads vs a queue?

**A:** **worker_threads** run CPU-bound work in parallel within the same process, bypassing the single-thread bottleneck of the event loop (heavy computation, image/video transforms, parsing). **Queues (BullMQ)** are for offloading and durably scheduling work — typically I/O-bound (emails, API calls) — to _separate processes_ with retries and persistence. They're complementary: a BullMQ worker can itself spin up worker_threads for the CPU-heavy part of a job.

**Tip:** Rule of thumb from learn-background-task: CPU-bound → worker_threads; I/O-bound / must-survive-restart / needs-retries → queue.

### Q39: What is a FlowProducer in BullMQ?

**A:** A `FlowProducer` lets you define **parent/child job trees**: a parent job that runs only after all its child jobs complete, with children's results available to the parent. Useful for fan-out/fan-in workflows — e.g., process N pages of a document in parallel (children), then merge into one PDF (parent).

**Tip:** Mention it as the tool for job orchestration/dependencies, distinct from a flat queue.

### Q40: How do QueueEvents and Bull Board help with monitoring?

**A:** `QueueEvents` is a separate listener that emits queue-wide events (`completed`, `failed`, `progress`, `stalled`, `waiting`) by reading Redis streams — use it for metrics, logging, and reacting to job lifecycle from outside the worker. **Bull Board** is a web UI dashboard that shows queues, job counts, job data, and lets you retry/remove failed jobs.

**Tip:** A "stalled" event means a job didn't renew its lock (worker crashed/blocked) and was reclaimed — a signal of a blocking processor.

### Q41: How do you report and consume job progress?

**A:** Inside the processor call `await job.updateProgress(50)` (a percentage or an object). External listeners on `QueueEvents` receive `progress` events, letting a frontend poll or receive (via websocket) live progress for a long-running job like a big PDF export.

**Tip:** Great UX for Hirely-style long jobs: enqueue, return a jobId, let the client subscribe to progress.

### Q42: What are Redis distributed locks, and what are the caveats?

**A:** A simple lock: `SET lockkey <token> NX PX <ttl>` — `NX` ensures only one holder, `PX` auto-expires so a dead holder doesn't deadlock. Release by deleting only if the token matches (via Lua, to be atomic). **Redlock** extends this across multiple independent Redis nodes for HA. Caveats: clock drift and GC pauses can let two clients believe they hold the lock; the TTL might expire mid-operation; Redlock's safety is debated (Kleppmann's critique) — for true correctness you need **fencing tokens** (monotonic ids the protected resource checks).

**Tip:** Use Redis locks for "best-effort, avoid duplicate work" (e.g., only one worker runs the nightly job). Don't rely on them as the _only_ correctness guarantee for money-critical mutual exclusion.

### Q43: What are Redis replication and Sentinel for?

**A:** **Replication** = one primary (master) asynchronously copies its data to one or more replicas, giving read scaling and a hot standby. **Sentinel** monitors primaries/replicas and performs automatic **failover** (promotes a replica if the primary dies) plus service discovery for clients — that's high availability.

**Tip:** Replication is async, so a failover can lose the last few writes. Don't assume zero data loss on failover.

### Q44: What is Redis Cluster and how does sharding work?

**A:** Redis Cluster horizontally partitions data across nodes using **16384 hash slots**; each key maps (via CRC16) to a slot, and each node owns a range of slots. It enables datasets larger than one machine's RAM and spreads load. Multi-key operations only work if the keys live in the same slot — use **hash tags** `{user:1}:profile` / `{user:1}:settings` to force co-location.

**Tip:** Know the 16384-slots fact and the hash-tag trick — those are classic "have you actually run Cluster?" tells.

### Q45: How do you handle ordering / FIFO with queues?

**A:** A single BullMQ queue processed by a worker with `concurrency: 1` gives effective FIFO within that queue. But with multiple workers or concurrency > 1, jobs run in parallel and ordering across jobs is not guaranteed. For strict per-entity ordering, partition work (e.g., one queue or one logical group per entity) so each entity's jobs serialize while different entities still parallelize.

**Tip:** "Global ordering and high throughput are in tension" — the answer is per-key ordering, not one giant serial queue.

### Q46: How do you rate-limit jobs in BullMQ (not requests)?

**A:** Configure the worker with a `limiter`: `new Worker(name, fn, { limiter: { max: 100, duration: 60000 } })` processes at most 100 jobs per minute. Useful when downstream has its own rate limits (e.g., an email provider or third-party API caps requests/min).

**Tip:** This protects _downstream_ services from your worker fleet — distinct from the user-facing Redis rate limiter.

## Real Code

### Cache-aside with Redis (get → miss → DB → set with TTL)

```js
import IORedis from "ioredis";
const redis = new IORedis(process.env.REDIS_URL);
const TTL = 300; // 5 minutes

async function getRestaurant(id) {
  const key = `restaurant:${id}`;

  // 1) Try cache
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached); // HIT

  // 2) Miss -> source of truth
  const doc = await Restaurant.findById(id).lean();
  if (!doc) return null;

  // 3) Populate cache with TTL (jitter to avoid synchronized expiry)
  const ttl = TTL + Math.floor(Math.random() * 60);
  await redis.set(key, JSON.stringify(doc), "EX", ttl);
  return doc;
}

// Invalidate on write
async function updateRestaurant(id, patch) {
  const doc = await Restaurant.findByIdAndUpdate(id, patch, { new: true });
  await redis.del(`restaurant:${id}`); // explicit invalidation
  return doc;
}
```

### BullMQ Queue + Worker with retries/backoff + dead-letter (Hirely PDF/email)

```js
import { Queue, Worker, QueueEvents } from "bullmq";
const connection = { host: "127.0.0.1", port: 6379 };

// --- Producer (in the API) ---
export const pdfQueue = new Queue("pdf-email", { connection });
const deadLetter = new Queue("pdf-email-dlq", { connection });

export async function enqueueOffer(candidateId) {
  await pdfQueue.add(
    "generate-and-send",
    { candidateId },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 }, // 2s,4s,8s,16s
      removeOnComplete: 1000, // keep last 1000 for inspection
      removeOnFail: false, // keep failures (acts as DLQ source)
    },
  );
}

// --- Consumer (worker process) ---
const worker = new Worker(
  "pdf-email",
  async (job) => {
    const { candidateId } = job.data;
    await job.updateProgress(10);
    const pdf = await renderOfferPdf(candidateId); // Puppeteer (CPU/IO heavy)
    await job.updateProgress(70);
    await sendEmail(candidateId, pdf); // SMTP (flaky -> retried)
    await job.updateProgress(100);
    return { sent: true };
  },
  { connection, concurrency: 5 },
);

// Route permanently-failed jobs to an explicit dead-letter queue
worker.on("failed", async (job, err) => {
  if (job && job.attemptsMade >= job.opts.attempts) {
    await deadLetter.add("dead", { data: job.data, error: err.message });
  }
});
```

### Idempotent job handler (jobs can run more than once)

```js
const worker = new Worker(
  "pdf-email",
  async (job) => {
    const guardKey = `sent:offer:${job.data.candidateId}`;

    // SET NX: only the first run wins; retries/duplicates short-circuit.
    const acquired = await redis.set(guardKey, "1", "NX", "EX", 60 * 60 * 24);
    if (!acquired) {
      return { skipped: "already-processed" }; // idempotent: no double email
    }

    try {
      const pdf = await renderOfferPdf(job.data.candidateId);
      await sendEmail(job.data.candidateId, pdf);
      return { sent: true };
    } catch (err) {
      await redis.del(guardKey); // release so a retry can run after a real failure
      throw err;
    }
  },
  { connection },
);
```

### Sliding-window rate limiter (atomic via Lua)

```js
// Allow `limit` requests per `windowMs` per identifier, using a sorted set of timestamps.
const SLIDING_WINDOW = `
  local key    = KEYS[1]
  local now    = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit  = tonumber(ARGV[3])
  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)   -- drop old hits
  local count = redis.call('ZCARD', key)
  if count >= limit then
    return 0                                              -- rejected
  end
  redis.call('ZADD', key, now, now .. '-' .. math.random())
  redis.call('PEXPIRE', key, window)
  return 1                                                -- allowed
`;

async function allow(id, limit = 100, windowMs = 60000) {
  const res = await redis.eval(
    SLIDING_WINDOW,
    1,
    `rl:${id}`,
    Date.now(),
    windowMs,
    limit,
  );
  return res === 1;
}

// Express middleware
app.use(async (req, res, next) => {
  if (!(await allow(req.ip)))
    return res.status(429).json({ error: "Too Many Requests" });
  next();
});
```

### Repeatable / cron job (Pharmacy FEFO daily scan)

```js
import { Queue, Worker } from "bullmq";
const fefoQueue = new Queue("fefo", { connection });

// Register once at startup; BullMQ dedupes by repeat key.
await fefoQueue.add(
  "expiry-scan",
  {},
  { repeat: { pattern: "0 8 * * *" }, removeOnComplete: true }, // daily 08:00
);

new Worker(
  "fefo",
  async () => {
    const soon = new Date(Date.now() + 30 * 86400000); // expiring within 30 days
    const batches = await Batch.find({
      expiry: { $lte: soon },
      qty: { $gt: 0 },
    }).sort({ expiry: 1 }); // First-Expiry-First-Out
    for (const b of batches) await notifyPharmacist(b);
  },
  { connection },
);
```

### Graceful worker shutdown

```js
async function shutdown(signal) {
  console.log(`Received ${signal}, draining worker...`);
  await worker.close(); // stop fetching, let in-flight jobs finish
  await pdfQueue.close();
  await connection.quit?.();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

## Common Mistakes / Red Flags

- **Caching without a TTL** — a forgotten key serves stale data forever. Always set an expiry as a safety net even when you also invalidate explicitly.
- **`SET` then `EXPIRE` as two steps** — if the process dies in between you get a key with no TTL. Use `SET key val EX n` atomically.
- **Running `KEYS *` in production** — it blocks the single thread. Use `SCAN`.
- **Assuming MULTI/EXEC rolls back** — it doesn't. Use WATCH for optimistic concurrency, Lua for atomic compute.
- **Non-idempotent job handlers** — the #1 queue bug. At-least-once delivery means double emails / double charges unless you dedupe.
- **No `maxmemory` / wrong eviction policy** — Redis silently fills RAM; `noeviction` then errors all writes, or LRU evicts your sessions/queues.
- **Mixing cache and durable data in one Redis with `allkeys-lru`** — your queue/session keys get evicted. Separate instances or use `volatile-*` + TTLs.
- **Treating pub/sub like a durable queue** — messages are lost if no subscriber is connected. Use Streams or BullMQ for guarantees.
- **No graceful shutdown** — SIGKILL during a job orphans half-done work; always `worker.close()` on signals.
- **Caching user-specific data under a shared key** — leaks one user's data to another. Scope keys by user id.
- **Synchronous heavy work in the request** (generating a PDF inline) instead of queuing — ties up the event loop and times out clients.
- **Cache stampede ignored** — a single hot key expiring takes down the DB. Add jitter / locks / stale-while-revalidate.
- **Storing huge values / unbounded lists** — large keys block on serialization and skew cluster slots; keep values small and lists trimmed.
- **Relying on Redis distributed locks for money-critical correctness** without fencing tokens — clock skew and TTL expiry can break mutual exclusion.

## Further Reading

- Redis docs — data types & persistence: https://redis.io/docs/latest/develop/data-types/
- BullMQ official guide: https://docs.bullmq.io/
- Martin Kleppmann, "How to do distributed locking" (Redlock critique): https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
- AWS — Caching strategies & best practices: https://aws.amazon.com/caching/best-practices/
