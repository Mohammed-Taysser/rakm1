# Software Architecture & Design Patterns (67 questions)

> Architecture is what separates senior from mid-level interviews. Once you can write a CRUD endpoint, the conversation shifts to _how_ you structure code so it survives change, scales, and stays testable. Draw on real experience here: DDD across Foody, Hirely, CineBite and the Pharmacy FEFO system; CQRS + event sourcing in CineBite and Foody; a strict layered/hexagonal architecture (presentation → application → domain → infrastructure) where the domain defines interfaces and infrastructure implements them; multi-tenancy with a Prisma tenant extension; and pnpm monorepos with shared packages plus feature-module structure in Nova ERP. Interviewers care less about you reciting GoF patterns and more about whether you know _when not_ to apply them, and how to reason about coupling, cohesion, and consistency under real constraints.

## Quick Revision Checklist

- **SOLID** = SRP, OCP, LSP, ISP, DIP — know one concrete example each.
- **DRY/KISS/YAGNI** — but premature abstraction is worse than duplication; rule of three.
- **Coupling vs cohesion** — aim for low coupling, high cohesion; this is the heart of good design.
- **Dependency Inversion** (principle) ≠ **Dependency Injection** (technique) ≠ **IoC** (container/framework).
- **Composition over inheritance** — favor "has-a"/strategy over deep class trees.
- **GoF families**: creational (Factory, Builder, Singleton), structural (Adapter, Decorator, Facade, Proxy), behavioral (Strategy, Observer, Command).
- **Repository pattern** abstracts persistence; domain talks to an interface (port), infra implements (adapter).
- **Layered architecture**: dependencies point inward; domain never imports infrastructure.
- **Clean / Hexagonal** — the dependency rule: source code dependencies only point inward toward the domain.
- **DDD building blocks**: ubiquitous language, bounded contexts, entities, value objects, aggregates + roots, domain events, repositories, domain vs application services.
- **CQRS** separates read and write models; pairs naturally with event sourcing but not required.
- **Event sourcing** stores events not state; rebuild state by replaying; auditability vs complexity.
- **Monolith → modular monolith → microservices** — don't jump to microservices prematurely; modular monolith is the strong default.
- **Microservices patterns**: API gateway, service discovery, saga, outbox, circuit breaker, eventual consistency.
- **Multi-tenancy**: shared-DB+tenant-column < schema-per-tenant < DB-per-tenant on isolation, reversed on cost/ops.
- **12-factor** + statelessness = horizontal scalability; idempotency for at-least-once delivery.
- **Monorepo vs polyrepo** — pnpm workspaces + shared packages for atomic cross-package changes.
- **CAP theorem** — under partition you pick consistency or availability; most systems tune consistency models.

## Basic

### Q1: What is the Single Responsibility Principle (SRP)?

**A:** A class/module should have one reason to change — one responsibility, one actor it answers to. Example: an `OrderService` that both calculates totals _and_ sends confirmation emails violates SRP; pricing logic and notification logic change for different reasons. Split into `PricingService` and `EmailNotifier`. In Foody I kept order-total calculation in the domain and notification dispatch in the application layer.

**Tip:** Frame SRP around "reason to change" / "actor," not "do one thing" — that wording shows depth.

### Q2: What is the Open/Closed Principle (OCP)?

**A:** Software entities should be open for extension but closed for modification. You add behavior without editing tested code. Example: a `DiscountCalculator` with a `DiscountStrategy` interface — adding a "loyalty discount" means a new class, not a `switch` edit. Strategy and polymorphism are the usual mechanisms.

**Tip:** Mention you don't apply OCP everywhere — add the extension point only when a real axis of change appears (YAGNI).

### Q3: What is the Liskov Substitution Principle (LSP)?

**A:** Subtypes must be usable anywhere their base type is expected without breaking correctness. The classic violation is `Square extends Rectangle` where setting width also changes height, breaking code that assumes independent dimensions. Another: a `ReadOnlyList` subclass of `List` that throws on `add()` violates the contract.

**Tip:** LSP is about _behavioral_ contracts, not just type signatures — preconditions can't strengthen, postconditions can't weaken.

### Q4: What is the Interface Segregation Principle (ISP)?

**A:** Clients shouldn't be forced to depend on methods they don't use. Prefer many small, focused interfaces over one fat one. Example: instead of a `Repository` with 20 methods, expose `ReadOnlyUserRepo` and `UserWriter` so a query handler only depends on reads.

**Tip:** In TypeScript this is natural — structural typing lets you accept the narrowest shape a function needs.

### Q5: What is the Dependency Inversion Principle (DIP)?

**A:** High-level modules shouldn't depend on low-level modules; both depend on abstractions. And abstractions shouldn't depend on details — details depend on abstractions. In my hexagonal setup the domain defines a `PaymentGateway` interface; the Stripe adapter in infrastructure implements it. The domain never imports Stripe.

**Tip:** Distinguish DIP (the principle, "depend on abstractions") from DI (the delivery mechanism). Interviewers love when you separate them.

### Q6: What's the difference between Dependency Inversion, Dependency Injection, and IoC?

**A:** **Dependency Inversion** is a design principle (depend on abstractions). **Dependency Injection** is a technique for _providing_ dependencies from outside (constructor/setter/parameter injection) rather than `new`-ing them inside. **Inversion of Control (IoC)** is the broader idea that a framework/container controls object creation and lifecycle and calls your code. A DI container (e.g. tsyringe, NestJS's injector) is one IoC implementation.

**Tip:** "DI is how you achieve DIP; IoC is the container that wires it" is a crisp one-liner.

### Q7: What is DRY and when does it hurt?

**A:** Don't Repeat Yourself — every piece of _knowledge_ should have a single authoritative representation. It hurts when you deduplicate code that merely _looks_ similar but represents different concepts that will evolve independently; you create coupling and a brittle shared abstraction. Two order-validation rules that happen to look alike today may diverge tomorrow.

**Tip:** Cite the rule of three: tolerate duplication until the third occurrence before abstracting.

### Q8: What are KISS and YAGNI?

**A:** **KISS** — Keep It Simple; favor the simplest design that works. **YAGNI** — You Aren't Gonna Need It; don't build for speculative future requirements. Together they fight over-engineering: no plugin system, no generic framework, no extra config knobs until there's a real need.

**Tip:** Pair with a story where you _removed_ an abstraction that wasn't paying for itself.

### Q9: Explain coupling vs cohesion.

**A:** **Coupling** is how dependent modules are on each other (want it low). **Cohesion** is how related the responsibilities inside a module are (want it high). A high-cohesion, low-coupling module does one well-defined job and has few external dependencies. Feature modules in Nova ERP aim for this: everything for "invoicing" lives together (cohesion) and talks to other features through narrow interfaces/events (low coupling).

**Tip:** "Low coupling, high cohesion" is the single best summary of good modular design — say it explicitly.

### Q10: What is separation of concerns?

**A:** Splitting a system so each part addresses a distinct concern — e.g. HTTP handling, business rules, persistence, and presentation are separate. Layered architecture is SoC applied vertically. It limits blast radius of changes and makes parts independently testable.

**Tip:** Connect it to layering: each layer is one concern.

### Q11: Composition over inheritance — why?

**A:** Inheritance creates tight, static coupling to a base class and leads to fragile deep hierarchies (the "banana, gorilla, jungle" problem). Composition builds behavior by combining small objects, is more flexible (swap collaborators at runtime), and avoids the diamond problem. Strategy and Decorator patterns are composition in action.

**Tip:** "Favor object composition over class inheritance" is straight from the GoF book.

### Q12: What is the Law of Demeter?

**A:** "Don't talk to strangers" — a method should only call methods of itself, its parameters, objects it creates, and its direct fields. Avoid `order.getCustomer().getAddress().getCity()` train wrecks; instead expose `order.shippingCity()`. Reduces coupling to internal structure.

**Tip:** It's a heuristic, not a law — fluent builders and chained query DSLs intentionally break it.

### Q13: What is the Repository pattern?

**A:** It mediates between the domain and the data layer, giving an in-memory-collection-like interface for aggregates. The domain depends on a repository _interface_; an infrastructure adapter (Prisma, Mongo) implements it. It hides query/ORM details and makes the domain testable with an in-memory fake.

**Tip:** Stress it returns/accepts _domain objects_, not ORM rows — otherwise it's just a thin DAO.

### Q14: What is a Service layer / application service?

**A:** The application layer orchestrates use cases: load aggregates via repositories, invoke domain logic, persist, dispatch events, manage transactions. It contains _no_ business rules itself (those live in the domain) — it coordinates. In my layered setup, controllers call application services, which call domain objects.

**Tip:** Differentiate from _domain_ services, which hold business logic that doesn't fit a single entity.

### Q15: What is a DTO and why use one?

**A:** A Data Transfer Object is a flat, serializable shape used to move data across a boundary (API ↔ client, layer ↔ layer). It decouples your external contract from internal domain models, prevents leaking domain invariants, and lets you version the API independently. Map domain → DTO at the edge.

**Tip:** Note DTOs have no behavior; mixing logic into them is an anti-pattern.

## Intermediate

### Q16: Walk through layered / n-tier architecture.

**A:** Classic layers: **presentation** (controllers/UI), **application** (use-case orchestration), **domain** (entities, value objects, business rules), **infrastructure** (DB, external APIs, messaging). Dependencies point downward/inward; the domain is the stable core. I enforce that the domain has zero imports from infrastructure — it only knows interfaces.

**Tip:** The senior signal is enforcing the _direction_ of dependencies, not just naming folders.

### Q17: MVC vs MVVM?

**A:** **MVC**: Model (data/logic), View (UI), Controller (handles input, updates model/view) — common in server frameworks (Express, Rails). **MVVM**: Model, View, ViewModel — the ViewModel exposes observable state the View binds to declaratively (two-way/one-way binding), popular in front-end frameworks. MVVM's key addition is data binding that removes manual view updates.

**Tip:** React isn't strictly either — it's closer to a unidirectional "Model-View-Update"/Flux flow.

### Q18: Explain Clean Architecture and the dependency rule.

**A:** Concentric circles: entities (enterprise rules) → use cases (application rules) → interface adapters → frameworks/drivers. **The dependency rule: source code dependencies only point inward.** Inner layers know nothing about outer ones. Crossing inward uses interfaces defined inside; data crosses as simple structures. It's DDD + DIP formalized into rings.

**Tip:** Emphasize that frameworks (Express, Prisma, React) live in the _outermost_ ring — they're details, swappable.

### Q19: What is hexagonal architecture (ports & adapters)? How do you use it?

**A:** The application core is isolated behind **ports** (interfaces). **Adapters** plug into those ports: _driving_ adapters (HTTP controller, CLI) call inbound ports; _driven_ adapters (Prisma repo, Stripe, email) implement outbound ports. The domain defines the interfaces; infrastructure implements them. This makes the core framework-agnostic and trivially testable — swap a real DB adapter for an in-memory one in tests.

**Tip:** Concretely: "my domain declares `interface OrderRepository`; my Prisma adapter implements it; tests use an array-backed fake." That's exactly the pattern interviewers want to hear.

### Q20: What is the ubiquitous language in DDD?

**A:** A shared, precise vocabulary used by developers _and_ domain experts, reflected directly in the code. In the Pharmacy domain "FEFO" (First-Expired-First-Out), "batch," "lot," "expiry" are real terms that appear as class and method names. It eliminates translation errors between business and code.

**Tip:** Mention the language is _bounded-context specific_ — "Product" can mean different things in catalog vs inventory.

### Q21: What is a bounded context?

**A:** An explicit boundary within which a model and its ubiquitous language are consistent. Different contexts can model the same real-world concept differently. In a restaurant system, "Order" in the _Kitchen_ context (prep tickets) differs from "Order" in _Billing_ (line items, tax). Contexts integrate via well-defined contracts (events, ACLs, shared kernels).

**Tip:** Bounded contexts are the natural seams for splitting into microservices later.

### Q22: Entity vs Value Object?

**A:** An **entity** has identity that persists over time (two orders with identical fields are still different orders — identified by ID). A **value object** is defined entirely by its attributes, is immutable, and has no identity — `Money(100, "USD")`, `Email`, `Address`. Value objects encapsulate validation and behavior.

**Tip:** Default to value objects; they shrink entities and make invalid states unrepresentable.

### Q23: What is an aggregate and an aggregate root?

**A:** An **aggregate** is a cluster of entities and value objects treated as one consistency boundary. The **aggregate root** is the single entry point — outsiders only reference the root, and it enforces all invariants. Example: an `Order` (root) owns its `OrderLine`s; you can't add a line bypassing `Order.addItem()`. One transaction = one aggregate, ideally.

**Tip:** Rule of thumb: reference other aggregates by ID, not by object reference, and keep aggregates small.

### Q24: What are domain events?

**A:** Immutable facts that something meaningful happened in the domain, named in past tense — `OrderPlaced`, `BatchExpired`, `PaymentCaptured`. Aggregates raise them; handlers react (send email, update read model, trigger other contexts). They decouple side effects from the core transaction and are the backbone of event-driven and event-sourced systems.

**Tip:** Distinguish _domain_ events (in-process, within a context) from _integration_ events (cross-service, over a broker).

### Q25: Domain service vs application service?

**A:** A **domain service** holds business logic that doesn't naturally belong to one entity/VO — e.g. a `FefoAllocationService` that picks which batches to dispense across multiple lots. An **application service** orchestrates a use case (load, call domain, save, publish) and holds no business rules. Domain services are part of the model; application services are a thin coordination layer.

**Tip:** If logic needs multiple aggregates or is a pure policy, it's likely a domain service.

### Q26: What is CQRS and when would you use it?

**A:** Command Query Responsibility Segregation separates the **write model** (commands that change state, enforce invariants) from the **read model** (queries optimized for display). They can use different schemas or even different stores. Use it when read and write needs diverge sharply, when you need denormalized read views, or alongside event sourcing. In CineBite I used a command bus for seat-reservation commands and a separate query side for showtime listings.

**Tip:** Don't apply CQRS to simple CRUD — it adds eventual consistency and sync complexity for no gain.

### Q27: What's a command bus / query bus?

**A:** A dispatcher that routes a command/query object to its single handler, decoupling the caller from the handler and giving a central place for cross-cutting concerns (validation, logging, transactions, auth) via middleware/decorators. `CommandBus.dispatch(new ReserveSeatsCommand(...))` finds `ReserveSeatsHandler`.

**Tip:** Mention the middleware pipeline — it's where you bolt on retries, idempotency, metrics.

### Q28: Explain event sourcing and its trade-offs.

**A:** Instead of storing current state, you store the ordered sequence of events; current state is derived by replaying them. Benefits: full audit log, time travel, rebuild read models, natural fit with CQRS/domain events. Trade-offs: query complexity (need projections), eventual consistency, schema/event versioning, snapshotting for performance, and a steep learning curve. CineBite used it for the reservation log so we could reconstruct exactly how seats were booked/cancelled.

**Tip:** Snapshots + projections are the two things you must mention to sound experienced.

### Q29: What is event-driven architecture?

**A:** Components communicate by producing and consuming events asynchronously via a broker (Kafka, RabbitMQ, SNS/SQS). It decouples producers from consumers (they don't know each other), enables scalability and resilience, and supports fan-out. Costs: harder debugging/tracing, eventual consistency, ordering and duplicate-delivery concerns.

**Tip:** Contrast event-_notification_ (thin events, callback for data) vs event-_carried state transfer_ (fat events) vs event sourcing — they're often conflated.

### Q30: Monolith vs microservices — how do you decide?

**A:** Monolith: one deployable, simple to develop/test/deploy, in-process calls, strong consistency — but scaling and team autonomy get hard at size. Microservices: independent deploy/scale/tech per service, team autonomy — but distributed-system complexity (network failures, eventual consistency, distributed tracing, data ownership). Decide based on team size, scaling hotspots, and clear bounded contexts — not hype.

**Tip:** Senior answer: "Start with a modular monolith; extract a service only when a clear bounded context has independent scaling or team-ownership pressure."

### Q31: What is a modular monolith?

**A:** A single deployable internally split into well-isolated modules (by bounded context) with explicit interfaces and no shared internals — like microservices' logical boundaries without the network. You get high cohesion and enforced boundaries while keeping in-process calls, ACID transactions, and simple ops. Nova ERP's feature modules are this style. It also makes later extraction to services straightforward.

**Tip:** Pitch it as the pragmatic default that keeps the microservices _option_ open without paying the cost upfront.

## Advanced

### Q32: What is the saga pattern?

**A:** A way to manage data consistency across services without distributed (2PC) transactions. A saga is a sequence of local transactions; each step publishes an event triggering the next, and each has a **compensating action** to undo on failure. Two flavors: **choreography** (services react to each other's events, decentralized) and **orchestration** (a central coordinator drives steps). Used for things like book-seat → charge-payment → issue-ticket, with compensations if payment fails.

**Tip:** Compensation, not rollback — you can't roll back a committed local transaction, you semantically reverse it.

### Q33: Explain the outbox pattern.

**A:** It solves the dual-write problem: you can't atomically write to your DB _and_ publish to a broker. Instead, in the same DB transaction, write the domain change _and_ an event row to an `outbox` table. A separate relay/poller (or CDC like Debezium) reads the outbox and publishes to the broker, marking rows sent. Guarantees at-least-once delivery consistent with your data.

**Tip:** Pair it with idempotent consumers because the relay may publish duplicates.

### Q34: What is the circuit breaker pattern?

**A:** Wraps calls to a flaky dependency and "trips" after a failure threshold, short-circuiting further calls (failing fast) instead of piling up timeouts. States: **closed** (normal), **open** (reject immediately), **half-open** (let a trial request through to test recovery). Prevents cascading failures and resource exhaustion.

**Tip:** Mention pairing with timeouts, retries-with-backoff, and bulkheads as a resilience toolkit.

### Q35: What is eventual consistency and how do you handle it in the UI?

**A:** In distributed systems data converges to a consistent state _over time_ rather than instantly. Handle it by: optimistic UI updates, showing pending/processing states, idempotent retries, read-your-writes via sticky reads or returning the command result, and designing UX that tolerates slight staleness. CQRS read models are typically eventually consistent with the write side.

**Tip:** Name the consistency you actually need per use case — money usually needs stronger guarantees than a "likes" count.

### Q36: Explain the CAP theorem and consistency models.

**A:** Under a network **P**artition you must choose between **C**onsistency (every read sees the latest write) and **A**vailability (every request gets a response). You can't have all three during a partition; without a partition you can have both. Most systems are tunable (e.g. quorum reads/writes). Beyond CAP, **PACELC** adds: else (no partition) trade latency vs consistency. Models range from strong/linearizable → causal → eventual.

**Tip:** Real databases let you pick per-operation (e.g. Mongo write concern, Cassandra consistency level) — say that to avoid sounding academic.

### Q37: Compare multi-tenancy architectures.

**A:** Three main models: **shared DB + tenant column** (one schema, every row tagged with `tenantId`, row-level scoping) — cheapest, easiest to operate, weakest isolation, noisy-neighbor risk. **Schema-per-tenant** — one DB, isolated schemas, middle ground. **DB-per-tenant** — strongest isolation, easiest per-tenant backup/restore and compliance, but operationally heavy and expensive at scale. Trade-off axis: isolation/compliance vs cost/operational simplicity.

**Tip:** Add migration and "noisy neighbor" considerations — they signal production experience.

### Q38: How did you implement multi-tenancy with Prisma?

**A:** Shared DB + `tenantId` column with a **Prisma client extension** that automatically injects the current tenant's id into every `where` clause and sets it on every `create`, so application code can't accidentally leak across tenants. The tenant id comes from request context (JWT/subdomain). This centralizes row-level scoping instead of scattering `where: { tenantId }` everywhere.

**Tip:** Mention defense-in-depth: the extension plus DB row-level security (RLS) if the engine supports it.

### Q39: Monorepo vs polyrepo — trade-offs?

**A:** **Monorepo**: atomic cross-package changes, shared tooling/config, easy code sharing, single source of truth — but needs good tooling (pnpm workspaces, Turborepo/Nx) and CI scoping to scale. **Polyrepo**: clear ownership and independent lifecycle/versioning per repo — but cross-cutting changes need coordinated PRs and version bumps. I use pnpm workspaces with shared packages (types, domain, utils) in Pharmacy FEFO so the backend, web, and shared validation evolve together.

**Tip:** Call out that monorepo ≠ monolith — you can have a monorepo of microservices.

### Q40: How do pnpm workspaces help in a MERN monorepo?

**A:** pnpm uses a content-addressable store with symlinks, so installs are fast and disk-efficient, and workspace protocol (`workspace:*`) links internal packages without publishing. You share a `packages/shared` (Zod schemas, DTOs, domain types) consumed by both `apps/api` and `apps/web`, giving end-to-end type safety. Strict node_modules prevents phantom dependencies.

**Tip:** Mention build orchestration (Turborepo/Nx) for caching and only-rebuild-what-changed.

### Q41: What is an API gateway and service discovery?

**A:** An **API gateway** is a single entry point for clients that handles routing, auth, rate limiting, aggregation, and TLS termination — clients don't call services directly. **Service discovery** lets services find each other's dynamic network locations via a registry (Consul, Eureka) or platform DNS (Kubernetes services), instead of hard-coded hosts.

**Tip:** Distinguish gateway (north-south, client↔services) from service mesh (east-west, service↔service).

### Q42: What is a BFF (Backend-for-Frontend)?

**A:** A dedicated backend tailored to a specific frontend (web, mobile), aggregating and shaping downstream service/data calls to exactly what that client needs. It avoids over-fetching, hides service complexity, and lets web and mobile evolve independently without bloating a shared API.

**Tip:** Contrast with GraphQL, which can serve a similar "shape data per client" role without a custom BFF per platform.

### Q43: Explain the 12-factor app methodology (the key factors).

**A:** Best practices for SaaS: codebase in VCS, declared/isolated **dependencies**, **config in environment** (not code), backing services as attached resources, strict **build/release/run** separation, **stateless processes**, port binding, concurrency via the process model, disposability (fast startup/graceful shutdown), dev/prod parity, **logs as event streams** (to stdout), admin tasks as one-off processes.

**Tip:** The interview-critical ones: config in env, stateless processes, logs to stdout — these enable containerization and horizontal scaling.

### Q44: Why does statelessness enable horizontal scaling?

**A:** Stateless processes keep no client session state in memory, so any instance can serve any request and you can add/remove instances freely behind a load balancer. Session/state goes to a shared store (Redis, DB, JWT). Without statelessness you'd need sticky sessions, which limit balancing and complicate failover.

**Tip:** Contrast vertical scaling (bigger machine, hits a ceiling) vs horizontal (more machines, needs statelessness + a load balancer).

### Q45: What is idempotency and why does it matter with at-least-once delivery?

**A:** An idempotent operation produces the same result whether applied once or many times. Message brokers and retried HTTP calls give **at-least-once** delivery — duplicates happen. Make consumers idempotent via an idempotency key, deduplication table, or natural upserts, so reprocessing a duplicate event doesn't double-charge or double-create.

**Tip:** Real example: an idempotency key on payment commands so a retried "capture payment" doesn't charge twice.

### Q46: How does caching fit into architecture?

**A:** Layers: client/browser cache, CDN (static + edge), API/response cache, application cache (in-memory/Redis), and DB query cache. Strategies: **cache-aside** (app loads on miss, writes through/around), **read-through/write-through**, and TTL or event-based invalidation. The hard part is invalidation and avoiding stampedes (use locks/jitter). Cache reduces latency and load but adds a consistency dimension.

**Tip:** "There are only two hard things: cache invalidation and naming" — but follow it with a real strategy (cache-aside + TTL + event invalidation).

### Q47: Feature-based vs layer-based folder structure?

**A:** **Layer-based** groups by technical type (`/controllers`, `/services`, `/models`) — simple early, but a single feature scatters across folders and coupling creeps in. **Feature-based** (vertical slices) groups everything for a feature together (`/invoicing` with its routes, service, domain, tests) — higher cohesion, clearer ownership, easier to extract later. Nova ERP uses feature modules.

**Tip:** Feature folders scale better with team size; you can still layer _inside_ each feature.

### Q48: What is API-first design?

**A:** Design and agree the API contract (OpenAPI/GraphQL schema) _before_ implementation, so frontend, backend, and consumers work in parallel against a stable contract, generate clients/mocks/types from it, and treat the contract as the source of truth. It catches integration issues early and enables contract testing.

**Tip:** Tie to your shared monorepo package: generate types from the schema so client and server can't drift.

### Q49: Give a concrete Strategy pattern example.

**A:** Encapsulate interchangeable algorithms behind a common interface and pick one at runtime — composition over a `switch`.

```ts
interface ShippingStrategy {
  cost(weightKg: number): number;
}
class StandardShipping implements ShippingStrategy {
  cost(w: number) {
    return 5 + w * 0.5;
  }
}
class ExpressShipping implements ShippingStrategy {
  cost(w: number) {
    return 15 + w * 1.2;
  }
}

class Checkout {
  constructor(private strategy: ShippingStrategy) {}
  total(weight: number, subtotal: number) {
    return subtotal + this.strategy.cost(weight);
  }
}
new Checkout(new ExpressShipping()).total(3, 100); // strategy injected
```

**Tip:** Note this is OCP in practice — add a new carrier by adding a class, never editing `Checkout`.

### Q50: Show a Repository interface + adapter (ports & adapters).

**A:** Domain defines the port; infrastructure implements it; tests fake it.

```ts
// domain/ports/OrderRepository.ts  (the PORT — pure interface, no Prisma)
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

// infrastructure/PrismaOrderRepository.ts  (the ADAPTER)
export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}
  async findById(id: string) {
    const row = await this.prisma.order.findUnique({ where: { id } });
    return row ? OrderMapper.toDomain(row) : null; // map row -> domain aggregate
  }
  async save(order: Order) {
    await this.prisma.order.upsert({
      /* map domain -> row */
    });
  }
}
```

**Tip:** The mapper is the senior detail — the repo returns _domain aggregates_, never raw ORM rows.

### Q51: Show a value object with validation.

**A:** Immutable, self-validating, equality by value.

```ts
export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: string,
  ) {}
  static of(amount: number, currency: string): Money {
    if (!Number.isFinite(amount) || amount < 0)
      throw new Error("Invalid amount");
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Invalid currency");
    return new Money(amount, currency);
  }
  add(other: Money): Money {
    if (other.currency !== this.currency) throw new Error("Currency mismatch");
    return new Money(this.amount + other.amount, this.currency);
  }
  equals(o: Money) {
    return this.amount === o.amount && this.currency === o.currency;
  }
}
```

**Tip:** Private constructor + static factory makes invalid `Money` unrepresentable — a hallmark of good DDD.

### Q52: Show an aggregate root raising a domain event.

**A:** The root enforces invariants and records events; the application layer publishes them after persistence.

```ts
class Order {
  private events: DomainEvent[] = [];
  private lines: OrderLine[] = [];
  private constructor(
    readonly id: string,
    private status: "DRAFT" | "PLACED",
  ) {}

  addItem(productId: string, qty: number) {
    if (this.status !== "DRAFT")
      throw new Error("Cannot modify a placed order");
    this.lines.push(new OrderLine(productId, qty));
  }
  place() {
    if (this.lines.length === 0) throw new Error("Empty order");
    this.status = "PLACED";
    this.events.push(new OrderPlaced(this.id, new Date())); // record fact
  }
  pullEvents() {
    const e = this.events;
    this.events = [];
    return e;
  }
}
```

**Tip:** Events are _recorded_ in the aggregate and _dispatched_ by the app layer after `save()` — keeps the domain pure.

### Q53: Show a CQRS command + handler.

**A:** Command = intent (data only); handler = the use case orchestration.

```ts
class ReserveSeatsCommand {
  constructor(
    readonly showtimeId: string,
    readonly seats: string[],
    readonly userId: string,
  ) {}
}

class ReserveSeatsHandler {
  constructor(
    private repo: ShowtimeRepository,
    private bus: EventBus,
  ) {}
  async execute(cmd: ReserveSeatsCommand) {
    const showtime = await this.repo.findById(cmd.showtimeId);
    if (!showtime) throw new Error("Showtime not found");
    showtime.reserve(cmd.seats, cmd.userId); // domain enforces availability
    await this.repo.save(showtime);
    for (const e of showtime.pullEvents()) await this.bus.publish(e);
  }
}
```

**Tip:** The query side (listing showtimes/seat maps) reads a separate denormalized projection — that's the CQRS split.

### Q54: Show multi-tenant row-level scoping.

**A:** Centralize tenant scoping so it can't be forgotten — here via a Prisma client extension.

```ts
function tenantScoped(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, operation }) {
          if (
            ["findMany", "findFirst", "updateMany", "deleteMany"].includes(
              operation,
            )
          ) {
            args.where = { ...args.where, tenantId };
          }
          if (operation === "create") args.data = { ...args.data, tenantId };
          return query(args);
        },
      },
    },
  });
}
// per-request: const db = tenantScoped(prisma, ctx.tenantId);
```

**Tip:** Add DB row-level security as defense-in-depth so a bug in app code still can't cross tenants.

### Q55: Explain the Decorator pattern with a use case.

**A:** Wrap an object to add behavior dynamically without changing it or subclassing, all sharing one interface — composable layers. Example: wrap a `UserRepository` with `CachingUserRepository` and `LoggingUserRepository`, each delegating to the inner one. In Node, Express middleware and CQRS bus middleware are decorator-flavored.

**Tip:** Contrast with inheritance: you can stack/reorder decorators at runtime; subclasses are fixed at compile time.

### Q56: Explain the Observer pattern (and Pub/Sub).

**A:** **Observer**: a subject maintains a list of observers and notifies them on state change (direct references). **Pub/Sub** is a looser variant where publishers and subscribers are decoupled through a broker/event bus and don't know each other. Node's `EventEmitter`, domain-event handlers, and front-end state subscriptions are observer/pub-sub in practice.

**Tip:** Key difference: Observer has a direct subject↔observer link; Pub/Sub adds a broker so the two sides are fully decoupled.

### Q57: Explain Factory / Factory Method / Abstract Factory.

**A:** A **simple factory** centralizes object creation behind a function. **Factory Method** defers instantiation to subclasses (an overridable `createX()`). **Abstract Factory** produces _families_ of related objects (e.g. a `UiKitFactory` making matching `Button` + `Modal` per theme). All hide concrete classes and `new` from callers, easing substitution and testing.

**Tip:** In TS, you rarely need Abstract Factory — a config object + simple factory function usually suffices (KISS).

### Q58: When is the Singleton pattern appropriate, and what are the risks?

**A:** Singleton ensures one instance with a global access point — reasonable for a config object, logger, or DB connection pool. Risks: it's effectively global state (hidden coupling, hard to test, ordering issues), and in serverless/clustered environments "one instance" isn't truly global. Prefer providing the single instance via a DI container rather than a hard-coded `getInstance()`.

**Tip:** "Singleton is often a code smell — use DI scope/lifetime to get one instance without the global." Strong senior take.

### Q59: Explain the Builder pattern.

**A:** Construct a complex object step by step, separating construction from representation, useful when there are many optional parameters or required validation at the end. `new QueryBuilder().where(...).orderBy(...).limit(10).build()`. Avoids telescoping constructors and keeps invalid intermediate states internal until `build()`.

**Tip:** Fluent builders intentionally violate Law of Demeter — that's an accepted trade for readability.

### Q60: Explain Adapter, Facade, and Proxy briefly.

**A:** **Adapter** converts one interface to another so incompatible classes collaborate (wrap a third-party SDK to match your port). **Facade** provides a simple unified interface over a complex subsystem (an application service can act as a facade). **Proxy** stands in for another object to add access control, lazy loading, or caching while keeping the same interface.

**Tip:** Adapter changes the interface; Decorator keeps the interface but adds behavior; Proxy keeps the interface and controls access — knowing the distinction impresses.

### Q61: Explain Command, Chain of Responsibility, and Mediator.

**A:** **Command** encapsulates a request as an object (enables queuing, logging, undo) — the C in CQRS. **Chain of Responsibility** passes a request along handlers until one handles it — exactly Express/Koa middleware. **Mediator** centralizes communication between components so they don't reference each other directly — a command bus or an event aggregator is a mediator, reducing many-to-many coupling.

**Tip:** Tie each to something you've used (middleware = CoR, command bus = Command + Mediator) — concrete beats textbook.

### Q62: Explain Template Method, Iterator, and Composite.

**A:** **Template Method** defines an algorithm skeleton in a base method with overridable steps (e.g. a base request handler with `validate()`/`authorize()`/`handle()` hooks). **Iterator** provides sequential access without exposing the underlying structure (JS iterators/generators). **Composite** treats individual objects and compositions uniformly via a tree (a menu with nested sub-menus, or a file/folder tree).

**Tip:** In JS, prefer the built-in iteration protocol (`Symbol.iterator`, generators) over hand-rolling Iterator.

### Q63: Module pattern vs Revealing Module pattern (JS)?

**A:** The **module pattern** uses a closure (IIFE/ES module) to create private state and expose a public API, enforcing encapsulation. The **revealing module pattern** defines everything privately, then returns an object that maps public names to private functions — making the public API explicit in one place at the bottom.

**Tip:** ES modules largely supersede these — file scope gives privacy by default; mention that to stay current.

### Q64: What is a DI container and do you always need one?

**A:** A DI container automatically resolves and wires dependencies by registering bindings (interface → implementation) and managing lifetimes (singleton/scoped/transient) — e.g. NestJS's injector, tsyringe, InversifyJS. You don't always need one; manual "poor man's DI" (constructing and passing dependencies in a composition root) is perfectly fine for small/medium apps and is more explicit.

**Tip:** "A composition root with manual wiring beats a container until wiring becomes painful" — pragmatic and senior.

### Q65: What distributed-system challenges appear when splitting a monolith?

**A:** Network unreliability (timeouts, partial failures), data consistency across service-owned databases (no cross-service transactions → sagas/eventual consistency), distributed tracing/observability, service versioning and contract evolution, increased latency from network hops, deployment/orchestration complexity, and security between services. Each service should own its data — no shared DB.

**Tip:** "Database-per-service" is the rule people forget; a shared DB makes a distributed monolith — the worst of both worlds.

### Q66: How do you keep the domain layer pure and testable?

**A:** No imports of frameworks, ORMs, or I/O in the domain — only language primitives, value objects, entities, and interfaces (ports). Side effects (DB, HTTP, time, randomness) are injected as dependencies or expressed as events. Then domain logic is unit-tested with plain objects and in-memory fakes, no DB or mocks of frameworks needed.

**Tip:** Mention injecting a `Clock`/`IdGenerator` so domain logic with time/ids stays deterministic in tests.

### Q67: How does CQRS combine with event sourcing in practice?

**A:** Commands change the write model, which appends events to an event store (the source of truth). **Projectors** subscribe to those events and build/update denormalized read models optimized for queries. Reads hit the projections; writes hit the event-sourced aggregates. They're separable — you can do CQRS with two relational schemas and no event sourcing, or event sourcing feeding a single read model.

**Tip:** Stress they're _independent_ choices that compose well — conflating them is a common interview slip.

## Common Mistakes / Red Flags

- **Pattern golden-hammering**: forcing GoF patterns everywhere instead of the simplest design (violates KISS/YAGNI). Patterns are vocabulary, not goals.
- **Jumping to microservices** for a small team/app — distributed complexity with none of the benefits; you end up with a distributed monolith.
- **Shared database across microservices** — couples services at the data layer and kills independent deployability.
- **Anemic domain model** — entities are just getters/setters and all logic lives in "services"; that's procedural code, not DDD.
- **Leaky repository** returning ORM entities/rows instead of domain objects, so persistence concerns spread into the domain.
- **Confusing DIP with DI** or claiming a DI container _is_ dependency inversion.
- **Over-applying CQRS/event sourcing** to plain CRUD, paying eventual-consistency and projection costs for nothing.
- **Treating DRY as absolute** and coupling unrelated code under a premature shared abstraction.
- **God aggregates / huge bounded contexts** that try to keep everything strongly consistent in one transaction.
- **Forgetting idempotency** with at-least-once delivery → double charges/duplicate records on retries.
- **Multi-tenant scoping scattered in queries** rather than centralized — one missed `where` leaks data across tenants.
- **Calling MVC, layered, hexagonal, and clean architecture "the same thing"** — they overlap but the dependency rule and ports/adapters are distinct ideas.
- **Stateful app servers** that block horizontal scaling; storing session state in process memory.
- **Saying "we'll roll back the distributed transaction"** — there's no 2PC rollback across committed local txns; you use compensating actions.

## Further Reading

- [Domain-Driven Design Reference (Eric Evans, PDF)](https://www.domainlanguage.com/ddd/reference/)
- [Martin Fowler — Patterns of Enterprise Application Architecture & bliki (CQRS, Event Sourcing, BoundedContext, Microservices)](https://martinfowler.com/)
- [The Twelve-Factor App](https://12factor.net/)
- [microservices.io — patterns catalog (Saga, Outbox, API Gateway, Circuit Breaker)](https://microservices.io/patterns/)
