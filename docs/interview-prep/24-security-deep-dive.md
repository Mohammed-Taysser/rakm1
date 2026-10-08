# Security Deep-Dive (Node / NestJS / MongoDB / Docker) (39 questions)

> Security is the single highest-stakes axis of a fintech back-end role. At a fintech company you are guarding money and PII — a single Broken Access Control or NoSQL-injection bug can leak account balances, let user A read user B's portfolio, or move funds. Interviewers at financial companies probe security hard because the cost of a breach is regulatory, reputational, and financial. This file is the _practical, stack-specific_ deep-dive: it deliberately goes **deeper on application & infrastructure security** (OWASP Top 10, NoSQL injection, NestJS hardening, Docker, secrets, logging) and **complements `11-auth-security.md`** — that file owns the auth/JWT/OAuth/session fundamentals, so here we cross-reference it and only go _deeper_ on auth hardening rather than repeating the basics. Where useful, examples lean on the candidate's real patterns: the **Nova ERP** 401 refresh-retry flow, the **Pharmacy FEFO** multi-tenant isolation, and NestJS guards/pipes.

---

## Quick Revision Checklist

- **Never trust the client** — validate & type every input with DTOs + a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- **Broken Access Control is OWASP #1** — always do _object-level_ authZ (the resource belongs to this user/tenant), not just route-level.
- **NoSQL injection is real** — a string field that arrives as `{ "$ne": null }` can bypass auth. Cast types, validate DTOs, add `express-mongo-sanitize`.
- **Mass assignment** — never `new Model(req.body)`; whitelist fields so a client can't set `role`/`isAdmin`/`balance`.
- **Hashing ≠ encryption ≠ encoding** — know the difference cold; it's a classic interview question.
- **Passwords:** argon2id (or bcrypt cost ≥ 12), per-user salt, never MD5/SHA-256 alone.
- **JWT:** short-lived access + rotating refresh + reuse detection; pin the algorithm (block `alg:none`); verify `aud`/`iss`/`exp`; no PII/secrets in payload.
- **Serialize output** — `ClassSerializerInterceptor` + `@Exclude()` so password hashes never leave the API.
- **Secrets** — `.env` in `.gitignore`, scanned with gitleaks, injected at runtime, never baked into Docker layers.
- **Transport** — TLS everywhere, HSTS, secure cookies (`httpOnly` + `Secure` + `SameSite`).
- **Headers** — `helmet` (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
- **CORS** — explicit allow-list of origins, `credentials: true` only with a fixed origin (never `*` + credentials).
- **Rate limit** — `@nestjs/throttler` globally + stricter on `/auth/login` to stop brute-force/credential-stuffing.
- **Body limits** — cap JSON/upload size to blunt DoS.
- **Least privilege** — scoped DB users, scoped tokens, minimal container capabilities.
- **Dependencies** — lockfile committed, `npm audit`, Dependabot/Snyk, minimal deps, watch for typosquats.
- **Docker** — non-root `USER`, multi-stage build, distroless/alpine, `.dockerignore`, read-only FS, scan with Trivy.
- **Logging** — log auth failures & access-control denials, but **never** log passwords, tokens, card data, or PII.
- **Fail securely & defense in depth** — errors deny by default, never leak stack traces to clients in prod.

---

## Basic

### Q1: What is the OWASP Top 10 and why does it matter for a fintech back-end?

**A:** It's a community-maintained list of the ten most critical web-application security risks, refreshed every few years (current edition: 2021). It's the industry baseline checklist. For a fintech back-end it matters because each category maps directly to a way to lose money or leak customer financial data — and auditors/regulators expect you to be able to speak to it.

**Tip:** Memorise the 2021 list in order: A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable & Outdated Components, A07 Identification & Authentication Failures, A08 Software & Data Integrity Failures, A09 Security Logging & Monitoring Failures, A10 SSRF.

### Q2: What is the difference between hashing, encryption, and encoding? (classic interview question)

**A:**

- **Encoding** (Base64, URL-encoding) is _reversible_ and uses **no key**. It's for data _transport/representation_, not security. Anyone can decode it.
- **Encryption** is _reversible with a key_ (symmetric like AES, or asymmetric like RSA). Use it for data you need to read back later (e.g. a stored API secret, or field-level PII).
- **Hashing** is _one-way_ — you cannot get the input back. Use it for passwords (with a salt) and integrity checks.

**Tip:** The trap answer is calling Base64 "encryption." Passwords are _hashed_, never encrypted; an encrypted password is a design smell because it implies a key exists that can reverse it.

### Q3: What does "never trust the client" mean in practice?

**A:** Any value that originates outside your trust boundary — request body, query string, headers, cookies, JWT claims you didn't sign yourself, file uploads — is attacker-controllable. Validate, type-cast, and authorize on the server every time, even if the front end already validated. The front end is for UX; the back end is the security boundary.

**Tip:** "The UI hides the delete button for non-admins" is not access control. The API must reject the request.

### Q4: What is input validation and how do you do it in NestJS?

**A:** Input validation is rejecting any request whose shape/types/values you didn't explicitly allow. In NestJS you define a DTO with `class-validator` decorators and enable a global `ValidationPipe`.

```ts
// create-transfer.dto.ts
import { IsMongoId, IsNumber, IsPositive, Max } from "class-validator";
export class CreateTransferDto {
  @IsMongoId() toAccountId: string;
  @IsNumber() @IsPositive() @Max(1_000_000) amount: number;
}
```

**Tip:** Validation (is the input well-formed?) is separate from authorization (is this user allowed?). You need both.

### Q5: What is XSS and who's responsible for it in a MERN stack?

**A:** Cross-Site Scripting is injecting attacker-controlled markup/JS that runs in another user's browser. It mostly lives on the front end (Next.js/React). React auto-escapes values in JSX, so the common foot-gun is `dangerouslySetInnerHTML` with unsanitized content. The back end contributes by **storing** unsanitized data (stored XSS) and by setting headers (CSP) that limit blast radius.

**Tip:** Defense: avoid `dangerouslySetInnerHTML`; if unavoidable, sanitize with DOMPurify; set a Content-Security-Policy via helmet.

### Q6: What is CSRF and when do you need to worry about it?

**A:** Cross-Site Request Forgery tricks a logged-in user's browser into sending an authenticated request to your API. It's only a risk when the browser **auto-attaches** credentials — i.e. **cookie-based** sessions. If you send the access token in an `Authorization: Bearer` header (as Nova ERP's front end does), CSRF doesn't apply because the browser won't auto-attach it.

**Tip:** If you do use cookie auth, set `SameSite=Strict`/`Lax` and add CSRF tokens (e.g. double-submit). See `11-auth-security.md` for the cookie-vs-header trade-off.

### Q7: Why must you run `npm audit` and commit your lockfile?

**A:** Your code is a small fraction of what ships; the rest is dependencies (OWASP A06). `npm audit` flags known CVEs in your tree. The committed `package-lock.json` guarantees everyone — and your CI/Docker build — installs the _exact same_ resolved versions, so a compromised or breaking transitive update can't silently slip in.

**Tip:** Add Dependabot/Snyk for automated PRs, and prefer `npm ci` (which respects the lockfile strictly) in CI and Docker.

### Q8: Why should a Docker container not run as root?

**A:** If an attacker achieves code execution inside a root container and escapes (or the container shares a mounted volume), they have root-level reach. Running as an unprivileged user is least-privilege containment — a compromise is limited to that user's permissions.

**Tip:** Add a `USER node` (or a created non-root user) directive in your Dockerfile; the official `node` image already ships a `node` user.

### Q9: What's the difference between authentication and authorization?

**A:** **Authentication (authN)** = _who are you_ (verify identity — login, JWT verification). **Authorization (authZ)** = _what are you allowed to do_ (RBAC, ownership checks). In NestJS, authN is typically an `AuthGuard`/JWT strategy; authZ is a `RolesGuard` plus per-resource ownership checks.

**Tip:** OWASP A01 (Broken Access Control) and A07 (Auth Failures) are the two sides of this — interviewers love asking you to separate them.

### Q10: What is the principle of least privilege?

**A:** Every component — user, service, DB account, container, token — gets the _minimum_ permissions needed and nothing more. A reporting service uses a read-only Mongo user; an API token is scoped to one tenant; a container drops all Linux capabilities it doesn't use.

**Tip:** It limits blast radius: when (not if) something is compromised, least privilege caps the damage.

---

## Intermediate

### Q11: Walk me through NoSQL/MongoDB injection. How does `{ "$gt": "" }` bypass a login?

**A:** Mongo queries are JSON objects, and operators (`$gt`, `$ne`, `$in`, `$where`) are just keys. If you pass `req.body` straight into a query and a field that should be a _string_ arrives as an _object_, the attacker injects an operator. Example login:

```ts
// VULNERABLE: body is { "email": "a@b.com", "password": { "$ne": null } }
const user = await this.userModel.findOne({
  email: req.body.email,
  password: req.body.password, // becomes { password: { $ne: null } }
});
// matches the first user whose password is not null → auth bypass
```

`{ "$gt": "" }` / `{ "$ne": null }` make the predicate "any value," and `$where` lets an attacker run arbitrary JavaScript on the server.

**Tip:** The root cause is _type confusion_: a string field accepted an object.

### Q12: How do you defend against NoSQL injection in NestJS + Mongoose?

**A:** Layered:

1. **DTO validation + casting** — `@IsString()`/`@IsEmail()` reject objects; `transform: true` casts. An object value for an `@IsString()` field fails validation before it ever reaches the query.

```ts
export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string; // object => 400, no query runs
}
```

2. **Mongoose schema typing** — a `String`-typed path will reject/cast non-strings, but don't rely on it alone (casting behavior varies and `strictQuery` matters).
3. **`express-mongo-sanitize`** — strips keys starting with `$` or containing `.` from `req.body`/`query`/`params` as a global safety net.
4. **Never pass raw user objects into queries** — build the filter explicitly: `{ email: dto.email }`, not `{ ...req.body }`.
5. **Disable `$where`/server-side JS** — avoid `$where` entirely; it executes JS. Set `--noscripting` / `security.javascriptEnabled: false` on the MongoDB server.

**Tip:** DTOs are your primary defense; `express-mongo-sanitize` is defense-in-depth, not a substitute.

### Q13: Briefly — what about classic SQL/command/LDAP injection? Same idea?

**A:** Yes, same root cause: untrusted data mixed into an interpreter's instruction. **SQL injection** → use parameterized queries/ORM bindings, never string concatenation. **Command injection** → avoid `child_process.exec` with user input; use `execFile`/`spawn` with an args array and no shell. **LDAP injection** → escape special chars in LDAP filters. The universal fix is _separate code from data_ (parameterization) and validate input.

**Tip:** Even if the stack is Mongo-based, expect a "what if you also had to hit a SQL warehouse?" follow-up — parameterize.

### Q14: What is mass assignment / over-posting and how do DTOs stop it?

**A:** Mass assignment is when a client sends extra fields and your code blindly persists them. `new UserModel(req.body)` with body `{ name, email, role: "admin", balance: 99999 }` would set `role` and `balance`. The fix is whitelisting via DTOs + `ValidationPipe`:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // strip props with no DTO decorator
    forbidNonWhitelisted: true, // 400 if unknown props are sent
    transform: true, // cast to DTO types
  }),
);
```

Now only DTO-declared fields survive, and `role`/`balance` aren't in the `UpdateProfileDto`.

**Tip:** Never spread `...req.body` into a model save. Assign fields explicitly or pass the validated DTO.

### Q15: Explain Broken Access Control with IDOR/BOLA and why it's #1 for fintech.

**A:** **IDOR** (Insecure Direct Object Reference) / **BOLA** (Broken Object-Level Authorization) is when an endpoint trusts a client-supplied ID without checking the object belongs to the caller. `GET /accounts/:id` that returns _any_ account by id lets user A read user B's balance by changing the URL. In fintech this is catastrophic. The fix is **object-level authorization**: scope every query to the authenticated user/tenant.

```ts
// VULNERABLE
@Get(':id')
getAccount(@Param('id') id: string) {
  return this.accountModel.findById(id); // anyone's account
}

// FIXED: ownership enforced in the query
@Get(':id')
async getAccount(@Param('id') id: string, @CurrentUser() user: AuthUser) {
  const account = await this.accountModel.findOne({ _id: id, ownerId: user.id });
  if (!account) throw new NotFoundException(); // 404, not 403 — don't confirm existence
  return account;
}
```

**Tip:** This is exactly the Pharmacy FEFO multi-tenant pattern: every query carries the tenant scope (`tenantId`/`ownerId`) so user A can never reach user B's documents. Throw `404` rather than `403` to avoid leaking that the resource exists.

### Q16: How do you enforce role-based access control in NestJS?

**A:** A custom decorator stores required roles in metadata; a `RolesGuard` reads them with `Reflector` and compares against the authenticated user.

```ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (!required?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return !!user && required.some((r) => user.roles?.includes(r));
  }
}

// usage
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // authN first, then authZ
@Delete(':id')
remove(@Param('id') id: string) { /* ... */ }
```

**Tip:** RBAC is _function-level_ authZ. It does **not** replace _object-level_ authZ — an admin guard still needs ownership/tenant checks for non-admins. Combine both.

### Q17: How do you stop password hashes (and other secrets) from leaking in API responses?

**A:** Use `@Exclude()` on sensitive fields and a global `ClassSerializerInterceptor`, and return class instances (not plain Mongoose lean objects).

```ts
export class UserResponse {
  @Expose() id: string;
  @Expose() email: string;
  @Exclude() passwordHash: string;
  @Exclude() refreshTokenHash: string;
}
// main.ts
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

**Tip:** Mongoose `.lean()` returns plain objects that the serializer won't transform — map them to a response class, or strip fields with a `toJSON` transform on the schema. Verify with a test that `passwordHash` never appears in any response.

### Q18: How do you configure helmet, CORS, throttling, and body limits in `main.ts`?

**A:**

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });

  app.use(helmet()); // sane security headers (CSP, X-Frame-Options, etc.)

  app.enableCors({
    origin: ["https://app.example.com"], // explicit allow-list, never '*'
    credentials: true, // only valid with a fixed origin
    methods: ["GET", "POST", "PATCH", "DELETE"],
  });

  app.use(json({ limit: "100kb" })); // cap body size (DoS / abuse)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(3000);
}
```

And throttling via `@nestjs/throttler`:

```ts
@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
```

**Tip:** `credentials: true` with `origin: '*'` is rejected by browsers and is a misconfiguration red flag — always pair credentials with an explicit origin list.

### Q19: How do you protect the login endpoint from brute-force and credential stuffing?

**A:** Layers:

- **Rate limit** the auth routes more strictly than the rest (`@Throttle({ default: { limit: 5, ttl: 60_000 } })` on `/auth/login`).
- **Account lockout / backoff** after N failures (with care to avoid a lockout-DoS — prefer exponential backoff or IP+account throttling).
- **CAPTCHA** after repeated failures.
- **Generic error** — return "invalid credentials" for both wrong-user and wrong-password so you don't enable user enumeration.
- **Strong hashing** (argon2id) so even if the DB leaks, offline cracking is slow.
- **MFA** raises the bar against stuffing with leaked passwords.

**Tip:** Credential stuffing uses _valid_ passwords from other breaches — rate limiting + MFA + breached-password checks (e.g. HaveIBeenPwned k-anonymity API) are the real defenses.

### Q20: How do you keep secrets out of source control and validate config?

**A:**

- `.env` in `.gitignore`; commit a `.env.example` with keys but no values.
- Scan history/CI with **gitleaks** (and rotate anything ever committed — git history is forever).
- Inject secrets at runtime via the platform/secrets manager (AWS Secrets Manager, Vault, Docker/K8s secrets), not hard-coded.
- Validate required env at boot with `@nestjs/config` so the app fails fast if a secret is missing:

```ts
ConfigModule.forRoot({
  validationSchema: Joi.object({
    JWT_SECRET: Joi.string().min(32).required(),
    MONGODB_URI: Joi.string().uri().required(),
    NODE_ENV: Joi.string().valid("development", "production", "test"),
  }),
});
```

**Tip:** Separate secrets per environment, rotate keys on a schedule and on staff offboarding, and give the app's Mongo user only the permissions it needs.

### Q21: What cookie attributes secure a session/refresh cookie?

**A:** `HttpOnly` (JS can't read it → mitigates token theft via XSS), `Secure` (HTTPS only), and `SameSite=Strict` or `Lax` (mitigates CSRF). Scope with `Path` and a sensible `Max-Age`/`Expires`.

```ts
res.cookie("refresh_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/auth/refresh",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**Tip:** A refresh token belongs in an `httpOnly` cookie; the short-lived access token typically lives in memory on the client. See `11-auth-security.md` for the full storage trade-off.

### Q22: What is SSRF and how do you mitigate it in a Node service?

**A:** Server-Side Request Forgery (OWASP A10) is tricking your server into making requests to an attacker-chosen URL — often internal targets like `http://169.254.169.254/` (cloud metadata, which can hand out credentials) or internal admin services. It happens when you fetch a user-supplied URL (webhooks, "import from URL," image fetch).
**A (mitigation):** Validate against an **allow-list** of hosts/schemes; reject private/link-local IP ranges (resolve the DNS first to avoid rebinding); block redirects to internal addresses; use a dedicated egress proxy; never forward the metadata endpoint.

**Tip:** Don't just blocklist `localhost` — also block `127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16`, and IPv6 equivalents.

### Q23: How do you secure file uploads?

**A:** Validate **type** (check magic bytes, not just the `Content-Type` header or extension), enforce a **size** limit, generate a new random filename (don't trust the client's), store **outside the web root** (ideally S3/object storage with no execute perms), and serve via signed URLs. Run antivirus scanning for user-shared files.

**Tip:** Never store uploads in a directory your server will execute or serve as code — an uploaded `.js`/`.php` that gets executed is remote code execution.

---

## Advanced

### Q24: Walk the full OWASP Top 10 (2021) with a Node/Nest risk + fix for each.

**A:**
| # | Category | Node/Nest risk | Fix |
|---|----------|----------------|-----|
| A01 | Broken Access Control | `findById(id)` with no ownership check (IDOR) | Object-level authZ: `findOne({_id, ownerId})`, RolesGuard, tenant scoping |
| A02 | Cryptographic Failures | passwords in plaintext/MD5; PII unencrypted; no TLS | argon2id hashing; AES field encryption for PII; TLS+HSTS |
| A03 | Injection | NoSQL operator injection via `req.body`; command injection | DTO validation, `express-mongo-sanitize`, parameterize, no `$where` |
| A04 | Insecure Design | no rate limit on transfers; no idempotency on payments | threat-model the flow; rate limits, idempotency keys, limits |
| A05 | Security Misconfiguration | verbose error stack traces in prod; CORS `*`; default creds | env-driven config, exception filter hides internals, explicit CORS |
| A06 | Vulnerable & Outdated Components | old `mongoose`/transitive CVE | `npm audit`, Dependabot/Snyk, lockfile, `npm ci` |
| A07 | Identification & Auth Failures | weak JWT, no lockout, `alg:none` accepted | pin alg, short access + rotating refresh, rate limit, MFA |
| A08 | Software & Data Integrity Failures | unsigned CI artifacts, unverified packages, insecure deserialization | lockfile integrity hashes, signed builds, verify webhooks (HMAC) |
| A09 | Logging & Monitoring Failures | no audit log of auth failures; or logging tokens | log security events without secrets/PII; centralize + alert |
| A10 | SSRF | server fetches user-supplied URL hitting metadata endpoint | allow-list hosts, block private IP ranges, no redirects |

**Tip:** For each, be ready to give _the specific line of code_ that's wrong and the one-line fix. Interviewers reward concrete over abstract.

### Q25: What's the deal with `alg:none` and algorithm confusion in JWTs?

**A:** A JWT's header declares its signing algorithm. Two attacks:

1. **`alg:none`** — attacker sets the header to `none`, drops the signature, and a naive verifier accepts an unsigned token → full forgery.
2. **Algorithm confusion (RS256→HS256)** — if your server uses an RSA _public_ key to verify but a library lets the attacker switch `alg` to HS256, the attacker signs an HS256 token using the _public_ key (which is public) as the HMAC secret.
   **A (fix):** **Pin the expected algorithm** on verification — pass `{ algorithms: ['RS256'] }` (or `['HS256']`) explicitly and never let the token's own header choose. Also verify `exp`, `iss`, `aud`.

```ts
jwt.verify(token, publicKey, {
  algorithms: ["RS256"],
  issuer: "example-auth",
  audience: "example-api",
});
```

**Tip:** `@nestjs/jwt` passes options to `jsonwebtoken`; always set `algorithms`. This goes a level deeper than the JWT basics in `11-auth-security.md`.

### Q26: Explain refresh-token rotation with reuse detection — and tie it to Nova ERP's 401 refresh-retry.

**A:** **Rotation:** each time a refresh token is used, you invalidate it and issue a brand-new refresh token. **Reuse detection:** you store a hash of the current valid refresh token (per session/device). If a _previously rotated_ (already-used) token is presented again, that means it leaked and the legitimate client already rotated past it — so you **revoke the entire token family/session** and force re-login.

In **Nova ERP**, the front end interceptor catches a `401` on an access-token call, hits `/auth/refresh` once, gets a fresh access token, and retries the original request. To make that secure server-side: the refresh endpoint compares the presented refresh token's hash to the stored one, rotates on success, and on a mismatch (reuse) revokes the family. Guard against the thundering-herd of concurrent 401s by serialising refresh attempts on the client (single in-flight refresh; queue the rest).

```ts
async refresh(userId: string, presented: string) {
  const session = await this.sessions.findOne({ userId });
  if (!session || !(await argon2.verify(session.refreshHash, presented))) {
    await this.sessions.deleteMany({ userId }); // reuse → kill all sessions
    throw new UnauthorizedException();
  }
  const next = this.signRefresh(userId);
  session.refreshHash = await argon2.hash(next); // rotate
  await session.save();
  return { accessToken: this.signAccess(userId), refreshToken: next };
}
```

**Tip:** Store only the _hash_ of the refresh token (treat it like a password). This gives you server-side revocation that stateless JWTs otherwise lack.

### Q27: argon2id vs bcrypt — which and why, and what's the parameter trade-off?

**A:** Both are deliberately slow, salted password hashes. **bcrypt** is battle-tested but capped at 72 bytes input and is only CPU-hard. **argon2id** is the modern OWASP recommendation: it's _memory-hard_ (resists GPU/ASIC cracking) and `id` is the hybrid variant resisting both side-channel and GPU attacks. Tune `memoryCost`, `timeCost`, `parallelism` so a single hash takes ~0.25–0.5s on your hardware — high enough to slow attackers, low enough not to DoS your login.

```ts
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});
const ok = await argon2.verify(hash, attempt);
```

**Tip:** Never use fast hashes (MD5, SHA-1, SHA-256) for passwords — they're built to be fast, which helps the attacker. bcrypt cost ≥ 12 is an acceptable fallback if argon2 isn't available.

### Q28: How would you do field-level encryption for sensitive PII in MongoDB?

**A:** Beyond at-rest disk encryption (which protects stolen disks but not a compromised app/DB), encrypt sensitive fields (SSN, bank account numbers) so they're ciphertext even inside the database. Options:

- **Application-level** — AES-256-GCM with a key from your secrets manager; encrypt before save, decrypt on read. GCM gives you authenticated encryption (tamper detection).
- **MongoDB Client-Side Field-Level Encryption (CSFLE) / Queryable Encryption** — driver encrypts fields transparently with keys in a KMS; the server never sees plaintext.

```ts
import { createCipheriv, randomBytes } from "crypto";
function encrypt(plain: string, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return { iv, enc, tag: cipher.getAuthTag() };
}
```

**Tip:** A fresh random IV per encryption is mandatory; never reuse an IV with GCM. Manage the key in a KMS, and plan for key rotation (store a key id alongside the ciphertext).

### Q29: Why is `Math.random()` dangerous and what do you use instead?

**A:** `Math.random()` is a non-cryptographic PRNG — its output is predictable and unsuitable for anything security-sensitive (password-reset tokens, session ids, API keys, IVs, OTP). Use Node's `crypto`:

```ts
import { randomBytes, randomUUID } from "crypto";
const resetToken = randomBytes(32).toString("hex"); // 256-bit, unguessable
const id = randomUUID(); // crypto-strong UUID v4
```

**Tip:** "Don't roll your own crypto" extends to randomness — use vetted primitives.

### Q30: Design a secure password-reset flow.

**A:**

1. User requests reset by email → **always respond with the same generic message** ("if an account exists, we sent a link") to avoid user enumeration.
2. Generate a **cryptographically random, single-use** token; store only its **hash** with a **short expiry** (e.g. 15–60 min) and `used: false`.
3. Email the raw token in a link.
4. On submit: look up by token hash, check not expired and not used, then set the new password (argon2id), mark the token used, and **invalidate existing sessions/refresh tokens**.
5. Rate-limit the request endpoint to prevent email-bombing.

**Tip:** Single-use + expiring + hashed-at-rest + invalidate-sessions are the four properties interviewers look for.

### Q31: What are Software & Data Integrity Failures (A08), and how do you handle webhooks?

**A:** A08 covers trusting code/data without verifying integrity: unverified plugin updates, insecure deserialization, and unauthenticated webhooks. For inbound webhooks (e.g. a payment provider), verify the **HMAC signature** the provider sends using a shared secret, and use **constant-time comparison** to avoid timing attacks. Also check a timestamp to reject replays.

```ts
import { createHmac, timingSafeEqual } from "crypto";
function verifyWebhook(raw: Buffer, sig: string, secret: string) {
  const expected = createHmac("sha256", secret).update(raw).digest();
  const got = Buffer.from(sig, "hex");
  return expected.length === got.length && timingSafeEqual(expected, got);
}
```

**Tip:** Verify against the **raw** request body, not the parsed/re-serialized JSON — re-serialization changes bytes and breaks the signature. Also lock dependencies with integrity hashes (the lockfile) so a tampered package is rejected.

### Q32: What should and shouldn't go into security logs in a fintech system?

**A:** **Log:** authentication successes/failures (with user id, IP, timestamp), authorization denials, password changes/resets, privilege changes, and financial events (transfers, with amounts and account ids) as an audit trail. **Never log:** passwords, full JWTs/refresh tokens, session ids, full card numbers (PAN), CVV, API secrets, or unmasked PII. Centralise logs (ELK/CloudWatch/Datadog), make them tamper-evident/append-only, and alert on anomalies (spikes in 401/403, geo-impossible logins).

```ts
// redact before logging
this.logger.warn("auth.failed", { userId, ip, attempt: maskEmail(email) });
// NEVER: this.logger.log({ password, token })
```

**Tip:** This ties into the fintech audit-trail material in `23` — auditability is both a security control and a compliance requirement. A09 failures are why breaches go undetected for months.

### Q33: How does Insecure Design (A04) differ from a misconfiguration, in a payments context?

**A:** A04 is a _flaw in the design itself_, not a buggy implementation — you built the right thing wrong, or didn't account for abuse. Examples: a money-transfer endpoint with no idempotency key (a retried request double-charges), no per-day transfer limits, or a "negative amount" transfer that moves money the wrong way. No amount of input validation fixes a missing limit or missing idempotency — that's a design control. The fix is **threat modeling** the flow (STRIDE/abuse cases) before coding.

```ts
// idempotency: client sends a key; we record it so retries are no-ops
@Post('transfers')
async transfer(@Body() dto: CreateTransferDto, @Headers('idempotency-key') key: string) {
  const existing = await this.transfers.findOne({ idempotencyKey: key });
  if (existing) return existing; // safe retry
  // ...debit/credit atomically within a Mongo transaction...
}
```

**Tip:** For money movement, mention **idempotency keys**, **per-transaction limits**, and **multi-document transactions** for atomicity — these are design-level controls fintech interviewers want to hear.

### Q34: How do you build a secure NestJS Docker image?

**A:** Multi-stage build (build deps don't ship), small base, non-root user, no secrets in layers, `.dockerignore`, and image scanning. (Full Dockerfile in the checklist section.) Key points:

- **Multi-stage** — compile in a builder stage; copy only `dist/` + production `node_modules` into the final stage.
- **Minimal base** — `node:20-alpine` or distroless; smaller attack surface, fewer CVEs.
- **Non-root** — `USER node`.
- **No baked secrets** — secrets via runtime env/`--secret` mounts; remember layers are cacheable and inspectable forever, so a secret in any intermediate layer is leaked.
- **`.dockerignore`** — exclude `.env`, `.git`, `node_modules`, test fixtures.
- **Read-only FS + dropped caps at runtime** — `--read-only`, `--cap-drop ALL`, `--security-opt no-new-privileges`.
- **Scan** — Trivy/Docker Scout in CI; rebuild on base-image patches.

**Tip:** `COPY . .` before a `.dockerignore` exists is how `.env` ends up in an image — order and ignore-file matter.

### Q35: What's a "security misconfiguration" exception filter, and why does it matter in prod?

**A:** By default an unhandled error can return a stack trace, DB error text, or internal paths to the client — that's information disclosure (A05). A global exception filter normalises errors: log the full detail server-side, return a generic, safe payload to the client in production.

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const status = err instanceof HttpException ? err.getStatus() : 500;
    this.logger.error(err); // full detail in logs only
    res.status(status).json({
      statusCode: status,
      message:
        status === 500
          ? "Internal server error"
          : (err as HttpException).message,
    });
  }
}
```

**Tip:** Also disable `x-powered-by` (helmet does), and don't echo back raw Mongo/Mongoose errors (they can reveal schema/field names).

### Q36: What is defense in depth and "fail securely"? Give concrete layers.

**A:** **Defense in depth** = multiple independent controls so one failure isn't catastrophic. For a transfer endpoint: TLS → CORS → rate limit → JWT auth guard → roles guard → DTO validation → object-level ownership check → DB user with least privilege → audit log. **Fail securely** = when something errors or is ambiguous, default to _deny_: a guard that throws returns 403 (not "allow"), a missing tenant scope returns nothing (not "all rows").

**Tip:** The anti-pattern is a `try/catch` that swallows an authZ error and continues — failing _open_. Always fail closed.

### Q37: What is the difference between route-level (function) authZ and object-level authZ, and why do you need both?

**A:** **Function-level** (RBAC) answers "can this _role_ call this endpoint?" — e.g. only `admin` can call `DELETE /users/:id`. **Object-level** answers "can this _specific user_ act on this _specific resource_?" — e.g. a regular user can call `GET /accounts/:id` but only for _their own_ account. RBAC alone fails to stop IDOR (any logged-in user could read any account). Object-level alone fails to stop a non-admin reaching admin-only functions. You need both layers.

**Tip:** Pharmacy FEFO's tenant isolation is object-level: even within an allowed role, the query is scoped to the caller's tenant, so cross-tenant reads are structurally impossible.

### Q38: How do you handle dependency supply-chain risk beyond `npm audit`?

**A:** `npm audit` only catches _known_ CVEs. Broader hygiene: commit the lockfile and use `npm ci` (integrity-hash verified installs); enable Dependabot/Snyk for automated upgrade PRs; **minimise dependencies** (every package is attack surface); pin and review new deps before adding; watch for **typosquatting** (`expresss`, `lodahs`) and dependency confusion (private package names being hijacked on the public registry); avoid `postinstall` scripts from untrusted packages; consider `npm install --ignore-scripts` in CI where feasible.

**Tip:** Mention the real incidents pattern (event-stream, ua-parser-js) — supply-chain compromises ship malicious code that runs with your app's privileges.

### Q39: A request to `GET /reports/:tenantId/summary` — what could go wrong and how do you lock it down?

**A:** The `tenantId` is client-supplied, so without a check any authenticated user can read another tenant's reports (BOLA across tenants). Lock it down by ignoring the URL's tenant for authorization and deriving the scope from the verified token, or asserting equality:

```ts
@Get(':tenantId/summary')
@UseGuards(JwtAuthGuard)
async summary(@Param('tenantId') tenantId: string, @CurrentUser() u: AuthUser) {
  if (u.tenantId !== tenantId) throw new ForbiddenException();
  return this.reports.summary(u.tenantId); // always scope to the verified tenant
}
```

**Tip:** The strongest pattern is to **not take tenant from the URL at all** for data scoping — derive it from the authenticated principal so it can't be tampered with. This is the Pharmacy FEFO discipline applied to reporting.

---

## Secure-Coding Checklist for a NestJS + MongoDB API

Run through this before shipping a fintech endpoint/service:

**Input & validation**

- [ ] Every DTO uses `class-validator`; global `ValidationPipe` has `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- [ ] No `new Model(req.body)` or `{ ...req.body }` into a query/save (mass-assignment safe).
- [ ] String fields can't arrive as objects (NoSQL-injection safe); `express-mongo-sanitize` enabled; no `$where`/server-side JS.
- [ ] Body size limits set; file uploads validate magic-byte type + size and store outside web root.

**AuthN / AuthZ**

- [ ] Every protected route has a JWT guard; JWT verification pins `algorithms` and checks `exp`/`iss`/`aud`.
- [ ] Function-level RBAC via `RolesGuard` **and** object-level ownership/tenant checks on every resource query.
- [ ] No PII/secrets in the JWT payload; access tokens short-lived; refresh tokens rotated with reuse detection; sessions revocable.
- [ ] Passwords hashed with argon2id (or bcrypt ≥ 12); login rate-limited; generic auth errors (no user enumeration); MFA available.

**Output & errors**

- [ ] `ClassSerializerInterceptor` + `@Exclude()` so password/refresh hashes never serialise.
- [ ] Global exception filter hides stack traces/DB errors in prod; `x-powered-by` disabled.

**Transport & headers**

- [ ] TLS enforced + HSTS; helmet enabled (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
- [ ] CORS is an explicit origin allow-list; `credentials: true` only with a fixed origin.
- [ ] Cookies (if used) are `HttpOnly` + `Secure` + `SameSite`; CSRF protection if cookie-auth.

**Data & crypto**

- [ ] Sensitive PII field-encrypted (AES-GCM/CSFLE); secure random via `crypto`, never `Math.random()`.
- [ ] No home-grown crypto; IVs unique per encryption.

**Secrets & config**

- [ ] `.env` git-ignored; history scanned with gitleaks; secrets injected at runtime; `@nestjs/config` validates required env at boot.
- [ ] DB user scoped to least privilege; separate secrets per environment; rotation plan exists.

**Dependencies & containers**

- [ ] Lockfile committed; `npm ci` in CI/Docker; `npm audit` clean; Dependabot/Snyk on.
- [ ] Dockerfile: multi-stage, alpine/distroless, non-root `USER`, `.dockerignore` excludes `.env`/`.git`, no secrets in layers; image scanned (Trivy); runtime `--read-only --cap-drop ALL --security-opt no-new-privileges`.

**Logging & monitoring**

- [ ] Security events (auth failures, authZ denials, financial actions) logged with no secrets/PII/tokens/card data.
- [ ] Logs centralised, append-only/tamper-evident, with alerting on anomalies (audit trail per file 23).

**Design**

- [ ] Money-movement endpoints have idempotency keys, per-transaction/daily limits, and use Mongo multi-doc transactions for atomicity.
- [ ] Outbound URL fetches (SSRF) are host-allow-listed and block private/link-local IP ranges.

---

## Common Mistakes / Red Flags

- **Trusting the front end** — "the UI hides it" treated as access control.
- **Spreading `req.body`** into a Mongoose model or query (mass assignment + NoSQL injection in one).
- **Route-level RBAC without object-level checks** — admin guard present, but `findById(id)` lets users read each other's accounts (IDOR).
- **Calling Base64 "encryption,"** or _encrypting_ passwords instead of hashing them.
- **Fast/unsalted password hashes** (MD5/SHA-256), or bcrypt with cost 8.
- **Accepting the JWT's own `alg`** header (lets through `alg:none` / RS256→HS256 confusion); not verifying `exp`/`aud`/`iss`.
- **PII/secrets stuffed into the JWT payload** (it's only Base64, fully readable).
- **CORS `origin: '*'` with `credentials: true`**, or reflecting the request Origin blindly.
- **Returning the full user document** — leaking `passwordHash`/`refreshTokenHash` because no serializer.
- **Stack traces / raw Mongo errors returned to clients** in production.
- **`.env` committed to git**, or secrets baked into Docker image layers.
- **Container running as root**, single-stage image shipping build tools, `COPY . .` with no `.dockerignore`.
- **No rate limiting on `/auth/login`** → brute-force/credential-stuffing open.
- **Logging tokens/passwords/card numbers** — or no security logging at all (breach goes undetected).
- **Failing open** — a `try/catch` around an authZ check that continues on error.
- **`Math.random()` for tokens**, reused IVs, rolling your own crypto.
- **No idempotency on payment endpoints** → duplicate charges on retry.
- **Fetching user-supplied URLs** without SSRF protection (cloud metadata exposure).

---

## Further Reading

- OWASP Top 10 (2021): https://owasp.org/Top10/
- OWASP Cheat Sheet Series (Node.js, NoSQL injection, Password Storage, REST Security): https://cheatsheetseries.owasp.org/
- OWASP API Security Top 10 (BOLA/BFLA — directly relevant to fintech APIs): https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- Node.js Best Practices — Security section: https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices
