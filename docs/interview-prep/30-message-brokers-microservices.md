# Message Brokers & Microservice Communication (41 questions)

> Once a fintech system grows past a single service, the hard problems stop being "how do I write this endpoint" and become "how do these services talk reliably, in order, without losing or double-processing money-moving events." Message brokers and well-chosen communication styles give you decoupling (producers don't know consumers), load-leveling (buffer spikes), resilience (a down consumer doesn't take the producer with it), and scale (add consumers for parallelism). This builds directly on your Redis/BullMQ job-queue experience (a lightweight broker) and your DDD/CQRS work on CineBite/Foody/Pharmacy — domain events, read-model projections, sagas, and the outbox pattern are the production-grade version of "fire a job after a DB write." Cross-references: `14-redis-jobs-caching.md` (BullMQ/Redis pub-sub/Streams), `17-architecture-patterns.md` (microservices, saga, outbox, CAP), `15-realtime-websockets.md`, `10-rest-api-design.md`, `09-nestjs.md` (NestJS transports).

## Quick Revision Checklist

- **Async messaging decouples** producers and consumers in time, space, and load; sync coupling propagates failures.
- **Queue (point-to-point):** one message → one consumer. **Pub/sub (topics):** one event → many subscribers.
- **Message queue** = consume-and-delete work distribution. **Event log/stream (Kafka)** = durable, replayable, offset-based.
- **RabbitMQ** = smart broker / AMQP, rich routing (exchanges, bindings, routing keys), push to consumers, ack/nack, DLX.
- **Kafka** = distributed commit log; topics → partitions → offsets; consumer groups for parallelism; per-partition ordering; replay.
- **Kafka vs RabbitMQ:** retention/replay vs consume-and-delete; raw throughput vs flexible routing; pull vs push.
- **BullMQ/Redis** = in-house lightweight job queue (your stack); Redis Streams is a middle ground; outgrow it for multi-consumer replay/high throughput.
- **gRPC** = HTTP/2 + Protobuf RPC, strongly typed, 4 call types, great for internal service-to-service; browsers need grpc-web.
- **Delivery semantics:** at-most-once, at-least-once (the default to design for), exactly-once (hard → "effectively once" via idempotency).
- **Idempotent consumers + dedup** are mandatory in fintech: process the same message twice, get the same result.
- **Outbox pattern:** write domain change + event in one DB transaction, relay publishes — no lost/dual-write events.
- **Saga:** distributed transaction via local txns + compensations; choreography (events) vs orchestration (coordinator).
- **Event-driven:** events (fact, past tense) vs commands (intent) vs messages; event sourcing + CQRS read models.
- **Schema evolution:** version events, add optional fields, never break consumers; schema registry enforces compatibility.
- **NestJS `@MessagePattern`** (request-response) vs **`@EventPattern`** (fire-and-forget); transporters TCP/Redis/RMQ/Kafka/NATS/gRPC.
- **Operations:** watch consumer lag/queue depth, apply backpressure, scale consumers/partitions, DLQ poison messages with retries+backoff.
- **Don't start with microservices:** modular monolith first; messaging adds real operational complexity.

## Basic

### Q1: Why use asynchronous messaging / a message broker at all?

**A:** A broker sits between producers and consumers so they never call each other directly. This buys you four things:

1. **Decoupling** — the producer doesn't know who consumes, how many, or whether they're up. You can add consumers without touching producers.
2. **Load-leveling / buffering** — a spike in orders is absorbed in the queue and drained at the consumer's pace instead of overwhelming it.
3. **Resilience** — if the consumer is down, messages wait; the producer keeps working. No cascading failure.
4. **Scalability & async processing** — slow work (emails, PDF statements, reconciliation) happens off the request path; add workers for throughput.

**Tip:** Frame it as "temporal decoupling" — producer and consumer don't have to be available at the same time. That single phrase signals you understand the core value.

### Q2: Synchronous vs asynchronous communication — what's the trade-off?

**A:** **Synchronous** (REST, gRPC unary): caller blocks waiting for a response. Simple mental model, immediate result, easy error handling — but tight runtime coupling: if the callee is slow or down, the caller is too (latency stacks, failures cascade). **Asynchronous** (messages/events): caller fires and moves on; processing happens later. Decoupled and resilient, but eventual consistency, harder debugging, and no immediate answer.

**Tip:** Use sync when you need an answer _now_ to continue (e.g., "is this card valid?"). Use async when the work can happen later and you care about throughput/resilience (e.g., "send the receipt", "update the ledger projection").

### Q3: What is the difference between a message queue and an event stream/log?

**A:**

- **Message queue (RabbitMQ, SQS, BullMQ):** a message is a unit of _work_. A consumer takes it, processes it, acks, and it's **removed**. Competing consumers share the load. Think "to-do list."
- **Event stream / commit log (Kafka, Redis Streams):** events are appended to an ordered, **durable log**. Consumers read at their own **offset** and the data **stays** (retention), so multiple independent consumers can read the same events, and you can **replay** from the past. Think "append-only ledger you can re-read."

**Tip:** The one-liner: _queue = consume-and-delete; log = read-and-retain (replayable)._ Fintech loves the log model for audit trails.

### Q4: Point-to-point (queue) vs publish/subscribe (topic)?

**A:**

- **Point-to-point:** one message is delivered to exactly **one** of the consumers on a queue. Used for distributing work (task queues).
- **Publish/subscribe:** one event is delivered to **every** interested subscriber (each gets its own copy). Used for broadcasting facts ("PaymentCompleted" → ledger, notifications, analytics all react).

**Tip:** RabbitMQ does both via exchanges; a `fanout` exchange = pub/sub, a single bound queue with competing consumers = point-to-point. Kafka does pub/sub via topics, and competing consumers within a _consumer group_ gives point-to-point semantics per partition.

### Q5: Define producer, consumer, and broker.

**A:** **Producer** publishes messages/events. **Consumer** (or subscriber) receives and processes them. **Broker** is the middleware that accepts, stores, routes, and delivers messages, handling persistence, delivery guarantees, and routing. In RabbitMQ the broker is "smart" (does routing); in Kafka the broker is comparatively "dumb" storage and consumers track their own position.

**Tip:** "Producer" and "publisher" are interchangeable; "consumer" and "subscriber" too, though "subscriber" leans pub/sub.

### Q6: Smart broker / dumb consumer vs dumb broker / smart consumer?

**A:** Two design philosophies:

- **Smart broker, dumb consumer (RabbitMQ):** the broker does the heavy lifting — routing logic, tracking which messages were acked, redelivery, per-message state. Consumers are simple: "give me the next message." Broker holds delivery state.
- **Dumb broker, smart consumer (Kafka):** the broker just appends and serves a log; **consumers** are smart — they track their own offset, decide what to read, manage replay. This keeps the broker simple and lets it scale to huge throughput.

**Tip:** This distinction explains _why_ Kafka scales so high (the broker does almost nothing per message) and _why_ RabbitMQ has richer routing (the broker is doing the work).

### Q7: What is RabbitMQ in one sentence, and what protocol does it use?

**A:** RabbitMQ is a traditional, general-purpose **message broker** implementing **AMQP 0-9-1** (also supports MQTT, STOMP). Producers publish to an **exchange**, which routes to **queues** via **bindings**, and consumers read from queues. It excels at flexible routing, task distribution, and RPC.

**Tip:** Say "broker," not "queue" — RabbitMQ's routing layer (exchanges) is the differentiator.

### Q8: What is Kafka in one sentence?

**A:** Kafka is a **distributed event-streaming platform** built around a partitioned, replicated, append-only **commit log**. It is _not_ a traditional queue: messages are retained (by time/size or compaction) and read by offset, so many consumers can read and replay the same stream at high throughput.

**Tip:** If you only say "Kafka is a message queue," interviewers will push back. Lead with "distributed commit log / event streaming."

### Q9: What is gRPC?

**A:** A high-performance **RPC framework** by Google: calls go over **HTTP/2**, payloads are serialized with **Protocol Buffers** (compact binary), and the service contract is defined in a `.proto` **IDL** from which client/server code is **generated** in many languages. Strongly typed, fast, supports streaming. Ideal for **internal** service-to-service calls.

**Tip:** Contrast with REST: gRPC is contract-first and binary; REST is typically JSON over HTTP/1.1 and resource-oriented.

### Q10: Events vs commands vs messages — what's the difference?

**A:**

- **Command:** an instruction to do something, directed at one handler, can be rejected. Imperative, present tense: `CreatePayment`.
- **Event:** a statement that something _happened_. Past tense, immutable fact, broadcast to anyone interested: `PaymentCompleted`.
- **Message:** the generic envelope; both commands and events are messages.

**Tip:** Commands imply coupling (you expect a specific handler); events imply decoupling (publisher doesn't care who reacts). Choreography uses events; orchestration uses commands.

## Intermediate

### Q11: Walk through RabbitMQ exchanges and the four exchange types.

**A:** Producers never publish directly to a queue; they publish to an **exchange** with a **routing key**. The exchange routes to bound queues:

- **Direct:** routes to queues whose binding key exactly equals the routing key. (e.g., `payment.failed` → failures queue.)
- **Topic:** pattern matching with wildcards `*` (one word) and `#` (zero+ words). `payment.*.eu` style routing.
- **Fanout:** ignores routing key, broadcasts to **all** bound queues (pub/sub).
- **Headers:** routes on message header attributes instead of routing key (rare).

**Tip:** Topic exchanges are the workhorse for event-driven routing; fanout for pure broadcast.

### Q12: Explain acknowledgements, nack, and publisher confirms in RabbitMQ.

**A:**

- **Consumer ack (`basic.ack`):** consumer tells the broker "processed successfully, delete it." With **manual ack**, you ack only _after_ the work succeeds, so a crash mid-processing redelivers the message (at-least-once).
- **Nack / reject (`basic.nack`, `basic.reject`):** "couldn't process." With `requeue=false` it goes to the DLX; `requeue=true` puts it back.
- **Publisher confirms:** the broker asynchronously confirms it durably accepted a published message, so the producer knows it wasn't lost.

**Tip:** **Never use auto-ack** for important work — the broker deletes on delivery, so a crash loses the message. Manual ack after success = at-least-once.

### Q13: What are dead-letter exchanges (DLX), message TTL, and poison messages?

**A:** A **poison message** is one that repeatedly fails (bad data, a bug) and would loop forever if requeued. A **dead-letter exchange** is where messages go when they're rejected (`nack`/`reject` with no requeue), expire via **message TTL**, or exceed a max length. You bind a **dead-letter queue** to the DLX to inspect, alert, and reprocess failures out-of-band.

```js
// amqplib: declare a queue that dead-letters to a DLX, with a per-message TTL
await ch.assertExchange("orders.dlx", "fanout", { durable: true });
await ch.assertQueue("orders.dead", { durable: true });
await ch.bindQueue("orders.dead", "orders.dlx", "");

await ch.assertQueue("orders", {
  durable: true,
  arguments: {
    "x-dead-letter-exchange": "orders.dlx",
    "x-message-ttl": 60000, // expire after 60s -> DLX
    "x-max-length": 100000,
  },
});
```

**Tip:** Pair a DLX with a retry count header — after N failed attempts, send to DLQ instead of requeuing forever.

### Q14: What are prefetch/QoS, durability, and persistence in RabbitMQ?

**A:**

- **Prefetch (QoS, `basic.qos` / `prefetch`):** limits how many unacked messages a consumer holds at once. Without it, RabbitMQ pushes everything to the first consumer, starving others. Set `prefetch=1` (or a small number) for fair dispatch and backpressure.
- **Durability:** declare the **queue/exchange durable** so they survive a broker restart.
- **Persistence:** mark **messages persistent** (`deliveryMode: 2`) so they're written to disk. You need _both_ durable queue _and_ persistent messages to survive a crash (still not 100% — there's a brief window; publisher confirms close it).

**Tip:** "Durable" = the topology survives restart; "persistent" = the message survives restart. Common gotcha to call out.

### Q15: Explain Kafka topics, partitions, and offsets.

**A:** A **topic** is a named stream. Each topic is split into **partitions** — independent ordered logs. Each message in a partition has a monotonically increasing **offset**. Partitions are the unit of **parallelism** and **ordering**: order is guaranteed _within_ a partition, not across. Consumers track the offset they've read up to (committed offsets), so they can resume or replay.

```
Topic "payments"  (3 partitions)
P0: [0:A][1:B][2:C] ...
P1: [0:D][1:E] ...
P2: [0:F][1:G][2:H] ...
                ^ consumer offset
```

**Tip:** More partitions = more parallel consumers possible, but cost ordering scope and add overhead. Pick partition count for target throughput/parallelism.

### Q16: How do consumer groups and partition assignment give parallelism?

**A:** A **consumer group** is a set of consumers sharing a `group.id`. Kafka assigns each **partition to exactly one consumer in the group**, so work is split with no double-processing inside the group. If you have 3 partitions and 3 consumers, each gets one; add a 4th consumer and it sits idle (partitions cap parallelism). **Different groups** each get the _full_ stream independently (pub/sub across groups, point-to-point within a group). A **rebalance** reassigns partitions when consumers join/leave.

**Tip:** "Partitions are the unit of parallelism" — you can't have more _active_ consumers per group than partitions.

### Q17: How does Kafka guarantee ordering, and how do keys/partitioning work?

**A:** Ordering is **per-partition only**. The producer chooses the partition: if you set a **message key**, Kafka hashes it to a partition, so all messages with the same key (e.g., same `accountId`) land in the same partition and stay ordered relative to each other. No key → round-robin (no per-entity ordering).

**Tip:** In fintech, key by the entity whose order matters (account, ledger, order id) so all events for that entity are strictly ordered. This is the standard answer to "how do you keep events ordered in Kafka."

### Q18: Kafka brokers, cluster, replication, ISR, and ZooKeeper vs KRaft?

**A:** A Kafka **cluster** is multiple **brokers** (servers). Each partition has one **leader** and several **follower replicas** on other brokers (`replication.factor`). Producers/consumers talk to the leader; followers copy it. The **ISR (in-sync replicas)** is the set of replicas fully caught up; with `acks=all` a write is acknowledged only after all ISR have it — that's how you survive a broker loss. **ZooKeeper** historically managed cluster metadata; modern Kafka uses **KRaft** (built-in Raft consensus), removing the ZooKeeper dependency.

**Tip:** `acks=all` + `replication.factor=3` + `min.insync.replicas=2` is the durable fintech default.

### Q19: Kafka vs RabbitMQ — the classic interview question.

**A:**

| Aspect                    | RabbitMQ                              | Kafka                                       |
| ------------------------- | ------------------------------------- | ------------------------------------------- |
| Model                     | Message broker (AMQP)                 | Distributed commit log / streaming          |
| After consume             | Message removed                       | Retained; replayable by offset              |
| Delivery to consumer      | **Push** (broker pushes)              | **Pull** (consumer polls)                   |
| Routing                   | Rich (exchanges, topic/direct/fanout) | Minimal (topic + partition by key)          |
| Ordering                  | Per-queue, weakened by redelivery     | Strict per-partition                        |
| Throughput                | High                                  | Very high (sequential disk, batching)       |
| Replay / multiple readers | Hard (gone once acked)                | Native (offsets, retention)                 |
| Best for                  | Task queues, complex routing, RPC     | Event streaming, sourcing, analytics, audit |

**Tip:** Soundbite: _"RabbitMQ routes and distributes work; Kafka stores and streams a replayable log. Choose RabbitMQ for flexible task routing, Kafka for high-throughput, multi-consumer, replayable event streams."_

### Q20: Where do Redis pub/sub and BullMQ fit versus Kafka/RabbitMQ?

**A:** They're lighter-weight and live in your existing stack (`14-redis-jobs-caching.md`):

- **Redis pub/sub:** fire-and-forget broadcast, **no persistence** — if a subscriber is offline, it misses the message. Great for ephemeral fan-out (e.g., WebSocket fan-out, cache invalidation), bad for guaranteed delivery.
- **BullMQ (Redis-backed):** a real **job queue** with persistence, retries, delays, rate limiting, scheduling. Perfect for background jobs (emails, statement generation, FEFO recalculation) within one app/team. Effectively a queue, not an event log.
- **Redis Streams:** a **middle ground** — an append-only log with consumer groups (`XADD`/`XREADGROUP`), giving Kafka-like semantics at small scale without operating a Kafka cluster.

**Tip:** "When does BullMQ stop being enough?" → When you need durable multi-consumer replay, very high throughput across teams, cross-language event contracts, or long retention/audit — then reach for Kafka. Until then, BullMQ keeps ops simple.

### Q21: What are the four gRPC call types?

**A:**

1. **Unary:** one request → one response (like a normal function/RPC).
2. **Server streaming:** one request → a stream of responses (e.g., live price feed).
3. **Client streaming:** a stream of requests → one response (e.g., upload chunks, then a summary).
4. **Bidirectional streaming:** both sides stream independently over one connection (e.g., chat, real-time sync).

All ride one HTTP/2 connection (multiplexed).

**Tip:** Mention HTTP/2 multiplexing — it's why streaming and many concurrent calls are cheap.

### Q22: Show a protobuf service definition and a unary gRPC call.

**A:**

```protobuf
// payment.proto
syntax = "proto3";
package payment;

service PaymentService {
  rpc GetBalance (BalanceRequest) returns (BalanceResponse);   // unary
  rpc StreamTransactions (BalanceRequest) returns (stream Transaction); // server-stream
}

message BalanceRequest  { string account_id = 1; }
message BalanceResponse { string account_id = 1; int64 cents = 2; string currency = 3; }
message Transaction     { string id = 1; int64 cents = 2; int64 ts = 3; }
```

```ts
// client (unary)
const res = await client.getBalance({ accountId: "acc_123" });
console.log(res.cents, res.currency);
```

**Tip:** Field **numbers** (`= 1`, `= 2`) are the wire identity — never reuse or renumber them; that's how you keep backward compatibility.

### Q23: gRPC vs REST vs GraphQL — when each?

**A:**

- **gRPC:** internal, high-performance, low-latency service-to-service; strong typing via contract; streaming. Weak browser support (needs **grpc-web** + a proxy), binary payloads are not human-readable.
- **REST:** public APIs, browser/mobile clients, simple CRUD, caching via HTTP, ubiquitous tooling. The default for external surfaces (`10-rest-api-design.md`).
- **GraphQL:** client-driven queries, aggregating many resources, avoiding over/under-fetching for flexible frontends.

**Tip:** Common architecture: REST/GraphQL at the edge (API gateway), gRPC between internal services.

### Q24: Explain `@MessagePattern` vs `@EventPattern` in NestJS microservices.

**A:** NestJS's `@nestjs/microservices` abstracts transports behind two handler decorators:

- **`@MessagePattern`** = **request-response**. The caller (`client.send()`) awaits a reply; correlation is handled for you. Use when you need an answer.
- **`@EventPattern`** = **fire-and-forget event**. The caller (`client.emit()`) doesn't wait; the handler reacts. Use for domain/integration events.

```ts
@Controller()
export class PaymentController {
  // request-response: caller awaits the result
  @MessagePattern("get_balance")
  getBalance(@Payload() data: { accountId: string }) {
    return this.svc.balance(data.accountId);
  }

  // event: fire-and-forget reaction
  @EventPattern("payment.completed")
  async onPaymentCompleted(@Payload() evt: PaymentCompletedEvent) {
    await this.projections.applyPaymentCompleted(evt); // update CQRS read model
  }
}

// producer side
this.client.emit("payment.completed", event); // EventPattern
const balance = await firstValueFrom(
  this.client.send("get_balance", { accountId }), // MessagePattern
);
```

**Tip:** `emit` for events, `send` for messages-with-replies. Mixing them up is a common slip.

### Q25: What transporters does NestJS support, and what's a hybrid app?

**A:** Built-in transporters: **TCP** (default, simple), **Redis** (pub/sub), **RMQ** (RabbitMQ), **Kafka**, **NATS**, **MQTT**, and **gRPC**. You can also connect microservices to an existing HTTP app to make a **hybrid application** — it serves REST _and_ listens on a microservice transport simultaneously:

```ts
const app = await NestFactory.create(AppModule);
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.RMQ,
  options: {
    urls: ["amqp://localhost:5672"],
    queue: "payments",
    queueOptions: { durable: true },
  },
});
await app.startAllMicroservices();
await app.listen(3000); // HTTP + RMQ in one process
```

**Tip:** The abstraction lets you swap Redis → RabbitMQ → Kafka with mostly config changes — but the _semantics_ differ (Kafka offsets/partitions vs RMQ acks), so don't treat them as identical.

## Advanced

### Q26: Explain at-most-once vs at-least-once vs exactly-once delivery.

**A:**

- **At-most-once:** deliver and don't retry; a failure means the message is lost. Fast, lossy. Acceptable for metrics/telemetry.
- **At-least-once:** retry until acked; a crash between processing and acking causes **duplicates**. The realistic default for reliable systems — you design consumers to tolerate dupes.
- **Exactly-once:** each message affects the system once and only once. Genuinely hard in a distributed system (the two-generals problem); usually achieved as **"effectively once"** = at-least-once delivery + **idempotent processing/dedup**.

**Tip:** The senior answer: _"You don't get true exactly-once across the network; you get at-least-once delivery and make the consumer idempotent so the effect is exactly once."_

### Q27: What is an idempotent consumer and how do you build one?

**A:** A consumer where processing the same message N times yields the same result as once. Implement via:

1. A unique **message/event id** (or a deterministic business key).
2. A **dedup/processed store** — record processed ids; skip if seen. Often the same DB transaction that applies the effect inserts the id with a unique constraint, so a duplicate fails the insert and is safely dropped.
3. Or make the operation **naturally idempotent** (upsert by key, set absolute state instead of increment).

```ts
async function handlePaymentCompleted(evt: PaymentCompletedEvent) {
  await db.transaction(async (tx) => {
    // unique constraint on event_id makes the second attempt a no-op
    const inserted = await tx.processedEvents.insertIgnore({ id: evt.eventId });
    if (!inserted) return; // already processed -> skip
    await tx.ledger.applyCredit(evt.accountId, evt.amountCents);
  });
}
```

**Tip:** Avoid `balance += amount` for retried events — that double-counts. Use a unique-key guard or absolute-state writes. (See `14-redis-jobs-caching.md` for idempotency keys.)

### Q28: Explain the transactional outbox pattern and why it's needed.

**A:** The **dual-write problem**: if you write to your DB _and_ publish to the broker as two separate operations, a crash between them loses the event (DB committed, event never sent) or sends a phantom event (event sent, DB rolled back). The **outbox** fixes this: in **one local DB transaction**, write the business change _and_ an `outbox` row containing the event. A separate **relay** (poller or CDC, e.g., Debezium) reads unpublished outbox rows and publishes them to the broker, marking them sent. Now the event is published **iff** the DB change committed.

```ts
// 1) single transaction: state change + outbox event
await db.transaction(async (tx) => {
  await tx.orders.insert(order);
  await tx.outbox.insert({
    id: uuid(),
    topic: "order.created",
    payload: JSON.stringify(order),
    createdAt: new Date(),
    published: false,
  });
});

// 2) relay (separate worker, runs continuously)
const rows = await db.outbox.findUnpublished({ limit: 100 });
for (const row of rows) {
  await broker.publish(row.topic, row.payload); // at-least-once -> consumers must be idempotent
  await db.outbox.markPublished(row.id);
}
```

**Tip:** Outbox gives at-least-once publishing (relay may crash after publish, before marking) → pair with **idempotent consumers**. This is the canonical answer to "how do you publish events reliably alongside DB writes." (See `17-architecture-patterns.md`.)

### Q29: Explain the saga pattern: choreography vs orchestration.

**A:** A **saga** manages a business transaction spanning multiple services without a distributed (2PC) lock. It's a sequence of **local transactions**; if a step fails, earlier steps are undone with **compensating actions** (semantic rollback, not a real DB rollback).

- **Choreography:** no central coordinator. Each service reacts to events and emits its own. `OrderCreated → (Payment) PaymentReserved → (Inventory) StockReserved → ...`. Decoupled but the flow is implicit and hard to trace as it grows.
- **Orchestration:** a central **orchestrator** sends commands and tracks state (`ReservePayment`, then `ReserveStock`, then `Ship`). Explicit, testable, easier to reason about; the orchestrator is a single point to manage.

**Example compensation:** payment succeeded but inventory failed → emit/command `RefundPayment`.

**Tip:** Choreography for simple, few-step flows; orchestration once the workflow has many steps/branches or needs visibility. Both rely on idempotency and eventual consistency. (See `17-architecture-patterns.md`.)

### Q30: How does Kafka achieve "exactly-once" semantics (EOS)?

**A:** Within Kafka, EOS combines:

- **Idempotent producer** (`enable.idempotence=true`): the broker dedupes producer retries using a producer id + sequence number, so retried sends don't create duplicates in the log.
- **Transactions** (`transactional.id`): the consume-process-produce loop (read from topic A, write to topic B, commit offset) is wrapped in a Kafka transaction, so the output writes and the offset commit are atomic — consumers with `isolation.level=read_committed` only see committed records.

This gives exactly-once **inside Kafka's boundary**. Crossing to an external system (your DB) still needs idempotency/outbox — Kafka can't make your DB write transactional with the Kafka write.

**Tip:** Be precise: "exactly-once is for Kafka-to-Kafka stream processing; for Kafka-to-external-DB you still need idempotent writes."

### Q31: What is event sourcing and how does it relate to CQRS?

**A:** **Event sourcing**: instead of storing current state, store the **immutable sequence of events** as the source of truth; current state is derived by replaying events. **CQRS** separates the write model (commands → events) from read models (queries). They pair naturally: events from the write side update one or more **read-model projections** optimized for queries — exactly the pattern you used on CineBite (events drive read models).

**Fintech fit:** an append-only event log _is_ a perfect **audit trail** — every state change is recorded, you can reconstruct balances at any point in time, and you can build new projections by replaying history.

**Tip:** You don't need event sourcing to do CQRS, and CQRS doesn't require two databases — be careful not to over-claim. (See `17-architecture-patterns.md`.)

### Q32: Domain events vs integration events?

**A:**

- **Domain events:** internal to a bounded context/service, fine-grained, reflect the domain model, often in-process (e.g., NestJS `EventEmitter`/CQRS event bus). Can change with the model.
- **Integration events:** the contract published to _other_ services over the broker. They must be **stable, versioned, and coarser**. You translate domain events into integration events at the boundary.

**Tip:** Don't leak internal domain events onto the broker — you'll couple every consumer to your internal model. Publish a deliberate, versioned integration event.

### Q33: How do you handle event schema evolution and versioning?

**A:** Consumers and producers deploy independently, so schemas must evolve without breaking either side:

- **Backward-compatible changes:** add **optional** fields, never remove or repurpose existing ones, never change a field's type/meaning. (Protobuf field numbers and Avro defaults are designed for this.)
- **Version the event** (e.g., `eventType: "payment.completed.v2"` or a header) when you must break compatibility, and support old + new during migration.
- **Schema registry** (Confluent Schema Registry for Avro/Protobuf/JSON Schema): central store that **enforces compatibility rules** (backward/forward/full) at publish time, so a producer can't ship a breaking schema.

**Tip:** Tolerant reader principle — consumers ignore unknown fields and don't fail on additions. State "additive, optional, versioned" and you've nailed it.

### Q34: What are backpressure, consumer lag, and how do you scale consumers?

**A:**

- **Consumer lag (Kafka):** `latest offset − committed offset` per partition — how far behind a consumer is. The #1 health metric; rising lag = consumers can't keep up.
- **Queue depth (RabbitMQ):** number of ready/unacked messages — same idea.
- **Backpressure:** slowing/limiting intake so a fast producer doesn't overwhelm a slow consumer — prefetch limits (RMQ), pause polling (Kafka), bounded buffers. The broker buffering _is_ a form of load-leveling.
- **Scaling:** add consumers up to the partition count (Kafka) or add competing consumers on a queue (RMQ); raise partitions for more parallelism; batch processing; make handlers faster/idempotent so you can retry safely.

**Tip:** "How do you know your event pipeline is healthy?" → **monitor consumer lag / queue depth and DLQ size**, alert on growth.

### Q35: What are the fallacies of distributed computing, and why do they matter here?

**A:** The classic eight false assumptions: the network is reliable, latency is zero, bandwidth is infinite, the network is secure, topology doesn't change, there's one administrator, transport cost is zero, the network is homogeneous. They matter because every sync inter-service call can be slow, fail, or partition — which is _why_ we add timeouts, retries with backoff, circuit breakers, idempotency, and async messaging. Ignoring them produces brittle systems that work in dev and cascade in prod.

**Tip:** Tie it back: "Because the network is unreliable, I design for at-least-once and make consumers idempotent."

### Q36: Synchronous vs asynchronous, orchestration vs choreography — how do you choose per use case?

**A:**

- **Need an immediate answer to proceed** (auth check, balance lookup) → **synchronous** (gRPC internal / REST edge).
- **Work can happen later, want decoupling/resilience** (notifications, projections, downstream reactions) → **asynchronous events**.
- **Few steps, simple flow** → **choreography** (services react to events).
- **Many steps, branching, need visibility/state** → **orchestration** (a coordinator/saga manager).

**Tip:** Mixed systems are normal: sync within a request boundary, async for side effects and cross-service workflows.

### Q37: Why "don't start with microservices"?

**A:** Microservices add real cost: network failures, distributed transactions, eventual consistency, deployment/observability overhead, and harder local dev. Early on, requirements and boundaries are unclear, so you'll draw the wrong service lines and pay a high refactoring cost across the network. Start with a **modular monolith** — clear module boundaries (DDD bounded contexts) in one deployable — and extract services only when you have a concrete driver (independent scaling, team autonomy, isolation). You get most of the design benefits without the distributed-systems tax.

**Tip:** "Microservices are an organizational/scaling solution, not a default architecture." (See `17-architecture-patterns.md`, CAP/consistency trade-offs.)

### Q38: How do you handle retries, backoff, and poison messages end to end?

**A:** A robust pipeline:

1. **Transient failures** → retry with **exponential backoff + jitter** (avoid thundering herd). In RMQ, use a delay/retry queue with TTL → back to main; in Kafka, a retry topic; in BullMQ, built-in `attempts` + `backoff`.
2. **Cap attempts** (e.g., 5) so you don't loop forever.
3. **Exhausted / non-retryable** (bad schema, business rule violation) → **dead-letter queue/topic** for inspection and manual or automated reprocessing.
4. **Alert on DLQ depth**; build tooling to replay fixed messages.

**Tip:** Distinguish **retryable** (timeout, 503, lock contention) from **non-retryable** (validation error) — retrying a poison message just wastes capacity; route it straight to the DLQ.

### Q39: How do you secure and authenticate service-to-service communication?

**A:** Options, often layered:

- **mTLS** between services (mutual cert auth) — common with gRPC and service meshes.
- **Signed tokens** (JWT/OAuth2 client-credentials) propagated on calls, verified by each service; an **API gateway** terminates external auth and may mint internal tokens.
- For brokers: TLS in transit, **SASL/credentials** and **ACLs** (Kafka) or vhost/user permissions (RabbitMQ) to restrict who can publish/consume which topics/queues.
- **Service mesh** (Istio/Linkerd) can offload mTLS, retries, and policy from app code.

**Tip:** Mention not trusting the network ("zero trust"): authenticate even internal calls; don't assume "inside the cluster = safe."

### Q40: When does messaging add too much complexity / when should you NOT use a broker?

**A:** Messaging isn't free. Skip or delay it when:

- You genuinely need a **synchronous answer** to continue — async forces awkward request/reply over messaging.
- The system is small / a **modular monolith** where in-process calls or a simple BullMQ job suffice.
- The team lacks the ops maturity to run/monitor a broker (especially Kafka) — lag, partitions, rebalances, DLQs all need tooling.
- **Strong immediate consistency** is required and eventual consistency would confuse users or violate rules.

**Tip:** "Introduce a broker when decoupling/scale/async clearly outweigh the operational and debugging cost — not by default." Show judgment, not cargo-culting.

### Q41: Sketch a complete reliable Kafka producer + consumer-group flow (kafkajs).

**A:**

```ts
import { Kafka } from "kafkajs";
const kafka = new Kafka({ clientId: "payments", brokers: ["kafka:9092"] });

// Producer: durable + ordered per account (key), idempotent
const producer = kafka.producer({ idempotent: true });
await producer.connect();
await producer.send({
  topic: "payment.completed",
  acks: -1, // acks=all -> wait for ISR
  messages: [{ key: evt.accountId, value: JSON.stringify(evt) }], // key = ordering scope
});

// Consumer group: parallelism + at-least-once + idempotent handler
const consumer = kafka.consumer({ groupId: "ledger-projector" });
await consumer.connect();
await consumer.subscribe({ topic: "payment.completed", fromBeginning: false });
await consumer.run({
  eachMessage: async ({ message }) => {
    const evt = JSON.parse(message.value!.toString());
    await handlePaymentCompleted(evt); // idempotent (see earlier) -> safe on redelivery
    // offset auto-committed after successful handler -> at-least-once
  },
});
```

**Tip:** Commit offsets **after** processing, not before — committing first turns a crash into message loss (at-most-once).

## Choosing the Right Tool

Honest, decision-oriented comparison. Default to the simplest thing that meets the requirement (in your stack, that's often BullMQ).

| Criterion            | **Kafka**                                                                           | **RabbitMQ**                                         | **Redis / BullMQ**                                                                            | **gRPC**                                         | **REST**                               |
| -------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| Comm. style          | Async (stream)                                                                      | Async (queue/pub-sub)                                | Async (jobs / pub-sub)                                                                        | **Sync** (+ streaming)                           | **Sync** (request/response)            |
| Delivery             | At-least / exactly-once (EOS)                                                       | At-least-once (ack)                                  | At-least-once (BullMQ); fire-and-forget (pub/sub)                                             | Per-call (HTTP/2)                                | Per-call (HTTP)                        |
| Throughput           | Very high                                                                           | High                                                 | Moderate–high                                                                                 | High (binary/HTTP2)                              | Moderate (JSON)                        |
| Ordering             | Strict per-partition                                                                | Per-queue (weak under redelivery)                    | FIFO-ish per queue                                                                            | N/A                                              | N/A                                    |
| Persistence / replay | Yes — retained, replayable                                                          | No (consume-and-delete)                              | BullMQ persists jobs; pub/sub no; Streams yes                                                 | No                                               | No                                     |
| Routing              | Minimal (topic + key)                                                               | Rich (direct/topic/fanout/headers)                   | Minimal                                                                                       | N/A (direct call)                                | URL/verb                               |
| Op. complexity       | High (cluster, partitions, lag)                                                     | Medium                                               | Low (you already run Redis)                                                                   | Low–medium (proto/codegen)                       | Low                                    |
| Typical use case     | Event sourcing, audit logs, high-volume streaming, multi-consumer replay, analytics | Task queues, complex routing, RPC, work distribution | Background jobs in one app (emails, statements, FEFO), cache invalidation, lightweight events | Internal high-perf service-to-service, streaming | Public/browser/mobile APIs, CRUD, edge |

**Guidance:**

- **Start with BullMQ/Redis** for background jobs — you already run Redis, ops cost is near zero. Outgrow it when you need durable multi-consumer replay, cross-team/cross-language contracts, or very high throughput.
- **RabbitMQ** when you need **flexible routing** or classic **task distribution/RPC** and don't need replay.
- **Kafka** when events must be **retained and replayed by many independent consumers** at high throughput — event sourcing, audit trails, analytics. Worth the ops cost only at that scale.
- **gRPC** for **internal** synchronous calls needing performance + strong typing; **REST** (or GraphQL) at the **edge** for browsers/partners.
- Real fintech systems mix them: REST at the gateway, gRPC between core services, Kafka for the event/audit backbone, BullMQ for app-local jobs.

## Common Mistakes / Red Flags

- Calling Kafka "just a message queue" — missing the retention/replay/log distinction.
- Using **auto-ack** (RMQ) or committing offsets **before** processing (Kafka) → silent message loss.
- Assuming **exactly-once** is free — not building **idempotent consumers**; double-charging on a retry.
- **Dual write** (DB + broker as two ops) instead of the **outbox pattern** → lost or phantom events.
- No **DLQ / retry-with-backoff** → poison messages loop forever or block the queue.
- Ignoring **ordering**: not keying Kafka messages by entity, then surprised events arrive out of order.
- Adding more Kafka consumers than partitions and wondering why throughput plateaus.
- Treating eventual consistency as a bug instead of a designed trade-off; promising strong consistency you can't deliver.
- Leaking **internal domain events** onto the broker; breaking consumers with non-additive schema changes (no versioning/registry).
- Reaching for microservices + Kafka **on day one** instead of a modular monolith + BullMQ.
- Not **monitoring lag / queue depth / DLQ size** — flying blind on pipeline health.
- Using `@MessagePattern` (expects a reply) for fire-and-forget events, or `emit` where you needed `send` (NestJS).
- Trusting the network as "secure because internal" — no mTLS/token auth between services.

## Further Reading

- RabbitMQ Tutorials (exchanges, routing, DLX, confirms): https://www.rabbitmq.com/tutorials
- Apache Kafka Documentation (design, delivery semantics, EOS): https://kafka.apache.org/documentation/
- microservices.io — Outbox, Saga, CQRS, Event Sourcing patterns (Chris Richardson): https://microservices.io/patterns/
- NestJS Microservices (transporters, message vs event patterns): https://docs.nestjs.com/microservices/basics
