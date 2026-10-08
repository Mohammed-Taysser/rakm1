# React Advanced (Performance, Internals & Patterns) (44 questions)

> Senior React interviews stop asking _"what is a hook"_ and start probing whether you understand _why_ React behaves the way it does: what triggers a render, what the reconciler actually does, where memoization helps versus where it is cargo-cult noise, and how you keep a 10,000-row ERP grid at 60fps. Because you build large enterprise apps — Nova ERP with SignalR real-time pushes, multi-tenant Dynamic SaaS dashboards, i18next/RTL, feature-module architecture — you have lived the exact problems these questions test: context that re-renders the whole tree, effects that leak sockets, stale closures swallowing the latest tenant, and bundles that balloon as feature modules pile up. This file goes deep so you can answer from scars, not slides.

## Quick Revision Checklist

- A component re-renders when: its state changes, its parent re-renders, its context value changes, or `forceUpdate` is called. Props changing does NOT directly cause a render — the parent rendering does.
- Reconciliation diffs the new element tree against the current Fiber tree; same type + same key = reuse + update, different type/key = unmount + remount.
- `key` is an identity hint for siblings, not a styling/loop ornament. Changing a `key` deliberately remounts a component (resetting its state).
- Fiber = React's reentrant, interruptible reimplementation of the reconciler; it splits work into units so rendering can pause, prioritize, and resume.
- `React.memo` only skips renders caused by the _parent_; it does nothing for state/context changes, and is useless if you pass fresh object/array/function props every render.
- `useMemo`/`useCallback` are about **referential stability**, not raw speed. They cost memory + a deps comparison; over-using them hurts.
- Referential equality: `{} !== {}`, `[] !== []`, `() => {} !== () => {}`. This is the root cause of most "why did my memo not work" bugs.
- Virtualize any list/grid over a few hundred rows (`react-window`/`react-virtuoso`) — render only what's on screen. Critical for ERP data grids.
- Split Context into **state context** + **dispatch context**, or use a selector library, so consumers only re-render on the slice they read.
- Colocate state as low as possible; lift only when truly shared. Derive instead of storing duplicated state.
- Clean up every subscription/timer/fetch in the effect's return function. Use `AbortController` for fetch and unsubscribe SignalR/WebSocket handlers on unmount.
- Avoid stale closures: include deps, use the functional `setState(prev => ...)` form, or the `useLatest` ref pattern for "always current" values inside long-lived callbacks.
- React 18 batches state updates everywhere (including promises, timeouts, native events), not just inside React event handlers.
- `useTransition`/`useDeferredValue` mark updates as non-urgent so typing stays responsive while expensive lists re-render.
- Don't put everything in Context — it's not a state manager. Reach for React Query (server cache) and Redux/Zustand (client state) where they fit.
- Profile before optimizing: React DevTools Profiler + the "why did this render" highlight, then Chrome performance traces for the real cost.

## Basic

_(here "Basic" = entry-level advanced; the tiers still hold)_

### Q1: What actually causes a React component to re-render?

**A:** Four triggers:

1. its own state changed via a `setState`/`dispatch`
2. its parent re-rendered (a child re-renders by default when the parent does, regardless of whether props changed)
3. a Context it consumes produced a new value
4. `useSyncExternalStore`/`forceUpdate`-style external notifications

Note that "props changed" is not itself a trigger — the parent re-rendering is what schedules the child; props simply happen to be different (or not) as a result.

**Tip:** State the parent-driven case explicitly. Many candidates wrongly believe a child only re-renders when its props change. That misconception is exactly why `React.memo` exists.

### Q2: What is reconciliation?

**A:** Reconciliation is the process React uses to figure out what changed between the previous render output and the new one, so it can apply the minimum set of DOM mutations. React builds a tree of elements each render and diffs it against the existing tree (the current Fiber tree), then commits only the differences.

**Tip:** Distinguish "render" (calling your component functions to produce elements) from "commit" (applying changes to the actual DOM). Reconciliation/diffing happens in the render phase; DOM writes happen in the commit phase.

### Q3: What are the heuristics of React's diffing algorithm?

**A:** A true tree diff is O(n³); React uses an O(n) heuristic based on two assumptions:

1. **two elements of different types produce different trees** — so if the type changes (`div` → `span`, or `<A>` → `<B>`), React tears down the old subtree and builds a new one rather than diffing inside it
2. **the developer can hint stable identity across renders via `key`** — so among a list of siblings, matching keys are reused and updated in place

**Tip:** "Different type = full remount of that subtree" is the key consequence: conditionally swapping element types blows away state and DOM below that point.

### Q4: Why do lists need `key` and what makes a good key?

**A:** Keys let React match elements across renders to their previous instances so it can reuse DOM/state instead of recreating. A good key is **stable, unique among siblings, and tied to the data's identity** (e.g. a DB id). Using array index is fine only for static, never-reordered lists; for reorderable/filterable lists, index keys cause React to associate the wrong state/DOM with the wrong item (e.g. an input's value sticks to the wrong row).

**Tip:** Mention the classic bug: index keys + a list with delete/reorder → checkboxes or focus jump to the wrong row. ERP grids with sortable columns are a textbook trap.

### Q5: What is `React.memo` and when does it NOT help?

**A:** `React.memo(Component)` wraps a component so it skips re-rendering when its props are shallow-equal to the previous props — it only prevents renders caused by the _parent_ re-rendering. It does NOT help when:

- the component's own state or a consumed context changes
- you pass a new object/array/inline function prop each render (shallow compare fails every time)
- you pass `children` as JSX (that's a new element object each render)

**Tip:** Memo + unstable props = pure overhead (you pay for the comparison and still re-render). Memo pays off only when paired with stable props, which usually means `useCallback`/`useMemo` on the parent.

### Q6: What's the difference between `useMemo` and `useCallback`?

**A:** `useMemo(fn, deps)` memoizes the **return value** of `fn`; `useCallback(fn, deps)` memoizes the **function itself**. `useCallback(fn, deps)` is exactly `useMemo(() => fn, deps)`. Both recompute only when a dep changes, otherwise returning the previous reference.

**Tip:** The mnemonic: `useMemo` for values, `useCallback` for functions. Both exist primarily to preserve referential identity for memoized children and effect deps — not to make math faster.

### Q7: What is referential equality and why does it matter so much in React?

**A:** Objects, arrays, and functions are compared by reference in JS: `{} !== {}`. React's shallow comparisons (in `memo`, in hook deps, in `PureComponent`) treat a new reference as "changed." So an inline `style={{ color: 'red' }}`, `onClick={() => ...}`, or `data={[...]}` is a brand-new value every render, defeating any downstream memoization and re-firing effects.

**Tip:** Most "memoization doesn't work" questions reduce to: a new reference is being created upstream every render. Trace the reference, not the value.

### Q8: What is a controlled vs uncontrolled component?

**A:** A **controlled** input has its value driven by React state (`value={x} onChange={...}`) — React is the single source of truth. An **uncontrolled** input keeps its own state in the DOM and you read it via a ref (or `defaultValue`). Controlled gives you validation/derived UI on every keystroke; uncontrolled is lighter and avoids re-rendering on every character (good for very large forms).

**Tip:** Senior nuance: for huge forms, fully controlled inputs can cause perf issues (re-render per keystroke); libraries like React Hook Form lean on uncontrolled inputs + refs for exactly this reason.

### Q9: What is a custom hook and what rules govern hooks?

**A:** A custom hook is a function whose name starts with `use` and that calls other hooks to encapsulate reusable stateful logic (e.g. `useTenantSettings`, `useDebouncedValue`). Rules of Hooks: call hooks only at the top level (not in conditions/loops/nested functions) and only from React functions/other hooks. This is because React relies on **call order** to associate hook state with the component.

**Tip:** Custom hooks share _logic_, not _state_ — each call gets its own independent state. That's a common misconception worth pre-empting.

### Q10: What are portals and what are they for?

**A:** `createPortal(child, domNode)` renders children into a different part of the DOM tree while keeping them in the React tree (so context, events, and state still work normally). Used for modals, tooltips, toasts, and dropdowns that must escape parent `overflow:hidden`/`z-index`/`transform` stacking contexts.

**Tip:** Note that React events still bubble through the React tree, not the DOM tree — a click inside a portal'd modal bubbles to the React parent, which can surprise people writing outside-click handlers.

### Q11: What is an error boundary and what does it catch?

**A:** A class component implementing `getDerivedStateFromError` and/or `componentDidCatch` that catches render-phase errors in its child tree and shows a fallback UI instead of crashing the whole app. It does NOT catch errors in event handlers, async code (setTimeout/promises), SSR, or errors thrown in the boundary itself.

**Tip:** Mention you wrap each feature module/route in its own boundary so one broken ERP module doesn't white-screen the entire dashboard.

### Q12: What is lazy loading / code splitting in React?

**A:** `React.lazy(() => import('./Module'))` plus `<Suspense fallback={...}>` splits a component into a separate bundle chunk loaded on demand, shrinking the initial bundle. Typically applied at route boundaries and heavy feature modules.

**Tip:** Tie it to your architecture: each feature module in Nova ERP is a lazy-loaded route chunk, so the login screen doesn't ship the reporting engine.

## Intermediate

### Q13: Walk me through the Fiber architecture at a high level.

**A:** Fiber is React 16+'s reimplementation of the reconciler. Instead of a single synchronous recursive walk (the old "stack reconciler"), work is broken into units of work called _fibers_ — one per element. React maintains two trees: the **current** tree (what's on screen) and a **work-in-progress** tree it builds during render. Because work is a linked list of fibers, React can pause after each unit, yield to the browser, prioritize urgent work (like input), abandon in-progress work, and resume — enabling concurrent features. The render phase is interruptible and side-effect-free; the commit phase (DOM mutations, lifecycle/effects) is synchronous and uninterruptible.

**Tip:** Don't try to recite every field. The interview-winning points are: two trees (double buffering), interruptible render vs. atomic commit, and priority-based scheduling. That's what unlocks `useTransition` and time-slicing.

### Q14: How do you prevent unnecessary re-renders systematically?

**A:** In order of leverage:

1. **Move state down** — colocate so only the small subtree that needs it re-renders.
2. **Lift content up / pass as children** — a component that re-renders doesn't re-render `children` passed to it (they're created by the parent).
3. **`React.memo`** the expensive children + stabilize their props with `useMemo`/`useCallback`.
4. **Split context** so consumers subscribe to narrower slices.
5. **Virtualize** long lists.

Profiler-driven, not speculative.

**Tip:** The "pass children to skip re-render" trick is underrated and pure (no memo needed). Lead with structure before reaching for memoization.

### Q15: Show me how to memoize an expensive child correctly.

**A:**

```jsx
const ExpensiveRow = React.memo(function ExpensiveRow({ row, onSelect }) {
  // heavy formatting / charts per row
  return <tr onClick={() => onSelect(row.id)}>{/* ... */}</tr>;
});

function Grid({ rows }) {
  const [selectedId, setSelectedId] = useState(null);

  // stable callback identity so memo'd rows don't re-render on every parent render
  const handleSelect = useCallback((id) => setSelectedId(id), []);

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <ExpensiveRow key={row.id} row={row} onSelect={handleSelect} />
        ))}
      </tbody>
    </table>
  );
}
```

The combination matters: `React.memo` skips rows whose `row` reference is unchanged, and `useCallback` keeps `onSelect` stable so the memo comparison actually passes. Without the `useCallback`, every parent render hands every row a new function and they all re-render.

**Tip:** If `rows` itself is rebuilt with `.map`/`.filter` each render, every row gets a new reference and memo is defeated — memoize the derived array too, or push derivation upstream.

### Q16: When does `useMemo`/`useCallback` actually _hurt_?

**A:** They have real costs: the closure and deps array are allocated every render, and React performs a shallow deps comparison every render. If the wrapped computation is cheap (string concat, small map) or the value isn't fed into a memoized child / effect dep, you've added overhead and noise for zero benefit. They also create a false sense of stability — if a dep silently changes every render, you pay the cost AND recompute.

**Tip:** Heuristic: memoize when the value is:

- expensive to compute, or
- used as a prop to a memoized component or a dependency of an effect

Otherwise, skip it.

### Q17: How do you virtualize a large table or list, and why?

**A:** Rendering 10k DOM rows kills layout/paint and memory. Virtualization renders only the rows in (and slightly around) the viewport, recycling DOM nodes as you scroll. Libraries: `react-window` (lightweight), `react-virtuoso` (dynamic row heights, sticky headers, grids), TanStack Virtual (headless). You give it item count + row height (or a measurement strategy) and it positions an absolutely-placed window of rows inside a tall spacer.

```jsx
import { FixedSizeList } from "react-window";

function OrderList({ orders }) {
  const Row = ({ index, style }) => (
    <div style={style} className="order-row">
      {orders[index].code} — {orders[index].total}
    </div>
  );
  return (
    <FixedSizeList
      height={600}
      itemCount={orders.length}
      itemSize={36}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**Tip:** ERP gotchas: variable row heights (use a measuring variant), horizontal virtualization for wide column sets, keeping sticky headers/frozen columns working, and preserving keyboard navigation/accessibility (virtualized rows aren't all in the DOM, so `aria-rowcount`/`aria-rowindex` matter). Also mention RTL: virtualization math is left-based — verify horizontal scroll behaves under `dir="rtl"`.

### Q18: How do you split a Context to avoid performance pitfalls?

**A:** A Context re-renders _every_ consumer whenever its `value` changes — and if you pass a fresh object as `value` each render, that's every render. Two fixes:

1. memoize the value
2. split state and dispatch into two contexts so components that only dispatch don't re-render when state changes

```jsx
const StateCtx = createContext(null);
const DispatchCtx = createContext(null);

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart);
  // dispatch identity is stable across renders, so DispatchCtx consumers never re-render
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useCartState = () => useContext(StateCtx);
export const useCartDispatch = () => useContext(DispatchCtx);
```

**Tip:** For finer granularity (consumers reading one field of a big state object), reach for a selector-based store (Zustand, Redux + `useSelector`, or `use-context-selector`). Plain Context has no selector — any value change wakes all consumers.

### Q19: What is state colocation and why does it improve performance?

**A:** Colocation means keeping state in the lowest component that needs it rather than hoisting it to a global/app level. When state lives high in the tree, every update re-renders a large subtree; pushing it down shrinks the re-render scope to just the relevant branch. It also improves readability and testability.

**Tip:** Phrase it as "lift state up only as far as necessary, then push it back down when the shared need disappears." Over-lifting is a top cause of dashboard-wide re-render storms.

### Q20: Derived state vs stored state — how do you decide?

**A:** If a value can be computed from existing props/state, **derive it during render** (optionally with `useMemo`) rather than storing it in state and syncing it with effects. Storing derived state creates two sources of truth that drift out of sync and adds an extra render. Store state only when it's genuinely independent input (user typed it, server returned it).

**Tip:** Cite the anti-pattern: `useState` for `fullName` updated by an effect watching `firstName`/`lastName`. Just compute `const fullName = `${first} ${last}``. "Don't sync state, derive it."

### Q21: What's the difference between `useRef` and `useState`?

**A:** `useState` triggers a re-render when updated and is the source of truth for rendered output. `useRef` gives you a mutable `.current` that persists across renders but **does NOT trigger a re-render** when changed. Use refs for: DOM node access, storing timers/subscription handles, caching the latest value of something without rendering, and any mutable bookkeeping the UI doesn't directly depend on.

**Tip:** "Changing a ref does not re-render" is the whole point. If the UI must reflect the value, it belongs in state.

### Q22: What is `useImperativeHandle` and when is it appropriate?

**A:** Combined with `forwardRef`, it lets a parent call imperative methods on a child via a ref while exposing only a controlled API instead of the raw DOM node. Appropriate for genuinely imperative operations: `focus()`, `scrollIntoView()`, `play()`, `openDialog()`, resetting a complex form widget.

```jsx
const SearchBox = forwardRef(function SearchBox(props, ref) {
  const inputRef = useRef(null);
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        inputRef.current.value = "";
      },
    }),
    [],
  );
  return <input ref={inputRef} {...props} />;
});
```

**Tip:** It's an escape hatch — prefer declarative props/state. Reach for it only when the operation has no good declarative model (focus management, media controls).

### Q23: How do you prevent memory leaks in effects?

**A:** Every effect that subscribes, opens a connection, sets a timer, or starts an async task must return a cleanup function that tears it down. For fetch, use `AbortController` to cancel in-flight requests on unmount or when deps change, avoiding "setState on unmounted component" and race conditions.

```jsx
useEffect(() => {
  const controller = new AbortController();
  (async () => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/orders`, {
        signal: controller.signal,
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      if (err.name !== "AbortError") setError(err);
    }
  })();
  return () => controller.abort();
}, [tenantId]);
```

**Tip:** The race-condition angle wins points: without abort, switching tenants quickly can let a slow earlier response overwrite the newer one. Aborting (or an `ignore` flag) fixes both the leak and the staleness.

### Q24: What is a stale closure and how do you avoid it?

**A:** A closure captures the variables in scope when it was created. In React, a callback or effect created in one render "sees" that render's props/state forever unless re-created. So an effect with `[]` deps or a `setInterval` callback reads the _initial_ state. Fixes:

1. include the value in deps so the closure is recreated
2. use the functional updater `setCount(c => c + 1)` so you don't need the current value
3. use a `useLatest` ref for values you want "always current" inside a long-lived callback without resubscribing

**Tip:** The interviewer's favorite: a `setInterval` in `useEffect([])` that logs `count` always logging the initial value. Walk them through all three fixes and when each is appropriate.

### Q25: Show the `useLatest` ref pattern.

**A:**

```jsx
function useLatest(value) {
  const ref = useRef(value);
  ref.current = value; // updated on every render, no re-subscribe needed
  return ref;
}

function LiveTicker({ onTick }) {
  const onTickRef = useLatest(onTick);
  useEffect(() => {
    const id = setInterval(() => onTickRef.current(), 1000);
    return () => clearInterval(id);
  }, []); // interval set up ONCE, but always calls the latest onTick
}
```

This keeps the interval/subscription stable (set up once) while always invoking the most recent callback — avoiding both the stale closure and the churn of tearing down/re-creating the subscription every render.

**Tip:** This is the idiomatic answer to "I want a stable effect that still uses fresh props." It's essentially what the proposed `useEffectEvent` formalizes.

### Q26: How do you implement debounce/throttle in React correctly?

**A:** Don't recreate the debounced function each render (it resets the timer and breaks). Either build a `useDebouncedValue` hook with `useEffect` + `setTimeout` + cleanup, or memoize a debounced callback with `useMemo`/`useRef` and clean it up on unmount.

```jsx
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// usage: const debouncedSearch = useDebouncedValue(search, 300);
// then fetch in an effect keyed on debouncedSearch
```

**Tip:** Mention `useDeferredValue` as the React-native alternative for keeping input responsive without manual timers — different tool (it deprioritizes rendering) but solves the adjacent "typing feels laggy" problem.

### Q27: What changed about batching in React 18?

**A:** Before 18, React batched state updates only inside React event handlers; updates in promises, `setTimeout`, or native event listeners each triggered a separate render. React 18's **automatic batching** batches updates everywhere, so multiple `setState` calls in an async callback produce a single re-render. You can opt out with `flushSync` when you need a synchronous DOM update between two states.

**Tip:** Be ready for the "how do I force a sync update" follow-up → `flushSync(() => setX(...))`, used sparingly (e.g. measuring DOM right after a state change).

### Q28: How do you subscribe to real-time data (SignalR/WebSocket) in React?

**A:** Open the connection / register handlers in an effect, and unregister + stop the connection in the cleanup, keyed on what should re-establish it (e.g. tenant or hub URL). Push incoming messages into state. Use a ref for handler stability if the handler closes over changing values.

```jsx
function useOrderFeed(tenantId, onOrderUpdate) {
  const onUpdate = useLatest(onOrderUpdate); // avoid re-subscribing on every render
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`/hubs/orders?tenant=${tenantId}`)
      .withAutomaticReconnect()
      .build();

    const handler = (order) => onUpdate.current(order);
    connection.on("OrderUpdated", handler);

    let cancelled = false;
    connection.start().catch((e) => {
      if (!cancelled) console.error(e);
    });

    return () => {
      cancelled = true;
      connection.off("OrderUpdated", handler);
      connection.stop(); // critical: prevents leaked sockets across tenant switches
    };
  }, [tenantId]); // re-subscribe only when the tenant changes
}
```

**Tip:** Emphasize cleanup and the dependency choice. The classic Nova-style bug: not stopping the connection on unmount/tenant-switch, leaving zombie sockets that double-fire updates and leak memory. Using `useLatest` for the callback keeps the connection from tearing down every render.

### Q29: When should you NOT reach for Context, and what's the alternative?

**A:** Context is a _dependency-injection / broadcast_ mechanism, not a state manager and not a cache. Avoid it for:

- frequently-changing values shared widely (every consumer re-renders)
- server data (use **React Query/SWR/RTK Query** — they handle caching, dedup, revalidation, loading/error states)
- large client state with many independent slices (use **Redux Toolkit/Zustand** with selectors so components subscribe to just their slice)

**Tip:** Crisp framing: "Context for low-frequency global config (theme, locale, auth user); React Query for server state; a selector store for high-frequency client state." Putting server data and high-churn state in Context is the most common scaling mistake.

## Advanced

### Q30: Compare render props, HOCs, and custom hooks. Why did hooks largely win?

**A:** All three share cross-cutting logic. **HOCs** wrap a component (`withAuth(Component)`) — drawbacks: wrapper hell, prop name collisions, ref forwarding pain, indirection. **Render props** pass a function child (`<Mouse>{pos => ...}</Mouse>`) — flexible but nest deeply ("callback pyramid") and can cause extra renders. **Custom hooks** extract logic into plain functions — flat composition, no extra tree nodes, no naming collisions, easy to compose multiple. Hooks won because they share _stateful logic_ without changing the component hierarchy.

**Tip:** Note HOCs/render props aren't dead — HOCs still suit static wrapping (error boundaries, providers, `React.memo` itself), and render props live on in libraries needing to hand back layout/measurement (e.g. virtualization, `AutoSizer`).

### Q31: Explain the compound components pattern.

**A:** A set of components that work together sharing implicit state via context, giving a flexible declarative API. The parent holds state and exposes children that read it:

```jsx
<Tabs defaultIndex={0}>
  <Tabs.List>
    <Tabs.Tab>Orders</Tabs.Tab>
    <Tabs.Tab>Invoices</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel>...</Tabs.Panel>
  <Tabs.Panel>...</Tabs.Panel>
</Tabs>
```

`Tabs` provides context (active index + setter); `Tab`/`Panel` consume it. The consumer controls layout/markup freely without prop-drilling configuration.

**Tip:** Contrast with the "config object" API (`<Tabs items={[...]} />`): compound components trade a bit of verbosity for far better composition/customization — ideal for design-system primitives.

### Q32: What is Suspense for data fetching and how does it differ from Suspense for code?

**A:** Suspense lets a component "suspend" (throw a promise) while data/code isn't ready, and the nearest `<Suspense fallback>` shows a placeholder until it resolves. For code, `React.lazy` integrates automatically. For data, it requires a Suspense-enabled source: a framework loader (Next.js App Router, Remix), React Query's `useSuspenseQuery`, or the `use()` hook unwrapping a promise. It enables declarative loading states and coordinated reveals (no waterfall of spinners) and pairs with streaming SSR.

**Tip:** Stress that you don't throw promises by hand in app code — you use a Suspense-aware library. Also mention `useTransition` to avoid the fallback flashing when re-fetching after the first load.

### Q33: Explain concurrent rendering and the mental model behind it.

**A:** Concurrent React can prepare multiple versions of the UI at the same time and interrupt/abandon in-progress renders. Renders become _interruptible_: a high-priority update (typing) can pause a low-priority one (filtering a huge list), keeping the app responsive. It's not multithreading — it's cooperative scheduling on the main thread enabled by Fiber. You opt into concurrency through features like `useTransition`, `useDeferredValue`, and Suspense + `createRoot`.

**Tip:** Key correctness implication: render must be pure and side-effect-free, since React may render a component multiple times or throw away the work. This is why `StrictMode` double-invokes renders/effects in dev — to surface impurity.

### Q34: When do you use `useTransition` vs `useDeferredValue`?

**A:** Both mark work as non-urgent. `useTransition` wraps the _state update_ you're causing: `startTransition(() => setQuery(input))` keeps the input field snappy while the expensive list update is deprioritized, and gives you `isPending` for UI. `useDeferredValue` wraps a _value you receive_ (often a prop you don't own the setter for): `const deferred = useDeferredValue(query)` lets the input update immediately and the derived view lag behind. Use transition when you own the update; deferred value when you only have the value.

**Tip:** Both let React abandon stale intermediate renders. Pair `useDeferredValue` with `React.memo` on the expensive consumer, otherwise the deferral has nothing to defer against.

### Q35: How do you deliberately remount a component, and why?

**A:** Change its `key`. React treats a different key as a different element, so it unmounts the old instance (running cleanup) and mounts a fresh one with reset state. Uses: resetting an uncontrolled form when the selected entity changes (`<EditForm key={selectedId} ... />`), forcing a clean re-init of a stateful third-party widget, or clearing internal state on tenant switch.

**Tip:** It's the React-blessed alternative to "syncing props into state with an effect." `key={id}` is cleaner than a `useEffect` that resets state when `id` changes — and it's the documented pattern for "reset all state when a prop changes."

### Q36: How do you profile and find a real performance problem?

**A:** Use the **React DevTools Profiler**: record an interaction, inspect the flamegraph for which components rendered and how long, and turn on "highlight updates"/"why did this render" to see what's re-rendering needlessly. Then confirm the _user-visible_ cost with Chrome's Performance panel (long tasks, layout thrash, scripting vs. paint). Optimize the biggest committed cost first, re-measure, repeat. Don't memoize on a hunch.

**Tip:** Order of operations: measure → find the dominant cost → fix that one thing → re-measure. Mention "ranked" chart mode to spot the most expensive components quickly, and that StrictMode's double-render in dev inflates numbers (profile prod-like builds for real timing).

### Q37: How do you reduce bundle size in a large feature-module app?

**A:**

1. Route/module-level code splitting with `React.lazy` so each feature ships its own chunk.
2. Tree-shakeable imports — import specific functions (`import debounce from 'lodash/debounce'`) not whole libraries.
3. Analyze with `source-map-explorer`/`webpack-bundle-analyzer`/Vite's `rollup-plugin-visualizer` to find bloat.
4. Defer heavy deps (charting, PDF, rich-text editors) behind dynamic import.
5. Swap heavy libs for lighter ones (e.g. `date-fns`/`dayjs` over moment).
6. Split vendor chunks and leverage long-term caching.
7. For i18n, lazy-load locale bundles rather than shipping every language up front.

**Tip:** The i18next/locale-splitting point is directly relevant to your multi-tenant, multi-locale apps — shipping 20 locales in the main bundle is a common, invisible regression.

### Q38: What causes SSR hydration mismatches and how do you avoid them?

**A:** Hydration attaches React to server-rendered HTML; if the first client render produces different markup than the server sent, React warns (and in React 18+ may discard and re-render that subtree). Causes: rendering `Date.now()`/`Math.random()`, reading `window`/`localStorage` during render, locale/timezone differences, and browser-only content. Fixes: render deterministic markup on first paint, defer client-only bits to a post-mount effect (`useEffect` + a `mounted` flag), use stable IDs (`useId`), and gate browser APIs behind `typeof window !== 'undefined'` _after_ mount, not during render.

**Tip:** RTL/i18n angle: if the server doesn't know the user's locale/`dir` and the client switches it during render, you get a mismatch — resolve locale before render (cookie/header) so server and client agree.

### Q39: How does Context propagation actually interact with `React.memo`?

**A:** `React.memo` does NOT stop context-driven re-renders. When a Context value changes, every consumer (any component calling `useContext` for it) re-renders even if it's wrapped in `memo` and its props didn't change — context bypasses the props-based memo check. So memoizing a component that reads a hot context buys you nothing for context updates.

**Tip:** This trips up seniors too. The fix isn't more memo — it's splitting the context, narrowing the value, or using a selector so the consumer only wakes on the slice it reads.

### Q40: How do you design components to be testing-friendly and accessible?

**A:** Testing-friendly: keep components presentational where possible (props in, callbacks out), push side effects into hooks you can mock, avoid reaching into internals, and query by accessible role/label (Testing Library philosophy: test behavior, not implementation). Accessibility: use semantic elements (`<button>`, `<nav>`, `<table>` for grids), associate labels with inputs, manage focus on route/modal changes, support keyboard navigation, set `aria-*` on custom widgets, and ensure portals/modals trap focus and restore it on close.

**Tip:** The two goals reinforce each other: code that's accessible (real roles/labels) is exactly what `getByRole`/`getByLabelText` queries target — so a11y-correct components are inherently easier to test. For virtualized ERP grids, call out `aria-rowcount`/`aria-rowindex` since not all rows are in the DOM.

### Q41: A teammate wraps every component in `React.memo` "for performance." What do you say?

**A:** It's usually a net negative. `memo` adds a props comparison on every render and only helps when:

- the component re-renders often _due to its parent_
- its props are referentially stable
- its render is non-trivial

Blanket memoization wastes CPU on comparisons that always pass-through (unstable props) or never mattered (cheap components), adds memory, and hides the real architectural issues (state too high, context too broad). Profile, then memoize the few hot components that meet the criteria.

**Tip:** Strong senior answer: "Memoization is a targeted fix guided by the Profiler, not a default. Structure (state colocation, passing children, splitting context) eliminates more re-renders than memo ever will."

### Q42: Why does React re-render children when a parent renders, even with unchanged props, and what's the cleanest fix?

**A:** Rendering a parent calls its function, which creates _new_ element objects for its children every time, so React reconciles them (and calls their functions) by default — props equality isn't checked unless you opt in. Cleanest fixes, in order:

1. pass the expensive subtree as `children`/a prop so it's created by a _non_-re-rendering ancestor
2. `React.memo` the child with stable props
3. move the changing state down so the parent doesn't re-render at all

**Tip:** The "children created by an outer component don't re-render when the inner one does" insight (sometimes called the "lift content up" or "component as prop" pattern) is a sophisticated answer that shows you understand element identity, not just memo APIs.

### Q43: How would you architect global state in a multi-tenant dashboard like yours?

**A:** Layer it:

1. **Server state** (orders, invoices, tenant config) → React Query/RTK Query with `tenantId` in the query key for cache isolation, automatic refetch/invalidation, and Suspense support.
2. **Client UI state** (filters, selected rows, panel open) → colocated `useState`, or Zustand/Redux slices with selectors when shared across modules.
3. **Cross-cutting low-frequency** (auth user, theme, locale/`dir`) → Context.

Real-time SignalR pushes invalidate or directly patch the React Query cache (`queryClient.setQueryData`) so the UI updates without a refetch.

**Tip:** The SignalR-into-React-Query-cache pattern is a standout: real-time events update the same cache that components already read, so you get live updates with one source of truth and no duplicated socket-state in Context.

### Q44: What are the correctness rules render functions must follow under concurrent React?

**A:** Render must be **pure**: no mutating props/state/module variables, no side effects (subscriptions, fetches, DOM writes, logging that matters), and the same inputs must produce the same output. Effects (not render) own side effects, and must be idempotent/cleanup-correct because React may mount→unmount→remount (StrictMode simulates this in dev). React may also render a tree and throw it away, or render at a lower priority and discard it, so any side effect during render can fire spuriously or be wasted.

**Tip:** Mention StrictMode's intentional double-invoke of render and the mount/unmount/remount cycle — it's not a bug, it's surfacing impure components and missing effect cleanups that concurrent features would otherwise expose in production.

## Common Mistakes / Red Flags

- Believing a child only re-renders when its props change (ignoring the parent-render and context-change triggers).
- Sprinkling `useMemo`/`useCallback`/`React.memo` everywhere without measuring — adding cost and noise for no benefit.
- Passing inline objects/arrays/functions as props to memoized children, silently defeating the memo.
- Using array index as `key` in reorderable/filterable lists, causing state and DOM to bind to the wrong rows.
- Storing derived state and syncing it with effects instead of computing it during render (two sources of truth, extra renders).
- Putting server data or high-frequency state in Context and watching the whole tree re-render.
- Passing a fresh object as a Context `value` every render (`value={{ user, setUser }}`) without memoizing.
- Forgetting effect cleanup: leaked WebSocket/SignalR connections, intervals, and event listeners — especially across tenant switches.
- Stale closures from `[]` deps or non-functional `setState`, plus fetch effects without `AbortController` causing race conditions where an old response overwrites a new one.
- Rendering 10k DOM rows in an ERP grid instead of virtualizing.
- Reading `window`/`localStorage`/`Date.now()` during render in SSR, causing hydration mismatches.
- Treating Context as a state-management library; reinventing caching/dedup instead of using React Query.
- Optimizing from intuition rather than the Profiler; never re-measuring after a "fix."
- Using `useImperativeHandle`/refs where a declarative prop would do.
- Wrapping event-handler or async errors in an error boundary and expecting them to be caught (they aren't).

## Further Reading

- React docs — "Render and Commit", "Keeping Components Pure", "You Might Not Need an Effect", "Reusing Logic with Custom Hooks" (react.dev/learn).
- React docs — Reference for `memo`, `useMemo`, `useCallback`, `useTransition`, `useDeferredValue`, `useImperativeHandle`, `useSyncExternalStore`, `Suspense`, `lazy`, `createPortal` (react.dev/reference).
- Dan Abramov — "Before You memo()" and "A Complete Guide to useEffect" (overreacted.io).
- "Fixing Race Conditions in React with useEffect" and the React docs section on race conditions / `AbortController`.
- Mark Erikson — "A (Mostly) Complete Guide to React Rendering Behavior" (blog.isquaredsoftware.com).
- Kent C. Dodds — "State Colocation will make your React app faster" and "One simple trick to optimize React re-renders" (kentcdodds.com).
- "React as a UI Runtime" (Dan Abramov) and acdlite's "React Fiber Architecture" notes for the internals.
- react-window / react-virtuoso / TanStack Virtual docs for list and grid virtualization.
- TanStack Query (React Query) docs — server state, query keys, and `setQueryData` for real-time cache patching.
- React 18 working-group notes on automatic batching, concurrent rendering, and Suspense/streaming SSR.
