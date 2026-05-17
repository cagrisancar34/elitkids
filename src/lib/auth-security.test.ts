import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveTrustedAuthRedirectOrigin } from "@/lib/auth-redirect";
import {
  canAccessEntity,
  canAccessOrganization,
  hasSecurityRole,
  isAppRole,
  isSecurityRole,
  mapAppRoleToSecurityRole,
} from "@/lib/auth";

const originalNodeEnv = process.env.NODE_ENV;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

describe("auth security primitives", () => {
  afterEach(() => {
    vi.unstubAllEnvs();

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }

    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
  });

  it("rejects forged app and security roles", () => {
    expect(isAppRole("admin")).toBe(true);
    expect(isAppRole("owner")).toBe(false);
    expect(isAppRole("super_admin")).toBe(false);

    expect(isSecurityRole("super_admin")).toBe(true);
    expect(isSecurityRole("parent")).toBe(false);
    expect(isSecurityRole("owner")).toBe(false);
  });

  it("keeps app roles mapped to least-privilege security roles", () => {
    expect(mapAppRoleToSecurityRole("admin")).toBe("admin");
    expect(mapAppRoleToSecurityRole("manager")).toBe("manager");
    expect(mapAppRoleToSecurityRole("coach")).toBe("staff");
    expect(mapAppRoleToSecurityRole("parent")).toBe("user");
  });

  it("enforces security-role hierarchy without letting lower roles inherit upward", () => {
    expect(hasSecurityRole("super_admin", "admin")).toBe(true);
    expect(hasSecurityRole("admin", "manager")).toBe(true);
    expect(hasSecurityRole("manager", "admin")).toBe(false);
    expect(hasSecurityRole("staff", "manager")).toBe(false);
    expect(hasSecurityRole("user", "staff")).toBe(false);
  });

  it("fails closed for cross-organization access and missing organization context", () => {
    const managerAuth = { securityRole: "manager" as const };
    const superAdminAuth = { securityRole: "super_admin" as const };

    expect(canAccessOrganization(managerAuth, "org-a", "org-a")).toBe(true);
    expect(canAccessOrganization(managerAuth, "org-a", "org-b")).toBe(false);
    expect(canAccessOrganization(managerAuth, null, "org-a")).toBe(false);
    expect(canAccessOrganization(managerAuth, "org-a", null)).toBe(false);
    expect(canAccessOrganization(superAdminAuth, "org-a", "org-b")).toBe(true);
    expect(canAccessOrganization(superAdminAuth, null, "org-b")).toBe(false);
  });

  it("combines organization checks with minimum security roles for entity access", () => {
    expect(
      canAccessEntity({
        auth: { securityRole: "manager" },
        actorOrganizationId: "org-a",
        targetOrganizationId: "org-a",
        minimumSecurityRole: "manager",
      }),
    ).toBe(true);

    expect(
      canAccessEntity({
        auth: { securityRole: "staff" },
        actorOrganizationId: "org-a",
        targetOrganizationId: "org-a",
        minimumSecurityRole: "manager",
      }),
    ).toBe(false);

    expect(
      canAccessEntity({
        auth: { securityRole: "admin" },
        actorOrganizationId: "org-a",
        targetOrganizationId: "org-b",
        minimumSecurityRole: "manager",
      }),
    ).toBe(false);
  });

  it("only uses trusted same-site origins for auth email redirects", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://elitsanatvesporkulubu.com");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.elitsanatvesporkulubu.com");

    expect(resolveTrustedAuthRedirectOrigin("https://app.elitsanatvesporkulubu.com/reset?x=1")).toBe(
      "https://app.elitsanatvesporkulubu.com",
    );
    expect(resolveTrustedAuthRedirectOrigin("https://evil.example")).toBe(
      "https://elitsanatvesporkulubu.com",
    );
    expect(resolveTrustedAuthRedirectOrigin("not a url")).toBe(
      "https://elitsanatvesporkulubu.com",
    );
  });

  it("allows localhost auth redirects only outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://elitsanatvesporkulubu.com");
    expect(resolveTrustedAuthRedirectOrigin("http://localhost:3000/login")).toBe("http://localhost:3000");

    vi.stubEnv("NODE_ENV", "production");
    expect(resolveTrustedAuthRedirectOrigin("http://localhost:3000/login")).toBe(
      "https://elitsanatvesporkulubu.com",
    );
  });
});
