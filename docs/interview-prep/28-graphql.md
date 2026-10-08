# GraphQL (33 questions)

> GraphQL comes up in nearly every full-stack interview, even at REST-first shops, because interviewers want to know you understand API design trade-offs — not just that you can wire up an endpoint. Be honest: your day-to-day is REST (see `10-rest-api-design.md`), and that's a strength, not a weakness — REST is the right default for most CRUD and public APIs. But you should know GraphQL's fundamentals cold (the type system, resolvers, the N+1/DataLoader problem) and be able to articulate _when_ you'd reach for GraphQL versus REST and _why_. This file frames GraphQL through a NestJS + Apollo + MongoDB lens (NestJS has first-class GraphQL support), so it maps onto the stack you already know.

## Quick Revision Checklist

- GraphQL is a **query language + runtime** for APIs, not a database or a framework. One endpoint (`POST /graphql`), client specifies the exact shape it wants.
- Solves **over-fetching** (REST returns fixed payloads), **under-fetching** (REST needs N round-trips for nested data), and the "too many endpoints" sprawl.
- **Strongly typed schema (SDL)** is the contract between client and server — self-documenting and introspectable.
- Three operation types: **Query** (read), **Mutation** (write), **Subscription** (real-time over WebSocket).
- A query resolves field-by-field via **resolvers**; signature is `(parent, args, context, info)`.
- The **N+1 problem** is the #1 GraphQL perf gotcha — fix with **DataLoader** (per-request batching + caching). Know this cold.
- **Schema-first vs code-first** — NestJS supports both; code-first uses TS decorators (`@ObjectType`, `@Resolver`, `@Query`, `@Mutation`, `@Args`).
- **Nullability** (`!` = non-null), **lists** (`[Type!]!`), **input types** for mutation args, **enums**, **interfaces**, **unions**.
- **Pagination**: offset/limit (simple) vs cursor-based **Relay connections** (`edges`/`node`/`cursor`/`pageInfo`) for stable, scalable paging.
- **Versioning**: GraphQL avoids URL versions — evolve additively, deprecate fields with `@deprecated(reason: ...)`.
- **Errors**: response has both `data` and `errors` arrays — partial results are possible. Mask internal errors in prod.
- **Caching is harder than REST** — no URLs to cache on. Client-side normalized cache (Apollo Client), persisted queries, `@cacheControl` for CDNs.
- **Security**: depth limiting, query complexity/cost analysis, rate limiting, **disable introspection in prod**, watch for injection and DoS via deep queries (see `24-security.md`).
- **Auth/authz** lives in the **context** object; field-level authz via guards/directives.
- **Federation / schema stitching** compose multiple GraphQL services into one supergraph (microservices — see `30`).
- Client tooling: **Apollo Client / urql / Relay**, **GraphQL Code Generator** for typed hooks, **GraphiQL/Playground** for exploration. Apollo Client ≈ React Query for GraphQL (see `05-state-management.md`).

## Basic

### Q1: What is GraphQL and what problem does it solve?

**A:** GraphQL is a query language for APIs plus a server-side runtime for fulfilling those queries against your data. The client sends a query describing exactly the fields it wants, and the server returns JSON in that same shape. It was created at Facebook to address pain points with REST on mobile:

- **Over-fetching** — a REST endpoint like `GET /users/1` returns the whole user object even if you only need the name. GraphQL returns only requested fields.
- **Under-fetching / N+1 round-trips** — to render a screen you often need a user, their posts, and each post's comments. With REST that's multiple sequential calls. GraphQL fetches it in one request.
- **Endpoint sprawl** — REST tends to grow many specialized endpoints (`/users/1/posts/with-comments`). GraphQL has a single endpoint and the client composes what it needs.

**Tip:** Don't say "GraphQL replaces REST." Say it's a different API style that trades simplicity and HTTP-native caching for flexible, client-driven data fetching. Interviewers respect nuance over hype.

### Q2: How does GraphQL differ from REST at a high level?

**A:**

- **Endpoints:** REST = many resource URLs + HTTP verbs; GraphQL = one endpoint, typically `POST /graphql`.
- **Response shape:** REST = server-defined, fixed; GraphQL = client-defined, exactly what's requested.
- **Type system:** REST has no built-in schema (OpenAPI is bolted on); GraphQL has a mandatory typed schema.
- **Discovery:** GraphQL is introspectable — tooling can auto-generate docs and types from the live schema.
- **Caching:** REST leverages HTTP caching (URLs + verbs + status codes); GraphQL can't easily use HTTP caching because everything is one POST.

**Tip:** Frame it as "REST is resource-oriented; GraphQL is graph/field-oriented."

### Q3: What is the SDL (Schema Definition Language)?

**A:** SDL is the human-readable language for defining a GraphQL schema — the types, fields, and operations your API exposes. The schema is the _contract_ between client and server.

```graphql
type User {
  id: ID!
  email: String!
  displayName: String
  accounts: [Account!]!
}

type Account {
  id: ID!
  balanceCents: Int!
  currency: Currency!
  owner: User!
}

enum Currency {
  USD
  EUR
  GBP
}

type Query {
  user(id: ID!): User
  accounts(ownerId: ID!): [Account!]!
}

type Mutation {
  openAccount(input: OpenAccountInput!): Account!
}

input OpenAccountInput {
  ownerId: ID!
  currency: Currency!
}
```

**Tip:** The `Query`, `Mutation`, and `Subscription` types are special "root" types — they're the entry points into the graph.

### Q4: What are the three operation types?

**A:**

- **Query** — read operations (the GET equivalent). Should be side-effect free.
- **Mutation** — write operations (POST/PUT/PATCH/DELETE equivalent). Mutations at the top level run **sequentially**, while query fields can resolve in parallel.
- **Subscription** — long-lived operations that push data to the client over a transport like WebSockets (real-time updates).

**Tip:** Naming convention: queries are nouns (`user`, `accounts`); mutations are verbs (`openAccount`, `transferFunds`).

### Q5: What are scalar types, and can you define custom scalars?

**A:** Built-in scalars are `Int`, `Float`, `String`, `Boolean`, and `ID` (a serialized-as-string unique identifier). Scalars are the leaves of any query — they resolve to concrete values, not further selections.

You can define **custom scalars** for domain types like `DateTime`, `EmailAddress`, `JSON`, or `Decimal`. A custom scalar provides `serialize` (server → JSON), `parseValue` (JSON variable → server), and `parseLiteral` (inline literal → server) functions. In NestJS you commonly use `graphql-scalars` (e.g. `GraphQLDateTime`).

**Tip:** For a fintech app, a `Decimal`/`BigInt`-backed custom scalar for money avoids floating-point errors — mention this; it shows domain awareness. (Or store money as integer cents.)

### Q6: What's the difference between object types, fields, and arguments?

**A:**

- **Object type** — a named collection of fields (`type User { ... }`).
- **Field** — a property on a type; can itself return a scalar, an object, or a list. Every field can have a resolver.
- **Argument** — typed parameters on a field, e.g. `user(id: ID!): User` or `posts(first: Int, after: String): [Post!]!`. Arguments work on any field, not just root queries.

**Tip:** Field arguments enable powerful patterns like field-level pagination and filtering: `user(id: 1) { posts(status: PUBLISHED, first: 10) { title } }`.

### Q7: What does it mean that "the schema is a contract"?

**A:** The schema defines every possible query and the exact types returned. The client can only ask for fields that exist; the server guarantees the shape. This decouples teams: front-end can build against the schema (and mock it) while back-end implements resolvers. Tooling validates queries against the schema _before_ execution, catching errors at build/dev time.

**Tip:** This is a big selling point versus untyped REST — fewer "the API changed and broke my app" surprises.

### Q8: Show a query selecting fields, including nested fields.

**A:**

```graphql
query {
  user(id: "u_123") {
    id
    displayName
    accounts {
      id
      balanceCents
      currency
    }
  }
}
```

The response mirrors the query exactly:

```json
{
  "data": {
    "user": {
      "id": "u_123",
      "displayName": "Ada",
      "accounts": [{ "id": "a_1", "balanceCents": 50000, "currency": "USD" }]
    }
  }
}
```

**Tip:** "The response shape mirrors the query" is the one-liner that demonstrates you get the core idea.

### Q9: What are aliases, fragments, and variables?

**A:**

- **Aliases** rename fields in the response — required when you query the same field twice with different args:

```graphql
query {
  usd: accounts(currency: USD) {
    id
  }
  eur: accounts(currency: EUR) {
    id
  }
}
```

- **Fragments** are reusable field sets — DRY for repeated selections:

```graphql
fragment AccountFields on Account {
  id
  balanceCents
  currency
}
query {
  accounts(ownerId: "u_1") {
    ...AccountFields
  }
}
```

- **Variables** parameterize queries so you don't string-concatenate (safer, cacheable):

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    displayName
  }
}
```

with variables `{ "id": "u_123" }`.

**Tip:** Always use variables, never interpolate values into the query string — it's the GraphQL equivalent of parameterized SQL (injection safety + query caching).

### Q10: How do mutations work, and what are input types?

**A:** A mutation is a field on the root `Mutation` type that performs a write and returns data (typically the modified object so the client can update its cache).

```graphql
mutation TransferFunds($input: TransferInput!) {
  transferFunds(input: $input) {
    transaction {
      id
      status
      amountCents
    }
    fromAccount {
      id
      balanceCents
    }
    toAccount {
      id
      balanceCents
    }
  }
}
```

**Input types** (`input TransferInput { ... }`) are special types used only for arguments. They differ from object types: input fields can't have resolvers or args, and they can't include interfaces/unions. Bundling args into one input object keeps mutation signatures clean and evolvable.

**Tip:** Return the changed entities (and related ones whose state changed, like balances) so the client cache stays consistent without a refetch.

### Q11: How is a query resolved, step by step?

**A:** Execution walks the query tree depth-first from the root:

1. Server parses and validates the query against the schema.
2. It resolves the root field (e.g. `user`) by calling its resolver.
3. For each selected sub-field, it calls that field's resolver, passing the **parent** (the resolved root object) as the first argument.
4. This recurses until it hits scalars (leaves).
5. Results are assembled into JSON matching the query shape.

So a nested query triggers a _chain_ of resolvers — and that chain is exactly where the N+1 problem appears.

**Tip:** "Each field is independently resolvable" is the mental model that makes resolvers and DataLoader click.

## Intermediate

### Q12: What is a resolver and what's its function signature?

**A:** A resolver is the function that produces the value for a field. Its signature (Apollo/NestJS):

```ts
fieldResolver(parent, args, context, info);
```

- **parent** (a.k.a. `root`/`source`) — the value returned by the parent field's resolver.
- **args** — the field's arguments (typed).
- **context** — a per-request object shared across all resolvers (auth user, DataLoaders, db connections, request metadata).
- **info** — the AST/execution info (requested fields, path, schema) — used for advanced things like projecting only requested fields.

**Tip:** Most resolvers only need `parent`, `args`, and `context`. `info` is for optimization (e.g. building a MongoDB projection from requested fields).

### Q13: What are default resolvers?

**A:** If you don't write a resolver for a field, GraphQL uses a **default resolver**: it looks for a property (or method) with the same name on the `parent` object and returns it. So if your `user` resolver returns `{ id, email, displayName }`, the `email` field resolves automatically. You only write explicit resolvers for fields that need computation, fetching related data, or formatting.

**Tip:** This is why many object types need few resolvers — only the "relationship" fields (like `User.accounts`) and computed fields need custom logic.

### Q14: Walk through how nested resolvers execute and where N+1 comes from.

**A:** Consider:

```graphql
query {
  accounts(ownerId: "u_1") {
    id
    owner {
      displayName
    }
  }
}
```

1. `accounts` resolver runs once → returns 100 accounts.
2. For each account, the `owner` resolver runs → that's **100 separate DB lookups** for users.

That's the **N+1 problem**: 1 query for the list + N queries for the related field. Even if all owners are the same or there are only a few distinct ones, naive resolvers fire one query per item.

**Tip:** The N+1 problem isn't unique to GraphQL (ORMs have it too), but GraphQL's per-field resolution makes it especially easy to introduce.

### Q15: How does DataLoader solve N+1? (Very common interview question.)

**A:** **DataLoader** (a per-request utility from Facebook) **batches** and **caches** lookups:

- **Batching** — instead of fetching one key at a time, DataLoader collects all keys requested within a single event-loop tick and calls a batch function _once_ with all keys (e.g. `findUsersByIds([...])`).
- **Caching** — within one request, repeated loads of the same key return the cached result (memoization), so duplicate owners aren't re-fetched.

```ts
import DataLoader from 'dataloader';

const userLoader = new DataLoader<string, User>(async (ids) => {
  const users = await userModel.find({ _id: { $in: ids } }).lean();
  const map = new Map(users.map(u => [String(u._id), u]));
  // MUST return results in the SAME ORDER as the input keys
  return ids.map(id => map.get(id) ?? new Error(`No user ${id}`));
});

// In the owner resolver:
owner(account, _args, ctx) {
  return ctx.loaders.userLoader.load(account.ownerId); // batched + cached
}
```

The 100 `owner` lookups collapse into **one** `find({ _id: { $in: [...] } })`.

**Tip:** Two must-say details:

1. create a **fresh DataLoader per request** (caching is request-scoped to avoid stale data and cross-user leakage)
2. the batch function **must return results in the same order as the input keys** — that's the #1 DataLoader bug

### Q16: What's schema-first vs code-first, and which does NestJS use?

**A:**

- **Schema-first** — you write the SDL `.graphql` files by hand; resolvers are wired to match. Schema is the source of truth.
- **Code-first** — you write TypeScript classes with decorators; the SDL is **generated** from your code. Types stay in sync with your code, and you get end-to-end TS typing.

**NestJS supports both.** Code-first is popular because it removes the duplication between SDL and TS types and integrates with class-validator, DI, and guards.

**Tip:** For a TS-heavy NestJS shop, code-first is usually the better DX. Mention that the trade-off is the schema becomes a build artifact rather than hand-authored.

### Q17: Show a code-first resolver in NestJS.

**A:**

```ts
// account.model.ts
@ObjectType()
export class Account {
  @Field(() => ID) id: string;
  @Field(() => Int) balanceCents: number;
  @Field(() => Currency) currency: Currency;
  ownerId: string; // not exposed; used by the owner resolver
}

// open-account.input.ts
@InputType()
export class OpenAccountInput {
  @Field(() => ID) ownerId: string;
  @Field(() => Currency) currency: Currency;
}

// account.resolver.ts
@Resolver(() => Account)
export class AccountResolver {
  constructor(
    private readonly accounts: AccountsService,
    private readonly users: UsersService,
  ) {}

  @Query(() => [Account])
  accounts(@Args("ownerId", { type: () => ID }) ownerId: string) {
    return this.accounts.findByOwner(ownerId);
  }

  @Mutation(() => Account)
  @UseGuards(GqlAuthGuard)
  openAccount(@Args("input") input: OpenAccountInput) {
    return this.accounts.open(input);
  }

  // Field resolver for the relationship — this is where DataLoader goes
  @ResolveField(() => User)
  owner(@Parent() account: Account, @Context() ctx) {
    return ctx.loaders.userLoader.load(account.ownerId);
  }
}
```

This mirrors NestJS REST controllers (see `09-nestjs.md`) — same DI, guards, and pipes, just GraphQL decorators. MongoDB/Mongoose access lives in the services exactly as in `12-mongodb-mongoose.md`.

**Tip:** `@ResolveField` is the code-first equivalent of a nested/relationship resolver — call it out as the natural home for DataLoader.

### Q18: What are interfaces and unions?

**A:**

- **Interface** — an abstract type with shared fields that concrete types implement. Use when types share fields:

```graphql
interface Transaction {
  id: ID!
  amountCents: Int!
  createdAt: DateTime!
}
type Deposit implements Transaction {
  id: ID!
  amountCents: Int!
  createdAt: DateTime!
  source: String!
}
type Withdrawal implements Transaction {
  id: ID!
  amountCents: Int!
  createdAt: DateTime!
  destination: String!
}
```

- **Union** — "one of these types," with no required shared fields:

```graphql
union SearchResult = User | Account | Transaction
```

Querying either requires inline fragments and a `__typename` to discriminate:

```graphql
{
  search(q: "ada") {
    __typename
    ... on User {
      displayName
    }
    ... on Account {
      balanceCents
    }
  }
}
```

Both need a `resolveType` function so the runtime knows the concrete type at execution.

**Tip:** Interface = "is-a with shared fields"; union = "could be any of these, possibly unrelated."

### Q19: Explain nullability, lists, and how they combine.

**A:** By default every field is **nullable**. `!` marks **non-null**. For lists you control nullability at two levels:

- `[Account]` — list may be null; items may be null.
- `[Account!]` — list may be null; items are non-null.
- `[Account!]!` — list is non-null (at least `[]`); items are non-null. **Most common for collections.**

If a non-null field resolves to null/throws, the error **propagates up** to the nearest nullable parent, nulling that whole branch.

**Tip:** Be deliberate: marking too much non-null makes the schema brittle (one failing field nulls a big subtree). A common rule: lists `[T!]!`, but be cautious with deeply nested non-null object fields.

### Q20: Offset vs cursor (Relay) pagination — what's the difference?

**A:**

- **Offset/limit** (`accounts(offset: 40, limit: 20)`) — simple, but suffers from drift (items shifting between pages on insert/delete) and is slow at deep offsets in large datasets.
- **Cursor-based / Relay Connections** — stable and scalable. Standard shape:

```graphql
type AccountConnection {
  edges: [AccountEdge!]!
  pageInfo: PageInfo!
}
type AccountEdge {
  cursor: String!
  node: Account!
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  accounts(first: Int, after: String): AccountConnection!
}
```

The cursor is an opaque token (often a base64-encoded id/sort key). The client passes `after: endCursor` to get the next page.

**Tip:** Cursor pagination pairs well with MongoDB — use an indexed sort key (e.g. `_id` or `createdAt`) as the cursor and query `{ _id: { $gt: cursor } }` (see `12-mongodb-mongoose.md`). Avoid `skip` at large offsets.

### Q21: How does GraphQL handle versioning and schema evolution?

**A:** GraphQL deliberately avoids URL versioning (`/v1`, `/v2`). Instead you **evolve the single schema additively**:

- Add new fields/types freely — existing clients are unaffected because they only get what they ask for.
- To remove/rename, mark the old field `@deprecated(reason: "Use newField")`. Tooling surfaces the deprecation; you remove it only once no client uses it (track via analytics/persisted queries).
- Avoid breaking changes: changing a field's type, making a nullable field non-null in args inputs, removing enum values, etc.

**Tip:** "Additive evolution + `@deprecated`, no URL versions" is the crisp answer. Mention monitoring field usage before removal.

### Q22: How does error handling work in GraphQL?

**A:** A GraphQL response can contain **both** `data` and `errors`:

```json
{
  "data": { "user": { "id": "u_1", "accounts": null } },
  "errors": [
    {
      "message": "Forbidden",
      "path": ["user", "accounts"],
      "extensions": { "code": "FORBIDDEN" }
    }
  ]
}
```

- HTTP status is usually `200` even for partial failures (transport succeeded; the operation partially failed). Newer spec/servers may use other codes for request-level errors.
- A failing field becomes `null` (and propagates per nullability rules) while other fields can still return data — **partial results**.
- Use `extensions.code` for machine-readable error codes (Apollo conventions: `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`).

**Tip:** Distinguish "field error → null + entry in `errors`" from "deliberate empty result → `null` with no error." Interviewers like this distinction.

### Q23: How do auth and authz fit into GraphQL?

**A:**

- **Authentication** happens at the transport edge (validate the JWT/session from headers) and the user is placed on the **context**, available to every resolver.
- **Authorization** is enforced in resolvers (or guards/directives). Because clients can ask for any field, you often need **field-level authz**, not just route-level — e.g. anyone can read `Account.id` but only the owner can read `Account.balanceCents`.

In NestJS, reuse your existing `@UseGuards(GqlAuthGuard)` (the GraphQL variant of your REST guards from `09-nestjs.md`); access the request via `GqlExecutionContext`.

**Tip:** Say "GraphQL pushes authz down to the field level" — it's a real difference from REST where the route is often the authz boundary.

## Advanced

### Q24: Why is caching harder in GraphQL than REST, and what are the options?

**A:** REST gets HTTP caching for free: unique URLs + GET + status codes mean browsers, CDNs, and reverse proxies can cache responses. GraphQL sends everything as `POST /graphql` with varying bodies — there's no cacheable URL key, and POST isn't cached by default. Options:

- **Client-side normalized cache** (Apollo Client, urql Graphcache) — stores objects by `__typename:id` so different queries share cached entities. This is the main caching win.
- **Persisted queries / APQ (Automatic Persisted Queries)** — send a query _hash_ instead of the full text, allowing GET requests + CDN caching of common operations.
- **`@cacheControl` directives / response cache** — Apollo Server can compute cache hints (max-age, scope) per field and emit HTTP cache headers or use a server-side response cache.
- **DataLoader** — request-scoped caching (not cross-request).

**Tip:** "No URL to cache on" is the soundbite. Then mention normalized client cache + persisted queries as the practical answers.

### Q25: How do you prevent malicious or runaway queries (DoS protection)?

**A:** Because clients build arbitrary nested queries, a single request can be catastrophically expensive (e.g. deeply cyclic `user { friends { friends { friends ... } } }`). Defenses:

- **Depth limiting** — reject queries beyond a max nesting depth (`graphql-depth-limit`).
- **Query complexity / cost analysis** — assign a cost to each field (and multiply by pagination args), reject queries over a budget (`graphql-query-complexity`).
- **Amount limiting / pagination caps** — cap `first`/`limit` values.
- **Timeouts** and **rate limiting** on the endpoint.
- **Persisted queries allow-list** — in high-security contexts, only accept pre-registered queries, blocking arbitrary ones entirely.
- **Disable introspection in production** (see below).

**Tip:** This is a favorite security question (see `24-security.md`). Lead with depth + complexity limiting; for fintech, mention a persisted-query allow-list as the strongest control.

### Q26: What is introspection and why disable it in production?

**A:** Introspection is GraphQL's built-in ability to query the schema itself (`__schema`, `__type`) — it powers GraphiQL, Code Generator, and IDE autocomplete. The downside: it exposes your entire API surface to attackers, making it trivial to discover sensitive operations and fields. In production you typically **disable introspection** (and the Playground/GraphiQL UI), keeping it on only in dev/staging.

**Tip:** Caveat: disabling introspection is "security by obscurity," not real protection — it raises the bar but real authz still matters. Mention both.

### Q27: What are directives? Give examples.

**A:** Directives annotate the schema or query with `@name(args)` to change execution or behavior:

- **Query directives:** `@include(if: $bool)` and `@skip(if: $bool)` conditionally include fields; `@defer`/`@stream` (incremental delivery) send parts of the response progressively.
- **Schema directives:** `@deprecated(reason: ...)`, plus **custom directives** for cross-cutting concerns like `@auth(requires: ADMIN)`, `@cacheControl(maxAge: 60)`, `@upper`, etc.

```graphql
query GetUser($id: ID!, $withAccounts: Boolean!) {
  user(id: $id) {
    displayName
    accounts @include(if: $withAccounts) {
      id
      balanceCents
    }
  }
}
```

**Tip:** Custom auth directives are a clean way to declare field-level authz in schema-first setups; in code-first NestJS you'd more often use guards.

### Q28: What is federation / schema stitching?

**A:** They compose multiple GraphQL services into one unified graph for microservices:

- **Schema stitching** (older) — a gateway merges remote schemas and delegates fields; the gateway owns the composition logic.
- **Apollo Federation** (current standard) — each subgraph owns part of the graph and declares how its types extend others (via `@key`, `@external`, reference resolvers). A **gateway/router** composes them into a **supergraph**. A type like `User` can be defined in the accounts service and extended in the transactions service.

This lets teams own and deploy their slice of the schema independently while clients see one endpoint.

**Tip:** Tie it to microservices (`30`) — federation is GraphQL's answer to "one API surface over many services." For a fintech with bounded contexts (accounts, payments, ledger), federation is the natural fit.

### Q29: How do file uploads work in GraphQL?

**A:** GraphQL JSON has no native binary type. The common approach is the **GraphQL multipart request spec** (`graphql-upload`), which sends a multipart form with an `Upload` scalar. However, it's often simpler and more robust to **handle uploads out-of-band**: upload directly to object storage (S3) via a pre-signed URL obtained from a mutation, then send only the resulting file key/URL through GraphQL.

**Tip:** Recommending pre-signed S3 URLs over piping bytes through GraphQL shows production maturity — it keeps your GraphQL server stateless and avoids large-payload handling.

### Q30: How do subscriptions work and when should you use them?

**A:** Subscriptions deliver real-time updates over a persistent transport (today: **graphql-ws** over WebSockets; SSE is also possible). The server maintains a **pub/sub** mechanism: a mutation publishes an event, and subscribed clients receive matching payloads.

```graphql
subscription {
  transactionPosted(accountId: "a_1") {
    id
    amountCents
    status
  }
}
```

In NestJS code-first you use `@Subscription()` with a `PubSub` (in-memory for one instance; Redis-backed for multiple). Use subscriptions for genuinely live data — balances, order status, notifications. For one-off "refresh after action," polling or a refetch is simpler.

**Tip:** Cross-reference `15-realtime-websockets.md`. Note the scaling caveat: in-memory PubSub doesn't work across multiple instances — you need a Redis (or similar) PubSub backplane.

### Q31: How do you batch multiple operations, and how is that different from DataLoader?

**A:** Two different "batching":

- **Query batching** (transport-level) — Apollo Client can send multiple GraphQL operations in one HTTP request (an array), reducing round-trips. Server must support batched requests.
- **DataLoader batching** (resolver-level) — combines many _field_ fetches into one _data-source_ call within a single operation.

They're complementary: query batching reduces HTTP requests; DataLoader reduces DB/backend calls.

**Tip:** Don't conflate the two — interviewers asking "how do you batch in GraphQL" usually mean DataLoader/N+1, but knowing both distinguishes you.

### Q32: How should you format/mask errors in production?

**A:** Raw resolver errors can leak stack traces, DB messages, and internals. In production:

- Strip stack traces and internal messages; return a generic message with a stable `extensions.code`.
- Map known domain errors (validation, auth) to specific codes; map everything else to `INTERNAL_SERVER_ERROR`.
- Log the full error server-side with a correlation/request id; return that id to the client for support.
- Apollo Server: use `formatError` (and `includeStacktraceInErrorResponses: false` in prod).

**Tip:** "Mask internals, expose codes, log with a request id" — same hygiene as REST (`10`), just via `formatError`/`extensions`.

### Q33: What does the `info` argument enable?

**A:** `info` carries the resolved query AST and execution state — which fields the client actually requested, the path, and the schema. A practical use: build a **MongoDB projection** from the requested fields so you only fetch the columns the client asked for (avoiding over-fetching from the DB, not just the client). Libraries like `graphql-fields` parse `info` into a field map.

**Tip:** Use sparingly — projection-from-`info` is powerful but couples resolvers to query shape and can complicate DataLoader. Reach for it only when payloads are large.

## REST vs GraphQL — Decision Guide

| Dimension               | REST                                                          | GraphQL                                                                                       |
| ----------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Endpoints**           | Many resource URLs + verbs                                    | Single endpoint (`POST /graphql`)                                                             |
| **Over/under-fetching** | Common; fixed payloads, multiple round-trips for nested data  | Client picks exact fields; one round-trip for nested graphs                                   |
| **Caching**             | Excellent — native HTTP/CDN caching via URLs + verbs          | Harder — no URL key; needs client normalized cache, persisted queries, `@cacheControl`        |
| **Versioning**          | URL/header versions (`/v1`, `/v2`)                            | Additive evolution + `@deprecated`; no URL versions                                           |
| **Learning curve**      | Low; ubiquitous; HTTP-native                                  | Higher; schema, resolvers, DataLoader, tooling                                                |
| **File uploads**        | Native (multipart, streams)                                   | Awkward; prefer pre-signed S3 URLs                                                            |
| **Real-time**           | SSE/WebSockets bolted on                                      | First-class Subscriptions (still needs WS infra)                                              |
| **Tooling/typing**      | OpenAPI (optional, bolt-on)                                   | Built-in schema + introspection; codegen for typed clients                                    |
| **Error handling**      | HTTP status codes                                             | `errors` array + partial `data`; usually 200                                                  |
| **Security surface**    | Per-route; well-understood                                    | Larger — arbitrary nested queries (DoS), introspection leakage; needs depth/complexity limits |
| **Best fit**            | CRUD, public APIs, simple/known data needs, cache-heavy reads | Complex/nested data, many heterogeneous clients, mobile bandwidth, aggregating microservices  |

**Honest guidance:** REST is the right default for most CRUD services and public APIs — it's simpler, cache-friendly, and everyone knows it. Reach for GraphQL when: you have **many clients** with different data needs (web + iOS + Android), your data is **highly relational/nested** and REST forces lots of round-trips, **mobile bandwidth** matters (precise fetching), or you're **aggregating multiple microservices** behind one typed graph (federation). A common pragmatic middle ground: REST for the public/partner API and internal CRUD, GraphQL as a **BFF (backend-for-frontend)** aggregation layer for rich client screens. For a REST-first fintech, the strongest honest answer is: "REST serves our CRUD and partner APIs well; I'd introduce GraphQL where client-driven aggregation across services becomes painful — and I'd budget for the caching and query-cost-limiting work it requires."

## Common Mistakes / Red Flags

- **Ignoring N+1 / not knowing DataLoader.** The single most common interview disqualifier. Always mention DataLoader for relationship fields, per-request, key-order-preserving.
- **Saying "GraphQL replaces REST."** It's a trade-off, not an upgrade. Over-hyping it reads as inexperience.
- **No query-cost protection.** Shipping GraphQL without depth limiting / complexity analysis is a DoS waiting to happen — a real red flag for fintech.
- **Leaving introspection + Playground on in production.** Exposes the full attack surface.
- **String-interpolating values into queries** instead of using variables (injection risk, kills caching).
- **Over-using non-null (`!`).** One failing deeply-nested non-null field can null a huge subtree via error propagation.
- **Sharing a DataLoader across requests.** Causes stale data and cross-user data leakage — must be request-scoped.
- **Wrong batch-function order.** DataLoader requires results in the same order as input keys; getting this wrong silently returns mismatched data.
- **Expecting HTTP caching to "just work."** It won't; plan client-side normalized cache / persisted queries.
- **Putting business/authz logic only at the root.** Clients can request any field — enforce field-level authz where needed.
- **Returning `null` for "not found" without distinguishing it from errors.** Be intentional about field error vs deliberate null.
- **Treating mutations as parallel.** Top-level mutation fields run sequentially — relying on parallelism is wrong.

## Further Reading

- [Official GraphQL docs — Learn](https://graphql.org/learn/) — language, type system, execution, best practices.
- [NestJS GraphQL (code-first) documentation](https://docs.nestjs.com/graphql/quick-start) — resolvers, decorators, federation in NestJS.
- [Apollo Server docs](https://www.apollographql.com/docs/apollo-server/) — schema, performance, caching, security (`formatError`, complexity).
- [DataLoader (facebook/dataloader)](https://github.com/graphql/dataloader) — batching & caching, the canonical N+1 solution.
