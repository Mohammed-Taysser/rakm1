# DevOps, Deployment & Git (68 questions)

> DevOps is the glue between writing code and shipping it reliably. In a MERN/Next.js career you constantly touch Git (history, branching, conflicts, hooks), containers (Docker + Compose for Postgres/Redis local dev), CI/CD (GitHub Actions running lint/test/build/deploy for Foody, Pharmacy FEFO, Trust-Node), and deployment targets (Vercel for Next.js/NFT, GitHub Pages for the portfolio, an Nginx reverse proxy + PM2 for Trust-Node). Interviewers probe these to see whether you can take a feature from a branch to production safely: clean commits (Conventional Commits enforced via Husky + lint-staged + commitlint), reproducible builds (multi-stage Docker, Vite), repeatable deploys, secrets that never hit git, migrations that run as part of the pipeline, and the ability to recover when something breaks (revert, reflog, rollback). This file collects the questions you should be able to answer cold.

## Quick Revision Checklist

- Git tracks snapshots, not diffs; the three areas are **working dir → staging (index) → repository (.git)**.
- `fetch` only downloads remote refs; `pull` = `fetch` + `merge` (or `--rebase`).
- **Merge** preserves history and creates a merge commit; **rebase** rewrites commits onto a new base for a linear history. Golden rule: never rebase shared/pushed branches.
- `reset` moves a branch pointer (soft/mixed/hard); `revert` makes a new commit that undoes; `restore`/`checkout` touch files. Revert is the safe public option.
- `reflog` is your safety net — it can recover "lost" commits after a bad reset/rebase.
- Conventional Commits (`feat:`, `fix:`, `chore:`...) drive changelogs and semver; commitlint enforces them in a `commit-msg` hook.
- Husky runs git hooks: `pre-commit` (lint-staged), `commit-msg` (commitlint), `pre-push` (tests).
- **Containers** share the host kernel (lightweight); **VMs** virtualize hardware with a full guest OS.
- **Image** = immutable template; **container** = running instance of an image.
- Dockerfile layer order matters: copy `package.json` and install deps _before_ copying source so layer cache survives code changes.
- **Multi-stage builds** keep build tooling out of the final image → small, secure runtime images.
- Compose orchestrates multi-service local dev (app + Postgres + Redis) with volumes, networks, `depends_on`, healthchecks.
- **Volumes** are Docker-managed persistence; **bind mounts** map a host path (great for live-reloading source).
- CI = integrate + verify on every push/PR; CD = continuous delivery (auto to staging, manual gate to prod) or deployment (auto to prod).
- Typical pipeline: **install → lint → test → build → deploy**, with dependency caching and build artifacts.
- 12-factor: config in the **environment**, never commit secrets; use CI secret stores and `.env` (gitignored).
- Nginx = reverse proxy for SSL termination, load balancing, static serving, and routing to Node/PM2.
- Deploy strategies: recreate, rolling, blue-green, canary — pick based on downtime/risk tolerance; always have a rollback.
- Run DB migrations (`prisma migrate deploy`) as a pipeline step before/with the deploy; handle SIGTERM for graceful shutdown.

## Basic

### Q1: What is Git, and how does it differ from older version control like SVN?

**A:** Git is a **distributed** version control system: every clone is a full copy of the repository including its entire history, so you can commit, branch, and view history offline. SVN is **centralized** — there's one server of record and most operations need network access. Git stores **snapshots** of the whole tree per commit (with deduplication), not per-file deltas like many older systems.

**Tip:** Say "distributed + snapshots, not diffs" — it signals you understand Git's model rather than just its commands.

### Q2: What problem does version control solve?

**A:** It records the history of changes so you can answer who changed what, when, and why; revert to known-good states; work on parallel features via branches; collaborate without overwriting each other; and review changes before they merge.

**Tip:** Tie it to real value: code review, blameable history for debugging, and safe experimentation.

### Q3: Explain the three areas: working directory, staging area, and repository.

**A:** The **working directory** is your actual files on disk. The **staging area (index)** is where you assemble the next commit with `git add`. The **repository (.git)** is where committed snapshots live permanently after `git commit`.

**Tip:** Staging lets you craft focused commits — e.g. `git add -p` to stage only part of a file.

### Q4: What do add, commit, push, pull, fetch, and clone do?

**A:** `add` stages changes; `commit` records staged changes into local history; `push` uploads local commits to a remote; `fetch` downloads remote commits/refs without changing your working branch; `pull` = `fetch` + merge/rebase into the current branch; `clone` copies an entire remote repo locally.

**Tip:** Know `fetch` vs `pull`: fetch is read-only/safe; pull modifies your branch.

### Q5: What do status, log, and diff show?

**A:** `git status` shows staged/unstaged/untracked files and branch state; `git log` shows commit history (`--oneline --graph --decorate` is the readable form); `git diff` shows unstaged changes, `git diff --staged` shows what's staged, and `git diff a..b` compares two refs.

**Tip:** `git log --oneline --graph --all` is the fastest way to understand branch topology in an interview whiteboard.

### Q6: What is a branch in Git?

**A:** A branch is just a lightweight, movable **pointer to a commit**. Creating a branch creates a new pointer; committing on it advances that pointer. `HEAD` points to the current branch. Because branches are cheap, you make one per feature/fix.

**Tip:** "A branch is a pointer, not a copy" is the key insight that explains why branching is instant.

### Q7: What is `HEAD`, and what is a detached HEAD?

**A:** `HEAD` is a reference to the commit you currently have checked out — usually it points to a branch (which points to a commit). A **detached HEAD** happens when you check out a specific commit or tag directly; new commits aren't on any branch and can be lost if you switch away without making a branch.

**Tip:** If you commit in detached HEAD and want to keep it: `git switch -c new-branch` before leaving.

### Q8: What is `.gitignore`?

**A:** A file listing patterns Git should not track (e.g. `node_modules/`, `dist/`, `.env`, `*.log`). It keeps build output, dependencies, and secrets out of the repo.

**Tip:** `.gitignore` only affects **untracked** files. If a file is already tracked, you must `git rm --cached` it first.

### Q9: How do you create and switch branches?

**A:** Modern: `git switch -c feature/x` to create+switch, `git switch main` to switch. Older/equivalent: `git checkout -b feature/x` and `git checkout main`. List with `git branch`.

**Tip:** `switch` and `restore` were introduced to split the overloaded `checkout` into clearer commands.

### Q10: What is a remote, and what is `origin`?

**A:** A remote is a named reference to another copy of the repo (usually on GitHub). `origin` is the conventional default name for the remote you cloned from. `git remote -v` lists them.

**Tip:** You can have multiple remotes (e.g. `origin` and `upstream` for fork workflows).

### Q11: What is a Docker container, briefly?

**A:** A container is an isolated, runnable package of an application plus its dependencies, sharing the host OS kernel. It guarantees the app runs the same on any machine that has Docker.

**Tip:** "Works on my machine" → "ships as a container" is the elevator pitch.

### Q12: What is the difference between an image and a container?

**A:** An **image** is an immutable, layered template (built from a Dockerfile). A **container** is a running (or stopped) instance of an image with a writable layer on top. One image → many containers.

**Tip:** Analogy: image is the class, container is the object/instance.

### Q13: What is CI/CD in one sentence?

**A:** CI (Continuous Integration) automatically builds and tests every change as it's merged; CD (Continuous Delivery/Deployment) automatically packages and ships those changes to environments.

**Tip:** CI catches breakage early; CD removes manual, error-prone release steps.

### Q14: What are environment variables and why use them?

**A:** Key-value config injected at runtime (e.g. `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`). They let the same build run in dev/staging/prod with different settings and keep secrets out of code.

**Tip:** Cite 12-factor: store config in the environment, not in code.

## Intermediate

### Q15: Compare common branching strategies: Git Flow, GitHub Flow, trunk-based.

**A:** **Git Flow** uses long-lived `main` + `develop` plus `feature/`, `release/`, `hotfix/` branches — heavyweight, good for scheduled releases. **GitHub Flow** is simple: branch off `main`, open a PR, review, merge, deploy — ideal for continuous deployment (what most of your projects use). **Trunk-based** keeps everyone committing to `main` (or very short-lived branches) behind feature flags, with strong CI — scales well and minimizes merge pain.

**Tip:** Say GitHub Flow fits your GitHub Actions deploy pipelines; trunk-based suits high-frequency teams.

### Q16: Merge vs rebase — what's the difference and when do you use each?

**A:** **Merge** combines branches and (when histories diverged) creates a merge commit, preserving the true branching history. **Rebase** replays your commits on top of another branch, producing a **linear** history with no merge commits. Use merge to integrate shared branches and preserve context; use rebase to clean up your local feature branch before opening/updating a PR.

**Tip:** A common workflow: rebase your feature branch onto latest `main` locally, then merge the PR.

### Q17: What is the golden rule of rebasing?

**A:** **Never rebase commits that have been pushed and that others may have based work on.** Rebasing rewrites commit hashes, so shared history diverges and collaborators get nasty conflicts. Rebase only local/private branches.

**Tip:** If you must update a pushed feature branch you alone own, force-push with `--force-with-lease` (safer than `--force`).

### Q18: Fast-forward vs no-ff merge?

**A:** A **fast-forward** merge happens when the target branch hasn't diverged — Git just moves the pointer forward, no merge commit. `--no-ff` forces a merge commit even when a fast-forward is possible, preserving the fact that a feature branch existed.

**Tip:** Many teams use `--no-ff` for feature merges so the branch grouping stays visible in history.

### Q19: How do you resolve a merge conflict?

**A:** Git marks conflicting regions with `<<<<<<<`, `=======`, `>>>>>>>`. You edit each file to the desired result, remove the markers, `git add` the resolved files, then `git commit` (for merge) or `git rebase --continue` (for rebase). `git status` lists conflicted files; `git merge --abort` / `git rebase --abort` bail out.

**Tip:** Mention diff/merge tools (VS Code's 3-way view) and that conflicts are about _content_, not Git failing.

### Q20: Explain `git reset` soft vs mixed vs hard.

**A:** All three move the current branch pointer to a target commit. `--soft` keeps changes staged; `--mixed` (default) keeps changes in the working dir but unstaged; `--hard` discards working-dir and index changes entirely (destructive).

**Tip:** `git reset --soft HEAD~1` is the classic "uncommit but keep my changes to re-commit" move.

### Q21: reset vs revert vs restore/checkout — when to use which?

**A:** `reset` rewrites history by moving the branch pointer (use only on local, unpushed commits). `revert` creates a **new** commit that undoes a previous one — safe for shared/public history. `restore` (or old `checkout -- file`) discards working-directory changes to a file or restores a file from a commit, without touching history.

**Tip:** On `main`/shared branches, always `revert`, never `reset`.

### Q22: What is `git stash`?

**A:** It shelves uncommitted changes (tracked, optionally untracked with `-u`) so your working dir is clean — useful to switch branches quickly. `git stash` to save, `git stash pop` to reapply+drop, `git stash list` to view, `git stash apply` to reapply without dropping.

**Tip:** Name stashes: `git stash push -m "wip auth refactor"`.

### Q23: What is `git cherry-pick`?

**A:** It applies the change introduced by a specific commit onto your current branch, creating a new commit. Useful to pull a single bug-fix from one branch into another (e.g. hotfix to a release branch) without merging everything.

**Tip:** It can conflict like a merge; resolve then `git cherry-pick --continue`.

### Q24: What is `git reflog` and why is it a lifesaver?

**A:** Reflog records where `HEAD` and branch tips have pointed over time (commits, resets, rebases, checkouts), even for "lost" commits. If you `reset --hard` or botch a rebase, `git reflog` shows the previous commit hash and `git reset --hard <hash>` (or `git switch -c rescue <hash>`) recovers it.

**Tip:** "Nothing is truly lost for ~90 days thanks to reflog and unreachable objects" — reassuring and true.

### Q25: What are tags and how do they relate to semantic versioning?

**A:** Tags mark a specific commit, typically a release. **Annotated** tags (`git tag -a v1.2.0 -m "..."`) store metadata and are preferred for releases; lightweight tags are just pointers. **SemVer** is `MAJOR.MINOR.PATCH`: MAJOR = breaking changes, MINOR = backward-compatible features, PATCH = backward-compatible fixes.

**Tip:** Conventional Commits map cleanly to SemVer: `fix:`→patch, `feat:`→minor, `BREAKING CHANGE:`→major (tools like semantic-release automate this).

### Q26: What are Conventional Commits, and why do you enforce them?

**A:** A spec for commit messages: `type(scope): subject`, e.g. `feat(auth): add refresh tokens`, `fix(cart): correct totals`, plus `chore`, `docs`, `refactor`, `test`, `ci`, `perf`. They make history readable, enable automated changelogs and version bumps, and standardize the team. You enforce them with **commitlint** in a `commit-msg` Husky hook.

**Tip:** Name the common types and that `BREAKING CHANGE:` in the footer triggers a major bump.

### Q27: What is Husky + lint-staged and what hooks do you use?

**A:** **Husky** manages Git hooks in the repo (committed to version control so the whole team gets them). **lint-staged** runs linters/formatters only on **staged** files for speed. Typical setup: `pre-commit` → lint-staged (ESLint + Prettier on staged files); `commit-msg` → commitlint; `pre-push` → run the test suite.

**Tip:** Stress "only staged files" — running ESLint on the whole repo per commit would be painfully slow.

### Q28: What is a pull request and what makes a good code review?

**A:** A PR proposes merging a branch, runs CI, and gives a place for discussion before integration. Good reviews check correctness, readability, tests, security, and adherence to conventions; they're respectful, focus on the code, and use small, frequently-merged PRs to keep reviews tractable.

**Tip:** Mention branch protection: require passing CI + at least one approval before merge.

### Q29: What is squashing commits and interactive rebase (concept)?

**A:** Squashing combines several commits into one, producing a clean single commit (often done at merge with "Squash and merge"). **Interactive rebase** (`git rebase -i HEAD~n`) lets you reorder, edit, squash (`squash`/`fixup`), or drop commits to tidy a branch's history before review.

**Tip:** Squash messy WIP commits into one well-described `feat:` commit before merging.

### Q30: Walk through a multi-stage Dockerfile for a Node/TS app and why it matters.

**A:** A builder stage installs all deps and compiles TypeScript; the final stage starts from a slim base, copies only the compiled output and production deps, and runs as a non-root user. The result is a small, secure runtime image without dev dependencies or source/build tooling.

**Tip:**

```dockerfile
# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build            # tsc -> dist/

# ---- Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node                    # non-root
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Q31: Explain key Dockerfile instructions: FROM, WORKDIR, COPY, RUN, CMD vs ENTRYPOINT, EXPOSE, ENV, ARG.

**A:** `FROM` sets the base image; `WORKDIR` sets the working dir; `COPY` copies files into the image; `RUN` executes a command at **build** time (creates a layer); `EXPOSE` documents a port; `ENV` sets runtime env vars; `ARG` defines **build-time** variables. `CMD` gives default args/command that can be **overridden** at `docker run`; `ENTRYPOINT` defines the executable that always runs (CMD becomes its default args).

**Tip:** Use `ENTRYPOINT` for the fixed binary and `CMD` for default flags; remember ARG is build-time, ENV is runtime.

### Q32: How does Docker layer caching work and how do you optimize builds?

**A:** Each instruction creates a cached layer; if an instruction and its inputs are unchanged, Docker reuses the cache. So order from least- to most-frequently-changing: copy `package*.json` and `npm ci` **before** copying source, so editing code doesn't bust the dependency layer. Use a `.dockerignore` (exclude `node_modules`, `.git`, etc.) to shrink build context and avoid cache invalidation.

**Tip:** The classic mistake — `COPY . .` before installing deps — reinstalls everything on every code change.

### Q33: Volumes vs bind mounts?

**A:** A **volume** is storage managed by Docker (in Docker's area), ideal for databases and persistence across container restarts/recreations. A **bind mount** maps a specific host path into the container — great for local dev so source edits live-reload, and for config files. Volumes are more portable; bind mounts couple you to the host filesystem layout.

**Tip:** Postgres data → named volume; local dev source → bind mount.

### Q34: Show a docker-compose.yml with app + Postgres + Redis, with a healthcheck.

**A:** Compose declares services, a shared network (default), volumes, env, dependencies and healthchecks so the app waits for a healthy DB.

**Tip:**

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: appdb
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
volumes:
  pgdata:
```

### Q35: What do `depends_on` and `healthcheck` actually guarantee in Compose?

**A:** Plain `depends_on` only controls **start order**, not readiness. To wait until a dependency is actually accepting connections you combine `depends_on: { condition: service_healthy }` with a `healthcheck` on that service. Otherwise your app may start before Postgres is ready to accept queries.

**Tip:** This is a frequent gotcha — start order ≠ ready.

### Q36: How does Docker networking and port mapping work in Compose?

**A:** Compose puts services on a shared network where they reach each other by **service name** (e.g. the app connects to `db:5432`, `redis:6379`). `ports: "3000:3000"` maps `host:container` to expose a service to your machine; internal service-to-service traffic doesn't need published ports.

**Tip:** Inside Compose use `postgres://app:secret@db:5432/appdb` — `db`, not `localhost`.

### Q37: Write a GitHub Actions workflow that lints, tests, and builds with dependency caching.

**A:** A workflow triggers on push/PR, checks out code, sets up Node with built-in npm cache, installs with `npm ci`, then runs lint/test/build steps. Secrets come from `secrets.*`.

**Tip:**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: "npm" # caches ~/.npm keyed on lockfile
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.node }}
          path: dist/
```

### Q38: In GitHub Actions, what are workflows, jobs, steps, runners, triggers, and secrets?

**A:** A **workflow** is a YAML file in `.github/workflows/`. It contains **jobs** (run in parallel by default, on separate **runners**/VMs); each job has **steps** (shell commands or reusable `uses:` actions). **Triggers** (`on:`) fire workflows on events like `push`, `pull_request`, `schedule`, or `workflow_dispatch`. **Secrets** are encrypted values referenced as `${{ secrets.NAME }}` and never printed in logs.

**Tip:** Jobs are isolated; pass data between them with artifacts or job `outputs`.

### Q39: What is a matrix build?

**A:** A matrix runs the same job across combinations of parameters (e.g. Node 20 and 22, or multiple OSes) in parallel, so you verify compatibility without duplicating workflow code.

**Tip:** Great for libraries that must support several runtime versions.

### Q40: What is the typical CI/CD pipeline order, and what are build artifacts?

**A:** **install → lint → test → build → deploy**: fail fast and cheap (lint/test) before the expensive build and deploy. **Build artifacts** are the outputs you produce once and reuse (e.g. `dist/`, a Docker image) — upload them in CI and download them in the deploy job so you deploy exactly what you tested.

**Tip:** Build once, deploy the same artifact to staging then prod — don't rebuild per environment.

### Q41: What is environment promotion (dev/staging/prod)?

**A:** The same artifact moves through environments with increasing confidence: deploy to **dev** automatically, then **staging** (production-like, for QA/integration), then **prod** (often behind a manual approval gate). Config differs per env via environment variables, not code.

**Tip:** Mention GitHub Environments with required reviewers for the prod gate.

### Q42: How do environment variables resolve across dev/staging/prod, and how do you keep secrets safe?

**A:** Resolution precedence, highest first: real process/platform env vars > `.env.local` (gitignored, **never commit**) > `.env.[environment]` (`.env.production` / `.env.development`) > `.env` (shared defaults). Note that `dotenv` does **not** override variables already present in `process.env` by default, so platform-injected vars always win.

```bash
# precedence, highest wins:
# 1. real env (export DATABASE_URL=..., Vercel/AWS injected)
# 2. .env.local            (gitignored, machine-specific)
# 3. .env.production / .env.development
# 4. .env                  (shared, committed defaults — no secrets)
```

**Next.js**: only `NEXT_PUBLIC_*` vars are inlined into the client bundle (public — anyone can read them in the browser); everything else stays server-only, and `.env.local` is gitignored automatically. **NestJS**: validate config at boot with `@nestjs/config` + a class-validator schema so the app **fails fast** if a required var is missing or mistyped. Commit a `.env.example` documenting required keys with **no values**, and keep real secrets in a manager (Vercel env, AWS Secrets Manager, Doppler, 1Password CLI) so you can rotate them without code changes.

**Tip:** The two things to say: "`NEXT_PUBLIC_` leaks to the browser" and "validate env at startup (fail fast)."

### Q43: How do you manage secrets in CI and at runtime?

**A:** Never commit secrets. In CI use the provider's encrypted secret store (GitHub Actions secrets / environments) and inject as env vars. At runtime use the platform's env config (Vercel/Render env vars) or a secrets manager (Vault, AWS Secrets Manager, Doppler). Rotate secrets and scope them per environment.

**Tip:** Add a secret scanner (git-secrets/gitleaks) and treat any committed secret as compromised — rotate it.

### Q44: How do database migrations fit into deployment?

**A:** Run migrations as an explicit, idempotent pipeline step before (or as part of) the deploy — e.g. `npx prisma migrate deploy` in CI/CD. `migrate deploy` applies committed migrations non-interactively (vs `migrate dev` which generates them locally). Design migrations to be backward-compatible for zero-downtime (expand/contract pattern).

**Tip:** Run migrations from one place (a release job), not from every app instance on boot, to avoid races.

### Q45: What is a reverse proxy and why use Nginx (as in Trust-Node)?

**A:** A reverse proxy sits in front of your app servers and forwards client requests to them. Nginx handles **SSL/TLS termination**, **load balancing** across multiple Node processes, serving static assets, gzip/caching, rate limiting, and clean routing — keeping your Node app focused on application logic.

**Tip:**

```nginx
server {
  listen 443 ssl;
  server_name trust-node.example.com;
  ssl_certificate     /etc/letsencrypt/live/trust-node.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/trust-node.example.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Q46: What is PM2 and why use it?

**A:** PM2 is a production process manager for Node. It keeps apps alive (auto-restart on crash), runs **cluster mode** to use all CPU cores, supports zero-downtime reloads, log management, and startup scripts so the app survives server reboots.

**Tip:** `pm2 start app.js -i max` (cluster across all cores); `pm2 reload` for zero-downtime restarts; `pm2 startup` + `pm2 save` to persist across reboots.

### Q47: How do you deploy a Next.js app on Vercel vs a static site on GitHub Pages?

**A:** **Vercel** is a PaaS optimized for Next.js: connect the repo, it builds on push, runs SSR/ISR/serverless functions and edge, manages env vars, preview deploys per PR, and HTTPS automatically. **GitHub Pages** serves **static** files only (great for a built portfolio / static export), no server-side runtime — you push the built output (often via an Actions workflow).

**Tip:** Use Vercel when you need SSR/API routes; Pages when the output is fully static.

## Advanced

### Q48: Containers vs VMs — explain the real difference.

**A:** A **VM** virtualizes hardware via a hypervisor and runs a full guest OS per VM — strong isolation but heavy (GBs, slow boot). A **container** virtualizes at the OS level, sharing the host kernel and isolating via namespaces and cgroups — lightweight (MBs, sub-second start), higher density. Trade-off: VMs give stronger isolation/different-OS support; containers give speed and efficiency.

**Tip:** Mention namespaces (isolation) and cgroups (resource limits) as the Linux primitives behind containers.

### Q49: What are container best practices for production images?

**A:** Use **minimal base images** (alpine or distroless); run as a **non-root user**; **one main process per container**; pin versions; multi-stage builds to drop build tooling; `.dockerignore` to slim context; set `NODE_ENV=production`; add a `HEALTHCHECK`; don't bake secrets into layers; scan images for vulnerabilities.

**Tip:** Distroless removes the shell/package manager → smaller attack surface (harder to exploit, harder to debug — trade-off).

### Q50: Distinguish Continuous Integration, Delivery, and Deployment.

**A:** **CI**: every change is merged and automatically built/tested frequently. **Continuous Delivery**: every passing change is automatically packaged and kept ready to release, with a **manual approval** to push to prod. **Continuous Deployment**: every passing change goes to prod **automatically** with no manual gate.

**Tip:** Delivery = "ready to deploy at the click of a button"; Deployment = "no button, it's automatic."

### Q51: Compare deployment strategies: recreate, rolling, blue-green, canary.

**A:** **Recreate**: stop old, start new — simple but causes downtime. **Rolling**: replace instances gradually so the service stays up. **Blue-green**: run two full environments and switch traffic from old (blue) to new (green) instantly, with instant rollback by switching back. **Canary**: route a small % of traffic to the new version, watch metrics, then ramp up.

**Tip:** Blue-green = fastest rollback; canary = lowest blast radius. Both need a load balancer/router.

### Q52: How do you achieve zero-downtime deploys?

**A:** Combine health-checked rolling/blue-green deploys, a load balancer that only sends traffic to healthy instances (readiness checks), backward-compatible DB migrations (expand/contract), graceful shutdown (drain in-flight requests on SIGTERM), and connection draining at the proxy. PM2 `reload` and platform rolling updates do this for app instances.

**Tip:** The hard part is usually the **database** — schema changes must work with both old and new code simultaneously.

### Q53: What is graceful shutdown and how do you handle SIGTERM in a container?

**A:** When an orchestrator stops a container it sends **SIGTERM** (then SIGKILL after a grace period). A graceful app catches SIGTERM, stops accepting new requests, finishes in-flight ones, closes DB/Redis connections, then exits 0. Without it, you drop requests and leak connections.

**Tip:**

```js
process.on("SIGTERM", async () => {
  server.close(); // stop accepting new connections
  await db.end(); // close pool
  process.exit(0);
});
```

Also note: in Docker, run the process as PID 1 carefully (use `exec`/`tini`/`--init`) so signals actually reach it.

### Q54: Liveness vs readiness vs startup health checks.

**A:** **Liveness** answers "is the process alive?" — if it fails, restart the container. **Readiness** answers "can it serve traffic now?" (deps connected, warm) — if it fails, remove from the load balancer but don't restart. **Startup** gives slow-booting apps time before liveness kicks in. Confusing them causes restart loops or sending traffic to a not-ready instance.

**Tip:** A typical `/healthz` (liveness) and `/readyz` (checks DB/Redis) split.

### Q55: Horizontal vs vertical scaling, and the role of load balancers.

**A:** **Vertical** scaling adds more CPU/RAM to one machine (simple, capped, single point of failure). **Horizontal** scaling adds more instances and distributes traffic via a **load balancer** (better fault tolerance and near-linear scale, but requires statelessness — sessions/cache in Redis, not in-process). Horizontal is the cloud-native default.

**Tip:** "Scale out, not up; keep app servers stateless and push state to Redis/DB" is the line interviewers want.

### Q56: How does HTTPS/TLS work at deploy time, and what is Let's Encrypt?

**A:** TLS encrypts traffic and authenticates the server via a certificate signed by a trusted CA. **Let's Encrypt** is a free, automated CA; tools like Certbot obtain and **auto-renew** certs (90-day validity). Often TLS is terminated at the reverse proxy (Nginx) or platform edge (Vercel handles it for you).

**Tip:** Mention TLS termination at the proxy and auto-renewal via Certbot cron/systemd timer.

### Q57: What is Kubernetes at a high level, and when would you reach for it?

**A:** Kubernetes orchestrates containers across a cluster. Core objects: **Pod** (one or more co-located containers, the smallest unit), **Deployment** (declares desired replicas + rolling updates of pods), **Service** (stable network endpoint/load balancing for pods), plus ConfigMaps/Secrets, Ingress, etc. Reach for it when you need to run many services at scale with self-healing, autoscaling, and rolling updates. For a couple of small apps, Compose + a PaaS or PM2 behind Nginx is simpler.

**Tip:** Don't over-claim — say "I'd use a managed platform/Compose until scale justifies Kubernetes' complexity."

### Q58: What is Infrastructure as Code (Terraform), briefly?

**A:** IaC defines infrastructure (servers, networks, DBs, DNS) in version-controlled declarative files instead of clicking in a console. **Terraform** is provider-agnostic: you write `.tf` files, `terraform plan` previews changes, `terraform apply` reconciles real infra to the desired state, and state is tracked so changes are repeatable and reviewable.

**Tip:** Benefits: reproducible environments, code review for infra, easy teardown/recreate.

### Q59: Describe a robust logging and monitoring setup (as used in Foody).

**A:** Use **structured (JSON) logs** with a logger like **Winston/Pino** including correlation IDs and levels, shipped to a central store. Capture errors and traces with **Sentry**. Expose app/infra metrics to **Prometheus** and visualize/alert in **Grafana**. Together they give you logs (what happened), metrics (trends/SLOs), and traces/errors (debugging) — the observability triad.

**Tip:** Structured logs are queryable; `console.log` strings are not — that's the key upgrade.

### Q60: Explain the 12-factor app principles most relevant to deployment.

**A:** Key ones: store **config in the environment**; treat **backing services as attached resources** (swap DB/Redis via env URLs); strictly **separate build/release/run**; run the app as **stateless processes**; export services via **port binding**; scale via the **process model**; keep **dev/prod parity**; treat **logs as event streams** to stdout; **disposability** (fast startup, graceful shutdown).

**Tip:** "Config in env, stateless processes, logs to stdout" covers the deployment essentials.

### Q61: How do you build artifacts once and promote them safely?

**A:** Build the Docker image / `dist` once in CI, tag it (e.g. with the git SHA), push to a **registry**, and have each environment's deploy pull that exact immutable tag. This guarantees staging and prod run identical bits — no "it rebuilt differently" surprises — and makes rollback a re-deploy of a previous tag.

**Tip:** Tag images with the commit SHA, not just `latest`, so deploys are traceable and rollbackable.

### Q62: What's the difference between `latest` and pinned image tags?

**A:** `latest` is mutable — it points to whatever was last pushed, so two pulls can yield different images and deploys aren't reproducible. **Pinned** tags (version or git SHA) are immutable references, giving deterministic, auditable, rollback-friendly deploys.

**Tip:** Use `latest` for local convenience only; pin in CI/prod.

### Q63: How does a rollback work in practice?

**A:** Redeploy the previously known-good artifact/tag (or switch traffic back in blue-green). For DB, prefer backward-compatible migrations so rolling back app code doesn't require rolling back the schema; if a migration is destructive, you need a tested down-migration or restore plan.

**Tip:** The app rollback is easy; the database is what makes rollbacks hard — design migrations defensively.

### Q64: What are Git submodules, and what's the trade-off?

**A:** A submodule embeds another Git repo at a fixed commit inside your repo, letting you include shared code while keeping it a separate repository. Trade-off: they're awkward — you must `git submodule update --init --recursive`, commits pin specific submodule SHAs, and contributors often forget to update them. Many teams prefer package registries or a monorepo instead.

**Tip:** Know they exist and that they pin a specific commit; mention they're often replaced by packages.

### Q65: What Git considerations matter in a monorepo?

**A:** A monorepo holds many projects in one repo. Considerations: history/repo size grows (use **sparse-checkout** / **partial clone** / shallow clones), CI must run only **affected** projects (tooling like Turborepo/Nx with task graphs and caching), commit scopes/ownership via CODEOWNERS, and coordinated versioning (Changesets). Branching stays simple (trunk-based fits well).

**Tip:** Key wins are atomic cross-project changes and shared CI cache; key cost is tooling to scope builds.

### Q66: How do you cache dependencies effectively in CI?

**A:** Cache keyed on the lockfile hash so the cache invalidates only when deps change. In GitHub Actions, `actions/setup-node` with `cache: 'npm'` caches `~/.npm` keyed on `package-lock.json`; for Docker, order layers so `npm ci` is cached and/or use BuildKit cache mounts and registry layer cache. Always install with `npm ci` (clean, lockfile-exact) in CI.

**Tip:** Cache the package manager store, not `node_modules` directly; key on the lockfile.

### Q67: How does Vite's build relate to deployment?

**A:** `vite build` produces an optimized, hashed, static bundle in `dist/` (tree-shaken, minified, code-split). You deploy those static assets to a static host/CDN (GitHub Pages, Vercel, Nginx). Env vars must be prefixed `VITE_` to be exposed to client code at build time — so client builds are environment-specific.

**Tip:** Remember `VITE_`-prefixed vars are **embedded at build time and public** — never put secrets there.

### Q68: Why never commit secrets, and what do you do if you already did?

**A:** Committed secrets live in history forever and in every clone/fork, so anyone with repo access (or a leaked clone) gets them. If leaked: immediately **rotate/revoke** the secret (assume it's compromised), then optionally purge history (git-filter-repo/BFG) and force-push. Going forward use env stores + secret scanning in CI.

**Tip:** Rotation first, history cleanup second — removing it from history alone doesn't un-leak it.

## Common Mistakes / Red Flags

- Confusing `fetch` and `pull`, or thinking `pull` is read-only.
- Rebasing or force-pushing a shared branch and clobbering teammates' history (violating the golden rule).
- Using `git reset --hard` on shared history instead of `git revert`; not knowing `reflog` exists to recover.
- Committing `.env`, secrets, or `node_modules`; or thinking `.gitignore` removes already-tracked files.
- `COPY . .` before `npm ci` in a Dockerfile, busting layer cache on every code change; missing `.dockerignore`.
- Putting build tools and dev deps in the final image instead of using a multi-stage build; running as root.
- Believing Compose `depends_on` waits for readiness (it only orders start) — needing a healthcheck.
- Using `localhost` instead of the service name to connect between Compose containers.
- Treating containers like VMs (running many processes, SSHing in, persisting state in the container layer).
- Building separately per environment instead of promoting one immutable artifact; deploying mutable `latest`.
- No graceful SIGTERM handling → dropped requests and leaked connections on deploy/scale-down.
- Putting secrets in client builds (e.g. `VITE_`/`NEXT_PUBLIC_` vars are public).
- Running destructive DB migrations with no rollback plan and no backward compatibility, breaking zero-downtime.
- Confusing liveness vs readiness probes → restart loops or routing traffic to not-ready instances.
- Storing session/state in process memory while scaling horizontally (breaks behind a load balancer).
- Saying "just use Kubernetes" for a tiny app — over-engineering instead of matching tooling to scale.

## Further Reading

- Pro Git book (free): https://git-scm.com/book/en/v2
- Docker documentation: https://docs.docker.com/
- GitHub Actions documentation: https://docs.github.com/en/actions
- The Twelve-Factor App: https://12factor.net/
