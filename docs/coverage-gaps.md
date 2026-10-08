---
title: "Coverage Gaps"
description: "What the interview-prep pack doesn't cover yet, ranked by priority for 2026 mid/senior full-stack roles."
sidebar_label: "Coverage gaps"
slug: /interview-prep/coverage-gaps
---

The [Interview Prep](interview-prep/01-javascript-core.md) pack is strong on back-end, data, security and infrastructure. Several topics go deeper than a mid-level loop requires. The gaps are on three sides:

- **Frontend craft:** CSS, performance, and live UI-building rounds.
- **2026-specific topics:** AI/LLM features, React 19 Actions, and the React Compiler.
- **Senior-level practices:** estimation, design docs, and leading decisions.

This page tracks what to add next.

## Gaps by priority

| Priority | Topic | Status | Why it matters | Planned file |
| --- | --- | --- | --- | --- |
| High | **AI/LLM engineering:** LLM APIs, streaming, RAG, embeddings and vector DBs (pgvector), tool use, evals, cost and latency, prompt-injection security, AI-assisted dev workflow | Missing | Most product teams now ship AI features, and "how do you use AI tools day to day" is a standard question | `34-ai-llm-engineering` |
| High | **HTML & CSS fundamentals:** box model, specificity, cascade and `@layer`, flexbox vs grid, stacking context, container queries, Tailwind vs CSS-in-JS vs CSS Modules, animations | Missing | Full-stack loops still ask these, and gaps stand out on a React-heavy CV | `35-html-css-fundamentals` |
| High | **Frontend machine-coding rounds:** autocomplete, modal, infinite scroll, tabs, a data table with sort, filter and pagination, nested comments; scoping a take-home and writing its README | Missing | Live UI-building rounds and take-homes are now the most common practical format for full-stack roles | `36-frontend-machine-coding` |
| High | **Web performance playbook:** bundle analysis and splitting, images and fonts, debugging LCP/INP/CLS, Lighthouse vs field data (RUM), the Performance panel, React Profiler, long tasks | Thin, spread across [27](interview-prep/27-web-browser-fundamentals.md), [06](interview-prep/06-nextjs-ssr.md) and [04](interview-prep/04-react-advanced.md) | "This page is slow, how do you debug it?" separates senior candidates | `37-web-performance` |
| High | **Senior engineering practices:** estimation, RFCs and design docs, ADRs, tech-debt prioritization, code-review standards, mentoring, running incidents | Thin, spread across [21](interview-prep/21-behavioral-hr.md), [18](interview-prep/18-devops-git.md) and [32](interview-prep/32-monitoring-observability.md) | Senior loops have a dedicated round on how you lead and make decisions | `38-senior-engineering-practices` |
| Medium | **Build tooling & monorepos:** Vite and HMR, webpack vs Rspack vs Turbopack, ESM/CJS interop, the `exports` field, tree-shaking and `sideEffects`, pnpm/Turborepo/Nx caching | Thin | Seniors who own the repo setup get asked "why is the build slow, or the bundle huge?" | `39-build-tooling-monorepos` |
| Medium | **Cloud & infra:** an AWS service map (ECS, Lambda, S3, CloudFront, RDS, IAM, SQS), serverless trade-offs, Kubernetes objects, Terraform/CDK, Vercel/Fly | Thin, one Q each in [18](interview-prep/18-devops-git.md) | "How would you deploy this?" goes past Docker Compose | `40-cloud-aws-infra` |
| Medium | **Payments integration:** Stripe PaymentIntents and Checkout, 3-D Secure/SCA, webhook signatures and replays, refunds, subscriptions, regional gateways such as Paymob, PCI scope | Thin; the domain side in [23](interview-prep/23-fintech-financial-domain.md) is strong | Asked in any SaaS or e-commerce role | `41-payments-integration` |
| Medium | **React Native / Expo:** the new architecture, Expo Router, EAS builds and OTA updates, secure storage, push notifications | Missing | Mobile work on the CV will be probed | `42-react-native-expo` |
| Medium | **Browser APIs & micro-frontends:** Web Workers, IndexedDB, Intersection/ResizeObserver, BroadcastChannel, the service-worker lifecycle, Module Federation | Thin | Comes up in frontend architecture and dashboard-performance questions | `43-browser-apis-microfrontends` |
| Medium | **Documents, exports & i18n:** PDF generation (Puppeteer, react-pdf), streaming Excel/CSV, the `Intl` API, i18next, RTL, time zones | Thin; only appears as war stories in [33](interview-prep/33-real-world-scenarios.md) | Core ERP/HR skills already shipped, so this is cheap to turn into Q&A | `44-documents-exports-i18n` |
| Medium | **Playwright, Storybook & visual regression:** fixtures, the trace viewer, auth state, interaction tests, Chromatic/Percy | Thin | Playwright is now the default e2e tool | extend [16](interview-prep/16-testing.md) |
| Low | **Search:** Postgres full-text and `pg_trgm`, Atlas Search, Elasticsearch/Meilisearch, relevance, syncing via CDC | Thin | A common system-design sub-problem | `46-search` |
| Low | **Linux & shell for developers:** processes and signals, `ps`/`lsof`/`ss`, systemd and journalctl, `curl`/`dig` debugging, ulimit | Missing | Comes up as "debug this production box" questions | `47-linux-shell-for-devs` |
| Low | **OS & CS fundamentals:** threads vs processes, concurrency vs parallelism, mutexes and semaphores, deadlock conditions, memory model, heaps, tries and graphs | Thin | Some companies run a CS-fundamentals screen | `48-cs-os-fundamentals` |

## Thin spots inside existing files

- **[03 React Core](interview-prep/03-react-core.md):** add React 19 Actions: `useActionState`, `useOptimistic`, `useFormStatus` and `<form action>`.
- **[04 React Advanced](interview-prep/04-react-advanced.md):** add the React Compiler. Automatic memoization changes the `memo`/`useMemo` answers.
- **[05 State Management](interview-prep/05-state-management.md):** add forms at scale (React Hook Form with a Zod resolver).
- **[06 Next.js](interview-prep/06-nextjs-ssr.md):** promote Partial Prerendering and `'use cache'` to full questions. Add Turbopack, `after()`, and the changes to caching defaults.
- **[02 TypeScript](interview-prep/02-typescript.md):** add `const` type parameters, `NoInfer`, `using`, `isolatedDeclarations`, Node type stripping, and Zod `z.infer`.
- **[07 Node.js](interview-prep/07-nodejs-runtime.md):** add native `fetch`, `node:test`, `--env-file`, the permission model, `AsyncLocalStorage`, and a comparison with Bun and Deno.
- **[13 SQL & Prisma](interview-prep/13-sql-postgres-prisma.md):** compare Drizzle with Prisma. Add pgvector, which bridges to the AI gap.
- **[12 MongoDB](interview-prep/12-mongodb-mongoose.md):** add Atlas Search and Atlas Vector Search.
- **[16 Testing](interview-prep/16-testing.md):** add a Playwright example next to the Cypress one, and load testing with k6.
- **[19 System Design](interview-prep/19-system-design.md):** add a frontend system design problem (a dashboard, feed or autocomplete), a notification system and an upload-processing pipeline.
- **[20 Coding & DSA](interview-prep/20-coding-dsa.md):** add frontend-flavored problems: DOM traversal, rendering a nested comment tree, a promise task scheduler, and a virtual list from scratch.
- **[21 Behavioral](interview-prep/21-behavioral-hr.md):** add senior prompts: estimation, an RFC you wrote, a decision you'd reverse, pushing back on product, and onboarding people.
- **[22 Project Deep-Dives](interview-prep/22-project-deep-dives.md):** add a mobile/Expo project entry.
- **[25 Predicted Questions](interview-prep/25-predicted-interview-questions.md):** add a generic full-stack practical set (a component, an endpoint and a test).
