# AGENTS.md

## Project Overview

Elit Sanat ve Spor Kulubu is a Turkish-facing sports school operations platform. It is a single-package Next.js app with a public marketing/CMS surface, auth flows, and protected dashboards for `admin`, `manager`, `coach`, and `parent` roles.

Core stack:

- Next.js `16.2.6` App Router in `src/app`, React `19.2.6`, TypeScript strict mode, typed routes enabled.
- Supabase Auth, Postgres, Storage, SSR clients, and RLS-backed tenant isolation.
- Tailwind CSS 4 via `@tailwindcss/postcss`, shadcn/ui-style primitives in `src/components/ui`, and `@/*` path aliases.
- Vitest for unit/security tests, ESLint 9 flat config with `eslint-config-next`.
- OpenNext Cloudflare and Wrangler for Cloudflare Workers deployment.

Important directories:

- `src/app/(public)`: public home, gallery, and dynamic public content pages.
- `src/app/(auth)`: login, invite, forgot/reset password flows and auth Server Actions.
- `src/app/(app)`: protected role dashboards and dashboard Server Actions.
- `src/app/api`: App Router Route Handlers.
- `src/components`: shared UI, role panels, forms, and client-side interaction components.
- `src/lib`: auth, Supabase clients, dashboard data access, validation helpers, security helpers, and domain logic.
- `src/lib/schemas`: Zod schemas for app forms and API inputs.
- `supabase/migrations`: database schema, RLS, storage, and policy history.
- `docs/security`: route/RLS/security documentation that must stay aligned with code.
- `.agents/skills`: project skills, especially security and Supabase guidance.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 16 Rule

This is NOT the Next.js you know. This repository tracks Next.js 16 with breaking convention and API changes. Before writing Next.js code, read the relevant local guide in `node_modules/next/dist/docs/` and follow current deprecation notices.

Common local docs to check:

- App structure: `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- Server Actions / Server Functions: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- Route Handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Proxy rename from Middleware: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- Data security: `node_modules/next/dist/docs/01-app/02-guides/data-security.md`
- Environment variables: `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
- Caching model: `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`

Next.js 16 calls Middleware "Proxy", but this repo currently has `src/middleware.ts` and security regression tests around it. Do not casually rename or migrate it; read the local Proxy docs and update guardrails together if migration is intentional.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:elitkids-security-skill -->
## Sustainable Security

When working on authentication, authorization, Server Actions, Route Handlers, Supabase RLS migrations, storage access, webhooks, secrets, security headers, or tenant/data isolation, use `.agents/skills/elitkids-security/SKILL.md`.

For security-sensitive changes, also load `.agents/skills/elitkids-security/references/project-security-map.md` before editing. Prefer adding or updating automated guardrails over relying on review notes.
<!-- END:elitkids-security-skill -->

## Setup Commands

Use npm. `package-lock.json` is the dependency lockfile, so do not switch package managers unless the user explicitly asks.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` from `.env.example`. Build-time public analytics is intentionally guarded:

```bash
NEXT_PUBLIC_GA_ID=G-LQK7887YTE
```

Supabase values used by the browser must be publishable/public keys only. Keep `SUPABASE_SERVICE_ROLE_KEY`, WhatsApp secrets, and webhook secrets server-only.

## Development Workflow

- Start local development: `npm run dev`
- Run lint: `npm run lint`
- Run tests: `npm test`
- Run a Next-only production build: `npm run build:next`
- Run full Cloudflare build: `npm run build`
- Preview Cloudflare Worker locally after build: `npm run preview`
- Deploy with OpenNext Cloudflare: `npm run deploy`
- Upload without deploying: `npm run upload`
- Generate Cloudflare env types: `npm run cf-typegen`
- Seed demo Supabase data when configured: `npm run seed:demo`

Build outputs are ignored and should not be committed: `.next`, `.open-next`, `.wrangler`, `out`, and `build`.

There is no `.github/workflows` directory in this checkout. Treat the commands in this file as the source of truth for local validation unless CI is added later.

## Testing Instructions

Vitest runs in the Node environment and uses aliases from `vitest.config.ts`, including a `server-only` test stub.

```bash
npm test
npx vitest run src/lib/auth-security.test.ts
npx vitest run src/lib/security-regression.test.ts
npx vitest run -t "test name"
```

Security-specific validation:

```bash
.agents/skills/elitkids-security/scripts/run-security-checks.sh
```

That script runs `npm test`, `npm run lint`, `npm run build:next`, and `npm run test:security:bundle`.

Use `npm run test:security:bundle` after a production build to scan `.next/static`, `.next/server`, and `.open-next` for server secret leaks. If it fails, do not paste secret values into chat or logs.

Update tests whenever behavior changes:

- Add or update nearby `*.test.ts` files for pure helpers and domain logic.
- Update `src/lib/security-regression.test.ts` when adding, moving, renaming, or intentionally reclassifying app routes, API routes, Server Action files, migrations, security-sensitive imports, auth redirects, or cache behavior.
- Keep `docs/security/route-permission-matrix.md` and `docs/security/rls-policy-list.md` aligned with route and RLS changes.

## Code Style

- Use TypeScript with strict types. Prefer explicit domain types from `src/lib/types.ts`.
- Use `@/*` imports for source files.
- Match existing formatting: double quotes, semicolons, 2-space indentation, named exports where practical.
- Keep user-facing copy in Turkish unless the surrounding feature is already English.
- Server Components are the default in `src/app`. Add `"use client"` only for components that need browser state, effects, or event handlers.
- Put Server Action modules in route-local `actions.ts` files with top-level `"use server";`.
- Validate form and API inputs with Zod schemas, usually in `src/lib/schemas/app-forms.ts` or the relevant domain module.
- Keep shadcn-style primitives in `src/components/ui`; compose feature-specific panels/forms in `src/components`.
- Keep shared data access and server-only helpers in `src/lib`. Do not import server-only modules into client components.
- Tailwind CSS entrypoint is `src/app/globals.css`; PostCSS is configured through `postcss.config.mjs`.

## Security Rules

Server-side authorization must live close to the data mutation/read. Layouts and middleware/proxy checks are helpful but never sufficient by themselves.

- Treat every Server Action as a public POST endpoint. Check auth and role inside the action with `getCurrentAuthContext`, `requireRole`, `requireSecurityRole`, or equivalent scoped helpers.
- Treat every Route Handler in `src/app/api/**/route.ts` as public until it proves otherwise with route-local auth, role checks, validation, and tests.
- Scope ID-based reads and mutations by organization, parent ownership, coach assignment, or another RLS-backed relation. UUID presence alone is not authorization.
- Public endpoints must be explicitly documented and defended with runtime validation, rate limiting, and security metadata. Webhooks must verify provider signatures before side effects.
- Use `createSupabaseServerClient` for normal SSR/session-aware access. Use `createSupabaseAdminClient` only in server-only code after explicit authorization.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, WhatsApp secrets, or non-public Supabase keys through `NEXT_PUBLIC_*`, client components, or browser bundles.
- Enable RLS for every new `public` table in migrations. Add policies in the same change or an immediately paired migration.
- Keep storage buckets intentionally classified. `homepage-assets` is public; `pre-registration-assets` is private and signed-URL based.
- Do not add `force-static`, `revalidate`, `use cache`, `unstable_cache`, or `cacheLife` to protected app/API surfaces unless the security model and regression tests are updated intentionally.
- Keep security headers in `next.config.ts` and static asset caching in `public/_headers` aligned with deployment behavior.

Supabase-specific work must also follow `.agents/skills/supabase/SKILL.md`. Before implementing Supabase feature changes, check the current Supabase docs/changelog as instructed by that skill.

## Environment And Secrets

- `.env*` files are ignored except `.env.example`.
- Next.js loads env files from the repository root, not from `src`.
- `NEXT_PUBLIC_*` values are bundled for the browser at build time. Do not put secrets behind that prefix.
- `npm run build` first runs `scripts/require-public-env.mjs NEXT_PUBLIC_GA_ID=G-LQK7887YTE`.
- `wrangler.jsonc` contains public Cloudflare vars. Configure server secrets through environment-specific secret management, not committed config.

## Build And Deployment

Production paths:

```bash
npm run build:next
npm run build
npm run preview
npm run deploy
```

`npm run build:next` runs `next build --webpack`. `npm run build` runs the GA guard, the Next build, then `opennextjs-cloudflare build --skipNextBuild`. Cloudflare deployment uses `.open-next/worker.js` and static assets from `.open-next/assets`.

Run `npm run cf-typegen` after changing Wrangler bindings or Cloudflare env shape.

## Pull Request Guidelines

- Use a clear title such as `[elitkids] Add parent payment guardrails`.
- Before handing off code, run the smallest meaningful checks, usually `npm run lint` and `npm test`.
- For security-sensitive changes, run `.agents/skills/elitkids-security/scripts/run-security-checks.sh` or clearly explain why a step could not be run.
- Include docs and guardrail updates in the same PR when adding routes, Server Actions, public endpoints, RLS migrations, storage policy changes, env vars, or webhooks.
- Do not commit generated outputs from `.next`, `.open-next`, `.wrangler`, coverage, or local env files.

## Troubleshooting Notes

- If `npm run build` fails immediately, check `NEXT_PUBLIC_GA_ID`; it must be set to `G-LQK7887YTE`.
- If Supabase env vars are absent in development, parts of the app can fall back to demo/local preview behavior. Production must not rely on demo auth.
- If a protected route or API appears cached, check `src/middleware.ts`, `next.config.ts`, and `src/lib/security-regression.test.ts`.
- If a new API route or Server Action causes tests to fail, classify it in `src/lib/security-regression.test.ts` and update `docs/security/route-permission-matrix.md`.
- If a migration creates a `public` table and tests fail, enable RLS and add the intended policies.
