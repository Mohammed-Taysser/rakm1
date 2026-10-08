# State Management (33 questions)

> State management is where most React interviews separate juniors from seniors. It's easy to memorize Redux boilerplate; it's much harder to articulate _which_ tool fits _which_ kind of state. I've lived the whole evolution in production: classic **Redux + redux-thunk** in older e-commerce apps (Rosine), **Redux Toolkit** in POS apps where I cut boilerplate dramatically with `createSlice`/`configureStore`, **React Query (TanStack Query)** in Admin Coffee where I stopped dumping API responses into Redux and let a real server-state cache handle fetching/caching/invalidation, and the **Context API** in Dynamic SaaS and Nova ERP for cross-cutting concerns like auth and theme. The single most valuable thing I can say in an interview is the modern consensus: **server state belongs in React Query, not Redux** — pair React Query for server data with a small client-state tool (Context, Zustand, or RTK for genuinely complex client state). That nuance is what interviewers are listening for.

## Quick Revision Checklist

- State has _kinds_: local (component), global/client (shared UI), server (cached remote data), URL (router/query params), and form state — each wants a different tool.
- **Prop drilling** = passing props through components that don't use them just to reach a deep child; Context or composition fixes it.
- **Context is a dependency-injection / distribution mechanism, NOT a state manager** — it has no caching, no updates batching, no selectors; every consumer re-renders when the value changes.
- Split contexts by concern and by state-vs-dispatch to avoid re-rendering consumers that only dispatch.
- Redux core: single immutable store (single source of truth), actions (plain objects with `type`), pure reducers `(state, action) => newState`, `dispatch`, unidirectional data flow.
- **Reducers must be pure** — no mutation, no side effects, no async; side effects live in middleware (thunk/saga).
- **Redux Toolkit is the official, recommended way to write Redux** — `configureStore`, `createSlice` (uses Immer so you "mutate" safely), `createAsyncThunk`, and `RTK Query`.
- **React Query owns server state**: queries, mutations, automatic caching, background refetch, `staleTime` vs `gcTime`, invalidation, optimistic updates.
- `staleTime` = how long data is considered fresh (no refetch); `gcTime` (formerly `cacheTime`) = how long unused data stays in cache before garbage collection.
- **Don't put server data in Redux** — you'll reinvent caching, loading flags, and invalidation badly. Use React Query/SWR.
- Decision framework: local first (`useState`/`useReducer`) → Context for low-frequency global (auth/theme) → Zustand/Jotai for frequent client state → RTK for large complex client state; **server data → React Query** regardless.
- **Memoized selectors (reselect / `createSelector`)** prevent unnecessary re-renders and compute derived state once.
- Normalize relational state (`{ ids: [], entities: {} }`) to avoid duplication and deep updates; RTK has `createEntityAdapter`.
- **Derived state should be computed, not stored** — storing it invites bugs from getting out of sync.
- Persist deliberately with `redux-persist`/localStorage; never persist tokens to `localStorage` blindly (XSS risk).

## Basic

### Q1: What is "state" in a React app, and what are the different kinds?

**A:** State is any data that changes over time and affects what the UI renders. The senior framing is that not all state is the same — categorizing it tells you which tool to reach for:

- **Local/component state** — owned by one component (`useState`, `useReducer`). e.g. an input value, a modal open/closed flag.
- **Global/client state** — shared across many components, not from a server. e.g. theme, current user/auth, a shopping cart before checkout, UI preferences. (Context, Zustand, Redux.)
- **Server/remote state** — data that lives on a server and is _cached_ on the client. e.g. product lists, orders. It's asynchronous, can become stale, and is owned elsewhere. (React Query / SWR.)
- **URL state** — data encoded in the route/query string. e.g. `?page=2&sort=price`, the current route. (React Router, search params.)
- **Form state** — values, touched/dirty flags, validation errors. (React Hook Form, Formik, or local state.)

**Tip:** Saying "there are different kinds of state and each wants a different tool" up front signals seniority instantly. The biggest real-world mistake is treating server state like client state and stuffing it into Redux.

### Q2: What is prop drilling and why is it a problem?

**A:** Prop drilling is passing data through multiple layers of intermediate components that don't actually use it, just to deliver it to a deeply nested child.

```jsx
// user is drilled through Page -> Layout -> Header -> Avatar
<Page user={user}>
  <Layout user={user}>
    <Header user={user}>
      <Avatar user={user} />
```

Problems: intermediate components are coupled to props they don't care about, refactoring is painful, and renaming/adding a prop touches every layer.

**Tip:** Solutions in order of preference:

1. **component composition** (pass JSX as `children` so the data stays at the top)
2. **Context** for genuinely cross-cutting data (auth/theme)
3. a state library

Mention composition first — interviewers like that you don't reach for Context immediately.

### Q3: What is the Context API and how do you use it?

**A:** Context lets you share a value across a component subtree without passing props manually at every level. Three pieces:

```jsx
// 1. create
const ThemeContext = createContext("light");

// 2. provide
function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}

// 3. consume
function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme}
    </button>
  );
}
```

**Tip:** I used Context in Dynamic SaaS and Nova ERP for theme and auth — exactly the right use case: low-frequency, app-wide values.

### Q4: Is the Context API a state management library? Why or why not?

**A:** No. Context is a **distribution / dependency-injection mechanism** — it solves prop drilling, not state management. It has _no_ built-in state; you still hold state with `useState`/`useReducer` and pass it through Context. What it lacks compared to a real state manager:

- No selective subscription — every consumer re-renders when the context value changes (no built-in selectors).
- No caching, no async handling, no devtools/time-travel, no middleware.
- No batching or update optimization for high-frequency updates.

**Tip:** A great one-liner: "Context is a transport mechanism for state, not a state manager. It's perfect for low-frequency global values like theme and auth, but it's the wrong tool for high-frequency updates or server data."

### Q5: What is the core idea behind Redux?

**A:** Redux is a predictable state container built on three principles:

1. **Single source of truth** — the whole app state lives in one immutable store object.
2. **State is read-only** — you change it only by dispatching **actions** (plain objects describing _what happened_).
3. **Changes are made with pure functions** — **reducers** take the previous state and an action and return the _next_ state.

```js
// action
{ type: 'cart/itemAdded', payload: { id: 42, qty: 1 } }

// reducer (pure)
function cartReducer(state = { items: [] }, action) {
  switch (action.type) {
    case 'cart/itemAdded':
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
}
```

**Tip:** Emphasize _predictability and traceability_ — every state change is an explicit, logged, replayable action. That's why Redux shines for complex client state with rich devtools needs.

### Q6: Walk me through the Redux data flow.

**A:** It's strictly unidirectional:

1. UI event fires → component calls `dispatch(action)`.
2. The store passes `(currentState, action)` to the **root reducer**.
3. The reducer returns a **new** state object (immutably).
4. The store saves the new state and notifies subscribers.
5. Connected components read the new state (via `useSelector`) and re-render if their slice changed.

**Tip:** The word interviewers want is **unidirectional** — data flows one way, which is what makes the system predictable and debuggable.

### Q7: Why must Redux reducers be pure, and what does immutability buy you?

**A:** A pure reducer: same input → same output, no side effects, no mutation of arguments. This enables:

- **Time-travel debugging** and action replay (each state is a distinct snapshot).
- **Cheap change detection** — Redux/React compares by reference (`prevState !== nextState`); if you mutate in place the reference doesn't change and components won't re-render.
- Predictable, testable logic.

Mutating state directly is the classic Redux bug: `state.items.push(x)` keeps the same array reference, so `useSelector` thinks nothing changed.

**Tip:** This is _exactly_ the problem Redux Toolkit's Immer solves — see the RTK questions below.

### Q8: What is `useReducer` and when do you use it over `useState`?

**A:** `useReducer` manages local component state with a reducer function — same mental model as Redux but scoped to one component. Reach for it when:

- State has multiple sub-values that change together.
- The next state depends on the previous state in complex ways.
- State transitions are better expressed as named "events" (actions) than scattered setters.

```jsx
const initial = { loading: false, data: null, error: null };
function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_OK":
      return { loading: false, data: action.payload, error: null };
    case "FETCH_ERR":
      return { loading: false, data: null, error: action.error };
    default:
      return state;
  }
}
const [state, dispatch] = useReducer(reducer, initial);
```

**Tip:** "useReducer is local Redux" is a fine soundbite. Use it for complex local state machines (multi-step forms, wizards).

### Q9: How do you combine Context + useReducer as a "mini Redux"?

**A:** Hold state with `useReducer`, distribute both state and `dispatch` via Context. This gives you a Redux-like pattern with zero dependencies — great for medium apps.

```jsx
const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}
export const useCartState = () => useContext(CartStateContext);
export const useCartDispatch = () => useContext(CartDispatchContext);
```

**Tip:** Splitting state and dispatch into two contexts is the key optimization — components that only _dispatch_ (like an "Add to cart" button) never re-render when the cart state changes, because `dispatch` is stable.

## Intermediate

### Q10: What's the performance pitfall with Context, and how do you fix it?

**A:** Every component that calls `useContext` re-renders whenever the Provider's `value` changes — and there's no way to subscribe to _part_ of it. Two common mistakes amplify this:

1. Passing a **new object literal** as `value` on every render — `value={{ user, setUser }}` creates a new reference each render, re-rendering all consumers even if nothing changed.
2. Putting **everything** in one giant context, so unrelated updates re-render unrelated subtrees.

Fixes:

```jsx
// 1. memoize the value
const value = useMemo(() => ({ user, setUser }), [user]);
return <UserContext.Provider value={value}>{children}</UserContext.Provider>;

// 2. split contexts by concern (auth vs theme vs cart)
// 3. split state from dispatch (dispatch is stable, never causes re-renders)
```

**Tip:** For high-frequency state shared widely, Context is the wrong tool — that's where Zustand/Jotai (which support selective subscriptions) win.

### Q11: redux-thunk vs redux-saga — what's the difference and when do you use each?

**A:** Both are middleware for handling **async side effects** (Redux reducers can't be async).

- **redux-thunk** — lets you dispatch a _function_ instead of an action object; that function receives `dispatch` and `getState` and can do async work. Simple, minimal, great for most apps. This is what I used in Rosine and what RTK's `createAsyncThunk` builds on.

```js
const fetchProducts = () => async (dispatch) => {
  dispatch({ type: "products/loading" });
  try {
    const res = await api.get("/products");
    dispatch({ type: "products/loaded", payload: res.data });
  } catch (e) {
    dispatch({ type: "products/error", error: e.message });
  }
};
```

- **redux-saga** — uses generator functions and a declarative effects model (`takeLatest`, `call`, `put`, `fork`). More powerful for complex async flows (debouncing, cancellation, race conditions, long-running watchers) but a steeper learning curve.

**Tip:** "Thunk for most apps; saga when you have complex orchestration like cancellation, polling, or coordinated sequences." Honestly, in 2026 the better answer for _server_ data is React Query, sidestepping both.

### Q12: What is Redux middleware?

**A:** Middleware sits between dispatching an action and the moment it reaches the reducer. It can intercept, delay, transform, or augment actions — used for async (thunk/saga), logging, crash reporting, analytics. Signature: `store => next => action => {...}`. `configureStore` includes thunk and dev-time middleware (immutability + serializability checks) by default.

**Tip:** Mention that RTK auto-adds safety middleware in dev that warns you if you accidentally mutate state or put non-serializable values in the store.

### Q13: What is Redux Toolkit and what problems does it solve?

**A:** RTK is the **official, recommended** way to write Redux. It eliminates the boilerplate and footguns of "hand-written" Redux:

- `configureStore` — sets up the store with good defaults (thunk, devtools, dev middleware) in one call.
- `createSlice` — generates action creators + action types from a reducers object; uses **Immer** so you can write "mutating" code safely.
- `createAsyncThunk` — standardizes async with auto-generated `pending`/`fulfilled`/`rejected` actions.
- `createEntityAdapter` — normalized CRUD helpers.
- **RTK Query** — a full data-fetching/caching layer (the React-Query-style answer built into Redux).

**Tip:** "Nobody should write Redux by hand anymore — RTK is official." I migrated POS apps to RTK and the slice files shrank by more than half.

### Q14: Show a `createSlice` example.

**A:**

```js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], total: 0 },
  reducers: {
    itemAdded(state, action) {
      // looks like mutation, but Immer makes it immutable under the hood
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) existing.qty += 1;
      else state.items.push({ ...action.payload, qty: 1 });
      state.total = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    },
    itemRemoved(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    cartCleared(state) {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { itemAdded, itemRemoved, cartCleared } = cartSlice.actions;
export default cartSlice.reducer;
```

**Tip:** Be ready to explain Immer: inside a slice you mutate a _draft_, and Immer produces a new immutable state. Outside Immer (e.g. a plain reducer), mutation is still a bug.

### Q15: How does Immer let you "mutate" state safely?

**A:** Immer wraps your state in a **draft proxy**. Your "mutations" are recorded against the draft, and Immer produces a brand-new immutable state with structural sharing (unchanged parts keep their references). So you get readable mutation-style code _and_ correct immutability/reference changes for change detection.

**Tip:** Caveat: don't both mutate the draft _and_ return a value from the same reducer — pick one. And Immer only applies inside RTK reducers/`createReducer`, not everywhere.

### Q16: Show `createAsyncThunk` for fetching data.

**A:**

```js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

export const fetchOrders = createAsyncThunk(
  "orders/fetch",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/orders?user=${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? "Failed");
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.list = a.payload;
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      });
  },
});
```

**Tip:** This is the canonical "server data in Redux" pattern — and a perfect moment to add: "but for pure server state I'd reach for React Query or RTK Query, which give caching and invalidation for free instead of me hand-writing loading flags."

### Q17: What are selectors and why use memoized selectors (reselect)?

**A:** A selector is a function that reads a value out of the store: `state => state.cart.items`. Memoized selectors (reselect's `createSelector`) cache the result and only recompute when their inputs change — essential for **derived/computed state** and avoiding wasted re-renders.

```js
import { createSelector } from "@reduxjs/toolkit"; // reselect re-exported

const selectItems = (state) => state.cart.items;
const selectCartTotal = createSelector([selectItems], (items) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0),
);
```

Without memoization, a selector that returns a _new_ array/object each call (e.g. `items.filter(...)`) makes `useSelector` re-render every time, because the reference always differs.

**Tip:** Two wins to name:

1. compute expensive derived values once
2. keep `useSelector` reference-stable so components don't re-render needlessly

### Q18: Why and how do you normalize Redux state?

**A:** For relational/list data, avoid nesting and duplication by storing it like a database: an `entities` lookup keyed by id plus an `ids` array for order.

```js
// normalized
{
  ids: [1, 2, 3],
  entities: { 1: {...}, 2: {...}, 3: {...} }
}
```

Benefits: O(1) lookups/updates by id, no duplicated copies to keep in sync, simpler immutable updates. RTK's `createEntityAdapter` generates this shape plus CRUD reducers and selectors.

**Tip:** The anti-pattern is deeply nested arrays where updating one item means spreading through several levels — that's both verbose and bug-prone.

### Q19: What is React Query (TanStack Query) and what problem does it solve?

**A:** React Query is a **server-state** library. It treats remote data as a _cache_ you keep in sync, not as something you own. It handles fetching, caching, deduping, background refetching, stale-while-revalidate, retries, pagination, and invalidation — all the things people badly reimplement in Redux. You stop writing loading/error/data flags by hand.

```jsx
function Products() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products").then((r) => r.data),
    staleTime: 60_000,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <Error msg={error.message} />;
  return <List items={data} />;
}
```

**Tip:** In Admin Coffee I replaced a pile of Redux thunks + slices for API data with React Query and deleted huge amounts of code. The headline interview point: **server state and client state are fundamentally different; React Query is purpose-built for the former.**

### Q20: Explain `staleTime` vs `gcTime` (cacheTime).

**A:**

- **`staleTime`** — how long fetched data is considered **fresh**. While fresh, React Query serves it from cache and will _not_ refetch on mount/focus. Default `0` (immediately stale). Increase it to cut redundant requests.
- **`gcTime`** (formerly `cacheTime`, default 5 min) — once a query has **no active observers** (no component using it), how long the data stays in cache before being garbage-collected. It controls how long _inactive_ data survives, not freshness.

**Tip:** Crisp distinction: "`staleTime` decides when to refetch; `gcTime` decides when to discard unused data." Mixing these up is a common stumble.

### Q21: How do queries, query keys, and refetching work?

**A:** Every query is identified by a **query key** (a serializable array): `['orders', userId]`. The key is the cache identity _and_ the dependency array — change the key and React Query fetches new data. React Query automatically refetches stale queries on **mount, window refocus, and network reconnect** (all configurable). It also **dedupes** simultaneous requests for the same key into one network call.

**Tip:** Structure keys hierarchically (`['todos', { status, page }]`) so you can invalidate broadly (`['todos']`) or narrowly. Treat query keys like cache addresses.

### Q22: Show a mutation with cache invalidation.

**A:**

```jsx
function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newProduct) =>
      api.post("/products", newProduct).then((r) => r.data),
    onSuccess: () => {
      // mark the list stale so it refetches fresh data
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// usage
const { mutate, isPending } = useAddProduct();
<button disabled={isPending} onClick={() => mutate(form)}>
  Add
</button>;
```

**Tip:** `invalidateQueries` is the workhorse — after a write, mark related reads stale and React Query refetches. This is the answer to "how do you keep the UI in sync after a mutation."

### Q23: Show an optimistic update.

**A:** Update the cache _before_ the server responds, then roll back on error.

```jsx
useMutation({
  mutationFn: (todo) => api.patch(`/todos/${todo.id}`, todo),
  onMutate: async (newTodo) => {
    await qc.cancelQueries({ queryKey: ["todos"] });
    const previous = qc.getQueryData(["todos"]);
    qc.setQueryData(["todos"], (old) =>
      old.map((t) => (t.id === newTodo.id ? { ...t, ...newTodo } : t)),
    );
    return { previous }; // context for rollback
  },
  onError: (_err, _newTodo, context) => {
    qc.setQueryData(["todos"], context.previous); // rollback
  },
  onSettled: () => qc.invalidateQueries({ queryKey: ["todos"] }), // resync
});
```

**Tip:** The pattern is **cancel → snapshot → optimistically set → rollback on error → invalidate on settle**. Mentioning the rollback context shows you actually understand it.

## Advanced

### Q24: Why is "don't put server state in Redux" the modern consensus?

**A:** Server data is asynchronous, owned by the server, shared across clients, and goes stale. If you store it in Redux you end up hand-rolling: loading/error flags per request, caching, deduplication, background refetch, invalidation after mutations, retry/pagination — i.e. you rebuild React Query, badly. React Query/SWR give all of that declaratively. Redux is still excellent for **complex client state** (UI, wizards, cross-feature coordination). The modern architecture is:

> **React Query for server state + a small client-state tool (Context / Zustand / RTK) for client state.**

**Tip:** This is _the_ nuance interviewers reward. Phrase it as "separating server state from client state" — it shows you've moved past the 2018 "everything in Redux" mindset. (If the shop is already all-in on Redux, RTK Query gives the same benefits inside the Redux store.)

### Q25: How does the decision framework work — when do you use what?

**A:** My ladder:

1. **Local state** (`useState`/`useReducer`) — start here; most state is local. Don't lift until you must.
2. **URL state** — anything shareable/bookmarkable (filters, pagination, current tab) belongs in the URL.
3. **Context** — low-frequency, app-wide _client_ values: auth, theme, locale, feature flags.
4. **Zustand / Jotai** — frequently-updated client state shared widely, where Context would cause re-render storms and Redux is overkill.
5. **Redux Toolkit** — large apps with complex, interconnected client state, heavy devtools/middleware/time-travel needs, or a big team wanting strict conventions.
6. **React Query / SWR / RTK Query** — _all_ server data, always, regardless of the above.

**Tip:** Lead with "it depends on the _kind_ of state and the _frequency_ of updates," then walk the ladder. Avoid the junior answer "just use Redux for everything."

### Q26: What are Zustand and Jotai, and how do they differ from Redux/Context?

**A:** Lightweight client-state libraries:

- **Zustand** — a tiny store with hooks; you create a store and **subscribe to slices via selectors**, so components only re-render when _their_ slice changes (unlike Context). Minimal boilerplate, no providers required.

```js
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
const count = useStore((s) => s.count); // selective subscription
```

- **Jotai** — **atomic** state: many small independent atoms; components subscribe to specific atoms. Bottom-up model, great for fine-grained reactive state.

vs Context (no selective subscription, re-renders all consumers) and vs Redux (far less boilerplate, no actions/reducers ceremony).

**Tip:** Zustand is the popular "I need shared client state without Redux's weight" choice; Jotai when you want fine-grained, derived atoms. Both solve Context's re-render problem with selectors.

### Q27: SWR vs React Query — how do they compare?

**A:** Both are server-state libraries using stale-while-revalidate. **SWR** (by Vercel) is smaller and simpler — excellent for read-heavy apps, focuses on fetching/caching/revalidation. **React Query** is more feature-rich — first-class **mutations**, query invalidation, devtools, infinite/paginated queries, optimistic update primitives, framework-agnostic (TanStack Query). For complex write-heavy apps I prefer React Query; for simple data fetching SWR is delightfully lean.

**Tip:** Key differentiator: React Query's mutation + invalidation story is more built-out. Both share the core "server state is a cache" philosophy.

### Q28: How do you manage global auth state with JWT and refresh (like Nova ERP)?

**A:** Auth is low-frequency, app-wide client state — Context + `useReducer` fits well, paired with token refresh logic. In Nova ERP I split state and dispatch and exposed a `useAuth` hook:

```jsx
const AuthStateContext = createContext(null);
const AuthDispatchContext = createContext(null);

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.user,
        accessToken: action.token,
        status: "authenticated",
      };
    case "LOGOUT":
      return { user: null, accessToken: null, status: "unauthenticated" };
    case "REFRESH":
      return { ...state, accessToken: action.token };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    accessToken: null,
    status: "loading",
  });

  // on mount: try to restore session via the httpOnly refresh-token cookie
  useEffect(() => {
    api
      .post("/auth/refresh")
      .then((r) =>
        dispatch({
          type: "LOGIN",
          user: r.data.user,
          token: r.data.accessToken,
        }),
      )
      .catch(() => dispatch({ type: "LOGOUT" }));
  }, []);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthStateContext);
  if (ctx === null) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
export const useAuthDispatch = () => useContext(AuthDispatchContext);
```

The **access token** lives in memory (in context), the **refresh token** in an httpOnly, secure cookie. An axios interceptor catches `401`s, calls `/auth/refresh`, dispatches `REFRESH`, and retries the original request.

**Tip:** Security points score big: keep the refresh token in an **httpOnly cookie** (immune to JS/XSS), keep the short-lived access token in memory, and don't persist tokens in `localStorage`. The custom-hook-with-guard pattern (`throw if used outside provider`) is a clean idiom worth showing.

### Q29: How do you avoid unnecessary re-renders in Redux/Context apps?

**A:**

- **Redux:** select the _narrowest_ slice you need (`useSelector(s => s.cart.total)`, not the whole cart); use **memoized selectors** so derived results are reference-stable; for selectors returning new objects, use `createSelector`. RTK's `useSelector` re-renders only when the selected value changes by reference.
- **Context:** split contexts, separate state from dispatch, memoize the `value`, and push state down so fewer components subscribe.
- **General:** `React.memo` for pure components, `useMemo`/`useCallback` for stable references passed to memoized children, and prefer libraries with **selective subscriptions** (Zustand/Jotai) when sharing high-frequency state.

**Tip:** Name the root cause each fix addresses: re-renders come from a _new reference_ of subscribed data. Stable references = fewer renders.

### Q30: Derived/computed state — should you store it or compute it?

**A:** **Compute it, don't store it.** Storing derived values (a cart total, a filtered list, `isValid`) means you must keep it in sync with its sources — miss one update and you have a bug. Instead derive on read with a memoized selector (Redux) or `useMemo` (local). Store only the _minimal source of truth_.

**Tip:** "Single source of truth" applies within a component too: if a value can be calculated from existing state, calculate it. Storing both the items _and_ the total is a classic out-of-sync bug.

### Q31: How do you persist state (redux-persist / localStorage)?

**A:** `redux-persist` saves chosen slices to storage (localStorage by default) and rehydrates them on load — used for carts, user preferences, partial auth. You configure a whitelist/blacklist so you only persist what's needed. With RTK you add its persist reducer and ignore the persist action types in the serializability check.

```js
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "preferences"],
};
const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (gDM) =>
    gDM({ serializableCheck: { ignoredActions: ["persist/PERSIST"] } }),
});
export const persistor = persistStore(store);
```

For React Query, persistence uses the separate `persistQueryClient` plugin (e.g. to localStorage/IndexedDB).

**Tip:** Be deliberate about _what_ you persist — never blindly persist sensitive tokens to `localStorage` (XSS exposure), and consider versioning/migrations so an old persisted shape doesn't crash a new app.

### Q32: What is RTK Query and when would you choose it over React Query?

**A:** RTK Query is Redux Toolkit's built-in data-fetching/caching layer — the same server-state ideas (caching, auto-refetch, invalidation via tags, generated hooks) but living _inside_ the Redux store. You define endpoints in an API slice; it generates `useGetXQuery`/`useAddXMutation` hooks. Choose RTK Query when you're **already on Redux/RTK** and want one consistent ecosystem and devtools. Choose React Query when you _don't_ need Redux at all — it's lighter and you avoid pulling in a whole store just for fetching.

**Tip:** Both prove the same point: server state deserves a dedicated cache. The choice is mostly "are you already invested in Redux or not."

### Q33: How does React Query coexist with Redux/Zustand in one app?

**A:** They split responsibilities: React Query owns **server state** (lists, entities, anything fetched), and Redux/Zustand/Context owns **client state** (UI flags, multi-step form drafts, selections, theme, auth). They don't overlap — you rarely copy server data into the client store. If a component needs both, it reads server data from a `useQuery` hook and client state from `useSelector`/Zustand selector.

**Tip:** This is the practical embodiment of the "separate server and client state" principle and a very strong closing statement in a state-management interview.

## Common Mistakes / Red Flags

- **Putting all server data in Redux** and hand-writing loading/error/cache logic — the #1 dated pattern. Use React Query/RTK Query.
- **Mutating Redux state directly** outside Immer (`state.push(...)`) — breaks change detection; nothing re-renders.
- **Treating Context as a state manager** for high-frequency updates — causes re-render storms across all consumers.
- **New object literal as Context `value`** every render (`value={{...}}`) without `useMemo` — re-renders every consumer.
- **One giant context/store** for everything instead of splitting by concern (and splitting state vs dispatch).
- **Selectors that return new arrays/objects** without `createSelector` — `useSelector` re-renders every time.
- **Storing derived state** (totals, filtered lists) instead of computing it — leads to out-of-sync bugs.
- **Reaching for Redux by default** on a small app — boilerplate and complexity with no payoff.
- **Confusing `staleTime` and `gcTime`** — staleTime = freshness/refetch; gcTime = how long unused cache survives.
- **Forgetting to invalidate** after a mutation — UI shows stale data because nothing told the cache to refetch.
- **Persisting JWTs to `localStorage`** — XSS risk; prefer httpOnly cookies for refresh tokens, memory for access tokens.
- **Async/side effects inside reducers** — reducers must be pure; side effects belong in thunks/sagas/middleware.
- **Denormalized, deeply nested state** that's painful to update immutably — normalize relational data.

## Further Reading

- Redux Toolkit official docs & "Redux Essentials" tutorial: https://redux-toolkit.js.org/ and https://redux.js.org/tutorials/essentials/part-1-overview-concepts
- TanStack Query (React Query) docs: https://tanstack.com/query/latest/docs/framework/react/overview
- Kent C. Dodds, "Application State Management with React" (local-first / colocation philosophy): https://kentcdodds.com/blog/application-state-management-with-react
- Zustand docs (lightweight client state with selectors): https://zustand.docs.pmnd.rs/
