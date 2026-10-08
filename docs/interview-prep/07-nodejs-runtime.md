# Node.js Runtime & Internals (46 questions)

> Node.js internals are the backbone of every backend interview you'll face. Interviewers probe the event loop, single-threaded concurrency, and the `setTimeout`/`setImmediate`/`process.nextTick` ordering puzzle because they reveal whether you actually understand _how_ your Express/NestJS servers stay responsive under load. For someone running BullMQ workers, streaming large files, processing background jobs, and talking to Redis, this knowledge is not academic: it directly explains why a CPU-bound task freezes your API, why backpressure matters when piping uploads, when to reach for `worker_threads` vs `cluster`, and how to shut down gracefully without dropping in-flight jobs. Nail this chapter and you can reason about throughput, latency, and scaling instead of guessing.

## Quick Revision Checklist

- Node.js = V8 (JS engine) + libuv (event loop + thread pool) + Node C++ bindings + core JS libs.
- Single JS thread runs your code; I/O is offloaded so the thread is never blocked waiting.
- The event loop has ordered phases: **timers → pending callbacks → poll → check → close callbacks** (idle/prepare are internal).
- Between every phase (and after each callback in the main script), Node drains the **microtask queues**: `process.nextTick` first, then Promise jobs.
- `process.nextTick` runs before Promise microtasks; both run before the loop continues to the next phase.
- `setTimeout(fn, 0)` runs in the **timers** phase; `setImmediate` runs in the **check** phase. Order between them is non-deterministic from the main module, deterministic inside an I/O callback (`setImmediate` first).
- **libuv thread pool** (default 4 threads, `UV_THREADPOOL_SIZE`) handles fs, DNS (`dns.lookup`), crypto, zlib — _not_ network sockets (those use the OS).
- **CPU-bound** work blocks the single thread → use `worker_threads`. **I/O-bound** work scales naturally on one thread.
- `cluster` / multiple processes scale across CPU cores; `worker_threads` share memory within one process for CPU work.
- **Streams** (Readable/Writable/Duplex/Transform) process data in chunks with backpressure — essential for large files and avoiding OOM.
- **Buffers** hold raw binary data outside the V8 heap.
- **EventEmitter** is the pub/sub backbone of streams, HTTP servers, and most Node APIs.
- **CommonJS** (`require`, synchronous, cached) vs **ESM** (`import`, async, static) — set via `.mjs`/`.cjs` or `"type"` in package.json.
- Handle `unhandledRejection` and `uncaughtException`; prefer crash-and-restart over limping on.
- Express/NestJS HTTP servers are thin layers over the core `http` module.
- Graceful shutdown: trap `SIGTERM`, stop accepting connections, drain jobs, close DB/Redis, then exit.
- Scale horizontally with **stateless** processes behind a load balancer; WebSockets need **sticky sessions** or a shared adapter.
- Memory: V8 heap caps ~1.5–2GB by default; raise with `--max-old-space-size`; watch for leaks (unbounded caches, listeners, closures).

## Basic

### Q1: What is Node.js and what are its main use cases?

**A:** Node.js is a JavaScript runtime built on Chrome's V8 engine that lets you run JavaScript outside the browser, primarily on servers. It uses an event-driven, non-blocking I/O model that makes it efficient for I/O-heavy, high-concurrency workloads. Common use cases: REST/GraphQL APIs, real-time apps (chat, WebSockets), microservices, BFF (backend-for-frontend), CLI tools, streaming services, and background job processors (e.g., BullMQ workers).

**Tip:** Say "I/O-bound, high-concurrency" out loud — that's the sweet spot. Then add "less ideal for CPU-bound number-crunching unless you offload to worker_threads." Showing the trade-off impresses interviewers.

### Q2: What is the V8 engine?

**A:** V8 is Google's open-source JavaScript and WebAssembly engine, written in C++, that powers Chrome and Node.js. It compiles JavaScript to native machine code (using JIT compilation via its Ignition interpreter and TurboFan optimizing compiler) and manages memory through garbage collection. Node embeds V8 to execute your JS and exposes C++ bindings so JS can reach OS-level capabilities.

**Tip:** Mention that V8 only runs JS — Node adds libuv, the event loop, and core modules around it. The distinction (V8 = engine, Node = runtime) is a classic clarifying point.

### Q3: Why is Node.js called "single-threaded"?

**A:** Your JavaScript executes on a single main thread — there is one call stack, so only one piece of your JS code runs at a time. This avoids the complexity of locks and race conditions in your application logic. However, Node is not single-threaded overall: libuv maintains a thread pool for certain operations, and the OS handles network I/O asynchronously.

**Tip:** Precise phrasing wins: "JavaScript execution is single-threaded; I/O is multi-threaded under the hood via libuv and the OS."

### Q4: What does "non-blocking I/O" mean?

**A:** When Node initiates an I/O operation (reading a file, querying a DB), it doesn't sit and wait for it to finish. It registers a callback and immediately continues executing other code. When the I/O completes, the event loop schedules the callback to run. This lets one thread juggle thousands of concurrent connections.

**Tip:** Contrast with blocking: `fs.readFileSync` halts the thread; `fs.readFile` returns control immediately and calls back later.

### Q5: What is the difference between blocking and non-blocking code?

**A:** Blocking code stops the execution of further JavaScript until the current operation completes (e.g., synchronous fs calls, `JSON.parse` on huge strings, tight loops). Non-blocking code returns control to the event loop immediately and resumes via a callback/promise. Blocking code on the main thread degrades the throughput of the entire server because no other request can be processed meanwhile.

**Tip:** "One blocking call blocks everyone" — in Node a single slow synchronous operation stalls all concurrent requests, unlike thread-per-request servers.

### Q6: What are global objects in Node.js?

**A:** Globals are available without `require`: `process` (current process info/control), `console`, `Buffer`, `setTimeout`/`setInterval`/`setImmediate`, `__dirname` and `__filename` (CommonJS only), `module`, `exports`, `require`, and `globalThis`. Unlike the browser there is no `window`/`document`.

**Tip:** Note `__dirname`/`__filename` don't exist in ESM — you reconstruct them via `import.meta.url` and `fileURLToPath`.

### Q7: How do you read and use environment variables and configuration?

**A:** Environment variables live on `process.env` (always strings). You set them per-environment (shell, container, secrets manager) and read them like `process.env.PORT`. For local dev, `dotenv` loads a `.env` file. Best practice: validate and centralize config at startup (e.g., with `zod`/`joi` or NestJS `ConfigModule`) so the app fails fast on missing values.

**Tip:** Never commit `.env` or hardcode secrets. Coerce types explicitly (`Number(process.env.PORT)`) since everything in `process.env` is a string.

### Q8: What is npm and what is package.json?

**A:** npm is the default package manager and registry for Node. `package.json` is the project manifest: metadata, scripts, and dependency declarations. `npm install` reads it, resolves the dependency tree, and writes a `package-lock.json` that pins exact versions and the resolved tree for reproducible installs.

**Tip:** `npm ci` (clean install) uses the lockfile exactly and is faster/deterministic — use it in CI and Docker builds rather than `npm install`.

### Q9: What's the difference between dependencies and devDependencies?

**A:** `dependencies` are needed to run the app in production (Express, Redis client, BullMQ). `devDependencies` are only needed during development/build/test (TypeScript, ESLint, Jest, ts-node, nodemon). `npm install --production` (or `NODE_ENV=production`) skips devDependencies, shrinking the deployed image.

**Tip:** A common mistake: putting `typescript` in `dependencies`. If you compile in CI and ship JS, TS belongs in devDependencies.

### Q10: What is semantic versioning (semver)?

**A:** Versions are `MAJOR.MINOR.PATCH`. MAJOR = breaking changes, MINOR = backward-compatible features, PATCH = backward-compatible bug fixes. In package.json, `^1.2.3` allows minor+patch updates (`<2.0.0`), `~1.2.3` allows only patch updates (`<1.3.0`), and `1.2.3` pins exactly.

**Tip:** The lockfile is what actually guarantees reproducibility; the `^`/`~` ranges only define _what's allowed_ on a fresh install.

### Q11: What is npx?

**A:** `npx` runs a package's binary without globally installing it — it uses a locally installed version if present, otherwise downloads it temporarily. Great for one-off tools and scaffolding (`npx create-react-app`, `npx prisma migrate`, `npx tsc`).

**Tip:** It guarantees you run the project-local CLI version (e.g., the repo's exact `tsc`), avoiding "works on my machine" version drift.

### Q12: What does the `path` module do?

**A:** `path` provides cross-platform utilities for working with file/directory paths: `path.join`, `path.resolve`, `path.basename`, `path.extname`, `path.dirname`. It abstracts away OS differences (Windows `\` vs POSIX `/`).

**Tip:** Always build paths with `path.join(__dirname, 'config', 'x.json')` instead of string concatenation — it's safer and portable.

### Q13: What is the difference between fs sync and async methods?

**A:** The `fs` module offers three styles: synchronous (`fs.readFileSync` — blocks the thread, returns/throws directly), callback-based async (`fs.readFile(path, cb)`), and promise-based (`fs.promises.readFile` / `await`). Sync methods are fine for startup config loading or CLI scripts but should be avoided in request handlers because they block the event loop.

**Tip:** Rule of thumb: sync at boot, async in the hot path. Reaching for `*Sync` inside a route handler is a red flag.

## Intermediate

### Q14: Explain the Node.js event loop and its phases.

**A:** The event loop is libuv's mechanism for orchestrating asynchronous callbacks on the single JS thread. Each iteration ("tick") moves through ordered phases:

1. **Timers** — executes callbacks scheduled by `setTimeout`/`setInterval` whose threshold has elapsed.
2. **Pending callbacks** — executes I/O callbacks deferred from a previous loop iteration (e.g., some TCP errors).
3. **Idle, prepare** — internal use only.
4. **Poll** — retrieves new I/O events and executes their callbacks; this is where the loop will block/wait for I/O if there's nothing else to do.
5. **Check** — executes `setImmediate` callbacks.
6. **Close callbacks** — executes close events like `socket.on('close')`.

Between phases (and after each callback in some contexts) Node drains the microtask queues.

**Tip:** Memorize the order: **Timers, Pending, Poll, Check, Close**. The poll phase is the "heart" — it's where Node waits for incoming I/O.

### Q15: What is libuv and the thread pool?

**A:** libuv is the C library that gives Node its event loop and cross-platform async I/O. For operations that can't be done asynchronously at the OS level, libuv uses a **thread pool** (default 4 threads, configurable via `UV_THREADPOOL_SIZE`, max 1024). The pool handles file system operations, `dns.lookup`, and CPU-ish work like `crypto` (pbkdf2, etc.) and `zlib` compression. Network I/O (TCP/UDP) does _not_ use the pool — it uses the OS's efficient async mechanisms (epoll/kqueue/IOCP).

**Tip:** A great insight: heavy `crypto`/`zlib`/`fs` workloads can exhaust the 4-thread pool and serialize — bump `UV_THREADPOOL_SIZE`. But network requests scale far beyond it because they don't use the pool.

### Q16: What are microtasks, and how do process.nextTick and Promise microtasks differ?

**A:** Microtasks run between phases of the event loop, before the loop proceeds. Node has two microtask queues: the **nextTick queue** (`process.nextTick` callbacks) and the **Promise microtask queue** (`.then`/`await`/`queueMicrotask`). After each operation, Node fully drains the nextTick queue first, then fully drains the Promise queue. Both have higher priority than timers/immediates/I/O.

**Tip:** Order: `process.nextTick` → Promise microtasks → next event loop phase. Overusing `process.nextTick` recursively can starve the event loop (I/O never gets to run).

### Q17: Predict the output: the setTimeout / setImmediate / process.nextTick ordering puzzle.

**A:** Classic interview code:

```js
console.log("1: start");

setTimeout(() => console.log("2: setTimeout"), 0);
setImmediate(() => console.log("3: setImmediate"));

Promise.resolve().then(() => console.log("4: promise"));
process.nextTick(() => console.log("5: nextTick"));

console.log("6: end");
```

Output:

```
1: start
6: end
5: nextTick      // nextTick queue drains first
4: promise       // then Promise microtasks
2: setTimeout    // timers phase  (order vs immediate non-deterministic from main)
3: setImmediate  // check phase
```

The synchronous code (`1`, `6`) runs first. Then microtasks drain: `nextTick` (`5`) before Promise (`4`). Then the loop runs phases: timers (`2`) and check (`3`). From the main module the timer-vs-immediate order is not guaranteed because the 0ms timer may or may not be ready when the loop starts.

**Tip:** The "gotcha": **inside an I/O callback**, `setImmediate` _always_ runs before `setTimeout(0)`, because after the poll phase the loop hits the check phase before looping back to timers. Mention this — it shows real understanding.

### Q18: Why does setImmediate beat setTimeout(0) inside an I/O callback?

**A:** When you schedule both from inside an I/O callback, you're already in the poll phase. The very next phase is **check** (where `setImmediate` lives), so the immediate fires this iteration. The timers phase doesn't come around again until the next loop iteration, so `setTimeout(0)` fires after. From the main module, timing of the loop start makes the order unpredictable.

**Tip:**

```js
const fs = require("fs");
fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});
// Always prints: immediate, then timeout
```

### Q19: What is the difference between CPU-bound and I/O-bound work, and why does CPU-bound block the loop?

**A:** I/O-bound work spends most of its time waiting on external resources (disk, network, DB) — Node offloads the wait, so the thread stays free. CPU-bound work (image resizing, encryption loops, big JSON, complex calculations) keeps the single JS thread busy executing, so the event loop cannot advance and _no other request, timer, or callback runs_ until it finishes. This is why a heavy synchronous computation freezes your whole API.

**Tip:** The fix isn't async/await (that doesn't make CPU work parallel) — it's offloading to `worker_threads`, a child process, or an external job/queue.

### Q20: What are worker_threads and when should you use them?

**A:** `worker_threads` let you run JavaScript in parallel on separate threads _within the same process_, each with its own V8 instance and event loop, communicating via message passing (and optionally `SharedArrayBuffer` for shared memory). Use them for CPU-bound tasks (parsing, compression, crypto, ML inference) so the main thread stays responsive. They are not for scaling I/O — that's already handled by the event loop.

**Tip:** Use a worker _pool_ (e.g., `piscina`) rather than spawning a worker per request; creating threads is relatively expensive.

```js
// worker.js
const { parentPort, workerData } = require("worker_threads");
function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
parentPort.postMessage(fib(workerData.n));

// main.js
const { Worker } = require("worker_threads");
function runFib(n) {
  return new Promise((resolve, reject) => {
    const w = new Worker("./worker.js", { workerData: { n } });
    w.on("message", resolve);
    w.on("error", reject);
    w.on("exit", (code) => {
      if (code !== 0) reject(new Error(`exited ${code}`));
    });
  });
}
runFib(42).then((r) => console.log("result", r)); // main thread stays free
```

### Q21: What is the cluster module and how does it scale across cores?

**A:** Because one Node process uses a single CPU core for JS, the `cluster` module forks multiple worker processes (typically one per core) that share the same server port. The primary process distributes incoming connections (round-robin by default on most platforms). Each worker is a full Node process with its own memory and event loop, giving you multi-core throughput.

**Tip:** In containerized/cloud setups, people often skip `cluster` and instead run one process per container, scaling with the orchestrator (Kubernetes/ECS) — or use PM2's cluster mode. Mention statelessness so any worker can serve any request.

### Q22: What is the child_process module — spawn vs exec vs fork?

**A:** `child_process` runs external commands or new Node processes:

- **`spawn`** — launches a command and streams stdout/stderr; best for large/long-running output (no buffer limit).
- **`exec`** — runs a command in a shell and buffers the whole output into a callback; convenient for short output but risky for large output (buffer overflow) and shell injection.
- **`execFile`** — like exec but without a shell (safer).
- **`fork`** — a specialized spawn for new Node scripts that sets up an IPC channel for message passing between parent and child.

**Tip:** Prefer `spawn`/`execFile` over `exec` to avoid shell-injection and unbounded buffering. `fork` is for Node-to-Node IPC; `worker_threads` is usually better for CPU work in-process.

### Q23: What are streams and what are the four types?

**A:** Streams process data in chunks over time instead of loading it all into memory. Four types:

- **Readable** — source you read from (`fs.createReadStream`, HTTP request).
- **Writable** — destination you write to (`fs.createWriteStream`, HTTP response).
- **Duplex** — both readable and writable (TCP socket).
- **Transform** — a duplex stream that modifies data as it passes through (`zlib.createGzip`, encryption).

**Tip:** Streams shine for large files, network data, and pipelines — constant memory regardless of data size. "Why streams for a 5GB file?" → you'd OOM reading it into one buffer.

### Q24: What is backpressure and how do streams handle it?

**A:** Backpressure occurs when a writable destination (slow disk, slow network) can't consume data as fast as the readable source produces it. Without handling, data buffers in memory until you OOM. `pipe()` (and `stream.pipeline`) automatically manage backpressure: when the writable's internal buffer is full, `write()` returns `false`, the readable pauses, and it resumes on the `'drain'` event.

**Tip:** Use `stream.pipeline()` (or `pipeline` from `node:stream/promises`) instead of raw `.pipe()` — it propagates errors and cleans up resources, which `.pipe()` does not.

```js
const { pipeline } = require("node:stream/promises");
const fs = require("node:fs");
const zlib = require("node:zlib");

await pipeline(
  fs.createReadStream("big-input.log"),
  zlib.createGzip(), // Transform stream
  fs.createWriteStream("big-input.log.gz"),
);
// Constant memory, automatic backpressure, errors propagate
```

### Q25: What are Buffers in Node.js?

**A:** A `Buffer` is a fixed-length chunk of raw binary data stored _outside_ the V8 heap. Buffers let Node handle binary streams (files, TCP, images, crypto) that aren't representable as UTF-8 strings. You create them with `Buffer.from(...)` / `Buffer.alloc(n)` and convert with `.toString(encoding)`.

**Tip:** Use `Buffer.alloc(n)` (zero-filled, safe) not the deprecated `new Buffer(n)` (uninitialized, could leak old memory). Buffers underpin every stream chunk.

### Q26: What is the EventEmitter pattern?

**A:** `EventEmitter` is Node's implementation of the observer/pub-sub pattern. Objects emit named events and listeners subscribe with `.on()` (and emit with `.emit()`). It's the foundation of streams, HTTP servers, sockets, and BullMQ events. You extend it to build event-driven components.

**Tip:** Watch for the `MaxListenersExceededWarning` (default 10 listeners) — it usually signals a leak where listeners are added but never removed. Use `.once()` for one-shot handlers.

```js
const { EventEmitter } = require("node:events");

class JobQueue extends EventEmitter {
  add(job) {
    this.emit("queued", job);
    setImmediate(() => this.emit("completed", job)); // simulate async work
  }
}

const q = new JobQueue();
q.on("queued", (j) => console.log("queued:", j.id));
q.once("completed", (j) => console.log("done:", j.id)); // fires only once
q.add({ id: 1 });
```

### Q27: What's the difference between CommonJS and ESM in Node?

**A:** **CommonJS (CJS)** uses `require()`/`module.exports`, loads synchronously, resolves at runtime, and provides `__dirname`/`__filename`. **ES Modules (ESM)** use `import`/`export`, are statically analyzable, load asynchronously, support top-level `await`, and use `import.meta.url`. Node picks the mode by file extension (`.cjs` vs `.mjs`) or the `"type": "module"`/`"commonjs"` field in package.json.

**Tip:** ESM can import CJS, but CJS can't `require()` an ESM module synchronously (you'd use dynamic `import()`). For TypeScript backends, know how your `tsconfig` `module`/`moduleResolution` maps to the emitted format.

### Q28: How does module resolution and the require cache work?

**A:** When you `require('x')`, Node resolves it (core module → relative/absolute path → `node_modules` walking up the tree), loads and executes it once, caches the result in `require.cache` keyed by resolved path, and returns the cached `module.exports` on subsequent requires. This caching means a module's top-level code runs only once — useful for singletons (DB pools, config).

**Tip:** This is why a config or DB-connection module acts as a singleton. Deleting `require.cache[...]` to force a reload is a hack mostly seen in dev hot-reload tooling — avoid in production.

### Q29: How do you convert callback-based APIs to promises with util.promisify?

**A:** `util.promisify` wraps an error-first callback function (signature `(err, result)`) and returns a version that returns a Promise, enabling `async/await`. Many core modules already ship promise variants (`fs.promises`, `dns.promises`).

**Tip:**

```js
const util = require("node:util");
const { exec } = require("node:child_process");
const execAsync = util.promisify(exec);

async function diskUsage() {
  const { stdout } = await execAsync("df -h");
  return stdout;
}
```

Prefer the built-in promise APIs when available; reach for `promisify` for third-party callback libs.

### Q30: Describe the evolution of async patterns in Node.

**A:**

1. **Error-first callbacks** — `fn(args, (err, data) => {})`, the original pattern, prone to "callback hell" (deep nesting).
2. **Promises** — `.then()/.catch()` chaining, flatter and composable.
3. **async/await** — syntactic sugar over promises, reads like synchronous code with `try/catch` error handling.

Modern Node code uses async/await, falling back to promises for combinators (`Promise.all`, `allSettled`, `race`).

**Tip:** `Promise.all` fails fast on first rejection; use `Promise.allSettled` when you want all results regardless of individual failures (e.g., fan-out to multiple services).

### Q31: What is the error-first callback convention?

**A:** Node's traditional async functions pass an `Error` (or `null`) as the _first_ callback argument and the result(s) afterward: `(err, data) => { if (err) ... }`. This forces callers to handle errors explicitly. Promise/async-await code replaces it with rejection and `try/catch`.

**Tip:** Forgetting to check `err` (or to `return` after handling it) is a classic source of bugs where execution continues with undefined data.

## Advanced

### Q32: How do you handle uncaughtException and unhandledRejection?

**A:** `process.on('uncaughtException', handler)` catches synchronous errors that bubble to the top with no try/catch; `process.on('unhandledRejection', handler)` catches rejected promises with no `.catch`. The accepted practice: log the error, attempt a quick cleanup, and **let the process exit/restart** (via PM2, systemd, or the orchestrator) rather than continuing in a possibly corrupted state.

**Tip:** Don't use these as a global try/catch to keep limping along — after an uncaught exception, app state is undefined. "Crash fast, restart clean" is the production stance.

```js
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  // optionally translate to an uncaughtException to trigger restart
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1); // let the supervisor restart us
});
```

### Q33: Why were domains deprecated?

**A:** The `domain` module aimed to group I/O operations and route their errors to a single handler, compensating for the difficulty of tracking async error context. It was deprecated because it had fundamental design problems (leaks, unreliable composition, intrusive behavior) and overlapped with promises. Modern code uses promises/async-await for error propagation and `AsyncLocalStorage` (from `async_hooks`) for context propagation.

**Tip:** If asked "how do you propagate request context (trace IDs) across async calls?", the modern answer is `AsyncLocalStorage`, not domains.

### Q34: How does garbage collection and memory management work in Node/V8?

**A:** V8 uses a generational, mark-and-sweep garbage collector. The heap is split into **young generation** (new short-lived objects, collected frequently with a fast "scavenge") and **old generation** (long-lived objects, collected less often with mark-sweep-compact). Objects still reachable survive; unreachable ones are reclaimed. GC pauses your JS thread briefly. Outside the heap: Buffers and `external` memory.

**Tip:** Default old-space cap is roughly 1.5–2GB on 64-bit. Raise it with `node --max-old-space-size=4096`. Frequent full GCs or a steadily climbing heap signal a leak.

### Q35: What causes memory leaks in Node and how do you find them?

**A:** Common causes: unbounded in-memory caches/maps, forgotten event listeners (each `.on` retains the closure), timers/intervals never cleared, global arrays that only grow, and closures capturing large objects. To diagnose: monitor `process.memoryUsage()` (`heapUsed`, `rss`), take heap snapshots in Chrome DevTools / `--inspect`, compare snapshots to find growing retained objects, and use tools like `clinic.js`, `heapdump`, or `--heapsnapshot-near-heap-limit`.

**Tip:** Reproduce under load, take two snapshots over time, and look at "objects allocated between snapshots that weren't freed." Bounded caches (LRU with max size/TTL) prevent the most common leak.

### Q36: What are Node.js timers and their gotchas?

**A:** `setTimeout(fn, ms)` runs once after a delay; `setInterval(fn, ms)` runs repeatedly; `setImmediate(fn)` runs after the current poll phase; `process.nextTick(fn)` runs before the loop continues. Timer delays are a _minimum_, not exact — a busy event loop delays them. `setInterval` doesn't wait for the callback to finish, so long callbacks can overlap/stack.

**Tip:** For recurring async work, prefer a self-scheduling `setTimeout` after the work completes over `setInterval`, to avoid overlapping executions. Use `.unref()` on a timer so it doesn't keep the process alive.

### Q37: How does the HTTP module work and how does Express build on it?

**A:** The core `http` module provides `http.createServer((req, res) => {...})`, where `req` is a Readable stream (`IncomingMessage`) and `res` is a Writable stream (`ServerResponse`). It's an EventEmitter emitting `'request'`, `'connection'`, etc. Express (and NestJS's Express adapter) wraps this: it provides routing, middleware chaining, body parsing, and helpers like `res.json()` — but ultimately calls the same low-level `res.end()` on the core objects.

**Tip:** Understanding that `req`/`res` are streams explains streaming uploads/downloads, and why middleware order matters (it's a single request-handling pipeline over the core server).

### Q38: How do you implement graceful shutdown (SIGTERM handling)?

**A:** On `SIGTERM` (sent by Docker/Kubernetes/PM2 on stop/deploy), you should: stop accepting new connections (`server.close()`), finish in-flight requests, drain/close background workers and queues (BullMQ `worker.close()`), close DB/Redis connections, then exit. Add a timeout to force-exit if draining hangs. This prevents dropped requests and half-processed jobs during deploys.

**Tip:** Kubernetes sends SIGTERM then waits `terminationGracePeriodSeconds` before SIGKILL — your handler must finish within that window.

```js
async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(); // stop new HTTP connections
  await worker.close(); // let BullMQ finish current jobs
  await redis.quit();
  await mongoose.disconnect();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
// Safety net: force-exit if cleanup hangs
process.on("SIGTERM", () => setTimeout(() => process.exit(1), 10_000).unref());
```

### Q39: How do BullMQ workers run inside Node?

**A:** BullMQ is a Redis-backed job queue. A **Worker** is a Node process (or thread) that connects to Redis, polls/blocks for jobs on a queue, and runs your async processor function for each job, with concurrency, retries, backoff, and rate limiting. The work runs on the worker's event loop — so a CPU-heavy job will block _that_ worker's loop. BullMQ supports **sandboxed processors** (running each job in a separate `child_process`/fork) for isolation and to avoid blocking the main worker.

**Tip:** For CPU-bound jobs, use sandboxed processors or offload to worker_threads inside the processor; otherwise one heavy job stalls the worker's concurrency. Run workers as separate deployments from your API so they scale independently.

### Q40: How do you scale Node.js applications?

**A:** Two axes: **vertical** within a host — use `cluster` or PM2 cluster mode (one process per core) and `worker_threads` for CPU work. **Horizontal** — run many stateless instances behind a load balancer and scale the count (Kubernetes HPA, autoscaling groups). The key requirement is **statelessness**: no in-memory session/state tied to a specific instance; push shared state to Redis/DB so any instance can serve any request.

**Tip:** Separate concerns: API processes, WebSocket gateways, and BullMQ workers should be independent deployments, each scaled to its own load profile.

### Q41: Why do WebSockets need sticky sessions, and what's the alternative?

**A:** A WebSocket is a long-lived connection bound to one specific server instance. With multiple instances behind a load balancer, a client must keep talking to the _same_ instance — hence **sticky sessions** (session affinity, e.g., by IP/cookie). But sticky alone doesn't let instance A push a message to a client connected to instance B. The fix is a shared pub/sub backplane — e.g., the **Socket.IO Redis adapter** — so messages broadcast across all instances.

**Tip:** Best answer combines both: sticky sessions for the connection + a Redis adapter for cross-instance broadcasting. Mention that polling-based fallbacks especially need stickiness.

### Q42: What's the difference between worker_threads and the cluster module?

**A:** `cluster` forks separate _processes_ (each with isolated memory, its own V8/event loop) that share a server port — used to scale **I/O-bound** servers across cores. `worker_threads` create _threads_ inside one process that can **share memory** (via `SharedArrayBuffer`) and communicate cheaply — used for **CPU-bound** work without spawning whole processes. Threads are lighter weight but share crash-domain considerations.

**Tip:** Quick rule: scale a web server → `cluster`/multiple containers. Parallelize a computation → `worker_threads`.

### Q43: What security basics should every Node/Express backend include?

**A:**

1. **`helmet`** to set safe HTTP security headers (CSP, HSTS, X-Frame-Options, etc.).
2. **Rate limiting** (`express-rate-limit`, often Redis-backed) to blunt brute-force/DoS.
3. **Secrets in env/secret managers**, never in code or git.
4. Input validation/sanitization (zod/class-validator) to prevent injection.
5. Avoid `eval`/`child_process.exec` with user input; keep dependencies patched (`npm audit`).
6. Enforce HTTPS, secure cookies, and proper CORS.

**Tip:** For NestJS, the equivalents are `@nestjs/throttler` (rate limit), `helmet` middleware, `ValidationPipe`, and `ConfigModule` with schema validation.

### Q44: What is PM2 and nodemon, and when do you use each?

**A:** **nodemon** is a _development_ tool that watches files and restarts your app on change. **PM2** is a _production_ process manager: it daemonizes your app, restarts on crash, supports cluster mode (multi-core), log management, zero-downtime reloads, and monitoring. They serve different stages.

**Tip:** In modern container/Kubernetes deployments, the orchestrator handles restarts and scaling, so PM2 is sometimes redundant — but it's still common on plain VMs.

### Q45: How does the poll phase decide whether to block, and where do microtasks fit overall?

**A:** In the poll phase, if there are I/O callbacks ready, the loop runs them. If the poll queue is empty, the loop checks: if `setImmediate` callbacks are scheduled, it ends poll and moves to the check phase; otherwise it _blocks_ in poll waiting for new I/O (up to the nearest timer's threshold). Microtasks (`nextTick` then Promises) are drained after each callback completes and between phase transitions, always taking priority over the next macrotask.

**Tip:** This is why a 0ms timer can be delayed: if poll blocks waiting and timers aren't due yet, your "instant" timer waits. "Timers are a floor, not a guarantee."

### Q46: What happens if you block the event loop, and how do you detect it?

**A:** Blocking the loop (long synchronous CPU work, `*Sync` calls, huge `JSON.parse`) stalls _all_ concurrent requests, timers, and I/O callbacks — latency spikes and health checks may fail. Detect it by measuring event-loop lag (`perf_hooks.monitorEventLoopDelay`, or libraries like `blocked-at`/`event-loop-lag`), watching p99 latency, and profiling with `--prof` or `clinic doctor`.

**Tip:** Mitigations: offload CPU work to worker_threads, chunk large work with `setImmediate` to yield to the loop, stream instead of buffering, and move heavy jobs to a BullMQ worker.

## Common Mistakes / Red Flags

- Calling synchronous APIs (`fs.readFileSync`, `crypto.pbkdf2Sync`) inside request handlers — blocks the event loop for every concurrent user.
- Believing `async/await` makes CPU-bound work non-blocking. It doesn't — awaiting a synchronous computation still blocks the thread. Use worker_threads.
- Getting the `nextTick` vs Promise vs `setImmediate` vs `setTimeout` ordering wrong, or claiming `setTimeout(0)` always beats `setImmediate` (only deterministic _inside I/O callbacks_, where immediate wins).
- Using raw `.pipe()` and forgetting error handling — a source error leaks the destination stream. Use `stream.pipeline`.
- Reading large files/responses entirely into memory (`fs.readFile` / collecting all chunks) instead of streaming — causes OOM.
- Swallowing errors in error-first callbacks (no `err` check, or forgetting to `return` after handling).
- Using `process.on('uncaughtException')` to keep a corrupted process alive instead of restarting.
- Recursive `process.nextTick` that starves the event loop so I/O never runs.
- Forgetting to remove event listeners / clear intervals → memory leaks and `MaxListenersExceededWarning`.
- Putting build-only tools (typescript, ts-node) in `dependencies`, or committing `.env`/secrets.
- Storing session/state in process memory while running multiple instances — breaks once you scale horizontally.
- Running WebSockets across instances without sticky sessions and a Redis adapter.
- Using `child_process.exec` with user-supplied input (shell injection) — prefer `execFile`/`spawn`.
- No graceful shutdown handler — deploys/restarts drop in-flight requests and abandon BullMQ jobs.
- Exhausting the libuv thread pool with heavy fs/crypto/zlib and not raising `UV_THREADPOOL_SIZE`.
- Running `npm install` (not `npm ci`) in CI/Docker, getting non-reproducible builds.

## Further Reading

- [The Node.js Event Loop (official guide)](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Streams API documentation](https://nodejs.org/api/stream.html)
- [worker_threads documentation](https://nodejs.org/api/worker_threads.html)
