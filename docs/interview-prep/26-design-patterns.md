# Design Patterns

> Design patterns are named, reusable solutions to recurring design problems. They come up in interviews for two reasons: they give a team a **shared vocabulary** ("just wrap it in an adapter," "that's a strategy") so you can communicate intent fast, and they're a proxy for whether you write **clean, decoupled, testable code**. This file goes DEEP on the patterns themselves with TypeScript — it complements [`17-architecture-patterns.md`](./17-architecture-patterns.md), which covers the higher-level material (SOLID, clean/hexagonal architecture, DDD, CQRS, microservices). For SOLID/DDD/architecture, cross-reference 17; here we focus on the GoF catalog plus JS/TS, React and Node/NestJS idioms. The single most important piece of wisdom: **knowing a pattern means knowing WHEN to use it and, just as importantly, when NOT to.** Patterns are a response to _pressure for change_ — applying them speculatively is over-engineering (YAGNI). Interviewers love the candidate who says "I'd just use a plain function here; a full Strategy is overkill until we have three+ algorithms."

## Quick Revision Checklist

- **Singleton** — one shared instance; _what & when:_ shared config/connection pool. In NestJS every provider is a singleton by default, so you rarely hand-roll it. Beware global mutable state.
- **Factory Method** — a method decides which concrete class to instantiate; _when:_ creation logic varies by input/config and you want callers decoupled from `new`.
- **Abstract Factory** — factory of related factories; _when:_ you need families of objects that go together (e.g. a whole provider set per environment).
- **Builder** — step-by-step construction of a complex object; _when:_ many optional params, query builders, test-data builders. Avoids telescoping constructors.
- **Prototype** — clone an existing object instead of building anew; _when:_ expensive setup, or you need deep copies of configured templates.
- **Adapter** — translate one interface into another; _when:_ wrapping a 3rd-party SDK (payment gateway) behind your own port.
- **Decorator** — wrap an object to add behavior without subclassing; _when:_ layered cross-cutting concerns (logging, caching, retry). Relates to but differs from TS `@decorators`.
- **Facade** — one simple interface over a messy subsystem; _when:_ a service that hides orchestration of several lower-level services.
- **Proxy** — stand-in controlling access to a real object; _when:_ lazy loading, caching, access control, remote calls.
- **Composite** — treat individual objects and groups uniformly via a tree; _when:_ menus, file systems, nested categories.
- **Bridge** — split abstraction from implementation so both vary independently; _when:_ avoiding a class explosion across two dimensions.
- **Flyweight** — share intrinsic state across many objects to save memory; _when:_ huge numbers of similar objects.
- **Strategy** — interchangeable algorithms behind one interface; _when:_ shipping/discount/payment calculation that swaps at runtime. The classic "replace if/else."
- **Observer** — subjects notify subscribers of changes; _when:_ events, EventEmitter, RxJS, domain events, pub/sub.
- **Command** — encapsulate a request as an object; _when:_ CQRS command bus, undo/redo, queuing operations (CineBite).
- **Chain of Responsibility** — pass a request along handlers until one handles it; _when:_ Express/Nest middleware, guards/interceptors pipeline.
- **State** — object changes behavior as its internal state changes; _when:_ order/payment lifecycle state machine (Foody).
- **Template Method** — base class defines skeleton, subclasses fill steps; _when:_ a fixed algorithm with pluggable hooks.
- **Iterator / Mediator / Memento / Visitor / Interpreter** — traverse without exposing internals / centralize comms / snapshot+restore / add ops to a structure / evaluate a grammar. Rarely asked deep; know the one-liner.

## Pattern Categories Overview

| Category       | Intent                                           | Patterns                                                                                                                        |
| -------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Creational** | How objects get created                          | Singleton, Factory Method, Abstract Factory, Builder, Prototype                                                                 |
| **Structural** | How objects/classes compose                      | Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight                                                                 |
| **Behavioral** | How objects interact & distribute responsibility | Strategy, Observer, Command, Chain of Responsibility, Iterator, Template Method, State, Mediator, Memento, Visitor, Interpreter |

---

## Creational Patterns

### Singleton

- **What it is:** Guarantees a class has only one instance and provides a global access point to it.
- **When to use:** A single shared resource — config, logger, DB connection pool, cache client. When creating more than one would be wasteful or wrong.
- **Framework example:** **NestJS providers are singletons by default** (`@Injectable()` with the default `Scope.DEFAULT`). The IoC container creates one instance per application and shares it everywhere it's injected — so you almost never hand-roll Singleton in Nest. A Mongoose connection / Redis client behind a provider is effectively a managed singleton.
- **TypeScript code example:**

```ts
// Classic hand-rolled singleton
class ConfigService {
  private static instance: ConfigService;
  private readonly settings: Record<string, string>;

  private constructor() {
    this.settings = { env: process.env.NODE_ENV ?? "development" };
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  get(key: string): string | undefined {
    return this.settings[key];
  }
}

const a = ConfigService.getInstance();
const b = ConfigService.getInstance();
console.log(a === b); // true

// The idiomatic JS/TS singleton: just an ES module export.
// The module system caches the module, so the instance is shared.
export const config = new ConfigService(); // (if constructor were public)
```

- **Tip / interview angle:** Singleton is the most over-used and most criticized GoF pattern. **When NOT to use:** as a backdoor for global mutable state — it hides dependencies (hard to see what a class needs), couples everything to a concrete type, and makes tests flaky (shared state leaks between tests). Say: "I prefer DI — register a single-instance provider in the container so it's _injected_, not globally reached for. NestJS gives me singleton semantics without the testability problems." That contrast (Singleton-as-pattern vs Singleton-as-anti-pattern) scores points.

### Factory Method

- **What it is:** Defines an interface for creating an object but lets the implementation decide which concrete class to instantiate.
- **When to use:** When the exact type to create depends on input, config, or runtime conditions, and you want callers free of `new ConcreteClass()`.
- **Framework example:** NestJS **factory providers** (`useFactory`) are exactly this — the container calls your factory to produce the provider, optionally based on injected config.
- **TypeScript code example:**

```ts
interface PaymentProcessor {
  charge(amountCents: number): Promise<{ id: string }>;
}

class StripeProcessor implements PaymentProcessor {
  async charge(amountCents: number) {
    return { id: `stripe_${amountCents}` };
  }
}
class PaypalProcessor implements PaymentProcessor {
  async charge(amountCents: number) {
    return { id: `pp_${amountCents}` };
  }
}

type Provider = "stripe" | "paypal";

function createPaymentProcessor(provider: Provider): PaymentProcessor {
  switch (provider) {
    case "stripe":
      return new StripeProcessor();
    case "paypal":
      return new PaypalProcessor();
    default:
      throw new Error(`Unknown provider: ${provider satisfies never}`);
  }
}

// NestJS factory provider equivalent:
// {
//   provide: 'PAYMENT_PROCESSOR',
//   useFactory: (cfg: ConfigService) => createPaymentProcessor(cfg.get('PAYMENT_PROVIDER')),
//   inject: [ConfigService],
// }
```

- **Tip / interview angle:** Factory Method centralizes object creation so the rest of the code depends on the _interface_, supporting the Open/Closed Principle (add a new processor without touching callers). **When NOT to use:** if there's only ever one implementation, a factory is ceremony — just `new` it.

### Abstract Factory

- **What it is:** Provides an interface for creating _families_ of related objects without specifying their concrete classes.
- **When to use:** When products come in matched sets that must be used together — e.g. per-environment infrastructure (prod uses real S3 + real email + real payments; test uses fakes for all three), or cross-platform UI kits.
- **Real-world example:** An infra factory that, given an environment, returns a coherent set of clients (storage + queue + mailer) all wired for that environment.
- **TypeScript code example:**

```ts
interface Storage {
  put(key: string, data: Buffer): Promise<void>;
}
interface Mailer {
  send(to: string, body: string): Promise<void>;
}

interface InfraFactory {
  createStorage(): Storage;
  createMailer(): Mailer;
}

class ProdInfraFactory implements InfraFactory {
  createStorage(): Storage {
    return new S3Storage();
  }
  createMailer(): Mailer {
    return new SesMailer();
  }
}
class TestInfraFactory implements InfraFactory {
  createStorage(): Storage {
    return new InMemoryStorage();
  }
  createMailer(): Mailer {
    return new FakeMailer();
  }
}

// declarations elided for brevity
declare class S3Storage implements Storage {
  put(k: string, d: Buffer): Promise<void>;
}
declare class SesMailer implements Mailer {
  send(t: string, b: string): Promise<void>;
}
declare class InMemoryStorage implements Storage {
  put(k: string, d: Buffer): Promise<void>;
}
declare class FakeMailer implements Mailer {
  send(t: string, b: string): Promise<void>;
}
```

- **Tip / interview angle:** The distinction interviewers probe: **Factory Method** creates _one_ product; **Abstract Factory** creates a _family of related_ products and guarantees they're compatible. **When NOT to use:** if your products don't actually need to vary as a set, this adds an extra layer for nothing.

### Builder

- **What it is:** Separates the construction of a complex object from its representation, building it step by step.
- **When to use:** Objects with many optional parameters (avoids the "telescoping constructor"), **query builders**, **test-data builders**, fluent configuration.
- **Real-world example:** Mongoose/Knex/TypeORM query builders (`.where().sort().limit()`) and the AWS SDK command builders are Builders. In tests, a builder produces valid domain objects with sensible defaults you override per test.
- **TypeScript code example:**

```ts
// Test-data builder — great for keeping tests readable (used across Foody/Hirely specs)
interface User {
  id: string;
  email: string;
  role: "admin" | "customer";
  verified: boolean;
}

class UserBuilder {
  private user: User = {
    id: "u_1",
    email: "test@example.com",
    role: "customer",
    verified: false,
  };

  withRole(role: User["role"]): this {
    this.user.role = role;
    return this;
  }
  verified(): this {
    this.user.verified = true;
    return this;
  }
  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }
  build(): User {
    return { ...this.user };
  }
}

const admin = new UserBuilder().withRole("admin").verified().build();

// A tiny query builder
class FindQuery {
  private filter: Record<string, unknown> = {};
  private _limit = 20;
  where(field: string, value: unknown): this {
    this.filter[field] = value;
    return this;
  }
  limit(n: number): this {
    this._limit = n;
    return this;
  }
  build() {
    return { filter: this.filter, limit: this._limit };
  }
}

const q = new FindQuery().where("status", "active").limit(50).build();
```

- **Tip / interview angle:** Builders shine for **immutability + readability**: each fluent call returns `this` (or a new object). **When NOT to use:** for objects with 2-3 required fields — a plain constructor or object literal is clearer. Mention test-data builders specifically; it signals you write maintainable tests.

### Prototype

- **What it is:** Create new objects by cloning an existing instance (the prototype) rather than constructing from scratch.
- **When to use:** When object creation is expensive, or you want to copy a fully-configured template and tweak it.
- **Real-world example:** JavaScript itself is prototype-based (`Object.create`, prototype chain). `structuredClone()` deep-copies an object — a Prototype-style operation.
- **TypeScript code example:**

```ts
interface Cloneable<T> {
  clone(): T;
}

class EmailTemplate implements Cloneable<EmailTemplate> {
  constructor(
    public subject: string,
    public body: string,
    public variables: Record<string, string>,
  ) {}

  clone(): EmailTemplate {
    return new EmailTemplate(this.subject, this.body, { ...this.variables });
  }
}

const base = new EmailTemplate("Welcome", "Hi {{name}}", { name: "" });
const forAlice = base.clone();
forAlice.variables.name = "Alice"; // base unchanged
```

- **Tip / interview angle:** In JS the line between Prototype-the-pattern and the prototype _language feature_ blurs — call that out. **When NOT to use:** shallow clones of objects holding shared references can cause subtle bugs; reach for `structuredClone` or explicit deep copies.

---

## Structural Patterns

### Adapter

- **What it is:** Converts the interface of a class into another interface clients expect — the "wrapper" pattern.
- **When to use:** Integrating a third-party library or legacy code whose API doesn't match your domain's. Core to **ports & adapters (hexagonal)** — see [17](./17-architecture-patterns.md).
- **Real-world example:** Wrapping a payment gateway SDK (Stripe) behind your own `PaymentGateway` port so your domain never imports Stripe directly. Swapping providers later means writing a new adapter, not touching the domain.
- **TypeScript code example:**

```ts
// Domain port — what our app wants
interface PaymentGateway {
  pay(input: {
    amountCents: number;
    currency: string;
    token: string;
  }): Promise<{ ref: string }>;
}

// Third-party SDK shape we don't control
declare const stripeSdk: {
  charges: {
    create(opts: {
      amount: number;
      currency: string;
      source: string;
    }): Promise<{ id: string }>;
  };
};

// Adapter translates our port -> the SDK
class StripeAdapter implements PaymentGateway {
  async pay(input: { amountCents: number; currency: string; token: string }) {
    const charge = await stripeSdk.charges.create({
      amount: input.amountCents,
      currency: input.currency,
      source: input.token,
    });
    return { ref: charge.id };
  }
}
```

- **Tip / interview angle:** Adapter keeps third-party churn at the edges; your business logic depends on a stable interface (Dependency Inversion). **When NOT to use:** if the external API already matches your needs, an adapter is pointless indirection. Distinguish from Facade: Adapter _changes_ an interface to match an expectation; Facade _simplifies_ a complex one.

### Decorator

- **What it is:** Attaches additional responsibilities to an object dynamically by wrapping it — an alternative to subclassing for extending behavior.
- **When to use:** Stacking cross-cutting concerns (caching, logging, retry, rate-limiting) around a core service, each wrapper transparently honoring the same interface.
- **Framework example:** **NestJS/TypeScript `@decorators`** (`@Injectable`, `@Get`, `@UseGuards`) are _syntax-level metadata decorators_ — related in spirit (wrapping/annotating) but technically different from the GoF Decorator, which is an object that wraps another object of the same interface at runtime. Worth naming the difference explicitly.
- **TypeScript code example:**

```ts
interface UserRepo {
  findById(id: string): Promise<{ id: string; name: string }>;
}

class MongoUserRepo implements UserRepo {
  async findById(id: string) {
    /* hit DB */ return { id, name: "Alice" };
  }
}

// Caching decorator — same interface, adds behavior
class CachingUserRepo implements UserRepo {
  private cache = new Map<string, { id: string; name: string }>();
  constructor(private readonly inner: UserRepo) {}

  async findById(id: string) {
    const hit = this.cache.get(id);
    if (hit) return hit;
    const user = await this.inner.findById(id);
    this.cache.set(id, user);
    return user;
  }
}

// Logging decorator stacked on top
class LoggingUserRepo implements UserRepo {
  constructor(private readonly inner: UserRepo) {}
  async findById(id: string) {
    console.time(`findById ${id}`);
    try {
      return await this.inner.findById(id);
    } finally {
      console.timeEnd(`findById ${id}`);
    }
  }
}

const repo: UserRepo = new LoggingUserRepo(
  new CachingUserRepo(new MongoUserRepo()),
);
```

- **Tip / interview angle:** Decorator favors **composition over inheritance** and keeps the Single Responsibility Principle (each wrapper does one thing). **When NOT to use:** deep wrapper stacks get hard to debug; if behavior is always-on and fixed, just put it in the class. Be precise about TS decorators vs GoF Decorator — interviewers notice.

### Facade

- **What it is:** Provides a single, simplified interface to a larger, more complex subsystem.
- **When to use:** When a client needs to perform a high-level operation that involves orchestrating several lower-level services, and you want to hide that complexity.
- **Real-world example:** A Foody `CheckoutService.placeOrder()` that internally coordinates inventory reservation, payment, order persistence and notification — callers see one method, not four services.
- **TypeScript code example:**

```ts
class CheckoutFacade {
  constructor(
    private readonly inventory: InventoryService,
    private readonly payments: PaymentGateway,
    private readonly orders: OrderRepository,
    private readonly notifier: NotificationService,
  ) {}

  async placeOrder(
    cart: Cart,
    paymentToken: string,
  ): Promise<{ orderId: string }> {
    await this.inventory.reserve(cart.items);
    const { ref } = await this.payments.pay({
      amountCents: cart.totalCents,
      currency: "USD",
      token: paymentToken,
    });
    const order = await this.orders.create({ cart, paymentRef: ref });
    await this.notifier.orderConfirmed(order.id);
    return { orderId: order.id };
  }
}

// types elided
declare class InventoryService {
  reserve(items: unknown[]): Promise<void>;
}
declare class OrderRepository {
  create(input: unknown): Promise<{ id: string }>;
}
declare class NotificationService {
  orderConfirmed(id: string): Promise<void>;
}
declare interface PaymentGateway {
  pay(i: {
    amountCents: number;
    currency: string;
    token: string;
  }): Promise<{ ref: string }>;
}
declare interface Cart {
  items: unknown[];
  totalCents: number;
}
```

- **Tip / interview angle:** A Facade in clean architecture is essentially an **application service / use-case** — it orchestrates the domain. **When NOT to use:** don't let a facade become a God object that knows too much; if it grows tentacles into everything, split it.

### Proxy

- **What it is:** A surrogate that controls access to another object, with the same interface, intercepting calls.
- **When to use:** Lazy initialization (virtual proxy), caching, access control (protection proxy), remote objects (remote proxy), logging/metrics.
- **Real-world example:** JavaScript's built-in `Proxy` object; ORM lazy-loaded relations; an API client that caches GET responses.
- **TypeScript code example:**

```ts
interface ReportService {
  generate(id: string): Promise<string>;
}

class RealReportService implements ReportService {
  async generate(id: string) {
    /* expensive */ return `report:${id}`;
  }
}

// Caching + access-control proxy
class ReportServiceProxy implements ReportService {
  private cache = new Map<string, string>();
  constructor(
    private readonly real: ReportService,
    private readonly userRole: string,
  ) {}

  async generate(id: string): Promise<string> {
    if (this.userRole !== "admin") throw new Error("Forbidden");
    const cached = this.cache.get(id);
    if (cached) return cached;
    const result = await this.real.generate(id);
    this.cache.set(id, result);
    return result;
  }
}

// Native JS Proxy for, e.g., validation/logging on property access:
const tracked = new Proxy(
  { count: 0 },
  {
    set(target, prop, value) {
      console.log(`set ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value);
    },
  },
);
```

- **Tip / interview angle:** Proxy and Decorator have the _same structure_ (both wrap and share an interface) but differ in _intent_: Decorator **adds behavior**, Proxy **controls access** to the same behavior. **When NOT to use:** caching/access proxies can hide latency and security logic in surprising places — keep them obvious.

### Composite

- **What it is:** Composes objects into tree structures and lets clients treat individual objects and compositions uniformly.
- **When to use:** Part-whole hierarchies — file systems, nested menus, org charts, nested product categories, UI component trees.
- **TypeScript code example:**

```ts
interface FileSystemNode {
  size(): number;
}

class FileLeaf implements FileSystemNode {
  constructor(private readonly bytes: number) {}
  size() {
    return this.bytes;
  }
}

class Directory implements FileSystemNode {
  private children: FileSystemNode[] = [];
  add(node: FileSystemNode): this {
    this.children.push(node);
    return this;
  }
  size() {
    return this.children.reduce((sum, c) => sum + c.size(), 0);
  }
}

const root = new Directory()
  .add(new FileLeaf(100))
  .add(new Directory().add(new FileLeaf(50)).add(new FileLeaf(25)));
root.size(); // 175 — same .size() call on leaf or branch
```

- **Tip / interview angle:** The win is **uniformity** — recursion over the tree without `if (isLeaf)` checks. **When NOT to use:** if your data isn't genuinely hierarchical, forcing a tree adds complexity.

### Bridge (brief)

- **What it is:** Decouples an abstraction from its implementation so the two can vary independently, avoiding a combinatorial class explosion.
- **When to use:** Two orthogonal dimensions of variation — e.g. _notification type_ (alert, reminder) × _channel_ (email, SMS, push). Instead of `EmailAlert`, `SmsAlert`, `EmailReminder`... you compose a `Notification` (abstraction) with a `Channel` (implementation).
- **TypeScript code example:**

```ts
interface Channel {
  send(msg: string): void;
}
class EmailChannel implements Channel {
  send(m: string) {
    /* email */
  }
}
class SmsChannel implements Channel {
  send(m: string) {
    /* sms */
  }
}

abstract class Notification {
  constructor(protected channel: Channel) {}
  abstract notify(): void;
}
class Reminder extends Notification {
  notify() {
    this.channel.send("Reminder!");
  } // any channel works
}
```

- **Tip / interview angle:** Bridge = composition to dodge an inheritance matrix. Often confused with Adapter; Bridge is designed up front, Adapter retrofits.

### Flyweight (brief)

- **What it is:** Shares common (intrinsic) state across many objects to minimize memory, passing unique (extrinsic) state in per call.
- **When to use:** Vast numbers of similar objects (text glyphs, game particles, map markers).
- **TypeScript sketch:**

```ts
// Shared intrinsic state cached in a factory
class IconFlyweightFactory {
  private icons = new Map<string, { sprite: string }>();
  get(type: string) {
    if (!this.icons.has(type))
      this.icons.set(type, { sprite: `sprite:${type}` });
    return this.icons.get(type)!; // shared instance
  }
}
// Position (extrinsic) is passed at render time, not stored per icon.
```

- **Tip / interview angle:** Rarely needed in typical web back ends (V8 GC + DB-backed data). Know the concept; flag it as a micro-optimization for memory-bound rendering.

---

## Behavioral Patterns

### Strategy

- **What it is:** Defines a family of interchangeable algorithms behind a common interface, selectable at runtime.
- **When to use:** The classic "kill the if/else/switch over a type" — shipping cost, discount rules, payment method, sorting, pricing.
- **Real-world example:** Foody discount engine: percentage, fixed-amount, or buy-one-get-one strategies chosen per promotion.
- **TypeScript code example:**

```ts
interface DiscountStrategy {
  apply(totalCents: number): number;
}

class NoDiscount implements DiscountStrategy {
  apply(t: number) {
    return t;
  }
}
class PercentageDiscount implements DiscountStrategy {
  constructor(private pct: number) {}
  apply(t: number) {
    return Math.round(t * (1 - this.pct / 100));
  }
}
class FixedDiscount implements DiscountStrategy {
  constructor(private cents: number) {}
  apply(t: number) {
    return Math.max(0, t - this.cents);
  }
}

class Checkout {
  constructor(private strategy: DiscountStrategy) {}
  setStrategy(s: DiscountStrategy) {
    this.strategy = s;
  }
  total(subtotal: number) {
    return this.strategy.apply(subtotal);
  }
}

new Checkout(new PercentageDiscount(10)).total(10000); // 9000

// In FP/TS you can use a function map instead of classes:
const discounts: Record<string, (t: number) => number> = {
  none: (t) => t,
  ten: (t) => t * 0.9,
};
```

- **Tip / interview angle:** Strategy is the go-to refactor for branchy conditionals and supports Open/Closed (add a strategy without editing the chooser). In JS, a **map of functions** is often the lighter-weight idiomatic form. **When NOT to use:** with only two stable branches that never grow, a simple `if` is clearer than a strategy hierarchy.

### Observer

- **What it is:** Defines a one-to-many dependency so that when one object (subject) changes state, all its dependents (observers) are notified.
- **When to use:** Decoupled event reactions — "when an order is placed, send email + update analytics + decrement stock" without the order code knowing about any of them.
- **Framework example:** Node's `EventEmitter`, **RxJS** `Observable`/`Subject`, NestJS `@nestjs/event-emitter`, **domain events** in DDD, and pub/sub over Redis. All are Observer variants.
- **TypeScript code example:**

```ts
type Listener<T> = (payload: T) => void;

class EventBus<T> {
  private listeners: Listener<T>[] = [];
  subscribe(fn: Listener<T>): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    }; // unsubscribe
  }
  publish(payload: T) {
    this.listeners.forEach((l) => l(payload));
  }
}

const orderPlaced = new EventBus<{ orderId: string }>();
orderPlaced.subscribe(({ orderId }) => console.log(`email for ${orderId}`));
orderPlaced.subscribe(({ orderId }) => console.log(`analytics for ${orderId}`));
orderPlaced.publish({ orderId: "o_1" });

// NestJS style:
// this.eventEmitter.emit('order.placed', new OrderPlacedEvent(orderId));
// @OnEvent('order.placed') handle(e: OrderPlacedEvent) { ... }
```

- **Tip / interview angle:** Observer enables **loose coupling** and is the backbone of event-driven architecture (see [17](./17-architecture-patterns.md) for domain events/outbox). RxJS is "Observer + Iterator over time, plus operators." **When NOT to use:** synchronous in-process Observer can make control flow hard to trace ("who fired this?"); for critical ordering or guaranteed delivery use an explicit queue/outbox, not fire-and-forget emitters.

### Command

- **What it is:** Encapsulates a request as a stand-alone object, letting you parameterize, queue, log, and undo operations.
- **When to use:** Undo/redo, task queues, transactional operations, and — most relevant here — **CQRS command buses**.
- **Framework example:** **CineBite** uses `@nestjs/cqrs`: a `CreateBookingCommand` is dispatched on the `CommandBus` and routed to its `CommandHandler`. Each command is a Command object; the bus is also a Mediator.
- **TypeScript code example:**

```ts
// CQRS-style command + handler (CineBite)
class CreateBookingCommand {
  constructor(
    public readonly userId: string,
    public readonly showtimeId: string,
  ) {}
}

interface CommandHandler<C> {
  execute(command: C): Promise<void>;
}

class CreateBookingHandler implements CommandHandler<CreateBookingCommand> {
  constructor(private readonly bookings: BookingRepository) {}
  async execute(cmd: CreateBookingCommand): Promise<void> {
    await this.bookings.create(cmd.userId, cmd.showtimeId);
  }
}

// Simple command bus (Mediator routing commands to handlers)
class CommandBus {
  private handlers = new Map<Function, CommandHandler<any>>();
  register<C>(type: new (...a: any[]) => C, handler: CommandHandler<C>) {
    this.handlers.set(type, handler);
  }
  execute<C>(command: C): Promise<void> {
    return this.handlers.get((command as any).constructor)!.execute(command);
  }
}

declare class BookingRepository {
  create(u: string, s: string): Promise<void>;
}
```

- **Tip / interview angle:** Command decouples _what to do_ (the request object) from _who does it_ (the handler) and _when_ (now, queued, retried). It enables auditing/replay — every command is serializable. **When NOT to use:** for trivial CRUD a command bus is heavy ceremony; CQRS earns its keep when read/write models diverge or you need an audit trail (cross-ref CQRS in [17](./17-architecture-patterns.md)).

### Chain of Responsibility

- **What it is:** Passes a request along a chain of handlers; each handler either processes it or forwards it to the next.
- **When to use:** Request pipelines where multiple independent steps may act — validation, auth, logging, transformation.
- **Framework example:** **Express/NestJS middleware** is textbook Chain of Responsibility: each middleware calls `next()` to pass control along. NestJS **guards → interceptors → pipes → handler → interceptors** is a structured pipeline of the same idea.
- **TypeScript code example:**

```ts
type Ctx = { user?: string; authorized?: boolean };
type Next = () => void;
type Middleware = (ctx: Ctx, next: Next) => void;

function runChain(ctx: Ctx, chain: Middleware[]) {
  let i = 0;
  const next: Next = () => {
    const mw = chain[i++];
    if (mw) mw(ctx, next);
  };
  next();
}

const authenticate: Middleware = (ctx, next) => {
  ctx.user = "alice";
  next();
};
const authorize: Middleware = (ctx, next) => {
  ctx.authorized = ctx.user === "alice";
  if (!ctx.authorized) return; // stop the chain
  next();
};
const handle: Middleware = (ctx) => console.log(`handled for ${ctx.user}`);

runChain({}, [authenticate, authorize, handle]);
```

- **Tip / interview angle:** Each handler is decoupled and reorderable; you can short-circuit by not calling `next()`. **When NOT to use:** when exactly one handler always handles it — a direct call is simpler. Naming Express/Nest middleware as CoR is a strong, concrete answer for a back-end role.

### Iterator (brief)

- **What it is:** Provides sequential access to elements of a collection without exposing its underlying representation.
- **When to use:** Custom traversal; lazy/streamed sequences.
- **Framework example:** JS **iterables/iterators** (`Symbol.iterator`), generators (`function*`), and `for...of` are the language-level Iterator. RxJS is Iterator-over-time.
- **TypeScript sketch:**

```ts
function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) yield i; // lazy
}
for (const n of range(0, 3)) console.log(n); // 0 1 2
```

- **Tip / interview angle:** In JS you almost never implement Iterator by hand — generators give it for free. Mention lazy evaluation / streaming large datasets.

### Template Method

- **What it is:** Defines the skeleton of an algorithm in a base class, deferring specific steps to subclasses without changing the overall structure.
- **When to use:** Several variants share a fixed sequence but differ in a few steps — e.g. an import pipeline (read → parse → validate → save) where only parse differs per file type.
- **TypeScript code example:**

```ts
abstract class DataImporter {
  // the template method — fixed skeleton, runs the steps in order
  async import(raw: string): Promise<void> {
    const parsed = this.parse(raw);
    this.validate(parsed);
    await this.save(parsed);
  }
  protected abstract parse(raw: string): unknown[]; // varies
  protected validate(rows: unknown[]): void {} // optional hook
  protected abstract save(rows: unknown[]): Promise<void>;
}

class CsvImporter extends DataImporter {
  protected parse(raw: string) {
    return raw.split("\n").map((l) => l.split(","));
  }
  protected async save(rows: unknown[]) {
    /* bulk insert */
  }
}
```

- **Tip / interview angle:** Template Method uses **inheritance**; Strategy achieves similar variability via **composition**. Prefer Strategy when you want to swap behavior at runtime or avoid rigid class trees. **When NOT to use:** if steps vary a lot, the rigid skeleton fights you — switch to Strategy/composition.

### State

- **What it is:** Lets an object alter its behavior when its internal state changes — it appears to change class. A clean way to model a state machine.
- **When to use:** Lifecycle objects with rules about allowed transitions — order status, payment status, document approval.
- **Real-world example:** **Foody order lifecycle**: `Pending → Confirmed → Preparing → OutForDelivery → Delivered`, with `Cancel` allowed only in some states. Encapsulating each state stops invalid transitions and tames a sprawling switch.
- **TypeScript code example:**

```ts
interface OrderState {
  confirm(order: Order): void;
  cancel(order: Order): void;
  readonly name: string;
}

class PendingState implements OrderState {
  readonly name = "Pending";
  confirm(order: Order) {
    order.setState(new ConfirmedState());
  }
  cancel(order: Order) {
    order.setState(new CancelledState());
  }
}
class ConfirmedState implements OrderState {
  readonly name = "Confirmed";
  confirm() {
    throw new Error("Already confirmed");
  }
  cancel(order: Order) {
    order.setState(new CancelledState());
  }
}
class CancelledState implements OrderState {
  readonly name = "Cancelled";
  confirm() {
    throw new Error("Cannot confirm a cancelled order");
  }
  cancel() {
    throw new Error("Already cancelled");
  }
}

class Order {
  private state: OrderState = new PendingState();
  setState(s: OrderState) {
    this.state = s;
  }
  get status() {
    return this.state.name;
  }
  confirm() {
    this.state.confirm(this);
  }
  cancel() {
    this.state.cancel(this);
  }
}
```

- **Tip / interview angle:** State makes invalid transitions _impossible to call_ — better than scattering `if (status === ...)` checks. For complex flows mention dedicated state-machine libraries (XState). **When NOT to use:** for two states with trivial rules, a boolean/enum + guard is plenty.

### Mediator (brief)

- **What it is:** Centralizes communication between objects so they refer to a mediator instead of each other, reducing many-to-many coupling.
- **When to use:** When many components must coordinate (chat rooms, complex forms, the CQRS bus).
- **Framework example:** The **CQRS CommandBus/QueryBus** is a Mediator — handlers never reference each other; they go through the bus. NestJS's whole module/provider wiring is mediator-ish.
- **Tip / interview angle:** Mediator trades a web of direct dependencies for a hub; over-centralizing turns the mediator into a God object.

### Memento (brief)

- **What it is:** Captures and externalizes an object's internal state so it can be restored later, without violating encapsulation.
- **When to use:** Undo/redo, snapshots, checkpoints, transaction rollback.
- **TypeScript sketch:**

```ts
class Editor {
  private text = "";
  type(s: string) {
    this.text += s;
  }
  save() {
    return { text: this.text };
  } // memento
  restore(m: { text: string }) {
    this.text = m.text;
  }
}
```

- **Tip / interview angle:** Pairs with Command for undo. Event sourcing is a Memento-adjacent idea (state reconstructable from history).

### Visitor (brief)

- **What it is:** Lets you add new operations to an object structure without modifying the objects, by moving the operation into a visitor.
- **When to use:** Stable object structure, many distinct operations over it — AST traversal, report generation over a node tree.
- **Tip / interview angle:** Powerful but verbose; great for compilers/linters (the TS compiler uses visitor-style traversal), rarely needed in CRUD apps. Trade-off: easy to add operations, hard to add new node types.

### Interpreter (brief)

- **What it is:** Defines a grammar and an interpreter that evaluates sentences in that grammar.
- **When to use:** Small DSLs — filter expressions, rule engines, query languages.
- **Tip / interview angle:** Usually you reach for a real parser/library instead of hand-rolling Interpreter. Mention it for "we built a small rules DSL" scenarios; otherwise it's the least-used GoF pattern.

---

## JavaScript / TypeScript-Idiomatic Patterns

Beyond GoF, these are the patterns you actually meet daily in Node/TS.

### Module pattern & Revealing Module

Pre-ES-modules, an IIFE created a private scope and returned a public API. The **Revealing Module** variant defines everything privately and "reveals" a subset.

```ts
const counter = (() => {
  let count = 0; // private (closure)
  const increment = () => ++count;
  const value = () => count;
  return { increment, value }; // revealed public API
})();
```

Today **ES modules** supersede this: anything not `export`ed is private to the file. Mention both — the IIFE/module pattern was _the_ way to get encapsulation before `import/export`.

### IIFE (Immediately Invoked Function Expression)

`(() => { /* ... */ })()` — runs once, creating a private scope. Historically used to avoid polluting global scope and to create modules. Largely obsolete with block scoping (`let/const`) and ES modules, but still appears in bundled/legacy code.

### Closures as private state

A function that closes over variables gives true privacy — the foundation of the module pattern, currying, memoization, and hooks-like state.

```ts
function makeRateLimiter(maxPerMin: number) {
  let hits = 0; // private, persists across calls
  let windowStart = Date.now();
  return () => {
    if (Date.now() - windowStart > 60_000) {
      hits = 0;
      windowStart = Date.now();
    }
    return ++hits <= maxPerMin;
  };
}
```

### Mixin

Compose behavior into a class without inheritance — useful when multiple unrelated classes need the same capability (timestamps, soft-delete).

```ts
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
  };
}

class Entity {}
class User extends Timestamped(Entity) {} // User now has createdAt
```

### Currying / Partial application

Transform `f(a, b, c)` into `f(a)(b)(c)`; partial application fixes some args up front. Great for building specialized functions and for FP composition.

```ts
const add = (a: number) => (b: number) => a + b;
const add10 = add(10); // partial application
add10(5); // 15

const logger = (level: string) => (msg: string) =>
  console.log(`[${level}] ${msg}`);
const error = logger("ERROR");
```

### Middleware / Pipeline

Compose a series of steps each transforming/inspecting a context and calling the next — see Chain of Responsibility above. Express/Nest middleware, Redux middleware, and `pipe()`-style transforms all use it.

```ts
const pipe =
  <T>(...fns: Array<(x: T) => T>) =>
  (input: T): T =>
    fns.reduce((acc, fn) => fn(acc), input);

const clean = pipe<string>(
  (s) => s.trim(),
  (s) => s.toLowerCase(),
);
clean("  HELLO  "); // "hello"
```

### Dependency Injection / IoC container (NestJS)

DI = a class declares its dependencies (usually via constructor) and a container supplies them. **Inversion of Control** = the framework, not your code, decides when/how objects are created and wired. This is _the_ pattern for a NestJS back-end role.

```ts
@Injectable()
class OrderService {
  // Nest's IoC container injects these singletons automatically
  constructor(
    private readonly orders: OrderRepository,
    private readonly payments: PaymentGateway,
  ) {}
}
```

NestJS uses TS decorators + `reflect-metadata` to read constructor types and resolve them from the module's provider registry. DI gives loose coupling, easy mocking in tests, and centralized lifecycle. Cross-ref Dependency Inversion in [17](./17-architecture-patterns.md) (principle ≠ technique ≠ container).

### Service Locator (and why DI wins)

A Service Locator is a central registry you _ask_ for dependencies (`locator.get(PaymentGateway)`). It works but is considered an anti-pattern relative to DI because dependencies become **hidden** (you can't tell what a class needs from its signature) and it couples code to the locator. **DI is preferred**: dependencies are explicit in the constructor, making code self-documenting and trivially testable. Saying this unprompted signals maturity.

### Repository + Unit of Work

**Repository** abstracts persistence behind a collection-like interface so the domain doesn't know about Mongo/SQL (see [17](./17-architecture-patterns.md) and [12](./12-mongodb-mongoose.md)). **Unit of Work** tracks changes across multiple repositories and commits them in one transaction.

```ts
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}
// Unit of Work: a Mongo session / transaction wrapping multiple repo writes
// await session.withTransaction(async () => { await orders.save(o); await ledger.save(e); });
```

In fintech, UoW matters: a payment + a ledger entry must commit atomically.

### DTO (Data Transfer Object)

A plain object shaping data crossing a boundary (HTTP ↔ service), decoupled from domain entities and DB schemas. In NestJS, DTOs + `class-validator` validate and document the API contract.

```ts
class CreateBookingDto {
  @IsString() showtimeId!: string;
  @IsInt() @Min(1) seats!: number;
}
declare function IsString(): PropertyDecorator;
declare function IsInt(): PropertyDecorator;
declare function Min(n: number): PropertyDecorator;
```

DTOs prevent over-posting (mass assignment) and keep your domain model from leaking to clients.

### Singleton via ES module, Pub/Sub, Event-driven

- **ES-module singleton:** `export const db = createConnection()` — module caching guarantees one instance. The cleanest singleton in Node.
- **Pub/Sub:** like Observer but with a broker decoupling publishers from subscribers entirely (Redis pub/sub, message brokers). Publishers don't know subscribers exist.
- **Event-driven:** architecture built on emitting/reacting to events (domain events, outbox) — see [17](./17-architecture-patterns.md) and [15](./15-realtime-websockets.md).

### Higher-Order Functions & Functional composition

HOFs take or return functions (`map`, `filter`, `reduce`, decorators-as-functions). Functional composition chains small pure functions into pipelines (`pipe`/`compose`). These are the FP counterparts to several OO patterns — a function map _is_ Strategy; a wrapping HOF _is_ Decorator. In JS/TS, prefer the lighter functional form when you don't need class state.

---

## React Patterns (brief — full-stack angle)

Cross-reference [`04-react-advanced.md`](./04-react-advanced.md) for depth.

- **Container / Presentational:** split data-fetching/logic (container) from pure rendering (presentational). `<UserListContainer>` fetches; `<UserList users={...}>` renders. Modern hooks blur this but the separation still aids testability.
- **Custom Hooks:** extract reusable stateful logic into `useXxx()`. The idiomatic modern replacement for HOCs/render props.

```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return [on, () => setOn((v) => !v)] as const;
}
```

- **Higher-Order Components (HOC):** a function taking a component and returning an enhanced one — `withAuth(Component)`. Decorator pattern for components. Largely superseded by hooks.
- **Render Props:** a component takes a function-as-child to control rendering — `<Mouse>{(pos) => <Cat at={pos} />}</Mouse>`. Also mostly replaced by hooks.
- **Compound Components:** related components share implicit state via context — `<Tabs><Tab/><TabPanel/></Tabs>`. Flexible, declarative APIs.
- **Provider pattern (Context):** wrap a subtree to inject shared state without prop drilling — `<ThemeProvider>`. This is DI for React. (See [05](./05-state-management.md).)
- **Controlled vs Uncontrolled:** controlled = React state is the source of truth (`value` + `onChange`); uncontrolled = the DOM holds state (`ref`/`defaultValue`). Prefer controlled for validation; uncontrolled for simple/perf-sensitive forms.

---

## Node / NestJS Patterns in the Wild

Mapping framework features to the patterns they implement — gold for a NestJS interview:

| Framework feature                            | Pattern(s) it implements                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **NestJS DI container**                      | IoC + Singleton (default scope) + Factory (`useFactory`)                                        |
| **`useFactory` / config providers**          | Factory Method / Abstract Factory (env-specific provider families)                              |
| **Guards**                                   | Strategy (pluggable auth policy) + Chain of Responsibility (run in sequence, can short-circuit) |
| **Interceptors**                             | Decorator (wrap handler, transform in/out via RxJS) + Proxy/AOP                                 |
| **Pipes**                                    | Strategy (validation/transformation algorithm) + Decorator                                      |
| **Middleware**                               | Chain of Responsibility (`next()` pipeline)                                                     |
| **Exception filters**                        | Chain of Responsibility / Strategy for error handling                                           |
| **TS `@decorators`** (`@Get`, `@Injectable`) | Annotation/metadata (related to GoF Decorator in spirit, not mechanism)                         |
| **Mongoose models**                          | Active Record-ish (model carries query + persistence behavior)                                  |
| **CQRS `CommandBus`/`QueryBus`/`EventBus`**  | Command + Mediator + Observer                                                                   |
| **`@nestjs/event-emitter`**                  | Observer / Pub-Sub                                                                              |
| **RxJS `Observable`**                        | Observer + Iterator (over time)                                                                 |
| **Repository providers**                     | Repository pattern + Adapter (domain port ↔ DB driver)                                          |

**Active Record vs Data Mapper (Mongoose discussion):** Mongoose models lean **Active Record** — a `User` document knows how to `.save()` and query itself, mixing domain data with persistence. That's productive but couples your domain to Mongoose. The **Data Mapper** alternative (a separate repository/mapper moves data between plain domain objects and the DB) keeps the domain persistence-ignorant — better for a clean/hexagonal architecture. In practice on a Nest+Mongo project, many teams wrap Mongoose models in repositories to get Data-Mapper-style decoupling at the boundary. Be ready to argue the trade-off (speed vs purity); fintech clean-code shops often favor the repository wrapper.

---

## Anti-Patterns & When NOT to Use Patterns

- **God Object / God Class:** one class that knows/does everything. Violates SRP; split by responsibility.
- **Spaghetti code:** no clear structure, tangled control flow. Fix with layering and clear module boundaries.
- **Golden Hammer:** "I know Strategy, so everything is a Strategy." Forcing patterns where a plain function/`if` would do. The #1 junior mistake.
- **Premature abstraction / over-engineering:** building flexibility for requirements that don't exist. Follow the **rule of three** — don't abstract until you've seen the duplication three times.
- **Singletons as global state:** hidden coupling, test pollution, hard to reason about. Prefer DI-managed single instances.
- **Anemic domain model:** entities are just bags of getters/setters with all logic in services — loses the benefits of OO/DDD. Put behavior on the domain where it belongs (cross-ref [17](./17-architecture-patterns.md)).
- **Callback hell:** deeply nested callbacks. Use `async/await`/Promises.
- **Magic strings/numbers:** unexplained literals (`if (status === 3)`). Use enums/named constants.
- **Tight coupling:** classes that know each other's internals. Depend on interfaces (DIP), inject dependencies.

**The meta-rule:** patterns add indirection, and indirection has a cost (more files, more concepts). Apply **KISS** and **YAGNI** — reach for a pattern only when the _pressure for change_ it addresses is actually present. The mark of seniority is removing patterns that aren't earning their keep, not adding more.

---

## Common Mistakes / Red Flags (interview-specific)

- **Reciting GoF definitions without a use case.** Always pair the name with "when I'd use it" and a concrete example.
- **Not knowing when NOT to use a pattern.** Interviewers deliberately probe over-engineering — volunteer the "for two cases I'd just use an `if`" caveat.
- **Confusing similar patterns.** Adapter vs Facade (change vs simplify), Decorator vs Proxy (add behavior vs control access), Strategy vs Template Method (composition vs inheritance), Factory Method vs Abstract Factory (one product vs a family). Have a one-line discriminator for each.
- **Conflating DI / IoC / Dependency Inversion / Singleton.** Be crisp: DIP = principle, DI = technique, IoC container = the framework doing it, Singleton = lifetime.
- **Calling TS `@decorators` the GoF Decorator.** They're related in spirit but mechanically different — say so.
- **Treating Singleton as a default good.** Lead with its downsides and that NestJS gives you the benefit via DI.
- **Defending an anemic model in a clean-code/DDD shop.** Know the trade-off and that this fintech stressed clean architecture.
- **Forgetting the functional alternatives.** In JS/TS a map of functions or an HOF often beats a class hierarchy — show you pick the lighter tool.

---

## Further Reading

- **Refactoring.Guru — Design Patterns:** https://refactoring.guru/design-patterns (best illustrated catalog, with TS examples)
- **patterns.dev:** https://www.patterns.dev (modern JS/React/Node patterns — module, HOC, render props, etc.)
- **GoF — _Design Patterns: Elements of Reusable Object-Oriented Software_** (Gamma, Helm, Johnson, Vlissides) — the original catalog
- **NestJS docs — Fundamentals (Providers, Custom providers, CQRS):** https://docs.nestjs.com (DI, factory providers, command/query buses in practice)
