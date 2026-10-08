# Fintech & Financial-Domain Engineering (43 questions)

> At an investment/fintech company, the software _is_ the money. A single rounding bug, a double-applied transfer, or an un-auditable balance change is not a cosmetic defect — it is lost money, a broken reconciliation, and potentially a compliance incident. This file covers the domain knowledge that separates a generic MERN/NestJS engineer from one who can be trusted with financial systems: representing money exactly, guaranteeing atomicity and idempotency, building immutable auditable ledgers, preventing concurrency-driven overdrafts, and handling currencies, reporting, and security correctly. In money software, **data accuracy and security are non-negotiable** — "probably correct" is the same as wrong.

## Quick Revision Checklist (16 bullets)

- Never use JS `Number` (IEEE-754 float) for money — `0.1 + 0.2 !== 0.3`. Use integer minor units or `Decimal128`.
- Three safe storage options: **integer minor units (cents)**, **MongoDB `Decimal128`**, or a **decimal library** (decimal.js / dinero.js / big.js). Know the trade-offs.
- Always store the **currency code (ISO 4217)** alongside every amount. Never do arithmetic across currencies without an explicit FX conversion step.
- Pick an explicit **rounding mode** (banker's / half-even for financial aggregates) and document the precision/scale.
- Money mutations that touch two records (debit + credit) must be **atomic** — MongoDB multi-document transactions with a session, `writeConcern: w:majority`.
- Money usually needs **strong consistency**; eventual consistency is acceptable only for read models/reporting, not for the source-of-truth balance.
- Financial write endpoints must be **idempotent** — accept a client `Idempotency-Key`, dedupe server-side. Networks retry; users double-click; webhooks deliver at-least-once.
- Prefer **exactly-once effect** via idempotency over assuming exactly-once delivery (which doesn't exist over networks).
- Use **double-entry bookkeeping**: every posted transaction balances (sum of debits == sum of credits).
- The ledger is **append-only and immutable** — never UPDATE/DELETE a posted entry; post a reversing/correcting entry instead (like Pharmacy FEFO's stock-movement ledger).
- Keep an **audit trail**: who, what, when, before/after — for compliance and debugging.
- Prevent overdraft with an **atomic conditional update** (`findOneAndUpdate` with a `balance >= amount` filter + `$inc`) — never read-modify-write in app code.
- Optimistic concurrency (version field + retry) or pessimistic locking (transaction) are the alternatives when an atomic operator isn't enough.
- **Never store raw card numbers** (PCI-DSS) — tokenize via a provider like Stripe. Encrypt PII at rest, TLS in transit, least-privilege DB users, secrets in a vault.
- Reports: aggregate `Decimal128` correctly, store timestamps in **UTC** and convert for display; period boundaries depend on timezone.
- Reconciliation: regularly match internal ledger vs external bank/provider statements; investigate every discrepancy, fix with a correcting entry, never by silently overwriting.

## Basic

### Q1: Why must you never use JavaScript `Number` (floating point) for money?

**A:** JS `Number` is an IEEE-754 64-bit binary float. Many decimal fractions (like 0.1) cannot be represented exactly in binary, so arithmetic accumulates rounding error.

```js
0.1 + 0.2; // 0.30000000000000004
0.1 + 0.2 === 0.3; // false
(0.1 * 3).toFixed(2); // "0.30" but 0.1*3 === 0.30000000000000004
1.005 * 100; // 100.49999999999999  → naive round gives 100, not 101
```

For money, these tiny errors are unacceptable: they compound over millions of transactions, break reconciliation, and produce balances that are provably wrong. Money needs an _exact_ decimal representation.

**Tip:** When asked this, say the phrase "binary floating point can't represent base-10 fractions exactly" and give the `0.1 + 0.2` example — interviewers listen for it.

### Q2: What are the safe ways to store a monetary amount?

**A:** Three accepted approaches:

1. **Integer minor units** — store the amount as a whole number of the smallest currency unit (cents, piastres, fils). `$12.34` is stored as `1234`. Arithmetic is plain integer math, exact and fast.
2. **MongoDB `Decimal128`** — a 128-bit IEEE-754 _decimal_ (base-10) type. Stores exact decimal values with up to 34 significant digits.
3. **Arbitrary-precision decimal library** in app code — `decimal.js`, `big.js`, or `dinero.js` (which wraps amount + currency + scale).

All three avoid binary float error. The choice depends on team conventions, multi-currency needs, and how much arithmetic happens in the DB vs the app.

**Tip:** A strong answer names all three and then states a clear default ("I'd default to integer minor units, or `Decimal128` if we need DB-side decimal aggregation").

### Q3: What is `Decimal128` and how do you use it in Mongoose?

**A:** `Decimal128` is MongoDB's base-10 128-bit decimal type — exact decimal arithmetic, no binary rounding. In Mongoose it's `Schema.Types.Decimal128`.

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema, Types } from "mongoose";

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, index: true })
  tenantId: string; // multi-tenant, like Pharmacy

  @Prop({ type: MongooseSchema.Types.Decimal128, required: true, default: "0" })
  balance: Types.Decimal128;

  @Prop({ required: true, match: /^[A-Z]{3}$/ }) // ISO 4217
  currency: string; // 'USD', 'EGP', ...
}
export const AccountSchema = SchemaFactory.createForClass(Account);
```

**Tip:** `Decimal128` comes _out_ of Mongoose as a `Decimal128` object, not a JS number. Convert with a decimal lib for math, and to a string for JSON — never `Number(decimal128)` (that re-introduces float error).

### Q4: What is ISO 4217 and why store the currency code with every amount?

**A:** ISO 4217 is the standard list of three-letter currency codes (`USD`, `EUR`, `EGP`, `GBP`, `JPY`). An amount without a currency is meaningless — `1000` could be \$10.00 or ¥1000. Always store `{ amount, currency }` together. It also encodes the number of minor-unit decimals (USD has 2, JPY has 0, some have 3), which you need to format and to interpret minor units correctly.

**Tip:** Mention that you'd never add two amounts of different currencies — that's a domain error, not just an arithmetic one.

### Q5: How do you format money for display vs how you store it?

**A:** **Store** the canonical exact value (minor-unit integer or `Decimal128`) plus the currency code. **Format** only at the presentation layer, using locale-aware tooling:

```ts
new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
  1234 / 100,
); // "$12.34"
```

Storage is for correctness; formatting is for humans. Never store the formatted string ("$12.34") as your source of truth.

**Tip:** Separating storage from display is a clean-code signal — they have different requirements (exactness vs readability).

### Q6: What is a rounding mode and why does it matter?

**A:** When you reduce precision (e.g., splitting a bill, computing interest, FX conversion) you must round, and _how_ you round changes the result. Common modes:

- **Half-up** — 2.5 → 3 (round halves away from zero). Intuitive but biases upward.
- **Half-even ("banker's rounding")** — 2.5 → 2, 3.5 → 4 (round halves to the nearest even digit). Removes cumulative bias over many roundings, which is why it's the default in many financial/accounting contexts.

You must pick one explicitly and apply it consistently, because differences of a cent multiplied across millions of rows break reconciliation.

**Tip:** Saying "banker's rounding (half-even) to avoid cumulative bias" shows real financial awareness.

### Q7: What does "precision and scale" mean for a money column?

**A:** **Precision** is the total number of significant digits; **scale** is the number of digits after the decimal point. For most currencies scale is 2 (`12.34`), but FX rates often need 6+ (`1.234567`), and crypto needs many more. Define and document this per field. `Decimal128` gives you up to 34 digits, so it's safe, but you should still validate/normalize incoming values to the expected scale.

### Q8: Why is a database transaction relevant to money operations?

**A:** A money operation often involves more than one document — e.g., debit account A and credit account B. If the debit succeeds and the credit fails (process crash, network blip), money vanishes or is duplicated. A transaction makes the pair **all-or-nothing (atomic)**: either both apply or neither does. MongoDB supports multi-document ACID transactions via sessions (on replica sets / sharded clusters).

**Tip:** Emphasize "all-or-nothing" — a partial money update is worse than no update.

### Q9: What is idempotency and why do financial endpoints need it?

**A:** An idempotent operation produces the same effect whether it's executed once or many times. Financial endpoints need it because the same request can legitimately arrive more than once: the client times out and retries, a user double-clicks "Pay", a load balancer re-sends, or a payment webhook is delivered at-least-once. Without idempotency, each duplicate is a real double charge. The fix is an **idempotency key** the client sends, which the server uses to dedupe.

**Tip:** Frame it as "the network gives you at-least-once; idempotency lets you achieve exactly-once _effect_."

## Intermediate

### Q10: Show a Mongoose schema for a monetary amount done correctly.

**A:** Amount as `Decimal128`, currency as a validated string, plus the tenant for isolation:

```ts
@Schema({ _id: false })
export class Money {
  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  amount: Types.Decimal128;

  @Prop({ required: true, uppercase: true, match: /^[A-Z]{3}$/ })
  currency: string;
}
export const MoneySchema = SchemaFactory.createForClass(Money);

// Usage as an embedded value object:
@Prop({ type: MoneySchema, required: true })
price: Money;
```

Bundling amount + currency as a value object means you can never accidentally persist an amount without its currency — a small design choice that prevents a whole class of bugs.

### Q11: Write an atomic balance update that prevents overdraft.

**A:** Use a single conditional `findOneAndUpdate` — the `balance >= amount` filter and the `$inc` happen atomically in the database, so two concurrent withdrawals cannot both pass the check:

```ts
async withdraw(accountId: string, amount: Types.Decimal128) {
  const updated = await this.accountModel.findOneAndUpdate(
    {
      _id: accountId,
      // guard: only match if there's enough balance
      balance: { $gte: amount },
    },
    { $inc: { balance: Types.Decimal128.fromString(`-${amount}`) } },
    { new: true },
  );

  if (!updated) {
    // either account not found OR insufficient funds — no money moved
    throw new ConflictException('Insufficient funds');
  }
  return updated;
}
```

The key idea: **never read-modify-write in app code** (`read balance; if enough, write balance - amount`) — between read and write another request can sneak in (a race) and overdraw the account. Let the database evaluate the condition and the decrement as one atomic step.

**Tip:** `$inc` on `Decimal128` works, but for portability some teams keep balances in integer minor units precisely so `$inc` is unambiguous. Mention you'd confirm the team convention.

### Q12: Do a debit + credit atomically with a MongoDB transaction (session).

**A:**

```ts
async transfer(fromId: string, toId: string, amount: Types.Decimal128, idemKey: string) {
  const session = await this.connection.startSession();
  try {
    await session.withTransaction(async () => {
      // 1. atomic, guarded debit
      const debited = await this.accountModel.findOneAndUpdate(
        { _id: fromId, balance: { $gte: amount } },
        { $inc: { balance: Types.Decimal128.fromString(`-${amount}`) } },
        { session, new: true },
      );
      if (!debited) throw new ConflictException('Insufficient funds');

      // 2. credit the destination
      await this.accountModel.updateOne(
        { _id: toId },
        { $inc: { balance: amount } },
        { session },
      );

      // 3. append immutable ledger entries (double-entry)
      await this.ledgerModel.insertMany(
        [
          { account: fromId, direction: 'DEBIT',  amount, idemKey },
          { account: toId,   direction: 'CREDIT', amount, idemKey },
        ],
        { session },
      );
    }, { writeConcern: { w: 'majority' }, readConcern: { level: 'snapshot' } });
  } finally {
    await session.endSession();
  }
}
```

If any step throws, the whole transaction aborts and nothing is committed.

**Tip:** Always pass `{ session }` to _every_ operation inside the transaction — a query without the session silently runs outside it.

### Q13: What are write concern and read concern, and what settings does money need?

**A:**

- **Write concern (`w`)** — how many replica-set members must acknowledge a write before it's considered durable. `w: 'majority'` means a majority have it, so it survives a primary failover (won't be rolled back). Money writes should use `w: 'majority'`.
- **Read concern** — what consistency/isolation a read sees. `readConcern: 'majority'` reads only majority-committed data; `'snapshot'` (inside a transaction) gives a consistent point-in-time view; `'linearizable'` is the strongest.

For money: `w: 'majority'` for durability, and `majority`/`snapshot` reads for correctness. The default `w:1` can lose an acknowledged write during failover — unacceptable for money.

**Tip:** "Durable and not rolled back on failover" is the phrase for `w:majority`.

### Q14: Implement an idempotency-key check.

**A:** Store each processed key with a unique index; on duplicate, return the stored result instead of re-executing. This is exactly the pattern used in Hirely.

```ts
@Schema({ timestamps: true })
export class IdempotencyKey {
  @Prop({ required: true, unique: true }) key: string; // unique index
  @Prop({ required: true }) endpoint: string;
  @Prop({ type: Object }) response: unknown;  // cached result
  @Prop({ default: 'IN_PROGRESS' }) status: 'IN_PROGRESS' | 'DONE';
}

// in the service:
async pay(dto: PayDto, key: string) {
  try {
    // unique index makes this atomic: first request wins
    await this.idemModel.create({ key, endpoint: 'pay', status: 'IN_PROGRESS' });
  } catch (e) {
    if (e.code === 11000) { // duplicate key
      const existing = await this.idemModel.findOne({ key });
      if (existing.status === 'DONE') return existing.response;
      throw new ConflictException('Request already in progress');
    }
    throw e;
  }
  const result = await this.doCharge(dto); // the real, non-idempotent work
  await this.idemModel.updateOne({ key }, { status: 'DONE', response: result });
  return result;
}
```

**Tip:** The _unique index_ is what makes the dedupe race-safe — two simultaneous requests with the same key can't both insert.

### Q15: How do you make a BullMQ job handler idempotent?

**A:** At-least-once delivery means a job can run more than once (retries, worker crash after side-effect before ack). So the _handler_ — not the queue — must be idempotent:

```ts
@Processor("payments")
export class PaymentProcessor extends WorkerHost {
  async process(job: Job<{ paymentId: string }>) {
    // guard: mark as processing only if not already done
    const claimed = await this.paymentModel.findOneAndUpdate(
      { _id: job.data.paymentId, status: "PENDING" },
      { status: "PROCESSING" },
      { new: true },
    );
    if (!claimed) return; // already processed by a previous run — no-op
    await this.charge(claimed);
    await this.paymentModel.updateOne({ _id: claimed._id }, { status: "DONE" });
  }
}
```

Use a stable `jobId` (e.g., the payment id) so BullMQ also dedupes enqueues. This mirrors Hirely's idempotency-key + BullMQ setup.

### Q16: What is double-entry bookkeeping?

**A:** An accounting model where every transaction is recorded as equal and opposite entries across at least two accounts: total **debits == total credits**. Moving \$100 from A to B is a \$100 debit on A and a \$100 credit on B; the books always balance. Benefits: you can detect corruption (an unbalanced transaction is invalid), you have a complete trail of where every cent came from and went, and balances are _derivable_ from the ledger rather than a standalone mutable number you have to trust.

**Tip:** Even if the system stores a cached balance for speed, the ledger is the source of truth and the balance must always equal the sum of its entries.

### Q17: Why must a financial ledger be append-only / immutable?

**A:** Because the ledger is the audit record. If you can UPDATE or DELETE a posted entry, history can be silently rewritten — you lose auditability, compliance breaks, and bugs become un-debuggable. Instead, corrections are made by **posting a new reversing/correcting entry**. The original wrong entry stays, the reversal cancels it, and the trail shows exactly what happened and when.

This is precisely the **Pharmacy FEFO stock-movement ledger** pattern: stock changes are recorded as immutable movement records (receipt, dispense, adjustment, expiry write-off), never by editing a quantity in place. Current stock = sum of movements. A financial ledger is the same idea applied to money.

**Tip:** Connecting it to your Pharmacy ledger shows you've already built and reasoned about immutable append-only ledgers.

### Q18: Show an append-only ledger entry model.

**A:**

```ts
@Schema({ timestamps: { createdAt: true, updatedAt: false } }) // never updated
export class LedgerEntry {
  @Prop({ required: true, index: true }) tenantId: string;
  @Prop({ required: true, index: true }) accountId: string;
  @Prop({ required: true, enum: ["DEBIT", "CREDIT"] }) direction: string;
  @Prop({ type: MongooseSchema.Types.Decimal128, required: true })
  amount: Types.Decimal128;
  @Prop({ required: true }) currency: string;
  @Prop({ required: true }) transactionId: string; // groups both legs
  @Prop() reversesEntryId?: string; // set on correcting entries
  @Prop({ required: true }) createdBy: string; // audit: who
  @Prop({ type: Object }) metadata?: Record<string, unknown>;
}
```

No `update`/`delete` methods are exposed in the service. To fix an error you insert a `reversesEntryId` entry. Index on `{ accountId: 1, createdAt: 1 }` for statement queries and balance computation.

### Q19: How do you compute an account balance — running balance vs aggregating the ledger?

**A:** Two approaches, often combined:

- **Aggregate the ledger** — sum all credits minus debits for the account. Always correct (it's derived), but gets slow as the ledger grows.
- **Running/cached balance** — keep a maintained balance field updated atomically with each posting (and/or store a running balance on each entry). Fast reads, but must be kept in sync and periodically reconciled against the ledger sum.

A common production pattern: cached balance for fast reads + periodic snapshot + a reconciliation job that re-derives from the ledger and alerts on mismatch.

```ts
const [{ balance }] = await this.ledgerModel.aggregate([
  { $match: { accountId, currency: "USD" } },
  {
    $group: {
      _id: null,
      balance: {
        $sum: {
          $cond: [
            { $eq: ["$direction", "CREDIT"] },
            "$amount",
            { $multiply: ["$amount", -1] },
          ],
        },
      },
    },
  },
]);
```

### Q20: What is an audit trail and what must it capture?

**A:** A tamper-evident record of every meaningful action: **who** (user/service identity), **what** (action + entity), **when** (UTC timestamp), and **before/after** state (or the delta). It's required for compliance, dispute resolution, fraud investigation, and debugging ("why is this balance off?"). Store it append-only, separate from the mutable business data, and never let it be edited. For money, the immutable ledger _is_ a large part of the audit trail; PII/permission changes get their own audit log.

## Advanced

### Q21: Explain strong vs eventual consistency and where each belongs in a fintech system.

**A:** **Strong consistency** means every read reflects the latest committed write — there's one agreed-upon current value. **Eventual consistency** means replicas converge over time, so a read might be briefly stale. The source-of-truth balance and the act of posting a transaction need **strong consistency**: you cannot let two nodes disagree about whether an account has enough funds. **Read models / reporting / dashboards / search** can tolerate eventual consistency — a balance shown on a dashboard being a few seconds stale is fine. The discipline is knowing which is which: never let a _decision that moves money_ depend on possibly-stale data.

**Tip:** "Strong for the write path that moves money, eventual is acceptable for read-side projections" is the mature answer.

### Q22: How do race conditions cause double-spend, and what are all the ways to prevent them?

**A:** Two concurrent withdrawals both read balance = \$100, both see "enough for \$80", both write \$20 — \$160 withdrawn from \$100. Prevention techniques, roughly in order of preference:

1. **Atomic conditional operator** — `findOneAndUpdate({ balance: { $gte: amt } }, { $inc: { balance: -amt } })`. The DB serializes it; only one wins. Simplest and best when expressible as one document update.
2. **Optimistic concurrency** — add a `version` field; update with `{ _id, version: n }` and `$inc version`; if it matches 0 documents, someone else updated it — reload and retry. Good for low contention.
3. **Pessimistic locking via transaction** — read inside a transaction so conflicting writes are blocked/aborted; retry on write conflict. Heavier; use when the logic spans many documents.

The universal rule: **avoid read-modify-write in application code** for balances.

**Tip:** Lead with the atomic conditional update; mention optimistic/pessimistic as the fallbacks for multi-document logic.

### Q23: How does optimistic concurrency control work in Mongoose for money?

**A:** Each document carries a version; you only commit if the version hasn't changed since you read it.

```ts
async applyFee(accountId: string, fee: Types.Decimal128) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const acct = await this.accountModel.findById(accountId);
    const res = await this.accountModel.updateOne(
      { _id: accountId, version: acct.version }, // guard on version
      { $inc: { balance: Types.Decimal128.fromString(`-${fee}`), version: 1 } },
    );
    if (res.modifiedCount === 1) return;         // success
    // else someone else changed it — loop and retry
  }
  throw new ConflictException('Too much contention, retry');
}
```

Mongoose also has built-in `optimisticConcurrency: true` using the `__v` field for `save()`.

**Tip:** Always bound the retries and surface a clear conflict error rather than looping forever.

### Q24: How do you correctly aggregate money in a MongoDB pipeline?

**A:** `$sum` works directly on `Decimal128` and stays exact, which is one reason to prefer it over floats for DB-side reporting. Always group by currency so you never sum across currencies:

```ts
this.ledgerModel.aggregate([
  { $match: { tenantId, createdAt: { $gte: from, $lt: to } } },
  { $group: { _id: "$currency", total: { $sum: "$amount" } } }, // exact, per-currency
]);
```

Convert the resulting `Decimal128` to a string for the API; never to a JS number.

**Tip:** Grouping by currency in the `$group._id` is the detail that signals you understand multi-currency.

### Q25: How do timezones and period boundaries affect financial reports?

**A:** A "daily" or "monthly" report is defined by _someone's_ clock. If you store timestamps in local time or compute boundaries naively, the same transaction can land in different days for different users, and DST shifts will silently move money between reporting periods. Rule: **store all timestamps in UTC**, and compute period boundaries by converting the desired local-time boundary to UTC for the query, then convert back for display. Always make the report's timezone explicit (and configurable per tenant/jurisdiction).

```ts
import { DateTime } from "luxon";
const tz = "Africa/Cairo";
const startUtc = DateTime.fromISO("2026-06-21", { zone: tz })
  .startOf("day")
  .toUTC()
  .toJSDate();
const endUtc = DateTime.fromISO("2026-06-21", { zone: tz })
  .endOf("day")
  .toUTC()
  .toJSDate();
// query: createdAt >= startUtc && createdAt <= endUtc
```

### Q26: How do you index for financial queries and paginate statements?

**A:** The dominant access pattern is "entries for this account in this date range, newest first." A compound index `{ accountId: 1, createdAt: -1 }` (with `tenantId` prefixed in multi-tenant systems: `{ tenantId: 1, accountId: 1, createdAt: -1 }`) serves both filtering and sort. For statements, use **keyset/cursor pagination** (`createdAt < lastSeen`) rather than `skip`, because `skip` gets slow and can show duplicates/gaps when new entries arrive mid-paging — and an immutable append-only ledger is perfectly suited to cursor pagination since old entries never change.

### Q27: What are snapshots vs recompute for balances/reports?

**A:** **Recompute** derives the answer from the ledger every time — always correct, increasingly expensive. **Snapshots** periodically store a checkpoint (e.g., end-of-day balance per account); to get a current balance you take the latest snapshot and sum only the entries since it. This bounds the work to "entries since last snapshot." Snapshots are also a reconciliation anchor: you can verify a snapshot against the full recompute offline. Use snapshots when ledgers are large; keep the full recompute as the audit/verification path.

### Q28: How does CQRS / eventual consistency fit financial read models? (CineBite)

**A:** In CQRS (as in CineBite's NestJS/CQRS setup) the **write side** owns the source of truth — commands post to the ledger and update balances with strong consistency and transactions. The **read side** maintains denormalized projections (account statement views, dashboards, analytics) updated from domain events. Those projections can be eventually consistent. The discipline: **commands that move money never read from the eventually-consistent projection** — they read and write the authoritative model. Projections are for fast, flexible reads only. This separation lets you scale reporting without endangering correctness.

### Q29: How would you handle multiple currencies safely?

**A:** Principles:

- Every amount carries its ISO-4217 currency; the `{amount, currency}` value object is never split.
- **Never perform arithmetic on mixed currencies.** Adding USD to EGP is a domain error — reject it.
- Conversions are explicit operations that record the **FX rate, source, and timestamp** used, and produce a _new_ amount in the target currency (with a chosen rounding mode). Store the rate so the conversion is auditable and reproducible.
- Hold balances per currency (a wallet has one balance per currency, or sub-accounts per currency), and aggregate reports per currency, optionally with a separate "reported in base currency" figure computed via dated rates.
- FX rates need more scale (6+ decimals); store them as `Decimal128` too.

**Tip:** "I'd never sum across currencies; conversion is an explicit, audited step with a stored rate" is the standout line.

### Q30: What is the difference between exactly-once delivery and exactly-once effect?

**A:** **Exactly-once _delivery_** over a network is essentially impossible — you can't simultaneously avoid losing a message and avoid duplicating it; practical systems choose at-least-once (with retries) or at-most-once. **Exactly-once _effect_** is achievable at the application layer: accept that messages/requests may arrive multiple times, and make processing idempotent (idempotency keys, dedupe tables, conditional updates) so the _outcome_ happens exactly once. Fintech systems assume at-least-once everywhere and engineer idempotent handlers to get the effect they want.

### Q31: How would you design encryption and access control for financial data?

**A:** Layered:

- **In transit:** TLS everywhere — clients↔API, API↔DB, service↔service.
- **At rest:** disk/volume encryption plus field-level encryption for sensitive fields (PII, secrets); MongoDB supports encryption at rest and client-side field-level encryption.
- **Least privilege:** the app's DB user can read/write only its collections — no admin rights; separate read-only credentials for reporting.
- **Secrets:** never in code or images — use a secrets manager (Vault, AWS Secrets Manager) injected at runtime; rotate regularly.
- **Tokenization:** never store raw PANs/CVVs — delegate to a PCI-compliant provider and store only tokens.
- **Audit:** log access to sensitive data and all money-moving actions.

(See file 24 for the deep security treatment — here it's the fintech lens.)

## Financial / Domain Questions They Might Ask (with model answers)

### Q32: "How would you store a monetary amount in MongoDB?"

**Model answer:** "As an exact decimal, never a JS float. My default is either integer minor units (store \$12.34 as the integer 1234) or MongoDB's `Decimal128` (`Schema.Types.Decimal128`), and I always store the ISO-4217 currency code alongside it as a value object so an amount is never separated from its currency. I'd pick based on team convention and whether we need DB-side decimal aggregation — `Decimal128` shines there because `$sum` stays exact. On the way out I serialize to a string, never `Number(...)`, to avoid re-introducing float error. I also document the scale (2 for USD, more for FX rates) and a rounding mode for any operation that reduces precision."

### Q33: "Design a wallet / account-balance system."

**Model answer:** "Source of truth is an **immutable, append-only double-entry ledger** — every money movement is balanced debit/credit entries grouped by a transaction id, with `Decimal128` amounts, currency, who/when, and a transaction id; no updates or deletes, corrections are reversing entries. Each account holds a **cached balance per currency** for fast reads, mutated atomically alongside ledger posting inside a MongoDB transaction (`w:majority`). Withdrawals use an atomic conditional update (`balance >= amount` guard) so we can't overdraft. Write endpoints take an idempotency key to make retries safe. A reconciliation job periodically re-derives balances from the ledger and snapshots, alerting on any drift. Reads/reporting can come from a CQRS projection that's eventually consistent, but the money-moving path always uses the authoritative model. This is the same immutable-ledger discipline I used for stock movements in the Pharmacy FEFO system."

### Q34: "How do you guarantee a money transfer isn't applied twice?"

**Model answer:** "Two layers. First, **idempotency** at the API: the client sends an `Idempotency-Key`; I insert it with a unique index before doing the work — if it already exists I return the stored result instead of charging again. Second, **atomicity**: the transfer (guarded debit, credit, ledger entries) runs in a single MongoDB transaction with `w:majority`, so it's all-or-nothing and durable. I also carry the idempotency key onto the ledger entries so even at the data layer a duplicate posting is detectable. I assume at-least-once delivery everywhere and design for exactly-once _effect_."

### Q35: "How would you build an audit log / transaction history?"

**Model answer:** "Append-only collection(s), never updated or deleted. The financial transaction history _is_ the immutable ledger — debit/credit entries with amount, currency, transaction id, timestamps in UTC, and the actor who initiated it. For non-money actions (permission changes, profile edits) I keep a separate audit collection capturing who, what, when, and before/after state. I index by entity + time for retrieval, paginate with cursors, and expose no edit path. Corrections are new entries, so history is tamper-evident — which is what compliance and incident debugging require."

### Q36: "How do you prevent two withdrawals from overdrawing an account?"

**Model answer:** "I never read-modify-write the balance in app code. I do a single atomic `findOneAndUpdate` with a filter that includes `balance: { $gte: amount }` and a `$inc` that decrements it — the database evaluates the condition and applies the decrement as one atomic step, so of two concurrent withdrawals only one matches the guard; the other gets zero documents back and I return 'insufficient funds.' If the logic spans multiple documents I'd wrap it in a transaction or use optimistic concurrency with a version field and bounded retries. The principle is: let the database serialize the check-and-update, never the application."

### Q37: "Why not use float for money?"

**Model answer:** "Because `Number` is binary floating point and can't represent base-10 fractions exactly — `0.1 + 0.2` is `0.30000000000000004`. Those errors compound across transactions and break reconciliation, which at a financial company is a real loss, not a cosmetic bug. I use exact representations instead: integer minor units or `Decimal128`, with an explicit rounding mode for any precision reduction."

### Q38: "How would you handle multiple currencies?"

**Model answer:** "Every amount is an `{amount, currency}` value object with an ISO-4217 code, and I never do arithmetic across currencies — that's a domain error I reject. Balances are held per currency. Conversion is an explicit, audited operation that records the FX rate, its source, and the timestamp, applies a defined rounding mode, and produces a new amount in the target currency. FX rates get extra scale (6+ decimals) stored as `Decimal128`. Reports aggregate per currency, with an optional base-currency total computed via dated rates so it's reproducible."

### Q39: "How do you make a payment endpoint safe to retry?"

**Model answer:** "Idempotency keys. The client generates a key per logical payment and sends it as a header; the server tries to insert it (unique index) before doing the charge. First request proceeds and stores its result; any retry with the same key returns the stored result without re-charging. The actual charge runs in a transaction so it's atomic, and any background job triggered is itself idempotent (guarded status transition, stable jobId in BullMQ). That's exactly the idempotency-key + BullMQ pattern I built in Hirely."

### Q40: "How would you reconcile our records with a bank/payment provider?"

**Model answer:** "Ingest the provider's statement/settlement file or API records on a schedule, then match each external line to our ledger entries by a shared key (provider transaction id, our idempotency key, or amount+date+reference). Bucket the results: matched, present-in-ours-but-not-theirs, present-in-theirs-but-not-ours, and amount mismatches. Matched ones we mark reconciled; the exceptions go to an investigation queue. We never silently overwrite a balance to make it match — any agreed correction is posted as a new reversing/adjusting ledger entry so the trail stays intact. I'd run this daily and alert on non-zero exception counts."

### Q41: "What would you do if you found a discrepancy in balances?"

**Model answer:** "Stop and investigate before touching anything — in money software a wrong fix is worse than the bug. First, recompute the balance from the immutable ledger to see whether the ledger or the cached balance is wrong; the ledger is the source of truth. If the cached balance drifted, I re-derive it from the ledger (and fix the bug that let it drift). If the _ledger_ is wrong, I never edit or delete the bad entry — I post a reversing/correcting entry with a clear reason and actor, preserving history. I capture everything in the audit log, check whether other accounts are affected, and add a regression test plus a reconciliation alert so we catch it automatically next time."

### Q42: "How would you talk about regulation/compliance (PCI, KYC/AML) responsibly?"

**Model answer:** "Honestly and within my lane. On payments I keep us out of PCI-DSS scope by never touching raw card data — tokenize through a provider like Stripe so we store only tokens. I know KYC (verifying customer identity) and AML (anti-money-laundering monitoring/reporting) are requirements for a financial institution, and as an engineer my job is to support them: reliable identity data capture, immutable audit trails, data-retention controls, and access logging — implemented to the specifications compliance/legal define. I wouldn't claim to _own_ the regulatory interpretation; I'd build the controls correctly and ask when requirements are ambiguous."

### Q43: "An external webhook (e.g., payment confirmation) might be delivered more than once — how do you handle it?"

**Model answer:** "Webhooks are at-least-once, so the handler must be idempotent. I verify the signature first, then dedupe on the provider's event id with a unique index — if I've seen it, I ack and no-op. Otherwise I process it inside a transaction (e.g., post the ledger entries and update payment status with a guarded status transition) and record the event id. That way replays and retries from the provider can't double-apply the confirmation."

## Common Mistakes / Red Flags

- Using `Number`/`parseFloat` for money, or `toFixed`/`Math.round` as the "fix" — still float underneath.
- Storing an amount without its currency, or summing across currencies.
- Read-modify-write on a balance in application code (classic double-spend race).
- Doing debit and credit as two independent writes without a transaction — partial failure loses or duplicates money.
- Using default write concern (`w:1`) for money, then losing an acknowledged write on failover.
- `UPDATE`/`DELETE` on posted ledger entries instead of posting reversing entries — destroys auditability.
- No idempotency on money endpoints/webhooks → double charges on retries and double-clicks.
- Trusting "exactly-once delivery" instead of building exactly-once _effect_.
- Treating a cached balance as the source of truth with no ledger to reconcile against.
- Storing local timestamps, or computing report periods without a timezone — money slips between days/DST.
- Storing raw card numbers or CVV anywhere, ever (PCI-DSS violation).
- Converting `Decimal128` to a JS `Number` for arithmetic or JSON — re-introduces float error.
- "Fixing" a discrepancy by editing a balance to match instead of investigating and posting a correcting entry.
- Letting a money-moving decision read from an eventually-consistent projection.
- Overclaiming compliance ("I'll make it PCI/KYC compliant") instead of describing the controls you'd build under guidance.

## Further Reading

- MongoDB Manual — Model Monetary Data & `Decimal128`: https://www.mongodb.com/docs/manual/tutorial/model-monetary-data/
- MongoDB Manual — Multi-Document ACID Transactions: https://www.mongodb.com/docs/manual/core/transactions/
- Stripe Docs — Idempotent Requests: https://docs.stripe.com/api/idempotent_requests
- Martin Fowler — Accounting / Event Sourcing patterns (immutable ledgers): https://martinfowler.com/eaaDev/AccountingNarrative.html
