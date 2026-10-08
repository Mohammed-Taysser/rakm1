# MongoDB & Mongoose (58 questions)

> MongoDB is the **"M" in MERN** — the document database that stores your application data as flexible, JSON-like records. In a MERN stack, MongoDB persists state, Express/Node expose it over HTTP, and React renders it. Because documents map naturally to JavaScript objects, MongoDB feels native to a JS developer: no impedance mismatch, no ORM ceremony. You've built real systems on it — the **Rosine e-commerce** backend (products, carts, orders, categories, with references and population) and the **Whats-Add backend** (users, JWT auth, schemas with hashed passwords). This file covers raw MongoDB (CRUD, query operators, indexes, aggregation, transactions, replication, sharding) and **Mongoose**, the ODM that gives you schemas, validation, middleware, population, and instance/static methods on top of the driver. Master both: interviewers probe MongoDB fundamentals (embedding vs referencing, indexes, aggregation) and Mongoose specifics (pre-save hooks, populate, lean) in equal measure.

## Quick Revision Checklist

- **MongoDB** is a NoSQL **document database**; data lives in **collections** as **BSON documents** (binary JSON).
- SQL → MongoDB mapping: table→**collection**, row→**document**, column→**field**, JOIN→**$lookup**/population.
- Every document gets a unique **`_id`**; default type is a 12-byte **ObjectId** (timestamp + machine + counter).
- **CRUD**: `insertOne/insertMany`, `find`, `updateOne/updateMany`, `deleteOne/deleteMany`.
- **Query operators**: `$eq $ne $gt $gte $lt $lte $in $nin`, logical `$and $or $not $nor`, `$regex`, `$exists`.
- **Update operators**: `$set $unset $inc $mul $push $pull $addToSet $pop $rename`.
- **Pagination**: `.sort().skip().limit()` — but **skip is O(n)**; use **range/cursor pagination** at scale.
- **Data modeling — the big question**: **embed** for one-to-few / data read together; **reference** for one-to-many / shared / unbounded growth.
- **Indexes**: single, compound, multikey (arrays), text, unique, partial, TTL — backed by **B-trees**; follow the **ESR rule** (Equality, Sort, Range).
- Use **`explain("executionStats")`** to check whether a query is an **IXSCAN** (index) or **COLLSCAN** (full scan).
- **Aggregation pipeline**: `$match $group $project $sort $limit $lookup $unwind $addFields $count $facet` — for analytics & joins.
- **Transactions**: multi-document ACID via **sessions**; require a replica set; use only when a single document can't model the invariant.
- **Replication** (replica sets: primary + secondaries + elections) gives HA; **sharding** gives horizontal scale via a **shard key**.
- **Mongoose** is an **ODM**: Schema + Model, SchemaTypes & validation, middleware/hooks, virtuals, population, statics/methods.
- **pre('save') hook** = where you hash passwords; **instance method** = `comparePassword`; **lean()** = plain JS objects for fast reads.
- **Gotcha**: `findOneAndUpdate` does **not** trigger `save` hooks and skips validators unless you pass `runValidators: true`.

## Basic

### Q1: What is MongoDB, and what does NoSQL mean?

**A:** MongoDB is an open-source, document-oriented **NoSQL** database. "NoSQL" ("Not Only SQL") refers to non-relational databases that don't use tables/rows/SQL as their primary model. MongoDB stores data as flexible, schema-optional **documents** (JSON-like), grouped into **collections**. It scales horizontally, handles unstructured/evolving data well, and maps directly onto application objects.

**Tip:** The four NoSQL families: **document** (MongoDB), **key-value** (Redis), **column-family** (Cassandra), **graph** (Neo4j). Know where MongoDB sits.

### Q2: What is a document database?

**A:** A database whose fundamental unit of storage is a **document** — a self-contained, hierarchical record (nested objects and arrays) rather than a flat row. Related data that's read together can live inside one document, so a single read can return everything you need without joins.

**Tip:** "Documents map to objects in your code" is the core selling point for a JS dev — a Mongo document deserializes straight into a JS object.

### Q3: What is BSON, and how does it relate to JSON?

**A:** **BSON** = **B**inary **JSON**. MongoDB stores and transmits documents as BSON, a binary-encoded superset of JSON. BSON adds types JSON lacks — `ObjectId`, `Date`, `Decimal128`, `BinData`, `Int32/Int64`, `Timestamp` — and is faster to traverse and more space-efficient for some types. You write queries in JSON-like syntax; the server stores BSON.

**Tip:** This is why a Mongo `Date` round-trips as a real date and `_id` is an `ObjectId`, not a string — JSON couldn't represent those.

### Q4: Explain the SQL → MongoDB terminology mapping.

**A:**
| SQL | MongoDB |
|---|---|
| Database | Database |
| Table | **Collection** |
| Row | **Document** |
| Column | **Field** |
| Primary key | **`_id`** |
| JOIN | **`$lookup`** / Mongoose `populate` |
| Index | Index |

**Tip:** A key difference: SQL columns are fixed per table; MongoDB **documents in the same collection can have different fields** (flexible schema).

### Q5: When would you choose MongoDB over a SQL database, and vice versa?

**A:** **Choose MongoDB** when: the schema is fluid/evolving, data is naturally hierarchical/document-shaped (a product with nested variants, an order with line items), you need horizontal scale, or you're doing rapid prototyping. **Choose SQL** when: data is highly relational with many-to-many joins, you need strong multi-table transactional guarantees as the norm, complex ad-hoc reporting/joins dominate, or strict referential integrity matters.

**Tip:** Honest answer in interviews: "It depends on access patterns." MongoDB rewards modeling around _how you read data_; SQL rewards normalized relations.

### Q6: What is the `_id` field and the ObjectId?

**A:** Every document has a unique **`_id`** that acts as its primary key; MongoDB auto-creates a unique index on it. If you don't supply one, MongoDB generates an **ObjectId** — a 12-byte value: 4-byte **timestamp** (seconds since epoch) + 5-byte random value (per process) + 3-byte incrementing **counter**. It's globally unique, roughly sortable by creation time, and generated client- or server-side.

**Tip:** Because the first 4 bytes are a timestamp, `_id` is _approximately_ time-ordered — you can sort by `_id` instead of adding a separate `createdAt` for rough chronology, and extract creation time via `ObjectId.getTimestamp()`.

### Q7: How do you insert documents?

**A:** `insertOne(doc)` for a single document, `insertMany([doc1, doc2])` for a batch.

```js
db.products.insertOne({
  name: "Lipstick",
  price: 25,
  category: "makeup",
  stock: 100,
});
db.products.insertMany([
  { name: "Foundation", price: 40, category: "makeup", stock: 50 },
  { name: "Serum", price: 60, category: "skincare", stock: 30 },
]);
```

**Tip:** `insertMany` is _ordered_ by default — it stops at the first error. Pass `{ ordered: false }` to keep inserting past failures (useful for bulk imports).

### Q8: How does `find` work, and what are the common query operators?

**A:** `find(filter, projection)` returns a cursor of matching documents. The filter is a document of field→criteria.

```js
db.products.find({ category: "makeup" }); // equality
db.products.find({ price: { $gt: 30 } }); // greater than
db.products.find({ price: { $gte: 20, $lte: 50 } }); // range
db.products.find({ category: { $in: ["makeup", "skincare"] } });
db.products.find({ $or: [{ price: { $lt: 20 } }, { stock: { $gt: 100 } }] });
db.products.find({ name: { $regex: /lip/i } }); // pattern match
db.products.find({ discount: { $exists: true } });
```

Operators: comparison `$eq $ne $gt $gte $lt $lte $in $nin`; logical `$and $or $not $nor`; element `$exists $type`; evaluation `$regex $expr $mod`.

**Tip:** Multiple fields at the top level are an implicit `$and`. Use explicit `$and` only when you need the _same_ field with conditions that can't combine in one object.

### Q9: What is projection?

**A:** Projection limits which fields are returned, reducing network/memory cost. Second arg of `find`: `1` to include, `0` to exclude (can't mix except for `_id`).

```js
db.products.find({ category: "makeup" }, { name: 1, price: 1, _id: 0 });
```

**Tip:** `_id` is included by default; explicitly set `_id: 0` to drop it. In Mongoose use `.select("name price -_id")`.

### Q10: How do you sort, limit, and paginate?

**A:** Chain on the cursor: `.sort({ field: 1 })` (1 asc, -1 desc), `.limit(n)`, `.skip(n)`.

```js
db.products.find().sort({ price: -1 }).skip(20).limit(10); // page 3, 10 per page
```

**Tip:** Always pair `skip/limit` with a deterministic `sort` (often including `_id` as a tiebreaker), or page boundaries become unstable.

### Q11: How do you update documents?

**A:** `updateOne(filter, update)` / `updateMany(filter, update)` with **update operators**:

```js
db.products.updateOne({ _id: id }, { $set: { price: 30 } });
db.products.updateMany({ category: "makeup" }, { $inc: { stock: -1 } });
db.orders.updateOne({ _id: id }, { $push: { items: newItem } });
db.users.updateOne({ _id: id }, { $pull: { wishlist: productId } });
db.products.updateOne({ _id: id }, { $addToSet: { tags: "sale" } });
```

Operators: `$set $unset` (set/remove field), `$inc $mul` (arithmetic), `$push $pull $addToSet $pop` (arrays), `$rename`.

**Tip:** Without an operator (`updateOne(f, { price: 30 })`) MongoDB **replaces the whole document** — a classic data-loss bug. Always use `$set`. Use `{ upsert: true }` to insert if not found.

### Q12: How do you delete documents?

**A:** `deleteOne(filter)` removes the first match; `deleteMany(filter)` removes all matches. `deleteMany({})` empties a collection (use carefully).

**Tip:** Often you want a **soft delete** instead — set `{ isDeleted: true }` or `{ deletedAt: new Date() }` so you keep history and can recover. A TTL index can then purge old soft-deletes.

## Intermediate

### Q13: Embedding vs referencing — how do you decide? (The big modeling question)

**A:** This is _the_ MongoDB design question.

- **Embed** (nest the data inside the parent document) when: data is read together, the relationship is **one-to-few**, the embedded data doesn't grow unbounded, and it doesn't need to be queried independently. Example: an order's line items.
- **Reference** (store an `ObjectId` pointing to another collection) when: the relationship is **one-to-many / many-to-many**, the related data is large or **unbounded**, it's shared across many parents, or it changes independently. Example: a product referenced by many orders.

**Tip:** Mantras: "**Data that is accessed together should be stored together**" (embed) and "**model for your read patterns**." Watch the **16MB document limit** — an array that grows forever (comments, events) must be referenced, not embedded.

### Q14: How do you model one-to-few, one-to-many, and many-to-many?

**A:**

- **One-to-few** (user → 2-3 addresses): **embed** the array of subdocuments.
- **One-to-many** (blog post → thousands of comments): **reference** — store the parent's `_id` on each child (child holds the FK), or hold an array of child IDs on the parent if bounded.
- **Many-to-many** (products ↔ tags, students ↔ courses): **reference** with arrays of IDs on one or both sides, or a separate join-like collection for rich relationships.

**Tip:** A common hybrid: store the child reference **plus a few denormalized fields** you frequently display (e.g., on an order item store `productId` _and_ a snapshot of `name`/`price` at purchase time so price changes don't rewrite history).

### Q15: What is denormalization and why is it common in MongoDB?

**A:** Denormalization is intentionally **duplicating data** across documents to avoid joins at read time, trading write complexity and storage for read speed. Because MongoDB has no cheap server-side joins (only `$lookup`), denormalizing the fields you read most makes reads a single fast lookup.

**Tip:** The cost is **keeping copies in sync** on update. Denormalize fields that are _stable_ or are deliberately snapshots (order price at purchase). Don't denormalize volatile, must-always-be-current data.

### Q16: What are indexes and why do they matter?

**A:** An index is a separate **B-tree** data structure that stores ordered values of indexed field(s) with pointers to documents. Without an index, a query does a **collection scan (COLLSCAN)** — reads every document, O(n). With a matching index, it does an **index scan (IXSCAN)** — O(log n) tree traversal. Indexes make reads (and sorts) dramatically faster but **slow writes slightly** (each index must be updated) and consume RAM/disk.

**Tip:** `_id` is always indexed. The number-one performance win in a Mongo app is adding the right index for your hot queries — verify with `explain`.

### Q17: What index types exist?

**A:**

- **Single field**: `{ email: 1 }`.
- **Compound**: `{ category: 1, price: -1 }` — multiple fields, order matters.
- **Multikey**: automatically created when you index an array field; indexes each element.
- **Text**: `{ description: "text" }` for `$text` full-text search.
- **Unique**: `{ email: 1 }, { unique: true }` — enforces no duplicates.
- **Partial**: indexes only documents matching a filter (`partialFilterExpression`).
- **Sparse**: only indexes docs where the field exists.
- **TTL**: `{ createdAt: 1 }, { expireAfterSeconds: 3600 }` — auto-deletes expired docs.
- **Geospatial / hashed / wildcard** for special cases.

**Tip:** A **unique partial index** lets you enforce uniqueness only on a subset (e.g., unique email only among non-deleted users).

### Q18: Explain the ESR rule for compound indexes.

**A:** **ESR = Equality, Sort, Range.** Order fields in a compound index so that: fields used with **equality** matches come first, fields used to **sort** come next, and fields used with **range** queries (`$gt`, `$lt`, `$in`) come last. This lets one index serve the filter, the sort, and the range efficiently.

**Tip:** Example query: `find({ status: "active", price: { $gt: 50 } }).sort({ createdAt: -1 })` → index `{ status: 1, createdAt: -1, price: 1 }` (E=status, S=createdAt, R=price).

### Q19: What is a covered query?

**A:** A query is **covered** when all the fields it needs — both the filter and the returned (projected) fields — exist in the index, so MongoDB answers it **entirely from the index without touching the documents**. The fastest possible query. `explain` shows `totalDocsExamined: 0`.

**Tip:** To get a covered query, project only indexed fields and exclude `_id` (unless `_id` is in the index): `find({ email: x }, { email: 1, _id: 0 })` covered by `{ email: 1 }`.

### Q20: How do you use `explain()` and read a query plan?

**A:** `db.coll.find(...).explain("executionStats")` shows the chosen plan. Key fields: **`stage`** — `IXSCAN` (good, used an index) vs `COLLSCAN` (bad, full scan); **`totalDocsExamined`** vs **`nReturned`** (you want these close — examining many to return few signals a missing/poor index); **`executionTimeMillis`**; **`indexName`** used.

**Tip:** Red flag: `COLLSCAN` on a large collection, or `totalDocsExamined` >> `nReturned`. The fix is usually a better index. Mongoose: `await Model.find(...).explain()`.

### Q21: Why is `skip` slow at scale, and what's the alternative?

**A:** `skip(n)` must **walk and discard the first n documents** every time — it's O(n). Page 1000 of 50/page means skipping 50,000 documents per request. The fix is **range/cursor pagination** ("keyset pagination"): remember the last seen value and query _after_ it.

```js
// instead of .skip(50000).limit(50)
db.products
  .find({ _id: { $gt: lastSeenId } })
  .sort({ _id: 1 })
  .limit(50);
```

**Tip:** Cursor pagination is O(log n) per page (index seek) and stable under inserts/deletes. Downside: you can't jump to an arbitrary page number — only next/previous. Great for infinite scroll / "load more."

### Q22: What is the aggregation framework?

**A:** A **pipeline** of stages where documents flow through each stage, transformed as they go. It's MongoDB's tool for analytics, grouping, joining, and reshaping — far more powerful than `find`. Each stage takes the previous stage's output as input.

**Tip:** Think of it like Unix pipes (`|`) or array methods chained (`.filter().map().reduce()`) but executed server-side on the data.

### Q23: What are the key aggregation stages?

**A:**

- **`$match`** — filter (like `find`); put it **first** to use indexes and shrink the dataset early.
- **`$group`** — group by a key and compute accumulators (`$sum`, `$avg`, `$min`, `$max`, `$push`, `$first`).
- **`$project`** — reshape: include/exclude/compute fields.
- **`$addFields` / `$set`** — add computed fields while keeping existing ones.
- **`$sort`**, **`$limit`**, **`$skip`** — ordering and paging.
- **`$lookup`** — left outer **join** to another collection.
- **`$unwind`** — deconstruct an array into one document per element.
- **`$count`** — count documents at that point.
- **`$facet`** — run multiple sub-pipelines in parallel (e.g., results + total count + facets in one query).

**Tip:** Stage order matters for both correctness and performance: `$match` and `$sort` early so they can use indexes; `$project` away big fields before expensive stages.

### Q24: Give a real aggregation example — top products by revenue.

**A:** From an e-commerce app like Rosine, compute the top 5 products by total revenue:

```js
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" }, // one doc per line item
  {
    $group: {
      _id: "$items.productId",
      totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      unitsSold: { $sum: "$items.qty" },
    },
  },
  { $sort: { totalRevenue: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      // join product details
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product",
    },
  },
  { $unwind: "$product" },
  {
    $project: { _id: 0, name: "$product.name", totalRevenue: 1, unitsSold: 1 },
  },
]);
```

**Tip:** Be ready to walk through what each stage outputs. The `$unwind` → `$group` pattern (flatten array, then aggregate) is extremely common for line-item analytics.

### Q25: Aggregation vs `find` — when do you use each?

**A:** Use **`find`** for straightforward reads: filter, project, sort, paginate a single collection. Use **aggregation** when you need to **transform or compute across documents**: grouping/totals, joins (`$lookup`), reshaping, multi-stage logic, computed fields. If you find yourself fetching data and then looping/reducing in Node to compute totals, that's a signal to push it into an aggregation.

**Tip:** Aggregation runs on the server (less data over the wire, uses indexes in `$match`/`$sort`). Doing the math in Node means transferring more documents and using app CPU/RAM.

### Q26: How does `$lookup` work?

**A:** `$lookup` performs a **left outer join**: for each input document, it finds matching documents in another collection and adds them as an array field.

```js
{ $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } }
```

Each result gets a `user` array (empty if no match). Pair with `$unwind: "$user"` if you expect exactly one match.

**Tip:** `$lookup` is the raw equivalent of Mongoose `populate`. Difference: `$lookup` runs in **one server-side query**; `populate` typically issues a **second query** from the app. For heavy joins, `$lookup` is usually more efficient.

## Advanced

### Q27: What are multi-document transactions and when do you need them?

**A:** A transaction groups multiple operations across documents/collections so they either **all commit or all roll back** (full ACID). You start a **session**, run operations within it, then commit or abort. They require a **replica set** (or sharded cluster). Needed when an invariant spans documents — e.g., transferring stock from inventory to an order, or debiting one account and crediting another, where a partial failure would corrupt state.

**Tip:** Default MongoDB advice: **single-document operations are already atomic.** Model so the data that must change together lives in one document, and you often don't need a transaction at all. Reach for transactions only when that's impossible.

### Q28: Show a transaction with a session.

**A:** Place an order and decrement stock atomically:

```js
const session = await mongoose.startSession();
try {
  session.startTransaction();
  const order = await Order.create([{ user, items, total }], { session });
  for (const item of items) {
    const res = await Product.updateOne(
      { _id: item.productId, stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } },
      { session },
    );
    if (res.modifiedCount === 0) throw new Error("Insufficient stock");
  }
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

**Tip:** Note `Order.create([...], { session })` takes an **array** when used with a session. Every operation in the transaction must pass `{ session }`, or it won't be part of it — a common silent bug.

### Q29: Briefly, what is the WiredTiger storage engine and how does locking work?

**A:** **WiredTiger** is MongoDB's default storage engine. It provides **document-level concurrency control** (not collection- or DB-level locks), so many writers to different documents proceed concurrently. It uses **MVCC** (multi-version concurrency control) for consistent reads, compression on disk, and a configurable cache (default ~50% of RAM) that holds the working set.

**Tip:** The headline: WiredTiger's **document-level locking** is why MongoDB handles concurrent writes far better than the old MMAPv1 engine, which had collection/DB-level locks.

### Q30: What is replication / a replica set?

**A:** A **replica set** is a group of `mongod` instances holding the same data for **high availability**. One node is the **primary** (takes all writes); the rest are **secondaries** that replicate the primary's oplog. If the primary fails, the remaining nodes hold an **election** and promote a new primary automatically. This gives failover and data redundancy.

**Tip:** Transactions and `majority` write/read concern require a replica set. Even single-server dev setups often run as a 1-node replica set so transactions work. Atlas always gives you a replica set.

### Q31: What is read preference?

**A:** **Read preference** tells the driver which replica-set members to read from: `primary` (default, strongest consistency), `primaryPreferred`, `secondary`, `secondaryPreferred`, `nearest`. Reading from secondaries offloads the primary and reduces latency but can return **stale data** (replication lag).

**Tip:** Use `primary` for read-your-own-writes / strong consistency. Use `secondaryPreferred` for analytics/reporting where slight staleness is acceptable.

### Q32: What is sharding, and what's a shard key?

**A:** **Sharding** is MongoDB's horizontal scaling: it **partitions a collection across multiple shards** (each a replica set) so data and load distribute across machines. The **shard key** is the field(s) MongoDB uses to decide which shard a document lives on. Routers (`mongos`) direct queries to the right shard(s).

**Tip:** Choosing the shard key is critical and hard to change later. Good keys have **high cardinality, even distribution, and align with query patterns** so queries are _targeted_ (one shard) not _scatter-gather_ (all shards). A monotonically increasing key (like raw `_id`/timestamp) creates a **hotspot** — all new writes hit one shard.

### Q33: When should you actually shard?

**A:** Only when a **single replica set can't handle the working set or write throughput** — i.e., data exceeds one machine's RAM/disk or write load saturates one primary. Sharding adds significant operational complexity, so first exhaust vertical scaling, indexing, and schema optimization.

**Tip:** "Don't shard prematurely." Most apps never need it; replication + good indexes handle a lot.

### Q34: Explain write concern and read concern.

**A:** **Write concern** (`w`) controls the durability acknowledgment: `w: 1` (acked by primary), `w: "majority"` (acked by a majority of nodes — survives failover), `w: 0` (fire-and-forget). `j: true` adds journal durability. **Read concern** controls consistency of reads: `local`, `majority` (only data acked by a majority, won't be rolled back), `linearizable`, `snapshot` (for transactions).

**Tip:** `w: "majority"` + `readConcern: "majority"` gives strong, rollback-safe guarantees at some latency cost. This is the tradeoff axis: durability/consistency vs speed.

### Q35: What are capped collections?

**A:** Fixed-size collections that act as a **circular buffer**: once full, new inserts overwrite the oldest documents. They preserve insertion order and are very fast for inserts. Used for logs, caches, and the oplog itself.

**Tip:** You can't grow a capped collection's size limit easily and you can't delete individual docs. For auto-expiring data with deletes, a **TTL index** is usually the better modern choice.

### Q36: What is GridFS?

**A:** A specification for **storing files larger than the 16MB BSON document limit** in MongoDB. It splits a file into **chunks** (default 255KB) stored in a `fs.chunks` collection, with metadata in `fs.files`. Lets you stream large files (videos, big images) in/out of Mongo.

**Tip:** For most web apps, storing files in **object storage (S3/Cloudinary)** and keeping only the URL in MongoDB is simpler and cheaper. Use GridFS when you specifically need files _inside_ the database (backups, replication of file data, atomic-ish access).

## Mongoose

### Q37: What is Mongoose and what is an ODM?

**A:** Mongoose is an **ODM (Object Data Modeling)** library for MongoDB in Node.js. It sits on top of the native driver and gives you: **schemas** (structure + types), **validation**, **models** (constructors mapped to collections), **middleware/hooks**, **virtuals**, **population** (refs), and **instance/static methods**. An ODM is to a document DB what an ORM is to SQL — it maps documents to rich JS objects with behavior.

**Tip:** MongoDB itself is schema-flexible; Mongoose **adds an application-level schema** so your data stays consistent. You trade some flexibility for safety and structure.

### Q38: What's the difference between a Schema and a Model?

**A:** A **Schema** defines the shape: fields, types, validation, defaults, indexes, methods. A **Model** is a compiled constructor created from a schema (`mongoose.model("User", userSchema)`) that you use to **interact with a collection** — create, query, update documents. Schema = blueprint; Model = the thing you actually call `.find()`/`.create()` on. Model instances are **documents**.

**Tip:** Model name "User" → Mongoose pluralizes/lowercases it to the **`users`** collection by default.

### Q39: What are SchemaTypes and built-in validation?

**A:** SchemaTypes: `String`, `Number`, `Boolean`, `Date`, `Buffer`, `ObjectId` (`Schema.Types.ObjectId`), `Mixed`, `Array`, `Map`, `Decimal128`. Built-in validators: `required`, `unique` (index, not a validator!), `min/max` (numbers/dates), `minLength/maxLength`, `enum`, `match` (regex), plus **custom validators** via `validate`.

```js
email: { type: String, required: true, unique: true, lowercase: true,
         match: [/^\S+@\S+\.\S+$/, "Invalid email"] },
role:  { type: String, enum: ["user", "admin"], default: "user" },
age:   { type: Number, min: 18, max: 120 },
```

**Tip:** A custom validator: `{ validate: { validator: v => v.length >= 8, message: "Too short" } }`.

### Q40: What's the difference between schema `unique` and a DB unique index?

**A:** **Trick question, and important.** Mongoose's `unique: true` is **not a validator** — it's a shorthand that tells Mongoose to **build a unique index** on that field in MongoDB. Uniqueness is enforced by the **database index**, not by Mongoose validation. So a duplicate doesn't throw a Mongoose `ValidationError`; it throws a **MongoDB duplicate-key error (code 11000)**, which you must handle separately.

**Tip:** Two gotchas:

1. the index must actually be built (`autoIndex` on, or `Model.syncIndexes()`) — in production with `autoIndex: false` it may not exist
2. catch `err.code === 11000` for "email already taken," not the validation handler

### Q41: What is Mongoose middleware (hooks)?

**A:** Functions that run **before (`pre`)** or **after (`post`)** lifecycle events: `save`, `validate`, `remove`, `updateOne`, `findOneAndUpdate`, `init`, and aggregate hooks. The canonical use is **hashing a password before save**, or auto-updating timestamps, cascading deletes, or logging.

**Tip:** Hook type matters: **document middleware** (`save`, `validate`) has `this` = the document; **query middleware** (`findOneAndUpdate`, `find`) has `this` = the query. This distinction trips people up constantly.

### Q42: Show a pre-save password-hash hook and a comparePassword instance method.

**A:** This is exactly the user's auth-model pattern:

```js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minLength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

// Hash password before saving — only if it changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare a candidate password to the stored hash
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
```

**Tip:** The **`isModified("password")` guard is essential** — without it, every `save()` (e.g., updating the name) would **re-hash the already-hashed password**, locking the user out. Also note `select: false` keeps the hash out of normal queries; you must `.select("+password")` at login.

### Q43: Instance methods vs static methods vs query helpers?

**A:**

- **Instance methods** (`schema.methods.x`): operate on a single document; `this` = the document. E.g., `user.comparePassword(pw)`.
- **Static methods** (`schema.statics.x`): operate on the model; `this` = the model. E.g., `User.findByEmail(email)`.
- **Query helpers** (`schema.query.x`): chainable custom query builders; `this` = the query. E.g., `User.find().byActive()`.

**Tip:** Rule of thumb: behavior about _one document_ → instance method; behavior about _the collection / a custom finder_ → static; reusable query fragment → query helper. Use `function`, not arrow functions, so `this` binds correctly.

### Q44: What are virtuals?

**A:** **Virtuals** are computed properties that **aren't stored** in MongoDB — derived from other fields on read. Classic example: `fullName` from `firstName` + `lastName`. They can have getters and setters.

```js
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});
```

**Tip:** Virtuals don't appear in `JSON.stringify`/API responses unless you enable `{ toJSON: { virtuals: true }, toObject: { virtuals: true } }` on the schema. Also, you **can't query by a virtual** (it's not in the DB).

### Q45: What is population?

**A:** `populate()` replaces a **referenced `ObjectId` field with the actual referenced document(s)**. You define a `ref` on the schema, store IDs, and Mongoose runs follow-up queries to "join" them at the application level.

```js
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      qty: Number,
    },
  ],
});

const orders = await Order.find()
  .populate("user", "name email") // select only some fields
  .populate("items.product", "name price"); // populate nested array refs
```

**Tip:** `populate` issues **additional queries** behind the scenes (one per populated path, batched with `$in`). Always pass a field list (`"name email"`) to avoid pulling whole documents you don't need.

### Q46: What is deep/nested populate and virtual populate?

**A:** **Deep populate**: populate a path _inside_ a populated document via the object form: `.populate({ path: "items.product", populate: { path: "category" } })`. **Virtual populate**: define a virtual with `ref/localField/foreignField` to populate the "many" side **without storing an array of IDs** on the parent — great for one-to-many where you don't want unbounded arrays.

```js
userSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "user",
});
const user = await User.findById(id).populate("orders");
```

**Tip:** Virtual populate is the idiomatic way to model "a user has many orders" without an ever-growing `orders` array on the user document.

### Q47: What's the over-population / N+1 pitfall?

**A:** Populating too many paths, too deeply, or whole documents pulls huge amounts of data and fires many queries — hurting performance. Populating inside a loop creates an **N+1 query** problem. Deeply nested populate can cascade into dozens of queries.

**Tip:** Mitigations:

1. **always project** populated fields
2. populate at the top level so Mongoose batches with `$in`, not per-iteration
3. for heavy joins prefer a single **aggregation `$lookup`**
4. denormalize the few display fields you always need so you can skip populate entirely

### Q48: What is `lean()` and why use it for reads?

**A:** `.lean()` makes a query return **plain JavaScript objects instead of Mongoose documents**. It skips hydrating documents — no getters/setters, virtuals, change tracking, or instance methods — making queries **significantly faster and lighter** (often 3-5x) for read-only endpoints.

```js
const products = await Product.find({ category: "makeup" }).lean();
```

**Tip:** Use `lean()` for **read-only** routes where you just serialize to JSON (API list/detail endpoints). Don't use it when you need to call `.save()`, instance methods, or virtuals on the result. You can still combine `lean()` with `populate()`.

### Q49: What's the `timestamps` option?

**A:** `new Schema({...}, { timestamps: true })` auto-adds and maintains **`createdAt`** (set on insert) and **`updatedAt`** (updated on every save/update) Date fields. No manual bookkeeping.

**Tip:** You can rename them: `{ timestamps: { createdAt: "created", updatedAt: "modified" } }`. `timestamps` works on update operations too (e.g., `findOneAndUpdate` bumps `updatedAt`).

### Q50: How do you declare indexes in a Mongoose schema?

**A:** Inline on a field (`{ email: { type: String, index: true, unique: true } }`) or via `schema.index()` for compound/options:

```js
productSchema.index({ category: 1, price: -1 }); // compound
productSchema.index({ name: "text", description: "text" }); // text
orderSchema.index({ user: 1, createdAt: -1 }); // ESR-friendly
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
```

**Tip:** Mongoose builds these on connect when **`autoIndex`** is on (default in dev). In **production, turn `autoIndex: false`** (index builds can block) and create indexes deliberately via a migration or `Model.syncIndexes()`.

### Q51: What are discriminators?

**A:** Mongoose's **schema inheritance**: multiple models that share a base schema but add their own fields, **stored in one collection**, distinguished by a `__t` discriminator key. Useful for polymorphic data — e.g., a base `Event` with `ClickEvent` and `PurchaseEvent` variants, or `User` → `Admin`/`Customer`.

```js
const Event = mongoose.model("Event", baseSchema);
const ClickEvent = Event.discriminator(
  "ClickEvent",
  new Schema({ element: String }),
);
```

**Tip:** Discriminators give SQL-like single-table inheritance. Querying the base model returns all types; querying a discriminator auto-filters by `__t`.

### Q52: How do transactions work with sessions in Mongoose?

**A:** `await mongoose.startSession()`, then either `session.startTransaction()` / `commitTransaction()` / `abortTransaction()` manually, or use the convenience `session.withTransaction(async () => { ... })` which handles commit/abort/retries. **Pass `{ session }` to every operation** that should be part of the transaction.

**Tip:** `withTransaction` automatically retries on transient transaction errors — prefer it over manual commit/abort for robustness. (See the order/stock example above.)

### Q53: How does Mongoose manage connections and pooling?

**A:** `mongoose.connect(uri, options)` opens a connection (or pool) reused across the app — call it **once at startup**, not per request. Mongoose maintains a **connection pool** (`maxPoolSize`, default 100) so concurrent operations reuse sockets. It **buffers** operations issued before the connection is ready and replays them once connected.

**Tip:** In **serverless** (Lambda/Vercel), cache the connection across invocations (module-scope/global) so you don't open a new pool per request — a classic cause of connection exhaustion. Tune `maxPoolSize` down for serverless.

### Q54: How do you handle Mongoose validation errors?

**A:** Failed validation throws a **`ValidationError`** with an `errors` object keyed by field, each having a `message`. Catch it and map to a clean API response:

```js
try {
  await User.create(req.body);
} catch (err) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ errors: messages });
  }
  if (err.code === 11000) {
    return res
      .status(409)
      .json({ error: "Duplicate value", field: err.keyValue });
  }
  next(err);
}
```

**Tip:** Remember the split: **`ValidationError`** for schema rules (required/enum/min), **`code === 11000`** for unique-index violations. They come from different layers.

### Q55: `save()` vs `findOneAndUpdate()` — and `runValidators`?

**A:** **`save()`** works on a loaded document: it runs **`validate`, `pre('save')`/`post('save')` hooks**, and only writes changed paths. **`findOneAndUpdate()`** (and `updateOne/updateMany`) issues a direct update query: it does **not** load a document, so it **skips `save` hooks** and by default **skips validators**. To validate, pass `{ runValidators: true }`; to get the updated doc back, pass `{ new: true }`.

```js
await User.findOneAndUpdate(
  { _id: id },
  { age: 16 },
  { new: true, runValidators: true },
);
```

**Tip:** This is _the_ Mongoose interview gotcha. If your password-hashing or any `pre('save')` logic must run, use `.save()` (load, mutate, save) — `findOneAndUpdate` will silently bypass it.

### Q56: What's the difference between `populate` and `$lookup`?

**A:** **`populate`** is Mongoose-level: convenient, runs **extra queries** from the application (batched with `$in`), respects schemas/virtuals. **`$lookup`** is a server-side aggregation **join** done in **one round trip** on the database. For simple "fetch the referenced user/product," `populate` is cleaner. For complex joins, filtering/grouping on joined data, or performance-critical paths, `$lookup` is more efficient (no app-side round trips, can use indexes within the pipeline).

**Tip:** Quick heuristic: a handful of refs to attach → `populate`; join-heavy analytics or you're already in an aggregation → `$lookup`.

### Q57: What's the difference between `select`/projection in Mongoose?

**A:** `.select("name price")` includes only those fields; `.select("-password -__v")` excludes them. It's the Mongoose equivalent of a `find` projection and reduces payload size. Schema-level `select: false` permanently hides a field (like a password hash) unless you re-include it with `.select("+password")`.

**Tip:** Always `select` fields explicitly on list endpoints, and set `select: false` on sensitive fields (password, tokens) so they're never accidentally serialized.

## Common Mistakes / Red Flags

### Q58: What are the most common MongoDB/Mongoose mistakes interviewers look for?

**A:**

- **Update without `$set`** → `updateOne(filter, { price: 30 })` **replaces the entire document**. Always use update operators.
- **Re-hashing passwords**: forgetting `if (!this.isModified("password"))` in the pre-save hook locks users out on profile updates.
- **`findOneAndUpdate` skipping hooks/validators**: assuming pre-save runs (it doesn't) or that validation runs without `runValidators: true`.
- **Treating Mongoose `unique` as validation**: it's an index; duplicates throw `code 11000`, not `ValidationError`.
- **No indexes on hot query fields** → COLLSCANs; not using `explain()` to verify plans.
- **`skip`-based pagination at scale** → slow deep pages; should use cursor/range pagination.
- **Over-embedding unbounded arrays** → hitting the 16MB document limit (comments, events that grow forever).
- **Over-population** without field selection / inside loops → N+1, massive payloads.
- **Not using `lean()`** on read-only endpoints → wasted hydration overhead.
- **Opening a new DB connection per request** (esp. serverless) → connection-pool exhaustion.
- **`autoIndex: true` in production** → index builds can block/slow startup on large collections.
- **Forgetting `{ session }`** on operations inside a transaction → they silently run outside it.
- **Reading from secondaries and expecting fresh data** → replication lag / stale reads.
- **Storing money as floats** → use `Decimal128` (or integer cents) to avoid rounding errors.

**Tip:** If you can articulate _why_ each of these is wrong and the fix, you'll handle most MongoDB interview follow-ups.

## Further Reading

- [MongoDB Manual](https://www.mongodb.com/docs/manual/) — official reference for CRUD, indexes, aggregation, replication, sharding.
- [MongoDB Data Modeling Guide](https://www.mongodb.com/docs/manual/data-modeling/) — embedding vs referencing and schema design patterns.
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html) — schemas, middleware, population, queries, transactions.
- [MongoDB Aggregation Pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/) — full stage reference with examples.
