# Testing (60 questions)

> Testing is one of the most common dividers between junior and mid/senior candidates in interviews. Anyone can write code that works once on their machine; engineers who can prove it works, keep it working, and catch regressions are worth more. This file maps to the user's real stack: **Jest + Supertest** for the Node/Express backends (Foody, Pharmacy FEFO, Hirely), **Vitest** for Trust-Node, **Cypress e2e + Jest** for Admin Coffee, and **Husky pre-commit + lint-staged** wired into many repos to run lint/tests before code ever lands. Expect questions on the testing pyramid, mocking, async testing, React Testing Library, Supertest, integration tests against a DB, and flakiness. Be able to _show_ a test, not just describe one.

## Quick Revision Checklist

- **Testing pyramid**: many unit, fewer integration, very few e2e. Frontend often uses the **testing trophy** (more integration).
- **Unit vs integration vs e2e**: scope of what's real. Unit = one piece isolated. Integration = pieces together. E2e = whole app through the UI.
- **AAA / Given-When-Then**: every test has Arrange, Act, Assert.
- **FIRST**: Fast, Independent/Isolated, Repeatable, Self-validating, Timely.
- **Test doubles**: dummy, stub, spy, mock, fake — know the distinctions.
- **Mock at boundaries** (network, DB, time, randomness), not internal logic. Over-mocking tests nothing.
- **Jest core**: `describe`/`it`, `expect` + matchers, `beforeEach`/`afterEach`, `test.each`, `jest.fn`, `jest.mock`, `jest.spyOn`, `mockResolvedValue`, fake timers, `--coverage`.
- **Vitest** = Jest-compatible API, Vite-native, faster, ESM-first. Drop-in for Vite projects.
- **Async tests**: `async/await`, or `expect(promise).resolves` / `.rejects`. Always `return`/`await` the assertion.
- **React Testing Library**: test behavior, not implementation. `getBy`/`queryBy`/`findBy`, prefer `userEvent` over `fireEvent`, mock the network with **MSW**.
- **Supertest**: `request(app).post('/x').set('Authorization', ...).expect(201)` — test routes without a live server.
- **Integration tests** need a real-ish DB: test container / in-memory / dedicated test DB, with cleanup or transactions between tests.
- **Coverage**: line/branch/statement/function. 100% is not the goal; coverage measures execution, not correctness.
- **Flaky tests** come from time, order-dependence, network, async races, shared state. Fix the root cause; don't just retry.
- **TDD** = red → green → refactor. **Husky + lint-staged** run lint/tests pre-commit to keep `main` green.
- **What to test**: behavior, edge cases, error paths, contracts. **What not to**: framework internals, trivial getters, third-party libs.

## Basic

### Q1: Why do we write automated tests at all?

**A:** To get fast, repeatable confidence that code behaves correctly and stays correct as it changes. Manual testing doesn't scale and doesn't run on every commit. Tests act as a safety net for refactoring, executable documentation of intended behavior, and a regression guard so a fixed bug stays fixed. They also push you toward better design — code that's hard to test is usually hard to use.

**Tip:** In interviews frame it as "confidence to change code fast," not "because we should." That's the engineer's reason.

### Q2: What is the testing pyramid?

**A:** A guideline for the _proportion_ of test types. Bottom = many fast, cheap **unit tests**. Middle = fewer **integration tests** that check pieces working together. Top = a handful of slow, expensive **end-to-end (e2e)** tests through the full system. The shape reminds you to lean on cheap tests and use expensive ones sparingly, because e2e tests are slow and flaky.

**Tip:** Rough proportions people quote: ~70% unit, ~20% integration, ~10% e2e — but treat them as direction, not law.

### Q3: What's the "testing trophy" and how does it differ from the pyramid?

**A:** Coined by Kent C. Dodds for frontend. From bottom to top: static analysis (TS/ESLint), unit, **integration (the big middle bulge)**, e2e. The idea is integration tests give the best confidence-per-effort for UIs, so you write more of them than pure unit tests — the opposite emphasis from the classic pyramid.

**Tip:** Mention static analysis as the base — TypeScript and ESLint catch a whole class of bugs before any test runs.

### Q4: What's the difference between unit, integration, and e2e tests?

**A:** It's about how much is _real_ vs mocked. **Unit**: one function/module in isolation, dependencies mocked — fast, pinpoints failures. **Integration**: multiple units together, often with a real DB or real module wiring — catches bugs in the seams. **E2e**: the whole app driven like a user (browser → API → DB) — highest confidence, slowest, flakiest.

**Tip:** A Supertest call hitting an Express route plus a real test DB is integration. A Cypress test clicking through the browser is e2e.

### Q5: What is the AAA pattern?

**A:** **Arrange-Act-Assert**: set up data and state (Arrange), perform the action under test (Act), then verify the outcome (Assert). It keeps tests readable and focused on one behavior. The BDD-style equivalent is **Given-When-Then**.

**Tip:** One logical assertion target per test. If you're asserting three unrelated things, that's probably three tests.

### Q6: What are the FIRST principles of a good test?

**A:** **F**ast (runs in ms so you run it often), **I**ndependent/Isolated (no reliance on other tests or order), **R**epeatable (same result every run, any environment), **S**elf-validating (pass/fail automatically, no human reading logs), **T**imely (written close to the code, ideally before/with it).

**Tip:** "Independent" is the one that bites people — tests that share mutable state break when run in a different order or in parallel.

### Q7: What makes a test bad?

**A:** Slow, order-dependent, non-deterministic (flaky), testing implementation details so it breaks on every refactor, unclear failure messages, over-mocked so it asserts nothing real, or testing multiple unrelated behaviors at once.

**Tip:** "If the test fails, can I tell _what_ broke from the name and message alone?" If not, it's a bad test.

### Q8: What's the difference between `test`/`it`, `describe`, and `expect` in Jest?

**A:** `describe` groups related tests into a suite. `it` (alias `test`) defines a single test case. `expect(value)` creates an assertion you chain matchers onto (`.toBe`, `.toEqual`, etc.).

```js
describe("add", () => {
  it("sums two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

**Tip:** `it('does X')` reads like a sentence: "it does X." Name tests by behavior, not by function name.

### Q9: What's the difference between `toBe` and `toEqual`?

**A:** `toBe` uses `Object.is` (reference/identity for objects, strict equality for primitives). `toEqual` does a deep recursive value comparison. Use `toBe` for primitives and same-reference checks; use `toEqual` (or `toStrictEqual`) for objects/arrays by value.

**Tip:** `toStrictEqual` is stricter — it also checks `undefined` properties and types (e.g. distinguishes a class instance from a plain object).

### Q10: What are `beforeEach`, `afterEach`, `beforeAll`, `afterAll`?

**A:** Lifecycle hooks. `beforeAll`/`afterAll` run once per file (or describe block) — good for expensive setup like opening a DB connection. `beforeEach`/`afterEach` run around _every_ test — good for resetting state, clearing mocks, truncating tables, so each test starts clean.

**Tip:** Put `jest.clearAllMocks()` (or `vi.clearAllMocks()`) in `afterEach` so mock call history doesn't leak between tests.

### Q11: How do you test asynchronous code in Jest?

**A:** Use `async/await` and return/await the promise so Jest waits. For promises you can also assert on `.resolves`/`.rejects`.

```js
it("fetches a user", async () => {
  await expect(getUser(1)).resolves.toEqual({ id: 1, name: "Ada" });
});
it("rejects on missing user", async () => {
  await expect(getUser(999)).rejects.toThrow("Not found");
});
```

**Tip:** The classic bug is forgetting to `await`/`return` — the test "passes" before the assertion runs. Always await async assertions.

### Q12: What are the common pitfalls when testing async code with Jest?

**A:** Four recurring traps. (1) **Forgetting to `await`/`return` an async assertion** — `expect(p).rejects.toThrow()` without `await` resolves to a pending promise that Jest never sees, so the test passes even when the assertion would fail. (2) **Fake timers don't flush microtasks** — `jest.advanceTimersByTime` moves timers forward but does NOT resolve pending promises; use `await jest.advanceTimersByTimeAsync(...)` or a `flushPromises()` helper. (3) **"Sometimes passes" tests are races** — never `setTimeout` for an arbitrary delay; assert on observable state and let auto-retrying queries wait. (4) **Hanging tests** — an open DB connection/timer/socket keeps the process alive; diagnose with `--detectOpenHandles`, fix by closing in `afterAll`, with `--forceExit` as a last resort.

```ts
// (2) timers + promises: advance synchronously, then flush microtasks
const flushPromises = () => new Promise(setImmediate);

it("debounces and resolves", async () => {
  jest.useFakeTimers();
  const p = debouncedFetch(); // schedules a setTimeout then awaits fetch
  await jest.advanceTimersByTimeAsync(300); // advances AND flushes
  await expect(p).resolves.toEqual({ ok: true });
});
```

```ts
// (4) close resources so Jest can exit cleanly
afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});
```

**Tip:** Naming `--detectOpenHandles` and `advanceTimersByTimeAsync` unprompted signals real Jest experience — most people only know `useFakeTimers`.

### Q13: How do you run coverage in Jest?

**A:** `jest --coverage`. It instruments the code and reports line, branch, statement, and function coverage. You can enforce minimums via `coverageThreshold` in config so CI fails below a floor.

**Tip:** Be ready to say coverage is a _floor and a smell detector_, not a quality guarantee — covered code can still be wrong.

## Intermediate

### Q14: Explain the five test doubles: dummy, stub, spy, mock, fake.

**A:** From Gerard Meszaros's taxonomy:

- **Dummy**: passed to satisfy a signature, never actually used.
- **Stub**: returns canned/preset responses to calls (e.g. always returns `{id:1}`).
- **Spy**: a stub that _also records_ how it was called (args, call count) so you can assert on interactions.
- **Mock**: pre-programmed with expectations; it _verifies_ it was called the right way and fails if not.
- **Fake**: a working but lightweight implementation (e.g. an in-memory DB instead of Postgres).

**Tip:** Jest blurs these — `jest.fn()` can act as stub, spy, or mock depending on how you configure and assert on it. Knowing the conceptual difference still impresses interviewers.

### Q15: When and why should you mock?

**A:** Mock at the _boundaries_ of the unit you're testing: network calls, databases, the filesystem, the clock, randomness, and third-party services. Reasons: speed, determinism, isolation, and the ability to simulate hard-to-trigger conditions (timeouts, 500s, edge data).

**Tip:** Don't mock what you're testing, and don't mock things you don't own deep in the stack — wrap them and mock your wrapper.

### Q16: What is the over-mocking pitfall?

**A:** Mocking so much that the test only verifies your mocks return what you told them to — it no longer exercises real behavior. You get green tests that pass even when the real integration is broken, and they break on every refactor because they're coupled to implementation details.

**Tip:** Symptom: the test mirrors the implementation line-for-line. Prefer fewer mocks + real collaborators (integration style) when feasible.

### Q17: How do `jest.fn()`, `jest.mock()`, and `jest.spyOn()` differ?

**A:**

- `jest.fn()` creates a standalone mock function you control (`mockReturnValue`, `mockResolvedValue`) and assert on (`toHaveBeenCalledWith`).
- `jest.mock('./module')` auto-mocks an entire module so imports of it get mock functions — used to replace a dependency module wholesale.
- `jest.spyOn(obj, 'method')` wraps an existing method so you can observe it (and optionally `.mockImplementation` it), with the option to restore the original later.

**Tip:** Use `spyOn` when you want to keep the real object but watch/override one method; use `jest.mock` to replace a whole imported module.

### Q18: Show a Jest unit test with mocking using `jest.fn` and `spyOn`.

**A:**

```js
// service.js
export class OrderService {
  constructor(paymentGateway, logger) {
    this.paymentGateway = paymentGateway;
    this.logger = logger;
  }
  async checkout(order) {
    if (order.total <= 0) throw new Error("Invalid total");
    const receipt = await this.paymentGateway.charge(order.total);
    this.logger.info(`Charged ${order.total}`);
    return { ...order, receiptId: receipt.id };
  }
}

// service.test.js
import { OrderService } from "./service.js";

describe("OrderService.checkout", () => {
  it("charges the gateway and returns a receipt id", async () => {
    // Arrange
    const gateway = { charge: jest.fn().mockResolvedValue({ id: "rcpt_1" }) };
    const logger = { info: jest.fn() };
    const service = new OrderService(gateway, logger);

    // Act
    const result = await service.checkout({ id: "o1", total: 50 });

    // Assert
    expect(gateway.charge).toHaveBeenCalledWith(50);
    expect(result.receiptId).toBe("rcpt_1");
    expect(logger.info).toHaveBeenCalledTimes(1);
  });

  it("throws on non-positive total without charging", async () => {
    const gateway = { charge: jest.fn() };
    const service = new OrderService(gateway, { info: jest.fn() });
    await expect(service.checkout({ id: "o2", total: 0 })).rejects.toThrow(
      "Invalid total",
    );
    expect(gateway.charge).not.toHaveBeenCalled();
  });
});
```

This injects collaborators (dependency injection) so they're trivially replaced by `jest.fn()`. `spyOn` would be used instead if `OrderService` imported a concrete module:

```js
import * as mailer from "./mailer.js";
const spy = jest.spyOn(mailer, "send").mockResolvedValue(true);
// ... act ...
expect(spy).toHaveBeenCalled();
spy.mockRestore();
```

**Tip:** Notice the design lesson: because dependencies are _injected_, no `jest.mock` magic is needed. Testable code and good architecture go together.

### Q19: How do you mock an entire module with `jest.mock`?

**A:**

```js
// users.controller.js imports userRepo from './user.repo.js'
jest.mock("./user.repo.js"); // auto-mock: all exports become jest.fn()

import { getUser } from "./users.controller.js";
import { findById } from "./user.repo.js";

it("returns 404 when user missing", async () => {
  findById.mockResolvedValue(null);
  const res = await getUser("missing");
  expect(res.status).toBe(404);
});
```

You can also pass a factory: `jest.mock('./user.repo.js', () => ({ findById: jest.fn() }))`.

**Tip:** `jest.mock` is hoisted to the top of the file by Jest's transform, so it runs before imports — that's why it works even though it looks like it's defined "after."

### Q20: What is `test.each` and when is it useful?

**A:** A way to run the same test body against multiple input/output rows — parameterized/table-driven testing. It removes copy-paste and makes edge cases explicit.

```js
test.each([
  [0, "zero"],
  [1, "one"],
  [-5, "negative"],
])("classify(%i) -> %s", (input, expected) => {
  expect(classify(input)).toBe(expected);
});
```

**Tip:** Great for validation rules and boundary values; each row reports as its own test so you see exactly which case failed.

### Q21: What is snapshot testing and when is it appropriate?

**A:** `expect(value).toMatchSnapshot()` serializes output (e.g. rendered component or API response) to a file on first run; later runs diff against it. Good for catching unintended changes in large, stable serializable output. Update intentionally with `jest --updateSnapshot`.

**Tip:** Overused snapshots become noise people blindly update. Prefer small, targeted snapshots or explicit assertions for important behavior.

### Q22: What are fake timers and why use them?

**A:** `jest.useFakeTimers()` (or `vi.useFakeTimers()`) replaces `setTimeout`/`setInterval`/`Date` so you can advance time programmatically with `jest.advanceTimersByTime(1000)` instead of actually waiting. Essential for testing debounces, polling, retries, and timeouts — keeps tests fast and deterministic.

**Tip:** Restore with `jest.useRealTimers()` in `afterEach` so timers don't leak into other tests.

### Q23: What is Vitest and how does it relate to Jest?

**A:** Vitest is a Vite-native test runner with a **Jest-compatible API** (`describe`, `it`, `expect`, mocks). It reuses Vite's transform pipeline, so it's fast, has first-class ESM/TypeScript/JSX support with no separate Babel/ts-jest config, and offers instant HMR-style watch mode. For a Vite project (like Trust-Node) it's the natural choice.

**Tip:** Key API difference: the mock namespace is `vi` not `jest` (`vi.fn()`, `vi.mock()`, `vi.spyOn()`). Migration is mostly find-and-replace.

### Q24: Why is Vitest often faster than Jest?

**A:** It uses Vite's esbuild-based transforms (very fast), native ESM (no CommonJS transpile overhead), smart watch mode that only reruns affected tests, and an efficient worker model. Jest historically transpiled everything through Babel/ts-jest and had heavier ESM support.

**Tip:** "Faster" depends on the project, but the ESM-native + esbuild pipeline is the honest technical reason.

### Q25: What is React Testing Library's core philosophy?

**A:** "The more your tests resemble the way your software is used, the more confidence they give you." You test _behavior from the user's perspective_ — query elements the way a user/screen-reader would (by role, label, text), interact, and assert on what's visible — rather than reaching into component internals like state or props.

**Tip:** This is why RTL replaced Enzyme: Enzyme let you assert on internal state and instance methods, coupling tests to implementation; refactors broke tests even when behavior was unchanged.

### Q26: Explain `getBy`, `queryBy`, and `findBy` in RTL.

**A:**

- `getBy*`: returns the element, **throws** if not found (and if multiple) — use when you expect it to exist now.
- `queryBy*`: returns the element or **null** — use to assert something is _absent_ (`expect(queryByText(...)).not.toBeInTheDocument()`).
- `findBy*`: returns a **promise** that retries until the element appears or times out — use for async UI (after a fetch).

**Tip:** Each has an `*AllBy` plural variant returning arrays. Prefer `getByRole` first — it's the most accessible, robust query.

### Q27: What's the difference between `userEvent` and `fireEvent`?

**A:** `fireEvent` dispatches a single raw DOM event. `userEvent` simulates a _full user interaction_: e.g. `userEvent.type` fires keydown, keypress, input, keyup per character; `userEvent.click` includes hover/focus/pointer events. `userEvent` is closer to reality and is the recommended default.

**Tip:** Modern `@testing-library/user-event` (v14+) is async — `await userEvent.click(button)`. Set it up with `const user = userEvent.setup()`.

### Q28: Show a React Testing Library test with `userEvent` and an MSW-mocked API.

**A:**

```jsx
// UserSearch.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { UserSearch } from "./UserSearch";

const server = setupServer(
  http.get("/api/users", ({ request }) => {
    const q = new URL(request.url).searchParams.get("q");
    return HttpResponse.json([{ id: 1, name: `Result for ${q}` }]);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("shows results after the user searches", async () => {
  const user = userEvent.setup();
  render(<UserSearch />);

  await user.type(screen.getByRole("textbox", { name: /search/i }), "ada");
  await user.click(screen.getByRole("button", { name: /search/i }));

  // findBy* waits for the async result to render
  expect(await screen.findByText("Result for ada")).toBeInTheDocument();
});

it("shows an empty state when the API fails", async () => {
  server.use(
    http.get("/api/users", () => new HttpResponse(null, { status: 500 })),
  );
  const user = userEvent.setup();
  render(<UserSearch />);
  await user.click(screen.getByRole("button", { name: /search/i }));
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});
```

**Tip:** MSW intercepts at the network layer, so your component uses its real `fetch`/axios code — far more realistic than mocking the HTTP client. `server.use(...)` overrides a handler per-test for error cases.

### Q29: How do you test a custom React hook?

**A:** With `renderHook` from `@testing-library/react`. It renders the hook in a test component and gives you `result.current`. Wrap state updates in `act`.

```jsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

it("increments", () => {
  const { result } = renderHook(() => useCounter(0));
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

**Tip:** Pass `wrapper` to `renderHook` when the hook needs a context provider (e.g. React Query or a theme provider).

### Q30: Why is Enzyme no longer recommended?

**A:** Enzyme encouraged testing implementation details (`.state()`, `.instance()`, shallow rendering) which couples tests to internals and breaks on refactors. It also lagged badly on React support (hooks, concurrent features, React 18+) because it needed adapters for each React version. RTL's behavior-focused approach and active maintenance won out.

**Tip:** If asked, the one-liner is "Enzyme tests how the component is built; RTL tests what the user experiences."

### Q31: What is Supertest and how is a basic test structured?

**A:** Supertest wraps an Express/Node app to make HTTP assertions _without binding a real port_ — you pass the `app` directly. You chain the request, set headers/body, and assert status/body.

```js
import request from "supertest";
import app from "../app.js";

it("returns the health status", async () => {
  const res = await request(app).get("/health").expect(200);
  expect(res.body.status).toBe("ok");
});
```

**Tip:** Export your `app` separately from the `app.listen(...)` call so tests can import the app without starting a server. This is a common refactor interviewers like to see.

### Q32: Show a Supertest test for an authenticated POST that asserts 201 and a 400 validation case.

**A:**

```js
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";

const token = jwt.sign(
  { sub: "user_1", role: "admin" },
  process.env.JWT_SECRET,
);

describe("POST /api/products", () => {
  it("creates a product and returns 201", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Espresso", price: 4.5, sku: "ESP-01" })
      .expect(201);

    expect(res.body).toMatchObject({ name: "Espresso", price: 4.5 });
    expect(res.body.id).toBeDefined();
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 4.5 }) // missing name + sku
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "name" })]),
    );
  });

  it("returns 401 without a token", async () => {
    await request(app).post("/api/products").send({ name: "x" }).expect(401);
  });
});
```

**Tip:** Always cover the unhappy paths (400, 401, 403, 404) — interviewers notice when you only test the happy 201. The 401 test proves your auth middleware actually runs.

### Q33: How do you run integration tests against a database, and how do you keep them clean?

**A:** Use a _real but disposable_ DB: a dockerized Postgres/Mongo via **Testcontainers**, an in-memory DB (`mongodb-memory-server`, SQLite `:memory:`), or a dedicated `*_test` database. Keep tests isolated by resetting state between them: truncate tables / drop collections in `afterEach`, or wrap each test in a **transaction that's rolled back**. Seed only the data each test needs.

**Tip:** Per-test transaction rollback is the fastest reliable cleanup for SQL — nothing actually persists. For Mongo, dropping collections in `afterEach` is the common pattern.

### Q34: Show a Prisma DB integration test with cleanup.

**A:**

```js
import { PrismaClient } from "@prisma/client";
import { createUser, findUserByEmail } from "../repo/user.repo.js";

const prisma = new PrismaClient(); // points at DATABASE_URL of the test DB

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  // order matters for FKs; or use TRUNCATE ... CASCADE
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("user.repo (integration)", () => {
  it("persists and retrieves a user", async () => {
    const created = await createUser(prisma, { email: "a@b.com", name: "Ada" });
    const found = await findUserByEmail(prisma, "a@b.com");

    expect(found).not.toBeNull();
    expect(found.id).toBe(created.id);
    expect(found.name).toBe("Ada");
  });

  it("enforces the unique email constraint", async () => {
    await createUser(prisma, { email: "dup@b.com", name: "One" });
    await expect(
      createUser(prisma, { email: "dup@b.com", name: "Two" }),
    ).rejects.toThrow(); // Prisma P2002 unique violation
  });
});
```

**Tip:** Run integration tests with `--runInBand` (serially) or give each worker its own schema/DB, otherwise parallel tests stomp on shared tables. The unique-constraint test exercises the real DB — a mock could never catch that.

### Q35: How do you mock external HTTP services?

**A:** Two common approaches: **nock** intercepts Node's HTTP layer (`nock('https://api.stripe.com').post('/charges').reply(200, {...})`), and **MSW** runs request handlers that work in both Node and the browser. Both let you simulate success, errors, timeouts, and specific payloads without hitting the real service.

**Tip:** MSW is increasingly preferred because the _same_ mocks work for frontend tests and Node, and it intercepts at the network boundary so your real client code runs.

### Q36: How do you make code testable in a Node/Express backend?

**A:** **Separation of concerns** (routes → controllers → services → repositories), **pure functions** for business logic (input → output, no side effects), and **dependency injection** so collaborators (DB client, mailer, payment gateway) are passed in rather than imported as hard singletons. Then unit tests pass fakes, and integration tests pass real ones.

**Tip:** A controller that imports Mongoose directly and contains business logic is hard to test. Extract the logic into a service that receives the model — now you can unit test it.

## Advanced

### Q37: What is TDD and what's the red-green-refactor cycle?

**A:** Test-Driven Development: write a failing test first (**red**), write the minimum code to pass it (**green**), then clean up the code with the test as a safety net (**refactor**). Repeat in tiny increments. The discipline forces you to define behavior before implementation and yields naturally testable, well-specified code.

**Tip:** Pros: better design, high coverage by construction, fewer over-engineered features. Cons: slower upfront, hard for exploratory/UI work, and can produce brittle tests if you TDD at the wrong abstraction level.

### Q38: What is BDD and how does it relate to TDD?

**A:** Behavior-Driven Development reframes tests around _behavior and business language_ (Given-When-Then), often using tools like Cucumber so non-engineers can read specs. It's TDD with a vocabulary and outside-in focus on user-observable behavior rather than units. RTL's behavior focus and `it('should ...')` naming are BDD-influenced.

**Tip:** You don't need Cucumber to "do BDD" — naming tests by behavior and starting from the user's perspective is the core idea.

### Q39: What do line, branch, statement, and function coverage measure?

**A:**

- **Statement**: each statement executed at least once.
- **Line**: each source line executed (close to statement, line-granular).
- **Function**: each function called at least once.
- **Branch**: each branch of each conditional taken (both the `if` and the `else`, both sides of `&&`).

Branch is the most demanding and most informative — it's easy to hit a line without covering its `else`.

**Tip:** Quote: "100% line coverage with 50% branch coverage means half your decision logic is untested."

### Q40: Why isn't 100% coverage the goal?

**A:** Coverage measures _which code ran_, not _whether it's correct_. A test with no assertions can cover code while verifying nothing. Chasing 100% wastes effort on trivial code (getters, config) and incentivizes weak tests that boost the number. High coverage of _meaningful behavior with strong assertions_ matters; the percentage is a proxy that can be gamed.

**Tip:** What coverage misses entirely: wrong assertions, missing edge cases, race conditions, integration/contract issues, and untested _inputs_ (you can cover a line with one input but miss the boundary input that breaks it).

### Q41: What is a flaky test and what causes flakiness?

**A:** A test that passes and fails non-deterministically without code changes. Common causes: dependence on real **time/dates**, **test order / shared mutable state**, **async races** (asserting before an async op finishes), **real network** calls, **non-deterministic data** (random, unsorted results, `Date.now()`), timezone/locale, and animation timing in e2e.

**Tip:** Don't "fix" flakiness by adding retries or `sleep`s — find the root cause (await the right thing, freeze time, isolate state). Retries hide bugs.

### Q42: How do you fix common sources of flakiness?

**A:** Freeze time with fake timers / inject a clock; make each test set up and tear down its own data; `await findBy*`/`waitFor` instead of fixed sleeps; mock the network (MSW/nock); seed randomness or inject the random source; sort results before asserting; pin timezone via `TZ=UTC`; in Cypress, assert on state with retry-able commands and use `cy.intercept` waits instead of `cy.wait(ms)`.

**Tip:** The general rule: tests must control every nondeterministic input — time, randomness, network, order.

### Q43: What is the difference between a smoke test and a regression test?

**A:** A **smoke test** is a quick, shallow check that the critical paths work at all ("does it boot, can a user log in?") — run after a build/deploy to catch catastrophic breakage fast. A **regression test** specifically guards behavior that previously worked (often added when fixing a bug) so the same defect can't return.

**Tip:** Every bug fix should come with a regression test that fails before the fix and passes after — say this in interviews.

### Q44: What is contract testing?

**A:** Testing that two services agree on their API _contract_ (request/response shape) without spinning up both. The consumer defines expectations (a "pact"), and the provider verifies it can satisfy them. Tools like **Pact** catch breaking API changes across service boundaries cheaper than full e2e integration.

**Tip:** It's most valuable in microservices/separate-team setups where the frontend and backend, or two services, evolve independently.

### Q45: What is load/performance testing and what tools are used?

**A:** Testing how the system behaves under concurrent load — throughput, latency percentiles (p95/p99), and the breaking point. Tools: **k6** (script scenarios in JS, ramp virtual users), **Artillery** (YAML/JS scenarios), and JMeter/Gatling. Distinct flavors: load (expected traffic), stress (beyond limits), soak (sustained), spike (sudden burst).

**Tip:** A tiny k6 example: `export default () => { http.get('https://api/health'); sleep(1); }` with a `stages` ramp. Mention p95 latency, not just average — averages hide tail latency.

### Q46: What is accessibility (a11y) testing?

**A:** Automated checks that UI meets accessibility standards (WCAG): proper roles/labels, contrast, keyboard navigation, alt text. Tools: **jest-axe**/**axe-core** in unit tests, Lighthouse, and Cypress/Playwright axe plugins.

```js
import { axe } from "jest-axe";
it("has no a11y violations", async () => {
  const { container } = render(<LoginForm />);
  expect(await axe(container)).toHaveNoViolations();
});
```

**Tip:** Automated a11y catches ~30-40% of issues; manual keyboard/screen-reader testing is still needed. Bonus: querying by role (RTL) naturally pushes accessible markup.

### Q47: Show a Cypress e2e test using intercept, fixtures, and a custom command.

**A:**

```js
// cypress/support/commands.js
Cypress.Commands.add("login", (email, password) => {
  cy.session([email, password], () => {
    cy.visit("/login");
    cy.get("[data-cy=email]").type(email);
    cy.get("[data-cy=password]").type(password);
    cy.get("[data-cy=submit]").click();
    cy.url().should("include", "/dashboard");
  });
});

// cypress/e2e/orders.cy.js
describe("Orders page", () => {
  beforeEach(() => {
    cy.login("admin@coffee.test", "secret");
    // stub the API with a fixture, then wait on the aliased request
    cy.intercept("GET", "/api/orders", { fixture: "orders.json" }).as(
      "getOrders",
    );
    cy.visit("/orders");
    cy.wait("@getOrders");
  });

  it("renders orders from the API", () => {
    cy.get("[data-cy=order-row]").should("have.length", 3);
    cy.contains("Espresso x2").should("be.visible");
  });

  it("shows an empty state when there are no orders", () => {
    cy.intercept("GET", "/api/orders", { body: [] }).as("getOrders");
    cy.visit("/orders");
    cy.wait("@getOrders");
    cy.contains(/no orders yet/i).should("be.visible");
  });
});
```

**Tip:** Use `data-cy` attributes for selectors (not CSS classes that change), `cy.session` to cache login, and `cy.intercept(...).as()` + `cy.wait('@alias')` instead of `cy.wait(2000)` to kill flakiness. Cypress auto-retries assertions, which handles most async timing.

### Q48: How do you keep end-to-end UI tests (Playwright/Cypress) stable and maintainable?

**A:** Four habits. (1) **Page Object Model** — encapsulate each page's selectors and actions in a class so specs read as intent and selectors live in one place; a markup refactor touches one file, not every spec. (2) **Prefer `data-testid`** over CSS/text selectors — they survive restyles and copy changes. (3) **Seed test data via API/factories**, not by clicking through signup — it's faster and isolates the test from unrelated UI. (4) **Avoid `waitForTimeout`/`cy.wait(ms)`** — use auto-retrying assertions like `await expect(locator).toBeVisible()` that poll until the condition holds or time out.

```ts
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  async goto() {
    await this.page.goto("/login");
  }
  async login(email: string, password: string) {
    await this.page.getByTestId("email").fill(email);
    await this.page.getByTestId("password").fill(password);
    await this.page.getByTestId("submit").click();
  }
}
```

```ts
// login.spec.ts
test("logs in and lands on the dashboard", async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login("admin@coffee.test", "secret");
  await expect(page.getByTestId("dashboard")).toBeVisible();
});
```

**Tip:** POM + `data-testid` + API-seeded data are the three habits that kill e2e flakiness — lead with those if asked why a suite is flaky.

### Q49: When should you use e2e tests vs lower-level tests?

**A:** Use e2e for a _small set_ of critical user journeys (login → checkout → confirmation) where the value of verifying the whole stack outweighs the cost. Use unit/integration for everything else — logic, edge cases, error handling — because they're faster, more stable, and pinpoint failures. E2e is a confidence check on the seams, not a place to test every branch.

**Tip:** Rule of thumb: if a unit or integration test can catch the bug, don't write an e2e test for it.

### Q50: Cypress vs Playwright — what's the trade-off?

**A:** **Cypress** runs in the browser's event loop with a great interactive runner, time-travel debugging, and automatic retries — superb DX, but historically single-tab/single-origin-ish and Chromium-focused. **Playwright** drives browsers via DevTools protocol out-of-process, with first-class multi-browser (Chromium/Firefox/WebKit), multi-tab/multi-origin, parallelism, and auto-waiting — often faster and more flexible for complex flows.

**Tip:** If asked which to pick today for a new project, Playwright's cross-browser + parallelism is a strong default; Cypress wins on debugging DX. Both are legitimate.

### Q51: How do you run these tests in CI (GitHub Actions)?

**A:** A workflow on `push`/`pull_request` checks out code, sets up Node, installs deps, then runs lint + unit/integration tests, and optionally e2e. For DB integration tests, spin up a service container.

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: app_test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/app_test
```

**Tip:** Cache dependencies, run tests on PRs as a required status check, and upload coverage as an artifact. For Cypress, the official `cypress-io/github-action` handles caching and recording.

### Q52: How do you order and parallelize tests in CI?

**A:** Order stages by cost so the pipeline **fails fast**: lint + typecheck → unit → integration (real DB via a service container) → build → e2e last (or against a deployed preview). Parallelize at each level: Jest scales with `--maxWorkers`, Playwright runs tests in parallel by default, and slow e2e suites split across machines with `--shard`. Cache `node_modules` and build outputs so each job doesn't reinstall/rebuild. Gate on coverage with a floor on critical packages — but don't worship 100%: weak assertions can hit high coverage while testing nothing.

```bash
# split an e2e suite across 4 separate CI jobs/machines
npx playwright test --shard=1/4   # job 1
npx playwright test --shard=2/4   # job 2
npx playwright test --shard=3/4   # job 3
npx playwright test --shard=4/4   # job 4
```

**Tip:** `--shard=i/n` for cross-machine e2e parallelism, and "coverage % ≠ test quality," are the senior notes here.

### Q53: What's the role of Husky and lint-staged pre-commit hooks?

**A:** **Husky** manages Git hooks (e.g. `pre-commit`) from the repo so they're shared across the team. **lint-staged** runs commands only against _staged_ files, so commits are fast. Together they run ESLint/Prettier and often related tests before code is committed — catching issues locally before CI and keeping `main` green.

```jsonc
// package.json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{ts,tsx}": ["bash -c 'tsc --noEmit'"],
  },
}
```

And `.husky/pre-commit` runs `npx lint-staged`. Some repos also run `jest --findRelatedTests` on staged files.

**Tip:** Keep pre-commit _fast_ — full test suites belong in CI or a pre-push hook. Slow hooks get bypassed with `--no-verify`, defeating the purpose.

### Q54: What should you test vs not test?

**A:** **Test**: business logic, branching/edge cases, error paths, public API/contract behavior, regressions for fixed bugs, and integration at risky seams. **Don't test**: third-party library internals, framework behavior, trivial getters/setters, generated code, or implementation details that change freely. Focus effort where bugs are likely and costly.

**Tip:** Ask "if this breaks, will a user or another service notice?" If no, it's probably not worth a test.

### Q55: How do you test error cases and edge cases well?

**A:** Enumerate boundaries (empty, single, max, zero, negative, null/undefined), invalid inputs, and failure modes of dependencies (DB down, API 500/timeout, malformed response). Use `test.each` for input tables, assert on thrown errors with `.rejects.toThrow`, and simulate dependency failures via mocks (`mockRejectedValue`). Verify the _observable_ behavior — correct status code, no partial writes, logged error — not just "it threw."

**Tip:** Interviewers love "the happy path is the easy 20%; the failure paths are where production bugs live." Show you test both.

### Q56: What's the difference between a stub and a mock in practice?

**A:** A **stub** provides canned answers so the code under test can run — you assert on the _result/state_. A **mock** is about _interaction_ — you set expectations and assert the collaborator was _called correctly_ (right args, right number of times). State verification (stub) vs behavior verification (mock).

**Tip:** Prefer state-based assertions where possible; they're less brittle. Use interaction assertions when the _call itself_ is the behavior (e.g. "did we send the email exactly once?").

### Q57: How do you avoid tests that are coupled to implementation?

**A:** Assert on _observable outputs and behavior_, not internal calls or private state. In React, query by role/text and assert on rendered output, not component state. In services, assert on return values and side effects at the boundary (DB row written, response shape), not which private helper ran. Mock only true external boundaries.

**Tip:** Litmus test: "Can I refactor the internals without changing behavior and keep all tests green?" If a pure refactor breaks tests, they're coupled to implementation.

### Q58: How do you handle test data setup at scale?

**A:** Use **factories/builders** (e.g. a `buildUser(overrides)` helper or libraries like `@faker-js/faker` + factory functions) to create valid objects with sensible defaults and per-test overrides. Seed only what a test needs. Avoid huge shared fixtures that every test depends on — they create coupling and obscure intent.

**Tip:** "Object Mother / builder" pattern keeps tests readable: `buildOrder({ total: 0 })` makes it obvious _what's special_ about this test's data.

### Q59: What is dependency injection's role in testability, with an example?

**A:** DI inverts control of dependencies so they're supplied from outside, letting tests substitute fakes without monkey-patching modules. Compare:

```js
// Hard to test: hidden, hard dependency
import { db } from "./db.js";
export async function getUser(id) {
  return db.users.findById(id);
}

// Easy to test: dependency injected
export function makeGetUser({ db }) {
  return (id) => db.users.findById(id);
}
// test: const getUser = makeGetUser({ db: { users: { findById: jest.fn() } } });
```

**Tip:** DI is why the `OrderService` example earlier needed zero `jest.mock` magic. It's the single biggest lever on testability.

### Q60: How do you test code that depends on the current date/time?

**A:** Never read `Date.now()`/`new Date()` directly in logic you want to test deterministically. Either inject a clock (`now = () => new Date()`) and pass a fixed value in tests, or use fake timers: `jest.useFakeTimers().setSystemTime(new Date('2026-06-21'))`. Restore afterward.

**Tip:** This is the #1 cause of "passes today, fails next month" flakiness — e.g. an expiry test that only fails after the hardcoded date passes.

## Common Mistakes / Red Flags

- **Forgetting `await`/`return` on async assertions** — the test passes before the assertion runs. Always await `.resolves`/`.rejects` and async actions.
- **Tests that depend on each other or on run order** — shared mutable state. Each test must set up and tear down its own world.
- **Over-mocking** until the test only verifies the mocks. You can break the real code and stay green.
- **Testing implementation details** (component state, private methods, internal call order) so every refactor breaks tests.
- **No assertions, or weak assertions** — covering a line without verifying behavior. Coverage goes up, confidence doesn't.
- **Chasing 100% coverage** as a vanity metric instead of testing meaningful behavior and edge cases.
- **`cy.wait(2000)` / arbitrary sleeps** to "fix" async timing — use `findBy*`/`waitFor`/`cy.intercept().as()` instead.
- **Hitting real networks or real shared databases** in tests — slow, flaky, and order-dependent. Mock the network; isolate the DB.
- **Only testing the happy path** — no 400/401/404, no failure of dependencies. Production bugs live in error paths.
- **Reading `Date.now()`/`Math.random()` directly** in tested logic — non-deterministic. Inject or fake them.
- **Snapshot-everything** then blindly running `--updateSnapshot` on every failure, defeating the test's purpose.
- **Slow pre-commit hooks** running the full suite — devs bypass with `--no-verify`. Keep hooks fast (lint + related tests); full suite in CI.
- **Not clearing mocks between tests** (`jest.clearAllMocks()`), so call counts leak and tests interfere.
- **Treating e2e as the main test layer** — slow and flaky; reserve it for a few critical journeys and push detail down the pyramid.

## Further Reading

- Kent C. Dodds — "The Testing Trophy and Testing Classifications": https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- React Testing Library docs (guiding principles, queries): https://testing-library.com/docs/
- Jest documentation (mock functions, async, coverage): https://jestjs.io/docs/getting-started and Vitest: https://vitest.dev/
- Martin Fowler — "Test Double" and "Mocks Aren't Stubs": https://martinfowler.com/bliki/TestDouble.html
