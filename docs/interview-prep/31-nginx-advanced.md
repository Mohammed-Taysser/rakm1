# Nginx (Advanced) (55 questions)

> Nginx sits at the edge of almost every production fintech stack: it terminates TLS, reverse-proxies your NestJS API, serves the built Next.js frontend, load-balances multiple Node containers, caches responses, and rate-limits the money endpoints before traffic ever reaches your app. Understanding it deeply lets you answer the "what happens between the browser and your Node process" question with authority — real client IPs, protocol detection, WebSocket upgrades, 502/504 debugging, and DDoS mitigation at the edge. This file goes DEEP and **complements `18-devops-git.md`** (which covers the basic reverse-proxy intro and a single server-block example). It also cross-references `24-security-deep-dive.md` (security headers, CSP), `11-auth-security.md` (trust proxy, real IP for auth), `27-web-browser-fundamentals.md` (browser caching/HTTP), and `14-redis-jobs-caching.md` (caching strategy, sticky sessions for stateful/WebSocket workloads).

## Quick Revision Checklist

- Nginx is **event-driven / async**: one master + a few workers, each worker handles thousands of connections via an event loop (epoll/kqueue) — not thread-per-connection like classic Apache (prefork).
- Config hierarchy: **main → events → http → server → location**; directives are scoped to a _context_.
- Always run `nginx -t` (test config) before `nginx -s reload` (graceful, zero-downtime reload).
- **Location matching priority**: `=` (exact) > `^~` (prefix, stops regex) > `~`/`~*` (regex, first match wins in file order) > longest plain prefix.
- `root` appends the URI to the path; `alias` _replaces_ the matched location prefix.
- `try_files $uri $uri/ /index.html;` = the classic SPA fallback for React/Next static export.
- Reverse proxy must forward `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` — and Node must `app.set('trust proxy', ...)` to read them.
- `upstream` block + algorithms: round-robin (default), `least_conn`, `ip_hash` (sticky), `hash`, weights; passive health via `max_fails`/`fail_timeout`.
- TLS termination at Nginx: `ssl_protocols TLSv1.2 TLSv1.3`, HTTP→HTTPS redirect, HSTS, OCSP stapling, certbot/Let's Encrypt.
- Caching: `proxy_cache_path` + `keys_zone`, `proxy_cache_valid`, micro-caching, `proxy_cache_use_stale` for resilience; `expires` for static assets.
- Performance: `gzip`/brotli, `sendfile`, `tcp_nopush`, `tcp_nodelay`, `keepalive_timeout`, HTTP/2, upstream `keepalive`.
- Rate limiting: `limit_req_zone` + `limit_req` (leaky bucket; `burst` + `nodelay`), `limit_conn` for connection caps — protects fintech money endpoints at the edge.
- WebSockets need `proxy_http_version 1.1` + `Upgrade`/`Connection` headers + long `proxy_read_timeout` (Socket.IO / Trust-Node real-time).
- Security: `server_tokens off`, security headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options), `client_max_body_size`, `allow`/`deny`, `return 444`.
- One-domain pattern: serve Next.js static + proxy `/api` to NestJS → no CORS.
- Common 502 = upstream down / wrong `proxy_pass`; 504 = upstream too slow / timeout too low. Debug via `error.log` + `nginx -t`.
- Ops: run Nginx as the entry container in Docker Compose, mount config read-only, emit JSON access logs for parsing (→ `32-monitoring`).

---

## Basic

_(“Basic” here = entry-level-advanced refresher — assumes you've read `18-devops-git.md`.)_

### Q1: What is Nginx and what are its main use cases?

**A:** Nginx ("engine-x") is a high-performance HTTP server and reverse proxy. Core use cases:

- **Reverse proxy** — front your NestJS/Node app, hide it from the internet.
- **Load balancer** — distribute traffic across multiple app instances.
- **Static file server** — serve the built Next.js/React assets efficiently.
- **TLS termination** — handle HTTPS so Node doesn't have to.
- **API gateway** — route `/api/users` to one service, `/api/payments` to another.

**Tip:** In an interview, frame it as "the thing between the browser and my Node process" — that primes every later answer (real IP, TLS, caching, rate limiting).

### Q2: Explain Nginx's process model and why it handles high concurrency well.

**A:** Nginx uses a **master process** + a small number of **worker processes**. The master reads config, binds ports, and manages workers; workers do the actual request handling. Each worker is **single-threaded and event-driven** — it runs an event loop (epoll on Linux, kqueue on BSD) and multiplexes thousands of connections asynchronously. A slow/idle connection just sits in the event loop costing almost nothing.

Contrast with classic Apache prefork/worker: **one thread (or process) per connection**. Under 10k concurrent connections that's 10k threads — huge memory and context-switching cost (the "C10k problem"). Nginx's async model keeps memory flat and CPU efficient.

**Tip:** Same architectural insight as Node's event loop — non-blocking I/O. Good place to connect to your Node knowledge.

### Q3: How do you set `worker_processes` and `worker_connections`?

**A:**

```nginx
worker_processes auto;           # one worker per CPU core
events {
    worker_connections 1024;     # max simultaneous connections PER worker
    # multi_accept on;           # accept as many connections as possible at once
}
```

Theoretical max clients ≈ `worker_processes × worker_connections`. But as a _reverse proxy_, each client request also consumes an upstream connection, so effective capacity is roughly halved.

**Tip:** `worker_processes auto` is the modern default; don't hardcode a number that won't match the host's cores (especially in containers — see the CPU-limit caveat below).

### Q4: How does Nginx differ from Apache (besides the process model)?

**A:**

- **Concurrency model**: Nginx event-driven; Apache traditionally thread/process-per-connection (though `event` MPM narrows the gap).
- **Config**: Nginx uses one declarative config tree; Apache uses `.htaccess` per-directory overrides (convenient but a performance hit — Nginx has no per-directory runtime config).
- **Static files**: Nginx is exceptionally fast at static serving and as a reverse proxy.
- **Dynamic content**: Apache embeds interpreters (`mod_php`); Nginx proxies to an external process (PHP-FPM, Node) — cleaner separation.

**Tip:** A common real-world setup is Nginx in front of Apache, but for a Node stack you almost always use Nginx → Node directly.

### Q5: What is the config hierarchy / context structure?

**A:** Directives live in nested _contexts_:

```nginx
# main context (global)
worker_processes auto;

events { ... }            # connection processing

http {                    # all HTTP-level config
    gzip on;
    upstream api { ... }  # backend pool

    server {              # a virtual host
        listen 443 ssl;
        server_name app.example.com;

        location /api/ {  # routing within the host
            proxy_pass http://api;
        }
    }
}
```

A directive is only valid in certain contexts; child contexts **inherit** many directives from their parent unless overridden.

**Tip:** Know the order cold — `main → events → http → server → location`. It's a frequent whiteboard question.

### Q6: What's the difference between `nginx -t`, `nginx -s reload`, and a restart?

**A:**

- `nginx -t` — **test** the config syntax without applying. Always run first.
- `nginx -s reload` — **graceful reload**: master re-reads config, spins up new workers with the new config, and lets old workers finish in-flight requests before exiting. **Zero downtime.**
- A full restart (`systemctl restart nginx`) drops connections — avoid in production.

```bash
nginx -t && nginx -s reload   # safe deploy idiom
```

**Tip:** `nginx -t && nginx -s reload` is the one-liner to remember. Never reload blind.

### Q7: How does `server_name` matching work?

**A:** Nginx picks the `server` block by:

1. Exact name (`api.example.com`)
2. Leading wildcard (`*.example.com`)
3. Trailing wildcard (`example.*`)
4. Regex (`~^api\d+\.example\.com$`)
5. The **default_server** for that `listen` (or the first block) if nothing matches.

```nginx
server {
    listen 80 default_server;
    server_name _;          # catch-all
    return 444;             # drop unknown-host requests (e.g. bots hitting the IP)
}
```

**Tip:** Mark exactly one block per `listen` as `default_server`; otherwise the first defined block wins by accident.

### Q8: `root` vs `alias` — what's the difference?

**A:** `root` _appends_ the full request URI to the given path; `alias` _substitutes_ the matched location prefix.

```nginx
location /static/ {
    root /var/www;          # /static/app.js  -> /var/www/static/app.js
}
location /static/ {
    alias /var/www/assets/; # /static/app.js  -> /var/www/assets/app.js
}
```

**Tip:** With `alias`, keep the trailing slash on both the location and the path. Mixing `alias` + regex location requires a capture group. Misusing these is a classic "why is my static 404-ing" bug.

### Q9: How do you serve a single-page app (React/Next static) with client-side routing?

**A:** Use `try_files` to fall back to `index.html` so deep links like `/dashboard/settings` don't 404:

```nginx
location / {
    root /var/www/app;
    try_files $uri $uri/ /index.html;
}
```

Nginx tries the literal file, then the directory, then serves `index.html` so the JS router takes over.

**Tip:** For hashed asset filenames you can cache aggressively (`expires 1y; immutable`) but **never** cache `index.html` — it's the entry point that references the new hashes. (See `27-web-browser-fundamentals.md`.)

### Q10: What's the basic reverse-proxy directive, and why isn't `proxy_pass` alone enough?

**A:** `proxy_pass http://127.0.0.1:3000;` forwards the request, but by default the upstream loses the original client info. You must forward headers:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Without these, your Node app sees `127.0.0.1` as the client IP and thinks every request is HTTP. (See `18-devops-git.md` for the intro version; the reverse-proxy section below goes deeper.)

**Tip:** Memorize those four headers — they're the single most-asked reverse-proxy detail.

### Q11: How do you turn on gzip, and what should you compress?

**A:**

```nginx
gzip on;
gzip_comp_level 5;            # 1-9; ~5 is the sweet spot (CPU vs ratio)
gzip_min_length 256;         # don't bother compressing tiny responses
gzip_vary on;                # add Vary: Accept-Encoding
gzip_types text/plain text/css application/json application/javascript
           text/xml application/xml image/svg+xml;
```

Only compress text-based types — images/video are already compressed and re-compressing wastes CPU.

**Tip:** Add `gzip_proxied any;` when behind another proxy/CDN so it still compresses proxied responses.

### Q12: What does `expires` do for static assets?

**A:** It sets `Cache-Control`/`Expires` so browsers cache files locally:

```nginx
location ~* \.(js|css|png|jpg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Tip:** `immutable` tells the browser to never revalidate during the lifetime — perfect for content-hashed bundles. Links to browser caching in `27-web-browser-fundamentals.md`.

### Q13: How do you do a permanent HTTP→HTTPS redirect?

**A:**

```nginx
server {
    listen 80;
    server_name app.example.com;
    return 301 https://$host$request_uri;
}
```

**Tip:** Prefer `return 301` over a `rewrite` — it's cheaper and clearer. `return` is evaluated before `try_files`/regex, so it short-circuits cleanly.

### Q14: How do you find and read Nginx logs?

**A:** Default locations are usually `/var/log/nginx/access.log` and `/var/log/nginx/error.log`.

```nginx
access_log /var/log/nginx/access.log;
error_log  /var/log/nginx/error.log warn;   # debug|info|notice|warn|error|crit
```

**Tip:** When debugging a 502/504, the **error log** is where the real story is (e.g. `connect() failed (111: Connection refused)`); the access log just shows the status code.

---

## Intermediate

### Q15: Walk through Nginx's location matching algorithm in priority order.

**A:** Given a request URI, Nginx evaluates locations like this:

1. **Exact match** `location = /path` — if it matches, stop immediately.
2. **Prefix matches** — Nginx remembers the **longest** matching prefix.
   - If that longest prefix uses `^~`, **stop** (skip regex).
3. **Regex matches** `~` (case-sensitive) / `~*` (case-insensitive) — checked **in the order they appear**; **first match wins**.
4. If no regex matches, the longest-prefix match from step 2 is used.

```nginx
location = /favicon.ico { ... }          # 1. exact
location ^~ /static/    { ... }          # 2. prefix, stops regex
location ~* \.(jpg|png)$ { ... }         # 3. regex
location /              { ... }          # 4. catch-all prefix
```

**Tip:** The two gotchas interviewers love:

- regex order matters (first wins, not longest)
- `^~` on a prefix disables regex evaluation for that prefix

This is a top-3 Nginx interview question.

### Q16: Explain `rewrite` and its flags (`last`, `break`, `redirect`, `permanent`).

**A:** `rewrite regex replacement [flag];` changes the URI internally or redirects:

- `last` — re-run location matching with the new URI (most common for internal rewrites).
- `break` — stop processing rewrites, keep the current location.
- `redirect` — return a 302 (temporary) external redirect.
- `permanent` — return a 301 external redirect.

```nginx
rewrite ^/old/(.*)$ /new/$1 permanent;     # 301 to client
rewrite ^/app/(.*)$ /$1 last;              # internal, re-match
```

**Tip:** Prefer `return 301 ...;` over `rewrite ... permanent;` for simple redirects — it's faster and avoids regex. Reach for `rewrite` only when you need URI transformation with captures.

### Q17: What are named locations and when do you use them?

**A:** A named location starts with `@` and can only be reached via `try_files`, `error_page`, etc. — not directly by a URL.

```nginx
location / {
    try_files $uri @backend;   # if no static file, go to the named location
}
location @backend {
    proxy_pass http://127.0.0.1:3000;
}
```

**Tip:** This is the idiomatic "serve static if it exists, otherwise proxy to Node" pattern — common for hybrid static+API setups.

### Q18: Why does your Node/NestJS app need `app.set('trust proxy', ...)` behind Nginx?

**A:** When Nginx terminates TLS and proxies, Express/NestJS sees the connection coming from Nginx (`127.0.0.1`, scheme `http`). Setting trust proxy makes the framework read `X-Forwarded-For` / `X-Forwarded-Proto` so `req.ip`, `req.protocol`, and `req.secure` reflect the **real client**:

```ts
// NestJS (Express adapter)
const app = await NestFactory.create(AppModule);
app.set("trust proxy", 1); // trust the first proxy hop (Nginx)
```

Without it: rate limiters key on the wrong IP, secure-cookie logic breaks, and audit logs record `127.0.0.1`.

**Tip:** Don't set `trust proxy` to a blanket `true` if you're exposed directly — clients could spoof `X-Forwarded-For`. Trust the specific hop count or Nginx's IP. (See `11-auth-security.md`.)

### Q19: Explain `proxy_set_header X-Forwarded-For` vs `X-Real-IP`.

**A:**

- `X-Real-IP $remote_addr` — the single immediate client IP.
- `X-Forwarded-For $proxy_add_x_forwarded_for` — Nginx **appends** `$remote_addr` to any existing `X-Forwarded-For`, building a comma-separated chain (`client, proxy1, proxy2`).

```nginx
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
```

**Tip:** Behind a CDN/multiple proxies, the _real_ client is usually the left-most untrusted entry in `X-Forwarded-For` — your app must parse it carefully (security relevant for fintech rate limiting).

### Q20: What is proxy buffering and when would you disable it?

**A:** With buffering on (default), Nginx reads the **entire** upstream response into buffers/temp files before sending to the client, freeing the upstream connection quickly. Disable it for streaming / SSE / real-time responses where you want bytes flushed immediately:

```nginx
location /api/stream {
    proxy_pass http://127.0.0.1:3000;
    proxy_buffering off;       # flush immediately (SSE, long-poll)
}
```

**Tip:** Keep buffering **on** for normal APIs — it protects slow clients from holding your Node workers hostage (slowloris-style). Turn it off only for streaming endpoints.

### Q21: What are the key proxy timeouts and what do they cause?

**A:**

```nginx
proxy_connect_timeout 5s;    # time to establish TCP to upstream  -> 502 on failure
proxy_send_timeout    60s;   # time to send request to upstream
proxy_read_timeout    60s;   # time to wait for a response chunk  -> 504 on timeout
```

If your upstream is healthy but slow (a long report query), a low `proxy_read_timeout` produces a **504 Gateway Timeout**.

**Tip:** Don't just crank these to 600s — fix the slow endpoint or move it to a background job (→ `14-redis-jobs-caching.md`). For known long-lived endpoints, raise selectively per-location.

### Q22: How do you define and use an `upstream` block?

**A:**

```nginx
upstream nest_api {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
server {
    location /api/ {
        proxy_pass http://nest_api;   # references the pool by name
    }
}
```

By default it's **round-robin**. This is how you scale Node — multiple PM2 cluster workers or multiple containers behind one pool.

**Tip:** Node is single-threaded per process, so you scale horizontally; the `upstream` block is exactly where that scaling is wired up.

### Q23: What load-balancing algorithms does Nginx offer?

**A:**

- **round-robin** (default) — even rotation.
- `least_conn;` — send to the server with the fewest active connections (good for uneven request durations).
- `ip_hash;` — sticky by client IP hash (basic session affinity).
- `hash $key consistent;` — hash on an arbitrary variable (e.g. a cookie or URL).
- **weights** — `server a weight=3;` sends 3x traffic to that node.

```nginx
upstream nest_api {
    least_conn;
    server 10.0.0.1:3000 weight=2;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000 backup;   # only used if others are down
}
```

**Tip:** Active health checks (probing) are an **NGINX Plus** feature; open-source Nginx only does _passive_ health checks (below).

### Q24: How do passive health checks work (`max_fails` / `fail_timeout`)?

**A:** Nginx marks a server **unavailable** after `max_fails` failed attempts within `fail_timeout`, then stops sending traffic for `fail_timeout` before retrying.

```nginx
upstream nest_api {
    server 10.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:3000 max_fails=3 fail_timeout=30s;
}
```

**Tip:** This is _reactive_, not proactive — it only learns a server is down by failing a real request. For true active probing you need NGINX Plus or a sidecar (or rely on Docker/k8s healthchecks to remove the container).

### Q25: Why do sticky sessions matter, and how do they relate to WebSockets?

**A:** If your app keeps per-connection or per-user state on a specific instance (in-memory sessions, a WebSocket connection, Socket.IO sticky requirement), round-robin can route follow-up requests to a different instance that doesn't know the user. `ip_hash` (or a Plus sticky cookie) pins a client to one backend.

**Better fix:** make the app **stateless** — store sessions in Redis and use the Socket.IO Redis adapter so any instance can serve any client (→ `14-redis-jobs-caching.md`). Then you don't _need_ stickiness.

**Tip:** Mention both: stickiness as the quick fix, shared state (Redis) as the scalable fix. Interviewers want to hear "make it stateless."

### Q26: How do you proxy WebSockets / Socket.IO?

**A:** WebSockets need HTTP/1.1 and the upgrade headers passed through:

```nginx
location /socket.io/ {
    proxy_pass http://nest_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host       $host;
    proxy_read_timeout 3600s;     # keep long-lived connections alive
}
```

The default `Connection: close` and HTTP/1.0 would break the upgrade handshake.

**Tip:** Use a `map` so `Connection` is `upgrade` only for actual WS requests (shown in the production config). And remember Socket.IO with multiple instances needs sticky routing **or** the Redis adapter (Trust-Node real-time → `14-redis-jobs-caching.md`).

### Q27: How do you enable TLS with modern settings?

**A:**

```nginx
server {
    listen 443 ssl;
    http2 on;                       # HTTP/2 (separate directive in 1.25+)
    ssl_certificate     /etc/letsencrypt/live/app.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;  # let modern clients pick (TLS 1.3)
}
```

**Tip:** Disable TLS 1.0/1.1 (PCI-DSS requires it for fintech). Use Mozilla's SSL Config Generator for a vetted cipher list rather than hand-rolling.

### Q28: How does Let's Encrypt / certbot fit in?

**A:** Certbot obtains and auto-renews free certs. With the Nginx plugin it can even edit your config:

```bash
certbot --nginx -d app.example.com -d www.app.example.com
certbot renew --dry-run     # test auto-renewal
```

The HTTP-01 challenge needs port 80 reachable (`/.well-known/acme-challenge/`), so keep your port-80 server block serving that path even while redirecting everything else to HTTPS.

**Tip:** Renewal runs via cron/systemd timer; certs last 90 days. A reload (not restart) is enough to pick up renewed certs.

### Q29: What is OCSP stapling and why use it?

**A:** Instead of the client contacting the CA to check cert revocation (slow, leaks browsing info), Nginx fetches the OCSP response itself and **staples** it to the handshake.

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/app.example.com/chain.pem;
resolver 1.1.1.1 8.8.8.8 valid=300s;
```

**Tip:** Improves handshake latency and privacy. Needs a `resolver` so Nginx can reach the OCSP responder.

### Q30: How do you set up basic proxy caching?

**A:** Define a cache zone in `http`, then enable per-location:

```nginx
# http context
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m
                 max_size=1g inactive=60m;

# location
location /api/products {
    proxy_pass http://nest_api;
    proxy_cache api_cache;
    proxy_cache_valid 200 302 10m;   # cache successful responses 10 min
    proxy_cache_valid 404 1m;
    add_header X-Cache-Status $upstream_cache_status;   # HIT/MISS/EXPIRED
}
```

**Tip:** `levels=1:2` is the directory-sharding scheme; `keys_zone=NAME:10m` is shared memory for keys (~80k keys per MB). Expose `$upstream_cache_status` while debugging.

### Q31: What is the default cache key and how do you customize it?

**A:** Default key is `$scheme$proxy_host$request_uri`. Override with `proxy_cache_key` — e.g. to vary by a header or to ignore query order:

```nginx
proxy_cache_key "$scheme$host$request_uri";
```

**Tip:** Be careful caching authenticated responses — keying on a user-specific cookie or simply **not caching** `Authorization`-bearing requests avoids serving one user's data to another (a serious fintech bug).

### Q32: How do you limit upload sizes and why?

**A:**

```nginx
client_max_body_size 10m;     # 413 Payload Too Large above this
```

Without it the default (1m) silently rejects larger uploads with 413. Set it where uploads happen (document KYC uploads, CSV imports).

**Tip:** Match this to your app's own body-size limit. Too large invites memory-exhaustion DoS; too small breaks legitimate uploads.

### Q33: What's the difference between Nginx proxy caching and a CDN?

**A:** Nginx caching is **at your origin** — one (or a few) servers; a CDN caches at **hundreds of edge PoPs** geographically close to users, also absorbing DDoS and offloading bandwidth. Nginx cache reduces load on your _app_; a CDN reduces _latency and origin traffic_ globally.

**Tip:** They compose: CDN at the edge → Nginx (cache + LB) at the origin → Node. Don't pitch one as replacing the other.

---

## Advanced

### Q34: How do `limit_req_zone` and `limit_req` implement rate limiting (and what are `burst`/`nodelay`)?

**A:** Nginx uses a **leaky-bucket** algorithm. You define a shared zone keyed on something (usually client IP), set a rate, then apply it:

```nginx
# http context
limit_req_zone $binary_remote_addr zone=api_rl:10m rate=10r/s;

# location
location /api/ {
    limit_req zone=api_rl burst=20 nodelay;
    limit_req_status 429;
    proxy_pass http://nest_api;
}
```

- `rate=10r/s` — steady-state 10 requests/second per IP.
- `burst=20` — allow a queue of up to 20 excess requests.
- `nodelay` — serve the burst **immediately** instead of spacing them out; without it bursts are throttled to the rate.
- Over the limit → `503` by default; `limit_req_status 429` makes it the correct "Too Many Requests".

**Tip:** `$binary_remote_addr` (not `$remote_addr`) keeps the zone compact. For fintech, rate-limit **login and payment endpoints** harder than read endpoints.

### Q35: How does `limit_conn` differ from `limit_req`?

**A:** `limit_req` caps **request rate** (requests/sec); `limit_conn` caps **concurrent connections** per key — useful against slowloris and connection-hogging clients.

```nginx
limit_conn_zone $binary_remote_addr zone=conn_per_ip:10m;
server {
    limit_conn conn_per_ip 20;     # max 20 simultaneous connections per IP
}
```

**Tip:** Use both together — rate limit normal abuse, connection limit slow-drip attacks.

### Q36: Why is edge rate limiting especially important for a fintech app?

**A:** Money endpoints (transfers, withdrawals, OTP/login) are prime targets for credential stuffing, enumeration, and abuse. Rate limiting **at the edge** (Nginx) rejects floods _before_ they reach Node/Mongo, protecting backend capacity and reducing the attack surface. App-layer limits (e.g. NestJS throttler) still matter for per-user logic, but the edge is your cheap first line of defense and DDoS absorber.

**Tip:** Defense in depth: Nginx `limit_req` (IP-level, cheap) + app throttler (user/account-level) + WAF/CDN. Mention all three. (Cross-ref `24-security-deep-dive.md`, `11-auth-security.md`.)

### Q37: What security headers should Nginx add, and how?

**A:**

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options    "nosniff" always;
add_header X-Frame-Options           "DENY" always;
add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy    "default-src 'self'; frame-ancestors 'none'" always;
server_tokens off;   # hide nginx version in Server header and error pages
```

**Tip:** Two gotchas:

1. `add_header` does **not** inherit into a child block that has _its own_ `add_header` — you must re-declare
2. use `always` so headers are sent on error responses too

CSP details live in `24-security-deep-dive.md`.

### Q38: How do you do IP allow/deny and block bad bots?

**A:**

```nginx
# restrict an admin path to office IPs
location /admin/ {
    allow 203.0.113.0/24;
    deny  all;
}
# drop known-bad user agents without a response
if ($http_user_agent ~* (sqlmap|nikto|nmap|masscan)) {
    return 444;
}
```

`return 444` closes the connection with no response — cheapest way to drop garbage traffic.

**Tip:** `if` in Nginx is notoriously tricky ("if is evil"); keep it to simple `return`/`set` cases. Prefer `map` or `geo` for complex logic.

### Q39: How do you serve a stale cache when the upstream is down (resilience)?

**A:**

```nginx
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    proxy_cache_lock on;          # collapse concurrent misses into one upstream call
    proxy_pass http://nest_api;
}
```

`proxy_cache_use_stale` serves the last good cached copy if the upstream errors/times out — graceful degradation. `proxy_cache_lock` prevents a **cache stampede** (thundering herd) on expiry.

**Tip:** This pattern keeps a read API up during a backend deploy or hiccup. Combined with **micro-caching** (`proxy_cache_valid 200 1s;`) it can absorb huge read spikes with near-real-time data.

### Q40: What is micro-caching and when is it useful?

**A:** Caching responses for a _very_ short time (1–10 seconds). Even a 1-second cache means a stampede of identical requests collapses into ~1 upstream hit per second per endpoint, massively cutting backend load with negligible staleness.

```nginx
proxy_cache_valid 200 1s;
proxy_cache_lock on;
```

**Tip:** Great for hot, read-heavy, non-personalized endpoints (public price feeds, dashboards). Skip it for personalized/authenticated data.

### Q41: How do you protect file downloads with `X-Accel-Redirect`?

**A:** Let your app do auth, then hand off the actual file delivery to Nginx (fast, no Node memory). The app returns an empty body with a header pointing to an **internal** location:

```nginx
location /protected-files/ {
    internal;                          # not reachable directly by clients
    alias /var/secure-storage/;
}
```

```ts
// NestJS controller after authorizing the user:
res.setHeader("X-Accel-Redirect", `/protected-files/${doc.path}`);
res.end();
```

Nginx intercepts the header and streams the file. The client can't access `/protected-files/` directly because of `internal`.

**Tip:** This is the production way to serve large/private downloads (statements, KYC docs) — auth in app, throughput in Nginx, no buffering through Node.

### Q42: What is the `map` directive and a good use case?

**A:** `map` builds a variable from another variable — clean, fast conditional logic without `if`:

```nginx
# in http context
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;        # normal request -> Connection: close
}
# in location
proxy_set_header Connection $connection_upgrade;
```

This is the idiomatic way to set the WebSocket `Connection` header correctly only for upgrade requests.

**Tip:** `map` is evaluated lazily and is far safer/faster than chained `if`. Also used for feature flags, A/B routing, and choosing cache behavior by content type.

### Q43: How would you use Nginx as an API gateway for multiple services?

**A:** Route path prefixes to different upstreams:

```nginx
upstream auth_svc    { server auth:3001; }
upstream payment_svc { server payments:3002; }
upstream user_svc    { server users:3003; }

location /api/auth/     { proxy_pass http://auth_svc/; }
location /api/payments/ { proxy_pass http://payment_svc/; }
location /api/users/    { proxy_pass http://user_svc/; }
```

Nginx centralizes TLS, rate limiting, logging, and auth-header injection for all services.

**Tip:** Note the trailing slash on `proxy_pass http://auth_svc/;` — with a trailing slash Nginx **strips** the matched location prefix; without it, the full URI is passed. This trips people up constantly. For richer gateway features (JWT validation, complex routing) people reach for Kong/APISIX (built on Nginx) — see `30-*`.

### Q44: Explain the `proxy_pass` URI trailing-slash rule precisely.

**A:**

```nginx
location /api/ { proxy_pass http://backend/;  }  # /api/users -> /users     (prefix stripped)
location /api/ { proxy_pass http://backend;   }  # /api/users -> /api/users  (prefix kept)
```

If `proxy_pass` has a URI part (even just `/`), Nginx replaces the matched location prefix with it. If it has _no_ URI (just host/upstream), the original URI is passed unchanged.

**Tip:** Decide based on whether your NestJS routes include the `/api` prefix. Mismatch here causes 404s that look like "Nginx is broken" but are really a path-rewrite mistake.

### Q45: How do you enable HTTP/2, and what about HTTP/3?

**A:**

```nginx
listen 443 ssl;
http2 on;            # NGINX 1.25.1+ (older: listen 443 ssl http2;)

# HTTP/3 / QUIC (needs a QUIC-enabled build)
listen 443 quic reuseport;
add_header Alt-Svc 'h3=":443"; ma=86400';
```

HTTP/2 multiplexes many requests over one TCP connection (no head-of-line blocking at the HTTP layer). HTTP/3 runs over QUIC/UDP, eliminating TCP head-of-line blocking and speeding up handshakes on lossy networks.

**Tip:** HTTP/2 effectively requires TLS in browsers. With HTTP/2, old workarounds like domain sharding and asset concatenation become anti-patterns.

### Q46: What performance directives matter for static serving (`sendfile`, `tcp_nopush`, `tcp_nodelay`)?

**A:**

```nginx
sendfile on;        # zero-copy: kernel sends file straight to socket (skips user space)
tcp_nopush on;      # with sendfile, send headers+file start in full packets
tcp_nodelay on;     # disable Nagle for keepalive connections (low latency)
keepalive_timeout 65;
```

`sendfile` avoids copying file data through userspace; `tcp_nopush` batches packets for throughput; `tcp_nodelay` cuts latency on persistent connections. Nginx applies them sensibly together.

**Tip:** These are mostly "set and forget" defaults in good configs, but knowing _why_ (zero-copy, Nagle) signals depth.

### Q47: How do upstream keepalive connections improve performance?

**A:** Without keepalive, Nginx opens a new TCP connection to Node for every request. Keepalive reuses connections:

```nginx
upstream nest_api {
    server 127.0.0.1:3000;
    keepalive 32;                 # pool of idle upstream connections
}
location /api/ {
    proxy_pass http://nest_api;
    proxy_http_version 1.1;       # required for keepalive
    proxy_set_header Connection "";   # clear the close header
}
```

**Tip:** The `proxy_http_version 1.1` + `proxy_set_header Connection "";` pair is mandatory for upstream keepalive — forgetting it silently disables the pool.

### Q48: What are the common causes of 502 vs 504, and how do you debug them?

**A:**

- **502 Bad Gateway** — Nginx reached out but the upstream is **down / refused / crashed / wrong port**. Error log: `connect() failed (111: Connection refused)` or `upstream prematurely closed connection`.
- **504 Gateway Timeout** — upstream is up but **too slow**; exceeded `proxy_read_timeout`.

Debug checklist:

1. `nginx -t` — config valid?
2. Is the app actually listening? `curl 127.0.0.1:3000/health` from the Nginx host/container.
3. Check `error.log` for the exact reason.
4. Verify `proxy_pass` target host/port (Docker: service name vs `localhost`).
5. For 504, profile the slow endpoint; raise timeout only as a stopgap.

**Tip:** In Docker, the #1 cause of 502 is `proxy_pass http://localhost:3000` — inside the Nginx container `localhost` is Nginx itself. Use the **Compose service name**: `proxy_pass http://api:3000`.

### Q49: How do you run Nginx as the reverse proxy in front of app containers in Docker Compose?

**A:**

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro # mount config read-only
      - ./certs:/etc/letsencrypt:ro
    depends_on: [api, web]
  api:
    build: ./api # NestJS, listens on 3000
  web:
    build: ./web # Next.js
```

Nginx is the only container with published ports; app containers are reachable by **service name** on the internal Docker network (`proxy_pass http://api:3000`).

**Tip:** Mount config `:ro`. After editing config: `docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload` for a zero-downtime reload (no container restart).

### Q50: How do you emit JSON access logs for log aggregation?

**A:**

```nginx
log_format json_combined escape=json '{'
  '"time":"$time_iso8601",'
  '"remote_addr":"$remote_addr",'
  '"request":"$request",'
  '"status":$status,'
  '"body_bytes":$body_bytes_sent,'
  '"request_time":$request_time,'
  '"upstream_time":"$upstream_response_time",'
  '"upstream_status":"$upstream_status",'
  '"referer":"$http_referer",'
  '"user_agent":"$http_user_agent",'
  '"xff":"$http_x_forwarded_for"'
'}';
access_log /var/log/nginx/access.log json_combined;
```

**Tip:** `escape=json` prevents malformed JSON from quotes in user agents. `$request_time` (total) vs `$upstream_response_time` (backend only) lets you tell whether _Nginx_ or _Node_ is slow — invaluable for monitoring (→ `32-monitoring`).

### Q51: How do you protect a route with HTTP basic auth?

**A:**

```bash
htpasswd -c /etc/nginx/.htpasswd admin    # create user
```

```nginx
location /metrics {
    auth_basic           "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

**Tip:** Fine for internal/ops endpoints (Prometheus metrics, staging) behind TLS. Never the primary auth for a real user-facing fintech app — basic auth has no logout, no MFA, and sends credentials every request.

### Q52: How do you mitigate slowloris and other slow-client attacks at the edge?

**A:** Cap how long clients can dribble data and how many connections they can hold:

```nginx
client_body_timeout   10s;
client_header_timeout 10s;
send_timeout          10s;
limit_conn conn_per_ip 20;
keepalive_requests    100;
```

Nginx's event-driven model is inherently more resistant than thread-per-connection servers, but these tighten it further. Buffering (on by default) also helps absorb slow upstream/clients.

**Tip:** Pair edge limits with a CDN/WAF for volumetric DDoS — Nginx alone can't absorb a large L3/L4 flood.

### Q53: How would you serve an app under a subpath (e.g. `/dashboard`)?

**A:**

```nginx
location /dashboard/ {
    proxy_pass http://nest_api/;   # strips /dashboard/
    proxy_set_header X-Forwarded-Prefix /dashboard;
}
```

The app must generate URLs/asset paths aware of the prefix (Next.js `basePath`, Express `app.use('/dashboard', ...)`), and you forward `X-Forwarded-Prefix` so it can build correct links.

**Tip:** Subpath hosting is fiddly because of absolute asset URLs — configuring `basePath` in the framework is usually less painful than rewriting HTML in Nginx.

### Q54: What is `gzip_static` and how does it differ from on-the-fly gzip?

**A:** `gzip_static on;` serves pre-compressed `.gz` files (built at deploy time) instead of compressing on every request — saving CPU and giving the best compression level for free.

```nginx
location ~* \.(js|css)$ {
    gzip_static on;     # serves app.js.gz if it exists
}
```

**Tip:** Generate `.gz` (and `.br` for brotli) during the frontend build. Combine with `brotli_static on;` if your Nginx has the brotli module.

### Q55: Briefly, how do `geo` and GeoIP help?

**A:** `geo` maps client IP ranges to a variable (e.g. internal vs external); the GeoIP2 module maps IP → country/region for routing, blocking, or compliance.

```nginx
geo $is_internal {
    default 0;
    10.0.0.0/8 1;
    192.168.0.0/16 1;
}
```

**Tip:** Fintech relevance: geo-blocking sanctioned regions or restricting admin access to corporate IP ranges at the edge — but treat it as a coarse first filter, not real authorization.

---

## Annotated Production Config

A complete, commented config for a NestJS API + Next.js frontend on one domain, with TLS, gzip, caching, rate limiting, security headers, upstream load balancing, and WebSocket support.

```nginx
# ===================== main context =====================
user  nginx;
worker_processes auto;                  # one worker per CPU core
worker_rlimit_nofile 65535;             # raise FD limit for many connections

events {
    worker_connections 4096;            # max connections per worker
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    server_tokens off;                  # hide nginx version (security)

    # ---- performance ----
    sendfile        on;                 # zero-copy static file serving
    tcp_nopush      on;                 # batch packets with sendfile
    tcp_nodelay     on;                 # low latency on keepalive
    keepalive_timeout 65;
    types_hash_max_size 4096;

    # ---- gzip ----
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml image/svg+xml application/font-woff2;

    # ---- JSON access logs (parseable for monitoring -> 32) ----
    log_format json_combined escape=json '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"xff":"$http_x_forwarded_for",'
        '"request":"$request",'
        '"status":$status,'
        '"request_time":$request_time,'
        '"upstream_time":"$upstream_response_time",'
        '"user_agent":"$http_user_agent"'
    '}';
    access_log /var/log/nginx/access.log json_combined;
    error_log  /var/log/nginx/error.log warn;

    # ---- rate limit zones (leaky bucket, keyed by client IP) ----
    limit_req_zone  $binary_remote_addr zone=api_rl:10m  rate=10r/s;
    limit_req_zone  $binary_remote_addr zone=auth_rl:10m rate=5r/m;   # strict on login
    limit_conn_zone $binary_remote_addr zone=conn_per_ip:10m;

    # ---- proxy cache for read-heavy API responses ----
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m
                     max_size=1g inactive=60m use_temp_path=off;

    # ---- map: set Connection header only for WebSocket upgrades ----
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    # ---- upstream: load-balanced NestJS instances ----
    upstream nest_api {
        least_conn;                                  # favour least-busy node
        server api1:3000 max_fails=3 fail_timeout=30s;
        server api2:3000 max_fails=3 fail_timeout=30s;
        server api3:3000 backup;                     # only if others are down
        keepalive 32;                                # reuse upstream connections
    }

    # ============== HTTP -> HTTPS redirect ==============
    server {
        listen 80;
        server_name app.example.com;

        # keep ACME challenge reachable for certbot renewals
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # ==================== HTTPS server ====================
    server {
        listen 443 ssl;
        http2 on;
        server_name app.example.com;

        # ---- TLS ----
        ssl_certificate     /etc/letsencrypt/live/app.example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers off;
        ssl_session_cache   shared:SSL:10m;          # reuse handshakes
        ssl_session_timeout 1d;
        ssl_session_tickets off;
        # OCSP stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/letsencrypt/live/app.example.com/chain.pem;
        resolver 1.1.1.1 8.8.8.8 valid=300s;

        # ---- security headers (sent on all responses incl. errors) ----
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Content-Type-Options    "nosniff" always;
        add_header X-Frame-Options           "DENY" always;
        add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy    "default-src 'self'; frame-ancestors 'none'" always;

        # ---- request limits ----
        client_max_body_size 10m;        # allow document/KYC uploads
        client_body_timeout  10s;        # slowloris mitigation
        client_header_timeout 10s;
        limit_conn conn_per_ip 20;       # cap concurrent connections per IP

        # ---- shared proxy headers (define once) ----
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout    60s;
        proxy_send_timeout    60s;

        # ---- WebSockets / Socket.IO (Trust-Node real-time, see 14) ----
        location /socket.io/ {
            proxy_pass http://nest_api;
            proxy_set_header Upgrade    $http_upgrade;
            proxy_set_header Connection $connection_upgrade;   # from the map
            proxy_read_timeout 3600s;                          # long-lived
        }

        # ---- strict rate limit on auth endpoints (fintech) ----
        location /api/auth/ {
            limit_req zone=auth_rl burst=5 nodelay;
            limit_req_status 429;
            proxy_pass http://nest_api;
            proxy_set_header Connection "";   # enable upstream keepalive
        }

        # ---- general API: rate limit + reverse proxy ----
        location /api/ {
            limit_req zone=api_rl burst=20 nodelay;
            limit_req_status 429;
            proxy_pass http://nest_api;
            proxy_set_header Connection "";
        }

        # ---- cached, read-heavy public endpoint (micro-cache + stale) ----
        location /api/public/ {
            proxy_pass http://nest_api;
            proxy_set_header Connection "";
            proxy_cache api_cache;
            proxy_cache_valid 200 5s;                      # micro-cache
            proxy_cache_lock on;                           # collapse stampede
            proxy_cache_use_stale error timeout updating http_502 http_503 http_504;
            proxy_cache_background_update on;
            add_header X-Cache-Status $upstream_cache_status always;
        }

        # ---- static frontend (built Next.js export) with SPA fallback ----
        location / {
            root /var/www/app;
            try_files $uri $uri/ /index.html;     # client-side routing fallback

            # cache hashed assets hard, never cache the HTML shell
            location ~* \.(js|css|png|jpg|svg|woff2)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                gzip_static on;
            }
        }

        # ---- protected downloads via X-Accel-Redirect (app authorizes) ----
        location /protected-files/ {
            internal;
            alias /var/secure-storage/;
        }
    }
}
```

---

## Common Mistakes / Red Flags

- **Reloading without testing** — always `nginx -t && nginx -s reload`. Reloading a broken config can take the site down.
- **Missing proxy headers** — forgetting `X-Forwarded-For`/`-Proto` so Node logs `127.0.0.1` and thinks everything is HTTP. Pair with `app.set('trust proxy')`.
- **`proxy_pass` trailing-slash confusion** — silent 404s from prefix being stripped (or not) unexpectedly.
- **Using `localhost` in Docker** — `proxy_pass http://localhost:3000` points at the Nginx container itself → 502. Use the Compose service name.
- **`add_header` not inheriting** — a child `location`/`server` with its own `add_header` drops all parent headers; re-declare them (or use a shared `include`).
- **Caching authenticated responses** — leaking one user's data to another. Don't cache `Authorization`-bearing requests; be deliberate with the cache key.
- **`if` abuse** — "if is evil" inside `location`; prefer `map`, `try_files`, `return`, and `geo`.
- **No `client_max_body_size`** — silent 413 on uploads above the 1 MB default.
- **TLS 1.0/1.1 still enabled** — fails PCI-DSS for fintech; restrict to TLS 1.2/1.3.
- **WebSocket upgrade missing** — no `proxy_http_version 1.1` / `Upgrade`/`Connection` headers → Socket.IO falls back to polling or fails.
- **Rate limiting only at the app** — no edge `limit_req`, so floods still hammer Node/Mongo. Defense in depth: edge + app + CDN/WAF.
- **`server_tokens on`** — leaking the exact Nginx version helps attackers fingerprint CVEs.
- **Cranking timeouts instead of fixing slowness** — a 600s `proxy_read_timeout` masks a slow query that belongs in a background job.
- **No cache stampede protection** — missing `proxy_cache_lock`/`use_stale` so a popular key expiring sends a thundering herd to the upstream.

## Further Reading

- Nginx official docs — https://nginx.org/en/docs/
- Nginx Admin Guide (reverse proxy, load balancing, caching) — https://docs.nginx.com/nginx/admin-guide/
- Mozilla SSL Configuration Generator (vetted TLS configs) — https://ssl-config.mozilla.org/
- DigitalOcean Nginx tutorials (location matching, optimization) — https://www.digitalocean.com/community/tutorials/understanding-nginx-server-and-location-block-selection-algorithms
