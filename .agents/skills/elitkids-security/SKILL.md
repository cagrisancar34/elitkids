---
name: elitkids-security
description: Sustain security for the Elit Sanat ve Spor Kulubu Next.js/Supabase project. Use when Codex changes, reviews, or tests authentication, authorization, Server Actions, Route Handlers, Supabase RLS migrations, storage access, webhook verification, secrets, security headers, or any code that could affect tenant isolation or privileged data access.
---

# ElitKids Security

## Purpose

Use this skill to keep security controls and regression tests current while the app changes. Prefer adding or updating automated guardrails over relying on manual review notes.

## Required Context

1. Read root `AGENTS.md`.
2. Before Next.js code changes, read the relevant local Next docs in `node_modules/next/dist/docs/`; this project tracks a version with breaking conventions.
3. Load `references/project-security-map.md` when touching security-sensitive files or when deciding which tests to update.

## Workflow

1. Classify the change surface:
   - Auth/session: `src/lib/auth.ts`, `src/app/(auth)/**`, Supabase SSR clients.
   - Protected UI: `src/app/(app)/**/layout.tsx`, pages, client components that call actions.
   - Server entrypoints: `src/app/**/actions.ts`, `src/app/api/**/route.ts`.
   - Data isolation: `supabase/migrations/**`, dashboard/data access modules, storage buckets.
   - External ingress: WhatsApp/webhooks, public forms, public uploads.
2. Enforce server-side authorization close to the action/data:
   - Layout and middleware checks are not enough.
   - Every protected Route Handler and Server Action must check identity and role locally.
   - Every ID-based lookup must scope by organization, ownership, or an equivalent RLS-backed relation.
3. Keep public endpoints explicitly documented and defended:
   - Public forms/uploads need runtime schema validation, rate limiting, security metadata, and constrained file/MIME handling where applicable.
   - Public webhooks need provider verification before parsing side effects.
4. Keep database migrations fail-closed:
   - Every `public` table needs RLS enabled.
   - Every non-public-read table needs policies in the same migration or a follow-up migration in the same change.
   - Storage privacy changes must be documented in `docs/security`.
5. Update tests with the behavior:
   - Add exact unit tests for pure helpers.
   - Update `src/lib/security-regression.test.ts` whenever a route/action/table is added, renamed, or intentionally reclassified.
   - Tests should fail when a future developer silently adds a privileged entrypoint without authz.

## Validation

Run the bundled script for security-affecting changes:

```bash
.agents/skills/elitkids-security/scripts/run-security-checks.sh
```

For small non-security edits, at minimum run:

```bash
npm test
npm run lint
```

If `npm run test:security:bundle` fails on an ignored build artifact, do not print or paste the secret value. Remove stale ignored artifacts only when they are generated outputs, then rerun the scan.

## Reporting

In the final response, mention:

- Which guardrail or test was added/updated.
- Any security issue found and fixed.
- Exact validation commands run.
- Any remaining deployment action, such as adding a new required secret.
