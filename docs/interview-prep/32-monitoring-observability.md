# Monitoring & Observability (47 questions)

> Observability is the ability to understand what your system is doing in production — to catch issues _before_ users report them, debug failures you didn't anticipate, and prove you're meeting your SLAs. In fintech this is existential: every minute of downtime, every silently-failed payment, every slow checkout is real money lost and trust eroded, and regulators expect a defensible audit trail. The goal is to drive down **MTTD** (mean time to detect) and **MTTR** (mean time to recover). In the Foody project I used **Winston** for structured JSON logging with daily file rotation, **Sentry** for error tracking, **request-id** tracking to correlate logs per request, and a **Prometheus-ready** structure to expose metrics. This file goes deep on the three pillars (logs, metrics, traces), error tracking, alerting, health checks, and how to instrument a NestJS + MongoDB API end to end.

## Quick Revision Checklist

- **Monitoring** watches _known_ metrics (known-unknowns); **observability** lets you ask _new_ questions to debug unknown-unknowns from system outputs.
- The **three pillars**: **logs** (discrete events), **metrics** (numeric time-series), **traces** (request flow across services).
- **Four golden signals**: latency, traffic, errors, saturation. **RED** (Rate, Errors, Duration) for services; **USE** (Utilization, Saturation, Errors) for resources.
- **SLI** = measured indicator, **SLO** = target for it, **SLA** = contractual promise; **error budget** = 1 − SLO.
- **Structured JSON logs** beat plain text — machine-parseable, queryable in aggregation tools.
- Log levels: `error` / `warn` / `info` / `debug` / `trace`; set level per environment (info in prod, debug in dev).
- **Never log** secrets, passwords, tokens, full card numbers (PAN), CVV, or PII — see 24/23.
- **Correlation/request IDs** thread a request across services; propagate with **AsyncLocalStorage** in Node.
- Centralize logs: **ELK** (Elasticsearch/Logstash/Kibana), **Loki+Grafana**, Datadog, CloudWatch, Splunk.
- **Prometheus** = pull/scrape model; instrument Node with **prom-client**, expose `/metrics`; visualize in **Grafana**.
- Metric types: **counter** (monotonic), **gauge** (up/down), **histogram** (buckets → percentiles), **summary**.
- Use **percentiles (p95/p99)**, not averages — averages hide tail latency. Watch **cardinality** (high-cardinality labels kill Prometheus).
- **Distributed tracing** (OpenTelemetry → Jaeger/Tempo/Zipkin) follows a request across microservices/DB/queues.
- **Health checks**: liveness (is it alive?) vs readiness (can it serve traffic?); NestJS uses `@nestjs/terminus`.
- **Alert on symptoms not causes**; avoid alert fatigue; every alert must be actionable and tied to a runbook.
- Watch **Node event-loop lag**, heap/GC, **Mongo slow queries/replication lag**, **BullMQ queue depth/failed jobs**.
- Start with the golden signals; don't over-instrument; manage cost (log volume + metric cardinality + sampling).

## Basic

### Q1: What is the difference between monitoring and observability?

**A:** **Monitoring** is collecting and alerting on a _predefined_ set of metrics — you already know what to watch (CPU, error rate, latency). It answers known-unknowns ("is the error rate above 1%?"). **Observability** is a property of the system: the ability to understand its internal state from its external outputs (logs, metrics, traces) well enough to ask _new_ questions you didn't anticipate — to debug **unknown-unknowns** ("why are only iOS users in Brazil getting 500s on checkout?"). Monitoring tells you _that_ something is wrong; observability helps you figure out _why_.

**Tip:** Soundbite: "Monitoring is for the failures you predicted; observability is for the ones you didn't."

### Q2: What are the three pillars of observability?

**A:**

- **Logs** — discrete, timestamped records of events ("user 123 placed order 456", "DB connection failed"). High detail, good for "what exactly happened here". Best structured as JSON.
- **Metrics** — numeric measurements aggregated over time (request count, latency histogram, memory usage). Cheap to store, great for dashboards/alerts and spotting trends.
- **Traces** — the end-to-end journey of a single request across services/DB/queues, broken into **spans**. Best for "where did the time go" and "which service failed" in distributed systems.

**Tip:** Rule of thumb: metrics tell you _something is wrong_, traces tell you _where_, logs tell you _why_.

### Q3: When would you use a log vs a metric vs a trace?

**A:** Use a **metric** when you care about an aggregate count or rate over time (alert when error rate > 1%, chart p99 latency). Use a **trace** when you need to see how one request flowed and where latency or failure occurred across multiple hops. Use a **log** when you need the rich detail of a specific event for debugging or audit. They're complementary: an alert (metric) points you to a dashboard, a trace narrows it to a service/span, and logs (correlated by trace/request id) reveal the root cause.

**Tip:** Don't reach for logs to compute rates — that's expensive and slow; emit a counter metric instead.

### Q4: What are SLIs, SLOs, SLAs, and error budgets?

**A:**

- **SLI** (Service Level _Indicator_): a measured value, e.g. "% of requests served < 300ms" or "% of successful requests".
- **SLO** (Service Level _Objective_): the internal target for an SLI, e.g. "99.9% of requests succeed over 30 days".
- **SLA** (Service Level _Agreement_): a contractual promise to customers, usually with penalties, looser than the SLO.
- **Error budget** = `1 − SLO`. A 99.9% SLO allows 0.1% failures (~43 min/month). When the budget is healthy you can ship fast; when you've burned it, you freeze risky changes and focus on reliability.

**Tip:** SLOs should be on _user-facing symptoms_ (availability, latency), not internal causes (CPU).

### Q5: What is structured logging and why prefer JSON over plain text?

**A:** Structured logging emits each log as a structured object (usually JSON) with named fields — `{ "level":"error", "msg":"payment failed", "orderId":"456", "requestId":"abc" }` — instead of a free-form string. JSON is machine-parseable, so aggregation tools (Elasticsearch, Loki, Datadog) can index and let you query/filter by field (`orderId:456 AND level:error`), build dashboards, and alert. Plain text requires fragile regex parsing. Structured logs make logs _queryable data_ rather than a wall of text.

**Tip:** Keep field names consistent across services (e.g. always `requestId`, never `req_id` here and `correlationId` there).

### Q6: What are the standard log levels and when do you use each?

**A:**

- **error** — something failed and needs attention (unhandled exception, payment rejected by gateway unexpectedly).
- **warn** — recoverable/abnormal but not failing (retry succeeded, deprecated endpoint hit, approaching a limit).
- **info** — normal high-level events (server started, order created, user logged in).
- **debug** — detailed diagnostic info for development (variable values, branch taken).
- **trace** (or `verbose`) — extremely fine-grained, very noisy.

Configure the active level **per environment**: `info` (or `warn`) in production, `debug` in development. Logging below the threshold is skipped.

**Tip:** Make the level an env var (`LOG_LEVEL`) so you can crank up verbosity in prod temporarily without a redeploy.

### Q7: What should you never log, especially in fintech?

**A:** Never log **passwords**, **API keys / tokens / secrets**, **session cookies / JWTs**, **full card numbers (PAN)**, **CVV**, bank account numbers, or **PII** (national IDs, full addresses) beyond what's necessary. Logs are widely accessible, replicated, and long-lived — a logged secret is a breach. Redact or mask (`****1234`), and run a scrubbing layer that strips known sensitive keys before logs leave the process. This ties directly to 24 (security logging) and 23 (PCI-DSS / financial data handling). See the "never log this" example below.

**Tip:** Whitelist what you log on sensitive objects rather than blacklisting — new sensitive fields get added over time and blacklists go stale.

### Q8: What is a correlation/request ID and why is it essential?

**A:** A correlation (or request) ID is a unique identifier generated (or accepted from a header like `X-Request-Id`) at the entry of a request and attached to **every log line, metric, and downstream call** for that request. It lets you reconstruct everything that happened for one request — across middleware, services, DB calls, and queues — by filtering on a single value. Without it, prod logs are an unsearchable interleaving of concurrent requests. In Node you propagate it implicitly with **AsyncLocalStorage** (see 07) so you don't have to thread it through every function signature.

**Tip:** Pass the ID downstream in an HTTP header / message header so the _whole_ distributed trace shares one id.

### Q9: What's the difference between liveness and readiness health checks?

**A:** **Liveness** answers "is the process alive / not deadlocked?" — if it fails, the orchestrator (K8s/Docker) **restarts** the container. **Readiness** answers "can this instance serve traffic _right now_?" — if it fails, the orchestrator **removes it from the load balancer** but doesn't kill it. Readiness should check dependencies (DB, Redis) the app needs to function; liveness should be lightweight and _not_ fail just because a downstream is down (or every pod restarts in a cascade). See 18 for the Docker/K8s side.

**Tip:** Common mistake: putting DB checks in liveness — a brief DB blip then restarts all your pods and makes it worse.

## Intermediate

### Q10: How do you configure Winston with JSON logging, levels, and daily rotation?

**A:** Use `winston` with `winston-daily-rotate-file`. JSON format for files (machine-parseable), a colorized console transport for dev, level from env, and rotation with size/retention limits.

```ts
// logger.ts
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }), // capture stack traces
    format.json(), // structured JSON output
  ),
  defaultMeta: { service: "foody-api", env: process.env.NODE_ENV },
  transports: [
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d", // retention: keep 14 days
      level: "info",
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "30d",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}
```

**Tip:** `format.errors({ stack: true })` is what makes `logger.error('msg', err)` include the stack — easy to forget.

### Q11: What are Winston child loggers and why use them?

**A:** A child logger inherits the parent's config but adds fixed metadata to every line it emits: `const reqLogger = logger.child({ requestId, userId })`. Now every log from that logger automatically carries those fields without repeating them. Great for per-request context — create a child with the request id at the start of a request and pass it down. Combined with AsyncLocalStorage you can avoid passing the logger explicitly.

**Tip:** Child loggers are cheap; create one per request, not one per log line.

### Q12: When would you choose Pino over Winston?

**A:** **Pino** is a lower-overhead JSON logger — it does minimal work in the hot path (serializes asynchronously, no expensive formatting inline) and is significantly faster with less GC pressure, which matters under high throughput. It's JSON-first and integrates well with NestJS via `nestjs-pino`, including automatic request-context logging. Winston is more flexible (many transports/formats) and is what I used in Foody; Pino is the go-to when logging throughput/perf is the priority.

**Tip:** With Pino, do heavy formatting/prettifying in a _separate_ process (`pino-pretty`) so it never slows the app.

### Q13: How do you propagate a request ID across async calls with AsyncLocalStorage?

**A:** `AsyncLocalStorage` (Node `async_hooks`) keeps a store alive across the async call chain of a request, so any code can read the current request id without it being passed as an argument. Set it in middleware; read it in the logger or anywhere downstream. (See 07 for the runtime mechanics.)

```ts
// request-context.ts
import { AsyncLocalStorage } from "node:async_hooks";
export const als = new AsyncLocalStorage<{ requestId: string }>();

// request-id.middleware.ts (NestJS functional middleware)
import { randomUUID } from "node:crypto";
export function requestId(req, res, next) {
  const id = req.headers["x-request-id"] ?? randomUUID();
  res.setHeader("x-request-id", id);
  als.run({ requestId: id }, () => next()); // store flows through the whole request
}

// anywhere downstream — no param threading needed
function log(msg: string) {
  const ctx = als.getStore();
  logger.info(msg, { requestId: ctx?.requestId });
}
```

**Tip:** Always honor an incoming `x-request-id` so the id is consistent across services in a trace.

### Q14: How do you replace NestJS's built-in logger with Winston/Pino?

**A:** NestJS ships a `Logger` you can swap. Either pass a custom logger to `NestFactory.create(AppModule, { logger: winstonInstance })`, or use `nest-winston` / `nestjs-pino` which provide a module integrating with Nest's DI and the `LoggerService` interface. With `nestjs-pino` you also get automatic per-request logging with the request id bound. You can then inject the logger anywhere and Nest's own framework logs go through it too.

```ts
// main.ts using nest-winston
import { WinstonModule } from "nest-winston";
const app = await NestFactory.create(AppModule, {
  logger: WinstonModule.createLogger({ instance: logger }),
});
```

**Tip:** Implementing Nest's `LoggerService` interface lets framework logs (route mapping, errors) share your format and transports.

### Q15: What are application logs vs audit logs in fintech?

**A:** **Application (operational) logs** are for engineers debugging behavior — verbose, may be sampled, retained ~weeks. **Audit logs** are a tamper-evident, business-level record of _who did what to what, when_ (user X transferred $Y from account A to B at time T) for compliance, forensics, and dispute resolution. Audit logs must be **complete (not sampled)**, often **append-only/immutable**, retained for **years** (regulatory), and stored separately with strict access control. Don't conflate them: dropping an app log is fine; dropping an audit event can be a compliance failure. See 23 for the fintech audit-trail requirements.

**Tip:** Audit events are usually emitted as explicit domain events, not as a side effect of `logger.info` — treat them as first-class data.

### Q16: What is log aggregation and what are the common stacks?

**A:** Aggregation ships logs from every instance/container to a central, searchable store so you can query across the whole fleet instead of SSHing into boxes. Common stacks:

- **ELK / Elastic Stack** — Elasticsearch (store/search) + Logstash or Beats (collect/transform) + Kibana (UI). Powerful, heavier to run.
- **Loki + Grafana** — Loki indexes only labels (not full text), cheaper, pairs with Grafana and Prometheus.
- **Datadog / Splunk / New Relic** — managed SaaS, less ops but pricey at volume.
- **CloudWatch Logs** — AWS-native.

**Tip:** The pattern is: app writes JSON to stdout → agent (Fluent Bit/Promtail/Vector) ships it → central store. Don't have the app talk to Elasticsearch directly.

### Q17: What are the four golden signals, RED, and USE methods?

**A:**

- **Four Golden Signals** (Google SRE): **Latency** (how long requests take), **Traffic** (demand, e.g. req/s), **Errors** (failed-request rate), **Saturation** (how full the system is — CPU, memory, queue depth).
- **RED** (for request-driven services): **Rate** (requests/s), **Errors** (failed/s), **Duration** (latency distribution). A focused subset of golden signals per endpoint.
- **USE** (for resources): **Utilization**, **Saturation**, **Errors** — apply per resource (CPU, disk, network, connection pool).

**Tip:** Instrument _services_ with RED and _resources_ with USE; together they cover the golden signals.

### Q18: What are the Prometheus metric types?

**A:**

- **Counter** — monotonically increasing total (requests, errors). You query its _rate_: `rate(http_requests_total[5m])`. Never decreases (resets to 0 on restart).
- **Gauge** — a value that goes up and down (in-flight requests, memory bytes, queue depth, temperature).
- **Histogram** — samples observations into configurable **buckets** (e.g. request durations); lets you compute **percentiles** server-side with `histogram_quantile`. Also gives `_sum` and `_count`.
- **Summary** — like a histogram but computes quantiles **client-side**; can't be aggregated across instances, so histograms are usually preferred.

**Tip:** For latency use a histogram, not a summary — you almost always want to aggregate p99 across all pods.

### Q19: How does Prometheus's pull model work, and how do you instrument a Node app?

**A:** Prometheus **scrapes** (pulls) a `/metrics` HTTP endpoint on each target on an interval. Your app just _exposes_ current metric values; Prometheus stores the time-series. Use **prom-client** in Node to define metrics and serve them. Exporters (e.g. `mongodb_exporter`, `node_exporter`) expose third-party/system metrics the same way.

```ts
import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from "prom-client";

export const registry = new Registry();
collectDefaultMetrics({ register: registry }); // process CPU, memory, event-loop lag, GC

export const httpRequests = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"] as const,
  registers: [registry],
});

export const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Request duration in seconds",
  labelNames: ["method", "route", "status"] as const,
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5], // tuned to your latency profile
  registers: [registry],
});
```

**Tip:** `collectDefaultMetrics` is free and gives you Node event-loop lag, heap, and GC — invaluable health signals (see 07).

### Q20: How do you expose /metrics in NestJS and record per-request metrics?

**A:** Expose a controller that returns the registry, and record in an interceptor/middleware.

```ts
// metrics.controller.ts
@Controller("metrics")
export class MetricsController {
  @Get()
  async metrics(@Res() res: Response) {
    res.set("Content-Type", registry.contentType);
    res.end(await registry.metrics());
  }
}

// metrics.interceptor.ts (record duration + count)
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest();
    const stop = httpDuration.startTimer();
    return next.handle().pipe(
      tap({
        next: () => this.record(ctx, req, stop),
        error: () => this.record(ctx, req, stop),
      }),
    );
  }
  private record(ctx, req, stop) {
    const res = ctx.switchToHttp().getResponse();
    const route = req.route?.path ?? "unknown"; // route template, NOT req.url
    const labels = {
      method: req.method,
      route,
      status: String(res.statusCode),
    };
    httpRequests.inc(labels);
    stop(labels);
  }
}
```

**Tip:** Use the **route template** (`/orders/:id`) as the label, never the raw URL (`/orders/abc123`) — raw URLs explode cardinality.

### Q21: Why use percentiles (p95/p99) instead of averages for latency?

**A:** Averages hide the tail. If 99 requests take 50ms and one takes 5s, the average is ~100ms — looks fine — but 1% of users had a terrible experience, and that 1% may be your biggest customers. **Percentiles** describe the distribution: p50 (median) = typical experience, **p95/p99** = the unlucky tail that drives complaints and SLO breaches. Tail latency also compounds in microservices (a request hitting 10 services is likely to hit _someone's_ p99). Histograms let you compute these: `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))`.

**Tip:** Alert and SLO on p99, dashboard p50/p95/p99 together to see the spread.

### Q22: What is cardinality and why is it dangerous in Prometheus?

**A:** **Cardinality** is the number of unique label-value combinations for a metric. Prometheus creates a separate time-series per combination, all held in memory. Putting **unbounded/high-cardinality values** in labels — user IDs, request IDs, raw URLs, emails, timestamps — creates millions of series, blowing up memory and crashing the server ("cardinality explosion"). Keep labels to **bounded sets** (method, route template, status code, region). High-cardinality identifiers belong in **logs or traces**, not metric labels.

**Tip:** Red-flag answer in interviews: "I'd add the user id as a label so I can filter." No — that's a cardinality bomb; correlate via traces/logs instead.

### Q23: What does Grafana add on top of Prometheus?

**A:** Prometheus stores/queries time-series; **Grafana** is the visualization and alerting layer. It connects to Prometheus (and Loki, Tempo, Elasticsearch, etc.) as data sources and lets you build **dashboards** (latency percentiles, error rate, throughput, saturation, business KPIs), template variables (pick service/env), and **alerts**. A single Grafana can unify logs, metrics, and traces into one "single pane of glass" with cross-links (jump from a latency spike to the traces behind it).

**Tip:** Grafana alerting and Prometheus Alertmanager overlap — pick one path for routing/dedup to avoid duplicate pages.

### Q24: How do you do health checks in NestJS with @nestjs/terminus?

**A:** `@nestjs/terminus` provides a health module with built-in indicators for HTTP, DB (Mongo/TypeORM), Redis, disk, and memory, plus custom checks. Expose separate liveness and readiness endpoints.

```ts
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongo: MongooseHealthIndicator,
    private mem: MemoryHealthIndicator,
  ) {}

  @Get("live") // lightweight: process is up
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  @Get("ready") // checks dependencies needed to serve traffic
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.mongo.pingCheck("mongodb", { timeout: 1500 }),
      () => this.mem.checkHeap("memory_heap", 300 * 1024 * 1024),
      // () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

**Tip:** Give readiness checks a tight timeout — a hanging dependency check shouldn't itself hang the probe.

### Q25: How do you capture exceptions with Sentry in a NestJS app?

**A:** Initialize Sentry early, then use a global exception filter (or the official `@sentry/nestjs` integration) so unhandled errors are captured with request context, then rethrown to Nest's default handling.

```ts
// main.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.GIT_SHA, // release tracking
  tracesSampleRate: 0.1, // 10% performance traces
  beforeSend: scrubPii, // strip sensitive data before send
});

// sentry.filter.ts
@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    if (status >= 500) {
      // don't spam Sentry with 4xx
      Sentry.withScope((scope) => {
        const req = host.switchToHttp().getRequest();
        scope.setTag("requestId", als.getStore()?.requestId);
        scope.setUser({ id: req.user?.id });
        Sentry.captureException(exception);
      });
    }
    super.catch(exception, host);
  }
}
```

**Tip:** Filter out expected 4xx (validation, auth) so Sentry signal isn't drowned by noise.

## Advanced

### Q26: What is distributed tracing and what are spans and traces?

**A:** Distributed tracing follows a single request as it propagates through multiple services, DBs, and queues. A **trace** is the whole request, identified by a **trace id**. A **span** is one unit of work within it (an HTTP handler, a DB query, a queue publish), with a start/end time, attributes, and a parent span — forming a tree. **Context propagation** passes the trace id + parent span id downstream (via the W3C `traceparent` header for HTTP, or message headers for queues) so spans created in other services attach to the same trace. The result is a waterfall showing exactly where time was spent and which hop failed. Critical in microservices (see 30).

**Tip:** The request/correlation id and the trace id should be linked (or the same) so you can pivot logs ↔ traces.

### Q27: What is OpenTelemetry and why does it matter?

**A:** **OpenTelemetry (OTel)** is the vendor-neutral, open standard for generating and shipping telemetry (traces, metrics, logs). It gives you a single SDK and wire format so you instrument once and can send to _any_ backend (Jaeger, Tempo, Datadog, etc.) without rewriting — no vendor lock-in. For Node it offers **auto-instrumentation** that monkey-patches popular libraries (Express/Nest, HTTP, **Mongo/Mongoose**, Redis, BullMQ) to emit spans with zero/low code. The **OTel Collector** is a separate process that receives, processes (batch, sample, scrub), and exports telemetry, decoupling your apps from backends.

```ts
// tracing.ts — must be required BEFORE app code
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
new NodeSDK({
  serviceName: "foody-api",
  instrumentations: [getNodeAutoInstrumentations()],
}).start();
```

**Tip:** Load the tracing SDK first (`node -r ./tracing.js dist/main`) — auto-instrumentation must patch libraries before they're imported.

### Q28: How do you add custom OpenTelemetry spans around a business operation?

**A:** Auto-instrumentation captures HTTP/DB/Redis spans for free, but they only tell you the request hit Mongo — not which _business_ step was slow. For your own logic you create **manual spans** so a trace shows where _your_ time went. Get a tracer and wrap the operation with `startActiveSpan`, which makes the new span the **active** one so any auto-instrumented spans (and other manual spans) created inside automatically nest as children. Inside the callback you set **attributes** for context, and on failure you `recordException` + set an `ERROR` status and rethrow — and you **always `span.end()` in a `finally`** so an early return or throw can't leak an unfinished span. Keep attribute **cardinality bounded**: an order id is fine as a one-off tag, but don't attach unbounded high-cardinality values as span attributes any more than you would as metric labels.

```ts
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("orders");

function createOrder(userId: string, cart: Cart) {
  return tracer.startActiveSpan("createOrder", async (span) => {
    span.setAttribute("user.id", userId);
    span.setAttribute("cart.items", cart.items.length);
    try {
      const order = await ordersRepo.insert(userId, cart); // auto-instrumented Mongo span nests here
      span.setStatus({ code: SpanStatusCode.OK });
      return order;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (err as Error).message,
      });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

**Tip:** Custom spans turn "the request was slow" into "the `createOrder` step was slow"; child spans nest automatically inside the active span.

### Q29: What backends visualize traces, and what is trace sampling (head vs tail)?

**A:** **Jaeger**, **Zipkin**, and **Grafana Tempo** are common trace backends (Tempo pairs with Grafana/Loki/Prometheus). **Sampling** controls how many traces you keep, since storing every trace is expensive:

- **Head-based sampling** decides at the _start_ of the request (e.g. keep 10%). Simple and cheap, but may drop the rare slow/errored traces you actually want.
- **Tail-based sampling** buffers spans and decides at the _end_, after seeing the outcome — keep all errors and slow requests, sample the rest. More useful but needs a collector with memory/buffering (done in the OTel Collector).

**Tip:** Tail sampling "keep 100% of errors + p99-slow + 5% of the rest" is the sweet spot for cost vs. signal.

### Q30: How do you correlate logs, metrics, and traces (single pane of glass)?

**A:** Share identifiers and standardize tooling. Inject the **trace id and span id into every log line** (OTel can do this automatically), and tag metrics/traces with the same service/route labels. Then a workflow looks like: a **metric** alert fires (p99 latency up) → click into the **trace** exemplar behind that bucket → see the slow span (a Mongo query) → pivot to **logs** filtered by that trace id for the exact error/parameters. Tools like Grafana (with exemplars linking Prometheus→Tempo→Loki) or Datadog make these pivots one click.

**Tip:** "Exemplars" in Prometheus histograms attach a sample trace id to a bucket — that's the literal bridge from a latency spike to a representative trace.

### Q31: What is white-box vs black-box monitoring?

**A:** **Black-box** monitoring observes the system from the _outside_ as a user would — synthetic probes / uptime checks hitting your public endpoints, measuring availability and latency without knowing internals. It catches "is it down for users right now?" and complete outages. **White-box** monitoring uses _internal_ signals the app exposes — metrics, logs, traces, queue depth, GC stats. White-box helps you predict and diagnose ("saturation rising"); black-box validates the actual user experience and catches things white-box misses (DNS, TLS, LB misconfig). You want both.

**Tip:** Black-box catches "the metrics say we're healthy but users can't reach us" (e.g. a broken load balancer).

### Q32: What makes a good alert, and how do you avoid alert fatigue?

**A:** A good alert is **actionable, urgent, and on a symptom**. Alert on user-facing symptoms (high error rate, latency SLO burn, endpoint down) — _not_ on causes (CPU at 80% is fine if users are happy). Avoid **alert fatigue**: too many noisy/non-actionable alerts train people to ignore them, so the real one gets missed. Use **severity tiers** (page vs. ticket vs. log), require every paging alert to map to a **runbook**, dedup/group related alerts, and delete alerts nobody acts on. Tune thresholds and use sustained conditions (`for: 5m`) to avoid flapping.

**Tip:** Litmus test: "If this fires at 3am, is there something a human must do right now?" If no, it shouldn't page.

### Q33: What is SLO burn-rate alerting?

**A:** Instead of alerting on raw thresholds, you alert on how fast you're **burning the error budget**. A 99.9% SLO over 30 days gives a fixed budget; **burn rate** is the multiple at which you're consuming it (1x = exactly on track to exhaust it in the window; 14.4x = budget gone in ~2 days). **Multi-window, multi-burn-rate** alerts page urgently on fast burn (e.g. 14x over 5m+1h — something's badly broken now) and ticket on slow burn (e.g. 1x over 6h+ — a gradual leak). This catches both sudden outages and slow degradation while ignoring tiny brief blips that don't threaten the SLO.

**Tip:** Burn-rate alerting reduces false pages because a 30-second error spike that doesn't meaningfully dent the budget won't fire.

### Q34: How does Prometheus Alertmanager fit in, and what does an alert rule look like?

**A:** Prometheus evaluates **alerting rules** (PromQL expressions) and, when one is firing, sends it to **Alertmanager**, which handles **routing** (to Slack/PagerDuty/Opsgenie by label), **grouping** (collapse related alerts into one notification), **deduplication**, **silencing** (during maintenance), and **inhibition** (suppress lower alerts when a higher one fires). Example rule:

```yaml
groups:
  - name: api-slos
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
            / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels: { severity: page }
        annotations:
          summary: "5xx error rate > 5% for 5m"
          runbook: "https://wiki/runbooks/high-error-rate"
      - alert: HighP99Latency
        expr: histogram_quantile(0.99,
          sum by (le) (rate(http_request_duration_seconds_bucket[5m]))) > 1
        for: 10m
        labels: { severity: ticket }
```

**Tip:** Always attach a `runbook` annotation — the responder shouldn't have to figure out the response from scratch at 3am.

### Q35: What does an APM tool give you that DIY Prometheus+Grafana doesn't?

**A:** **APM** (Datadog APM, New Relic, Elastic APM, Dynatrace) bundles distributed tracing, metrics, logs, error tracking, and code-level insight **out of the box** with auto-instrumentation, correlated automatically, plus features like service maps, code hot-spots, DB query analysis, and anomaly detection — minimal setup, but it's a paid SaaS that gets expensive at scale and is vendor-locked. **DIY Prometheus + Grafana + Loki + Tempo + Sentry** is open-source, cheap on licensing, and fully controllable, but you operate and integrate it yourself and wire up correlation. Trade-off: engineering time/control vs. money/convenience.

**Tip:** Many teams do a hybrid: OpenTelemetry instrumentation (portable) feeding whichever backend — keeps the door open to switch.

### Q36: How do you monitor MongoDB in production?

**A:** Key signals: **slow queries** (the database **profiler** / slow-query log captures ops over a threshold — find missing indexes / COLLSCANs), `mongostat` (ops/s, queues, page faults) and `mongotop` (time per collection) for live snapshots, **connection pool** utilization (saturation → app stalls), **replication lag** (secondaries falling behind risks stale reads and data loss on failover), cache hit ratio (WiredTiger), lock/queue depth, and disk. Export these via `mongodb_exporter` into Prometheus. Pair with **explain plans** on slow queries (see 12). Atlas provides much of this built-in.

**Tip:** Replication lag and connection-pool saturation are the two that silently cause user-facing latency — alert on both.

### Q37: How do you monitor a Node.js process's health?

**A:** Critical Node-specific signals (see 07):

- **Event-loop lag** — _the_ key Node health signal. If the loop is blocked (sync work, heavy JSON), latency spikes everywhere; `collectDefaultMetrics` exposes `nodejs_eventloop_lag_seconds`.
- **Heap usage & GC** — rising heap that never recovers = memory leak; frequent/long GC pauses hurt latency.
- **CPU** — sustained high CPU on a single-threaded process means you're saturated (scale out / move work to workers/queues).
- **Active handles/requests, RSS**, and restart counts.

**Tip:** Alert on event-loop lag (e.g. p99 > 100ms) — it's the earliest sign of a thread-blocking regression.

### Q38: How do you detect a memory leak in production?

**A:** Watch the **heap-used trend over time**: a leak shows steadily climbing heap that GC never reclaims, often ending in OOM/restarts (a sawtooth that drifts upward, not a flat steady state). Confirm with **heap snapshots** (`v8.writeHeapSnapshot()` or `--heapsnapshot-signal`) taken hours apart and diff them in Chrome DevTools to find growing object types/retainers. Common Node causes: unbounded caches/Maps, accumulating event listeners, closures capturing large objects, growing arrays. Alert on heap-growth slope and restart frequency.

**Tip:** Mention `clinic.js`, `node --inspect`, and diffing two heap snapshots — concrete tooling impresses interviewers.

### Q39: How do you monitor BullMQ/Redis queues?

**A:** Track (see 14): **queue depth / waiting count** (backlog growing → consumers can't keep up), **active jobs**, **failed jobs** count/rate, **completed throughput**, **job processing duration**, and **delayed/stalled** jobs. A growing waiting count with flat throughput means you need more workers or there's a stuck consumer. Expose these as gauges/counters to Prometheus (poll `queue.getJobCounts()`), and use Bull Board for a live UI. Also watch Redis itself: memory, evictions, connected clients, latency.

**Tip:** Alert on **queue depth rising** _and_ **failed-job rate** — depth catches saturation, failures catch bad jobs/poison messages.

### Q40: What is the observability-driven debugging workflow during an incident?

**A:** **Alert → dashboard → narrow → root cause → fix.**

1. An **alert** fires on a symptom (error-rate SLO burn).
2. Open the **dashboard** to see scope: which service/endpoint/region, when it started, what correlates (a deploy? traffic spike? a dependency?).
3. Use **traces** to find the slow/failing span, then **logs** filtered by trace/request id for the exact error.
4. Identify root cause; if needed, **mitigate first** (roll back the deploy, scale up, feature-flag off) to restore service before fully fixing.
5. Track **MTTD/MTTR** and write a **postmortem**.

**Tip:** "Stop the bleeding before you diagnose" — rolling back to restore users is usually right even before you know the root cause.

### Q41: What are MTTD, MTTR, and a blameless postmortem?

**A:** **MTTD** (mean time to detect) — how long from incident start to someone/something noticing; good observability/alerting shrinks it. **MTTR** (mean time to recover/repair) — from detection to resolution; good runbooks, rollbacks, and tooling shrink it. A **blameless postmortem** is a written analysis after an incident focused on _systemic_ causes and improvements — timeline, impact, root cause, action items — explicitly **not** on blaming individuals, because blame makes people hide information and prevents learning. The aim is to make the same failure impossible (or auto-detected/auto-mitigated) next time.

**Tip:** Good postmortem action items are concrete and owned ("add alert on replication lag", "add readiness check for Redis"), not "be more careful".

### Q42: How do you do error grouping, fingerprinting, and release tracking in Sentry?

**A:** Sentry **groups** similar events into one **issue** via a **fingerprint** (by default derived from the stack trace / exception type) so 10,000 occurrences of one bug are a single, prioritizable issue with a count and trend — you can customize the fingerprint when grouping is too coarse/fine. **Breadcrumbs** are the trail of events leading up to the error (recent requests, logs, navigation). **Release tracking** tags each event with the deploy/version (e.g. git SHA) so you can see "this error started in release X", spot regressions, and mark issues resolved-in-version. With **source maps** uploaded, minified frontend stacks map back to original source. It also does **performance monitoring** (transactions/spans).

**Tip:** Tag releases with the git SHA and wire it to your CI — "regressed in release abc123" is the fastest way to pin a deploy.

### Q43: How do you scrub PII before sending to Sentry/telemetry?

**A:** Use `beforeSend` (Sentry) / a span processor (OTel) to strip or mask sensitive fields **before** the event leaves your process: drop request bodies/headers (Authorization, Cookie), mask emails/card numbers, remove query params with tokens. Sentry also has built-in `sendDefaultPii: false` and data-scrubbing rules server-side, but client-side scrubbing is the safe default — never rely solely on the vendor. This is mandatory in fintech (24/23): a stack trace can otherwise carry a card number or token in a variable.

```ts
function scrubPii(event) {
  if (event.request?.headers) {
    delete event.request.headers["authorization"];
    delete event.request.headers["cookie"];
  }
  delete event.request?.data; // don't ship request bodies
  return event;
}
```

**Tip:** Local variables in a stack frame can leak secrets too — scrub or disable `includeLocalVariables` for sensitive code paths.

### Q44: How do you capture uncaughtException and unhandledRejection?

**A:** Register process-level handlers so crashes are reported, not silent (see 07). On `uncaughtException` the process is in an **undefined state** — log/report it, then **exit and let the orchestrator restart** (don't try to keep running). `unhandledRejection` catches promises that rejected with no `.catch`.

```ts
process.on("unhandledRejection", (reason) => {
  Sentry.captureException(reason);
  logger.error("unhandledRejection", { reason });
});
process.on("uncaughtException", (err) => {
  Sentry.captureException(err);
  logger.error("uncaughtException", { err });
  Sentry.flush(2000).finally(() => process.exit(1)); // flush, then restart
});
```

**Tip:** `Sentry.flush()` before `process.exit` — otherwise the report is lost because the process dies before the network send completes.

### Q45: What are business metrics and why instrument them?

**A:** Business metrics measure outcomes the business cares about, not just system health: **payments processed/sec**, payment **success vs. decline rate**, signups, orders placed, revenue, settlement failures. They catch problems infra metrics miss — e.g. all servers are green (CPU/latency fine) but **payment success dropped 40%** because a downstream gateway is silently rejecting; only a business metric reveals it. In fintech these are first-class and often the _most_ important alerts. Emit them as counters/gauges alongside technical metrics.

**Tip:** "All systems green but money stopped flowing" is exactly why you alert on a payment-success-rate metric, not just CPU/latency.

### Q46: What is synthetic / uptime monitoring and heartbeats?

**A:** **Synthetic monitoring** runs scripted probes from outside (and from multiple regions) that hit critical endpoints or user flows (login → checkout) on a schedule, measuring availability and latency — black-box validation of the real user experience even when there's no traffic. **Uptime monitoring** is the simple form (ping `/health` every minute). **Heartbeats** (dead-man's-switch) flip the logic for background/cron jobs: the job pings a service on each run, and you alert if the ping is _missing_ — catching jobs that silently stopped running (which a normal alert can't, because a job that never runs emits nothing).

**Tip:** Use heartbeats for cron/scheduled jobs — "absence of success" is invisible to ordinary metric alerts.

### Q47: How do you manage observability cost without losing signal?

**A:** Cost is driven by **log volume**, **metric cardinality**, and **trace volume/retention**. Levers:

1. **sample** high-volume traces (tail-sample to keep errors/slow ones)
2. **drop/limit cardinality** — no IDs in labels, aggregate at the right granularity
3. **tier log retention** — short hot retention, cheap cold storage/archive for the rest, and lower the prod log level (`info`, not `debug`)
4. **don't over-instrument** — start with the golden signals + business metrics and add detail when you have a question to answer
5. drop noisy/unused metrics and alerts

The mistake is instrumenting everything "just in case" and getting a huge bill plus unsearchable noise.

**Tip:** "Start with the four golden signals, then add cardinality/traces where you actually need to debug" is the cost-conscious, senior answer.

## Production Observability Checklist for a NestJS + MongoDB API

- [ ] **Structured JSON logs** to stdout (Winston/Pino) with `service`, `env`, `level`, `timestamp`, and `requestId` on every line.
- [ ] **Request-id middleware** honoring incoming `x-request-id`, propagated via **AsyncLocalStorage** and echoed in the response header.
- [ ] **Log level via env** (`info`/`warn` in prod, `debug` in dev); log rotation (or stdout → log shipper) with sensible retention.
- [ ] **PII/secret scrubbing** layer — no passwords, tokens, JWTs, PANs, CVV, or PII in logs or error reports.
- [ ] **Separate audit log** for financial/domain events (who/what/when), complete, immutable, long-retention (23).
- [ ] **`/metrics` endpoint** via prom-client with `collectDefaultMetrics` (event-loop lag, heap, GC) + RED metrics per route.
- [ ] **HTTP histogram** with tuned buckets; labels limited to method/route-template/status (no high-cardinality labels).
- [ ] **Business metrics** (payment success/decline rate, orders, throughput).
- [ ] **Liveness** (`/health/live`, lightweight) and **readiness** (`/health/ready`, checks Mongo/Redis) via `@nestjs/terminus`.
- [ ] **Sentry** initialized with `release` (git SHA), `environment`, `beforeSend` scrubbing, 4xx filtered, global exception filter.
- [ ] **`uncaughtException` / `unhandledRejection`** handlers that report, flush, and exit for restart.
- [ ] **OpenTelemetry** auto-instrumentation (HTTP/Nest/Mongo/Redis/BullMQ) → collector → Jaeger/Tempo, with trace id in logs.
- [ ] **Mongo monitoring**: profiler/slow queries, connection-pool saturation, replication lag (12).
- [ ] **Queue monitoring**: BullMQ depth/active/failed/duration; Redis memory/evictions (14).
- [ ] **Grafana dashboards**: golden signals (latency p50/p95/p99, traffic, error rate, saturation) + business KPIs.
- [ ] **Alerts on symptoms** (5xx rate, p99 latency, SLO burn rate, queue backlog, replication lag, event-loop lag), each with a **runbook**, routed via Alertmanager → PagerDuty/Opsgenie with severity tiers.
- [ ] **Synthetic/uptime** checks on critical endpoints (black-box) + heartbeats for cron jobs.
- [ ] **Defined SLOs** + error budget; postmortem process; track MTTD/MTTR.

## Common Mistakes / Red Flags

- **Logging secrets/PII** — passwords, tokens, full card numbers in logs (a breach; PCI/GDPR violation).
- **Plain-text logs** with no structure/request id — unsearchable in aggregation, can't correlate a request.
- **High-cardinality metric labels** (user id, request id, raw URL) — Prometheus cardinality explosion / OOM.
- **Alerting on averages** instead of percentiles — tail latency stays invisible until users complain.
- **Alerting on causes (CPU 80%)** not symptoms — noisy, often non-actionable, causes alert fatigue.
- **Too many noisy alerts** → people ignore them → the real page gets missed.
- **DB checks in liveness probe** — a brief DB blip restarts every pod (cascading outage); use readiness.
- **No correlation between logs/metrics/traces** — can't pivot from "latency up" to the actual failing request.
- **Relying only on white-box** (metrics look green) while a broken LB means users can't connect — need black-box too.
- **No business metrics** — "all green" while payment success silently collapses.
- **Forgetting `Sentry.flush()` before `process.exit`** — crash reports lost.
- **Loading OTel/tracing after app code** — auto-instrumentation doesn't patch already-imported libraries.
- **Over-instrumenting "just in case"** — huge cost + unsearchable noise; start with golden signals.
- **No request id / no AsyncLocalStorage** — passing context manually through every function, or losing it across async boundaries.
- **Treating audit logs like app logs** (sampled/dropped/short retention) — compliance failure in fintech.

## Further Reading

- Google SRE Book & Workbook — SLIs/SLOs/error budgets, golden signals, alerting (sre.google/books).
- OpenTelemetry docs — concepts, JS/Node SDK, auto-instrumentation, the Collector (opentelemetry.io/docs).
- Prometheus docs — instrumentation, metric types, PromQL, Alertmanager, histograms (prometheus.io/docs).
- Sentry for NestJS & Node — error tracking, performance, releases, data scrubbing (docs.sentry.io/platforms/javascript/guides/nestjs).
