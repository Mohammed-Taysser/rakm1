# Express.js (42 questions)

> Express is the de-facto minimal web framework for Node.js and the "E" in MERN. It gives you routing, middleware, and request/response helpers on top of Node's raw `http` module without dictating structure — which is exactly why understanding it well matters: you own the architecture. Across your backends — **Foody** (food ordering), **Trust-Node**, **Whats-Add**, the **email APIs**, and e-commerce backends like **Rosine** — you've leaned on the same toolkit repeatedly: JWT auth middleware, Zod validation middleware, a centralized `AppError` + global error handler, Multer uploads, CORS/helmet/rate-limit hardening, and a layered routes → controllers → services structure in TypeScript. This file drills every piece an interviewer will probe.

## Quick Revision Checklist

- Express is **unopinionated** middleware + routing on top of Node's `http` module; `app` is a request handler you pass to `http.createServer` (or `app.listen` does it for you).
- **Middleware signature** is `(req, res, next)`; **error middleware** is `(err, req, res, next)` — four args, and Express identifies it by arity.
- **Order matters**: middleware runs top-to-bottom in the order registered; a request stops when something sends a response or you stop calling `next()`.
- `express.json()` and `express.urlencoded()` are built-in body parsers — without them `req.body` is `undefined`.
- Route params (`/:id` → `req.params`), query string (`?q=` → `req.query`), body (`req.body`), headers (`req.headers` / `req.get()`).
- Centralize errors: one **global error handler** at the end + a custom **`AppError`** class with `statusCode`/`isOperational`.
- Wrap async handlers (`asyncHandler` / `express-async-handler`) so rejected promises reach the error handler — **don't** scatter try/catch in every route.
- Auth middleware verifies JWT, attaches **`req.user`**; `restrictTo(...roles)` enforces authorization after `protect`.
- Validation middleware: `validate(schema)` parses `req` with Zod/Joi and forwards `ZodError` to the error handler.
- Security stack: **helmet** (headers), **cors** (cross-origin), **express-rate-limit** (abuse), **compression** (gzip).
- Logging: **morgan** for HTTP access logs (dev/combined), **winston** for structured app logs.
- Uploads: **Multer** (`single`/`array`/`fields`), disk vs memory storage, `fileFilter` + `limits` for validation.
- Cookies/sessions: **cookie-parser** reads `req.cookies`; **express-session** for server-side sessions; JWT in httpOnly cookies is common.
- Structure: routes → controllers → services → models (MVC-ish), `dotenv` for config, version under `/api/v1`, a 404 handler before the error handler.
- Test with **Supertest** (`request(app).get(...)`); Express is more manual than NestJS/Fastify but maximally flexible.

## Basic

### Q1: What is Express.js and why use it over raw Node `http`?

**A:** Express is a minimal, unopinionated web framework for Node. Raw Node `http` gives you a single request handler and forces you to manually parse URLs, match methods/paths, parse bodies, and chain logic. Express adds **routing** (`app.get`, `app.post`, params), **middleware** (composable `(req, res, next)` functions), and **helpers** on `req`/`res` (`res.json`, `req.params`). It does _not_ impose project structure, an ORM, or a DI container — you bring those.

**Tip:** Say "unopinionated middleware + routing layer over the `http` module." That one phrase signals you understand its scope.

### Q2: How does Express sit on top of Node's `http` module?

**A:** `express()` returns an `app` function with the signature `(req, res)` — the exact shape Node's `http.createServer` expects. So `http.createServer(app).listen(3000)` works, and `app.listen(3000)` is just sugar that does that internally. Express extends Node's native `req` (IncomingMessage) and `res` (ServerResponse) prototypes with extra methods like `res.json()` and properties like `req.params`.

**Tip:** "`app` is itself a `(req,res)` handler" is the key insight interviewers look for.

### Q3: Show a minimal Express app setup.

**A:**

```ts
import express from "express";
const app = express();

app.use(express.json()); // body parser
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
```

**Tip:** `app.listen` returns the underlying `http.Server` — keep a reference for graceful shutdown.

### Q4: How do you define routes for different HTTP methods?

**A:** `app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`, plus `app.all` (any method) and `app.use` (any method + prefix match). Each takes a path and one-or-more handlers.

```ts
app.get("/users", listUsers);
app.post("/users", createUser);
app.route("/users/:id").get(getUser).patch(updateUser).delete(deleteUser);
```

**Tip:** `app.route(path)` chains handlers for one path — keeps RESTful resources tidy.

### Q5: What's the difference between route params, query params, and body?

**A:** **Route params** are named URL segments: `/users/:id` → `req.params.id`. **Query params** come after `?`: `/users?page=2&limit=10` → `req.query.page`. **Body** is the request payload (JSON/form): `req.body` (requires a body-parser). Params identify a resource, query filters/paginates, body carries data to create/update.

**Tip:** `req.query` and `req.params` values are always strings (or arrays/objects) — cast/validate them; this is exactly what Zod's `coerce` handles.

### Q6: What is `express.json()` / `express.urlencoded()` and why are they needed?

**A:** They're built-in middleware that parse the raw request stream into `req.body`. `express.json()` parses `application/json`; `express.urlencoded({ extended: true })` parses `application/x-www-form-urlencoded` (HTML forms). Without them `req.body` is `undefined`. `extended: true` uses the `qs` library to allow nested objects.

**Tip:** Set a body limit (`express.json({ limit: "1mb" })`) to prevent large-payload DoS — interviewers like that touch.

### Q7: How do you serve static files?

**A:** `app.use(express.static("public"))` serves files from `public/` at the root URL. You can mount under a path: `app.use("/static", express.static(path.join(__dirname, "public")))`.

**Tip:** Use an absolute path with `path.join(__dirname, ...)` so it works regardless of the process CWD.

### Q8: What are the most common `res` methods?

**A:** `res.json(obj)` (sends JSON + sets Content-Type), `res.status(code)` (sets status, chainable), `res.send(body)` (string/buffer/object), `res.redirect(url)`, `res.sendStatus(204)`, `res.cookie()`, `res.set()/res.append()` for headers, `res.end()`. You can only send **one** response per request.

**Tip:** `res.status(201).json(...)` — `status` returns `res`, so chaining works. Calling two send methods throws "Cannot set headers after they are sent."

### Q9: What are the most common `req` properties?

**A:** `req.params`, `req.query`, `req.body`, `req.headers` (or `req.get("authorization")`), `req.cookies` (with cookie-parser), `req.method`, `req.path`, `req.originalUrl`, `req.ip`, and custom props you attach in middleware like `req.user`.

**Tip:** Use `req.get(name)` over `req.headers[name]` — it's case-insensitive and clearer.

### Q10: What is a 404 handler and where does it go?

**A:** Express tries routes/middleware in order; if nothing matches, you add a catch-all _after_ all routes:

```ts
app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
```

**Tip:** It must come **after** all real routes but **before** the global error handler.

## Intermediate

### Q11: What exactly is middleware?

**A:** A function with access to `req`, `res`, and `next` that runs during the request-response cycle. It can: run code, mutate `req`/`res`, end the cycle by sending a response, or pass control with `next()`. Middleware is the core abstraction — routing handlers, parsers, auth, logging are all middleware.

**Tip:** "Everything in Express is middleware" is a fair summary; routes are just middleware bound to a method+path.

### Q12: Why does middleware order matter? Give an example.

**A:** Express executes middleware in **registration order**. If `express.json()` is registered _after_ a route, that route won't see `req.body`. If a logging middleware is registered after the response is sent, it won't run. Auth middleware must come before protected routes.

```ts
app.use(express.json()); // must be first so routes get req.body
app.use(logger);
app.use("/api/v1/users", protect, userRouter); // protect runs before router
```

**Tip:** Think of it as a pipeline — each request flows down until something responds or `next(err)` jumps to the error handler.

### Q13: What are the categories of middleware?

**A:**

1. **Application-level** — `app.use(fn)` / `app.METHOD(fn)`.
2. **Router-level** — same but on an `express.Router()`.
3. **Built-in** — `express.json`, `express.urlencoded`, `express.static`.
4. **Third-party** — `cors`, `helmet`, `morgan`, `multer`.
5. **Error-handling** — the special 4-arg `(err, req, res, next)`.

**Tip:** Knowing all five categories by name is a quick credibility signal.

### Q14: What is router-level middleware and how do you mount routers?

**A:** `express.Router()` creates a mini-app you attach middleware/routes to, then mount under a prefix:

```ts
// routes/user.routes.ts
const router = express.Router();
router.use(protect); // applies to all routes below
router.get("/", getUsers);
router.get("/:id", getUser);
export default router;

// app.ts
app.use("/api/v1/users", userRouter); // mounting
```

**Tip:** Mounting keeps files small and lets you version (`/api/v1`) or feature-scope routes.

### Q15: What is the 4-argument error-handling middleware and how does Express recognize it?

**A:** Error middleware has the signature `(err, req, res, next)`. Express detects it purely by **function arity** (4 parameters). It's only invoked when something calls `next(err)` or throws synchronously in a handler. It must be registered **last**.

```ts
app.use((err, req, res, next) => {
  res
    .status(err.statusCode ?? 500)
    .json({ status: "error", message: err.message });
});
```

**Tip:** If you omit any of the 4 params, Express treats it as normal middleware and it won't catch errors — even `next` must be present.

### Q16: Show a custom `AppError` class.

**A:**

```ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: "fail" | "error";
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true; // distinguishes expected vs programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Tip:** `isOperational` lets the global handler decide whether to leak the message (expected errors) or return a generic 500 (bugs) in production.

### Q17: Show a centralized global error handler.

**A:**

```ts
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }
  if (err instanceof AppError && err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }
  // unknown / programmer error — don't leak details
  console.error("UNEXPECTED ERROR", err);
  return res
    .status(500)
    .json({ status: "error", message: "Something went wrong" });
};
```

**Tip:** One place to map JWT errors, Mongoose CastError/duplicate-key, Zod errors → clean responses. Register it last with `app.use(globalErrorHandler)`.

### Q18: How do you handle async errors? Why is try/catch in every route bad?

**A:** A rejected promise in an `async` handler is **not** automatically forwarded to Express's error handler (in Express 4). Wrapping every route in try/catch is repetitive, error-prone, and clutters business logic. Instead use an `asyncHandler` wrapper (or `express-async-handler`) that catches rejections and calls `next(err)`:

```ts
import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// usage
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id); // throws AppError if not found
    res.json({ status: "success", data: user });
  }),
);
```

**Tip:** Express 5 auto-forwards rejected promises, so wrappers become optional there — mention that if asked about versions.

### Q19: Show a Zod validation middleware.

**A:**

```ts
import { AnyZodObject } from "zod";
import { RequestHandler } from "express";

export const validate =
  (schema: AnyZodObject): RequestHandler =>
  (req, res, next) => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body ?? req.body; // parsed/coerced data
    next(); // ZodError thrown -> caught by asyncHandler/error handler
  };

// schema
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

router.post("/", validate(createUserSchema), asyncHandler(createUser));
```

**Tip:** Validate `body`/`query`/`params` together; use `safeParse` if you want to format errors yourself, or let `parse` throw and centralize handling.

### Q20: Show a JWT auth middleware that attaches `req.user`.

**A:**

```ts
import jwt from "jsonwebtoken";

export const protect: RequestHandler = asyncHandler(async (req, res, next) => {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer "))
    throw new AppError("Not authenticated", 401);

  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    id: string;
    role: string;
  };

  const user = await userService.getById(decoded.id);
  if (!user) throw new AppError("User no longer exists", 401);

  req.user = user; // augment Express.Request type via declaration merging
  next();
});
```

For TypeScript, extend the Request type:

```ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}
```

**Tip:** `jwt.verify` throws `TokenExpiredError`/`JsonWebTokenError` — map those in the global handler to 401s.

### Q21: Show role-based authorization (`restrictTo`).

**A:**

```ts
export const restrictTo =
  (...roles: string[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("You do not have permission for this action", 403);
    }
    next();
  };

router.delete("/:id", protect, restrictTo("admin"), asyncHandler(deleteUser));
```

**Tip:** `protect` (authentication: who are you) always runs before `restrictTo` (authorization: are you allowed). 401 = not logged in, 403 = logged in but forbidden.

### Q22: What is CORS and how do you configure it?

**A:** CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks requests from a different origin unless the server opts in via response headers (`Access-Control-Allow-Origin`, etc.). The `cors` package sets these:

```ts
import cors from "cors";
app.use(
  cors({
    origin: ["https://app.foody.com", "http://localhost:5173"],
    credentials: true, // allow cookies / Authorization
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
```

**Tip:** With `credentials: true` you **cannot** use `origin: "*"` — you must specify exact origins. The browser sends a **preflight** `OPTIONS` request for non-simple requests; `cors` handles it automatically.

### Q23: What does helmet do?

**A:** `helmet` sets security-related HTTP headers with sensible defaults — `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Frame-Options`, hides `X-Powered-By`, etc. It reduces common attack surface (XSS, clickjacking, MIME-sniffing).

```ts
import helmet from "helmet";
app.use(helmet());
```

**Tip:** It's not a silver bullet — it sets headers; you still validate input and escape output. Mention CSP tuning for apps serving inline scripts.

### Q24: How do you add rate limiting?

**A:** `express-rate-limit` counts requests per IP in a window and rejects over the threshold:

```ts
import rateLimit from "express-rate-limit";
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // per IP
  standardHeaders: true,
  message: { status: "fail", message: "Too many requests, try later" },
});
app.use("/api", apiLimiter);
```

**Tip:** Apply a stricter limiter to `/auth/login` to slow brute-force. Behind a proxy/load-balancer set `app.set("trust proxy", 1)` so the real client IP is used.

### Q25: What does the compression middleware do?

**A:** `compression()` gzips/deflates responses, shrinking payload size and improving transfer time for JSON/text. It negotiates via the `Accept-Encoding` header.

```ts
import compression from "compression";
app.use(compression());
```

**Tip:** Skip compression for already-compressed assets (images) — it wastes CPU; libraries handle this via the `filter` option.

### Q26: How do you log requests (morgan) vs app events (winston)?

**A:** **morgan** logs each HTTP request (method, path, status, response time): `app.use(morgan("dev"))` in dev, `morgan("combined")` in prod. **winston** is a general structured logger for app-level events/errors with levels and transports (console, file, external). Combine them by piping morgan into winston's stream.

**Tip:** In production log JSON to stdout (12-factor) and let the platform aggregate; avoid `console.log` for anything you need to query.

## Advanced

### Q27: Walk through the Express request lifecycle.

**A:** 1) Node `http` server receives the request and calls `app(req, res)`. 2) Express runs the **middleware stack in order** — global middleware (json, cors, helmet, logger). 3) It matches the **route** by method + path; route-specific middleware (validate, protect) runs, then the handler. 4) The handler sends a response (`res.json`) **or** calls `next()`. 5) If no route matches, the **404 handler** fires. 6) If anything calls `next(err)` or throws, Express skips remaining normal middleware and jumps to the **error-handling middleware**. 7) Response is flushed; cleanup/finish events fire.

**Tip:** Emphasize the two "exits": send a response, or `next(err)` → error pipeline.

### Q28: What is `router.param` and when is it useful?

**A:** `router.param("id", fn)` registers middleware that runs whenever a route in that router has the `:id` param — great for loading a resource once:

```ts
router.param(
  "id",
  asyncHandler(async (req, res, next, id) => {
    const user = await userService.getById(id); // throws AppError if missing
    req.locals = { ...req.locals, user };
    next();
  }),
);
router.get("/:id", (req, res) => res.json({ data: req.locals.user }));
```

**Tip:** Centralizes "fetch-or-404" logic so individual handlers stay thin.

### Q29: Describe a clean layered project structure (MVC).

**A:**

```
src/
  routes/        user.routes.ts        // HTTP wiring, middleware
  controllers/   user.controller.ts    // parse req -> call service -> shape res
  services/      user.service.ts        // business logic, no req/res
  models/        user.model.ts          // Mongoose schema / DB access
  middleware/    auth.ts, validate.ts, error.ts
  utils/         AppError.ts, asyncHandler.ts
  config/        env.ts, db.ts
  app.ts         // build app, mount middleware + routers
  server.ts      // dotenv, connect DB, app.listen, graceful shutdown
```

**Tip:** The rule: **controllers know about `req`/`res`; services don't.** That makes services reusable (cron jobs, queues) and unit-testable.

### Q30: Show the controller → service separation.

**A:**

```ts
// user.service.ts  (pure logic, throws AppError, no req/res)
export const userService = {
  async getById(id: string) {
    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  },
  async create(data: CreateUserInput) {
    return User.create(data);
  },
};

// user.controller.ts  (HTTP adapter)
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ status: "success", data: { user } });
});
```

**Tip:** Controllers should be ~5 lines: read input, call service, send response. Logic creep into controllers is the most common structural smell.

### Q31: How do you keep a consistent API response shape?

**A:** Standardize success and error envelopes so clients parse uniformly:

```ts
// success
{ "status": "success", "data": { ... }, "meta": { "page": 1, "total": 42 } }
// fail (validation/client) / error (server)
{ "status": "fail", "message": "Email already in use", "errors": { ... } }
```

A small helper can enforce it:

```ts
export const sendSuccess = (res, data, status = 200, meta?) =>
  res.status(status).json({ status: "success", data, ...(meta && { meta }) });
```

**Tip:** Pair this with the global error handler so _every_ exit point — success or failure — uses the same contract.

### Q32: How do you "inject" services / dependencies in plain Express?

**A:** Express has no built-in DI, so common patterns are:

1. **module imports** of singleton services (simplest)
2. **factory functions** that take dependencies and return a router/controller (`makeUserRouter(userService)`) — great for swapping mocks in tests
3. attaching shared instances to `app.locals` or `req`

NestJS adds a full DI container; in raw Express you do it manually.

```ts
export const makeUserController = (service: UserService) => ({
  getUser: asyncHandler(async (req, res) =>
    res.json(await service.getById(req.params.id)),
  ),
});
```

**Tip:** Factory injection is the testability win — you pass a fake service without spinning up a DB.

### Q33: Show a complete Multer upload config with validation.

**A:**

```ts
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`,
    ),
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (!/image\/(png|jpe?g|webp)/.test(file.mimetype)) {
      return cb(new AppError("Only image files allowed", 400));
    }
    cb(null, true);
  },
});

router.post("/avatar", protect, upload.single("avatar"), uploadAvatar); // req.file
router.post("/gallery", upload.array("photos", 5), uploadGallery); // req.files
router.post(
  "/mixed",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "docs", maxCount: 3 },
  ]),
);
```

**Tip:** Use `multer.memoryStorage()` (gives `file.buffer`) when piping straight to S3/Cloudinary instead of disk. Catch Multer's own `MulterError` (e.g. `LIMIT_FILE_SIZE`) in your error handler.

### Q34: How do cookies and sessions work in Express?

**A:** **cookie-parser** populates `req.cookies` (and `req.signedCookies` if you pass a secret). You set cookies with `res.cookie("jwt", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge })`. **express-session** stores session state server-side (memory by default; use Redis/Mongo store in prod) and puts a session id cookie on the client; `req.session` holds the data.

```ts
app.use(cookieParser());
res.cookie("jwt", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
});
```

**Tip:** httpOnly cookies for JWTs mitigate XSS token theft (JS can't read them) but require CSRF protection; Authorization headers avoid CSRF but are readable by JS. Know the tradeoff.

### Q35: How do you configure environment variables?

**A:** Use `dotenv` loaded at the very top of the entry file (`import "dotenv/config"`), then read `process.env`. Best practice: validate env at startup with Zod so the app fails fast on misconfiguration:

```ts
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(1),
  MONGO_URI: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});
export const env = envSchema.parse(process.env);
```

**Tip:** Never commit `.env`; ship `.env.example`. Loading dotenv _before_ any module that reads env is a classic gotcha.

### Q36: How do you version routes?

**A:** Mount routers under a version prefix so breaking changes don't break existing clients:

```ts
app.use("/api/v1/users", userRouterV1);
app.use("/api/v2/users", userRouterV2);
```

**Tip:** URL versioning (`/api/v1`) is the most common and the easiest to cache/route. Header-based versioning exists but is harder to debug.

### Q37: How do you do graceful shutdown?

**A:** Capture the server handle, listen for termination signals and unhandled rejections, stop accepting new connections, then close DB/resources:

```ts
const server = app.listen(env.PORT);

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`);
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (err) => {
  console.error(err);
  server.close(() => process.exit(1));
});
```

**Tip:** `server.close()` finishes in-flight requests before exiting — important for zero-downtime deploys.

### Q38: How do you test Express apps with Supertest?

**A:** Export the `app` (separate from `server.ts` so you don't call `listen`), then drive it with Supertest:

```ts
import request from "supertest";
import { app } from "../src/app";

it("creates a user", async () => {
  const res = await request(app)
    .post("/api/v1/users")
    .send({ email: "a@b.com", password: "supersecret" })
    .expect(201);
  expect(res.body.status).toBe("success");
});
```

**Tip:** Supertest can take the `app` directly (no need to start a port). Separating `app` from `server` is the key to testability — interviewers probe this.

### Q39: Express vs Fastify vs Koa vs NestJS — when would you pick each?

**A:** **Express**: ubiquitous, huge ecosystem, unopinionated, callback-style middleware — but no built-in async error handling (pre-v5) or structure. **Fastify**: faster, schema-based validation/serialization built in, plugin system, great for performance-sensitive JSON APIs. **Koa** (by the Express team): tiny core, `async`/`await` + context (`ctx`) instead of `(req,res,next)`, you assemble everything from middleware. **NestJS**: opinionated, TypeScript-first, full DI container, decorators, modules — structure out of the box, often built on top of Express or Fastify; best for large teams/enterprise.

**Tip:** Summarize as a spectrum: Koa (minimal) → Express (standard) → Fastify (perf + schemas) → Nest (batteries-included/opinionated).

### Q40: What changed between Express 4 and Express 5?

**A:** Express 5 (now stable) **auto-forwards rejected promises** from async handlers to the error handler (no wrapper needed), updates path-matching (stricter route patterns, no more bare `*` — use named wildcards), drops some deprecated methods (`res.json(status, obj)` signature, `app.del`), and requires newer Node versions.

**Tip:** Even with Express 5's async support, an explicit `asyncHandler` is still fine and keeps behavior obvious.

### Q41: How do you handle a request that needs to short-circuit (e.g., caching) in middleware?

**A:** A middleware can end the cycle by sending a response and simply _not_ calling `next()`:

```ts
app.use((req, res, next) => {
  const cached = cache.get(req.originalUrl);
  if (cached) return res.json(cached); // short-circuit, downstream never runs
  next();
});
```

**Tip:** The contract: send a response OR call `next()` — never both, never neither (the latter hangs the request).

### Q42: How do `app.use` paths and route matching differ?

**A:** `app.use("/api", fn)` matches any request whose path **starts with** `/api` (prefix match) and strips the prefix from `req.url` inside the middleware. `app.get("/api", fn)` matches the path **exactly** (with the method). That's why routers mounted with `app.use` see paths relative to the mount point.

**Tip:** This prefix-stripping is why a router defines `router.get("/")` for the mount root — it doesn't repeat `/api/v1/users`.

## Common Mistakes / Red Flags

- **Forgetting `express.json()`** then wondering why `req.body` is `undefined`.
- **Async handler without a wrapper** (Express 4): the promise rejects, nothing calls `next(err)`, the request hangs until timeout. Use `asyncHandler`/`express-async-handler`.
- **try/catch in every route** instead of centralizing — duplicated, inconsistent error shapes.
- **Error handler not last**, or missing one of the 4 params, so it never catches anything.
- **Wrong middleware order** — registering body parser/CORS/auth after the routes that need them.
- **Sending two responses** ("Cannot set headers after they are sent") — usually a missing `return` before `res.json` in a branch.
- **`origin: "*"` with `credentials: true`** — browsers reject it; cookies won't be sent.
- **Logic in controllers / `req`,`res` in services** — couples business logic to HTTP, kills testability.
- **No input validation** — trusting `req.body`/`req.query`; always validate (Zod/Joi) at the boundary.
- **Secrets in code or committed `.env`**, no startup env validation.
- **No rate limiting on auth endpoints**, no helmet, leaking stack traces / error details in production responses.
- **Not setting `trust proxy`** behind a load balancer — rate limiting and `req.ip` use the proxy IP.
- **Calling `app.listen` inside the same module you test** — extract `app` so Supertest can import it without binding a port.
- **Multer without `limits`/`fileFilter`** — unbounded uploads and arbitrary file types.

## Further Reading

- Express official guide & API reference: https://expressjs.com/en/guide/routing.html
- Express error handling: https://expressjs.com/en/guide/error-handling.html
- Multer (file uploads): https://github.com/expressjs/multer
- Helmet security headers: https://helmetjs.github.io/
