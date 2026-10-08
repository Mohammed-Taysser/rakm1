# ![Rakm1 logo](static/img/logo.svg) Rakm1

Interview prep and engineering notes for full-stack JavaScript.
Live site: [mohammed-taysser.github.io/rakm1](https://mohammed-taysser.github.io/rakm1/)

Rakm1 is a team reference that started as my learning notes in 2021. It has since been reworked with five more
years of shipping React, Next.js, Node and NestJS products. It's built with [Docusaurus](https://docusaurus.io/).

## What's inside

| Section | Path | Contents |
| --- | --- | --- |
| **Interview Prep** | [`docs/interview-prep`](docs/interview-prep) | 33 topic files, layered Basic → Intermediate → Advanced, with model answers, code and interviewer tips |
| **Coverage gaps** | [`docs/coverage-gaps.md`](docs/coverage-gaps.md) | What the pack doesn't cover yet, ranked by priority |
| **Security** | [`docs/security`](docs/security) | Security notes, CEH course notes, learning roadmap |

## Run locally

Requires Node.js 20+.

```bash
npm install
npm start          # dev server at http://localhost:3000/
npm run build      # production build into build/
npm run serve      # preview the production build
```

## Adding a page

1. Add a `.md` file under `docs/`.
2. Give it frontmatter:

   ```yaml
   ---
   title: "Page title"
   description: "One line shown in search and link previews."
   sidebar_position: 3
   ---
   ```

3. To retire a page, add `tags: [legacy]` and `sidebar_class_name: legacy`, plus a `:::warning[Legacy]` note at the top.

Pages under `docs/security` appear in the sidebar automatically. For a new folder, add a sidebar in
[`sidebars.ts`](sidebars.ts) and include its glob in `PUBLIC_DOCS` in [`docusaurus.config.ts`](docusaurus.config.ts).

## Not published

`private/` holds personal material: the CV, a job-specific brief and the raw commit-history archive. It's ignored by git
and never served.
