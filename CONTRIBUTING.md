# Contributing to the BetterPuertoPrincesa Blog

Thanks for wanting to help. This is the blog for [BetterPuertoPrincesa.org](https://betterpuertoprincesa.org), the volunteer-built civic portal for Puerto Princesa City, Palawan. Developers, designers, writers and residents who know the city well are all welcome.

This repo follows the same workflow as the [main portal](https://github.com/BetterPuertoPrincesa/betterpuertoprincesa). If you've contributed there, nothing here will surprise you.

## Stack

- **Next.js 16** (App Router) + **TypeScript**, deployed on **Vercel**
- **Tailwind CSS v4**, with the palette and fonts ported from the main portal (`src/app/globals.css`)
- Post data is stored in **Firebase Firestore**, images in **Vercel Blob**
- **Tiptap** rich text editor at `/admin`, with Google sign-in through **Firebase Auth**
- Vercel Git integration for preview and production deploys, GitHub Actions for CI and releases (`.github/workflows/ci.yml`, `release.yml`)
- Conventional Commits + semantic-release for versioning (see below)

## Branching model

Trunk-based, with one long-lived branch:

| Branch | Environment                                       | Purpose                                        |
| ------ | ------------------------------------------------- | ---------------------------------------------- |
| `main` | Production: https://blog.betterpuertoprincesa.org | Default branch. All work branches target this. |

All development happens on short-lived branches named after the kind of change:

| Prefix      | Use for                                | Example                   |
| ----------- | -------------------------------------- | ------------------------- |
| `feat/`     | New feature or page                    | `feat/post-search`        |
| `fix/`      | Bug fix                                | `fix/editor-link-dialog`  |
| `perf/`     | Performance improvement                | `perf/cache-tag-pages`    |
| `docs/`     | Documentation only                     | `docs/editor-setup`       |
| `style/`    | Formatting or CSS, no logic change     | `style/post-list-spacing` |
| `refactor/` | Restructuring, no behavior change      | `refactor/posts-loader`   |
| `build/`    | Build tooling, dependencies            | `build/bump-next`         |
| `ci/`       | GitHub Actions or CI config            | `ci/cache-next-build`     |
| `chore/`    | Maintenance, no production code change | `chore/tidy-env-example`  |

Workflow:

1. Branch off `main`: `git checkout -b feat/short-description`
2. Open a PR into `main`. CI (`npm run lint`, `npm run typecheck` and `npm run build`) must pass, and Vercel comments a preview URL on the PR.
3. Merging deploys to production through Vercel and runs [semantic-release](https://semantic-release.gitbook.io/), which bumps the version, writes `CHANGELOG.md` and tags a GitHub Release (see `.github/workflows/release.yml`). Vercel skips the release bot's version-bump commit (`ignoreCommand` in `vercel.json`) since it only touches `package.json` and `CHANGELOG.md`.

Versions come entirely from commit messages, so there's no manual version bumping. `main` is protected: a PR is required, the `lint-and-build` check must pass on an up-to-date branch, and force-pushes and deletion are blocked. Repository admins can bypass this, which is what lets semantic-release push its version-bump commit.

**Never hand-edit the version in `package.json` or push a tag directly to `main`.** If a version needs to jump outside normal bumping, make a real commit with a `BREAKING CHANGE:` footer through a normal PR so semantic-release computes it.

## Getting started

Prerequisites: Node.js 22 or newer (CI uses 24), npm.

```bash
git clone https://github.com/BetterPuertoPrincesa/betterpuertoprincesa-blog.git
cd betterpuertoprincesa-blog
npm install          # also installs the git hooks (husky "prepare" script)
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

```bash
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run format     # Prettier, writes changes
```

The site runs without any environment variables; it just shows no posts. To work on the editor or see real posts, fill in `.env.local` as described in the [README](README.md). Ask a maintainer if you need access to the development Firebase project or a Blob token.

A pre-commit hook (`.husky/pre-commit` running `lint-staged`) runs ESLint and Prettier on staged files automatically.

## How to contribute

### Reporting bugs

1. Check existing [issues](https://github.com/BetterPuertoPrincesa/betterpuertoprincesa-blog/issues) to avoid duplicates.
2. Open a new issue with a clear title, steps to reproduce, what you expected and what happened, and a screenshot if it's visual.

### Suggesting features

Open an issue describing the feature, who it helps, and why. Mockups or examples help but aren't required.

### Writing posts

Posts aren't stored in this repo, so writing one doesn't need Git. Editors sign in at `/admin` on the live site. If you'd like to write for the blog, reach out on Facebook or Discord and a maintainer will add you to the editors list.

### Submitting code

1. **Fork** the repository.
2. **Branch** off `main` using one of the prefixes above:
   ```bash
   git checkout main && git pull
   git checkout -b feat/your-feature-name
   ```
3. **Make** your changes.
4. **Commit** using Conventional Commits. A commit-msg hook (`.husky/commit-msg` + `commitlint.config.mjs`) checks this locally, so a badly formatted commit won't go through.
   ```bash
   git commit -m "feat: add brief description of your change"
   ```
5. **Push** to your fork and **open a pull request into `main`**.

### One feature per pull request

Keep each PR to **one feature or one fix**, on its own branch off `main`. Ideally, get one merged before starting the next.

- A PR should build, work and make sense on its own. Don't link to routes or pages that only exist in another unmerged PR.
- Unrelated changes go in separate PRs, even if you wrote them together.
- If one feature really depends on another, say so in the PR description and open the dependent PR after the first is merged.

Small, self-contained PRs are faster to review, and if something breaks in production it's easy to find, fix or revert without touching anything else.

### Commit message format

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

The subject starts lowercase (no sentence case, start case or PascalCase).

| Type       | Effect on version           | Use for                                |
| ---------- | --------------------------- | -------------------------------------- |
| `feat`     | minor bump (1.2.0 to 1.3.0) | New feature or page                    |
| `fix`      | patch bump (1.2.0 to 1.2.1) | Bug fix                                |
| `perf`     | patch bump                  | Performance improvement                |
| `docs`     | no bump                     | Documentation only                     |
| `style`    | no bump                     | Formatting/CSS, no logic change        |
| `refactor` | no bump                     | Code restructuring, no behavior change |
| `test`     | no bump                     | Adding or fixing tests                 |
| `build`    | no bump                     | Build tooling, dependencies            |
| `ci`       | no bump                     | GitHub Actions / CI config             |
| `chore`    | no bump                     | Maintenance, no production code change |
| `revert`   | patch bump                  | Reverting a previous commit            |

Add `BREAKING CHANGE: <description>` in the footer (or `!` after the type, like `feat!:`) for a **major** bump.

Examples:

```
feat(editor): add table support to the rich text editor
fix(posts): show the cover photo caption on mobile
docs: explain how to add a new editor
```

## Code guidelines

- **TypeScript/React**: match the existing style in the file you're editing.
- **Styling**: Tailwind CSS v4 utility classes and the theme tokens in `src/app/globals.css`. Reuse the pieces in `src/components/ui/` (`PageHeader`, `Breadcrumbs`, ...) where one fits.
- **Keep the look in sync**: the palette, fonts and shared components are ported from the main portal. Visual changes that should apply to both sites belong in the main repo first, then get copied here.
- **Data access**: read Firestore only on the server through `src/lib/posts.ts`. Writes go through the server actions in `src/app/admin/actions.ts`, which check the editor's sign-in. Never write to Firestore from the browser.
- **Post HTML**: anything the editor can produce must also be allowed in `src/lib/sanitize.ts`, or it will be stripped on save. Add to the allowlist rather than loosening it.
- **Next.js 16**: this version has breaking changes from older releases. Check `node_modules/next/dist/docs/` before relying on an API from memory.
- **Secrets**: never commit `.env` files or keys. New env variables go in `.env.example` with a comment.
- **Accessibility**: semantic HTML, `aria-label`s on icon-only buttons and links, keyboard-navigable controls.
- **Mobile**: check your change at a narrow viewport (400px or less) before opening a PR. Many readers will be on a phone.

## Pull request process

1. Keep the PR to a single feature or fix (see [One feature per pull request](#one-feature-per-pull-request)).
2. Make sure `npm run lint`, `npm run typecheck` and `npm run build` pass locally.
3. Fill out the PR description: what changed and why, and any related issue. Only tick checklist items you actually did.
4. Vercel comments a preview URL on every PR; use it to check the change live. For PRs from forks, a maintainer has to authorize the preview on Vercel and approve the first CI run.
5. Wait for review and address feedback.

## Review criteria

- Correctness and no regressions
- Security of anything touching sign-in, server actions, uploads or post HTML
- Accessibility and mobile responsiveness
- Consistency with the main portal's look and the surrounding code

## Community

- **Facebook:** https://www.facebook.com/betterpuertoprincesa
- **Discord:** https://discord.gg/DzwTq7MjfS (BetterPuertoPrincesa)
- **BetterGov.ph Discord:** https://discord.gg/bettergovph

## Questions?

Open an issue, message us on Facebook, or ask on Discord.

Thank you for helping make Puerto Princesa's local government more transparent and accessible.
