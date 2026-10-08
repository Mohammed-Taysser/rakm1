# REST API Design (48 questions)

> API design comes up in almost every backend and full-stack interview because it reveals how you think about contracts, change, and failure — not just how you write code. Interviewers probe whether you understand HTTP semantics (idempotency, status codes, caching), whether your URLs and error shapes are consistent, and whether your design survives versioning and scale. This is directly your wheelhouse: you build REST APIs documented with Swagger/OpenAPI across both Express (Foody, Pharmacy FEFO) and NestJS (Hirely) projects, using pagination, idempotency keys for payments/orders, and explicit versioning. The goal of this sheet is to let you answer the "design me an API" and "why 409 vs 422" questions crisply, with real examples you've actually shipped.

## Quick Revision Checklist

- **REST is a style, not a protocol** — 6 constraints: client-server, stateless, cacheable, uniform interface, layered system, code-on-demand (optional).
- **Resources are nouns, plural, lowercase**: `/api/v1/users/:id/orders` — never `/getUserOrders`.
- **HTTP methods carry semantics**: GET (safe), POST (create/non-idempotent), PUT (full replace, idempotent), PATCH (partial), DELETE (idempotent).
- **Safe = no side effects (GET/HEAD/OPTIONS); Idempotent = same result if repeated (GET/PUT/DELETE/HEAD/OPTIONS, plus PATCH if designed so).**
- **POST is NOT idempotent** — use an `Idempotency-Key` header for payments/orders to dedupe retries.
- **Status codes**: 200/201/204 success; 301/304 redirect/cache; 400/401/403/404/405/409/422/429 client errors; 500/502/503 server errors.
- **Statelessness**: server stores no session state between requests; each request self-contained (token, not server session) — enables horizontal scaling.
- **Pagination**: offset/limit and page-based are simple but drift on inserts; cursor-based is stable and scales for infinite scroll / large datasets.
- **Versioning**: URI (`/v1`) is explicit and cache-friendly; header/media-type is "purer"; query param is a middle ground. Pick one and be consistent.
- **Consistent error shape** for every error (consider RFC 7807 `application/problem+json` with a stable machine `code`).
- **400 vs 422**: 400 = malformed/syntactically wrong request; 422 = well-formed but semantically invalid (validation failed).
- **Rate limiting returns 429** with `Retry-After`; auth uses `Authorization: Bearer <token>`; 401 = unauthenticated, 403 = authenticated but forbidden.
- **Caching**: `Cache-Control`, `ETag` + `If-None-Match` → `304 Not Modified` for conditional requests.
- **Security**: OWASP API Top 10 — #1 is BOLA (Broken Object Level Authorization); also mass assignment, no rate limiting. Never trust the client.
- **Don't leak DB schema** — map entities to DTOs; use soft deletes + timestamps; design async/long-running work with `202 Accepted` + polling or webhooks.

---

## Basic

### Q1: What is an API?

**A:** An Application Programming Interface is a contract that lets two pieces of software talk to each other. It defines the operations one component exposes (endpoints, inputs, outputs, errors) so another can consume them without knowing the internal implementation. A web API specifically exposes those operations over HTTP.

**Tip:** Stress the word "contract." Interviewers love the framing that an API hides implementation behind a stable interface — that's what makes versioning and refactoring possible.

### Q2: What is REST?

**A:** REST (Representational State Transfer) is an architectural style for distributed systems, defined by Roy Fielding in his 2000 dissertation. Clients operate on **resources** (identified by URLs) by transferring **representations** of their state (usually JSON) using standard HTTP methods. It's a style, not a protocol or standard.

**Tip:** Say "architectural style, defined by Roy Fielding." That single sentence signals you know REST's origin and that it isn't a spec like SOAP.

### Q3: What are the constraints of REST?

**A:** Six constraints:

1. **Client-Server** — separation of concerns; UI/client evolves independently of data storage/server.
2. **Stateless** — each request contains everything needed; server keeps no client session state between requests.
3. **Cacheable** — responses must declare whether they can be cached (e.g. `Cache-Control`).
4. **Uniform Interface** — the cornerstone: resource identification via URIs, manipulation through representations, self-descriptive messages, HATEOAS.
5. **Layered System** — client can't tell if it's talking to the origin server or an intermediary (proxy, load balancer, gateway).
6. **Code-on-Demand** (optional) — server can send executable code (e.g. JS) to extend the client.

**Tip:** If asked which is optional, it's code-on-demand. The rest are mandatory for an API to be "RESTful."

### Q4: What's the difference between REST and RESTful?

**A:** REST is the architectural style (the set of constraints). "RESTful" is the adjective describing a system that actually follows those constraints. In practice most "RESTful" APIs are really "HTTP APIs" that ignore HATEOAS — fully RESTful (Richardson Maturity Level 3) is rare.

**Tip:** Mention the Richardson Maturity Model (L0 single endpoint → L1 resources → L2 HTTP verbs+status → L3 HATEOAS) to show depth.

### Q5: How should you name resources / design URLs?

**A:** Use **nouns, not verbs** (the HTTP method is the verb); use **plural** collection names; lowercase with hyphens for multi-word; nest to show relationships but don't go too deep.

- Good: `GET /api/v1/users/123/orders`
- Good: `POST /api/v1/orders`
- Bad: `GET /api/v1/getUserOrders?id=123`
- Bad: `POST /api/v1/createOrder`

**Tip:** Rule of thumb: nesting one or two levels deep is fine (`/users/:id/orders`); beyond that, prefer a top-level resource with a filter (`/orders?userId=123`).

### Q6: When do you use a verb in a REST URL?

**A:** For actions that don't map cleanly to CRUD on a resource — sometimes modeled as a sub-resource action: `POST /orders/123/cancel`, `POST /payments/123/refund`. Purists model these as state changes (`PATCH /orders/123 {status:"cancelled"}`), but action endpoints are widely accepted and clearer for side-effect-heavy operations.

**Tip:** Acknowledge both views. Saying "I'd use `POST /orders/:id/cancel` for clarity, though a purist would PATCH the status" shows balance.

### Q7: What are the main HTTP methods and their semantics?

**A:**
| Method | Purpose | Safe | Idempotent | Has body |
|--------|---------|------|------------|----------|
| GET | Read a resource/collection | Yes | Yes | No |
| POST | Create / non-idempotent action | No | No | Yes |
| PUT | Replace a resource fully | No | Yes | Yes |
| PATCH | Partially update a resource | No | No\* | Yes |
| DELETE | Remove a resource | No | Yes | Optional |
| HEAD | Like GET but headers only | Yes | Yes | No |
| OPTIONS | Discover allowed methods / CORS preflight | Yes | Yes | No |

**Tip:** \*PATCH can be idempotent if you send absolute values rather than deltas (`{count: 5}` vs `{increment: 1}`). Be ready to explain that nuance.

### Q8: What's the difference between PUT and PATCH?

**A:** PUT **replaces the entire resource** with the payload — fields you omit get cleared/defaulted. PATCH **partially updates** — only the fields you send change. PUT is idempotent (sending it twice yields the same state); PATCH may or may not be.

**Tip:** A classic trap: "Is PUT idempotent and PATCH not?" — PUT is idempotent; PATCH is not _inherently_ idempotent but can be designed that way.

### Q9: What does "safe" mean for an HTTP method?

**A:** A safe method does not change server state — it's read-only from the client's perspective. GET, HEAD, and OPTIONS are safe. Caches, crawlers, and prefetchers rely on this; if your GET mutates data, you've broken a core assumption and a prefetch could trigger side effects.

**Tip:** "All safe methods are idempotent, but not all idempotent methods are safe (e.g. DELETE)."

---

## Intermediate

### Q10: What is idempotency and why does it matter?

**A:** An operation is idempotent if performing it once or many times produces the same final state. GET, PUT, DELETE, HEAD, OPTIONS are idempotent. It matters because networks fail: if a client times out and retries, an idempotent call is safe to repeat. `DELETE /orders/123` twice still leaves the order deleted (second returns 404 or 204). The danger is POST — retrying `POST /payments` could charge a customer twice.

**Tip:** Tie it to retries and at-least-once delivery. That's the real-world "why."

### Q11: How do you make POST idempotent? (Idempotency keys)

**A:** The client generates a unique key (UUID) and sends it in an `Idempotency-Key` header. The server stores the key with the result of the first request. On a retry with the same key, it returns the **stored** response instead of re-executing — preventing duplicate charges/orders. Stripe popularized this pattern.

```http
POST /api/v1/payments HTTP/1.1
Content-Type: application/json
Idempotency-Key: 7f3e9a2c-1b4d-4e6f-8a9b-0c1d2e3f4a5b

{ "orderId": "ord_123", "amount": 4999, "currency": "USD" }
```

Server flow:

1. Look up the key in a store (Redis/DB) with a TTL.
2. If found and completed → return the saved response (e.g. 200 with the original result).
3. If found and in-progress → return 409 Conflict (or wait).
4. If new → process, save `{key → response}`, then return 201.

**Tip:** Mention you scope the key per-endpoint and per-user, set a TTL (e.g. 24h), and store the request fingerprint so the same key with a _different_ body is rejected (422). This is exactly what you did for Foody orders / payments.

### Q12: Walk through the important HTTP status codes.

**A:**

- **2xx Success**: `200 OK` (general success with body), `201 Created` (resource created — return `Location` header + the resource), `204 No Content` (success, no body — e.g. DELETE/PUT update).
- **3xx Redirection**: `301 Moved Permanently`, `304 Not Modified` (conditional GET cache hit).
- **4xx Client error**: `400 Bad Request` (malformed), `401 Unauthorized` (not authenticated), `403 Forbidden` (authenticated but not allowed), `404 Not Found`, `405 Method Not Allowed`, `409 Conflict` (state conflict, e.g. duplicate/version mismatch), `422 Unprocessable Entity` (validation failed), `429 Too Many Requests` (rate limited).
- **5xx Server error**: `500 Internal Server Error`, `502 Bad Gateway` (bad response from upstream), `503 Service Unavailable` (overloaded/down/maintenance).

**Tip:** Know the pairs that confuse people: 401 vs 403, 400 vs 422, 409 vs 422. Interviewers test exactly these.

### Q13: 400 vs 422 — when do you use each?

**A:** `400 Bad Request` = the request is **malformed** — broken JSON, wrong content type, missing required header, unparseable. `422 Unprocessable Entity` = the request is **well-formed and parsed** but **semantically invalid** — e.g. `email` is present but not a valid email, or `quantity` is negative. Many teams use 400 for both; using 422 for validation is more precise and is the NestJS `ValidationPipe` default style.

**Tip:** Say "I return 422 for field-level validation failures and 400 for unparseable/protocol-level errors." That precision scores points.

### Q14: 401 vs 403?

**A:** `401 Unauthorized` actually means **unauthenticated** — "I don't know who you are; provide valid credentials" (should include `WWW-Authenticate`). `403 Forbidden` means **authenticated but not permitted** — "I know who you are, but you can't do this."

**Tip:** Naming irony: 401 is about authentication, 403 is about authorization. State that explicitly.

### Q15: When is 409 Conflict appropriate?

**A:** When the request conflicts with the current state of the resource: creating a resource that already exists (duplicate unique key), an optimistic-concurrency version mismatch (ETag/`If-Match` failed), or trying to transition a resource into an invalid state (cancel an already-shipped order).

**Tip:** Contrast with 422: 409 is about _conflicting state_; 422 is about _invalid input values_.

### Q16: What goes in a typical request/response structure?

**A:** A request has a method, URL, headers (Content-Type, Accept, Authorization), and an optional body. A response has a status code, headers (Content-Type, Cache-Control, ETag, Location), and a body. Keep response bodies consistent — either return the resource directly or wrap it, but be uniform across the API.

```json
// 201 Created  — POST /api/v1/orders
{
  "id": "ord_8f2",
  "status": "pending",
  "items": [{ "productId": "p_1", "qty": 2 }],
  "total": 4999,
  "currency": "USD",
  "createdAt": "2026-06-21T10:00:00Z"
}
```

**Tip:** Decide early: wrap responses in `{ data: ... }` or not. Mixing styles across endpoints is a common red flag reviewers catch.

### Q17: What are the key HTTP headers in API design?

**A:**

- `Content-Type` — format of the request/response body (`application/json`).
- `Accept` — formats the client can handle (drives content negotiation).
- `Authorization` — credentials, e.g. `Bearer <jwt>` or `ApiKey <key>`.
- `Cache-Control` — caching directives (`no-store`, `max-age=60`, `private`).
- `ETag` / `If-None-Match` / `If-Match` — conditional requests / optimistic concurrency.
- `Location` — URL of a newly created resource (with 201) or async job status.
- `Retry-After` — how long to wait (with 429/503).
- `X-Request-Id` — correlation/tracing id.

**Tip:** Knowing ETag and Retry-After by name signals real-world experience.

### Q18: What is content negotiation?

**A:** The mechanism by which client and server agree on a representation. The client sends `Accept: application/json` (or `application/xml`, a language via `Accept-Language`, etc.) and the server responds with the best match, setting `Content-Type` accordingly. If it can't satisfy the `Accept`, it returns `406 Not Acceptable`.

**Tip:** Most JSON APIs barely use it, but it's also how media-type versioning works (`Accept: application/vnd.myapp.v2+json`).

### Q19: Why must REST be stateless, and what are the trade-offs?

**A:** Statelessness means the server stores no per-client session between requests — every request carries its own auth and context (a token, not a server-side session id). Benefits: any server instance can handle any request → trivial horizontal scaling, easier load balancing, better resilience. Trade-off: each request is larger (carries the token/context) and you can't keep convenient server-side session state, so you push it to the client or a shared store (Redis/DB).

**Tip:** Connect it to scaling: "Because the server is stateless, I can run N instances behind a load balancer and any one can serve any request — that's why JWTs fit REST well."

### Q20: Explain offset, page, and cursor pagination.

**A:**

- **Offset/limit**: `?limit=20&offset=40`. Simple, allows jumping to any page, but slow on deep offsets (DB scans/skips rows) and **drifts** — if rows are inserted/deleted while paging, you skip or repeat items.
- **Page-based**: `?page=3&pageSize=20` — same as offset under the hood, friendlier numbers.
- **Cursor (keyset)**: `?limit=20&cursor=<opaque>`. The cursor encodes the last-seen sort key (e.g. `createdAt+id`). Stable under inserts, fast at any depth, but no random page jumps and the data must be ordered by a stable key.

**Tip:** Cursor is the right answer for infinite scroll, large datasets, and real-time feeds. Offset is fine for small admin tables that need page numbers.

### Q21: Show a good paginated response shape.

**A:** Separate the data from the metadata so clients can render controls:

```json
// GET /api/v1/orders?limit=2&cursor=eyJjcmVhdGVkQXQiOiIuLi4ifQ
{
  "data": [
    { "id": "ord_8f2", "total": 4999, "createdAt": "2026-06-21T10:00:00Z" },
    { "id": "ord_8f1", "total": 1200, "createdAt": "2026-06-21T09:58:00Z" }
  ],
  "meta": {
    "limit": 2,
    "hasNextPage": true,
    "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTA2LTIxVDA5OjU4OjAwWiJ9"
  }
}
```

For offset style, `meta` would be `{ "page": 1, "pageSize": 20, "totalItems": 134, "totalPages": 7 }`.

**Tip:** Keep the cursor **opaque** (base64-encoded) so clients don't depend on its internals and you can change the encoding later.

### Q22: How do you design filtering, sorting, and searching?

**A:** Use query parameters, kept consistent:

- **Filter**: `?status=pending&minTotal=1000` (field=value), or a structured operator syntax `?total[gte]=1000`.
- **Sort**: `?sort=-createdAt,total` (leading `-` = descending), allow only a whitelist of sortable fields.
- **Search**: a dedicated `?q=margherita` for full-text, separate from exact filters.
- **Field selection**: `?fields=id,total,status` for sparse fieldsets.

**Tip:** Whitelist sortable/filterable fields to avoid injection and accidental full-table scans on unindexed columns.

---

## Advanced

### Q23: Compare API versioning strategies.

**A:**

- **URI path** (`/api/v1/orders`): explicit, easy to route, cache- and browser-friendly, trivially testable. Downside: "impure" (the URI of a resource changes between versions). Most common in practice — and what you use.
- **Custom header** (`X-API-Version: 2`): keeps URLs clean, but harder to test in a browser and easy to forget; not cache-key-friendly by default.
- **Media type / `Accept`** (`Accept: application/vnd.myapp.v2+json`): the most "RESTful," versions representations not resources, but complex and unfamiliar to many clients.
- **Query param** (`?version=2`): simple middle ground, but muddies caching and feels bolted-on.

**Tip:** There's no "right" answer — say "I default to URI versioning for clarity and tooling, and version the whole API rather than per-endpoint." Mention that you avoid breaking changes within a version.

### Q24: How do you version an API in NestJS?

**A:** Enable versioning globally, then tag controllers or handlers with a version. URI versioning is the default and easiest to curl/route; `HEADER` and `MEDIA_TYPE` are also supported.

```ts
app.enableVersioning({ type: VersioningType.URI }); // → /v1/users, /v2/users

@Controller({ path: "users", version: "1" })
export class UsersV1Controller {
  @Get() findAll() {
    /* ... */
  }

  @Version("2") // override just this handler
  @Get()
  findAllV2() {
    /* ... */
  }
}
```

When retiring a version, emit `Deprecation` and `Sunset` headers so clients get warning. Bump the version only for **breaking** changes; evolve additively otherwise (new optional fields don't need a new version), and keep old versions alive ~6–12 months.

**Tip:** Start with URI versioning (trivial to test in a browser/curl) and version the whole API, not per-endpoint.

### Q25: What is HATEOAS, and do people use it?

**A:** Hypermedia As The Engine Of Application State — responses include links telling the client what actions are available next, so the client navigates the API via links rather than hard-coding URLs. It's REST's Level 3 (Richardson) and what Fielding considered mandatory for "true" REST.

```json
{
  "id": "ord_8f2",
  "status": "pending",
  "_links": {
    "self": { "href": "/api/v1/orders/ord_8f2" },
    "cancel": { "href": "/api/v1/orders/ord_8f2/cancel", "method": "POST" },
    "pay": { "href": "/api/v1/orders/ord_8f2/payments", "method": "POST" }
  }
}
```

In practice it's **rarely fully implemented** — most APIs are Level 2. It shines in evolvable, long-lived hypermedia systems but adds complexity most teams skip.

**Tip:** Be honest: "I know HATEOAS is the formal top of the maturity model, but most production APIs including mine stop at Level 2 because clients hard-code routes anyway."

### Q26: How do you design a consistent error response?

**A:** Every error — across every endpoint — should share one shape with a stable machine-readable `code`, a human message, and optionally field-level details. A good standard is RFC 7807 `application/problem+json`:

```json
// 422 Unprocessable Entity   Content-Type: application/problem+json
{
  "type": "https://api.foody.com/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/orders",
  "requestId": "req_01HXYZ...",
  "errors": [
    { "field": "items[0].qty", "message": "must be >= 1" },
    { "field": "currency", "message": "must be a valid ISO 4217 code" }
  ]
}
```

**Tip:** The key insight interviewers want: clients should branch on a **stable `code`**, never on the human-readable message (which you may change/localize). Include the `requestId` so support can trace it.

### Q27: How do rate limiting and 429 work?

**A:** The server caps requests per client (per API key/user/IP) over a window (e.g. token bucket or sliding window). Over the limit → `429 Too Many Requests`, ideally with a `Retry-After` header and informational headers:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 30
```

**Tip:** Mention algorithms (token bucket / sliding window / fixed window) and where you enforce it (gateway/middleware, backed by Redis so it works across instances — required because the API is stateless).

### Q28: Authentication vs authorization in APIs?

**A:** **Authentication** = _who are you_ (verifying identity: Bearer JWT, session, API key). **Authorization** = _what can you do_ (permissions/roles: can this user read this specific order?). A request can be authenticated but unauthorized (→ 403). For APIs: short-lived **Bearer tokens (JWT)** for user-facing apps, **API keys** for server-to-server, OAuth2 for third-party delegated access.

**Tip:** Bearer token → `Authorization: Bearer <jwt>`. JWTs fit stateless REST; if you need instant revocation, pair them with a short TTL + refresh token or a revocation list.

### Q29: What is CORS and why does it exist?

**A:** Cross-Origin Resource Sharing is a browser security mechanism. By default the same-origin policy blocks JS on `site-a.com` from reading responses from `api.site-b.com`. CORS lets the server opt in via headers (`Access-Control-Allow-Origin`, `-Methods`, `-Headers`, `-Credentials`). For "non-simple" requests the browser first sends a **preflight** `OPTIONS` request to check permission.

**Tip:** Two gotchas:

1. CORS is enforced by the _browser_, not the server — curl/Postman ignore it
2. `Access-Control-Allow-Origin: *` cannot be combined with credentials — you must echo a specific origin

### Q30: How does HTTP caching with ETag work?

**A:** The server sends an `ETag` (a hash/version of the resource) with the response. On the next request the client sends `If-None-Match: <etag>`. If unchanged, the server returns `304 Not Modified` with no body — saving bandwidth. `ETag`/`If-Match` also power **optimistic concurrency**: a PUT/PATCH with `If-Match: <etag>` fails with `412 Precondition Failed` (or 409) if someone else modified the resource in the meantime.

```http
# First response
HTTP/1.1 200 OK
ETag: "v3-abc123"
Cache-Control: private, max-age=60

# Client revalidates
GET /api/v1/orders/ord_8f2
If-None-Match: "v3-abc123"
# → 304 Not Modified  (no body)
```

**Tip:** Distinguish `Cache-Control` (how long a client may use a cached copy without asking) from ETag/conditional requests (how it revalidates). Both together = efficient caching.

### Q31: How do you handle async / long-running operations?

**A:** Don't block the request. Return `202 Accepted` immediately with a job resource, then let the client either **poll** the status URL or receive a **webhook** when done.

```http
POST /api/v1/reports
→ 202 Accepted
  Location: /api/v1/jobs/job_77

GET /api/v1/jobs/job_77
→ 200 { "status": "processing", "progress": 40 }
... later ...
→ 200 { "status": "done", "result": { "downloadUrl": "https://..." } }
```

**Tip:** Webhooks scale better than polling but require the client to expose an endpoint and you to sign payloads (HMAC) + retry with backoff. Polling is simpler and firewall-friendly.

### Q32: How do you stream server→client updates in NestJS with SSE?

**A:** An `@Sse()` handler returns an `Observable<MessageEvent>`; NestJS keeps the connection open and pushes each emitted value as an SSE frame. The browser consumes it with `EventSource`.

```ts
@Sse('events')
stream(): Observable<MessageEvent> {
  return interval(1000).pipe(map((n) => ({ data: { n } })));
}
```

```ts
const es = new EventSource("/events");
es.onmessage = (e) => console.log(JSON.parse(e.data)); // { n: 0 }, { n: 1 }, ...
```

SSE is **one-way** (server→client), auto-reconnects, carries event IDs so the client can resume, and runs over plain HTTP/2 — ideal for notifications, log/progress streams, and LLM token streaming. Reach for a WebSocket gateway only when you need true **bidirectional** messaging (chat, live cursors).

**Tip:** Pick SSE for one-way streaming — it's far simpler than WebSockets; it's the natural fit for AI token streaming.

### Q33: What are webhooks and how do you secure them?

**A:** A webhook is a reverse API call: when an event happens (payment succeeded, order shipped) your server POSTs a payload to a URL the client registered. Secure them by: signing the body with an HMAC the receiver verifies (`X-Signature` header), including a timestamp to prevent replay, retrying with exponential backoff on failure, and making the receiver idempotent (you may deliver the same event twice).

**Tip:** "At-least-once delivery" → receivers must dedupe by event id. That's the same idempotency thinking as POST retries.

### Q34: How do you design reliable webhook delivery (the sender side)?

**A:** **Persist the event first**, then deliver from a background worker — so delivery is decoupled from the request that produced the event (the outbox pattern). Each row carries a stable unique event id, the payload, attempt count, and status.

```ts
// 1) In the same DB transaction as the business change:
await tx.insert("webhook_events", {
  id: "evt_8f2",
  type: "order.shipped",
  payload,
  status: "pending",
});

// 2) A worker picks up pending events and signs the body:
const ts = Date.now();
const signature = hmacSha256(secret, `${ts}.${rawBody}`); // sign timestamp + "." + body
await fetch(url, {
  method: "POST",
  headers: {
    "X-Webhook-Id": "evt_8f2",
    "X-Webhook-Timestamp": String(ts),
    "X-Signature": signature,
  },
  body: rawBody,
});
```

Sign over `timestamp + "." + body` and send the timestamp so receivers can **reject replays** (old timestamp). **Retry with exponential backoff** (1m, 5m, 30m, 2h, 1d) and dead-letter after N attempts. The stable event id lets receivers **dedupe**. Receivers should verify the signature against the **raw body bytes** (not re-serialized JSON, which can reorder keys/whitespace) and return a 2xx fast, doing real work async.

**Tip:** Headline it as "persist-before-send + signed + retry/backoff + idempotent event id" — that's the outbox pattern applied to webhooks.

### Q35: REST vs GraphQL vs gRPC vs tRPC — when each?

**A:**

- **REST**: resource-oriented, HTTP-native, cacheable, universally understood. Default for public/3rd-party APIs and CRUD. Downsides: over/under-fetching, many round trips.
- **GraphQL**: client specifies exactly the fields it needs in one query — solves over/under-fetching, great for complex/aggregating frontends. Costs: caching is harder, server complexity, N+1 risk.
- **gRPC**: binary (Protobuf) over HTTP/2, contract-first, very fast, streaming — ideal for **internal service-to-service** comms and low-latency microservices. Poor browser support without a proxy.
- **tRPC**: end-to-end type safety for **TypeScript-only monorepos** (no codegen, no schema) — excellent DX when client and server are both TS and you control both. Not for public/polyglot APIs.

**Tip:** The interviewer wants trade-off reasoning: "REST for the public Foody API, gRPC if I split into internal microservices, tRPC if it were a single TS monorepo with a tightly coupled client."

### Q36: What does OpenAPI/Swagger give you?

**A:** OpenAPI is a machine-readable spec (YAML/JSON) describing your endpoints, schemas, params, responses, and auth. Swagger UI renders it as interactive docs. Benefits: single source of truth, auto-generated client SDKs and server stubs, contract testing, request validation, and a "try it out" console. In NestJS you generate it from decorators (`@nestjs/swagger`); in Express you write/annotate it (swagger-jsdoc) or generate from zod/TypeScript.

**Tip:** Mention you keep the spec close to the code (decorators/JSDoc) so docs don't drift — that's a maturity signal, and it's how Hirely (NestJS) and Foody (Express) differ in your stack.

### Q37: Summarize the OWASP API Security Top 10 risks you'd guard against.

**A:** The headline ones:

1. **BOLA (Broken Object Level Authorization)** — #1 risk: user A requests `/orders/123` (which belongs to user B) and the server returns it because it only checked auth, not ownership. **Always verify the authenticated user owns/may access the specific object.**
2. **Broken Authentication** — weak tokens, no expiry, credential stuffing.
3. **Broken Object Property Level Auth / Mass Assignment** — blindly binding the request body to your model lets a user set `isAdmin: true` or `role`. **Use a DTO/allow-list of writable fields.**
4. **Unrestricted Resource Consumption** — no rate limiting / pagination caps → DoS and cost blowups.
5. **Broken Function Level Authorization** — regular user calls an admin endpoint.
   Plus: SSRF, security misconfiguration, improper inventory (undocumented/old `/v1` endpoints).

**Tip:** If you remember only one, it's **BOLA + mass assignment** — they appear in nearly every API security question, and DTOs fix mass assignment cleanly.

### Q38: What are request IDs and how do they help tracing?

**A:** Assign each incoming request a unique id (generate one or accept `X-Request-Id`/`traceparent` from upstream). Attach it to every log line and return it in responses/errors. In a microservice/log-aggregation setup it lets you trace one request across services and hand a user a `requestId` for support. It's the foundation of distributed tracing (W3C `traceparent`, OpenTelemetry).

**Tip:** "I put the requestId in the error body and the logs so support can grep one request end to end."

### Q39: How do you design for backward compatibility?

**A:** Within a version, only make **additive, non-breaking** changes: add new optional fields/endpoints, never remove or rename existing fields, never tighten validation or change types/semantics, never change defaults. Breaking changes go in a new version. Tolerate unknown fields on input (don't 400 on extras unless you mean to). Deprecate gradually with a `Deprecation`/`Sunset` header and clear timelines.

**Tip:** "Adding a field is safe; removing/renaming/retyping one is breaking" — that one line answers most compatibility questions.

### Q40: Why use DTOs and not return your DB entities directly?

**A:** A DTO (Data Transfer Object) is the shape you expose over the wire, decoupled from your DB schema. Returning entities directly leaks internal columns (password hashes, internal flags, soft-delete markers), couples your API contract to your schema (a column rename breaks clients), and on input enables mass-assignment attacks. DTOs let you control exactly which fields are read/written and validate input.

**Tip:** In NestJS this is literal `class` DTOs + `ValidationPipe` + `class-transformer`; in Express you map manually or with zod. Either way: **the API contract is not the database.**

### Q41: How do soft deletes and timestamps fit in API design?

**A:** **Soft delete** = mark a row `deletedAt`/`isDeleted` instead of physically removing it — preserves history/audit and lets you restore. The API still returns `204` on `DELETE`, but default queries filter out soft-deleted rows. **Timestamps** (`createdAt`, `updatedAt`) belong on virtually every resource — they enable cursor pagination, caching/`If-Modified-Since`, sorting, and auditing. Use UTC ISO 8601.

**Tip:** Caveat: soft deletes complicate unique constraints (a "deleted" email still occupies the unique index) — mention you handle that with partial indexes or composite keys.

### Q42: Worked example — design an Orders API.

**A:** Resources and routes (URI-versioned):

```
GET    /api/v1/orders                 # list (paginated, filterable)
POST   /api/v1/orders                 # create  (Idempotency-Key for safe retries)
GET    /api/v1/orders/:id             # read one
PATCH  /api/v1/orders/:id             # partial update (e.g. address)
DELETE /api/v1/orders/:id             # soft-delete / cancel
POST   /api/v1/orders/:id/cancel      # state transition action
GET    /api/v1/orders/:id/items       # nested sub-resource
POST   /api/v1/orders/:id/payments    # pay (idempotent via key)
```

Status code decisions:

- Create success → **201** + `Location: /api/v1/orders/ord_8f2`.
- Validation fails (negative qty) → **422** with error array.
- Order id doesn't exist → **404**.
- Caller doesn't own the order → **403** (or 404 to avoid leaking existence).
- Cancel an already-shipped order → **409 Conflict**.
- Duplicate create via same Idempotency-Key → return the **original 201** result.
- Too many requests → **429** + `Retry-After`.

Response is a DTO (no internal columns), with `createdAt`/`updatedAt`, paginated as `{ data, meta }`, errors as `application/problem+json`.

**Tip:** This single example lets you demonstrate naming, methods, status codes, idempotency, pagination, error shape, and security (ownership check) in one answer — rehearse it as your "design an API" go-to.

### Q43: How do you handle file uploads in a REST API?

**A:** Three common approaches:

1. **`multipart/form-data`** POST to an endpoint (`POST /api/v1/users/:id/avatar`) — simplest, file + metadata in one request; handle with multer (Express) / `FileInterceptor` (NestJS). Enforce size/MIME limits.
2. **Pre-signed URLs** (recommended at scale): client asks your API for a short-lived S3 pre-signed URL, uploads **directly to object storage**, then notifies your API with the resulting key. Keeps large bytes off your app servers.
3. **Base64 in JSON** — avoid; ~33% size overhead and memory pressure.

**Tip:** Pre-signed URLs are the senior answer — "I don't proxy big files through my API; I issue a pre-signed URL so the client uploads straight to S3 and just tells me the key."

### Q44: How do you support partial responses and field selection?

**A:** Let clients request only the fields they need via a query param: `GET /api/v1/orders/123?fields=id,total,status`. The server projects only those fields. This reduces payload size and over-fetching (one of the things GraphQL solves natively). Also support **embedding/expansion** for related resources: `?expand=customer,items` to inline sub-resources and cut round trips.

**Tip:** Whitelist allowed fields and cap expansion depth so a client can't ask you to inline the whole graph.

### Q45: How do you design bulk operations?

**A:** For creating/updating many items at once: `POST /api/v1/orders/batch` with an array, or `PATCH` with a list. Decide the semantics up front — **all-or-nothing (transactional)** vs **partial success**. For partial success, return `207 Multi-Status` (or 200) with a per-item result array so the client knows which succeeded/failed.

```json
// 207 Multi-Status
{
  "results": [
    { "index": 0, "status": 201, "id": "ord_1" },
    { "index": 1, "status": 422, "error": { "code": "VALIDATION_ERROR" } }
  ]
}
```

**Tip:** State the trade-off explicitly: transactional is simpler to reason about; partial-success is more resilient for large batches. Pick based on whether items are independent.

### Q46: What's the difference between a long-running job endpoint and a normal one, and how do you avoid timeouts?

**A:** A normal endpoint completes within the request/response cycle (sub-second to a few seconds). Anything longer risks gateway/proxy timeouts (often ~30–60s) and ties up a worker. For long jobs: accept the request, enqueue it (queue/worker like BullMQ), return `202 Accepted` + a job URL, and let the client poll or receive a webhook. The HTTP request returns immediately; the work happens out-of-band.

**Tip:** Mention idempotency again — job submission should be idempotent (dedupe by an idempotency key or a deterministic job id) so retries don't enqueue duplicates.

### Q47: How do you return 304/conditional responses to save bandwidth on mobile?

**A:** Send `ETag` (or `Last-Modified`) on GETs. Clients store it and send `If-None-Match` (or `If-Modified-Since`) on the next fetch; if nothing changed you return `304 Not Modified` with empty body. On slow/metered mobile connections this avoids re-downloading unchanged lists/detail payloads while still revalidating freshness.

**Tip:** Pair short `Cache-Control: max-age` (serve from cache silently) with ETag revalidation (cheap check when stale) for the best UX.

### Q48: How do you design one API to serve both web and mobile clients?

**A:** Same endpoints, but a few concerns get sharper on mobile:

- **Versioning matters more.** Old app versions linger in the wild (users don't update), so keep 2+ versions live and sunset with telemetry showing real usage before you cut a version.
- **Cut round trips.** High-latency mobile networks hate chatty APIs — offer an aggregate endpoint (`GET /home` returning the bundle a screen needs) or sparse fieldsets (`?fields=id,total`). Compress responses (gzip/brotli).
- **Auth differs by client, not by endpoint.** Web uses cookies (+ CSRF protection and CORS); mobile uses `Authorization: Bearer` with refresh tokens stored in OS secure storage (Keychain/Keystore). The same guard detects the scheme.
- **Cheap polling** via `ETag` / `If-None-Match` → `304 Not Modified` so a backgrounded app refresh costs almost nothing.
- **Push notifications** go through APNs/FCM — that's separate from API responses, not a webhook to the device.
- **Server-driven config / feature flags** (`GET /config` read on app start) let you dark-launch features and even force a client upgrade when an old version must be retired.

**Tip:** Headline it: "mobile can't be force-updated like web → invest in version longevity, feature flags, and payload efficiency."

---

## Common Mistakes / Red Flags

- **Verbs in URLs** — `/createOrder`, `/getUsers`. The method is the verb; the URL is a noun.
- **Using only 200 for everything**, including errors (`200 OK` with `{"success": false}`). Use the right status code; clients and proxies rely on them.
- **Returning 200 for a created resource** instead of 201, or a body on 204.
- **Confusing 401 and 403, or 400 and 422** — a frequent knockout in interviews.
- **Making GET mutate state** — breaks safety; a prefetch or crawler can trigger side effects.
- **Treating POST as idempotent** — no idempotency key on payments → double charges on retry.
- **BOLA**: checking authentication but not object ownership — `/orders/:id` returns anyone's order.
- **Mass assignment**: binding the raw request body to your model, letting users set `role`/`isAdmin`.
- **Leaking DB entities** directly (password hashes, internal flags) instead of mapping to DTOs.
- **Inconsistent shapes** — some endpoints wrap in `{data}`, some don't; error shapes differ per route.
- **Offset pagination on huge tables** for infinite scroll — slow deep pages and item drift.
- **No pagination cap** — `?limit=1000000` lets a client DoS you; clamp `limit` to a max.
- **No versioning from day one**, then a forced breaking change with no migration path.
- **Breaking changes within a version** — removing/renaming fields, tightening validation silently.
- **Stuffing session state on the server**, defeating statelessness and horizontal scaling.
- **No rate limiting** and no `Retry-After` — OWASP "unrestricted resource consumption."
- **Swagger/OpenAPI docs that drift** from the actual implementation because they're hand-maintained separately.

## Further Reading

- [MDN — HTTP request methods & status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) and [Swagger documentation](https://swagger.io/docs/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [RFC 9110 (HTTP Semantics)](https://www.rfc-editor.org/rfc/rfc9110.html) and [RFC 7807 (Problem Details for HTTP APIs)](https://www.rfc-editor.org/rfc/rfc7807)
