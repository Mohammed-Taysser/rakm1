# SQL, PostgreSQL & Prisma (59 questions)

> Relational databases are still the backbone of most serious applications, and modern MERN stacks frequently swap MongoDB for PostgreSQL when data is highly relational, needs strong consistency, or benefits from rich querying (JOINs, aggregates, transactions). You've leaned on Postgres + Prisma across most projects: **Foody** (orders, stock decrements in transactions), the **Pharmacy FEFO** system (multi-tenant Prisma client extension scoping every query to `tenantId`, batch/expiry-driven inventory), **Hirely** (jobs/applications relational graph), **Trust-Node**, and the **Smart Task Scheduler**. You've also touched **MySQL + Sequelize** (Shuhna) and **TypeORM** (CineBite). This file covers raw SQL fundamentals, Postgres-specific power features, and how Prisma maps onto all of it — including the real pain points you've hit like N+1 and migration discipline.

## Quick Revision Checklist

- **ACID** = Atomicity, Consistency, Isolation, Durability — the guarantees that make transactions trustworthy.
- A **primary key** uniquely identifies a row; a **foreign key** references another table's PK and enforces referential integrity.
- Relationships: **1:1**, **1:many** (FK on the "many" side), **many:many** (needs a junction/join table).
- **Normalization** (1NF→2NF→3NF) removes redundancy; **denormalization** trades redundancy for read speed.
- **JOIN cheat sheet**: INNER = matches only, LEFT = all left + matches, RIGHT = all right + matches, FULL = everything, CROSS = cartesian, SELF = table joined to itself.
- **WHERE** filters rows _before_ grouping; **HAVING** filters _after_ `GROUP BY`.
- **Indexes** (B-tree) speed reads, slow writes, and cost storage — index what you filter/sort/join on, not everything.
- **Composite index column order matters**: leftmost-prefix rule — `(a, b)` helps `WHERE a` and `WHERE a AND b`, not `WHERE b` alone.
- Use **EXPLAIN ANALYZE** to see the real plan; watch for `Seq Scan` on big tables and bad row estimates.
- **Isolation levels**: Read Uncommitted → Read Committed (Postgres default) → Repeatable Read → Serializable, trading concurrency for anomaly protection.
- **Optimistic** concurrency = version check, no locks; **pessimistic** = `SELECT ... FOR UPDATE` locks rows.
- The **N+1 problem**: 1 query for parents + N queries for children — fix with a JOIN or Prisma `include`.
- **Offset pagination** gets slow at scale; prefer **keyset/cursor** pagination for deep pages.
- **Connection pooling** (PgBouncer / Prisma pool) is mandatory in serverless to avoid exhausting Postgres connections.
- **Prisma** is a type-safe ORM + migration tool; the schema is the single source of truth.
- `include` fetches whole relations; `select` picks specific fields — use `select` to avoid over-fetching.
- `prisma migrate dev` (local, generates migrations) vs `prisma migrate deploy` (prod, applies existing ones).
- `$transaction` has two forms: a **sequential array** and an **interactive callback** (for conditional logic).
- **JSONB**, arrays, enums, UUID, and full-text search are Postgres superpowers MongoDB users feel at home with.
- Always **parameterize** raw queries (`$queryRaw` tagged template) — never string-concatenate user input.

## Basic

### Q1: What is the relational model — tables, rows, columns, schema?

**A:** The relational model organizes data into **tables** (relations). Each table has **columns** (attributes, with a name and a data type) and **rows** (records/tuples, one entity instance). The **schema** is the structural definition: which tables exist, their columns and types, keys, and constraints. Data is queried and combined declaratively with SQL, and relationships between tables are expressed via keys rather than embedding.

**Tip:** Contrast with MongoDB: a Postgres "table" ≈ a collection, a "row" ≈ a document, a "column" ≈ a field — but the schema is enforced up-front in Postgres, whereas Mongo is schema-flexible.

### Q2: SQL vs NoSQL — when do you choose each?

**A:** Choose **SQL/relational** (Postgres) when data is highly structured and relational, you need multi-row/multi-table **transactions** and strong consistency, you do complex querying (JOINs, aggregates, reporting), and you want schema enforcement. Choose **NoSQL** (MongoDB) when the schema is fluid, you need horizontal scale and very high write throughput, your access pattern is document-centric (read/write a whole aggregate at once), or you're prototyping fast. Many real systems are polyglot.

**Tip:** A clean answer ties back to the MongoDB file: "Mongo shines for flexible, denormalized documents; Postgres shines when relationships and transactional integrity matter — e.g. decrementing stock and creating an order atomically in Foody, which I'd never want to do across separate Mongo writes."

### Q3: What is a primary key?

**A:** A column (or set of columns) that uniquely identifies each row. It is **NOT NULL** and **UNIQUE**, and a table has at most one. Postgres auto-creates a unique index on it. Common choices: an auto-incrementing integer (`SERIAL`/identity) or a `UUID`.

**Tip:** Surrogate keys (auto-generated IDs) are usually preferred over natural keys (like email) because natural values can change; changing a PK that other tables reference is painful.

### Q4: What is a foreign key and what does it enforce?

**A:** A foreign key is a column that references another table's primary key, enforcing **referential integrity** — you can't insert an order for a customer that doesn't exist, and you can configure what happens on delete (`ON DELETE CASCADE`, `SET NULL`, `RESTRICT`). It's the database-level guarantee that relationships stay valid.

**Tip:** FKs are not automatically indexed in Postgres — index the FK column yourself if you JOIN or filter on it (otherwise deletes on the parent and JOINs can be slow).

### Q5: Explain the three relationship types.

**A:**

- **One-to-one (1:1)**: each row in A maps to at most one in B (e.g. User ↔ UserProfile). Put a unique FK on one side.
- **One-to-many (1:N)**: one parent, many children (e.g. Customer → Orders). The FK lives on the **many** side (`orders.customer_id`).
- **Many-to-many (M:N)**: e.g. Posts ↔ Tags. Requires a **junction (join) table** (`post_tags(post_id, tag_id)`) with two FKs, usually a composite PK of both.

**Tip:** In Prisma, explicit M:N uses a relation through a third model; implicit M:N (`Tag[]` on both sides) lets Prisma manage the join table for you.

### Q6: What is normalization (1NF, 2NF, 3NF) and why?

**A:** Normalization structures tables to **eliminate redundancy and update anomalies**.

- **1NF**: atomic column values, no repeating groups/arrays in a column.
- **2NF**: 1NF + every non-key column depends on the _whole_ primary key (no partial dependency on part of a composite key).
- **3NF**: 2NF + no **transitive** dependencies (non-key columns depend only on the key, not on other non-key columns).
  Goal: each fact stored once, so updates don't get inconsistent.

**Tip:** A memorable summary: "the key, the whole key, and nothing but the key."

### Q7: What is denormalization and when is it justified?

**A:** Deliberately introducing redundancy (duplicating data or precomputing aggregates) to speed up reads and avoid expensive JOINs. Justified for read-heavy, latency-sensitive paths — e.g. storing a cached `order_count` on a user, or a materialized view of a report. The trade-off is you must keep the duplicated data in sync, risking inconsistency.

**Tip:** Normalize by default; denormalize as a targeted optimization once you've measured a real bottleneck.

### Q8: Walk through the basic SQL CRUD statements.

**A:**

```sql
SELECT id, name FROM users WHERE age > 18 ORDER BY name ASC LIMIT 10 OFFSET 20;
INSERT INTO users (name, email) VALUES ('Ada', 'ada@x.com') RETURNING id;
UPDATE users SET name = 'Ada L.' WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

`WHERE` filters, `ORDER BY` sorts, `LIMIT`/`OFFSET` paginate, `RETURNING` (Postgres) gives you back the affected rows.

**Tip:** Always pair `UPDATE`/`DELETE` with a `WHERE` — forgetting it rewrites/wipes the whole table. In Postgres, `RETURNING` saves a follow-up SELECT.

### Q9: What does ORDER BY with LIMIT/OFFSET do, and what's the catch?

**A:** Sorts the result and returns a window of it — the classic page query. The catch: `OFFSET 100000` still makes Postgres scan and discard 100k rows, so deep pagination gets progressively slower.

**Tip:** For large datasets use **keyset/cursor** pagination instead (covered in Advanced).

### Q10: Explain INNER vs LEFT vs RIGHT vs FULL vs CROSS vs SELF JOIN.

**A:**

- **INNER JOIN**: only rows with matches in both tables.
- **LEFT (OUTER) JOIN**: all rows from the left table; unmatched right columns are NULL.
- **RIGHT (OUTER) JOIN**: all rows from the right; unmatched left columns NULL (mirror of LEFT).
- **FULL (OUTER) JOIN**: all rows from both, NULLs where no match.
- **CROSS JOIN**: cartesian product (every left row × every right row) — no condition.
- **SELF JOIN**: a table joined to itself (e.g. employees → their manager in the same table).

```sql
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;   -- users even with zero orders
```

**Tip:** "Find users with no orders" = `LEFT JOIN ... WHERE o.id IS NULL`. Knowing this anti-join trick is a common interview tell.

### Q11: GROUP BY and the aggregate functions?

**A:** `GROUP BY` collapses rows that share values in the grouping columns into one row, and aggregate functions summarize each group: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.

```sql
SELECT user_id, COUNT(*) AS orders, SUM(total) AS spent
FROM orders
GROUP BY user_id;
```

**Tip:** Every selected non-aggregated column must appear in `GROUP BY`. `COUNT(*)` counts rows; `COUNT(col)` ignores NULLs.

### Q12: HAVING vs WHERE?

**A:** `WHERE` filters individual rows **before** aggregation; `HAVING` filters **groups after** aggregation. You can't use an aggregate in `WHERE`.

```sql
SELECT user_id, SUM(total) AS spent
FROM orders
WHERE status = 'paid'        -- per-row filter
GROUP BY user_id
HAVING SUM(total) > 1000;     -- per-group filter
```

**Tip:** Prefer `WHERE` when possible — filtering before grouping processes fewer rows and is faster.

### Q13: UNION vs UNION ALL?

**A:** Both stack result sets vertically (same column count/types). `UNION` removes duplicate rows (which requires a sort/hash to dedupe); `UNION ALL` keeps everything and is faster.

**Tip:** Use `UNION ALL` unless you specifically need de-duplication — it skips the costly dedup step.

### Q14: What does DISTINCT do?

**A:** Removes duplicate rows from a result set based on the selected columns. `SELECT DISTINCT city FROM users` returns each city once.

**Tip:** `DISTINCT ON (col)` is a Postgres-specific feature that keeps the first row per `col` (great with `ORDER BY` for "latest per group").

### Q15: What is a constraint? Name the common ones.

**A:** Rules the database enforces on column values:

- **NOT NULL** — value required.
- **UNIQUE** — no duplicates (creates an index).
- **CHECK** — custom boolean condition (`CHECK (price >= 0)`).
- **DEFAULT** — value used when none supplied.
- **PRIMARY KEY** / **FOREIGN KEY** — identity and referential integrity.

**Tip:** Push invariants into the database with constraints when you can — they're enforced regardless of which app or script writes the data, unlike application-only validation.

## Intermediate

### Q16: What is an index and how does a B-tree index work?

**A:** An index is an auxiliary data structure that lets the DB find rows without scanning the whole table. Postgres's default is a **B-tree**: a balanced sorted tree giving O(log n) lookups for equality and range queries (`=`, `<`, `>`, `BETWEEN`, `ORDER BY`, prefix `LIKE 'foo%'`). It also enforces uniqueness for unique/PK constraints.

**Tip:** Indexes speed reads but **slow writes** (every INSERT/UPDATE/DELETE must update the index) and consume storage — so index selectively.

### Q17: How do composite indexes work and why does column order matter?

**A:** A composite index covers multiple columns in a defined order, e.g. `(tenant_id, created_at)`. Due to the **leftmost-prefix rule**, it can serve queries filtering on `tenant_id`, or `tenant_id AND created_at`, but **not** `created_at` alone. Put the column you most often filter by equality first, then range/sort columns.

**Tip:** For your Pharmacy FEFO multi-tenant queries, an index like `(tenant_id, expiry_date)` serves "this tenant's batches ordered by expiry" perfectly.

### Q18: What are covering, partial, and unique indexes?

**A:**

- **Covering index** (`INCLUDE` in Postgres): contains all columns a query needs, so Postgres answers from the index alone — an **index-only scan**, no heap fetch.
- **Partial index**: indexes only rows matching a condition, e.g. `WHERE deleted_at IS NULL` — smaller and faster for soft-delete-heavy tables.
- **Unique index**: enforces uniqueness and backs UNIQUE/PK constraints.

**Tip:** Partial indexes are a great fit for soft deletes: index only live rows, since that's all most queries care about.

### Q19: When should you NOT add an index?

**A:** When the table is tiny (seq scan is already fast), on low-cardinality columns where it won't help selectivity much (e.g. a boolean), on columns rarely used in WHERE/JOIN/ORDER BY, or on write-heavy tables where the write penalty outweighs read gains. Redundant indexes (already covered by a composite prefix) are pure overhead.

**Tip:** Every index is a cost on every write — "index everything" is an anti-pattern. Measure with real query patterns.

### Q20: What is EXPLAIN / EXPLAIN ANALYZE? What's a seq scan vs index scan?

**A:** `EXPLAIN` shows the planner's chosen **query plan** and cost estimates without running it; `EXPLAIN ANALYZE` actually runs it and reports **real timings and row counts**. A **Sequential Scan** reads the whole table (fine for small tables or low-selectivity filters); an **Index Scan** uses an index to jump to matching rows.

**Tip:** Red flags in a plan: a `Seq Scan` on a large table for a selective query, and big gaps between estimated and actual rows (stale statistics — run `ANALYZE`). For a real query you'd say: `EXPLAIN ANALYZE SELECT * FROM orders WHERE tenant_id = $1 AND status = 'pending';` and confirm it uses your `(tenant_id, status)` index rather than scanning.

### Q21: Explain ACID in depth.

**A:**

- **Atomicity**: a transaction is all-or-nothing — partial failures roll back entirely.
- **Consistency**: a transaction moves the DB from one valid state to another, respecting all constraints.
- **Isolation**: concurrent transactions don't corrupt each other; the degree is controlled by isolation levels.
- **Durability**: once committed, data survives crashes (written to the WAL / disk).

**Tip:** The Foody "decrement stock + create order" is the textbook atomicity case — if order creation fails, the stock decrement must roll back too.

### Q22: What are the SQL isolation levels and the anomalies they prevent?

**A:** From weakest to strongest:

- **Read Uncommitted** — can see uncommitted changes (**dirty reads**). (Postgres treats this as Read Committed.)
- **Read Committed** (Postgres default) — only sees committed data; still allows non-repeatable reads.
- **Repeatable Read** — same row read twice yields the same value; prevents **non-repeatable reads** (in Postgres, also mostly prevents phantoms via snapshot isolation).
- **Serializable** — strongest; transactions behave as if run one at a time, preventing **phantom reads** and all anomalies (may abort with serialization errors you must retry).

Anomalies: **dirty read** (reading uncommitted data), **non-repeatable read** (a row's value changes between two reads), **phantom read** (new rows appear matching a `WHERE` between reads).

**Tip:** Default Read Committed is fine for most apps; bump to Serializable for critical invariants (financial balances), and be ready to retry on serialization failures.

### Q23: What is a write-skew anomaly, and why don't ordinary transactions prevent it?

**A:** **Write skew** is when two concurrent transactions read an overlapping set of rows, each makes a decision based on that read, then each writes a **different** row — and the combined result violates an invariant that each transaction individually preserved. Classic example: an on-call roster must always have **at least one** doctor on call. Two doctors (Alice and Bob) both decide to go off call at the same time:

```sql
-- T1 (Alice)                              -- T2 (Bob)
BEGIN;                                     BEGIN;
SELECT count(*) FROM doctors               SELECT count(*) FROM doctors
  WHERE on_call;     -- sees 2               WHERE on_call;     -- sees 2
-- "2 on call, safe for me to leave"       -- "2 on call, safe for me to leave"
UPDATE doctors SET on_call = false
  WHERE name = 'Alice';                    UPDATE doctors SET on_call = false
                                             WHERE name = 'Bob';
COMMIT;                                    COMMIT;
-- now zero doctors on call — invariant broken
```

Each transaction read 2 and updated a **different** row, so there's **no write-write conflict** — Read Committed and Repeatable Read both let them through. It's not a lost update (no single row was overwritten); it's write skew on a disjoint set of rows. Fixes:

1. **Serializable isolation** — Postgres SSI (Serializable Snapshot Isolation) tracks the read/write dependencies and aborts one transaction at commit with a `serialization_failure` (SQLSTATE `40001`); your app must **retry** it.
2. **Materialize the conflict** with `SELECT ... FOR UPDATE` on the rows you reason about, forcing a real lock so the second transaction blocks and re-reads.
3. **Enforce the invariant with a constraint** or a counter row both transactions must touch, turning the implicit invariant into an explicit write-write conflict.

**Tip:** "Just use a transaction" isn't enough — name **Serializable (SSI)** or an explicit **`FOR UPDATE`** on the read set. This is the classic trap behind booking/inventory/on-call invariants where each transaction touches a different row.

### Q24: Optimistic vs pessimistic locking?

**A:**

- **Pessimistic**: lock rows before modifying (`SELECT ... FOR UPDATE`), blocking others until you commit. Good for high-contention writes where conflicts are likely.
- **Optimistic**: don't lock; instead add a `version` column, read it, and on update assert the version hasn't changed (`UPDATE ... WHERE id = ? AND version = ?`). If 0 rows updated, someone else won — retry. Good for low-contention, high-read workloads.

**Tip:** Pessimistic = "assume conflict, prevent it"; optimistic = "assume no conflict, detect it." Optimistic scales better but pushes retry logic to the app.

### Q25: What is SELECT ... FOR UPDATE and when use it?

**A:** It acquires a **row-level lock** on the selected rows so no other transaction can update/delete them until your transaction ends. Used to safely read-then-update in a transaction — e.g. read a stock count, check it's sufficient, then decrement, without a race.

```sql
BEGIN;
SELECT quantity FROM stock WHERE id = 1 FOR UPDATE;  -- locks the row
UPDATE stock SET quantity = quantity - 1 WHERE id = 1;
COMMIT;
```

**Tip:** Keep the locked window short to reduce contention; long transactions holding locks are a top cause of slowdowns and deadlocks.

### Q26: What's a deadlock and how do you avoid it?

**A:** A deadlock is when two transactions each hold a lock the other needs, so neither can proceed. Postgres detects it and aborts one with an error. **Avoid** by always acquiring locks in a **consistent order**, keeping transactions short, and reducing lock scope.

**Tip:** If you always update `accounts` then `orders` (never the reverse), two transactions can't form the cycle that causes a deadlock.

### Q27: Row-level vs table-level locking?

**A:** Row-level locks (the common case, e.g. from `UPDATE` or `FOR UPDATE`) lock only affected rows, allowing high concurrency. Table-level locks (e.g. from `ALTER TABLE`, `LOCK TABLE`) block broader access. Postgres uses **MVCC** so plain reads generally don't block writes and vice versa.

**Tip:** Most app code should never need explicit table locks; if you reach for one, reconsider the design.

### Q28: What is the N+1 query problem, how do you detect it, and how do you fix it?

**A:** N+1 happens when you run 1 query to fetch a list of parents, then 1 additional query per parent to fetch its children — N+1 total round-trips. Classic with ORMs and lazy-loaded relations. **Detect** it via query logs (you'll see the same child query repeated), an APM, or Prisma's query logging. **Fix** by fetching the relation in one go — a JOIN in SQL, or `include`/`select` in Prisma (which batches/joins for you).

```js
// N+1: 1 query for posts, then 1 per post for its author
const posts = await prisma.post.findMany();
for (const p of posts) {
  p.author = await prisma.user.findUnique({ where: { id: p.authorId } }); // N queries
}

// Fix: one query with the relation included
const posts = await prisma.post.findMany({ include: { author: true } });
```

**Tip:** You hit this in your projects — the giveaway is request latency that scales linearly with list size. Always reach for `include`/`select` when you'll need the relation.

### Q29: What is connection pooling and why does it matter (PgBouncer)?

**A:** Opening a Postgres connection is expensive, and Postgres has a hard `max_connections` limit (each connection is a backend process using memory). A **pool** reuses a fixed set of connections across many requests. **PgBouncer** is an external lightweight pooler that multiplexes thousands of client connections onto a small Postgres pool (transaction or session mode).

**Tip:** Critical in **serverless** — each function instance opening its own connections can exhaust Postgres instantly. Use PgBouncer (transaction mode) or a managed pooler, and point Prisma at it.

### Q30: What is a view vs a materialized view?

**A:** A **view** is a saved query — a virtual table re-evaluated each time you query it (always fresh, no storage). A **materialized view** stores the _result_ physically for fast reads, but is stale until you `REFRESH MATERIALIZED VIEW` it.

**Tip:** Use a materialized view for expensive aggregates/reports that can tolerate slight staleness; refresh on a schedule or `REFRESH ... CONCURRENTLY` to avoid blocking reads.

### Q31: Briefly: stored procedures, functions, and triggers?

**A:** **Functions** (`CREATE FUNCTION`, often in PL/pgSQL) encapsulate logic that runs in the DB and returns a value. **Stored procedures** are similar but can manage transactions. **Triggers** automatically run a function in response to INSERT/UPDATE/DELETE on a table (e.g. auto-update an `updated_at`, write an audit log).

**Tip:** Powerful but can hide business logic in the DB where it's hard to test/version. Most app teams keep logic in code and use triggers sparingly for cross-cutting concerns like auditing.

### Q32: What is a subquery vs a correlated subquery?

**A:** A **subquery** is a query nested inside another, evaluated once (`WHERE id IN (SELECT ...)`). A **correlated subquery** references the outer query and is conceptually re-evaluated for each outer row (`WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)`).

**Tip:** Correlated subqueries can be slow; often a JOIN or `EXISTS` is clearer and the planner optimizes better. Use `EXISTS` over `IN` for large/NULL-containing subquery results.

## Advanced

### Q33: What are CTEs (WITH) and why use them?

**A:** A Common Table Expression is a named temporary result set defined with `WITH`, improving readability and enabling **recursion**.

```sql
WITH paid_orders AS (
  SELECT * FROM orders WHERE status = 'paid'
)
SELECT user_id, SUM(total) FROM paid_orders GROUP BY user_id;
```

Recursive CTEs handle hierarchies (org charts, category trees).

**Tip:** Modern Postgres no longer always materializes CTEs (you can force with `MATERIALIZED`/`NOT MATERIALIZED`), so they're both readable and performant. Great for breaking a gnarly query into steps.

### Q34: Explain window functions (ROW_NUMBER, RANK, PARTITION BY).

**A:** Window functions compute across a set of rows **related to the current row** without collapsing them (unlike `GROUP BY`). `PARTITION BY` defines the groups; `ORDER BY` defines ordering within each.

```sql
SELECT id, user_id, total,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn,
  RANK()       OVER (PARTITION BY user_id ORDER BY total DESC)      AS rk
FROM orders;
```

`ROW_NUMBER` gives unique sequential numbers; `RANK` gives the same rank to ties and skips numbers; `DENSE_RANK` doesn't skip.

**Tip:** "Latest order per user" = filter `WHERE rn = 1` after a `ROW_NUMBER() PARTITION BY user_id ORDER BY created_at DESC` in a subquery/CTE. This is a frequent interview problem.

### Q35: How does keyset (cursor) pagination work and why is it better than offset at scale?

**A:** Instead of skipping N rows, you remember the last row's sort key and fetch rows _after_ it:

```sql
-- page after the last seen (created_at, id)
SELECT * FROM orders
WHERE (created_at, id) < ($lastCreatedAt, $lastId)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

This uses the index to jump straight to the next page in O(log n + page), regardless of how deep you are — whereas `OFFSET 1000000` must scan and discard a million rows.

**Tip:** Prisma supports this with `cursor` + `skip: 1` + `take`. Downside of keyset: no random "jump to page 500", but for infinite scroll / APIs it's far faster and stable under inserts.

### Q36: Why Postgres over MySQL?

**A:** Postgres tends to win on **standards compliance and feature depth**: rich `JSONB`, arrays, full-text search, window functions, CTEs (incl. recursive), proper `CHECK`/exclusion constraints, materialized views, extensions (PostGIS, pg_trgm), strong concurrency via MVCC, and `RETURNING`. MySQL is fast for simple read-heavy workloads and historically had simpler replication. For complex relational + JSON hybrid apps, Postgres is usually the safer modern default.

**Tip:** Frame it honestly: "Both are excellent; I default to Postgres for its JSONB, advanced querying, and constraint support — exactly what my multi-tenant pharmacy and ordering apps needed."

### Q37: JSON vs JSONB columns in Postgres?

**A:** `JSON` stores the raw text (preserves formatting/key order, slower to query). `JSONB` stores a parsed binary form — slightly slower to write, but much faster to query and **indexable with GIN**, supporting operators like `->`, `->>`, `@>` (containment), and key existence.

**Tip:** Almost always use **JSONB**. It lets you keep flexible/semi-structured fields in a relational table — a great "best of both worlds" for MERN devs used to Mongo. In Prisma, type it as `Json`.

### Q38: Postgres arrays, enums, and UUIDs?

**A:** **Arrays**: native column type (`text[]`) for ordered lists, queryable with `ANY`, `@>`, `unnest`. **Enums**: `CREATE TYPE status AS ENUM ('pending','paid')` for a fixed set of values, type-safe at the DB level. **UUID**: 128-bit identifiers, great for distributed/merge-friendly PKs (`gen_random_uuid()` from `pgcrypto`).

**Tip:** Prisma supports all three: `String[]`, `enum Status { pending paid }`, and `@default(uuid())`. UUID PKs avoid leaking row counts and make multi-region merges easier, at a small index-size cost vs integers.

### Q39: SERIAL vs identity columns?

**A:** `SERIAL` is the legacy shorthand that creates an integer column backed by a sequence. Modern Postgres prefers **identity columns** (`GENERATED ALWAYS AS IDENTITY`), which are SQL-standard and cleaner about ownership of the sequence.

**Tip:** Both auto-increment; identity is the recommended modern form. Prisma's `@default(autoincrement())` maps to this under the hood.

### Q40: What are Postgres schemas and extensions?

**A:** A **schema** is a namespace within a database grouping tables/types (e.g. `public`, or a per-tenant schema). **Extensions** add functionality: `pgcrypto` (UUIDs, hashing), `pg_trgm` (fuzzy text search), `PostGIS` (geo), `pg_stat_statements` (query monitoring).

**Tip:** Schema-per-tenant is one multi-tenancy strategy (strong isolation, harder to manage at scale); row-level `tenant_id` scoping (your FEFO approach) is the more common, simpler default.

### Q41: What is full-text search in Postgres?

**A:** Built-in search over text using `tsvector` (parsed/normalized document) and `tsquery` (search terms), with stemming and ranking (`ts_rank`). You index the `tsvector` with a **GIN** index for speed.

```sql
SELECT * FROM articles
WHERE to_tsvector('english', body) @@ to_tsquery('english', 'database & index');
```

**Tip:** Good enough to avoid bolting on Elasticsearch for many apps. For typo-tolerant/fuzzy matching, combine with `pg_trgm`.

### Q42: Explain MVCC and VACUUM.

**A:** **MVCC** (Multi-Version Concurrency Control): instead of locking on reads, Postgres keeps multiple row versions so readers see a consistent snapshot while writers create new versions. This is why readers don't block writers. The downside: updated/deleted rows leave **dead tuples**. **VACUUM** reclaims that space; **autovacuum** runs it automatically; `VACUUM ANALYZE` also refreshes planner statistics.

**Tip:** Table "bloat" and bad query plans often trace back to autovacuum not keeping up on high-churn tables — a real production concern.

### Q43: What is Prisma — an ORM, a query builder, or both?

**A:** Prisma is a **type-safe ORM toolkit**: a declarative schema language, a **migration** engine, and a generated, fully typed **Prisma Client** (a query builder that returns typed results). You write queries in TypeScript and Prisma compiles them to SQL. It sits between a heavy classical ORM (TypeORM) and a thin query builder (Knex).

**Tip:** Its headline value is end-to-end **type safety** derived from the schema — autocomplete and compile-time errors for your queries — which is why you've standardized on it.

### Q44: Walk through a Prisma schema with relations.

**A:**

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  orders    Order[]
  createdAt DateTime @default(now())
}

model Order {
  id        String      @id @default(uuid())
  total     Int
  status    OrderStatus @default(PENDING)
  user      User        @relation(fields: [userId], references: [id])
  userId    String
  items     OrderItem[]
  createdAt DateTime    @default(now())

  @@index([userId, status])
}

model OrderItem {
  id        String  @id @default(uuid())
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  productId String
  quantity  Int
}

enum Role         { USER ADMIN }
enum OrderStatus  { PENDING PAID CANCELLED }
```

**Tip:** Key attributes: `@id`, `@unique`, `@default(...)`, `@relation(fields/references)`, `@@index([...])`, `@@unique([...])`. The model with the scalar FK fields "owns" the relation; the other side just lists the array/object.

### Q45: prisma migrate dev vs deploy — and the migration history?

**A:** `prisma migrate dev` (local/dev) compares schema to DB, **generates** a new SQL migration file, applies it, and regenerates the client. `prisma migrate deploy` (CI/prod) **applies existing, committed migrations** without generating new ones — deterministic and non-interactive. Migrations live in `prisma/migrations/` as timestamped SQL folders, tracked in a `_prisma_migrations` table.

**Tip:** Never run `migrate dev` in production; commit migration files to git so prod applies the exact reviewed SQL. `prisma db push` (no migration files) is for prototyping only — don't use it on shared/prod databases.

### Q46: Show core Prisma Client queries.

**A:**

```js
await prisma.user.findMany({ where: { role: "ADMIN" }, take: 10 });
await prisma.user.findUnique({ where: { email: "a@x.com" } });
await prisma.user.create({ data: { email: "a@x.com", name: "Ada" } });
await prisma.user.update({ where: { id }, data: { name: "Ada L." } });
await prisma.user.delete({ where: { id } });
await prisma.order.aggregate({ _sum: { total: true }, where: { userId } });
```

**Tip:** `findUnique` requires a unique field (PK or `@unique`) and is cacheable/dataloader-batchable; `findFirst` takes any filter. Use `upsert` for create-or-update.

### Q47: include vs select — and how do they avoid over-fetching?

**A:** `include` pulls in **whole related records** alongside the parent. `select` lets you pick **exactly which scalar fields and relations** to return (and you can nest `select` inside relations). Using `select` avoids over-fetching unused columns/relations, reducing payload and query cost.

```js
// include: full author object
prisma.post.findMany({ include: { author: true } });

// select: only what you need
prisma.post.findMany({
  select: { id: true, title: true, author: { select: { name: true } } },
});
```

**Tip:** `include` and `select` are mutually exclusive at the same level. Default to `select` on hot paths to keep responses lean; reach for `include` for convenience when you genuinely need the whole relation.

### Q48: How does Prisma solve N+1 with include?

**A:** Instead of looping and querying per parent, you declare the relation once and Prisma fetches it efficiently — using either a JOIN or a small batched set of queries (with the relation-join query strategy it can do a single SQL JOIN).

```js
// One declaration → no per-row queries
const orders = await prisma.order.findMany({
  include: { user: true, items: true },
});
```

**Tip:** Prisma also has `relationLoadStrategy: 'join'` to force a single SQL JOIN instead of separate queries. Either way, the cure for N+1 is "ask for the relation up front," not "loop."

### Q49: Explain Prisma relations and nested writes.

**A:** Nested writes let you create/connect related records in **one atomic operation**:

```js
await prisma.order.create({
  data: {
    total: 500,
    user: { connect: { id: userId } }, // link existing
    items: {
      create: [
        // create children inline
        { productId: "p1", quantity: 2 },
        { productId: "p2", quantity: 1 },
      ],
    },
  },
});
```

Operators: `connect`, `create`, `connectOrCreate`, `disconnect`, `set`, `update`, `delete`.

**Tip:** A nested write runs inside an implicit transaction — if any part fails, the whole thing rolls back. That's cleaner and safer than separate calls.

### Q50: Show a Prisma $transaction that decrements stock and creates an order atomically.

**A:** Use the **interactive** form when you need conditional logic between steps (the FEFO/Foody case):

```js
const order = await prisma.$transaction(async (tx) => {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product || product.stock < qty) {
    throw new Error("Insufficient stock"); // aborts → full rollback
  }
  await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: qty } },
  });
  return tx.order.create({
    data: {
      userId,
      total: product.price * qty,
      items: { create: [{ productId, quantity: qty }] },
    },
  });
});
```

For independent operations with no branching, the **sequential array** form is simpler:

```js
const [a, b] = await prisma.$transaction([
  prisma.product.update({ where: { id }, data: { stock: { decrement: qty } } }),
  prisma.order.create({
    data: {
      /* ... */
    },
  }),
]);
```

**Tip:** To prevent oversell under concurrency, guard the decrement (`where: { id, stock: { gte: qty } }` and check `count`) or raise the isolation level / use `FOR UPDATE` via raw SQL. A bare read-then-write inside a transaction still races at Read Committed.

### Q51: When and how do you use raw queries ($queryRaw), and how do you stay injection-safe?

**A:** Use `$queryRaw`/`$executeRaw` when Prisma's API can't express something — complex window functions, CTEs, DB-specific SQL, or performance-tuned queries. Use the **tagged-template** form so values are sent as parameters, never interpolated into the SQL string:

```js
// SAFE: parameterized
const rows = await prisma.$queryRaw`
  SELECT id, total FROM "Order" WHERE "userId" = ${userId} AND total > ${min}`;

// DANGEROUS: never do this
prisma.$queryRawUnsafe(`SELECT * FROM "Order" WHERE userId = '${userId}'`);
```

**Tip:** The tagged-template `$queryRaw` parameterizes automatically — that's your SQL-injection protection. `$queryRawUnsafe` accepts a plain string and must only be used with values you fully control.

### Q52: Explain the multi-tenant Prisma client extension pattern (scoping every query to tenantId).

**A:** A `$extends` (Client Extension) wraps every model operation to automatically inject the tenant filter, so no query can accidentally leak across tenants — exactly your Pharmacy FEFO approach:

```js
function forTenant(tenantId) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // inject tenant scope into reads/filters
          if (args && "where" in args) {
            args.where = { ...args.where, tenantId };
          }
          // inject tenant on creates
          if (
            args &&
            "data" in args &&
            args.data &&
            !Array.isArray(args.data)
          ) {
            args.data = { tenantId, ...args.data };
          }
          return query(args);
        },
      },
    },
  });
}

const db = forTenant(req.tenantId);
await db.product.findMany(); // automatically WHERE tenantId = ...
```

**Tip:** Build the scoped client per-request from the authenticated tenant; centralizing it means devs can't forget the filter. (The older equivalent was `$use` middleware — extensions are the modern, type-safe replacement.) Pair with a composite index `@@index([tenantId, ...])` and ideally Postgres Row-Level Security as defense-in-depth.

### Q53: How does connection pooling work with Prisma, especially serverless?

**A:** Prisma Client keeps an internal connection pool (size set via the `connection_limit` query param on `DATABASE_URL`). In **serverless**, many short-lived function instances each create pools, which can blow past Postgres `max_connections`. Solutions: route through **PgBouncer** (transaction mode) or **Prisma Accelerate** / a managed pooler, and keep `connection_limit` small per instance.

**Tip:** With PgBouncer transaction mode, disable prepared statements (`pgbouncer=true` in the URL) since Prisma's prepared statements don't survive transaction-pooled connections.

### Q54: How do you use Postgres/Prisma from a serverless or Edge function without exhausting connections?

**A:** Each function instance keeps its **own** pool, so thousands of concurrent instances × pool size easily blow past Postgres's default ~100 `max_connections` — a **connection storm**. Strategies:

- **(a) An external pooler.** **PgBouncer** in **transaction mode** multiplexes many clients onto a few Postgres connections — but transaction pooling breaks prepared statements, so set `?pgbouncer=true` in the Prisma URL. Managed equivalents: **RDS Proxy**, the **Supabase pooler**.
- **(b) Prisma Accelerate** — a hosted connection pool + global cache in front of your database, used via the Accelerate client extension.
- **(c) HTTP/WebSocket drivers** — the **Neon serverless driver**, **PlanetScale HTTP**, or **Cloudflare Hyperdrive**. These are also **required on the Edge runtime**, which has **no raw TCP sockets**.

```ts
// Edge: Prisma Accelerate (HTTP) — no TCP needed
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());
```

```ts
// Edge: Neon serverless driver over WebSocket via the Prisma adapter
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

**Tip:** On the **Edge** there are no TCP sockets, so you **must** use an HTTP/WebSocket driver (Neon / PlanetScale / Hyperdrive / Accelerate). And remember the `pgbouncer=true` prepared-statement caveat whenever you route through a transaction-mode pooler.

### Q55: Prisma vs TypeORM vs Sequelize vs Knex — trade-offs?

**A:**

- **Prisma**: schema-first, best-in-class TypeScript types, great DX and migrations; less flexible for very dynamic/exotic SQL (drop to `$queryRaw`).
- **TypeORM**: decorator/entity-based Active Record or Data Mapper; full-featured but historically buggier types and migrations (you used it in **CineBite**).
- **Sequelize**: mature, widely used, JS-first; weaker TypeScript story (you used it with MySQL in **Shuhna**).
- **Knex**: a pure query builder, not an ORM — maximum SQL control, no models/relations management; great when you want to stay close to SQL.

**Tip:** A crisp framing: "Knex = query builder; Sequelize/TypeORM = classic ORMs; Prisma = schema-driven, type-safe ORM. I pick Prisma for type safety and migration ergonomics, and drop to raw SQL when I need power Prisma doesn't expose."

### Q56: How does seeding work in Prisma?

**A:** You write a seed script (configured under `prisma.seed` in package.json) that uses the client to insert baseline/dev data; `prisma db seed` runs it, and `prisma migrate reset` runs it after resetting the DB.

```js
// prisma/seed.ts
await prisma.user.createMany({
  data: [{ email: "admin@x.com", role: "ADMIN" }],
});
```

**Tip:** Make seeds **idempotent** (use `upsert`/`createMany` with `skipDuplicates`) so re-running doesn't error or duplicate.

### Q57: How do you define indexes in a Prisma schema?

**A:** With `@@index`, `@@unique`, `@unique`, and `@id` attributes:

```prisma
model Batch {
  id         String   @id @default(uuid())
  tenantId   String
  productId  String
  expiryDate DateTime
  @@index([tenantId, expiryDate])   // FEFO: this tenant's batches by expiry
  @@unique([tenantId, productId, batchNo])
}
```

**Tip:** Composite index order in Prisma follows the same leftmost-prefix rule as raw Postgres — put the equality-filtered column (`tenantId`) first.

### Q58: How do you implement soft deletes in Prisma?

**A:** Add a nullable `deletedAt DateTime?` and never physically delete — set the timestamp instead, and filter it out on reads (via a client extension so you don't forget). Back it with a **partial index** on live rows in Postgres.

```prisma
model Product { id String @id; deletedAt DateTime? }
```

```js
// extension to auto-filter and to "delete" by stamping deletedAt
```

**Tip:** Soft deletes complicate unique constraints (a "deleted" row still occupies a unique value) — use partial unique indexes (`WHERE deleted_at IS NULL`) to allow re-creating with the same key.

### Q59: How do you do optimistic concurrency in Prisma?

**A:** Add a `version Int @default(0)` field; on update, require the version you read and bump it. If no row matched, someone else updated first — retry or surface a conflict:

```js
const res = await prisma.account.updateMany({
  where: { id, version: currentVersion },
  data: { balance: newBalance, version: { increment: 1 } },
});
if (res.count === 0) throw new Error("Concurrent update — retry");
```

**Tip:** `updateMany` returns a `count`, which is what lets you detect the lost-update race; a plain `update` would just throw "record not found" and is less precise.

## Common Mistakes / Red Flags

- **Forgetting `WHERE` on UPDATE/DELETE** — rewrites or wipes the entire table.
- **Confusing WHERE and HAVING** — putting an aggregate in WHERE, or filtering rows in HAVING when WHERE would be faster.
- **N+1 queries** — looping and querying per item instead of one `include`/JOIN; latency that grows with list size.
- **Over-fetching with `include` everywhere** — pulling whole relations and all columns when `select` would return a fraction of the data.
- **Not indexing foreign keys** — slow JOINs and slow parent deletes because Postgres doesn't auto-index FKs.
- **Wrong composite index column order** — `(b, a)` won't serve a `WHERE a` query; ignoring the leftmost-prefix rule.
- **Indexing everything** — every index taxes writes; redundant/unused indexes are pure overhead.
- **Deep OFFSET pagination** — `OFFSET 1000000` scans and discards everything; use keyset/cursor.
- **String-interpolating user input into raw SQL** (`$queryRawUnsafe` with template literals) — SQL injection. Always parameterize.
- **Read-then-write race conditions** — checking stock then decrementing without a lock, guarded `where`, or higher isolation → oversell.
- **Running `migrate dev` or `db push` against production** — generate/review migrations and use `migrate deploy` in prod.
- **Long-running transactions** — hold locks, cause deadlocks and bloat; keep transactions short.
- **Exhausting Postgres connections in serverless** — no PgBouncer/pooler; each function spawns its own connections.
- **Multi-tenant query forgetting `tenantId`** — cross-tenant data leak; centralize scoping in a client extension (and add RLS).
- **Assuming Repeatable Read = Serializable** — phantoms and write skew can still bite without the strongest level.
- **Ignoring VACUUM/autovacuum** — table bloat and stale stats degrade plans on high-churn tables.
- **Treating `findUnique` and `findFirst` as interchangeable** — `findUnique` only accepts unique fields; misuse leads to surprising errors or missed batching.

## Further Reading

- PostgreSQL Documentation — https://www.postgresql.org/docs/current/
- Prisma Documentation — https://www.prisma.io/docs
- Use The Index, Luke! (indexing & query performance) — https://use-the-index-luke.com/
- PostgreSQL `EXPLAIN` / query planning guide — https://www.postgresql.org/docs/current/using-explain.html
