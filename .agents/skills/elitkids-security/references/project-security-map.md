# ElitKids Security Map

## Key Files

- `AGENTS.md`: project-level instruction; read before coding.
- `src/lib/security-regression.test.ts`: static guardrails for route/action/RLS/security-sensitive file changes.
- `src/lib/auth-security.test.ts`: role hierarchy, organization/entity access, auth redirect origin tests.
- `src/lib/whatsapp-webhook-security.test.ts`: Meta webhook signature tests.
- `src/lib/auth.ts`: auth context, role mapping, organization/entity access helpers.
- `src/lib/auth-redirect.ts`: allowlisted auth email redirect origin resolution.
- `src/middleware.ts`: route prefilter and no-store headers. Next warns this convention is deprecated; read local docs before migrating to `proxy`.
- `src/app/api/**/route.ts`: public and protected API entrypoints.
- `src/app/(app)/**/actions.ts`: Server Actions; treat as public POST endpoints.
- `supabase/migrations/**`: RLS and storage policy source of truth.
- `docs/security/route-permission-matrix.md`: public/protected route classification.
- `docs/security/rls-policy-list.md`: expected RLS policy coverage.
- `scripts/security-secret-scan.mjs`: bundle/artifact secret scan.

## Current Guardrails

- API routes must be classified in `security-regression.test.ts` as public or protected.
- App Server Action files must be classified in `security-regression.test.ts` with role guard patterns.
- New `public` tables in migrations must have `alter table public.<table> enable row level security`.
- Sensitive app/API code must not opt into shared static caches.
- Client components must not import server-only auth/admin data surfaces.
- Auth email redirects must resolve through `resolveTrustedAuthRedirectOrigin`.
- WhatsApp webhook POST must verify `x-hub-signature-256` with `WHATSAPP_APP_SECRET`.

## Public API Baseline

Public routes are intentionally reachable without an app session. Keep this list synchronized with `docs/security/route-permission-matrix.md` and `src/lib/security-regression.test.ts`.

- `/api/landing-content`: public read, no-store.
- `/api/leads`: public write, rate limited, schema validated.
- `/api/pre-registration-settings`: public read.
- `/api/pre-registrations`: public write, rate limited, schema validated, audited.
- `/api/pre-registration-assets`: public upload, rate limited, image-only, private storage signed URL.
- `/api/whatsapp/webhook`: Meta verify token on GET, HMAC signature on POST.

## Protected Entry Baseline

- Admin-only: `/admin/**`, `/api/admin/**`, admin Server Actions.
- Manager/admin: `/manager/**`, manager operation Server Actions and APIs.
- Coach/admin where explicitly allowed: coach session and attendance surfaces.
- Parent-only: parent actions and parent-owned support/payment data.
- Admin override is allowed for app-role route homes, but entity access still needs organization/ownership scoping.

## Review Checklist

- Does the change add a route, action, table, storage bucket, webhook, redirect, or outbound URL fetch?
- Is runtime validation present for request body/form data/params?
- Is authorization checked server-side inside the action or handler?
- Does an ID lookup include organization, ownership, coach assignment, parent link, or RLS-backed scope?
- Does the change use `createSupabaseAdminClient` only server-side and after explicit authorization?
- Are public endpoints rate-limited or provider-verified?
- Are cache controls safe for user-specific data?
- Are new secrets server-only, documented in `.env.example`, and absent from client bundles?
- Did tests fail before the fix or guardrail update would have caught the risky pattern?
