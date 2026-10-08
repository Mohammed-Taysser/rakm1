# Web & Browser Fundamentals (64 questions)

> "How the web works" questions are an interviewer favourite because they're hard to fake: anyone can memorise React APIs, but tracing a request from a typed URL all the way to painted pixels reveals whether you actually understand DNS, TCP, TLS, HTTP, CORS, caching and the browser's rendering pipeline. For a back-end-leaning full-stack role at a fintech (NestJS + MongoDB + Next.js + Docker), this is where you prove you can reason about latency, security headers, cookies vs tokens, and CDN/caching behaviour under load. This sheet complements the deeper dives elsewhere: REST/HTTP semantics in `10-rest-api-design.md`, auth/token storage in `11-auth-security.md`, browser security (XSS/CSRF/CSP) in `24-security-deep-dive.md`, SSR/SPA rendering in `06-nextjs-ssr.md`, React's DOM model in `03-react-core.md`, the Node event loop in `07-nodejs-runtime.md`, WebSockets in `15-realtime-websockets.md`, and infra/reverse-proxy/CDN in `18-devops-git.md` and `19-system-design.md`. Here we connect the dots end-to-end.

## Quick Revision Checklist

- **Type a URL → see a page**: URL parse → DNS lookup → TCP handshake → TLS handshake → HTTP request → server processing → HTTP response → browser parse + render. Know each hop.
- **DNS** maps names → IPs. Recursive resolver does the legwork; authoritative servers hold the truth. Records: A/AAAA, CNAME, MX, TXT, NS. Cached by **TTL**.
- **HTTP is stateless, text-based** (1.x) request/response. Anatomy: start line + headers + blank line + optional body.
- **HTTP versions**: 1.1 = keep-alive + head-of-line blocking; HTTP/2 = multiplexing + HPACK header compression over one TCP conn; HTTP/3 = QUIC over **UDP**, no TCP HOL blocking.
- **Methods**: GET/HEAD/OPTIONS are **safe**; GET/PUT/DELETE/HEAD/OPTIONS are **idempotent**; POST is neither (see `10`).
- **Status codes**: 2xx success, 3xx redirect/cache (304!), 4xx client error, 5xx server error. Know 200/201/204/301/304/400/401/403/404/409/422/429/500/502/503.
- **HTTPS = HTTP over TLS**: gives encryption + integrity + server authentication. Handshake uses **asymmetric** crypto to agree a **symmetric** session key.
- **Same-Origin Policy**: origin = scheme + host + port. **CORS** is a server-controlled relaxation of SOP — it protects the _user's browser_, not your server.
- **CORS preflight**: an `OPTIONS` request the browser sends for "non-simple" cross-origin requests; server must answer with `Access-Control-Allow-*` headers. `Allow-Credentials: true` cannot be combined with `Allow-Origin: *`.
- **Critical Rendering Path**: HTML→DOM, CSS→CSSOM, → Render Tree → Layout (reflow) → Paint → Composite. CSS and sync JS are **render-blocking**.
- **Scripts**: `defer` (run after parse, in order), `async` (run ASAP, any order), no attribute (blocks parsing). Put scripts at the end or use `defer`.
- **Reflow** (geometry) is more expensive than **repaint** (pixels); compositing-only changes (transform/opacity) are cheapest — done on the GPU.
- **Browser event loop**: call stack → microtasks (Promises) drained fully → one macrotask (timer/event) → render. Differs from Node's phased loop (see `07`).
- **Cookies vs storage**: cookies (~4KB, sent with every request, HttpOnly possible) vs localStorage (~5–10MB, JS-only, persistent) vs sessionStorage (per-tab) vs IndexedDB (large, async).
- **Cookie attributes**: `HttpOnly` (no JS), `Secure` (HTTPS only), `SameSite` (Lax/Strict/None), `Domain`/`Path`, `Max-Age`/`Expires`.
- **Caching**: `Cache-Control` (max-age/no-cache/no-store/private/public), `ETag`+`If-None-Match`→304, `Last-Modified`+`If-Modified-Since`. CDNs cache at the edge; cache-bust with hashed filenames.
- **Core Web Vitals**: LCP (loading), INP (interactivity, replaced FID in 2024), CLS (visual stability). Improve via preload, code splitting, image optimisation, no layout shift.
- **Security basics**: XSS (React escapes by default; `dangerouslySetInnerHTML` is the escape hatch), CSRF (mitigate with SameSite cookies + tokens), clickjacking (`X-Frame-Options`/CSP `frame-ancestors`), CSP. See `24`.
- **Realtime**: polling < long-polling < SSE (one-way) < WebSockets (bidirectional). REST for request/response, WS for push (see `15`).

---

## Basic

### Q1: What happens when you type a URL into the browser and hit Enter? (the classic)

**A:** End-to-end:

1. **URL parsing** — the browser breaks the URL into scheme, host, port, path, query, fragment. It also checks if the input is a search term vs a URL, and whether HSTS forces HTTPS.
2. **DNS resolution** — the hostname (e.g. `api.bank.com`) is resolved to an IP address (checking browser cache → OS cache → router → recursive resolver → authoritative servers).
3. **TCP handshake** — a TCP connection is opened to that IP on the port (443 for HTTPS) via the SYN → SYN-ACK → ACK three-way handshake.
4. **TLS handshake** — for HTTPS, the client and server negotiate a cipher, the server presents its certificate, and they derive a shared symmetric session key.
5. **HTTP request** — the browser sends an HTTP request (e.g. `GET / HTTP/1.1` with headers like `Host`, `Accept`, cookies).
6. **Server processing** — load balancer/reverse proxy routes it, the app (NestJS/Next.js) handles it, queries MongoDB, and builds a response.
7. **HTTP response** — status line + headers + body (HTML) come back.
8. **Browser rendering** — parse HTML → DOM, fetch sub-resources (CSS/JS/images, each possibly its own DNS/TCP/TLS/HTTP), build CSSOM, render tree, layout, paint, composite. JS executes, hydration runs.

**Tip:** Interviewers use this to gauge breadth. Walk it as a _journey_ and offer to go deeper on any hop ("I can drill into the TLS handshake if useful"). Mention caching shortcuts (DNS cache, keep-alive, HTTP cache) — it shows real-world awareness.

### Q2: What is a URL made of?

**A:** `scheme://host:port/path?query#fragment`. Example: `https://api.bank.com:443/v1/accounts?type=savings#summary`.

- **scheme** — protocol (`https`, `http`, `ws`, `mailto`).
- **host** — domain or IP.
- **port** — defaults to 80 (http) / 443 (https) if omitted.
- **path** — resource location on the server.
- **query** — `?key=value&...` parameters.
- **fragment** — `#anchor`, processed **client-side only**, never sent to the server.

**Tip:** The fragment-not-sent detail is a nice differentiator (it powers client-side routing in older SPAs and in-page anchors).

### Q3: What is DNS and why do we need it?

**A:** The Domain Name System is the internet's phone book: it translates human-friendly names (`bank.com`) into machine IP addresses (`93.184.216.34` or an IPv6 `2606:...`). Humans remember names; routers route to IPs. DNS is a hierarchical, distributed, cached system so no single server holds everything.

**Tip:** Call it "distributed and cached" — that's why it scales to the whole internet.

### Q4: What is HTTP?

**A:** HyperText Transfer Protocol — the request/response application-layer protocol the web runs on. A client sends a request (method + path + headers + optional body); the server returns a response (status + headers + optional body). It's **stateless** — each request is independent, so state is carried via cookies, tokens, or query params.

**Tip:** "Stateless" is the keyword. It's _why_ we need cookies/tokens, and it's what makes horizontal scaling possible (see `10`).

### Q5: What's the difference between HTTP and HTTPS?

**A:** HTTPS is HTTP wrapped in **TLS** (Transport Layer Security). HTTP sends everything in plaintext — anyone on the path can read or tamper with it. HTTPS adds **encryption** (confidentiality), **integrity** (tamper detection), and **authentication** (you're really talking to `bank.com`, verified by a certificate). HTTPS uses port 443, HTTP uses 80.

**Tip:** For fintech, say "TLS is non-negotiable — we'd also enforce HSTS so browsers refuse to downgrade to HTTP."

### Q6: What is a status code? Name the categories.

**A:** A 3-digit code in the response status line indicating the result:

- **1xx** Informational (rare — `100 Continue`, `101 Switching Protocols` for WS).
- **2xx** Success — `200 OK`, `201 Created`, `204 No Content`.
- **3xx** Redirect / cache — `301 Moved Permanently`, `302 Found`, `304 Not Modified`.
- **4xx** Client error — `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`.
- **5xx** Server error — `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`.

**Tip:** Know **401 vs 403** (unauthenticated vs forbidden) and **400 vs 422** (malformed vs semantically invalid) cold — covered in `10`.

### Q7: What are the common HTTP methods?

**A:** `GET` (read), `POST` (create / non-idempotent action), `PUT` (full replace), `PATCH` (partial update), `DELETE` (remove), `HEAD` (headers only, no body), `OPTIONS` (capabilities / CORS preflight).

**Tip:** Pair this with safe/idempotent (next question) — interviewers almost always follow up.

### Q8: What are "safe" and "idempotent" methods?

**A:** **Safe** = no server-side side effects (read-only): GET, HEAD, OPTIONS. **Idempotent** = doing it N times has the same effect as doing it once: GET, HEAD, OPTIONS, PUT, DELETE. **POST is neither** — two POSTs may create two records. PATCH _can_ be idempotent if designed so.

**Tip:** This is exactly why payment/order endpoints use an `Idempotency-Key` header to dedupe retries (see `10`). Great fintech tie-in.

### Q9: What is a cookie?

**A:** A small piece of data the server sets via the `Set-Cookie` response header; the browser stores it and automatically sends it back on every subsequent request to that domain via the `Cookie` header. Used for sessions, auth, preferences, and tracking.

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/
```

**Tip:** "Sent automatically on every matching request" is the key property — it's both cookies' convenience and the root of CSRF.

### Q10: What's the difference between localStorage, sessionStorage, and cookies?

**A:**
| | Cookie | localStorage | sessionStorage |
|---|---|---|---|
| Size | ~4 KB | ~5–10 MB | ~5–10 MB |
| Sent to server | Yes, every request | No (JS only) | No |
| Lifetime | Set by Expires/Max-Age | Until cleared | Until tab closes |
| Accessible by JS | Only if not `HttpOnly` | Yes | Yes |
| Scope | Domain + path | Origin | Origin + tab |

**Tip:** Rule of thumb: cookies for things the _server_ needs each request (sessions); localStorage/sessionStorage for client-only state. For where to store auth tokens, see `11`/`24` (the XSS vs CSRF trade-off).

### Q11: What is the DOM?

**A:** The Document Object Model is the browser's in-memory, tree-structured representation of the parsed HTML. Each element/attribute/text is a node. JavaScript reads and mutates the DOM (`document.querySelector`, `element.textContent`) to make pages interactive. It's an _API over the document_, not the HTML source itself.

**Tip:** Distinguish HTML (the text you write) from the DOM (the live tree the browser builds and JS manipulates). React keeps a Virtual DOM to minimise expensive real-DOM operations (see `03`).

### Q12: What is the Same-Origin Policy?

**A:** A browser security rule: scripts on one **origin** can't read responses from a different origin by default. An **origin** = **scheme + host + port**. `https://app.bank.com` and `https://api.bank.com` are different origins (different host); so are `http://` vs `https://` (scheme) and `:3000` vs `:8080` (port).

**Tip:** Memorise "scheme + host + port" — it's the single most-asked CORS sub-question.

### Q13: What is CORS in one sentence?

**A:** Cross-Origin Resource Sharing is a server-controlled mechanism that uses HTTP headers to tell the browser it's allowed to relax the Same-Origin Policy for specific cross-origin requests.

**Tip:** Stress "server-controlled" and "tells the browser" — CORS rules are enforced _by the browser_, based on headers _the server_ sends.

---

## Intermediate

### Q14: Walk me through DNS resolution step by step.

**A:** Resolving `www.bank.com`:

1. **Browser cache** — already resolved recently? Use it.
2. **OS cache / hosts file** — the OS resolver cache (and `/etc/hosts`).
3. **Recursive resolver** — usually your ISP's or a public one (8.8.8.8, 1.1.1.1). This server does the legwork on your behalf.
4. **Root nameserver** — the resolver asks a root server, which replies "ask the `.com` TLD servers."
5. **TLD nameserver** — the `.com` server replies "ask `bank.com`'s authoritative nameserver."
6. **Authoritative nameserver** — holds the actual records and returns the A/AAAA record (the IP).
7. The resolver **caches** the answer (per TTL) and returns it to the OS → browser.

**Tip:** Distinguish **recursive** (does the work, returns the final answer) from **authoritative** (the source of truth for a zone). Mention caching/TTL — it's why DNS changes "take time to propagate."

### Q15: Name the common DNS record types.

**A:**

- **A** — name → IPv4 address.
- **AAAA** — name → IPv6 address.
- **CNAME** — alias of one name to another name (e.g. `www` → `bank.com`). Can't coexist with other records at the same name.
- **MX** — mail exchange servers for the domain (with priority).
- **TXT** — arbitrary text; used for SPF/DKIM/domain verification.
- **NS** — delegates a zone to authoritative nameservers.

**Tip:** TXT-for-verification (SPF/DKIM, ownership proofs) and CNAME-can't-be-at-the-apex are good details to drop.

### Q16: What is TTL in DNS and why does it matter?

**A:** Time To Live is how long (seconds) a record may be cached before a resolver must re-query. High TTL = fewer lookups, faster, but slow to change. Low TTL = changes propagate quickly but more query load. Before a planned migration you lower TTL ahead of time so the cutover is fast.

**Tip:** This is the practical answer to "why didn't my DNS change take effect immediately?" — caches still hold the old record until TTL expires.

### Q17: Describe the anatomy of an HTTP request and response.

**A:** A raw HTTP/1.1 exchange:

```http
GET /v1/accounts/42 HTTP/1.1        ← request line: method, path, version
Host: api.bank.com                  ← headers
Accept: application/json
Authorization: Bearer eyJhbGc...
                                    ← blank line separates headers from body
```

```http
HTTP/1.1 200 OK                     ← status line: version, code, reason
Content-Type: application/json      ← headers
Cache-Control: private, max-age=0
Content-Length: 47
                                    ← blank line
{"id":42,"balance":1050.25}         ← body
```

**Tip:** The structure (start line → headers → blank line → body) is identical for request and response. Being able to scribble this on a whiteboard signals fluency.

### Q18: What are the important HTTP headers to know?

**A:**

- **Host** — target domain (required in 1.1; enables virtual hosting).
- **Content-Type** — media type of the body (`application/json`, `text/html`).
- **Accept** — media types the client _wants_ back (content negotiation).
- **Authorization** — credentials, e.g. `Bearer <jwt>`.
- **Cache-Control** — caching directives.
- **ETag** / **If-None-Match** — conditional requests for caching.
- **Set-Cookie** / **Cookie** — set/return cookies.
- **User-Agent** — client software string.
- **Origin** — the calling origin (used by CORS/CSRF checks).
- **Referer** — the page that initiated the request (note the famous spelling typo).

**Tip:** Group them by purpose (negotiation, caching, auth, CORS) rather than listing randomly.

### Q19: What is content negotiation?

**A:** The mechanism by which client and server agree on a representation. The client sends `Accept` (media type), `Accept-Language`, `Accept-Encoding` (gzip/br); the server picks the best match and replies with the corresponding `Content-Type`, `Content-Language`, `Content-Encoding`, and a `Vary` header so caches key correctly.

**Tip:** `Vary: Accept-Encoding` is the detail that shows you understand how caching and negotiation interact.

### Q20: Explain HTTP/1.1 vs HTTP/2 vs HTTP/3.

**A:**

- **HTTP/1.1** — persistent connections (keep-alive) reuse one TCP socket, but responses come back in order: a slow response blocks later ones (**head-of-line blocking**). Pipelining existed but was effectively unusable. Browsers worked around it by opening ~6 parallel connections per origin.
- **HTTP/2** — **multiplexes** many concurrent streams over a _single_ TCP connection, **HPACK** header compression, server push (now deprecated), and stream prioritisation. Solves _application-layer_ HOL blocking but not _TCP-level_ HOL blocking (a lost TCP packet stalls all streams).
- **HTTP/3** — runs over **QUIC**, which is built on **UDP**. Each stream is independent, so packet loss on one stream doesn't stall others (no TCP HOL blocking), and the connection setup merges transport + TLS into fewer round trips with faster reconnection (connection migration).

**Tip:** The clean three-line summary: "1.1 = HOL blocking; 2 = multiplexing over TCP (still TCP HOL); 3 = QUIC over UDP, no HOL." Nail that and you sound senior.

### Q21: What are persistent connections and keep-alive?

**A:** In HTTP/1.0 each request opened and closed a TCP connection (expensive: handshake + TLS every time). HTTP/1.1 defaults to **keep-alive** — the TCP connection stays open and is reused for multiple requests, amortising the handshake cost. `Connection: keep-alive` / `Connection: close` control it.

**Tip:** Tie it back to the "what happens when you type a URL" answer — keep-alive is why fetching 50 sub-resources doesn't mean 50 handshakes.

### Q22: What is chunked transfer encoding?

**A:** `Transfer-Encoding: chunked` lets the server send the body in pieces without knowing the total size up front (so no `Content-Length`). Each chunk is prefixed with its size; a zero-length chunk ends the stream. Enables streaming responses (e.g. server-rendered HTML streamed as it's generated, or large reports).

**Tip:** Relevant to Next.js streaming SSR and to streaming large fintech reports — mention it as the transport behind "streaming responses."

### Q23: What does the TLS handshake do, simplified?

**A:** It establishes a secure channel before any HTTP is sent:

1. **ClientHello** — client offers TLS versions + cipher suites + a random.
2. **ServerHello** — server picks a cipher, sends its **certificate** (containing its public key) and a random.
3. **Certificate validation** — client verifies the cert chains up to a trusted **Certificate Authority** and matches the hostname.
4. **Key exchange** — using asymmetric crypto (e.g. ECDHE), both sides derive the same **symmetric session key** without ever sending it in the clear.
5. **Finished** — both switch to symmetric encryption; all further data (the HTTP) is encrypted with that fast symmetric key.

**Tip:** The headline: **asymmetric crypto to _agree on_ a symmetric key, then symmetric crypto for the actual data** (symmetric is much faster). TLS 1.3 cuts this to ~1 round trip.

### Q24: Why use symmetric crypto after an asymmetric handshake?

**A:** Asymmetric (public/private key) crypto is secure for exchanging a secret without a shared key beforehand, but it's computationally expensive. Symmetric crypto (one shared key) is far faster but needs a pre-shared key. TLS gets the best of both: asymmetric to securely _establish_ a shared symmetric key, then symmetric for the bulk encrypted traffic.

**Tip:** "Asymmetric to bootstrap, symmetric for throughput" is the one-liner.

### Q25: What are certificates and CAs?

**A:** A TLS certificate binds a public key to a domain and is digitally signed by a **Certificate Authority** (e.g. Let's Encrypt, DigiCert). Browsers ship with a list of trusted root CAs; if a cert chains up to one and matches the hostname and isn't expired/revoked, it's trusted. This is what authenticates "you're really talking to bank.com" and prevents MITM.

**Tip:** Mention the **chain of trust** (leaf → intermediate → root) and that the CA system is the web's trust anchor.

### Q26: What is HSTS?

**A:** HTTP Strict Transport Security — a `Strict-Transport-Security` response header that tells the browser "always use HTTPS for this domain for the next N seconds, even if the user types http://." It prevents protocol-downgrade and SSL-stripping attacks. Can be preloaded into browsers so even the first visit is forced to HTTPS.

**Tip:** For fintech, pair HSTS + `includeSubDomains` + preload as a baseline. See `24`.

### Q27: What is mixed content?

**A:** When an HTTPS page loads sub-resources (scripts, images, XHR) over plain HTTP. Browsers block active mixed content (scripts) outright and may warn on passive (images), because an HTTP resource on a secure page reopens the door to tampering.

**Tip:** The fix is to serve everything over HTTPS (or use protocol-relative/`https://` URLs); `Content-Security-Policy: upgrade-insecure-requests` can help.

### Q28: What's the difference between a simple and a preflighted CORS request?

**A:** A **simple request** (no preflight) meets all of: method is GET/POST/HEAD, only "safe" headers, and `Content-Type` is `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`. Anything else — `PUT`/`DELETE`/`PATCH`, custom headers (`Authorization` in some cases, `X-*`), or `Content-Type: application/json` — triggers a **preflight**: the browser first sends an `OPTIONS` request to ask permission before sending the real request.

**Tip:** "JSON body + custom headers ⇒ preflight" covers ~90% of real apps, since virtually every API call sends `Content-Type: application/json`.

### Q29: Show me a CORS preflight exchange.

**A:** Browser sends the preflight automatically:

```http
OPTIONS /v1/transfer HTTP/1.1
Origin: https://app.bank.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type, authorization
```

Server must respond:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.bank.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
```

Only if these match does the browser send the real `POST`. `Access-Control-Max-Age` lets the browser cache the preflight result.

**Tip:** Stress the preflight is sent **by the browser, not your code** — devs are often confused by the "extra" OPTIONS request in the network tab.

### Q30: How do you actually fix a CORS error?

**A:** On the **server**, not the client. Configure the API to send the correct `Access-Control-Allow-Origin` (and Methods/Headers/Credentials) for the calling origin. In NestJS: `app.enableCors({ origin: 'https://app.bank.com', credentials: true })`. A CORS error in the browser console almost always means the _server_ isn't returning the right headers — you can't fix it from front-end code.

**Tip:** Common gotcha: people try to "fix CORS" with a front-end flag or a browser extension. Make clear it's a server-side response-header config (or a same-origin reverse proxy).

### Q31: Why can't you use `Access-Control-Allow-Origin: *` with credentials?

**A:** When a request includes credentials (cookies / `Authorization`), the browser refuses a wildcard `*` and requires an explicit, exact origin in `Access-Control-Allow-Origin` _and_ `Access-Control-Allow-Credentials: true`. Otherwise any site could make authenticated requests with the user's cookies. So you echo back the validated origin from an allow-list.

**Tip:** This is a top-tier "gotcha" question. Answer: "wildcard + credentials is forbidden; you must reflect a specific allowed origin."

### Q32: Is CORS a security feature for my server?

**A:** No — and this is the key insight. CORS protects the **user's browser** from a malicious site reading responses on the user's behalf. It does **not** protect your server: anyone can hit your API directly with `curl`/Postman, ignoring CORS entirely (CORS is enforced only by browsers). Your server still needs real auth, authorization, and validation.

**Tip:** Say plainly: "CORS is a browser-side protection for the user, not a server-side firewall." This separates people who understand it from those who cargo-cult it. See `24`.

### Q33: Beyond Access-Control-Allow-Origin, which CORS headers and cookie settings do people forget?

**A:** Four easy-to-miss pieces:

- **`Vary: Origin`** — when you echo a per-request origin from an allow-list (rather than a static value), you **must** also send `Vary: Origin`, or a shared cache may serve origin A's `Access-Control-Allow-Origin` to origin B and break CORS intermittently.
- **`Access-Control-Expose-Headers`** (NestJS `exposedHeaders`) — by default JS can only read a small safelist of response headers; to read custom ones (`X-Total-Count`, `X-Request-Id`, a pagination/refresh header) the server must list them here.
- **Credentials gotchas** — with credentials you can't use `Allow-Origin: *` (echo a specific origin), the server must send `Access-Control-Allow-Credentials: true` **and** the client must set `credentials: 'include'` / `withCredentials` (both sides), and `Access-Control-Allow-Headers` must **explicitly** name `Authorization` — a `*` doesn't cover it when credentials are on.
- **Cookies** — a cross-site credentialed cookie must be set `SameSite=None; Secure` or the browser won't attach it even when CORS is configured correctly. This is a cookie concern, separate from CORS.

**Tip:** `Vary: Origin` and `Expose-Headers` are the two most-forgotten; remember the cookie needs `SameSite=None; Secure`, which is a cookie concern, not a CORS one.

### Q34: A request fails with a CORS error in the browser but works in curl — how do you debug it?

**A:** CORS is enforced by the **browser**, not the server; curl/Postman/server-to-server ignore it — so a successful curl tells you the server is fine and the problem is CORS headers/preflight. Open the Network tab: was an `OPTIONS` preflight sent, and what did it return? Common causes: (a) `OPTIONS` returns `404` (the route doesn't handle OPTIONS); (b) `OPTIONS` returns `401` because a **global** auth guard/middleware rejects the unauthenticated preflight — the #1 trap (exclude OPTIONS from auth, or call `enableCors`/CORS middleware **before** the guards); (c) missing or mismatched `Access-Control-Allow-Origin`; (d) `Access-Control-Allow-Headers` doesn't list a header you send; (e) a reverse proxy (nginx) or CDN stripping the CORS headers. Reproduce the preflight directly:

```bash
curl -i -X OPTIONS https://api.bank.com/v1/transfer \
  -H 'Origin: https://app.bank.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type, authorization'
```

**Tip:** "If curl works, it's CORS, not the server" — and the auth-guard-eats-the-OPTIONS-preflight bug is the classic real-world cause.

### Q35: Describe the Critical Rendering Path.

**A:** The steps the browser takes to turn bytes into pixels:

1. **Parse HTML → DOM** tree.
2. **Parse CSS → CSSOM** tree.
3. **Render Tree** — combine DOM + CSSOM, excluding non-visual nodes (`display:none`, `<head>`).
4. **Layout (reflow)** — compute the geometry (position/size) of every node.
5. **Paint** — fill in pixels (text, colours, borders, shadows) into layers.
6. **Composite** — the compositor (often GPU) assembles layers into the final frame on screen.

**Tip:** "DOM + CSSOM → render tree → layout → paint → composite." Mention that **CSS blocks rendering** (CSSOM must be built first) and **sync JS blocks parsing**.

### Q36: How do `async`, `defer`, and a plain `<script>` differ?

**A:**

```html
<script src="a.js"></script>
<!-- blocks HTML parsing while fetching + executing -->
<script src="b.js" async></script>
<!-- fetch in parallel, execute ASAP, order NOT guaranteed -->
<script src="c.js" defer></script>
<!-- fetch in parallel, execute after parse, IN order -->
```

- **No attribute** — parser stops, downloads, executes, then resumes. Render-blocking.
- **`async`** — downloads without blocking parse, but executes the moment it arrives (may interrupt parsing); order not guaranteed. Good for independent scripts (analytics).
- **`defer`** — downloads without blocking, executes after the DOM is parsed, in document order. Best default for app scripts that need the DOM.

**Tip:** "Use `defer` for app code, `async` for independent third-party scripts." Modern bundlers/`type="module"` are deferred by default.

### Q37: What is the difference between reflow and repaint?

**A:** **Reflow (layout)** recomputes element geometry — triggered by changes to size, position, adding/removing DOM nodes, reading layout properties (`offsetHeight`). It's expensive and can cascade to the whole subtree/page. **Repaint** redraws pixels without changing layout — e.g. changing `color` or `background`. Cheaper than reflow but still costs. **Compositing-only** changes (`transform`, `opacity`) skip layout _and_ paint and run on the GPU — cheapest of all.

**Tip:** Performance advice: animate with `transform`/`opacity`, batch DOM reads then writes to avoid "layout thrashing."

### Q38: How does the browser's event loop work?

**A:** JS is single-threaded with an event loop:

1. Run the current task on the **call stack** to completion (run-to-completion).
2. **Drain the entire microtask queue** (resolved Promises, `queueMicrotask`, `MutationObserver`).
3. Possibly **render** (style/layout/paint via `requestAnimationFrame` callbacks before paint).
4. Pick **one macrotask** (a timer callback, an event, a network callback) and go to step 1.

So `Promise.then` (microtask) always runs before `setTimeout(…, 0)` (macrotask), and before the next render.

**Tip:** Contrast with Node's _phased_ loop (timers/poll/check phases, `process.nextTick` before promises) — covered in `07`. Same single-threaded idea, different queue structure.

### Q39: What is `requestAnimationFrame`?

**A:** It schedules a callback to run right _before the next repaint_, synced to the display's refresh rate (~60fps → ~16.7ms). Use it for animations instead of `setTimeout`, so updates align with the browser's render cycle and pause automatically in background tabs.

**Tip:** Mention it as the "correct" place to do visual updates in the event-loop render step.

### Q40: What are debounce and throttle, and when do you use them?

**A:** Both limit how often a handler fires for rapid events (scroll, resize, keypress, input):

- **Debounce** — run the function only _after_ events stop for X ms (e.g. search-as-you-type: wait until the user pauses).
- **Throttle** — run at most once per X ms during a stream of events (e.g. scroll position updates, drag).

```js
const debounce = (fn, ms) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};
```

**Tip:** "Debounce = wait for quiet; throttle = rate-limit." They keep the main thread free and protect against expensive reflows/network calls.

### Q41: Explain `Cache-Control` directives.

**A:** The primary HTTP caching header:

- `max-age=3600` — fresh for 3600s.
- `no-cache` — may cache but must **revalidate** with the server (via ETag) before use.
- `no-store` — never cache (use for sensitive data — account balances, statements).
- `private` — only the browser may cache (not shared CDNs).
- `public` — any cache (CDN included) may store it.
- `must-revalidate` — once stale, don't serve without revalidating.
- `immutable` — won't change, never revalidate (for hashed asset filenames).

**Tip:** Fintech nuance: API responses with PII often want `Cache-Control: no-store, private`; static hashed JS/CSS bundles want `public, max-age=31536000, immutable`.

### Q42: How do ETags and conditional requests work? (304)

**A:** The server tags a response with an `ETag` (a content fingerprint). On the next request the browser sends `If-None-Match: "<etag>"`; if unchanged, the server replies `304 Not Modified` with **no body**, saving bandwidth. `Last-Modified` + `If-Modified-Since` do the same with timestamps.

```http
HTTP/1.1 200 OK
ETag: "v3-9f1c"
Cache-Control: no-cache
```

```http
GET /data HTTP/1.1
If-None-Match: "v3-9f1c"
```

```http
HTTP/1.1 304 Not Modified        ← body skipped, browser reuses cached copy
```

**Tip:** "Conditional request → 304 → reuse cached body" saves transfer while still revalidating freshness. Pairs naturally with `Cache-Control: no-cache`.

---

## Advanced

### Q43: TCP vs UDP — and where does each show up on the web?

**A:** **TCP** is connection-oriented, reliable, ordered (handshake, retransmission, congestion control) — the basis of HTTP/1.1 and HTTP/2. **UDP** is connectionless, fire-and-forget, no ordering/retransmit guarantees, but low-latency — the basis of QUIC (HTTP/3), DNS queries, and real-time media (VoIP, gaming, WebRTC).

**Tip:** "TCP = reliability, UDP = speed; HTTP/3 chose UDP (via QUIC) to escape TCP's head-of-line blocking" ties it back to HTTP versions.

### Q44: Briefly, what is the OSI / TCP-IP model?

**A:** Layered networking abstraction. TCP/IP's practical layers: **Link** (Ethernet/Wi-Fi), **Internet** (IP — routing/addressing), **Transport** (TCP/UDP — ports, reliability), **Application** (HTTP, DNS, TLS). OSI splits these into 7 layers; the famous ones are L4 (transport — load balancers operate here) and L7 (application — reverse proxies/API gateways operate here).

**Tip:** Know "L4 vs L7 load balancing" — L4 balances by IP/port (fast, dumb), L7 by HTTP content (routes by path/host, can do TLS termination). See `18`/`19`.

### Q45: What does a reverse proxy / load balancer / CDN do?

**A:**

- **Reverse proxy** (nginx, Envoy) — sits in front of your servers; terminates TLS, routes requests, adds headers, rate-limits, buffers. The client thinks it's the server.
- **Load balancer** — distributes traffic across multiple backend instances (round-robin, least-connections) for scale and availability; does health checks.
- **CDN** — a globally distributed cache that serves static (and increasingly dynamic/edge) content from a node geographically near the user, reducing latency and origin load.

**Tip:** In a layered system the client can't tell it's not talking to the origin (a REST constraint) — which is exactly what enables proxies/LBs/CDNs. See `19`.

### Q46: What is a CDN and how does edge caching help?

**A:** A Content Delivery Network caches copies of your assets at edge locations worldwide. A user in Tokyo hits a Tokyo edge node instead of a server in Virginia, cutting round-trip latency dramatically. Edge nodes honour `Cache-Control`/`ETag`; on a miss they fetch from origin and cache. Cache invalidation is done via versioned URLs or purge APIs.

**Tip:** Combine with **cache busting** (next Q) — CDNs + hashed filenames let you cache aggressively yet deploy instantly.

### Q47: What is cache busting?

**A:** Forcing clients/CDNs to fetch a new version of a file by changing its URL — typically a content hash in the filename (`app.4f2a9c.js`). Because the URL changes when content changes, you can set `Cache-Control: immutable, max-age=1y` safely: old URLs keep their cached copy, new deploys reference new hashed URLs. Bundlers (webpack/Vite/Next.js) do this automatically.

**Tip:** "Hashed filenames + immutable caching" is the canonical answer — never cache-bust with `?v=timestamp` query strings on a CDN that ignores query keys.

### Q48: Latency vs bandwidth — what's the difference and which matters more?

**A:** **Bandwidth** is how much data per second the pipe can carry (Mbps). **Latency** is the round-trip delay for a single packet (ms, dominated by physical distance + hops). For typical web pages with many small requests, **latency usually dominates** — more bandwidth won't fix a chatty app with many sequential round trips. That's why we minimise round trips (HTTP/2 multiplexing, bundling, preconnect, CDNs).

**Tip:** "You can't buy your way out of latency with bandwidth" is a memorable framing.

### Q49: What is the network waterfall and how do you read it?

**A:** The DevTools "waterfall" shows each request as a horizontal bar over time: DNS lookup, initial connection (TCP), TLS, **TTFB** (waiting for the first byte = server think time), and content download. Stacked/staggered bars reveal blocking, serialised dependencies, and slow resources. You optimise by removing render-blocking resources, parallelising, and shrinking the critical path.

**Tip:** Call out **TTFB** specifically as the server-side latency component — important for a back-end-leaning role.

### Q50: WebSockets vs SSE vs long polling vs REST?

**A:**

- **REST/polling** — client repeatedly asks "anything new?" Simple, wasteful, latency = poll interval.
- **Long polling** — client request held open until the server has data, then immediately re-opens. Better than naive polling, still HTTP overhead per message.
- **SSE (Server-Sent Events)** — a persistent HTTP connection for **server→client** text events (`text/event-stream`), with auto-reconnect. One-directional.
- **WebSockets** — a single TCP connection upgraded from HTTP for **full-duplex** binary/text messaging. Best for chat, live trading dashboards, collaborative apps.

**Tip:** "Push one-way and simple ⇒ SSE; bidirectional/low-latency ⇒ WebSocket; request/response ⇒ REST." See `15` for the WS handshake and scaling.

### Q51: How does the WebSocket handshake work?

**A:** It starts as an HTTP/1.1 request with an upgrade:

```http
GET /ws HTTP/1.1
Host: api.bank.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZQ==
Sec-WebSocket-Version: 13
```

The server replies `101 Switching Protocols`, after which the same TCP connection switches to the WebSocket framing protocol (`ws://`/`wss://`) for bidirectional messages. See `15`.

**Tip:** "Starts as HTTP, upgrades with `101 Switching Protocols`, then it's a persistent full-duplex socket." Mention `wss://` (TLS) for production.

### Q52: What are the Core Web Vitals?

**A:** Google's user-centric performance metrics:

- **LCP (Largest Contentful Paint)** — _loading_: time until the largest visible element renders. Target < 2.5s. Improve via fast TTFB, preloading the hero image, removing render-blocking resources.
- **INP (Interaction to Next Paint)** — _interactivity_: responsiveness across all interactions (replaced **FID** in March 2024). Target < 200ms. Improve by breaking up long JS tasks, code splitting.
- **CLS (Cumulative Layout Shift)** — _visual stability_: how much content unexpectedly jumps. Target < 0.1. Improve by reserving space for images/ads (`width`/`height`), avoiding inserting content above existing content.

**Tip:** Knowing **INP replaced FID in 2024** flags that your knowledge is current. Map each metric to loading/interactivity/stability.

### Q53: How do you improve front-end performance? (toolbox)

**A:**

- **Reduce bytes** — minification, **compression** (gzip / Brotli), tree-shaking, image optimisation (WebP/AVIF, responsive `srcset`, lazy loading `loading="lazy"`).
- **Reduce/parallelise requests** — code splitting, HTTP/2 multiplexing, bundling sensibly, CDNs.
- **Prioritise the critical path** — inline critical CSS, `defer` JS, `preload` key resources, `preconnect`/`dns-prefetch` to upcoming origins, `prefetch` next-page assets.
- **Cache** — long-lived hashed assets, ETags, service workers.
- **Server** — lower TTFB (caching, DB indexes, edge SSR).

**Tip:** Distinguish the resource hints: **preconnect** (warm up DNS+TCP+TLS to an origin), **dns-prefetch** (just DNS), **preload** (fetch a resource for _this_ page now), **prefetch** (fetch for a _future_ navigation, low priority).

### Q54: What is gzip vs Brotli?

**A:** Both are HTTP compression algorithms negotiated via `Accept-Encoding`/`Content-Encoding`. **gzip** is universally supported and fast. **Brotli (`br`)** generally compresses text 15–25% smaller, at higher CPU cost, and is now broadly supported — ideal for precompressed static assets. Compression is applied to text (HTML/CSS/JS/JSON), not to already-compressed images.

**Tip:** "Brotli for static (precompress at build), gzip as the universal fallback; don't double-compress images."

### Q55: What is XSS and how does React mitigate it?

**A:** Cross-Site Scripting injects attacker-controlled script that runs in the victim's browser, able to steal cookies/tokens and act as the user. React mitigates it by **escaping all interpolated values by default** — `{userInput}` is rendered as text, not HTML. The escape hatch `dangerouslySetInnerHTML` bypasses this (the scary name is intentional) and must only be used with sanitised input (e.g. DOMPurify).

**Tip:** "React escapes by default; `dangerouslySetInnerHTML` is the one place you can reintroduce XSS." Deeper coverage + defence layers (CSP, sanitisation) in `24`.

### Q56: What is CSRF and how do SameSite cookies help?

**A:** Cross-Site Request Forgery tricks a logged-in user's browser into sending a state-changing request to your site (the browser auto-attaches cookies). The **`SameSite`** cookie attribute is the primary modern defence:

- `Strict` — cookie never sent on cross-site requests.
- `Lax` (browser default) — sent on top-level GET navigations only, not cross-site POST/AJAX.
- `None` — sent cross-site, but **requires `Secure`** (HTTPS).

Combine with anti-CSRF tokens for sensitive actions.

**Tip:** "Token-in-Authorization-header auth isn't auto-sent, so it's largely immune to CSRF — but cookie-based sessions need SameSite + CSRF tokens." That XSS-vs-CSRF token-storage trade-off lives in `11`/`24`.

### Q57: What is clickjacking and how do you prevent it?

**A:** An attacker embeds your site in a transparent `<iframe>` over decoy UI, tricking users into clicking real buttons (e.g. "Confirm transfer"). Prevent it by forbidding framing: `X-Frame-Options: DENY` (legacy) or, preferred, CSP `frame-ancestors 'none'` (or an allow-list).

**Tip:** For fintech, deny framing of authenticated/transactional pages outright.

### Q58: What is a Content Security Policy (CSP)?

**A:** A response header (`Content-Security-Policy`) that whitelists where resources may load from — scripts, styles, images, connect targets, frame ancestors. It's a strong second line of defence against XSS: even if markup is injected, a strict CSP can block inline/untrusted scripts from executing.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-r4nd0m'; frame-ancestors 'none'
```

**Tip:** Mention **nonce/hash-based** CSP to allow specific inline scripts without `unsafe-inline`. Deep dive in `24`.

### Q59: What are Service Workers, the Cache API, and PWAs?

**A:** A **Service Worker** is a script the browser runs in the background, separate from the page, acting as a programmable network proxy — it can intercept `fetch`, serve from the **Cache API** (offline support), and handle push notifications. **PWAs (Progressive Web Apps)** use service workers + a web app manifest to make a site installable and offline-capable, feeling app-like. Service workers require HTTPS.

**Tip:** Keep it brief but note "service worker = programmable fetch proxy enabling offline + push; PWA = installable web app built on it."

### Q60: What's the difference between SPA, SSR, and MPA?

**A:**

- **MPA (Multi-Page App)** — server returns a full HTML page per navigation; classic, simple, SEO-friendly, full reloads.
- **SPA (Single-Page App)** — one HTML shell; JS renders everything client-side and handles routing via the History API; fast in-app transitions but slow first paint and SEO challenges.
- **SSR (Server-Side Rendering)** — server renders HTML per request (then hydrates on the client) — best of both: fast first paint + SEO + interactivity. Next.js adds SSG, ISR, RSC, and streaming.

**Tip:** Map to trade-offs: MPA (simple/SEO), SPA (rich UX/poor first paint), SSR (fast first paint + SEO + hydration cost). Full treatment in `06`.

### Q61: Explain event bubbling, capturing, and delegation.

**A:** A DOM event travels in three phases: **capture** (root → target), **target**, then **bubble** (target → root). By default handlers fire in the bubble phase; pass `{capture: true}` for the capture phase. **Event delegation** exploits bubbling: attach one listener on a parent and inspect `event.target`, instead of binding to many children — efficient for lists and dynamic content.

```js
list.addEventListener("click", (e) => {
  const item = e.target.closest("li");
  if (item) handle(item.dataset.id); // one listener handles all <li>
});
```

**Tip:** Delegation = fewer listeners, works for dynamically added elements. `stopPropagation()` halts bubbling; `preventDefault()` cancels the default action — they're different.

### Q62: REST vs RPC vs GraphQL?

**A:**

- **REST** — resource-oriented over HTTP verbs; multiple endpoints; can over/under-fetch; great caching via HTTP.
- **RPC** (gRPC, JSON-RPC) — call remote _functions/procedures_; action-oriented; efficient (gRPC uses HTTP/2 + protobuf) for internal service-to-service.
- **GraphQL** — single endpoint; the client specifies exactly the fields it needs (solves over/under-fetching); strongly typed schema; trickier HTTP caching and harder rate-limiting.

**Tip:** "REST for public/cacheable resource APIs, gRPC for internal microservice calls, GraphQL for flexible client-driven data needs." GraphQL details in `28`.

### Q63: What are progressive enhancement and accessibility, briefly?

**A:** **Progressive enhancement** — build a baseline that works with plain HTML (and server rendering), then layer on CSS and JS so the core experience survives even if JS fails. **Accessibility (a11y)** — make the site usable by everyone, including assistive tech: semantic HTML, ARIA where needed, keyboard navigation, sufficient colour contrast, alt text, focus management.

**Tip:** Progressive enhancement and SSR reinforce each other (content works before hydration). Accessibility detail lives in `29`.

### Q64: Why is hydration relevant to "how the web works"?

**A:** With SSR, the server sends fully-rendered HTML so the user sees content fast (good LCP). The browser then downloads the JS bundle and **hydrates** — attaching event listeners and reconciling React's tree with the server HTML — to make it interactive. Until hydration completes, the page looks ready but isn't fully interactive (a contributor to poor INP). React Server Components and streaming reduce the JS that must hydrate.

**Tip:** Connect it to Core Web Vitals: SSR helps LCP, but hydration cost can hurt INP — the trade-off Next.js's newer features address. See `06`.

---

## Common Mistakes / Red Flags

- **Saying "CORS secures my API."** It protects the _browser/user_, not your server — `curl` ignores it entirely. Always the senior red-flag check.
- **Trying to fix CORS on the client.** CORS is fixed by the _server's_ response headers (or a same-origin reverse proxy), never a front-end setting.
- **`Allow-Origin: *` with `Allow-Credentials: true`.** Forbidden by browsers — must reflect a specific origin.
- **Confusing the OPTIONS preflight with a bug.** It's the browser doing its job; your server just needs to answer it.
- **Confusing the browser event loop with Node's.** Same idea, different phases/queues; microtasks-before-macrotasks holds in both, but Node has `nextTick`/phases (see `07`).
- **Mixing up safe vs idempotent**, or claiming POST is idempotent. POST is neither (see `10`).
- **"304 means an error."** 304 Not Modified is a _successful_ cache revalidation — the browser reuses its cached body.
- **Storing JWTs in localStorage without acknowledging the XSS risk** (or in cookies without acknowledging CSRF). Name the trade-off (see `11`/`24`).
- **Saying HTTPS only "encrypts."** It also provides _integrity_ and _authentication_ (the certificate).
- **Thinking more bandwidth fixes slowness.** Latency and round trips usually dominate.
- **Animating `width`/`top`/`left`** (triggers reflow) instead of `transform`/`opacity` (compositor-only).
- **Putting blocking `<script>` in `<head>`** without `defer`/`async`, stalling the parser and hurting LCP.
- **`no-cache` vs `no-store` confusion.** `no-cache` = revalidate before use; `no-store` = never store at all (use for sensitive financial data).
- **Claiming DNS changes are instant.** TTL-based caching delays propagation.
- **Forgetting the fragment (`#...`) is never sent to the server.**
- **Vague on origin definition.** It's scheme + host + port — all three.

## Further Reading

- MDN — "What happens when you navigate to a URL" / HTTP overview: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
- MDN — Cross-Origin Resource Sharing (CORS): https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- MDN — Critical rendering path & populating the page (how browsers work): https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work
- web.dev — Core Web Vitals: https://web.dev/articles/vitals
- High Performance Browser Networking (Ilya Grigorik, free online): https://hpbn.co/
