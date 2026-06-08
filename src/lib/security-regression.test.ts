import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function toPosix(value: string) {
  return value.split(path.sep).join("/");
}

function readProjectFile(relativePath: string) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function listProjectFiles(relativeDir: string, predicate: (relativePath: string) => boolean) {
  const start = path.join(rootDir, relativeDir);
  const files: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      const relativePath = toPosix(path.relative(rootDir, absolutePath));
      if (predicate(relativePath)) {
        files.push(relativePath);
      }
    }
  }

  walk(start);
  return files.sort();
}

function uniqueRegexMatches(source: string, regex: RegExp) {
  return Array.from(source.matchAll(regex), (match) => match[1]).filter(
    (value, index, values): value is string => Boolean(value) && values.indexOf(value) === index,
  );
}

const publicApiRouteRules: Record<string, RegExp[]> = {
  "src/app/api/landing-content/route.ts": [
    /export async function GET\(/,
    /Cache-Control": "no-store"/,
  ],
  "src/app/api/leads/route.ts": [
    /export async function POST\(/,
    /consumeRateLimit\(/,
    /extractClientSecurityContext\(/,
    /createLeadSubmissionSchema\.safeParse/,
  ],
  "src/app/api/pre-registration-assets/route.ts": [
    /export async function POST\(/,
    /consumeRateLimit\(/,
    /extractClientSecurityContext\(/,
    /ALLOWED_MIME_TYPES/,
    /MAX_SIZE/,
    /createSignedUrl/,
  ],
  "src/app/api/pre-registration-settings/route.ts": [
    /export async function GET\(/,
  ],
  "src/app/api/pre-registrations/route.ts": [
    /export async function POST\(/,
    /consumeRateLimit\(/,
    /extractClientSecurityContext\(/,
    /createPreRegistrationSchema\.safeParse/,
    /logAuditEvent\(/,
  ],
  "src/app/api/whatsapp/webhook/route.ts": [
    /export async function GET\(/,
    /export async function POST\(/,
    /verifyMetaWebhookSignature\(/,
    /x-hub-signature-256/,
    /status: 403/,
    /status: 503/,
  ],
};

const protectedApiRouteRules: Record<string, RegExp[]> = {
  "src/app/api/admin/landing-assets/route.ts": [
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "admin"/,
    /auth\.mode !== "supabase"/,
  ],
  "src/app/api/admin/public-site/page/route.ts": [
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "admin"/,
  ],
  "src/app/api/app-notifications/route.ts": [
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "admin" && auth\.role !== "manager"/,
    /\.eq\("profile_id", auth\.userId\)/,
  ],
  "src/app/api/coach/sessions/[sessionId]/route.ts": [
    /getCurrentAuthContext\(\)/,
    /\["admin", "coach"\]\.includes\(auth\.role\)/,
  ],
  "src/app/api/manager/communication/overview/route.ts": [
    /getCurrentAuthContext\(\)/,
    /\["admin", "manager"\]\.includes\(auth\.role\)/,
  ],
  "src/app/api/manager/students/[studentId]/route.ts": [
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "manager" && auth\.role !== "admin"/,
  ],
  "src/app/api/support-threads/[threadId]/route.ts": [
    /getCurrentAuthContext\(\)/,
    /\["admin", "manager", "parent"\]\.includes\(auth\.role\)/,
  ],
};

const serverActionRules: Record<string, RegExp[]> = {
  "src/app/(app)/admin/detail-templates/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "admin"/],
  "src/app/(app)/admin/landing/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "admin"/],
  "src/app/(app)/admin/pre-registration-settings/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "admin"/],
  "src/app/(app)/admin/program-resources/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "admin"/],
  "src/app/(app)/admin/public-site/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "admin"/],
  "src/app/(app)/admin/seo-pages/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "admin"/],
  "src/app/(app)/admin/settings/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "admin"/],
  "src/app/(app)/admin/users/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "admin"/],
  "src/app/(app)/coach/sessions/actions.ts": [
    /^"use server";/m,
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "coach" && auth\.role !== "manager" && auth\.role !== "admin"/,
  ],
  "src/app/(app)/manager/announcements/actions.ts": [
    /^"use server";/m,
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "manager" && auth\.role !== "admin"/,
  ],
  "src/app/(app)/manager/communication/actions.ts": [
    /^"use server";/m,
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "admin" && auth\.role !== "manager"/,
  ],
  "src/app/(app)/manager/finance/actions.ts": [
    /^"use server";/m,
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "manager" && auth\.role !== "admin"/,
  ],
  "src/app/(app)/manager/pre-registrations/actions.ts": [
    /^"use server";/m,
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "manager" && auth\.role !== "admin"/,
  ],
  "src/app/(app)/manager/programs/actions.ts": [
    /^"use server";/m,
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "manager" && auth\.role !== "admin"/,
  ],
  "src/app/(app)/manager/sessions/actions.ts": [
    /^"use server";/m,
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "manager" && auth\.role !== "admin"/,
  ],
  "src/app/(app)/manager/students/actions.ts": [
    /^"use server";/m,
    /getCurrentAuthContext\(\)/,
    /auth\.role !== "manager" && auth\.role !== "admin"/,
    /auth\.role !== "manager" && auth\.role !== "admin" && auth\.role !== "coach"/,
  ],
  "src/app/(app)/parent/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "parent"/],
  "src/app/(app)/parent/payments/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "parent"/],
  "src/app/(app)/parent/support/actions.ts": [/^"use server";/m, /getCurrentAuthContext\(\)/, /auth\.role !== "parent"/],
};

describe("security regression guardrails", () => {
  it("keeps every app role layout behind the expected server-side role guard", () => {
    const roleLayouts = {
      "src/app/(app)/admin/layout.tsx": "admin",
      "src/app/(app)/manager/layout.tsx": "manager",
      "src/app/(app)/coach/layout.tsx": "coach",
      "src/app/(app)/parent/layout.tsx": "parent",
    };

    for (const [file, role] of Object.entries(roleLayouts)) {
      expect(readProjectFile(file), file).toMatch(new RegExp(`requireRole\\("${role}"\\)`));
    }
  });

  it("keeps middleware covering panels and APIs with private no-store responses", () => {
    const source = readProjectFile("src/middleware.ts");

    expect(source).toMatch(/pathname === "\/admin"/);
    expect(source).toMatch(/pathname\.startsWith\("\/admin\/"\)/);
    expect(source).not.toMatch(/pathname\.startsWith\("\/admin2"\)/);
    expect(source).toMatch(/pathname\.startsWith\("\/manager"\)/);
    expect(source).toMatch(/pathname\.startsWith\("\/coach"\)/);
    expect(source).toMatch(/pathname\.startsWith\("\/parent"\)/);
    expect(source).toMatch(/pathname\.startsWith\("\/api\/"\)/);
    expect(source).toMatch(/isPanelRoute \|\| pathname\.startsWith\("\/api\/"\)/);
    expect(source).toMatch(/cache-control", "private, no-store, max-age=0"/);
    expect(source).not.toMatch(/\(\?!api\|/);
  });

  it("requires every API route to be explicitly classified as public or protected", () => {
    const routeFiles = listProjectFiles("src/app/api", (file) => file.endsWith("/route.ts"));
    const expectedRoutes = [
      ...Object.keys(publicApiRouteRules),
      ...Object.keys(protectedApiRouteRules),
    ].sort();

    expect(routeFiles).toEqual(expectedRoutes);
  });

  it("keeps public API routes limited to documented controls", () => {
    for (const [file, patterns] of Object.entries(publicApiRouteRules)) {
      const source = readProjectFile(file);

      for (const pattern of patterns) {
        expect(source, `${file} should satisfy ${pattern}`).toMatch(pattern);
      }
    }
  });

  it("keeps protected API routes behind route-local auth and authorization checks", () => {
    for (const [file, patterns] of Object.entries(protectedApiRouteRules)) {
      const source = readProjectFile(file);

      for (const pattern of patterns) {
        expect(source, `${file} should satisfy ${pattern}`).toMatch(pattern);
      }
    }
  });

  it("keeps every app Server Action file classified with an action-local role guard", () => {
    const actionFiles = listProjectFiles("src/app/(app)", (file) => file.endsWith("/actions.ts"));

    expect(actionFiles).toEqual(Object.keys(serverActionRules).sort());

    for (const [file, patterns] of Object.entries(serverActionRules)) {
      const source = readProjectFile(file);

      for (const pattern of patterns) {
        expect(source, `${file} should satisfy ${pattern}`).toMatch(pattern);
      }
    }
  });

  it("keeps sensitive routes and handlers out of shared static caches", () => {
    const files = [
      ...listProjectFiles("src/app/(app)", (file) => /\.(ts|tsx)$/.test(file)),
      ...listProjectFiles("src/app/api", (file) => /\.(ts|tsx)$/.test(file)),
    ];
    const offenders = files.filter((file) =>
      /dynamic\s*=\s*["']force-static["']|revalidate\s*=|use cache|unstable_cache|cacheLife/.test(
        readProjectFile(file),
      ),
    );

    expect(offenders).toEqual([]);
  });

  it("prevents client components from importing server-only auth/admin data surfaces", () => {
    const files = listProjectFiles("src", (file) => /\.(ts|tsx)$/.test(file));
    const offenders = files.filter((file) => {
      const source = readProjectFile(file);
      return (
        /^["']use client["'];/m.test(source) &&
        /createSupabaseAdminClient|@\/lib\/supabase\/server|SUPABASE_SERVICE_ROLE_KEY|getCurrentAuthContext/.test(source)
      );
    });

    expect(offenders).toEqual([]);
  });

  it("keeps auth redirect and Server Action origin config fail-closed", () => {
    const authActions = readProjectFile("src/app/(auth)/actions.ts");
    const nextConfig = readProjectFile("next.config.ts");

    expect(authActions).toMatch(/resolveTrustedAuthRedirectOrigin/);
    expect(authActions).not.toMatch(/redirectTo: `\$\{headerStore\.get\("origin"\)/);
    expect(nextConfig).not.toMatch(/allowedOrigins\s*:\s*\[[^\]]*["']\*["']/);
  });

  it("requires RLS to be enabled for every public schema table created by migrations", () => {
    const sql = listProjectFiles("supabase/migrations", (file) => file.endsWith(".sql"))
      .map(readProjectFile)
      .join("\n");
    const createdTables = uniqueRegexMatches(
      sql,
      /create table if not exists public\.([a-z0-9_]+)/gi,
    ).sort();
    const rlsEnabledTables = new Set(
      uniqueRegexMatches(sql, /alter table public\.([a-z0-9_]+)\s+enable row level security/gi),
    );

    const missingRls = createdTables.filter((table) => !rlsEnabledTables.has(table));
    expect(missingRls).toEqual([]);
  });

  it("keeps Payload CMS isolated behind its dedicated database role", () => {
    const migration = readProjectFile("supabase/migrations/0028_public_cms_infrastructure.sql");
    const payloadConfig = readProjectFile("apps/public-cms/src/payload.config.ts");

    expect(migration).toMatch(/create role payload_cms/);
    expect(migration).toMatch(/revoke all on schema public_cms from public, anon, authenticated, service_role/);
    expect(migration).toMatch(/grant usage, create on schema public_cms to payload_cms/);
    expect(payloadConfig).toMatch(/schemaName: process\.env\.PAYLOAD_DB_SCHEMA \|\| "public_cms"/);
    expect(payloadConfig).toMatch(/clientUploads: false/);
  });

  it("keeps the external Payload origin and public application endpoint guarded", () => {
    const proxy = readProjectFile("apps/public-cms/src/proxy.ts");
    const applicationRoute = readProjectFile("apps/public-cms/src/app/(payload)/cms-api/basvuru/route.ts");
    const applications = readProjectFile("apps/public-cms/src/collections/Applications.ts");
    const gateway = readProjectFile("apps/gateway/src/index.ts");

    expect(proxy).toMatch(/CMS_ORIGIN_TOKEN/);
    expect(proxy).toMatch(/hasValidCmsOriginToken/);
    expect(applicationRoute).toMatch(/parseApplicationSubmission/);
    expect(applicationRoute).toMatch(/consumeApplicationRateLimit/);
    expect(applicationRoute).toMatch(/syncLegacyLead/);
    expect(applications).not.toMatch(/create: \(\) => true/);
    expect(gateway).toMatch(/CMS_ORIGIN_HEADER/);
    expect(gateway).toMatch(/CMS_ROLLBACK/);
  });

  it("keeps high-risk IDOR paths scoped by organization or ownership in the data layer", () => {
    const dashboardData = readProjectFile("src/lib/dashboard-data.ts");
    const parentPayments = readProjectFile("src/app/(app)/parent/payments/actions.ts");

    expect(dashboardData).toMatch(/manager-student-sheet:\$\{auth\.userId\}:\$\{organizationContext\.organizationId\}:\$\{studentId\}/);
    expect(dashboardData).toMatch(/\.eq\("organization_id", organizationContext\.organizationId\)\s+\.eq\("id", studentId\)/);
    expect(dashboardData).toMatch(/if \(auth\.role === "parent"\) \{\s+query = query\.eq\("parent_profile_id", auth\.userId\);/);
    expect(parentPayments).toMatch(/\.eq\("parent_profile_id", auth\.userId\)/);
  });

  it("keeps the public sitemap aligned with the gateway and experience routes", () => {
    const source = readProjectFile("src/app/sitemap.ts");

    expect(source).toMatch(/url: `\$\{siteUrl\}\/`/);
    expect(source).toMatch(/\/anasayfa2/);
    expect(source).toMatch(/\/etkinlikler/);
    expect(source).toMatch(/\/performans-akademisi/);
  });
});
