# Next.js & SSR (51 questions)

> Next.js is the production React framework that powers server rendering, routing, data fetching, and bundling out of the box. This matters for interviews because it forces you to reason about _where_ code runs (server vs client), _when_ HTML is generated (build vs request time), and _how_ caching glues it all together — topics that separate a "React dev" from a "Next.js dev." You have shipped Next.js 14 App Router apps in TypeScript with Tailwind/Chakra: the **Shuhna** frontend and an **NFT marketplace**. Both lean on React Server Components, async data fetching, route handlers, and middleware-guarded routes — so expect questions to probe RSC vs Client Components, the caching layers, and SSR/SSG/ISR trade-offs.

## Quick Revision Checklist

- Next.js = React framework with file-based routing, SSR/SSG/ISR, bundling, image/font optimization, and API routes built in.
- Four rendering strategies: **CSR** (browser), **SSR** (per request on server), **SSG** (at build time), **ISR** (SSG + background re-generation).
- **App Router** (Next 13+, `app/`) uses React Server Components by default; **Pages Router** (`pages/`) is client components + `getServerSideProps`/`getStaticProps`.
- Server Components render on the server only — no hooks, no browser APIs, can be `async` and `await` data; Client Components opt in with `'use client'`.
- Hydration = React attaching event listeners to server-rendered HTML; mismatches happen when server and client render different markup.
- App Router special files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, `route.ts`.
- Four caching layers: **Request Memoization**, **Data Cache**, **Full Route Cache**, **Router Cache**. Know what each caches, where, and how to bust it.
- `fetch` is cached by default in App Router (`force-cache`); use `cache: 'no-store'` or `revalidate` to control it. (Default changed to uncached in Next 15.)
- `export const dynamic = 'force-dynamic'` / `revalidate = N` controls route-level rendering and ISR.
- **Server Actions** (`'use server'`) let you mutate data from the server without writing an API endpoint; called from forms/event handlers.
- **Route Handlers** live in `app/api/.../route.ts` (export `GET`, `POST`, …); legacy **API routes** in `pages/api`.
- **Middleware** (`middleware.ts`) runs on the Edge before a request completes — use it for auth, redirects, rewrites.
- Optimize with `next/image` (lazy load, resize, AVIF/WebP), `next/font` (no layout shift, self-hosted), `next/link` (prefetch).
- `NEXT_PUBLIC_` prefix exposes env vars to the browser; everything else is server-only.
- **Streaming + Suspense**: stream UI in chunks, show `loading.tsx`/`<Suspense>` fallbacks while server components resolve.

## Basic

### Q1: What is Next.js and why use it over plain React (CRA/Vite)?

**A:** Next.js is a React framework built by Vercel that adds server-side rendering, static generation, file-based routing, API routes, code splitting, and built-in optimizations (images, fonts, scripts) on top of React. Plain React (CRA/Vite) ships a client-only SPA: the browser downloads an empty `<div id="root">` and a JS bundle, then renders everything client-side — bad for SEO and slow first paint. Next.js renders HTML on the server/at build time so content is visible immediately and crawlable.

**Tip:** Frame it as "React is a library for building UIs; Next.js is a framework that answers routing, rendering, and data-fetching for you." Note CRA is deprecated — Vite or Next.js are the modern choices.

### Q2: What are the four rendering strategies and when do you use each?

**A:**

- **CSR (Client-Side Rendering):** HTML is empty, JS renders in the browser. Use for highly interactive, auth-gated dashboards where SEO doesn't matter.
- **SSR (Server-Side Rendering):** HTML generated on the server _per request_. Use when data changes per request/user and must be fresh + SEO-friendly (e.g., a personalized feed).
- **SSG (Static Site Generation):** HTML generated _at build time_, served from CDN. Use for content that rarely changes (marketing pages, docs, blog).
- **ISR (Incremental Static Regeneration):** SSG + the page is re-generated in the background after a `revalidate` interval. Use for content that changes occasionally but at scale (product catalog, NFT listings).

**Tip:** The axes are _when HTML is built_ (build vs request) and _how fresh the data is_. SSG is fastest but stalest; SSR is freshest but slowest.

### Q3: What is hydration?

**A:** Hydration is the process where React takes server-rendered (static) HTML in the browser and "attaches" to it — wiring up event listeners and making it interactive — instead of re-creating the DOM from scratch. The server sends ready-to-show HTML for fast First Contentful Paint, then the JS bundle hydrates it so buttons, inputs, etc. work.

**Tip:** Hydration is why an SSR page can _look_ loaded but not be _interactive_ yet (the gap is Time To Interactive). RSCs reduce hydration cost because server components don't ship JS to hydrate.

### Q4: What is a hydration mismatch error and what causes it?

**A:** A hydration mismatch occurs when the HTML React renders on the client differs from what the server sent, so React can't cleanly attach. Common causes: using `Date.now()`/`Math.random()`/`new Date()` during render, reading `window`/`localStorage` during render, browser extensions mutating the DOM, or invalid HTML nesting (`<div>` inside `<p>`). React logs "Text content does not match server-rendered HTML."

**Tip:** Fixes: move browser-only logic into `useEffect`, gate with a mounted flag, or use `suppressHydrationWarning` for unavoidable cases like timestamps.

### Q5: What is file-based routing in Next.js?

**A:** Routes are defined by the filesystem rather than a config. In the App Router, each folder under `app/` is a route segment and a `page.tsx` makes it publicly accessible (`app/about/page.tsx` → `/about`). In the Pages Router, files under `pages/` map directly (`pages/about.tsx` → `/about`). No manual `<Route>` definitions like React Router.

**Tip:** In App Router, _folders_ define the URL; only `page.tsx`/`route.ts` are routable — other files (`layout`, `loading`) are infrastructure.

### Q6: How do you create a dynamic route?

**A:** Wrap the segment name in square brackets. App Router: `app/blog/[slug]/page.tsx` matches `/blog/hello`; the value arrives via `params`. Pages Router: `pages/blog/[slug].tsx`, read via `useRouter().query` or `getStaticPaths`/`getServerSideProps`.

**Tip:**

```tsx
// app/products/[id]/page.tsx
export default async function Product({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return <h1>{product.name}</h1>;
}
```

In Next 15, `params` is a Promise and must be awaited.

### Q7: What are catch-all and optional catch-all routes?

**A:** `[...slug]` is a **catch-all** route that matches one or more segments (`app/docs/[...slug]` matches `/docs/a/b/c`, giving `params.slug = ['a','b','c']`). `[[...slug]]` is an **optional catch-all** that _also_ matches the parent path `/docs` (slug is `undefined`). Useful for docs sites or CMS-driven pages with arbitrary nesting.

**Tip:** Remember: single brackets = one segment, `[...x]` = one+, `[[...x]]` = zero+.

### Q8: How do you navigate between pages?

**A:** Use the `next/link` component for client-side navigation (`<Link href="/about">`), which prefetches and avoids full reloads. For programmatic navigation, use `useRouter` from `next/navigation` (App Router) or `next/router` (Pages Router): `router.push('/dashboard')`.

**Tip:** `useRouter` import path differs by router — `next/navigation` (App) vs `next/router` (Pages). Mixing them up is a classic bug.

### Q9: What is the difference between `next/link` prefetching and a normal `<a>` tag?

**A:** `<a>` triggers a full page reload (re-downloads HTML, re-runs all JS). `<Link>` does client-side navigation: it prefetches the linked route's code/data when the link enters the viewport (in production), then swaps content without a full reload, preserving state.

**Tip:** In App Router, `<Link>` prefetches the route's RSC payload; you can disable with `prefetch={false}`.

### Q10: What are environment variables in Next.js and what does `NEXT_PUBLIC_` do?

**A:** Env vars live in `.env.local`/`.env`. By default they're **server-only** and never sent to the browser. Prefixing with `NEXT_PUBLIC_` inlines the value into the client bundle at build time, making it accessible in browser code. Use it only for non-secret values (public API base URL, analytics ID).

**Tip:** A leaked secret in `NEXT_PUBLIC_STRIPE_SECRET` is a classic red flag. Public vars are baked at _build_ time, so changing them requires a rebuild.

## Intermediate

### Q11: Pages Router vs App Router — what's the difference?

**A:** **Pages Router** (`pages/`, the original) uses client components by default with special data-fetching functions (`getServerSideProps`, `getStaticProps`, `getStaticPaths`). **App Router** (`app/`, stable in Next 13.4+) is built on React Server Components: components are server-rendered by default, data is fetched directly in `async` components, and it adds nested layouts, streaming, `loading.tsx`/`error.tsx`, and Server Actions. App Router is the recommended approach for new apps.

**Tip:** They can coexist in one project. Say you built Shuhna/NFT marketplace on App Router and explain why: nested layouts, RSC, streaming.

### Q12: What is a layout in the App Router, and what are nested layouts?

**A:** `layout.tsx` wraps all pages within its segment and **persists across navigation** (it doesn't re-render/remount when child routes change). The root layout (`app/layout.tsx`) is required and defines `<html>`/`<body>`. Nested layouts let each route segment have its own layout that nests inside parents — e.g., a `dashboard/layout.tsx` adds a sidebar to all dashboard routes while inheriting the root layout.

**Tip:** Layouts preserve state (scroll, form input) across navigation; `template.tsx` is like a layout but _re-mounts_ on every navigation. Use template when you need fresh state/effects per navigation.

### Q13: What do `loading.tsx`, `error.tsx`, and `not-found.tsx` do?

**A:**

- **`loading.tsx`** — an instant loading UI shown via Suspense while the segment's server component fetches data (streaming-enabled).
- **`error.tsx`** — a client component error boundary that catches errors in the segment; receives `error` and `reset` props. Must be `'use client'`.
- **`not-found.tsx`** — UI rendered when `notFound()` is called or a route doesn't match.

**Tip:** `error.tsx` does NOT catch errors in the layout at its own level — you need an error boundary in a parent segment for that. The root needs `global-error.tsx`.

### Q14: What are route groups and why use them?

**A:** A folder wrapped in parentheses `(marketing)` is a **route group**: it organizes routes and lets you apply a shared layout _without_ adding a segment to the URL. So `app/(shop)/products/page.tsx` is still `/products`. Useful for grouping routes by section or giving subsets of routes different root layouts.

**Tip:** Common pattern: `(auth)` group with its own minimal layout for login/register, and `(app)` group with the full nav layout.

### Q15: What are parallel and intercepting routes?

**A:** **Parallel routes** (`@slot` folders) render multiple pages in the same layout simultaneously — e.g., `@team` and `@analytics` slots in a dashboard layout, each with independent loading/error states. **Intercepting routes** (`(.)`, `(..)`, `(...)`) load a route in the _current_ layout context instead of navigating away — classic use is showing a photo in a modal when clicking from a feed, while a direct URL load shows the full page.

**Tip:** Instagram-style "photo in a modal" is the canonical intercepting-route example; pair it with a parallel `@modal` slot.

### Q16: What are React Server Components (RSC) vs Client Components?

**A:** **Server Components** (default in App Router) render only on the server, never ship their JS to the browser, can be `async` and directly access databases/secrets/filesystem, but cannot use hooks (`useState`, `useEffect`) or browser APIs or event handlers. **Client Components** opt in with `'use client'` at the top of the file; they run on the server for the initial HTML _and_ in the browser (hydration), can use state, effects, and event handlers, but can't be `async` or access server-only resources.

**Tip:** Default to Server Components; push `'use client'` to the leaves (interactive bits). You can pass server-fetched data as props from a server component into a client component.

### Q17: When does each type of component run?

**A:** Server Components run **only on the server** (at build time for static, at request time for dynamic) and produce an RSC payload, never re-running in the browser. Client Components run **twice**: once on the server to generate initial HTML (for SSR/SEO), then in the browser to hydrate and on every subsequent interaction.

**Tip:** A common misconception is that `'use client'` means "client only" — it actually means "this and its imports are also bundled for the client," but it still SSRs the first render.

### Q18: Can a Server Component import a Client Component and vice versa?

**A:** A Server Component **can** render a Client Component (pass serializable props). A Client Component **cannot** import a Server Component directly, but it can receive one as a `children`/prop (the "donut pattern") — the server component is rendered on the server and passed in as already-rendered content.

**Tip:**

```tsx
// Allowed: server passes a server component as children to a client wrapper
<ClientCarousel>
  <ServerImage src={url} />
</ClientCarousel>
```

### Q19: How do you fetch data in an async Server Component?

**A:** Make the component `async` and `await` the data directly — no `useEffect`, no loading state, no API layer needed for your own server.

**Tip:**

```tsx
// app/products/page.tsx (Server Component)
async function getProducts() {
  const res = await fetch("https://api.shuhna.example/products", {
    next: { revalidate: 60 }, // ISR: re-fetch at most every 60s
  });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Q20: How do you control caching with `fetch` in the App Router?

**A:** The extended `fetch` accepts cache options:

- `fetch(url)` — in Next 13/14 defaults to `cache: 'force-cache'` (cached indefinitely); in Next 15 the default is uncached.
- `cache: 'no-store'` — never cache; refetch every request (dynamic).
- `next: { revalidate: 60 }` — cache but revalidate after 60 seconds (ISR).
- `next: { tags: ['products'] }` — tag for on-demand invalidation via `revalidateTag('products')`.

**Tip:** Know the version difference — interviewers love the "fetch is cached by default" gotcha and that Next 15 reversed it.

### Q21: How do you cache non-fetch work (like a DB/ORM query) in the App Router?

**A:** `fetch` caching only covers HTTP requests. To cache **arbitrary async functions** — Prisma/Mongo queries, SDK calls, heavy computations — wrap them in `unstable_cache` (or use the newer `'use cache'` directive with `cacheLife`/`cacheTag`):

```ts
import { unstable_cache } from "next/cache";

const getPostsByAuthor = unstable_cache(
  async (authorId: string) => db.post.findMany({ where: { authorId } }),
  ["posts-by-author"],
  { tags: ["posts"], revalidate: 3600 },
);
```

The function arguments become part of the cache key, so different `authorId`s cache separately. Invalidate it the same way as fetch: `revalidateTag('posts')`.

**Tip:** Reach for `unstable_cache`/`'use cache'` for cross-request caching of DB/SDK work that doesn't go through `fetch`.

### Q22: What does `export const dynamic` / `revalidate` / `force-dynamic` do?

**A:** These are **route segment config** exports controlling how the route renders:

- `export const dynamic = 'force-dynamic'` — opt the whole route into per-request SSR (disables caching).
- `export const dynamic = 'force-static'` — force static rendering.
- `export const revalidate = 60` — set the ISR revalidation window for the segment.
- `export const fetchCache`, `runtime = 'edge'|'nodejs'`, `dynamicParams`, etc.

**Tip:** Using a dynamic function (`cookies()`, `headers()`, `searchParams`) automatically opts the route into dynamic rendering — you don't always need `force-dynamic`.

### Q23: How does data fetching work in the Pages Router with `getServerSideProps`?

**A:** `getServerSideProps` runs on the server for **every request**, fetches data, and passes it as props to the page (SSR). It has access to `req`/`res`/`query`/`params`.

**Tip:**

```tsx
// pages/products.tsx
export async function getServerSideProps(context) {
  const res = await fetch("https://api.shuhna.example/products");
  const products = await res.json();
  return { props: { products } }; // can also return { notFound: true } or { redirect }
}

export default function Products({ products }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Q24: What is `getStaticProps` and `getStaticPaths`?

**A:** `getStaticProps` runs at **build time** to generate a static page (SSG); add `revalidate: N` to enable ISR. For dynamic routes, `getStaticPaths` tells Next which paths to pre-render at build time and how to handle unbuilt paths via `fallback` (`false` → 404, `true` → render on demand with a loading state, `'blocking'` → SSR on first hit then cache).

**Tip:** `getStaticPaths` is only for dynamic routes (`[id]`) using `getStaticProps`. `fallback: 'blocking'` is the usual choice for large catalogs.

### Q25: What is `getInitialProps` and why is it discouraged?

**A:** `getInitialProps` is the original (Next 9 and earlier) data-fetching method that runs on both server and client and disables Automatic Static Optimization for the whole app. It's discouraged because it can't distinguish SSR from SSG and hurts performance. Prefer `getServerSideProps`/`getStaticProps` (Pages Router) or async server components (App Router).

**Tip:** Only real reason to know it: legacy `_app.tsx`/`_document.tsx` customizations and interview trivia.

### Q26: What is Incremental Static Regeneration (ISR)?

**A:** ISR lets you update static pages _after_ build without rebuilding the whole site. The page is served from cache; after the `revalidate` window elapses, the next request triggers a background regeneration, and subsequent requests get the fresh version (stale-while-revalidate). You can also trigger it on-demand with `revalidatePath`/`revalidateTag`.

**Tip:** Best of both worlds: CDN-fast like SSG, but data stays reasonably fresh. Great for the NFT marketplace listings or a product catalog.

### Q27: What are Route Handlers in the App Router?

**A:** Route Handlers live in `app/.../route.ts` and define API endpoints by exporting functions named after HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.). They use the Web `Request`/`Response` APIs and replace `pages/api`.

**Tip:**

```ts
// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const orders = await db.order.findMany();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const order = await db.order.create({ data: body });
  return NextResponse.json(order, { status: 201 });
}
```

### Q28: What are API routes in the Pages Router?

**A:** Files under `pages/api/` export a default handler `(req, res) => {}` that runs server-side and never ships to the client. You branch on `req.method` to handle different verbs and respond with `res.status().json()`.

**Tip:**

```ts
// pages/api/hello.ts
export default function handler(req, res) {
  if (req.method === "POST") return res.status(201).json({ created: true });
  res.status(200).json({ message: "hello" });
}
```

This is the legacy equivalent of route handlers.

### Q29: What is `next/image` and what does it optimize?

**A:** `next/image` is an `<img>` replacement that automatically resizes, optimizes (serving modern formats like WebP/AVIF), and lazy-loads images, and reserves space to prevent layout shift (CLS). It serves correctly sized images per device via `srcset`.

**Tip:**

```tsx
import Image from "next/image";

<Image
  src="/nft/cover.png"
  alt="NFT cover"
  width={600}
  height={400}
  priority // eager-load above-the-fold (good for LCP)
  placeholder="blur"
/>;
```

Remote domains must be allowlisted in `next.config.js` `images.remotePatterns`.

### Q30: What is `next/font` and why use it?

**A:** `next/font` self-hosts fonts (including Google Fonts) at build time, eliminating render-blocking external requests and preventing layout shift by computing fallback metrics. No request is made to Google at runtime (privacy + speed).

**Tip:**

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
// <body className={inter.className}>
```

### Q31: How does the Metadata API help SEO?

**A:** App Router supports `export const metadata` (static) or `export async function generateMetadata()` (dynamic) to set `<title>`, `<meta>`, Open Graph, Twitter cards, canonical URLs, etc. without manually managing `<head>`. Server rendering ensures crawlers see this content.

**Tip:**

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);
  return { title: product.name, openGraph: { images: [product.image] } };
}
```

In Pages Router you used `next/head` instead.

## Advanced

### Q32: Explain the four caching layers in the App Router.

**A:**

1. **Request Memoization** — within a _single render pass_, identical `fetch` calls are deduped so you can fetch the same data in multiple components without extra requests. Lives in React, per request.
2. **Data Cache** — persists `fetch` results _across requests and deployments_ on the server; controlled by `cache`/`revalidate`/tags. This is what powers ISR.
3. **Full Route Cache** — caches the rendered HTML + RSC payload of statically-rendered routes at build time on the server, served without re-rendering.
4. **Router Cache** (client-side) — an in-memory cache in the browser of visited route segments' RSC payloads, so back/forward and revisits are instant.

**Tip:** Order matters: Memoization (per-render) → Data Cache (server, persistent) → Full Route Cache (server HTML) → Router Cache (client). This is _the_ big App Router interview question.

### Q33: How do you invalidate / bust each cache?

**A:**

- **Request Memoization** — automatic, cleared after each render; not manually controlled.
- **Data Cache** — `revalidate` time window, or on-demand `revalidateTag('tag')` / `revalidatePath('/path')`, or `cache: 'no-store'`.
- **Full Route Cache** — invalidated by revalidating the Data Cache it depends on, redeploying, or making the route dynamic.
- **Router Cache** — `router.refresh()`, calling a Server Action, `revalidatePath`/`revalidateTag` (which also clears router cache), or navigation/time-based expiry.

**Tip:** `revalidateTag`/`revalidatePath` (usually called inside a Server Action) is the cleanest production invalidation pattern.

### Q34: What are Server Actions and how do they work?

**A:** Server Actions are async functions marked with `'use server'` that run **only on the server** but can be invoked from client components or `<form action={...}>` without manually writing an API route. Next handles serialization and the network call. They're used for mutations (create/update/delete) and integrate with `revalidatePath`/`revalidateTag` and `redirect`.

**Tip:**

```tsx
// app/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData) {
  const item = formData.get("item") as string;
  await db.order.create({ data: { item } });
  revalidatePath("/orders");
}

// In a component:
<form action={createOrder}>
  <input name="item" />
  <button type="submit">Add</button>
</form>;
```

### Q35: What is Next.js middleware and what can it do?

**A:** `middleware.ts` (at the project root) runs on the **Edge runtime before a request is completed** — before caching/rendering. It can rewrite, redirect, set headers/cookies, and short-circuit responses. Common uses: authentication guards, A/B testing, geo-based routing, locale detection. A `config.matcher` limits which paths it runs on.

**Tip:** Middleware runs on the Edge, so it can't use Node APIs or do heavy DB work — keep it light (token presence/format checks, not full session lookups).

### Q36: Show a middleware auth guard.

**A:**

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtected && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
```

**Tip:** Verify only cheap claims at the edge; do full authorization in the server component/route handler that actually reads data.

### Q37: What are the constraints of Next.js middleware, and how do you verify a JWT inside it?

**A:** Middleware runs on the **Edge runtime**, which imposes hard limits:

- No Node APIs — no `fs`, no Node `crypto`, no native modules.
- Can't open a pooled TCP DB connection (use an HTTP driver like Neon/Upstash instead).
- Can't read the POST request body — only headers, cookies, and the URL.
- Must be fast: it runs on **every** matched request (`config.matcher`).

For JWTs use `jose` (`jwtVerify`), which is edge-compatible — **not** `jsonwebtoken`, which is Node-only and will break on the edge:

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  try {
    if (!token) throw new Error("missing token");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
```

**Tip:** "Use `jose`, not `jsonwebtoken`, in middleware" is a classic gotcha; for DB access on the edge use an HTTP driver (Neon/Upstash), not a pooled TCP client.

### Q38: What are common authentication patterns in Next.js?

**A:**

- **Cookie/session-based:** set an HTTP-only, Secure, SameSite cookie on login; read it server-side. HTTP-only prevents XSS token theft.
- **Middleware-protected routes:** redirect unauthenticated users at the edge (cheap presence check) before the page renders.
- **Server-side session check:** in server components/route handlers read `cookies()` and validate the session against the store/DB.
- **Libraries:** Auth.js (NextAuth), Clerk, Lucia for the heavy lifting.

**Tip:** Don't store JWTs in `localStorage` (XSS risk). Prefer HTTP-only cookies. Use middleware for the gate + server validation for the truth.

### Q39: How do streaming and Suspense work in the App Router?

**A:** Next.js can stream HTML to the browser in chunks instead of waiting for all data. Wrap a slow async server component in `<Suspense fallback={...}>` (or use `loading.tsx`) and Next sends the shell + fallback immediately, then streams in the resolved component when its data is ready. This improves TTFB and perceived performance.

**Tip:**

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <Header /> {/* fast, shown immediately */}
      <Suspense fallback={<Skeleton />}>
        <SlowFeed /> {/* streams in when ready */}
      </Suspense>
    </>
  );
}
```

### Q40: What are Core Web Vitals and how does Next.js help?

**A:** Core Web Vitals are Google's UX metrics: **LCP** (Largest Contentful Paint, loading), **INP** (Interaction to Next Paint, responsiveness — replaced FID), and **CLS** (Cumulative Layout Shift, visual stability). Next.js helps via SSR/SSG (fast LCP), `next/image` (sized images → low CLS, optimized LCP), `next/font` (no font swap shift), automatic code splitting and RSC (less JS → better INP).

**Tip:** Set `priority` on the LCP image and reserve dimensions on all media to protect CLS.

### Q41: How does code splitting work in Next.js?

**A:** Next automatically splits JavaScript per route, so visiting `/about` only loads that page's bundle, not the whole app. You can further split with `next/dynamic` (`dynamic(() => import('./Heavy'), { ssr: false })`) to lazy-load heavy or client-only components. Server Components also reduce shipped JS since their code never reaches the browser.

**Tip:** `next/dynamic` with `ssr: false` is the go-to for browser-only libs (charts, maps, wallet connectors in the NFT app).

### Q42: What is the difference between the Edge and Node.js runtimes?

**A:** The **Node.js runtime** (default) has full Node APIs (fs, crypto, DB drivers) but cold-starts slower and runs in fewer regions. The **Edge runtime** runs on a lightweight V8-based environment distributed globally — very low latency, but a limited API subset (no native Node modules). Choose per route via `export const runtime = 'edge'`. Middleware always runs on Edge.

**Tip:** Edge for fast, lightweight logic (auth checks, redirects, personalization); Node for anything needing full Node APIs or heavy libraries.

### Q43: How do you deploy a Next.js app (Vercel vs standalone)?

**A:** **Vercel** is the zero-config first-party host: it maps SSR to serverless/edge functions, SSG to the CDN, ISR to its cache, and handles image optimization automatically. For self-hosting, use `output: 'standalone'` in `next.config.js` to produce a minimal Node server bundle (with only needed `node_modules`), ideal for Docker. You then run `node server.js`.

**Tip:** Standalone + Docker is the common "we don't want vendor lock-in" answer. Mention you still need to run `next start` (or the standalone server) — `next build` alone isn't a server.

### Q44: When self-hosting Next.js with multiple replicas, why can ISR serve stale/inconsistent pages, and how do you fix it?

**A:** By default the ISR / Data Cache lives on the **pod's local filesystem**. With N replicas, each has its **own** cache, so `revalidatePath`/`revalidateTag` only refreshes the replica that handled that request — the other replicas keep serving the old page, and users hit different versions depending on which pod they land on. The fix is a **shared `cacheHandler`** configured in `next.config.js`, backed by Redis or S3 so all replicas read/write one cache:

```js
// next.config.js
module.exports = {
  cacheHandler: require.resolve("@neshca/cache-handler"), // Redis-backed
  cacheMaxMemorySize: 0, // disable the default in-memory cache
};
```

On Vercel this is managed for you (a global, shared cache), so the gotcha is specific to self-hosted Docker/Kubernetes setups.

**Tip:** Name the shared `cacheHandler` config + Redis (e.g. `@neshca/cache-handler`) as the fix; contrast Vercel's global managed cache with the per-pod local cache when self-hosting.

### Q45: What is `generateStaticParams` and how does it relate to `getStaticPaths`?

**A:** `generateStaticParams` is the App Router equivalent of `getStaticPaths`: it runs at build time to pre-render dynamic route segments. Return an array of param objects and Next statically generates those pages; `dynamicParams` (default `true`) controls whether unlisted params render on demand or 404.

**Tip:**

```tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
```

### Q46: How do `cookies()` and `headers()` work in Server Components?

**A:** Imported from `next/headers`, they read the incoming request's cookies/headers on the server. Using them automatically opts the route into **dynamic rendering** (since the output now depends on the request). In Server Components/route handlers, `cookies()` is read-only; you can _set_ cookies only in Server Actions or route handlers.

**Tip:** In Next 15 these are async (`await cookies()`). A read-only `cookies().set(...)` in a server component throws — set them in an action/handler instead.

### Q47: How do you handle errors and not-found programmatically?

**A:** Call `notFound()` (from `next/navigation`) to render the nearest `not-found.tsx` (sends a 404). Throw an error in a server component to trigger the nearest `error.tsx` boundary. `redirect()`/`permanentRedirect()` issue redirects mid-render.

**Tip:**

```tsx
import { notFound } from "next/navigation";
const product = await getProduct(id);
if (!product) notFound();
```

### Q48: What is the difference between `revalidatePath` and `revalidateTag`?

**A:** Both invalidate the Data Cache (and the relevant route caches). `revalidatePath('/orders')` invalidates everything cached for a specific route path. `revalidateTag('orders')` invalidates all `fetch` calls tagged with `'orders'`, regardless of which routes used them — more granular and decoupled from URL structure.

**Tip:** Tag-based is preferred for shared data used across many routes; path-based for a single, well-known page.

### Q49: How do you pass server data to client components correctly?

**A:** Fetch in a Server Component and pass the result as **serializable props** to a Client Component. Props crossing the server→client boundary must be JSON-serializable (no functions, classes, Dates round-trip as needed, no `Map`/`Set` directly). Alternatively, share data via React Context provided from a client component near the root.

**Tip:** "Functions/Dates/class instances can't be passed as props to client components" is a frequent gotcha — serialize or transform first.

### Q50: What is the RSC payload?

**A:** The RSC (React Server Component) payload is a compact, streaming binary-ish description of the server-rendered component tree — the rendered server components, placeholders for client components, and the props passed to them. The client uses it to reconcile the DOM and know where/how to hydrate client components. It's also what the Router Cache stores for instant navigation.

**Tip:** It's _not_ HTML and _not_ raw JSON — it's React's serialized tree format streamed to the client.

### Q51: How do you mix SSG and dynamic data on the same page?

**A:** Render the static shell as a server component and isolate the dynamic part in a child component that uses a dynamic function or uncached fetch, wrapped in `<Suspense>`. This is **Partial Prerendering (PPR)** — the static shell is served instantly from cache while the dynamic hole streams in. PPR is experimental in Next 14/15.

**Tip:** Mention PPR as the future direction that unifies static + dynamic without choosing one per route.

## Common Mistakes / Red Flags

- **Putting `'use client'` at the top of the tree.** This pulls the whole subtree to the client, killing RSC benefits. Push `'use client'` to leaf interactive components.
- **Using `useState`/`useEffect`/`onClick` in a Server Component.** Throws an error — those require a Client Component.
- **`async` Client Components.** Client Components can't be async; only Server Components can `await` directly. Fetch in a server parent or use a data library client-side.
- **Forgetting `fetch` is cached by default (Next 13/14).** Stale data because you didn't set `no-store`/`revalidate`. (And forgetting Next 15 flipped the default the other way.)
- **Reading `window`/`localStorage` during render** → hydration mismatch. Move to `useEffect`.
- **Leaking secrets via `NEXT_PUBLIC_`.** Any `NEXT_PUBLIC_` var is shipped to the browser; never put secrets there.
- **Doing heavy work / DB calls in middleware.** It runs on the Edge per request; keep it to cheap checks, do real auth in the server.
- **Confusing import paths:** `next/navigation` (App Router) vs `next/router` (Pages Router) for `useRouter`.
- **Using `<img>` instead of `next/image`,** losing optimization, lazy-loading, and CLS protection.
- **Expecting `error.tsx` to catch its own layout's errors.** It only catches errors below it; layout errors need a parent boundary (or `global-error.tsx` at the root).
- **Passing non-serializable props (functions, class instances) to client components.**
- **Thinking `next build` runs a server.** SSR/ISR need `next start` (or the standalone server) — build alone just produces artifacts.
- **Forgetting `generateStaticParams`/`getStaticPaths` for dynamic SSG routes,** so pages aren't pre-rendered (or 404 with `fallback: false`).
- **Calling `cookies().set()` in a Server Component** — only allowed in Server Actions/Route Handlers.

## Further Reading

- App Router & RSC: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Caching deep dive: https://nextjs.org/docs/app/building-your-application/caching
- Data fetching & Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching
- Rendering strategies overview: https://nextjs.org/docs/app/building-your-application/rendering
