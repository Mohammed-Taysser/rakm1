# Authentication, Authorization & Security (54 questions)

> Auth and security are where most real-world breaches happen, and interviewers probe them hard because a wrong answer here can sink a whole product. I've shipped JWT access+refresh token auth across most of my projects, Passport.js strategies (Shuhna, Foody), Azure AD/MSAL OAuth in Admin Coffee, RBAC for Nova ERP and the multi-tenant Dynamic SaaS / Pharmacy FEFO platforms, and password hashing with bcrypt and argon2. My Nova ERP `HTTPService` has a 401 → refresh → retry interceptor that transparently refreshes expired access tokens. This file covers authentication vs authorization, sessions vs tokens, JWT internals, OAuth 2.0 / OIDC, hashing, RBAC/ABAC, multi-tenancy, and the OWASP Top 10 with real code I've actually written.

## Quick Revision Checklist

- **Authentication = who you are; Authorization = what you're allowed to do.** AuthN first, AuthZ second.
- **JWT = `header.payload.signature`**, base64url-encoded, signature verifies integrity — payload is _readable_, not encrypted.
- **Never put secrets/passwords/PII in a JWT payload.** Anyone can decode it.
- **Access token short-lived (5–15 min), refresh token long-lived (days/weeks).** Refresh token gets a new access token without re-login.
- **The 401 → refresh → retry interceptor**: catch 401, call refresh endpoint, retry the original request once (my Nova ERP HTTPService).
- **Token storage trade-off**: `localStorage` is vulnerable to XSS; `httpOnly` cookies are immune to JS but need CSRF protection (`SameSite`).
- **Refresh token rotation + reuse detection**: each refresh issues a new refresh token; a reused (old) one means theft → revoke the whole family.
- **JWTs are stateless → hard to revoke.** Use short expiry + a blacklist/denylist for true logout/revocation.
- **bcrypt/argon2/scrypt** for passwords — slow, salted, adaptive work factor. Never MD5/SHA-256 (too fast).
- **OAuth 2.0 = delegated authorization; OpenID Connect = authentication layer on top (adds `id_token`).**
- **Authorization Code + PKCE** is the correct grant for SPAs and mobile. Implicit flow is dead.
- **RBAC = roles → permissions; ABAC = policies over attributes.** My `restrictTo`/`RolesGuard` is RBAC.
- **Multi-tenancy**: scope every token and every query to a `tenantId`; never trust a client-supplied tenant id alone.
- **XSS prevention**: output encoding, CSP, sanitize HTML, never `dangerouslySetInnerHTML` with raw input.
- **CSRF prevention**: `SameSite` cookies + anti-CSRF tokens for state-changing requests.
- **Injection (SQL/NoSQL)**: parameterized queries, never string-concat user input, sanitize Mongo operators.
- **CORS protects the browser, not your server** — it's not authorization. Don't `origin: '*'` with credentials.
- **helmet** sets security headers (CSP, HSTS, X-Frame-Options); **always validate input server-side**; **never commit secrets**.
- **IDOR/BOLA**: authorize on _every_ resource by ownership, not just authenticate. Most common API bug.
- **Mass assignment**: whitelist allowed fields (Zod/DTO), never blind-spread `req.body` into a model.
- **Principle of least privilege**: grant the minimum access needed, everywhere.

## Basic

### Q1: What is the difference between authentication and authorization?

**A:** **Authentication (AuthN)** verifies _who_ a user is — validating credentials like a password, token, or OAuth login. **Authorization (AuthZ)** determines _what_ an authenticated user is allowed to do — which routes, resources, or actions they can access (via roles/permissions). Authentication always happens first; authorization is enforced on each protected resource afterward.

**Tip:** One-liner: "AuthN = identity, AuthZ = permissions." A logged-in (authenticated) user can still be denied (not authorized) from an admin page.

### Q2: What is session-based authentication and how does it work?

**A:** The server creates a **session** after login, stores session state server-side (in memory, Redis, or a DB), and sends the client a **session ID** in a cookie. On every subsequent request the browser automatically sends the cookie; the server looks up the session by ID to identify the user. State lives on the server — the cookie is just an opaque pointer.

**Tip:** Flow: login → server creates session + stores it → `Set-Cookie: sessionId=...` → browser resends cookie → server validates against the session store.

### Q3: Why use a session store like Redis instead of in-memory sessions?

**A:** In-memory sessions die when the process restarts and don't work across multiple server instances (a request hitting a different instance won't find the session). A shared store like **Redis** centralizes sessions so any instance can validate them, survives restarts, supports TTL/expiry natively, and scales horizontally behind a load balancer.

**Tip:** "In-memory sessions break horizontal scaling — that's why production uses Redis or a DB-backed store (`connect-redis`)."

### Q4: What is token-based authentication?

**A:** Instead of server-side sessions, the server issues a signed **token** (e.g. a JWT) at login. The client stores it and sends it on each request (typically `Authorization: Bearer <token>`). The server verifies the token's signature to authenticate the request — no server-side lookup needed for stateless tokens.

**Tip:** Token-based auth is popular for APIs, SPAs, and mobile because it's stateless and works cleanly across domains/services.

### Q5: What is a JWT and what is its structure?

**A:** A **JSON Web Token** is a compact, URL-safe, signed token with three base64url-encoded parts separated by dots: `header.payload.signature`.

- **Header**: token type and signing algorithm, e.g. `{"alg":"HS256","typ":"JWT"}`.
- **Payload**: the **claims** (data), e.g. `sub`, `iat`, `exp`, `role`.
- **Signature**: `HMACSHA256(base64(header) + "." + base64(payload), secret)` — proves the token wasn't tampered with.

**Tip:** Critical: the payload is **encoded, not encrypted** — anyone can base64-decode and read it. Never put sensitive data in it.

### Q6: What are JWT claims, and what do `iat` and `exp` mean?

**A:** Claims are the key-value statements in the payload. **Registered claims** are standard: `iss` (issuer), `sub` (subject/user id), `aud` (audience), `exp` (expiration time, Unix timestamp), `iat` (issued-at time), `nbf` (not-before). You also add **custom claims** like `role` or `tenantId`. `exp` lets verifiers reject expired tokens; `iat` records when it was issued.

**Tip:** Always set `exp`. A JWT without expiry that leaks is valid forever.

### Q7: Why hash passwords instead of storing them in plain text?

**A:** If the database is breached, plaintext passwords expose every user immediately (and users reuse passwords across sites). **Hashing** is a one-way function — you store the hash, and on login you hash the input and compare. The original password is never recoverable from the stored value, even by you.

**Tip:** Pair "one-way hash" with "salt" and "slow algorithm" — that's the full correct answer.

### Q8: Why use bcrypt/argon2 instead of MD5 or SHA-256 for passwords?

**A:** MD5 and SHA-256 are **fast** — designed for speed — so attackers can brute-force billions of guesses per second on a GPU. **bcrypt, scrypt, and argon2** are deliberately **slow and adaptive**: they have a configurable **work factor/cost** so you can make each hash take, say, 100ms, crippling brute force. They also handle salting built-in. argon2 additionally resists GPU/ASIC attacks via memory-hardness.

**Tip:** "Fast hashes are the wrong tool for passwords — you want a slow, salted, memory-hard KDF like argon2id or bcrypt."

### Q9: What is a salt and why does it matter?

**A:** A **salt** is random data added to a password before hashing, so identical passwords produce different hashes. This defeats **rainbow tables** (precomputed hash lookups) and prevents an attacker from spotting that two users share a password. bcrypt/argon2 generate and embed the salt in the output hash automatically.

**Tip:** Salt = per-password uniqueness. (A _pepper_ is a separate secret applied to all hashes, stored outside the DB — bonus point.)

### Q10: How do you hash and verify a password with bcrypt?

**A:**

```js
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; // work factor (cost). 10–12 is typical.

// On signup
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS); // salt generated + embedded automatically
}

// On login
async function verifyPassword(plain, storedHash) {
  return bcrypt.compare(plain, storedHash); // constant-time comparison
}
```

**Tip:** Use `bcrypt.compare`, never `===` — it's a constant-time compare that resists timing attacks. The cost is baked into the hash string, so you can raise it for new users over time.

### Q11: What goes in `Authorization: Bearer`?

**A:** The HTTP header carries the access token: `Authorization: Bearer <jwt>`. The server reads it, strips `Bearer `, verifies the signature and `exp`, and attaches the decoded user to the request. "Bearer" means _whoever holds the token can use it_ — which is why it must be transmitted over HTTPS only and stored carefully.

**Tip:** Bearer tokens have no inherent binding to the client — protect them like cash.

## Intermediate

### Q12: How do you sign and verify a JWT in Node?

**A:**

```js
import jwt from "jsonwebtoken";

// Sign at login
const accessToken = jwt.sign(
  { sub: user.id, role: user.role, tenantId: user.tenantId }, // claims — no secrets
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: "15m" },
);

// Verify on protected routes (middleware)
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
```

**Tip:** `jwt.verify` throws on a bad signature _or_ expired token — handle both as 401. Always specify `algorithms: ['HS256']` in verify options to prevent algorithm-confusion attacks.

### Q13: HS256 vs RS256 — what's the difference and when do you use each?

**A:** **HS256** is symmetric HMAC: one shared secret both signs and verifies. Simple, but everyone who verifies must hold the signing secret — fine for a single backend. **RS256** is asymmetric RSA: a **private key signs**, a **public key verifies**. You distribute the public key freely so independent services (or clients) can verify without being able to forge tokens. Use RS256 for microservices, third-party verifiers, or OIDC providers.

**Tip:** "HS256 = shared secret, one trust boundary. RS256 = private signs / public verifies, good for distributed systems and zero-trust verification."

### Q14: JWT vs sessions — what are the trade-offs?

**A:**

- **Sessions**: stateful, server stores them. Easy to revoke instantly (delete from store), but needs a shared store to scale and a lookup per request.
- **JWT**: stateless, self-contained, no per-request DB lookup, great for distributed/microservice APIs and cross-domain. But hard to revoke before expiry, and the token grows with claims; if it leaks it's valid until `exp`.

**Tip:** Choose sessions when you need instant revocation and have a single trust boundary; choose JWT for stateless, distributed APIs. Many real apps use **JWT access tokens + a server-side refresh-token record** to get the best of both.

### Q15: Why use both an access token and a refresh token?

**A:** It's a security/usability balance. The **access token is short-lived** (5–15 min) so if it leaks, the window of abuse is tiny — and because it's stateless, you don't check a DB on every request. The **refresh token is long-lived** (days/weeks), stored more securely, and only used to obtain new access tokens. So users stay logged in without re-entering credentials, while the high-traffic access token stays low-risk.

**Tip:** "Short-lived access limits blast radius; long-lived refresh keeps UX smooth. The refresh token is the only thing that needs revocation tracking."

### Q16: Walk me through a refresh-token endpoint.

**A:** The client sends its refresh token (ideally in an httpOnly cookie). The server verifies it, checks it against the stored/valid refresh tokens, and if good, issues a new access token (and rotates the refresh token).

```js
// POST /auth/refresh
async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    // Check it's still valid (not revoked / matches stored hash)
    const stored = await RefreshToken.findOne({ userId: payload.sub, token });
    if (!stored)
      return res.status(401).json({ message: "Refresh reuse detected" });

    // Rotate: invalidate old, issue new pair
    await stored.deleteOne();
    const accessToken = jwt.sign(
      { sub: payload.sub, role: payload.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    const newRefresh = jwt.sign(
      { sub: payload.sub, role: payload.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );
    await RefreshToken.create({ userId: payload.sub, token: newRefresh });

    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh",
    });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}
```

**Tip:** Store refresh tokens server-side (or a hash of them) so you can revoke and detect reuse — a pure stateless refresh token can't be revoked.

### Q17: Explain the 401 → refresh → retry interceptor you built.

**A:** In my Nova ERP `HTTPService` (an axios instance), a **response interceptor** catches `401` errors. On 401, it calls the `/auth/refresh` endpoint to get a fresh access token, updates the stored token/header, then **replays the original failed request once**. This makes token expiry invisible to the UI — the user never sees a logout flicker. I guard against infinite loops by marking the request as already-retried and **queueing concurrent 401s** so only one refresh call fires.

```js
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = []; // requests waiting for the refresh to finish

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // wait for the in-flight refresh, then retry
        return new Promise((resolve) =>
          queue.push(() => resolve(api(original))),
        );
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        );
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        queue.forEach((cb) => cb()); // flush queued requests
        queue = [];
        return api(original); // retry the original request
      } catch (e) {
        logout(); // refresh failed → force re-login
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
```

**Tip:** The two gotchas interviewers want:

1. `_retry` flag to avoid infinite loops
2. a **mutex/queue** so 10 parallel 401s trigger one refresh, not ten

### Q18: localStorage vs httpOnly cookies for token storage — what's the real debate?

**A:** It's an XSS-vs-CSRF trade-off:

- **localStorage**: easy, works cross-domain, but **any injected JS can read it** — so it's fully exposed to **XSS**. A single XSS bug = token theft.
- **httpOnly cookie**: JavaScript _cannot_ read it, so XSS can't exfiltrate it — but cookies are auto-sent by the browser, exposing you to **CSRF** unless you add `SameSite` and/or CSRF tokens.
  The common recommendation: store the **refresh token in an httpOnly, Secure, SameSite cookie**, and keep the **access token in memory** (a JS variable, not localStorage) so it disappears on tab close and isn't persisted.

**Tip:** "There's no free lunch: localStorage trades CSRF-safety for XSS exposure; cookies trade XSS-safety for CSRF risk. Best practice = httpOnly cookie for refresh + in-memory access token, and fix your XSS anyway."

### Q19: How do you set a secure cookie in Express?

**A:**

```js
res.cookie("refreshToken", token, {
  httpOnly: true, // not readable by JS → blocks XSS theft
  secure: true, // HTTPS only
  sameSite: "strict", // not sent on cross-site requests → blocks CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/auth/refresh", // only sent to the refresh endpoint
});
```

**Tip:** `httpOnly` + `secure` + `sameSite` is the trifecta. `sameSite: 'strict'` is safest but breaks cross-site flows; `'lax'` is a common compromise.

### Q20: What is refresh token rotation and reuse detection?

**A:** **Rotation**: every time a refresh token is used, the server invalidates it and issues a brand-new refresh token. So a given refresh token is single-use. **Reuse detection**: if an _already-used_ (old) refresh token is presented, that signals it was stolen and replayed — the server then revokes the entire **token family** for that user, forcing re-login. This limits damage from a leaked refresh token.

**Tip:** Track tokens by a `family`/`session` id. Old token reused → nuke the family. This is the standard defense (used by Auth0 etc.).

### Q21: JWTs are stateless — how do you handle logout and revocation?

**A:** Since a valid signed JWT is accepted until `exp`, you can't truly "delete" it. Options:

1. **Short access-token expiry** + revoke the refresh token server-side (delete the stored record) — the access token dies within minutes naturally.
2. **Blacklist/denylist** revoked token IDs (`jti`) in Redis with a TTL = remaining lifetime; the auth middleware checks the denylist. This reintroduces a lookup but enables instant revocation.
3. **Version/`tokenVersion`** stored per user — bump it to invalidate all existing tokens.

**Tip:** "Statelessness is the trade-off — true revocation needs _some_ server state (denylist or refresh-token store). Short expiry minimizes how much you need it."

### Q22: What is OAuth 2.0 and what are its roles?

**A:** OAuth 2.0 is a **delegated authorization** framework — it lets an app access a user's resources on another service without the user sharing their password. Four roles:

- **Resource Owner**: the user who owns the data.
- **Client**: the app requesting access.
- **Authorization Server**: issues tokens after the user consents (e.g. Google's auth server).
- **Resource Server**: the API holding the protected resources, which accepts the access token.

**Tip:** OAuth is about **authorization/delegation, not login** — "Sign in with Google" actually uses **OpenID Connect** on top of OAuth.

### Q23: Explain the Authorization Code flow with PKCE.

**A:** The recommended flow for SPAs/mobile:

1. Client redirects the user to the auth server with a `code_challenge` (hash of a random `code_verifier`).
2. User authenticates and consents.
3. Auth server redirects back with a short-lived **authorization code**.
4. Client exchanges the code **plus the original `code_verifier`** for tokens at the token endpoint.
5. Auth server verifies the verifier hashes to the challenge, then returns access (and refresh / id) tokens.
   **PKCE** (Proof Key for Code Exchange) prevents an intercepted authorization code from being used by an attacker, because they don't have the `code_verifier`.

**Tip:** PKCE replaces the old implicit flow for public clients (no client secret). Always say "Authorization Code + PKCE" for SPAs.

### Q24: What is the client credentials grant?

**A:** A **machine-to-machine** flow with no user involved. The client authenticates with its own `client_id` and `client_secret` directly to the token endpoint and gets an access token to call APIs on its _own_ behalf (e.g. a backend cron job calling another service). No browser, no redirect, no user consent.

**Tip:** Client credentials = service identity, not user identity. Used for backend integrations.

### Q25: What is OpenID Connect and how does it differ from OAuth?

**A:** **OAuth 2.0 handles authorization** (access to resources). **OpenID Connect (OIDC)** is an identity layer **built on top of OAuth** that handles **authentication** — proving who the user is. OIDC adds an **`id_token`** (a JWT with identity claims like `sub`, `email`, `name`) and a standard `/userinfo` endpoint. So "Sign in with Google" = OIDC.

**Tip:** "OAuth answers _can this app access X_; OIDC answers _who is this user_. The `id_token` is the OIDC addition."

### Q26: How did you use Azure AD / MSAL?

**A:** In Admin Coffee I integrated **Azure AD** as the identity provider using **MSAL** (Microsoft Authentication Library). MSAL handles the OAuth 2.0 Authorization Code + PKCE flow with Azure AD: it opens the Microsoft login, manages the redirect, acquires tokens (`acquireTokenSilent` / `acquireTokenPopup`), caches them, and silently refreshes them. The backend validates the Azure-issued JWT against Microsoft's public keys (RS256/JWKS).

**Tip:** Key talking points: MSAL = client-side token acquisition + silent renewal; backend validates via Azure's JWKS endpoint (RS256). This is enterprise SSO.

### Q27: What is SSO and social login?

**A:** **SSO (Single Sign-On)** lets a user authenticate once with a central identity provider and access multiple apps without logging in again (common via OIDC/SAML in enterprises — e.g. one Azure AD login for all internal tools). **Social login** is consumer SSO using providers like Google/Facebook/GitHub via OAuth/OIDC, so users don't create yet another password.

**Tip:** Both reduce password fatigue and centralize auth, but make the IdP a single point of trust (and failure).

### Q28: RBAC vs ABAC — what's the difference?

**A:** **RBAC (Role-Based Access Control)**: permissions are attached to **roles** (admin, manager, user), and users get roles. Simple, coarse-grained. **ABAC (Attribute-Based Access Control)**: access decided by **policies over attributes** of the user, resource, action, and environment (e.g. "a manager can edit orders _in their own department_ during business hours"). More flexible and fine-grained, but more complex.

**Tip:** My `restrictTo('admin')` / `RolesGuard` is RBAC. Mention ABAC when ownership/context matters (e.g. "edit only your own resource" is really attribute-based).

### Q29: Show a roles guard / restrictTo implementation.

**A:** Express middleware factory:

```js
// Run after authenticate (which sets req.user)
function restrictTo(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

// Usage
router.delete("/users/:id", authenticate, restrictTo("admin"), deleteUser);
```

NestJS equivalent — a `RolesGuard` reading a `@Roles('admin')` decorator via the `Reflector`:

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", ctx.getHandler());
    if (!roles) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return roles.includes(user.role);
  }
}
```

**Tip:** 401 = not authenticated, 403 = authenticated but not authorized. Mixing them up is a classic interview slip.

### Q30: How do you handle authentication in a multi-tenant app?

**A:** In Dynamic SaaS / Pharmacy FEFO, every user belongs to a **tenant**, and isolation is enforced at multiple layers:

1. **Scope the token**: include `tenantId` as a claim in the JWT at login.
2. **Scope every query**: middleware reads `tenantId` from the verified token (not from a client header) and every DB query filters by it (`{ tenantId, ... }`).
3. **Never trust client-supplied tenant ids** alone — derive it from the authenticated token.
4. Optionally, separate databases/schemas per tenant for stronger isolation.

**Tip:** The #1 multi-tenant bug is **cross-tenant data leakage** (a user reading another tenant's data). Defense: tenantId from the token + enforced on every read/write, ideally at a base-query/repository level so a developer can't forget it.

### Q31: Walk through a secure password reset flow.

**A:**

1. User requests reset by email.
2. Server generates a **cryptographically random token**, stores a **hash** of it with a short **expiry** (e.g. 15 min) and single-use flag, and emails a link containing the raw token.
3. User clicks; server hashes the incoming token, finds the matching unexpired record, and lets them set a new password.
4. Invalidate the token after use and ideally revoke existing sessions/refresh tokens.
   Crucially, return a **generic "if that email exists, we sent a link" response** whether or not the email exists — to prevent account enumeration.

**Tip:** Store the _hash_ of the reset token (treat it like a password), short expiry, single-use, generic response.

### Q32: How does email verification work and why?

**A:** On signup, the server emails a unique, expiring token/link; the user must click it to mark the account `verified`. It proves the user controls the email, blocks fake/typo signups, and prevents account hijacking via unverified emails. Until verified, you can restrict access.

**Tip:** Same pattern as password reset — random token, hashed at rest, expiry, single-use.

### Q33: What is 2FA/MFA and how does TOTP work?

**A:** **MFA (Multi-Factor Authentication)** requires more than one factor: something you _know_ (password), _have_ (phone/authenticator), or _are_ (biometric). **2FA** is two factors. **TOTP (Time-based One-Time Password)** is the common app-based second factor: server and authenticator app share a secret; both compute a 6-digit code from that secret + the current 30-second time window. The user enters the code; the server computes its own and compares.

**Tip:** TOTP needs no network (offline) and rotates every 30s. SMS 2FA is weaker (SIM-swap risk). Always provide backup/recovery codes.

## Advanced

### Q34: What is XSS and how do you prevent it?

**A:** **Cross-Site Scripting** injects malicious JavaScript that runs in another user's browser, letting attackers steal tokens/cookies, hijack sessions, or rewrite the page. Types:

- **Stored**: malicious script saved server-side (e.g. a comment) and served to all viewers.
- **Reflected**: script in a URL/param reflected straight back in the response.
- **DOM-based**: client-side JS writes untrusted data into the DOM unsafely.
  Prevention: **output encoding/escaping** by context, a strict **Content-Security-Policy**, sanitize HTML (DOMPurify) when you must render it, avoid `innerHTML`/`dangerouslySetInnerHTML` with raw input, and use httpOnly cookies so script can't read tokens.

**Tip:** React auto-escapes JSX, which prevents most XSS — until someone uses `dangerouslySetInnerHTML`. CSP is your defense-in-depth backstop.

### Q35: What is a Content Security Policy?

**A:** **CSP** is an HTTP response header that whitelists where resources (scripts, styles, images, connections) may load from, e.g. `Content-Security-Policy: default-src 'self'; script-src 'self'`. It mitigates XSS by blocking inline scripts and unauthorized origins, so even if injection happens, the malicious script won't execute.

**Tip:** A good CSP disallows `'unsafe-inline'` for scripts — that's where its XSS protection comes from. Roll out in report-only mode first.

### Q36: What is CSRF and how do you defend against it?

**A:** **Cross-Site Request Forgery** tricks a logged-in user's browser into making an unwanted state-changing request to your site (e.g. a hidden form auto-submits to `/transfer`). It works because the browser **automatically attaches cookies**. Defenses:

- **SameSite cookies** (`Strict`/`Lax`) — cookies aren't sent on cross-site requests.
- **Anti-CSRF tokens** — a per-session unpredictable token required in each state-changing request and validated server-side (synchronizer token pattern).
- Check `Origin`/`Referer` headers.

**Tip:** CSRF only matters for cookie/ambient-auth requests. Pure `Authorization: Bearer` header tokens (not auto-sent by the browser) are largely immune — that's a nuance worth stating.

### Q37: What is the double-submit cookie pattern, and when do you still need CSRF tokens if you already use SameSite cookies?

**A:** `SameSite=Lax/Strict` already blocks most CSRF, because the auth cookie isn't attached to cross-site POSTs from an attacker's page. You **still** need explicit CSRF defenses when: you use `SameSite=None` (required for cross-origin/separate-domain APIs, where the cookie _is_ sent cross-site), you must support older browsers that lack a `SameSite` default, or you want defense-in-depth on sensitive actions.

The **double-submit cookie** pattern is stateless (no server-side store): the server sets a random `csrf` cookie that JS _can_ read (NOT `httpOnly`); the client reads it and echoes it in an `X-CSRF-Token` header; the server checks `header === cookie`. It works because the Same-Origin Policy stops an attacker's site from reading your cookie to forge the matching header.

```ts
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true; // safe methods
    const cookie = req.cookies?.["csrf"];
    const header = req.headers["x-csrf-token"];
    if (!cookie || cookie !== header)
      throw new ForbiddenException("Invalid CSRF token");
    return true;
  }
}
```

Contrast with the **synchronizer-token** pattern, where the server stores and validates a per-session token — stronger but stateful. Note: pure Bearer-token APIs (no ambient cookies) are largely CSRF-immune, since the browser doesn't auto-attach the token.

**Tip:** CSRF is a cookie/ambient-auth problem; if you authenticate with an `Authorization: Bearer` header you mostly don't need CSRF tokens.

### Q38: What is SQL injection and how do you prevent it?

**A:** **SQLi** happens when user input is concatenated into a SQL string, letting an attacker alter the query (e.g. `' OR '1'='1` to bypass login, or `DROP TABLE`). Prevention: **parameterized queries / prepared statements** (the input is sent separately from the SQL and treated strictly as data), use an ORM/query builder that parameterizes for you, validate input, and apply least-privilege DB accounts.

**Tip:** "Never build SQL by string concatenation — always parameterize." ORMs help because they parameterize by default, but raw queries through them can still be vulnerable.

### Q39: Does NoSQL/MongoDB have injection? How do you prevent it?

**A:** Yes — **NoSQL injection**. If you pass untrusted input directly into a query, an attacker can inject **operators**. Classic: a login body of `{ "email": "x", "password": { "$gt": "" } }` makes `password: { $gt: "" }` match any password. Prevention: validate/cast input types (passwords must be strings), strip keys starting with `$`/`.` (e.g. `express-mongo-sanitize`), and use schema validation (Mongoose/Zod).

**Tip:** The fix is type/shape validation — never let an object where you expect a string. Mongoose schemas + a sanitizer middleware close this.

### Q40: What does CORS actually protect, and how is it misconfigured?

**A:** **CORS (Cross-Origin Resource Sharing)** is a **browser** mechanism that controls whether _browser-based_ JS from one origin may read responses from another origin. It's enforced by the browser, not the server — it does **not** protect your API from non-browser clients (curl, Postman) and is **not** authorization. Misconfigurations: reflecting any `Origin` back with `Access-Control-Allow-Origin`, using `*` together with `Access-Control-Allow-Credentials: true` (browsers forbid it, so people hack around it insecurely), or being overly permissive.

**Tip:** "CORS relaxes the same-origin policy for the browser; it's not a server-side security control. Whitelist specific origins, and never combine wildcard origin with credentials."

### Q41: What is IDOR / BOLA and how do you prevent it?

**A:** **Insecure Direct Object Reference** (a.k.a. **Broken Object Level Authorization**) is when an endpoint exposes a resource by id and only checks that the user is _authenticated_, not that they _own/may access_ that specific resource — so changing `/orders/123` to `/orders/124` returns someone else's order. Prevention: **authorize on every resource** by checking ownership/tenant on each request, not just that a valid token exists.

**Tip:** It's #1 on the OWASP API Top 10. Rule: "Authentication is not authorization — check ownership on every object access." This ties directly to my multi-tenant `tenantId` scoping.

### Q42: What is mass assignment and how do you prevent it?

**A:** **Mass assignment** is blindly binding request body fields to a model, letting an attacker set fields they shouldn't — e.g. POSTing `{ "role": "admin", "isVerified": true }` and having it persisted because you did `User.create(req.body)`. Prevention: **whitelist** allowed fields (pick/DTO/Zod schema) and never spread raw `req.body` into a model.

**Tip:** Validate-and-whitelist with Zod:

```js
import { z } from "zod";

const CreateUserDto = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
  })
  .strict(); // .strict() rejects unknown keys like "role"

function createUser(req, res) {
  const result = CreateUserDto.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ errors: result.error.issues });
  // Only whitelisted fields reach the DB — role/isVerified can't be injected
  return userService.create(result.data);
}
```

`.strict()` rejecting unknown keys is the key line.

### Q43: What are security headers and how does helmet help?

**A:** Security headers harden responses against common attacks. **helmet** is Express middleware that sets sensible defaults:

- **Content-Security-Policy** — mitigates XSS.
- **Strict-Transport-Security (HSTS)** — forces HTTPS for future requests.
- **X-Frame-Options / frame-ancestors** — prevents clickjacking by blocking framing.
- **X-Content-Type-Options: nosniff** — stops MIME sniffing.
- Hides `X-Powered-By`.

```js
import helmet from "helmet";

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"] },
  }),
);
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
```

**Tip:** "One line of `app.use(helmet())` sets a dozen secure defaults" — but tune the CSP for your app.

### Q44: What is clickjacking and how do you stop it?

**A:** **Clickjacking** tricks a user into clicking something different from what they perceive by loading your site in an invisible `<iframe>` overlaid on a decoy page. Defense: **`X-Frame-Options: DENY`** (or `SAMEORIGIN`) and the modern CSP **`frame-ancestors 'none'`** directive, which prevent your page from being framed by other sites.

**Tip:** `frame-ancestors` (CSP) supersedes `X-Frame-Options`; set both for compatibility.

### Q45: How do you protect against brute force, and what is account enumeration?

**A:** **Brute force** = repeatedly guessing credentials/tokens. Defenses: **rate limiting** (e.g. `express-rate-limit`), account lockout/exponential backoff after N failures, CAPTCHA, and slow password hashing (bcrypt). **Account enumeration** is when error messages or timing differences reveal whether an email/username exists ("user not found" vs "wrong password"). Defense: identical generic responses and consistent timing for valid/invalid accounts, plus rate limiting on login, signup, and password-reset.

```js
import rateLimit from "express-rate-limit";
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many attempts",
});
app.post("/auth/login", loginLimiter, login);
```

**Tip:** Return "Invalid email or password" (never "no such user"), and rate-limit reset/login endpoints to block enumeration + brute force together.

### Q46: How do you manage secrets and avoid sensitive data exposure?

**A:** Keep secrets (DB URIs, JWT secrets, API keys) out of code: load from **environment variables** (`.env` locally, never committed — add to `.gitignore`), and use a secrets manager (AWS Secrets Manager, Azure Key Vault, Vault) in production. Encrypt sensitive data at rest and in transit (TLS), don't log secrets/PII, and rotate keys. **Sensitive data exposure** also covers serving over HTTP, returning password hashes in API responses, etc.

**Tip:** If a secret was ever committed, it's compromised — **rotate it**, don't just delete the line. Mention `git filter-repo`/key rotation.

### Q47: Why HTTPS/TLS everywhere?

**A:** **TLS** encrypts traffic so attackers on the network can't read or tamper with it (prevents man-in-the-middle, token sniffing). Bearer tokens, cookies, and credentials are all sent in headers/bodies — over plain HTTP they're visible. HTTPS also enables `Secure` cookies and HSTS. There is no scenario where production auth should run over HTTP.

**Tip:** "Bearer tokens are useless without TLS — anyone on the wire can grab and replay them."

### Q48: How do you handle dependency vulnerabilities?

**A:** Third-party packages are a major attack surface (OWASP "Vulnerable and Outdated Components"). Run **`npm audit`** to find known CVEs, `npm audit fix` to patch, keep dependencies updated, use automated tools (Dependabot, Snyk) in CI, pin versions via lockfiles, and minimize dependencies. Review transitive deps too.

**Tip:** "A single vulnerable transitive dependency can compromise the whole app — automate scanning in CI, don't audit once and forget."

### Q49: Why must input validation happen on the server?

**A:** **Client-side validation is for UX only — it's trivially bypassed** (disable JS, use Postman/curl). The server must **always** validate and sanitize every input (types, ranges, formats, allowed fields) because it's the real trust boundary. This blocks injection, mass assignment, and malformed data. Use a schema validator (Zod, Joi, class-validator).

**Tip:** "Never trust the client." Validate on both sides — client for feel, server for security.

### Q50: What is the principle of least privilege?

**A:** Grant every user, service, token, and process the **minimum** access required to do its job — nothing more. Examples: a read-only DB user for reporting, scoped OAuth tokens, RBAC roles with narrow permissions, short token lifetimes, and not running the app as root. It limits the blast radius when something is compromised.

**Tip:** Applies everywhere: DB accounts, API scopes, IAM roles, file permissions, token claims.

### Q51: Give a quick overview of the OWASP Top 10.

**A:** The OWASP Top 10 (2021) lists the most critical web app risks:

1. **Broken Access Control** (IDOR/BOLA, missing AuthZ) — most common.
2. **Cryptographic Failures** (weak/missing encryption, plaintext secrets).
3. **Injection** (SQL, NoSQL, command, XSS).
4. **Insecure Design** (missing security by design).
5. **Security Misconfiguration** (defaults, verbose errors, open CORS).
6. **Vulnerable & Outdated Components**.
7. **Identification & Authentication Failures** (weak passwords, broken session mgmt).
8. **Software & Data Integrity Failures** (insecure deserialization, untrusted CI/CD).
9. **Security Logging & Monitoring Failures**.
10. **Server-Side Request Forgery (SSRF)**.

**Tip:** Know #1 (Broken Access Control) and #3 (Injection) cold — they're the most asked. The list reorders the previous one; access control rose to the top.

### Q52: How do you securely structure a JWT for a multi-tenant RBAC app like yours?

**A:** Combine the pieces:

- Payload claims: `sub` (user id), `role`, `tenantId`, `iat`, `exp` (short, ~15m). No PII/secrets.
- Sign with a strong secret (HS256) or RS256 if multiple services verify.
- Auth middleware verifies signature + `exp`, attaches `req.user`.
- AuthZ middleware checks `role` (RBAC `restrictTo`) **and** scopes every query to `req.user.tenantId` (tenant isolation), plus ownership checks for IDOR.
- Refresh token in httpOnly/Secure/SameSite cookie, rotated with reuse detection.

**Tip:** This single answer ties together JWT, RBAC, multi-tenancy, IDOR, and secure cookies — a strong closing answer that shows real architecture experience.

### Q53: An attacker steals a user's access token. What limits the damage in your design?

**A:** Several layers: the **access token is short-lived** (~15 min) so it expires fast; it lives **in memory** (not localStorage), so it isn't easily exfiltrated and dies on tab close; **TLS** prevents sniffing it in transit; **httpOnly cookies** keep the refresh token unreadable to JS; and **least-privilege claims** limit what the token can do. For a stolen refresh token, **rotation + reuse detection** revokes the whole family.

**Tip:** Frame defense in depth — no single control, but each one shrinks the blast radius and the time window.

### Q54: How does Passport.js fit into auth, and how did you use it?

**A:** **Passport.js** is authentication middleware for Node with a **strategy** plugin model — each strategy (Local, JWT, Google, etc.) encapsulates one auth method. In Shuhna and Foody I used Passport: the **local strategy** validates email/password against the DB (with bcrypt) on login, and the **JWT strategy** extracts and verifies the bearer token on protected routes, attaching the user. It standardizes auth across many providers behind one API.

**Tip:** Passport handles _authentication_ (verifying credentials/tokens); you still implement _authorization_ (roles/ownership) yourself. The strategy pattern is the thing to name.

## Common Mistakes / Red Flags

- **Confusing authentication with authorization** — or returning 401 when you mean 403 (and vice versa).
- **Putting sensitive data in a JWT payload** — it's base64, not encrypted. Anyone can read it.
- **Storing tokens in localStorage and ignoring XSS** — then claiming the app is "secure."
- **No token expiry** — a leaked JWT valid forever.
- **Not specifying `algorithms` in `jwt.verify`** — opens algorithm-confusion / `alg: none` attacks.
- **Treating CORS as a security boundary** — it only restricts browsers, not curl/Postman, and isn't authorization.
- **Authenticating but not authorizing per resource** — the IDOR/BOLA trap; checking only that a token is valid, not that the user owns the object.
- **Blindly doing `Model.create(req.body)`** — mass assignment lets users set `role: 'admin'`.
- **Hashing passwords with MD5/SHA-256** or storing them in plaintext — use bcrypt/argon2 with a work factor.
- **Building SQL/Mongo queries by string concatenation** or passing raw objects where a string is expected (NoSQL operator injection).
- **Different login error messages / response times** for "no such user" vs "wrong password" — account enumeration.
- **Committing `.env` / secrets to git** — and then just deleting the line instead of rotating the secret.
- **No rate limiting on login/reset endpoints** — brute force and enumeration wide open.
- **Validating only on the client** — trivially bypassed; server is the real trust boundary.
- **Stateless JWT with no revocation strategy** — can't log users out; needs short expiry + denylist/refresh store.
- **Refresh interceptor with no `_retry` guard or no mutex** — infinite loops or a refresh stampede on parallel 401s.
- **In multi-tenant apps, trusting a client-supplied `tenantId`** instead of deriving it from the verified token — cross-tenant leakage.
- **Running auth over HTTP** — TLS is non-negotiable for bearer tokens and cookies.

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — the canonical web application security risk list.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — practical guides (Auth, JWT, Session Management, Password Storage, CSRF).
- [OAuth 2.0 (RFC 6749) & OAuth Simplified by Aaron Parecki](https://oauth.net/2/) — OAuth/OIDC flows explained clearly.
- [JWT Introduction (jwt.io)](https://jwt.io/introduction) — JWT structure, claims, and signing reference.
