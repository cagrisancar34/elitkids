import { describe, expect, it } from "vitest";

import { buildCmsOriginRequest, isCmsRoute, rewriteCmsOriginResponse } from "./index";

describe("CMS gateway", () => {
  it("keeps the legacy admin outside CMS ownership", () => {
    expect(isCmsRoute("/")).toBe(true);
    expect(isCmsRoute("/site/programlar")).toBe(true);
    expect(isCmsRoute("/admin")).toBe(false);
    expect(isCmsRoute("/admin/users")).toBe(false);
  });

  it("injects the origin token and preserves the public host", () => {
    const request = buildCmsOriginRequest(
      new Request("https://elitsanatvesporkulubu.com/admin2/events?tab=new"),
      "https://cms-example.koyeb.app",
      "secret-token",
    );

    expect(request.url).toBe("https://cms-example.koyeb.app/admin2/events?tab=new");
    expect(request.headers.get("x-cms-origin-token")).toBe("secret-token");
    expect(request.headers.get("x-forwarded-host")).toBe("elitsanatvesporkulubu.com");
    expect(request.headers.get("x-forwarded-proto")).toBe("https");
  });

  it("rewrites absolute Koyeb redirects back to the public domain", () => {
    const response = rewriteCmsOriginResponse(
      new Response(null, {
        headers: { location: "https://cms-example.koyeb.app/admin2/login?redirect=%2Fadmin2" },
        status: 302,
      }),
      "https://cms-example.koyeb.app",
      "https://elitsanatvesporkulubu.com",
    );

    expect(response.headers.get("location")).toBe(
      "https://elitsanatvesporkulubu.com/admin2/login?redirect=%2Fadmin2",
    );
  });

  it("preserves the Next.js asset prefix on the Koyeb origin", () => {
    const request = buildCmsOriginRequest(
      new Request("https://elitsanatvesporkulubu.com/cms-assets/_next/static/chunks/app.js"),
      "https://cms-example.koyeb.app",
      "secret-token",
    );

    expect(request.url).toBe("https://cms-example.koyeb.app/cms-assets/_next/static/chunks/app.js");
  });
});
