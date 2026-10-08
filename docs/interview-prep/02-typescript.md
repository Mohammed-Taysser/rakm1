# TypeScript (50 questions)

> TypeScript shows up in almost every MERN interview today because it's the lingua franca of modern React, NestJS, and Express codebases. Interviewers use it to probe whether you understand _why_ types help (catching bugs at compile time, self-documenting contracts, safer refactors) and whether you can wield the advanced bits — generics, utility/conditional types, narrowing — without fighting the compiler. The user works in TS daily across React 18/19, NestJS (decorators + DTOs), Express, and Prisma, so expect questions that connect type theory to real app boundaries: API responses, hooks, DTO validation, and DB results.

## Quick Revision Checklist

- `interface` is open/mergeable and best for object/contract shapes; `type` is a flexible alias for unions, tuples, primitives, and mapped/conditional types.
- `any` disables checking (avoid); `unknown` is the safe top type (must narrow before use); `never` is the bottom type (impossible value); `void` means "no useful return".
- Prefer `unknown` over `any` for untrusted input (API responses, `JSON.parse`, `catch` clauses).
- Type narrowing tools: `typeof`, `instanceof`, `in`, equality/truthiness, and custom type guards (`x is T`).
- Discriminated unions (a shared literal tag like `status`) are the cleanest way to model API state and variant data.
- Generics give reusable, type-safe abstractions; constrain with `extends`, supply defaults with `=`.
- Memorize the core utility types: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`.
- `keyof`, indexed access (`T[K]`), and `typeof` (value→type) are the building blocks of mapped types.
- Conditional types (`T extends U ? X : Y`) + `infer` let you extract types from other types.
- Template literal types build string types compositionally (`` `on${Capitalize<K>}` ``).
- `as const` freezes literals; `satisfies` validates a value against a type _without widening_ it.
- Structural typing: compatibility is by shape, not by name ("duck typing").
- Enable `strict` (turns on `noImplicitAny`, `strictNullChecks`, etc.) — it's the single most important tsconfig flag.
- NestJS relies on `experimentalDecorators` + `emitDecoratorMetadata` for DTOs/DI; class-validator decorators run at runtime.
- Prefer union-of-literals over `enum` in most app code; reach for `const enum`/`enum` only when you need their specific behavior.
- `.d.ts` files describe shapes for JS libraries with no compiled output; `declare` introduces ambient types.

## Basic

### Q1: What is TypeScript and what problem does it solve?

**A:** TypeScript is a strongly-typed superset of JavaScript that compiles (transpiles) to plain JS. It adds a static type system checked at compile time, so type errors surface in your editor/CI instead of at runtime. Benefits: fewer bugs, self-documenting code, safer refactors, and rich IDE autocompletion. The types are erased at compile time — they have zero runtime cost.

**Tip:** Say "types are erased" — interviewers love confirming you know TS provides _no_ runtime type checking, which is why you still need libraries like Zod/class-validator at boundaries.

### Q2: `interface` vs `type` — what's the difference and when do you use each?

**A:** Both describe shapes. Key differences: `interface` supports declaration merging and is conventionally used for object/class contracts and public APIs; `type` is an alias that can also express unions, intersections, tuples, primitives, and mapped/conditional types. `interface` can `extends`; `type` composes with `&`.

```ts
interface User {
  id: string;
  name: string;
}
interface User {
  email: string;
} // merged: id + name + email

type ID = string | number; // unions need type
type Point = [number, number]; // tuples need type
```

**Tip:** A safe rule to state: "interface for object shapes, type for everything else." Mention that for public library types, interfaces are friendlier (mergeable, better error messages).

### Q3: What are the primitive types in TypeScript?

**A:** `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, and `undefined`. Note that `null`/`undefined` are only meaningfully separate from other types when `strictNullChecks` is on. Use lowercase primitives (`string`), not the boxed object types (`String`).

**Tip:** A classic gotcha: never type something as `String`/`Number` (capital) — those are wrapper object types and behave subtly differently.

### Q4: How do you type arrays and tuples?

**A:** Arrays: `number[]` or `Array<number>`. Tuples are fixed-length, position-typed arrays:

```ts
const ids: number[] = [1, 2, 3];
const pair: [string, number] = ["age", 30];
const [name, setName] = useState<string>(""); // useState returns a tuple
```

Tuples can have labels and rest elements: `[first: string, ...rest: number[]]`.

**Tip:** Mention that React's `useState` returns a tuple `[value, setter]` — that's why destructuring works and why ordering matters.

### Q5: Enums vs union of string literals — which do you prefer?

**A:** A union of literals is usually preferable in app code: it's a pure type (zero runtime output), tree-shakeable, and works naturally with narrowing. `enum` generates a runtime object and has quirks (numeric enums allow reverse mapping; non-`const` enums can't be erased).

```ts
type Role = "admin" | "user" | "guest"; // preferred
enum RoleEnum {
  Admin = "admin",
  User = "user",
} // runtime object emitted
```

**Tip:** If asked "why avoid enums," cite the runtime footprint and that `const enum` can break with certain bundlers/`isolatedModules`. Many style guides (incl. some at Google) ban enums.

### Q6: What does type inference do, and when should you add explicit annotations?

**A:** TS infers types from initializers, return values, and context, so you don't annotate everything. Add explicit types for: function parameters, public API/return types you want to lock down, and empty initializers.

```ts
let count = 0;            // inferred number
const fn = (x: number) => x * 2; // params need annotation
function getUser(): User { ... } // explicit return = documented contract
```

**Tip:** Good answer: "let the compiler infer locals, but annotate function boundaries." Over-annotating is a minor red flag.

### Q7: What is `any` and why is it dangerous?

**A:** `any` opts out of type checking entirely — anything is assignable to/from it, and it silently spreads through your code, disabling safety. It defeats the purpose of TS. Use `unknown` when you don't know the type, and enable `noImplicitAny` to ban accidental `any`.

**Tip:** Strong candidates say they grep for `any` in code review. Acceptable uses: rapid migration of legacy JS, or truly dynamic interop — but always isolated.

### Q8: What's the difference between `any` and `unknown`?

**A:** Both accept any value, but `unknown` is type-safe: you can assign anything _to_ it, but you can't _use_ it (call, access props) until you narrow it. `any` lets you do anything with no checks.

```ts
function handle(input: unknown) {
  // input.foo -> error
  if (typeof input === "string") input.toUpperCase(); // ok after narrowing
}
```

**Tip:** "Use `unknown` for `JSON.parse`, API responses, and `catch` clauses." In TS 4.4+ catch clause variables can be typed `unknown` via `useUnknownInCatchVariables`.

### Q9: What are `void` and `never`?

**A:** `void` is the return type of a function that doesn't return a useful value. `never` is the type of a value that never occurs — functions that always throw or infinite-loop return `never`, and `never` is the type of variables in unreachable branches. `never` is also the empty union and is assignable to everything.

```ts
function log(msg: string): void {
  console.log(msg);
}
function fail(msg: string): never {
  throw new Error(msg);
}
```

**Tip:** `never` is the key to exhaustiveness checking in `switch` over discriminated unions — be ready to demonstrate that.

### Q10: What are union and intersection types?

**A:** A union `A | B` means "either A or B" (you can only access members common to both until narrowed). An intersection `A & B` means "both A and B combined" (has all members of each).

```ts
type Result = Success | Failure; // union
type Staff = Person & Employee; // intersection
```

**Tip:** Watch the inversion: union _narrows_ what you can access; intersection _widens_ it. Interviewers test whether you confuse the two.

### Q11: What are literal types?

**A:** Types that represent a single exact value, e.g. `"GET"`, `42`, `true`. Combined with unions they model finite sets of allowed values.

```ts
type Method = "GET" | "POST" | "PUT" | "DELETE";
function request(url: string, method: Method) {}
```

**Tip:** Note literal _widening_: `let x = "GET"` infers `string`, but `const x = "GET"` infers the literal `"GET"`. `as const` is how you preserve literals in objects/arrays.

## Intermediate

### Q12: What is type narrowing? Name the main techniques.

**A:** Narrowing is how TS refines a broad type to a more specific one within a code branch. Techniques: `typeof` (primitives), `instanceof` (classes), the `in` operator (property presence), equality/`===` checks, truthiness checks, discriminated-union tag checks, and custom type-guard functions.

```ts
function format(x: string | number) {
  if (typeof x === "number") return x.toFixed(2); // x: number here
  return x.trim(); // x: string here
}
```

**Tip:** Be able to name at least four narrowing mechanisms — it's a very common rapid-fire question.

### Q13: What is a custom type guard (`x is T`)?

**A:** A function whose return type is a _type predicate_ `param is Type`. When it returns true, TS narrows the argument to that type in the caller.

```ts
interface Cat {
  meow(): void;
}
interface Dog {
  bark(): void;
}
function isCat(a: Cat | Dog): a is Cat {
  return "meow" in a;
}
if (isCat(pet)) pet.meow(); // narrowed to Cat
```

**Tip:** Mention the risk: type predicates are _unchecked assertions_ — if your boolean logic is wrong, TS still trusts you, creating a runtime lie. TS 5.5 added inference of predicates for some filter functions.

### Q14: What is a discriminated (tagged) union and why is it powerful?

**A:** A union of object types that share a common literal "discriminant" field. Checking that field narrows the whole object, including its other properties. Ideal for API request state.

```ts
type FetchState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function render<T>(s: FetchState<T>) {
  switch (s.status) {
    case "success":
      return s.data; // data only exists here
    case "error":
      return s.error; // error only exists here
    case "loading":
      return null;
  }
}
```

**Tip:** Pair it with an exhaustiveness check: `default: const _exhaustive: never = s;` — adding a new variant then becomes a compile error.

### Q15: What are generics and why use them?

**A:** Generics parameterize types so a function/class/type can work over many types while preserving the relationship between inputs and outputs (type safety without `any`).

```ts
function identity<T>(value: T): T {
  return value;
}
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

**Tip:** The classic anti-pattern question: "why not `any[]`?" — because generics keep the return type tied to the input, so callers get precise types back.

### Q16: How do generic constraints (`extends`) and default type params work?

**A:** `extends` restricts what a type parameter can be; `= Default` provides a fallback when none is supplied/inferred.

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
interface Box<T = string> {
  value: T;
}
const b: Box = { value: "hi" }; // T defaults to string
```

**Tip:** `K extends keyof T` is the canonical example interviewers expect — it makes `getProp` return the exact property type.

### Q17: Explain `keyof` and indexed access types.

**A:** `keyof T` produces a union of T's property keys. `T[K]` (indexed access) gets the type of a property by key.

```ts
interface User {
  id: string;
  age: number;
}
type UserKeys = keyof User; // "id" | "age"
type AgeType = User["age"]; // number
type Values = User[keyof User]; // string | number
```

**Tip:** These two power most utility/mapped types — knowing them signals you can read advanced type code.

### Q18: What is the `typeof` operator in a type context?

**A:** It captures the _type_ of a value (variable, object, function), letting you derive types from runtime data — useful for config objects and `as const` literals.

```ts
const config = { port: 3000, host: "localhost" } as const;
type Config = typeof config; // { readonly port: 3000; readonly host: "localhost" }
```

**Tip:** Distinguish JS `typeof` (runtime string) from type-level `typeof` (compile time). Combine with `keyof typeof obj` to get an object's keys as a type.

### Q19: Walk through the common utility types.

**A:** They transform existing types:

- `Partial<T>` — all props optional; `Required<T>` — all required.
- `Readonly<T>` — all props readonly.
- `Pick<T, K>` — subset of keys; `Omit<T, K>` — all keys except K.
- `Record<K, V>` — object with keys K and values V.
- `Exclude<U, X>` / `Extract<U, X>` — remove/keep members of a union.
- `NonNullable<T>` — strip `null | undefined`.
- `ReturnType<F>` / `Parameters<F>` — a function's return / params tuple.
- `Awaited<T>` — the resolved type of a `Promise` (recursively).

```ts
type UserUpdate = Partial<Omit<User, "id">>;
type Handlers = Record<"onOpen" | "onClose", () => void>;
type R = Awaited<ReturnType<typeof fetchUser>>;
```

**Tip:** Be ready to _implement_ `Partial`/`Pick` from scratch — it's a frequent follow-up (see mapped types).

### Q20: What are mapped types?

**A:** Types that build a new object type by iterating over keys of another, optionally transforming each. They power most utility types.

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };
```

You can add/remove modifiers with `+`/`-` (e.g. `-readonly`, `-?`) and remap keys with `as`.

**Tip:** Show the `-?` trick: `Required<T>` is `{ [K in keyof T]-?: T[K] }`. Mention key remapping (`as`) added in TS 4.1.

### Q21: What is the `satisfies` operator and how does it differ from `as`?

**A:** `satisfies` (TS 4.9) checks that a value conforms to a type _without changing/widening_ the inferred type — you keep the precise literal type while getting validation. `as` is a type assertion that overrides inference (and can be unsafe).

```ts
const routes = {
  home: "/",
  user: "/users/:id",
} satisfies Record<string, string>;
// routes.home is still the literal "/", and typos in keys are caught.
```

**Tip:** The key phrase: "`satisfies` validates without widening; `as` asserts and can lie." Great signal of up-to-date TS knowledge.

### Q22: Explain `as const` (const assertions).

**A:** `as const` makes a value deeply `readonly` and infers the narrowest literal types, preventing widening. Essential for config, action-type constants, and tuples.

```ts
const COLORS = ["red", "green"] as const; // readonly ["red", "green"]
type Color = (typeof COLORS)[number]; // "red" | "green"
```

**Tip:** `typeof arr[number]` to derive a union from a `const` array is a pattern interviewers love.

### Q23: What are type assertions (`as`) and the non-null assertion (`!`)?

**A:** `as T` tells the compiler to treat a value as type T (only widening/narrowing along the type hierarchy is allowed without `as unknown as T`). `!` asserts a value is non-null/undefined.

```ts
const el = document.getElementById("app") as HTMLDivElement;
const len = maybeStr!.length; // assert maybeStr isn't null
```

**Tip:** Both are escape hatches that bypass the checker — flag `!` overuse as a smell; prefer real narrowing or optional chaining.

### Q24: What is structural typing?

**A:** TS compares types by _shape_, not by name (nominal typing). If an object has all required members of a type, it's assignable — even if it was never declared to implement it.

```ts
interface Named {
  name: string;
}
function greet(n: Named) {}
greet({ name: "Ada", extra: 1 }); // ok via a variable; object literals get excess-property checks
```

**Tip:** Mention _excess property checks_: object literals assigned directly are checked for extra props, but the same object via a variable is not.

### Q25: What are function overloads?

**A:** Multiple call signatures for one function, letting return/param types depend on the inputs. You write several signature lines and one implementation.

```ts
function parse(x: string): object;
function parse(x: number): string;
function parse(x: string | number): object | string {
  return typeof x === "string" ? JSON.parse(x) : String(x);
}
```

**Tip:** Note that overloads are often better expressed with generics or unions; modern TS frequently prefers those. Interviewers may ask "could you do this without overloads?"

## Advanced

### Q26: What are conditional types and `infer`?

**A:** Conditional types pick a type based on a relationship: `T extends U ? X : Y`. `infer` declares a type variable to _extract_ a piece of a matched type within the `extends` clause.

```ts
type ElementType<T> = T extends (infer U)[] ? U : T;
type A = ElementType<string[]>; // string

type MyReturn<F> = F extends (...args: any[]) => infer R ? R : never;
```

**Tip:** Conditional types distribute over unions when the checked type is a "naked" type parameter — e.g. `T extends X ? ... : ...` applies per union member. Wrapping in `[T]` disables distribution.

### Q27: What are template literal types?

**A:** String literal types built by interpolation, with intrinsic helpers `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. Great for event names, CSS, route params.

```ts
type Event = "click" | "hover";
type Handler = `on${Capitalize<Event>}`; // "onClick" | "onHover"

type Route = `/users/${string}`;
```

**Tip:** Combine with mapped-type key remapping to generate getter/handler names — a powerful, interview-impressive pattern.

### Q28: What are assertion functions?

**A:** Functions whose signature uses `asserts` to tell TS that, if they return normally, a condition holds (narrowing the variable afterward). Two forms: `asserts cond` and `asserts x is T`.

```ts
function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg);
}
function assertIsString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("not a string");
}
const v: unknown = getValue();
assertIsString(v);
v.toUpperCase(); // v narrowed to string
```

**Tip:** Distinguish from type guards: guards _return a boolean_; assertion functions _throw_ and narrow for the rest of the scope.

### Q29: What is declaration merging?

**A:** TS merges multiple declarations with the same name in the same scope. Interfaces with the same name combine their members; namespaces merge; you can augment third-party modules.

```ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    } // augment req.user
  }
}
```

**Tip:** This is the standard way to add `req.user` in Express middleware — a very common real-world MERN example.

### Q30: Modules vs namespaces — which should you use?

**A:** Use ES modules (`import`/`export`) — they're the standard, support tree-shaking, and align with the JS ecosystem. Namespaces (`namespace Foo {}`) are a legacy internal-module mechanism, occasionally still used for ambient global typings or grouping in `.d.ts` files.

**Tip:** "Prefer modules; namespaces mostly for legacy/global ambient declarations." Mentioning tree-shaking shows you understand the practical impact.

### Q31: What are `.d.ts` declaration files?

**A:** Files containing only type declarations (no implementation) that describe the shape of JS code/libraries. They let TS type-check usage of untyped JS. `declare` introduces ambient types; `tsc --declaration` auto-generates `.d.ts` for your own libraries. `@types/*` packages (DefinitelyTyped) ship declarations for popular JS libs.

**Tip:** Know `declare module "*.svg"` for typing non-code imports (assets) in React projects — a frequent real config task.

### Q32: Which tsconfig options matter most?

**A:**

- `strict` — master switch enabling `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `noImplicitThis`, `alwaysStrict`, etc.
- `noImplicitAny` — error on inferred `any`.
- `strictNullChecks` — `null`/`undefined` are not assignable to other types unless explicit.
- `esModuleInterop` — fixes default-import interop with CommonJS modules.
- `paths` / `baseUrl` — path aliases (`@/components/...`).
- Others worth naming: `target`, `module`, `moduleResolution: "bundler"`, `jsx`, `skipLibCheck`, `noUncheckedIndexedAccess`.

**Tip:** If you only name one, name `strict`. Bonus: `noUncheckedIndexedAccess` makes `arr[i]` return `T | undefined` — a great safety upgrade many teams enable.

### Q33: How do decorators work, and how does NestJS use them?

**A:** Decorators are functions that annotate/modify classes, methods, properties, and params. NestJS uses them heavily for DI and metadata: `@Controller`, `@Injectable`, `@Get`, `@Body`, `@Param`. They require `experimentalDecorators` and `emitDecoratorMetadata` in tsconfig; the latter emits runtime type metadata used by Nest and class-validator.

```ts
@Controller("users")
export class UsersController {
  @Get(":id")
  findOne(@Param("id") id: string) { ... }
}
```

**Tip:** Note that NestJS still uses the legacy/experimental decorator implementation (reflect-metadata), which differs from the TC39 Stage 3 decorators stabilized in TS 5.0. Mentioning this distinction is a strong signal.

### Q34: How do you type a React component's props (and children)?

**A:** Define an interface/type for props and annotate the function. Use `React.ReactNode` for children; prefer explicit props over `React.FC` (which has fallen out of favor for implicit children and generics issues).

```ts
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
  children?: React.ReactNode;
}
function Button({ label, variant = "primary", onClick }: ButtonProps) {
  return <button className={variant} onClick={onClick}>{label}</button>;
}
```

**Tip:** Be ready to explain why many teams dropped `React.FC`. Also know `ComponentProps<'button'>` to inherit native element props.

### Q35: How do you type `useState`, `useRef`, and `useReducer`?

**A:**

```ts
const [user, setUser] = useState<User | null>(null); // explicit when init is null
const inputRef = useRef<HTMLInputElement>(null);
const [state, dispatch] = useReducer(reducer, initialState);
// reducer typed as (state: State, action: Action) => State
```

`useState` infers from the initial value, so only annotate when the initial value is `null`/`undefined` or narrower than intended.

**Tip:** Common gotcha: `useRef<HTMLInputElement>(null)` makes `.current` possibly null — you must null-check (or use the non-null `!` carefully).

### Q36: How do you build a generic, type-safe `useFetch<T>` hook?

**A:** Parameterize the data type and return a discriminated union so consumers must handle each state.

```ts
type FetchState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });
  useEffect(() => {
    let active = true;
    fetch(url)
      .then((r) => r.json() as Promise<T>)
      .then((data) => active && setState({ status: "success", data }))
      .catch(
        (e: unknown) =>
          active && setState({ status: "error", error: String(e) }),
      );
    return () => {
      active = false;
    };
  }, [url]);
  return state;
}
// const s = useFetch<User[]>("/api/users");
```

**Tip:** Note the `as Promise<T>` is an unchecked assertion — in real code validate with Zod. Interviewers may push: "is that data actually `T` at runtime?" Answer: no, hence runtime validation.

### Q37: How do you create a generic React component?

**A:** Make the function itself generic over the item type.

```ts
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((it, i) => <li key={i}>{renderItem(it)}</li>)}</ul>;
}
// <List items={users} renderItem={u => u.name} />  // T inferred as User
```

**Tip:** In `.tsx`, a bare `<T>` arrow is ambiguous with JSX — use `<T,>` (trailing comma) or `function` declarations. That's a real gotcha worth mentioning.

### Q38: How do you type API responses safely?

**A:** Define interfaces for the expected shape, but treat the raw response as `unknown` and validate (Zod/io-ts/class-validator) before trusting it — TS can't verify runtime data.

```ts
interface ApiUser {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<ApiUser> {
  const res = await fetch(`/api/users/${id}`);
  const data: unknown = await res.json();
  return UserSchema.parse(data); // Zod gives runtime + static safety
}
```

**Tip:** The strongest answer ties static types to runtime validation: "types are erased, so a typed `.json()` is a lie unless validated." Zod's `z.infer` keeps one source of truth.

### Q39: How do you type a typed API client with generics?

**A:**

```ts
async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
const users = await apiClient<User[]>("/users");
const created = await apiClient<User>("/users", {
  method: "POST",
  body: JSON.stringify(dto),
});
```

**Tip:** Mention you can encode routes→response-type maps with mapped/template types for full end-to-end safety (e.g. tRPC does this). Don't over-engineer unless asked.

### Q40: How do you type Express `req`/`res` (incl. body, params, query)?

**A:** Express's `Request` generic is `Request<Params, ResBody, ReqBody, Query>`. Augment `Request` for custom fields (like `req.user`).

```ts
import { Request, Response } from "express";

interface CreateUserBody {
  name: string;
  email: string;
}
type Params = { id: string };

app.post(
  "/users/:id",
  (req: Request<Params, unknown, CreateUserBody>, res: Response) => {
    const { id } = req.params; // string
    const { name } = req.body; // typed
    res.json({ id, name });
  },
);
```

**Tip:** Stress that `req.body`/`req.query` are _not_ actually validated by these types — they come from the wire as `any`-ish. Validate at runtime. The `req.user` augmentation via declaration merging is a likely follow-up.

### Q41: How do you type a NestJS DTO with validation decorators?

**A:** A class with class-validator decorators; Nest's `ValidationPipe` enforces them at runtime, while the class also serves as the static type.

```ts
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
```

**Tip:** Explain _why a class, not an interface_: interfaces are erased at runtime, so decorators/metadata need a class. This is a classic NestJS interview point. The `!` definite-assignment asserts the field is set by the framework.

### Q42: How do you type Prisma query results?

**A:** Prisma generates types from your schema; use the generated model types and helpers like `Prisma.UserGetPayload` for results with relations/selects, or let inference flow from the query.

```ts
import { Prisma, User } from "@prisma/client";

const user: User = await prisma.user.findUniqueOrThrow({ where: { id } });

// Result type including a relation:
type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>;

// Partial via select is inferred automatically:
const partial = await prisma.user.findMany({
  select: { id: true, name: true },
});
// partial: { id: string; name: string }[]
```

**Tip:** Key insight: Prisma's return type _changes_ based on `select`/`include`. Use `GetPayload` to name those derived types instead of redefining them by hand.

### Q43: How do conditional types distribute over unions, and how do you stop it?

**A:** When the checked type is a naked type parameter, the conditional applies to each union member individually, then re-unions the results. Wrapping both sides in a tuple `[T]` prevents distribution.

```ts
type ToArray<T> = T extends any ? T[] : never;
type A = ToArray<string | number>; // string[] | number[]  (distributed)

type ToArrayNoDist<T> = [T] extends [any] ? T[] : never;
type B = ToArrayNoDist<string | number>; // (string | number)[]
```

**Tip:** This explains how `Exclude`/`Extract` work (they distribute). Knowing how to _disable_ distribution shows real depth.

### Q44: How would you implement `Pick` and `Exclude` yourself?

**A:**

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyExclude<U, X> = U extends X ? never : U; // distributive
type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;
```

**Tip:** A favorite whiteboard question. `Exclude` relies on distribution + `never` collapsing out of unions.

### Q45: What is the difference between `readonly` arrays/tuples and `Readonly<T>`?

**A:** `Readonly<T>` makes object properties readonly (shallow). For arrays/tuples use `readonly T[]` / `ReadonlyArray<T>` which removes mutating methods (`push`, `splice`). `as const` produces deeply readonly literals.

```ts
function sum(xs: readonly number[]) {
  /* xs.push(1) -> error */
}
```

**Tip:** Mention readonly is _compile-time only_ — nothing stops mutation at runtime; use `Object.freeze` for that.

### Q46: What does `noUncheckedIndexedAccess` change?

**A:** It adds `| undefined` to results of index/array access, forcing you to handle the possibly-missing case.

```ts
const arr = [1, 2, 3];
const x = arr[10]; // type: number | undefined (with the flag on)
```

**Tip:** Great to cite as a "flag I turn on for safety" — shows you think about real null-safety beyond `strict`.

### Q47: How does TS handle `this` typing in functions/classes?

**A:** You can declare a `this` parameter (first, fake param) to type the calling context, and `noImplicitThis`/`strictBindCallApply` improve safety of `this`, `.bind`, `.call`, `.apply`.

```ts
function handler(this: HTMLButtonElement, e: Event) {
  this.disabled = true;
}
```

**Tip:** Relevant in event handlers and older callback APIs; arrow functions don't get their own `this`, so no `this` param there.

### Q48: What are variance and `strictFunctionTypes`?

**A:** Function parameters are contravariant under `strictFunctionTypes` (a function accepting a broader param is assignable where a narrower one is expected), while method parameters remain bivariant for ergonomic DOM/array typing. Return types are covariant.

**Tip:** Deep-cut question; even a high-level "params contravariant, returns covariant, methods bivariant" answer impresses senior interviewers.

### Q49: How do you fake nominal typing in TypeScript (branded / opaque types)?

**A:** TS is structurally typed, so two `string`s that mean different things are the same type — a `UserId` and an `OrderId` are interchangeable and you can pass the wrong one with zero errors. A **branded** (opaque) type fixes this by intersecting the base type with a phantom tag that exists only at the type level. You then build values through a **smart constructor** that validates and asserts the brand, so the only way to get a `UserId` is to go through `userId()`.

```ts
type Brand<T, B> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function userId(s: string): UserId {
  if (!s) throw new Error("empty id");
  return s as UserId; // assert the brand after validating
}

function getUser(id: UserId) {
  /* ... */
}

const u = userId("u_123");
getUser(u); // ok
getUser("u_123"); // error: string is not UserId
getUser("o_9" as OrderId); // error: OrderId is not UserId
```

**Tip:** Brands are erased at runtime (zero cost — the `__brand` field never exists) yet stop "passed the wrong id" bugs the compiler would otherwise allow. Same trick types validated values (`Email`, `NonEmptyString`) and units (`Meters` vs `Seconds`).

### Q50: How do you build a fully type-safe event emitter (mapping event names to payload types)?

**A:** Define an **event map** type whose keys are event names and whose values are payload shapes, then make `on`/`emit` generic over `K extends keyof E` and use indexed access `E[K]` for the payload. This ties each event name to exactly one payload, so a wrong event name or a wrong payload shape is a compile-time error.

```ts
type Events = {
  login: { userId: string };
  logout: { reason: string };
};

class TypedEmitter<E extends Record<string, any>> {
  private handlers: { [K in keyof E]?: Array<(payload: E[K]) => void> } = {};

  on<K extends keyof E>(event: K, handler: (payload: E[K]) => void): void {
    (this.handlers[event] ??= []).push(handler);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    this.handlers[event]?.forEach((h) => h(payload));
  }
}

const bus = new TypedEmitter<Events>();

bus.on("login", (p) => console.log(p.userId)); // p is { userId: string }
bus.emit("login", { userId: "u_1" }); // ok
bus.emit("login", { reason: "x" }); // error: wrong payload shape
bus.emit("signup", { userId: "u_1" }); // error: 'signup' not in Events
```

**Tip:** This is the same pattern that types Socket.IO event maps and typed dispatchers/stores. The core trick is `keyof E` to constrain the name plus indexed access `E[K]` to look up the matching payload from the same generic.

## Common Mistakes / Red Flags

- Sprinkling `any` everywhere (or leaving implicit `any`) instead of using `unknown` + narrowing.
- Overusing `as` and `!` to silence the compiler — these bypass checks and can cause runtime crashes.
- Believing types validate runtime data: a typed `fetch().json()` does NOT guarantee the shape; you still need Zod/class-validator at boundaries.
- Not enabling `strict` / `strictNullChecks`, then being surprised by `undefined` errors in production.
- Confusing union (`|`, narrows access) with intersection (`&`, combines members).
- Using `enum` reflexively without knowing its runtime cost and bundling quirks.
- Redefining types that a tool already generates (Prisma models, Zod `z.infer`) — duplicated, drift-prone types.
- Using `React.FC` and being unable to explain the tradeoffs; forgetting `<T,>` for generic components in `.tsx`.
- Writing type guards (`x is T`) with incorrect logic — TS trusts you, so a wrong guard is a silent runtime lie.
- Defining NestJS DTOs as interfaces (erased at runtime, so decorators/validation break) instead of classes.
- Forgetting exhaustiveness checks (`never`) on discriminated unions, so new variants slip through silently.
- Annotating everything (fighting inference) or annotating nothing (losing boundary contracts) — both are smells.

## Further Reading

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Utility Types reference: https://www.typescriptlang.org/docs/handbook/utility-types.html
- React + TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/
- Type Challenges (practice advanced types): https://github.com/type-challenges/type-challenges
