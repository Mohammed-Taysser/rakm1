# JavaScript Core (70 questions)

> JavaScript fundamentals are the bedrock of every MERN interview. React's re-renders, hooks rules, and closures-in-event-handlers; Node's single-threaded event loop and async I/O; Express middleware chains; even Mongoose query builders — all of them are just JavaScript. Interviewers probe core JS precisely because shaky fundamentals (scope, `this`, the event loop, async ordering) are exactly where production bugs come from. Master this file and most React/Node "gotchas" become obvious.

## Quick Revision Checklist

- Can you explain the difference between `var`, `let`, and `const`, and what the Temporal Dead Zone is?
- Do you know the difference between hoisting of function declarations vs function expressions vs `let`/`const`?
- Can you define a closure and give a real use-case (private state, memoization, throttle/debounce)?
- Do you know all five `this` binding rules and how arrow functions differ?
- Can you describe the prototype chain and how `new` works internally?
- Do you know `==` vs `===`, truthy/falsy values, and why `NaN !== NaN`?
- Can you explain shallow vs deep copy and when `structuredClone` helps?
- Can you trace output ordering of `setTimeout` vs `Promise.then` (macrotask vs microtask)?
- Do you know `Promise.all` vs `allSettled` vs `race` vs `any`?
- Can you write `async/await` with proper `try/catch` error handling?
- Can you implement `debounce` and `throttle` from scratch?
- Do you understand currying, partial application, and higher-order functions?
- Can you explain `map`/`filter`/`reduce` and write a `reduce`-based group-by?
- Do you know generators, iterators, and the iterable protocol?
- Can you compare `Map`/`Set`/`WeakMap`/`WeakSet` and say when to use each?
- Do you know common memory-leak causes (timers, listeners, closures, global refs)?
- Can you contrast ESM vs CommonJS, including dynamic `import()`?
- Do you know `typeof` vs `instanceof` and their edge cases?

## Basic

### Q1: What are the differences between `var`, `let`, and `const`?

**A:** `var` is function-scoped, hoisted and initialized to `undefined`, and can be redeclared. `let` and `const` are block-scoped, hoisted but uninitialized (Temporal Dead Zone), and cannot be redeclared in the same scope. `const` additionally cannot be reassigned — but the value it points to (e.g. an object) can still be mutated.

```js
function demo() {
  if (true) {
    var a = 1;
    let b = 2;
    const c = 3;
  }
  console.log(a); // 1  (var leaks out of the block)
  // console.log(b); // ReferenceError (block-scoped)
}
const obj = { n: 1 };
obj.n = 2; // OK — only the binding is constant, not the object
```

**Tip:** A classic follow-up: "Does `const` make an object immutable?" — No, use `Object.freeze` for shallow immutability.

### Q2: What is hoisting?

**A:** Hoisting is JavaScript moving declarations to the top of their scope during compilation. `var` declarations are hoisted and initialized to `undefined`; function _declarations_ are fully hoisted (you can call them before they appear). `let`/`const` and function _expressions_ are hoisted but not initialized.

```js
console.log(x); // undefined  (var hoisted)
var x = 5;
sayHi(); // "hi"  (function declaration hoisted)
function sayHi() {
  console.log("hi");
}
// greet(); // TypeError: greet is not a function
var greet = function () {};
```

**Tip:** Be precise: "the _declaration_ is hoisted, the _assignment_ is not."

### Q3: What is the Temporal Dead Zone (TDZ)?

**A:** The TDZ is the period between entering a scope and the point where a `let`/`const` variable is declared. Accessing the variable in that window throws a `ReferenceError`. It exists to catch use-before-declaration bugs.

```js
{
  // console.log(y); // ReferenceError (TDZ)
  let y = 10;
  console.log(y); // 10
}
```

**Tip:** Interviewers love asking "is `let` hoisted?" — Yes, it is hoisted, but it is not initialized, hence the TDZ.

### Q4: What is scope and lexical scope?

**A:** Scope determines where variables are accessible. JavaScript uses lexical (static) scope: a function's accessible variables are determined by _where it is defined in the source_, not where it is called. Inner functions can access outer variables; the reverse is not true.

```js
const outer = "A";
function parent() {
  const inner = "B";
  function child() {
    console.log(outer, inner);
  } // sees both
  child();
}
parent(); // "A" "B"
```

**Tip:** Lexical scope is the mechanism that makes closures possible.

### Q5: What are the JavaScript data types?

**A:** Seven primitives — `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint` — plus `object` (which includes arrays, functions, dates, etc.). Primitives are immutable and copied by value; objects are copied by reference.

```js
let a = 10;
let b = a;
b++; // a stays 10 (value copy)
let o1 = { n: 1 };
let o2 = o1;
o2.n = 2; // o1.n is now 2 (reference)
```

**Tip:** A trick question: `typeof null` returns `"object"` — a long-standing language bug.

### Q6: What is the difference between `null` and `undefined`?

**A:** `undefined` means a variable has been declared but not assigned (the engine's default). `null` is an explicit "no value" you assign intentionally. `typeof undefined` is `"undefined"`; `typeof null` is `"object"`. `null == undefined` is `true`, but `null === undefined` is `false`.

**Tip:** Common follow-up: default parameters trigger only on `undefined`, not `null`.

### Q7: What is the difference between `==` and `===`?

**A:** `===` (strict equality) compares value and type with no coercion. `==` (loose equality) performs type coercion before comparing. Prefer `===` to avoid surprises.

```js
0 == "0"; // true  (coerced)
0 === "0"; // false
null == undefined; // true
[] == false; // true  (both coerce to "")
```

**Tip:** Say "always use `===` except the deliberate idiom `x == null` to check for null OR undefined."

### Q8: What are truthy and falsy values?

**A:** Falsy values coerce to `false` in a boolean context: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. Everything else is truthy — including `"0"`, `"false"`, `[]`, `{}`, and any function.

```js
if ([]) console.log("empty array is truthy"); // prints
if ("0") console.log("non-empty string is truthy"); // prints
```

**Tip:** Knowing `[]` and `{}` are truthy is a frequent gotcha (e.g. checking an array is non-empty needs `.length`).

### Q9: What is `NaN` and how do you check for it?

**A:** `NaN` ("Not a Number") is a special numeric value from invalid math (e.g. `0/0`, `parseInt("abc")`). It is the only value not equal to itself, so use `Number.isNaN()` (not the global `isNaN`, which coerces).

```js
NaN === NaN; // false
Number.isNaN(NaN); // true
isNaN("hello"); // true  (coerces "hello" -> NaN) — misleading
Number.isNaN("hello"); // false (no coercion)
```

**Tip:** `Number.isNaN` is the safe one; explain why the global version is dangerous.

### Q10: What is the difference between `typeof` and `instanceof`?

**A:** `typeof` returns a string for the primitive type (or `"function"`/`"object"`). `instanceof` checks whether an object's prototype chain contains a constructor's `prototype`, so it works for class/constructor instances.

```js
typeof "x"; // "string"
typeof []; // "object"
[] instanceof Array; // true
typeof function () {}; // "function"
```

**Tip:** Edge cases: `typeof null === "object"`, and `instanceof` breaks across iframes/realms — use `Array.isArray()` for arrays.

### Q11: What is a template literal?

**A:** Backtick-delimited strings supporting interpolation `${}` and multiline text. Tagged templates let a function process the parts.

```js
const name = "Ada";
const msg = `Hello, ${name}!
Line two.`;
function tag(strings, ...values) {
  return strings[0] + values.map((v) => v.toUpperCase()).join("");
}
tag`Hi ${name}`; // "Hi ADA"
```

**Tip:** Tagged templates power libraries like styled-components and SQL-injection-safe query builders.

### Q12: What is destructuring?

**A:** A syntax to unpack values from arrays or properties from objects into variables, with support for defaults, renaming, and nesting.

```js
const [first, , third = 0] = [1, 2]; // first=1, third=0
const { id, name: userName, role = "guest" } = { id: 1, name: "Sam" };
// userName = "Sam", role = "guest"
function f({ a, b }) {
  return a + b;
} // destructure params
```

**Tip:** Very common in React (`const { data, isLoading } = useQuery(...)`) — expect a live example.

### Q13: What are spread and rest operators?

**A:** Same `...` syntax, opposite jobs. _Spread_ expands an iterable/object into elements/props. _Rest_ collects remaining items into an array (or object).

```js
const merged = { ...defaults, ...overrides }; // spread (shallow merge)
const arr = [...a, ...b]; // spread arrays
function sum(...nums) {
  return nums.reduce((t, n) => t + n, 0);
} // rest
const [head, ...tail] = [1, 2, 3]; // rest in destructuring
```

**Tip:** Stress that object spread is a _shallow_ copy — nested objects are still shared.

### Q14: What are default parameters?

**A:** Function parameters can specify a fallback used only when the argument is `undefined` (not `null`).

```js
function greet(name = "guest", greeting = `Hi ${name}`) {
  return greeting;
}
greet(); // "Hi guest"
greet(undefined); // "Hi guest"
greet(null); // uses null — name is null
```

**Tip:** Defaults are evaluated left-to-right and can reference earlier params.

### Q15: What is optional chaining (`?.`)?

**A:** `?.` short-circuits to `undefined` if the value before it is `null` or `undefined`, instead of throwing. Works with property access, calls, and indexing.

```js
const city = user?.address?.city; // undefined if user or address missing
user?.save?.(); // calls only if save exists
arr?.[0];
```

**Tip:** Pair with nullish coalescing: `user?.name ?? "Anonymous"`.

### Q16: What is the nullish coalescing operator (`??`)?

**A:** `??` returns the right operand only when the left is `null` or `undefined` — unlike `||`, which also triggers on any falsy value (`0`, `""`, `false`).

```js
const count = 0;
count || 10; // 10  (0 is falsy) — usually wrong
count ?? 10; // 0   (0 is a valid value) — correct
```

**Tip:** Use `??` for "default only when missing," `||` for "default when falsy." Mixing `??` with `||`/`&&` requires parentheses.

### Q17: What is the difference between function declarations and expressions?

**A:** A declaration (`function foo(){}`) is fully hoisted and callable before its line. An expression (`const foo = function(){}` or an arrow) is only available after assignment. Named function expressions allow self-reference for recursion.

**Tip:** Arrow functions are always expressions and never hoisted as callable.

### Q18: What is an IIFE?

**A:** An Immediately Invoked Function Expression — a function defined and called at once, historically used to create a private scope and avoid polluting globals (pre-ES6 modules).

```js
const counter = (function () {
  let count = 0; // private
  return { inc: () => ++count };
})();
counter.inc(); // 1
```

**Tip:** Mention ES modules largely replaced IIFEs for scoping, but they still appear in bundled UMD code.

### Q19: What is strict mode?

**A:** `"use strict"` opts into a restricted variant: assigning to undeclared variables throws, `this` is `undefined` in plain function calls (not the global object), duplicate parameter names are errors, and silent failures become exceptions. ES modules and class bodies are strict by default.

**Tip:** "Why does `this` differ in a method I extracted?" often traces back to strict mode.

## Intermediate

### Q20: What is a closure? Give a real use-case.

**A:** A closure is a function that retains access to variables from its lexical scope even after the outer function has returned. It "closes over" those variables. Real uses: private state, factory functions, memoization, and event handlers / debounce-throttle.

```js
// Private state + factory
function createCounter() {
  let count = 0; // not accessible from outside
  return { inc: () => ++count, get: () => count };
}
const c = createCounter();
c.inc();
c.inc();
c.get(); // 2
```

**Tip:** A very common live exercise. Be ready to explain _why_ `count` survives — the inner functions hold a reference to the variable environment.

### Q21: Write a `memoize` higher-order function using a closure.

**A:** Memoization caches results of a pure function keyed by its arguments — a closure holds the cache.

```js
function memoize(fn) {
  const cache = new Map(); // closed over
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
const slowSquare = (n) => {
  /* expensive */ return n * n;
};
const fastSquare = memoize(slowSquare);
fastSquare(4); // computes; fastSquare(4) again -> cached
```

**Tip:** Note `JSON.stringify` keys are imperfect (order, functions). For one numeric arg, key by the arg directly. React's `useMemo`/`React.memo` are conceptually the same idea.

### Q22: Explain the classic `for` loop + closure bug with `var`.

**A:** With `var`, all closures share one function-scoped variable, so by the time the callbacks run, the loop has finished and they all see the final value. `let` creates a new binding per iteration.

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3, 3, 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0, 1, 2
```

**Tip:** Pre-`let` fixes: an IIFE per iteration capturing `i`, or `setTimeout(fn, 0, i)`.

### Q23: What are the rules of `this` binding?

**A:** Five rules, in priority order:

1. `new` binding — `this` is the newly created object.
2. Explicit binding — `call`/`apply`/`bind` set `this`.
3. Implicit binding — called as `obj.method()`, `this` is `obj`.
4. Default binding — plain call; `this` is `undefined` (strict) or global object (sloppy).
5. Arrow functions — no own `this`; they inherit `this` lexically from the enclosing scope.

```js
const obj = {
  x: 1,
  get() {
    return this.x;
  },
};
obj.get(); // 1 (implicit)
const fn = obj.get;
fn(); // undefined / error (default binding lost)
const arrow = () => this; // this from where arrow is defined
```

**Tip:** "What's `this` when I pass `obj.method` as a callback?" — binding is lost. Fix with `.bind(obj)` or an arrow wrapper.

### Q24: What is the difference between `call`, `apply`, and `bind`?

**A:** All set `this`. `call` invokes immediately with args listed individually; `apply` invokes immediately with args as an array; `bind` returns a _new_ function with `this` (and optional args) permanently fixed.

```js
function intro(greeting, punc) {
  return `${greeting}, ${this.name}${punc}`;
}
const user = { name: "Mia" };
intro.call(user, "Hi", "!"); // "Hi, Mia!"
intro.apply(user, ["Hey", "."]); // "Hey, Mia."
const bound = intro.bind(user, "Yo");
bound("?"); // "Yo, Mia?"
```

**Tip:** Mnemonic: **A**pply = **A**rray. `bind` is partial application + `this` fixing.

### Q25: How do arrow functions differ from regular functions?

**A:** Arrow functions:

1. have no own `this` (lexical)
2. no `arguments` object
3. cannot be used as constructors (no `new`)
4. have no `prototype` property
5. cannot be generators

This makes them ideal for callbacks where you want to preserve the surrounding `this`.

```js
class Timer {
  constructor() {
    this.s = 0;
  }
  start() {
    setInterval(() => this.s++, 1000);
  } // arrow keeps `this` = instance
}
```

**Tip:** Don't use arrows for object methods that need dynamic `this`, or for prototype methods.

### Q26: What is the prototype chain?

**A:** Every object has an internal `[[Prototype]]` link (`__proto__`) to another object. Property lookups walk this chain until found or until `null`. Functions have a `prototype` object whose members are shared by all instances created with `new`.

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};
const dog = new Animal("Rex");
dog.speak(); // found on Animal.prototype
Object.getPrototypeOf(dog) === Animal.prototype; // true
```

**Tip:** Distinguish `__proto__` (the link on instances) from `.prototype` (a property on constructor functions).

### Q27: How does the `new` keyword work internally?

**A:** `new Fn(args)` does four things:

1. creates a fresh empty object
2. links its prototype to `Fn.prototype`
3. calls `Fn` with `this` bound to the new object
4. returns that object unless the constructor explicitly returns another object

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype); // steps 1 & 2
  const result = Ctor.apply(obj, args); // step 3
  return typeof result === "object" && result !== null ? result : obj; // step 4
}
```

**Tip:** Being able to reimplement `new` is a strong senior signal.

### Q28: How does prototypal inheritance work, and how do ES6 classes relate?

**A:** Inheritance is achieved by chaining prototypes. ES6 `class` is syntactic sugar over the prototype system: `extends` sets up the prototype chain and `super` calls the parent constructor/methods.

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}
class Dog extends Animal {
  speak() {
    return `${super.speak()} (woof)`;
  }
}
new Dog("Rex").speak(); // "Rex makes a sound (woof)"
```

**Tip:** "Are classes 'real' classes?" — No; they desugar to constructor functions + prototypes. Methods live on the prototype, not each instance.

### Q29: What is the difference between shallow copy and deep copy?

**A:** A shallow copy duplicates the top level but shares nested references. A deep copy recursively duplicates everything so nothing is shared. Spread/`Object.assign`/`Array.slice` are shallow.

```js
const orig = { a: 1, nested: { b: 2 } };
const shallow = { ...orig };
shallow.nested.b = 99; // also changes orig.nested.b!
const deep = structuredClone(orig); // independent copy
deep.nested.b = 0; // orig unaffected
```

**Tip:** Mention options: `structuredClone` (modern, handles Dates/Maps/circular refs), `JSON.parse(JSON.stringify(x))` (loses functions, Dates become strings, breaks on circular refs), or a library like lodash `cloneDeep`.

### Q30: What are higher-order functions?

**A:** Functions that take other functions as arguments and/or return functions. They enable abstraction and composition — `map`, `filter`, `reduce`, `setTimeout`, and event handlers all qualify.

```js
const withLogging =
  (fn) =>
  (...args) => {
    console.log("call", args);
    return fn(...args);
  };
const add = (a, b) => a + b;
withLogging(add)(2, 3); // logs then returns 5
```

**Tip:** This concept underpins React HOCs and Express/Redux middleware.

### Q31: Explain `map`, `filter`, and `reduce`.

**A:** `map` transforms each element 1:1 into a new array. `filter` keeps elements passing a predicate. `reduce` folds the array into a single accumulated value. All are non-mutating.

```js
const nums = [1, 2, 3, 4];
nums.map((n) => n * 2); // [2, 4, 6, 8]
nums.filter((n) => n % 2 === 0); // [2, 4]
nums.reduce((sum, n) => sum + n, 0); // 10
// group-by with reduce
const people = [{ city: "NY" }, { city: "LA" }, { city: "NY" }];
people.reduce((acc, p) => {
  (acc[p.city] ||= []).push(p);
  return acc;
}, {});
```

**Tip:** Be ready to implement `map`/`filter` via `reduce`, and to explain the second arg (initial value) of `reduce`.

### Q32: What are pure functions and immutability?

**A:** A pure function always returns the same output for the same input and has no side effects (no mutation of external state, no I/O). Immutability means not mutating data — you produce new copies. Together they make code predictable and testable, and they power React/Redux change detection.

```js
// impure: mutates input
const addItemBad = (arr, x) => {
  arr.push(x);
  return arr;
};
// pure: returns new array
const addItem = (arr, x) => [...arr, x];
```

**Tip:** React relies on reference identity for re-renders; mutating state in place is a top bug source.

### Q33: What is currying and partial application?

**A:** Currying transforms `f(a, b, c)` into `f(a)(b)(c)` — a chain of unary functions. Partial application fixes some arguments now and returns a function expecting the rest. Both build on closures.

```js
const curry = (fn) =>
  function curried(...args) {
    return args.length >= fn.length
      ? fn(...args)
      : (...next) => curried(...args, ...next);
  };
const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3); // 6
add3(1, 2)(3); // 6
// partial application
const multiply = (a, b) => a * b;
const double = multiply.bind(null, 2);
double(5); // 10
```

**Tip:** Distinguish the two: currying = always unary steps; partial = fix any number now.

### Q34: Implement `debounce`. Where would you use it in a MERN app?

**A:** Debounce delays running a function until a pause of N ms occurs with no further calls — only the _last_ call fires. Use it on a search input to avoid an API request per keystroke.

```js
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
// React: search box hitting /api/search
const search = debounce((q) => fetch(`/api/search?q=${q}`), 400);
input.addEventListener("input", (e) => search(e.target.value));
```

**Tip:** Mention edge cases: leading vs trailing invocation, and a `cancel` method. In React you'd `useMemo`/`useCallback` to keep the debounced function stable across renders.

### Q35: Implement `throttle`. How does it differ from debounce?

**A:** Throttle guarantees the function runs at most once per N ms during continuous calls. Debounce waits for silence; throttle fires on a fixed cadence. Use throttle for scroll/resize/mousemove handlers.

```js
function throttle(fn, limit = 200) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
window.addEventListener(
  "scroll",
  throttle(() => updateScrollUI(), 100),
);
```

**Tip:** Crisp one-liner: "Debounce = wait until they stop; throttle = run at a steady rate."

### Q36: What is event delegation?

**A:** Instead of attaching listeners to many child elements, attach one listener to a common ancestor and use `event.target` to detect which child fired. It leverages event bubbling, saves memory, and handles dynamically added elements.

```js
document.getElementById("list").addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (li) console.log("clicked", li.dataset.id);
});
```

**Tip:** Mention bubbling vs capturing phases and `stopPropagation`. React uses a synthetic delegated event system at the root.

### Q37: What are the common `Array` methods worth knowing?

**A:** Transform: `map`, `flatMap`, `flat`. Filter/search: `filter`, `find`, `findIndex`, `includes`, `indexOf`. Aggregate: `reduce`, `some`, `every`. Iterate: `forEach`. Mutating (careful): `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`. Non-mutating slicing: `slice`, `concat`. Newer immutable variants: `toSorted`, `toReversed`, `with`, `at`.

```js
[1, 2, 3].at(-1); // 3 (negative index)
[3, 1, 2].toSorted(); // [1,2,3] without mutating original
[[1], [2, [3]]].flat(2); // [1, 2, 3]
```

**Tip:** Know which methods mutate vs return new arrays — `sort`/`reverse`/`splice` mutate.

### Q38: What `Object` methods should you know?

**A:** `Object.keys/values/entries` for iteration, `Object.assign` for shallow merge, `Object.freeze`/`isFrozen` for immutability, `Object.create` for prototype-based creation, `Object.getPrototypeOf`/`setPrototypeOf`, `Object.fromEntries` (inverse of `entries`), and `Object.hasOwn(obj, key)` (modern replacement for `hasOwnProperty`).

```js
const o = { a: 1, b: 2 };
Object.entries(o).map(([k, v]) => `${k}=${v}`); // ["a=1","b=2"]
Object.fromEntries([["x", 1]]); // { x: 1 }
Object.hasOwn(o, "a"); // true
```

**Tip:** Use `Object.hasOwn` over `obj.hasOwnProperty` (safe even if `hasOwnProperty` is shadowed).

### Q39: What are the JSON methods and their limitations?

**A:** `JSON.stringify(value, replacer, space)` serializes to a string; `JSON.parse(text, reviver)` deserializes. Limitations: `undefined`, functions, and symbols are dropped (or become `null` in arrays); `Date` becomes an ISO string; `Map`/`Set` aren't supported; circular references throw; `BigInt` throws.

```js
JSON.stringify({ a: undefined, b: () => {}, c: new Date() });
// '{"c":"2026-06-21T..."}'  — a and b dropped, date stringified
JSON.parse('{"n":1}', (k, v) => (typeof v === "number" ? v * 10 : v)); // { n: 10 }
```

**Tip:** The `replacer` array can whitelist keys; the `reviver` can rehydrate Dates.

### Q40: How do you handle errors with `try/catch/finally` and custom errors?

**A:** Wrap risky code in `try`, handle in `catch`, and use `finally` for cleanup that always runs. Create custom errors by extending `Error` to carry extra context (status codes, etc.).

```js
class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
async function getUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new HttpError("Failed", res.status);
    return await res.json();
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err; // re-throw unknown errors
  } finally {
    console.log("request finished");
  }
}
```

**Tip:** Always set `this.name`; consider `Error.captureStackTrace` in Node. In Express, forward errors to `next(err)`.

### Q41: What are some regex basics in JavaScript?

**A:** Regex literals `/pattern/flags` or `new RegExp()`. Common flags: `g` (global), `i` (case-insensitive), `m` (multiline). Methods: `test` (boolean), `match`/`matchAll`, `replace`/`replaceAll`, `String.split`. Use capture groups `()`, character classes `[]`, quantifiers `*+?{}`, anchors `^$`.

```js
const email = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
email.test("a@b.com"); // true
"2026-06-21".replace(/(\d+)-(\d+)-(\d+)/, "$3/$2/$1"); // "21/06/2026"
[..."a1b2".matchAll(/(\d)/g)].map((m) => m[1]); // ["1","2"]
```

**Tip:** Beware the stateful `lastIndex` of a `g`-flagged regex when reusing `test` in a loop.

## Advanced

### Q42: Explain the event loop in detail.

**A:** JavaScript is single-threaded with one call stack. The event loop coordinates the stack, the _microtask queue_ (Promise callbacks, `queueMicrotask`, `MutationObserver`), and the _macrotask queue_ (timers, I/O, UI events). When the stack is empty, the loop drains _all_ microtasks first, then takes _one_ macrotask, then drains microtasks again, and repeats. This is how async code runs without blocking.

```
[ Call Stack ] --empty--> drain ALL microtasks --> run ONE macrotask --> repeat
```

**Tip:** Key fact senior interviewers want: microtasks always run to completion before the next macrotask. In Node, also mention phases (timers, poll, check) and `process.nextTick` (runs before other microtasks).

### Q43: What does this code print, and why?

**A:** Synchronous code first, then all microtasks (`Promise.then`), then macrotasks (`setTimeout`).

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// Output: 1, 4, 3, 2
```

`1` and `4` run synchronously; `3` is a microtask drained before `2`, a macrotask.

**Tip:** A very common screen. Add `queueMicrotask` and `process.nextTick` variants for Node depth.

### Q44: What are Promise states and how does chaining work?

**A:** A Promise is `pending`, then settles to `fulfilled` (value) or `rejected` (reason) — settling is one-way and final. `.then` returns a new promise, enabling chaining; returning a value passes it on, returning a promise waits for it, throwing rejects the chain. `.catch` handles rejections; `.finally` runs regardless.

```js
fetch("/api/user")
  .then((res) => res.json()) // returns a promise -> awaited
  .then((user) => fetch(`/api/orders/${user.id}`))
  .then((res) => res.json())
  .catch((err) => console.error(err)) // catches any earlier rejection
  .finally(() => hideSpinner());
```

**Tip:** Forgetting to `return` inside `.then` is a classic bug — the next `.then` gets `undefined`.

### Q45: Compare `Promise.all`, `allSettled`, `race`, and `any`.

**A:**

- `all` — resolves with an array when _all_ fulfill; rejects fast on the _first_ rejection.
- `allSettled` — never rejects; resolves with `{status, value|reason}` for each.
- `race` — settles as soon as the _first_ promise settles (fulfilled OR rejected).
- `any` — resolves with the first _fulfilled_; rejects only if _all_ reject (`AggregateError`).

```js
const [a, b] = await Promise.all([fetchA(), fetchB()]); // parallel, fail-fast
const results = await Promise.allSettled([fetchA(), fetchB()]); // tolerate failures
const fastest = await Promise.race([fetch(url), timeout(5000)]); // timeout pattern
```

**Tip:** Use `allSettled` when partial success is acceptable; `race` for timeouts; `any` for "first one to succeed wins."

### Q46: How does `async/await` work, and how do you handle errors?

**A:** `async` functions always return a promise; `await` pauses the function until a promise settles, yielding the resolved value or throwing on rejection. Errors are handled with ordinary `try/catch`. It is syntactic sugar over promises/generators — the function suspends and resumes via the microtask queue.

```js
async function loadDashboard(userId) {
  try {
    // Parallelize independent calls — don't await sequentially
    const [user, orders] = await Promise.all([
      getUser(userId),
      getOrders(userId),
    ]);
    return { user, orders };
  } catch (err) {
    console.error("dashboard failed", err);
    throw err;
  }
}
```

**Tip:** Top mistake: `await`-ing independent calls sequentially (waterfall) instead of `Promise.all`. Also, awaiting in a `for` loop serializes; `Promise.all(arr.map(...))` parallelizes.

### Q47: What is callback hell and how do you avoid it?

**A:** Deeply nested callbacks ("pyramid of doom") from sequential async ops — hard to read and to handle errors. Avoid it with promises (`.then` chains), `async/await`, named functions, or modularization.

```js
// callback hell
getUser(id, (u) => getOrders(u, (o) => getItems(o, (i) => render(i))));
// async/await fix
const u = await getUser(id);
const o = await getOrders(u);
render(await getItems(o));
```

**Tip:** Mention `util.promisify` in Node to convert callback APIs to promises.

### Q48: What are generators and iterators?

**A:** A generator function (`function*`) can pause/resume via `yield`, returning an iterator. An iterator implements `next()` returning `{ value, done }`. Generators enable lazy sequences, custom iterables, and were the basis for async/await.

```js
function* idGenerator() {
  let id = 1;
  while (true) yield id++; // infinite, lazy
}
const gen = idGenerator();
gen.next().value; // 1
gen.next().value; // 2
```

**Tip:** Generators can also receive values via `next(value)` and delegate with `yield*`.

### Q49: What is the iterable protocol?

**A:** An object is _iterable_ if it has a `[Symbol.iterator]` method returning an iterator. This is what makes `for...of`, spread, and destructuring work. Arrays, strings, Maps, and Sets are built-in iterables; you can make custom ones.

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let cur = this.from,
      last = this.to;
    return {
      next: () =>
        cur <= last
          ? { value: cur++, done: false }
          : { value: undefined, done: true },
    };
  },
};
[...range]; // [1, 2, 3]
```

**Tip:** Distinguish _iterable_ (has `[Symbol.iterator]`) from _iterator_ (has `next`).

### Q50: What is a `Symbol` and what is it used for?

**A:** `Symbol()` creates a unique, immutable primitive often used as a non-colliding object key or to define well-known behaviors (`Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive`). `Symbol.for(key)` uses a global registry.

```js
const id = Symbol("id");
const user = { [id]: 123, name: "Lee" };
user[id]; // 123
Object.keys(user); // ["name"] — symbol keys are hidden
```

**Tip:** Symbols don't appear in `for...in`/`Object.keys`/`JSON.stringify` — useful for "hidden" metadata.

### Q51: Compare `Map`/`Set`/`WeakMap`/`WeakSet`.

**A:**

- `Map` — keyed collection allowing _any_ key type (objects too), preserves insertion order, has `size`, iterable.
- `Set` — collection of unique values, iterable.
- `WeakMap` — keys must be objects, held _weakly_ (GC-eligible), not iterable, no `size`.
- `WeakSet` — like WeakMap but a set of objects.

```js
const cache = new WeakMap(); // entry vanishes when key object is GC'd
function compute(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = heavy(obj);
  cache.set(obj, result);
  return result;
}
```

**Tip:** Use `Map` over plain objects for dynamic keys/frequent additions; use `WeakMap` for metadata keyed on objects without preventing their garbage collection.

### Q52: When would you use a `Map` instead of a plain object?

**A:** Use `Map` when keys aren't strings/symbols (e.g. objects or numbers preserved as-is), when insertion order matters, when you frequently add/remove and need `size`, or to avoid prototype-pollution risks (no inherited `__proto__` keys). Plain objects are fine for fixed, string-keyed records and JSON.

**Tip:** Mention `Map` iteration is straightforward (`for (const [k,v] of map)`) and performs better for large dynamic key sets.

### Q53: How does garbage collection work, and what causes memory leaks?

**A:** JS engines use a mark-and-sweep collector: starting from roots (globals, stack), reachable objects are kept, unreachable ones are freed. Leaks happen when references are retained unintentionally. Common causes:

- **Lingering timers/intervals** not cleared.
- **Event listeners** not removed (especially detached DOM nodes).
- **Closures** holding large objects longer than needed.
- **Accidental globals** (undeclared variables in sloppy mode).
- **Growing caches/arrays** never pruned (use `WeakMap` or eviction).

```js
// React example: clean up to avoid leaks
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, []);
```

**Tip:** Mention Chrome DevTools heap snapshots / detached-node detection for diagnosis.

### Q54: What is the difference between ESM and CommonJS?

**A:** CommonJS (Node's legacy) uses `require`/`module.exports`, loads synchronously, and resolves at runtime — exports are a copied value. ES Modules use `import`/`export`, are static (analyzable at parse time, enabling tree-shaking), asynchronous, strict by default, and provide _live bindings_ (imports reflect later changes). Node picks the system via `"type": "module"` or `.mjs`/`.cjs`.

```js
// CommonJS
const fs = require("fs");
module.exports = { foo };
// ESM
import fs from "fs";
export const foo = () => {};
```

**Tip:** Key differences to name: static vs dynamic, sync vs async, live bindings, top-level `await` (ESM only), `__dirname` exists in CJS but needs `import.meta.url` in ESM.

### Q55: What is dynamic `import()` and when is it useful?

**A:** `import()` is a function-like form that returns a promise, loading a module on demand at runtime. It enables code-splitting/lazy-loading and conditional imports.

```js
button.addEventListener("click", async () => {
  const { default: Chart } = await import("./heavyChart.js"); // loaded only on click
  new Chart();
});
```

**Tip:** This is what `React.lazy(() => import("./Component"))` uses for route/component-level code splitting.

### Q56: Write an axios-like request interceptor using closures.

**A:** A closure can wrap a base request function, holding arrays of registered interceptors that transform config/response — exactly the pattern behind axios interceptors and Express middleware.

```js
function createClient(baseURL) {
  const reqInterceptors = [];
  return {
    useRequest(fn) {
      reqInterceptors.push(fn);
    }, // closure over array
    async get(path, config = {}) {
      let finalConfig = { ...config, url: baseURL + path };
      for (const fn of reqInterceptors) finalConfig = fn(finalConfig); // apply
      const res = await fetch(finalConfig.url, finalConfig);
      return res.json();
    },
  };
}
const api = createClient("https://api.example.com");
api.useRequest((cfg) => ({
  ...cfg,
  headers: { ...cfg.headers, Authorization: "Bearer x" },
}));
api.get("/users");
```

**Tip:** Highlights closures + HOFs + immutability — a strong combined answer.

### Q57: How do `setTimeout`, microtasks, and `process.nextTick` order in Node?

**A:** Within a tick: synchronous code runs, then `process.nextTick` callbacks (highest priority), then the Promise microtask queue, then the event loop proceeds to phases (timers for `setTimeout`/`setInterval`, then `setImmediate` in the check phase).

```js
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
console.log("sync");
// sync, nextTick, promise, then timeout/immediate (order between those two varies)
```

**Tip:** Warn that overusing `process.nextTick` can starve the event loop.

### Q58: What is `Object.freeze`, and how do you achieve deep immutability?

**A:** `Object.freeze` prevents adding, removing, or reassigning a object's own properties — but it is _shallow_; nested objects remain mutable. Deep freeze requires recursion.

```js
function deepFreeze(obj) {
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === "object" && obj[k] !== null) deepFreeze(obj[k]);
  });
  return Object.freeze(obj);
}
```

**Tip:** In sloppy mode, mutating a frozen object fails silently; in strict mode it throws.

### Q59: What is function composition?

**A:** Combining small functions so the output of one feeds the next. `compose` applies right-to-left, `pipe` left-to-right. It is the essence of declarative data pipelines (and Redux middleware).

```js
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);
const clean = pipe(
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/\s+/g, "-"),
);
clean("  Hello World "); // "hello-world"
```

**Tip:** Often paired with currying so each step is unary.

### Q60: Explain `this` inside a class method passed as a callback, and how to fix it.

**A:** When you pass `this.handleClick` as a reference, the implicit binding is lost, so `this` is `undefined` (strict) when invoked. Fixes: bind in the constructor (`this.handleClick = this.handleClick.bind(this)`), use a class field arrow (`handleClick = () => {}`), or wrap inline (`() => this.handleClick()`).

```js
class Button {
  label = "Save";
  // class field arrow -> lexical this, always bound
  onClick = () => console.log(this.label);
}
```

**Tip:** This is the classic React class-component `this` binding question.

### Q61: What is coercion, and how do `+` and `==` trigger it?

**A:** Coercion is automatic type conversion. The `+` operator prefers string concatenation if either operand is a string; otherwise numeric addition. `==` follows the abstract equality algorithm (numbers vs strings convert to number; objects convert via `valueOf`/`toString`; `null`/`undefined` are only equal to each other).

```js
1 + "2"; // "12" (string)
"5" - 2; // 3   (- forces numeric)
[] + {}; // "[object Object]"
true + 1; // 2   (true -> 1)
```

**Tip:** Be ready to explain weird results via the ToPrimitive algorithm; recommend `===` to sidestep.

### Q62: What is the difference between `Array.from`, spread, and `Array.of`?

**A:** `Array.from(iterableOrArrayLike, mapFn?)` builds an array from anything iterable or array-like (e.g. `NodeList`, `arguments`) with an optional map. Spread `[...x]` only works on iterables. `Array.of(...)` creates an array from its arguments without the single-number length quirk of `Array()`.

```js
Array.from({ length: 3 }, (_, i) => i); // [0,1,2]
Array.from("ab"); // ["a","b"]
Array.of(7); // [7]  (vs Array(7) -> 7 empty slots)
```

**Tip:** `Array.from(document.querySelectorAll(...))` converts a NodeList so you can use array methods.

### Q63: How would you flatten a deeply nested array without `flat`?

**A:** Recursively reduce, spreading flattened sub-arrays.

```js
const flatten = (arr) =>
  arr.reduce((acc, x) => acc.concat(Array.isArray(x) ? flatten(x) : x), []);
flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
```

**Tip:** Mention `arr.flat(Infinity)` as the built-in alternative.

### Q64: What is the difference between `for...in` and `for...of`?

**A:** `for...in` iterates enumerable _keys_ (including inherited ones) — best for plain objects but risky on arrays. `for...of` iterates _values_ of any iterable (arrays, strings, Maps, Sets). Use `Object.entries` + `for...of` for object value iteration.

```js
for (const k in { a: 1, b: 2 }) {
} // "a", "b" (keys)
for (const v of [10, 20]) {
} // 10, 20 (values)
```

**Tip:** `for...in` over arrays gives string indices and can pick up prototype properties — avoid it for arrays.

### Q65: What is tail-call optimization and recursion depth?

**A:** Deep recursion can overflow the call stack since each call adds a frame. Tail-call optimization (TCO) — reusing the frame when the recursive call is the last action — is specified in ES6 but only implemented in some engines (notably Safari/JSC, not V8). In practice, convert deep recursion to iteration or use an explicit stack/trampoline.

**Tip:** If asked about stack overflow in recursion, mention iterative conversion and that V8 doesn't do TCO.

### Q66: How do you make an object iterable and use it with async iteration?

**A:** Implement `[Symbol.iterator]` for sync iteration or `[Symbol.asyncIterator]` for `for await...of` (useful for streams/paginated APIs).

```js
async function* paginate(url) {
  let next = url;
  while (next) {
    const res = await fetch(next);
    const page = await res.json();
    yield* page.items; // yield each item
    next = page.nextPageUrl;
  }
}
for await (const item of paginate("/api/items")) {
  /* process streamingly */
}
```

**Tip:** Great real-world answer for consuming paginated REST/Mongo cursors.

### Q67: What is the difference between primitive wrapper objects and primitives?

**A:** Primitives like `"abc"` are not objects but can access methods because JS temporarily _autoboxes_ them into wrapper objects (`String`, `Number`, `Boolean`) for the method call, then discards them. Explicitly using `new String("x")` creates an object (`typeof` is `"object"`), which is discouraged.

```js
"hi".toUpperCase(); // autoboxed to String wrapper
typeof new String("hi"); // "object"  (avoid)
typeof "hi"; // "string"
```

**Tip:** Explains why you can't reliably store properties on primitives — the wrapper is thrown away.

### Q68: Explain debouncing a React search input with hook stability concerns.

**A:** In React, recreating the debounced function each render resets its internal timer, so you must memoize it. Use `useMemo`/`useCallback` (or a ref) so the same debounced instance persists, and clean it up on unmount.

```js
function Search() {
  const [q, setQ] = useState("");
  const debouncedFetch = useMemo(
    () => debounce((query) => fetch(`/api/search?q=${query}`), 400),
    [],
  );
  useEffect(() => () => debouncedFetch.cancel?.(), [debouncedFetch]); // cleanup
  return (
    <input
      value={q}
      onChange={(e) => {
        setQ(e.target.value);
        debouncedFetch(e.target.value);
      }}
    />
  );
}
```

**Tip:** This bridges core JS (closures/debounce) with React — interviewers love the connection.

### Q69: What does `Object.create(null)` do and why use it?

**A:** It creates an object with no prototype (no inherited `toString`, `hasOwnProperty`, or the `__proto__` setter), making it a clean dictionary safe from prototype pollution and accidental key collisions.

```js
const dict = Object.create(null);
dict.toString = "value"; // safe; not shadowing a real method
"toString" in dict; // true only because we set it
```

**Tip:** Useful for maps of untrusted keys; downside is you lose `Object` methods on the instance.

### Q70: What is the difference between deep equality and reference equality?

**A:** Reference equality (`===` on objects) is true only if both point to the same object in memory. Deep (structural) equality compares values recursively. JS has no built-in deep-equal; you implement it or use lodash `isEqual`. React/Redux rely on cheap reference equality, which is why immutable updates matter.

```js
{ a: 1 } === { a: 1 };          // false (different references)
const x = { a: 1 }; x === x;    // true (same reference)
```

**Tip:** Tie this back to why mutating state breaks React's `===`-based change detection.

## Common Mistakes / Red Flags

- Saying `let`/`const` are "not hoisted" — they are hoisted but uninitialized (TDZ).
- Claiming `const` makes objects immutable (it only freezes the binding).
- Using `==` casually or not knowing the `x == null` idiom.
- Confusing `__proto__` (instance link) with `.prototype` (constructor property).
- Thinking arrow functions can be bound with `call`/`bind` to change `this` (they can't).
- Forgetting to `return` inside `.then`, breaking the chain.
- `await`-ing independent async calls sequentially instead of `Promise.all` (waterfall).
- Believing `setTimeout(fn, 0)` runs before resolved promises (microtasks win).
- Using spread/`Object.assign` and assuming a deep copy.
- Not clearing timers/intervals or removing event listeners (memory leaks), especially in React effects.
- Using the global `isNaN` instead of `Number.isNaN`.
- Mutating arrays/objects in React state instead of producing new references.
- Recreating debounced/throttled functions every render in React.
- Using `for...in` to iterate arrays.
- Catching errors but swallowing them (empty `catch`) without re-throwing or logging.

## Further Reading

- MDN — JavaScript Guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- MDN — Closures: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
- MDN — Event loop & concurrency model: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
- JavaScript.info (modern, in-depth tutorial): https://javascript.info/
