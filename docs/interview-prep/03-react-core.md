# React Core (51 questions)

> React fundamentals are the backbone of every front-end role you'll interview for. Because your portfolio is React-heavy — Nova ERP, Dynamic SaaS, and several e-commerce frontends spanning React 16 through 19, with Ant Design, Tailwind, Vite, and i18next/RTL — interviewers will probe both the "why" (virtual DOM, reconciliation, one-way data flow) and the "how" (hooks, re-render behavior, controlled forms, concurrent features). This file drills the core mental models and the exact code patterns you ship every day, so you can answer crisply and back claims with snippets.

## Quick Revision Checklist

- React is a declarative, component-based UI library; you describe **what** the UI should look like for a given state, React figures out the DOM updates.
- The **virtual DOM** is an in-memory tree; React diffs old vs new and patches only what changed (reconciliation).
- **JSX** is syntactic sugar — it compiles to `React.createElement` (or the automatic `jsx()` runtime in React 17+).
- **Props** are read-only inputs (parent → child); **state** is component-owned, mutable via setters; data flows **one way** (top-down).
- **Keys** must be stable, unique, and tied to data identity — never use array index for dynamic/reorderable lists.
- **Controlled inputs** derive value from state; **uncontrolled** read from the DOM via refs. Ant Design `Form` manages this for you.
- Hooks must be called at the **top level**, in the **same order**, only from React functions (Rules of Hooks).
- `useState` supports **functional updates** (`setX(p => p+1)`) and **lazy init** (`useState(() => expensive())`).
- `useEffect` runs **after paint**; the dependency array controls re-runs; the returned function is **cleanup**.
- `useLayoutEffect` runs **synchronously before paint** — use only for DOM measurement to avoid flicker.
- `useMemo` memoizes a **value**; `useCallback` memoizes a **function** — both are optimizations, not correctness tools.
- `useRef` holds a mutable value that **persists across renders without triggering re-renders**, and attaches to DOM nodes.
- `useReducer` centralizes complex/related state transitions; `useContext` avoids prop drilling.
- A component re-renders when its **state changes**, its **parent re-renders**, or a **consumed context value changes**.
- React 18 brings **concurrent features**: `useTransition`, `useDeferredValue`, automatic batching; React 19 adds the **`use` hook** and **ref as a prop**.
- `StrictMode` double-invokes renders/effects in dev to surface impure code and missing cleanup — it's a feature, not a bug.
- Prefer **derived state** (compute during render) over duplicating values in `useState`.

## Basic

### Q1: What is React and what problem does it solve?

**A:** React is a declarative, component-based JavaScript library for building user interfaces. Instead of manually mutating the DOM imperatively (`document.getElementById(...).innerHTML = ...`), you declare what the UI should look like for a given state, and React keeps the DOM in sync as state changes.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

**Tip:** Lead with "declarative + component-based + unidirectional data flow." If asked "is it a framework?", say it's a library focused on the view layer; routing/data-fetching come from the ecosystem (React Router, TanStack Query).

### Q2: What is the virtual DOM and how does it work?

**A:** The virtual DOM is a lightweight in-memory JavaScript representation of the real DOM. When state changes, React builds a new virtual tree, **diffs** it against the previous one, and computes the minimal set of real DOM mutations to apply. Real DOM operations are expensive; diffing in memory and batching updates is cheaper.

**Tip:** Don't claim the virtual DOM is "always faster" — a naive `innerHTML` swap can sometimes beat it. The real win is the _declarative programming model_ plus avoiding unnecessary reflows. Modern interviewers like the nuance.

### Q3: What is reconciliation?

**A:** Reconciliation is the algorithm React uses to diff the previous and next element trees and decide what to update. It uses heuristics: elements of different types produce different trees (full replace), and `key` props identify which children moved, were added, or removed across renders.

**Tip:** A common follow-up: "What's the complexity?" A general tree diff is O(n³); React's heuristics bring it to roughly O(n) by assuming same-type elements and using keys.

### Q4: What is JSX and how does it compile?

**A:** JSX is a syntax extension that lets you write HTML-like markup in JavaScript. It's not valid JS — a compiler (Babel / SWC via Vite) transforms it. Classic transform → `React.createElement`; React 17+ automatic runtime → `jsx()` from `react/jsx-runtime` (no `import React` needed).

```jsx
const el = <h1 className="title">Hi</h1>;
// classic compiles to:
const el = React.createElement("h1", { className: "title" }, "Hi");
```

**Tip:** Be ready to explain why it's `className` not `class` and `htmlFor` not `for` — `class`/`for` are reserved words in JS. Also: JSX expressions go in `{}`, and a component must return a single root (use a Fragment).

### Q5: What's the difference between a function component and a class component?

**A:** Function components are plain functions returning JSX and use **hooks** for state/lifecycle. Class components extend `React.Component`, use `this.state`/`this.setState` and lifecycle methods (`componentDidMount`, etc.). Function components are the modern default — simpler, less boilerplate, better with hooks.

```jsx
// function
function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

**Tip:** Say you write function components but understand class components because legacy code (and Error Boundaries, which still require classes) uses them. That signals real-world maturity (relevant to your React 16→19 range).

### Q6: Props vs state — what's the difference?

**A:** **Props** are inputs passed from a parent; they're read-only inside the child. **State** is data a component owns and can update over time via its setter. Changing either triggers a re-render, but only the owner mutates state.

**Tip:** Gotcha: "Can you mutate props?" No — they're immutable from the child's perspective. If a child needs to change something, it calls a callback the parent passed down (lifting state up).

### Q7: What does "one-way data flow" mean?

**A:** Data flows down from parent to child via props. A child can't directly modify parent data; it communicates upward by invoking callback props. This makes data flow predictable and easier to debug.

```jsx
<SearchBox value={query} onChange={setQuery} /> // parent owns query
```

**Tip:** Contrast with Angular's historical two-way binding. React simulates two-way binding for inputs by combining `value` + `onChange`.

### Q8: How do you do conditional rendering?

**A:** Use ternaries, `&&`, early returns, or variables.

```jsx
{
  isLoading ? <Spinner /> : <List items={items} />;
}
{
  error && <Alert message={error} />;
}
{
  items.length === 0 && <Empty />;
}
```

**Tip:** Gotcha with `&&`: `{count && <Badge/>}` renders `0` when count is 0 (React renders the number). Use `count > 0 && ...` or a ternary. Interviewers love this one.

### Q9: Why does React need keys when rendering lists?

**A:** Keys give each list item a stable identity so React can match elements between renders and update/move/remove them efficiently instead of re-creating nodes. Without good keys, React may reuse the wrong DOM nodes, losing state or causing subtle bugs.

```jsx
{
  users.map((u) => <UserRow key={u.id} user={u} />);
}
```

**Tip:** "Where should the key go?" On the outermost element returned by the map, not inside the component.

### Q10: Why is using the array index as a key a problem?

**A:** If the list reorders, filters, or has items inserted/removed, indices shift, so the key no longer maps to the same data. React reuses DOM/component instances incorrectly — input values bind to wrong rows, animations glitch, and component state leaks across items.

**Tip:** Index-as-key is acceptable only for static, never-reordered, append-only lists with no item state. Say that exact caveat to show precision.

### Q11: Controlled vs uncontrolled inputs?

**A:** A **controlled** input has its value driven by React state (`value` + `onChange`); React is the single source of truth. An **uncontrolled** input keeps its own state in the DOM and you read it via a ref (or `defaultValue`).

```jsx
// controlled
<input value={name} onChange={(e) => setName(e.target.value)} />
// uncontrolled
<input defaultValue="" ref={inputRef} />
```

**Tip:** Follow-up: "Why prefer controlled?" Validation, conditional disabling, formatting, and a single source of truth. Uncontrolled is fine for simple/large forms or file inputs (`<input type="file">` is always uncontrolled).

### Q12: How does event handling work in React?

**A:** You attach handlers via camelCase props (`onClick`, `onChange`) that receive a **SyntheticEvent** — a cross-browser wrapper over the native event. React uses event delegation under the hood (attaching listeners at the root).

```jsx
<button
  onClick={(e) => {
    e.preventDefault();
    handle(e);
  }}
>
  Save
</button>
```

**Tip:** Know that in React 17+, events are delegated to the **root container**, not `document` (changed from React 16). Also `e.persist()` is no longer needed since React 17 — synthetic events aren't pooled anymore.

### Q13: What are Fragments and why use them?

**A:** Fragments let you return multiple elements without adding an extra DOM node. Use `<></>` shorthand or `<React.Fragment>` (the latter when you need a `key`, e.g. in a list of pairs).

```jsx
return (
  <>
    <Header />
    <Main />
  </>
);
```

**Tip:** Mention that wrapping everything in `<div>` ("div soup") breaks flex/grid layouts and CSS — Fragments avoid that.

### Q14: Default export vs named export for components?

**A:** A default export (`export default Component`) is imported with any name; named exports (`export const Foo`) must match the name and enable better tree-shaking, refactor-safe renames, and multiple exports per file.

```jsx
export default function Button() {} // import Button from './Button'
export const Icon = () => {}; // import { Icon } from './Icon'
```

**Tip:** Many teams (and lint configs) prefer named exports for consistency and reliable IDE refactors. Either is fine — have a reasoned preference.

### Q15: What is `StrictMode`?

**A:** `<StrictMode>` is a dev-only wrapper that helps catch bugs: it double-invokes renders, effects (mount→unmount→mount), and state updaters to surface impure functions and missing effect cleanup. It renders nothing and has zero effect in production.

**Tip:** If someone says "my effect runs twice, it's a React bug" — correct them: that's StrictMode in dev verifying your cleanup is correct. The fix is proper cleanup, not removing StrictMode.

## Intermediate

### Q16: Explain `useState`, including functional updates and lazy initialization.

**A:** `useState` returns `[value, setter]`. Use the **functional update** form when the new value depends on the previous one (avoids stale closures and batching issues). Use **lazy init** (pass a function) when the initial value is expensive — it runs only once.

```jsx
const [count, setCount] = useState(0);
setCount((prev) => prev + 1); // functional update
const [data] = useState(() => parseBigJSON()); // lazy init, runs once
```

**Tip:** Gotcha: `setCount(count + 1)` called twice in one handler only increments once (stale `count`); the functional form fixes it. Also: setting state to the same value bails out of re-render.

### Q17: When does state actually update after calling the setter?

**A:** Setters are asynchronous and **batched**. The state variable in the current render is a snapshot; reading it right after `setX` gives the old value. React schedules a re-render with the new value.

```jsx
setCount(count + 1);
console.log(count); // still the OLD value
```

**Tip:** React 18 batches updates everywhere (including in promises/timeouts/native events), not just React event handlers — that's "automatic batching."

### Q18: Explain `useEffect` — when it runs and the dependency array.

**A:** `useEffect(fn, deps)` runs `fn` after the render is committed and painted. The deps array controls re-execution: `[]` = once on mount; `[a, b]` = when `a` or `b` change; omitted = after every render. The returned function is cleanup, run before the next effect and on unmount.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, []); // mount only
```

**Tip:** Most common bug: missing dependencies → stale values. Don't lie to the linter; instead use functional updates, refs, or restructure. They may ask you to read `react-hooks/exhaustive-deps`.

### Q19: How do you fetch data with `useEffect` correctly?

**A:** Fetch inside the effect, guard against race conditions and setting state after unmount using a flag or `AbortController`.

```jsx
useEffect(() => {
  const controller = new AbortController();
  (async () => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        signal: controller.signal,
      });
      setUser(await res.json());
    } catch (e) {
      if (e.name !== "AbortError") setError(e);
    }
  })();
  return () => controller.abort();
}, [id]);
```

**Tip:** Strong answer: "In production I'd use TanStack Query / SWR for caching, dedup, retries — but I can hand-roll it with `useEffect`." Mention the StrictMode double-fetch in dev and why abort/cleanup matters.

### Q20: What are the common `useEffect` bugs?

**A:**

1. Missing deps → stale closures
2. object/array deps recreated every render → infinite loops
3. setting state unconditionally in an effect → loops
4. forgetting cleanup → memory leaks / duplicate listeners
5. using effects for things derivable during render

**Tip:** Quote the react.dev mantra: "You Might Not Need an Effect." Effects are for synchronizing with external systems, not for transforming data for rendering.

### Q21: What is `useRef` used for?

**A:** Two uses:

1. reference a DOM node
2. hold a **mutable value that persists across renders without triggering a re-render** (e.g. timer IDs, previous values, instance flags)

```jsx
const inputRef = useRef(null);
useEffect(() => inputRef.current?.focus(), []);
const renderCount = useRef(0);
renderCount.current++;
```

**Tip:** Key contrast: changing `ref.current` does NOT re-render; changing state does. If something should appear on screen, it belongs in state, not a ref.

### Q22: What is `useContext` and when do you use it?

**A:** `useContext` reads a value from the nearest matching `Context.Provider`, letting you avoid passing props through many intermediate layers (prop drilling). Common for theme, auth user, locale/direction (your i18next/RTL setup).

```jsx
const ThemeContext = createContext("light");
function Btn() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Go</button>;
}
```

**Tip:** Caveat: every consumer re-renders when the context value changes. Split contexts or memoize the provider value to avoid over-rendering. Context isn't a state manager — pair with `useReducer` or a library for complex global state.

### Q23: What is prop drilling and how do you avoid it?

**A:** Prop drilling is passing props through components that don't use them just to reach a deep child. Fixes: Context API, component composition (pass JSX via `children`/render props), or a state library (Redux/Zustand).

**Tip:** Composition is often the cleanest fix and easy to overlook — restructuring so the data-owner renders the consumer directly avoids drilling without Context.

### Q24: What's the difference between `useMemo` and `useCallback`?

**A:** `useMemo(fn, deps)` memoizes the **return value** of a computation; `useCallback(fn, deps)` memoizes the **function reference** itself. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

```jsx
const sorted = useMemo(() => items.sort(cmp), [items]);
const onSelect = useCallback((id) => setSel(id), []);
```

**Tip:** They're optimizations, not correctness. Overusing them adds overhead. Use `useCallback` when passing callbacks to memoized children or as effect deps; use `useMemo` for genuinely expensive computations or to keep referential stability.

### Q25: When does `useMemo` / `useCallback` actually help?

**A:** When:

1. the wrapped work is expensive, or
2. the memoized value/function is a dependency of `React.memo` children, effects, or other hooks where referential equality prevents wasted re-renders/re-runs

**Tip:** "Premature memoization" is a red flag the other way — wrapping every tiny function. Note React 19's compiler ("React Compiler") aims to auto-memoize, reducing manual usage.

### Q26: What is `useReducer` and when over `useState`?

**A:** `useReducer(reducer, initialState)` manages state via dispatched actions, centralizing transition logic. Prefer it when state is complex, has multiple sub-values that change together, or next state depends on previous state in non-trivial ways.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return { count: state.count + 1 };
    case "reset":
      return { count: 0 };
    default:
      return state;
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0 });
```

**Tip:** Reducers are easy to unit-test (pure functions) and pair well with Context for lightweight global state. Mention that as a Redux-free pattern.

### Q27: What are the Rules of Hooks?

**A:**

1. Only call hooks at the **top level** — never inside loops, conditions, or nested functions.
2. Only call hooks from **React function components or custom hooks**.

This guarantees hooks run in the same order every render, which is how React associates state with each hook call.

```jsx
// WRONG: conditional hook
if (loggedIn) {
  const [x] = useState(0);
}
```

**Tip:** Explain _why_: React tracks hooks by call order, not by name. Breaking order corrupts state mapping. The `eslint-plugin-react-hooks` enforces this.

### Q28: What is a custom hook? Write `useToggle`.

**A:** A custom hook is a function starting with `use` that composes built-in hooks to share stateful logic between components (not UI).

```jsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle, setOn];
}
// usage: const [open, toggleOpen] = useToggle();
```

**Tip:** Emphasize custom hooks share _logic_, not _state_ — each call gets its own isolated state. Great for modals, theme, form fields.

### Q29: Write a `useDebounce` hook.

**A:**

```jsx
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // cancel on new value/unmount
  }, [value, delay]);
  return debounced;
}
```

**Tip:** The cleanup clearing the previous timeout IS the debounce. Common in your search inputs to throttle API calls. Be ready to also debounce a callback (different pattern using a ref).

### Q30: Write a `useFetch` hook with loading and error state.

**A:**

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
```

**Tip:** Note the `finally` may run after abort; in strict code guard with a mounted flag. Mention you'd reach for TanStack Query in real apps for caching/retries.

### Q31: How do you lift state up?

**A:** When two sibling components need to share/sync state, move that state to their closest common parent and pass it down as props plus a setter callback. The parent becomes the single source of truth.

```jsx
function Parent() {
  const [val, setVal] = useState("");
  return (
    <>
      <Input value={val} onChange={setVal} />
      <Preview value={val} />
    </>
  );
}
```

**Tip:** This is React's answer to coordinating siblings. If you find yourself lifting very high repeatedly, that signals Context or a store is warranted.

### Q32: What is component composition and the `children` prop?

**A:** Composition builds complex UI from smaller components, often by passing JSX through `children` (or named slots). It favors flexibility over inheritance — React has no component inheritance.

```jsx
function Card({ title, children }) {
  return (
    <section>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
<Card title="Stats">
  <Chart />
</Card>;
```

**Tip:** "Composition over inheritance" is React's official stance. Slot/render-prop patterns and `children` solve most reuse needs that other frameworks solve with inheritance.

### Q33: What is derived state and why avoid duplicating state?

**A:** Derived state is a value you compute from existing props/state during render instead of storing separately. Duplicating it in `useState` risks the two going out of sync.

```jsx
// good: derive during render
const fullName = `${first} ${last}`;
const visible = items.filter((i) => i.active);
```

**Tip:** Red flag: a `useEffect` that just copies props into state. If it can be computed during render, compute it. Memoize only if expensive.

## Advanced

### Q34: What triggers a re-render in React?

**A:** A component re-renders when:

1. its **state changes** (via a setter with a new value)
2. its **parent re-renders** (children re-render by default)
3. a **context value it consumes** changes

Props changing only matters because the parent re-rendered to pass them.

**Tip:** Common misconception: "changing props re-renders the child." Technically the parent re-rendering is what propagates. Use `React.memo` to skip a child re-render when its props are shallowly equal.

### Q35: How do you prevent unnecessary re-renders?

**A:** `React.memo` for components (shallow prop compare), `useMemo`/`useCallback` to keep prop references stable, splitting context, and moving state down so fewer components depend on it. Also avoid creating new object/array/function literals in render that get passed to memoized children.

```jsx
const Row = React.memo(function Row({ item, onClick }) { ... });
```

**Tip:** `React.memo` is useless if you pass a fresh inline function/object each render — that's why you pair it with `useCallback`/`useMemo`. React 19's compiler reduces this manual work.

### Q36: What are React Portals and when do you use them?

**A:** `createPortal(child, domNode)` renders children into a DOM node outside the parent's hierarchy while keeping them in the React tree (events still bubble through React parents). Used for modals, tooltips, dropdowns that must escape `overflow:hidden`/stacking contexts.

```jsx
import { createPortal } from "react-dom";
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

**Tip:** Key insight: portals break out of the _DOM_ tree but not the _React_ tree — context and event bubbling still work as if it were a normal child.

### Q37: What is an Error Boundary and how do you write one?

**A:** An Error Boundary is a component that catches JS errors in its child tree during render/lifecycle/constructors, logs them, and shows fallback UI. It must be a **class** (uses `getDerivedStateFromError` and/or `componentDidCatch`).

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    logError(error, info);
  }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```

**Tip:** Gotchas: boundaries do NOT catch errors in event handlers, async code, SSR, or the boundary itself — use try/catch for those. In real apps wrap with `react-error-boundary` for a hook-friendly API and reset support.

### Q38: Explain `React.lazy`, `Suspense`, and code splitting.

**A:** `React.lazy(() => import('./X'))` dynamically imports a component so its code ships in a separate bundle chunk, loaded on demand. `<Suspense fallback={...}>` shows a fallback while the chunk (or any suspending resource) loads. This is route-based/component-based code splitting and shrinks the initial bundle.

```jsx
const Settings = React.lazy(() => import("./Settings"));
<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>;
```

**Tip:** With Vite, `import()` is automatically split. Mention route-level splitting in React Router as the highest-impact win for large apps like Nova ERP. Pair with an Error Boundary to handle chunk-load failures.

### Q39: `useEffect` vs `useLayoutEffect`?

**A:** Both run after render, but `useLayoutEffect` fires **synchronously after DOM mutations and before the browser paints**, while `useEffect` runs **after paint** (asynchronously). Use `useLayoutEffect` only when you must read layout (measure size/position) and mutate the DOM before the user sees it, to avoid flicker.

```jsx
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setHeight(height); // before paint -> no flash
}, []);
```

**Tip:** Overusing `useLayoutEffect` blocks painting and hurts performance; default to `useEffect`. It also warns during SSR (runs only on client).

### Q40: What is `forwardRef` and how does React 19 change refs?

**A:** Pre-React 19, function components can't receive a `ref` directly; `forwardRef` lets a parent attach a ref to a child's DOM node or imperative handle. In **React 19**, `ref` is a regular prop — you can accept `ref` in props without `forwardRef`.

```jsx
// React <=18
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
// React 19
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

**Tip:** Mention `useImperativeHandle` to expose a custom imperative API (e.g. `focus()`, `scrollTo()`) instead of the raw node. `forwardRef` still works in 19 (deprecated path), so legacy code is fine.

### Q41: What is `useId`?

**A:** `useId` generates a unique, stable ID that's consistent between server and client (SSR-safe), avoiding hydration mismatches. Use it for associating form labels/inputs and ARIA attributes — not for keys.

```jsx
const id = useId();
<label htmlFor={id}>Email</label><input id={id} />
```

**Tip:** Don't use it as a list key or for DOM selectors. Its whole point is SSR/hydration stability for accessibility wiring.

### Q42: What are React 18 concurrent features — `useTransition` and `useDeferredValue`?

**A:** Concurrent rendering lets React interrupt/prioritize work. `useTransition` marks state updates as **non-urgent** so urgent updates (typing) stay responsive while the expensive update renders in the background. `useDeferredValue` returns a deferred copy of a value that lags behind during heavy renders.

```jsx
const [isPending, startTransition] = useTransition();
const onChange = (e) => {
  setQuery(e.target.value); // urgent
  startTransition(() => setResults(filter(e.target.value))); // non-urgent
};
const deferredQuery = useDeferredValue(query); // alternative approach
```

**Tip:** Use case: keeping a search input snappy while a big filtered list re-renders. `isPending` lets you show a subtle loading state. Don't wrap controlled input value updates in a transition (the input must update urgently).

### Q43: What is the `use` hook in React 19?

**A:** `use` lets you read the value of a **Promise** or **Context** during render. With a Promise, the component suspends until it resolves (works with Suspense); unlike other hooks, `use` **can be called conditionally** and inside loops.

```jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // suspends until resolved
  return comments.map((c) => <p key={c.id}>{c.text}</p>);
}
```

**Tip:** Pair with Suspense + Error Boundary. Note you typically don't create the promise inside the component (it'd recreate each render) — pass it from a cached source or framework loader.

### Q44: How does React batch state updates? What changed in React 18?

**A:** Batching groups multiple state updates into a single re-render. In React 17, batching happened only inside React event handlers. **React 18's automatic batching** extends this to promises, `setTimeout`, and native event handlers, so multiple `setState` calls in async code cause one render.

```jsx
setTimeout(() => {
  setA(1);
  setB(2);
}, 0); // React 18: one render
```

**Tip:** If you ever need to opt out (force a sync flush), `flushSync` from `react-dom` does it — but it's rare and hurts performance.

### Q45: How does key-based reconciliation handle reordering?

**A:** With stable keys, React matches elements by key across renders: it moves DOM nodes for reordered keys, mounts new keys, and unmounts missing ones — preserving component state. With index keys on a reordered list, keys stay positional, so React thinks data at each position "changed," causing wrong state association and extra DOM work.

**Tip:** Concrete example: a checked checkbox in a list, then you delete the first item. With `id` keys the checks follow the data; with index keys the wrong row appears checked. This is the canonical demo of the index-key bug.

### Q46: How do you use Ant Design's `Form` (controlled component patterns)?

**A:** Ant Design's `Form` manages field state internally — you usually don't wire `value`/`onChange` per field. Each `Form.Item` with a `name` becomes controlled by the form instance; read/write via `Form.useForm()`.

```jsx
const [form] = Form.useForm();
<Form
  form={form}
  onFinish={(values) => save(values)}
  initialValues={{ role: "user" }}
>
  <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
    <Input />
  </Form.Item>
  <Button htmlType="submit">Save</Button>
</Form>;
// programmatic: form.setFieldsValue({ email: "a@b.com" }); form.validateFields();
```

**Tip:** Gotcha: don't put a controlled `value`/`onChange` on an `Input` inside a named `Form.Item` — it fights AntD's form control. Use `getValueFromEvent`/`normalize` for custom transforms, and `dependencies`/`shouldUpdate` for conditional fields.

### Q47: How do you build conditional class names cleanly?

**A:** Use template literals for simple cases, or `clsx`/`classnames` for conditional maps. With Tailwind this keeps variant logic readable; consider `tailwind-merge` to resolve conflicting utilities.

```jsx
import clsx from "clsx";
<button
  className={clsx("btn", { "btn--active": isActive, "opacity-50": disabled })}
/>;
```

**Tip:** For RTL support (your i18next setup), drive direction-aware classes off the locale/`dir`, and prefer Tailwind logical utilities (`ms-*`/`me-*`) over `ml-*`/`mr-*` so they flip automatically.

### Q48: Why must render functions be pure?

**A:** Given the same props/state, render must return the same JSX and cause no side effects (no mutations of external vars, no DOM writes, no subscriptions). Purity is what lets React safely re-render, bail out, and run concurrent/StrictMode double-renders without breaking your app.

**Tip:** This is exactly why StrictMode double-invokes renders in dev — to catch impurity. Side effects belong in event handlers or `useEffect`.

### Q49: What is hydration and what causes hydration mismatches?

**A:** Hydration is attaching React's event listeners and state to server-rendered HTML on the client. A mismatch happens when the client's first render produces different markup than the server's (e.g. `Date.now()`, `Math.random()`, `window`-dependent rendering, or locale differences), causing warnings and re-renders.

**Tip:** Fixes: render the same on both sides, gate client-only bits behind an effect/`useState`, or use `useId` for IDs. Relevant if any of your apps use SSR/Next-style rendering.

### Q50: How would you optimize a large list (e.g. ERP table with thousands of rows)?

**A:** Virtualize (render only visible rows) with `react-window`/`@tanstack/react-virtual`, paginate or infinite-scroll, memoize rows with `React.memo`, keep stable keys, and avoid passing new function/object props each render. AntD `Table` supports `virtual` and server-side pagination.

**Tip:** Tie it to your portfolio: "In Nova ERP I used virtualization + server pagination so the DOM never holds thousands of nodes." Concrete experience scores well.

### Q51: What's the difference between `React.memo`, `useMemo`, and `useCallback`?

**A:** `React.memo` is a **HOC** that memoizes a **component's render** based on shallow prop equality. `useMemo` memoizes a **computed value**. `useCallback` memoizes a **function reference**. They solve different layers: skip child render vs cache value vs stabilize reference.

**Tip:** Interviewers ask this to test if you conflate them. One sentence each, then note `useCallback(fn, d)` === `useMemo(() => fn, d)`.

## Common Mistakes / Red Flags

- Using **array index as key** in dynamic/reorderable lists, then being surprised by state bleaking across rows.
- **Mutating state directly** (`state.push(x)`, `obj.prop = y`) instead of creating new references — React won't detect the change.
- **Lying to the `exhaustive-deps` lint** by omitting dependencies, causing stale closures and "it works sometimes" bugs.
- Putting **object/array/function literals in deps** so effects loop forever, or in props so `React.memo` never helps.
- Treating `setState` as **synchronous** and reading the value immediately after the setter.
- Using `{count && <X/>}` and accidentally rendering `0` (use `count > 0 &&` or a ternary).
- **Premature optimization**: wrapping everything in `useMemo`/`useCallback`/`React.memo` without measuring — adds overhead and noise.
- Using **`useEffect` to derive/copy state** that could be computed during render ("you might not need an effect").
- Forgetting **effect cleanup** (intervals, subscriptions, listeners) → memory leaks and duplicate handlers.
- Calling hooks **conditionally or in loops**, breaking the Rules of Hooks.
- Blaming **StrictMode double-render/effect** instead of fixing impurity or missing cleanup.
- Mixing a **controlled `value` with AntD `Form.Item name`**, fighting the form instance.
- Defaulting to `useLayoutEffect` when `useEffect` would do, blocking paint.
- Storing in a **ref** something that should re-render the UI (and vice versa, storing render-irrelevant data in state).

## Further Reading

- React docs — Learn / Reference: https://react.dev/learn
- You Might Not Need an Effect: https://react.dev/learn/you-might-not-need-an-effect
- Rules of Hooks & built-in Hooks reference: https://react.dev/reference/react/hooks
- React 19 release (use, ref-as-prop, Actions): https://react.dev/blog/2024/12/05/react-19
