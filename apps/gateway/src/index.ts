interface Env {
  CMS_ORIGIN?: string;
  CMS_ORIGIN_TOKEN?: string;
  CMS_ROLLBACK?: Fetcher;
  CMS_USE_ROLLBACK?: string;
  LEGACY: Fetcher;
}

const CMS_PREFIXES = ["/site"];
const CMS_ASSET_PREFIX = "/cms-assets";
const CMS_ORIGIN_HEADER = "x-cms-origin-token";

export function isCmsRoute(pathname: string) {
  return pathname === "/" || CMS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function serviceRequest(request: Request, pathname?: string) {
  if (!pathname) return request;

  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

function cmsUnavailable(message = "Public CMS geçici olarak kullanılamıyor.") {
  return Response.json(
    { error: message },
    { status: 503, headers: { "cache-control": "no-store" } },
  );
}

export function buildCmsOriginRequest(request: Request, cmsOrigin: string, token: string, pathname?: string) {
  const publicUrl = new URL(request.url);
  const originUrl = new URL(cmsOrigin);
  if (originUrl.protocol !== "https:" && originUrl.hostname !== "localhost" && originUrl.hostname !== "127.0.0.1") {
    throw new Error("CMS_ORIGIN must use HTTPS.");
  }

  originUrl.pathname = pathname || publicUrl.pathname;
  originUrl.search = publicUrl.search;

  const originRequest = new Request(originUrl, request);
  originRequest.headers.delete(CMS_ORIGIN_HEADER);
  originRequest.headers.set(CMS_ORIGIN_HEADER, token);
  originRequest.headers.set("x-forwarded-host", publicUrl.host);
  originRequest.headers.set("x-forwarded-proto", publicUrl.protocol.replace(":", ""));

  return originRequest;
}

export function rewriteCmsOriginResponse(response: Response, cmsOrigin: string, publicOrigin: string) {
  const headers = new Headers(response.headers);
  const location = headers.get("location");

  if (location) {
    const resolvedLocation = new URL(location, cmsOrigin);
    const originUrl = new URL(cmsOrigin);
    if (resolvedLocation.origin === originUrl.origin) {
      headers.set("location", `${publicOrigin}${resolvedLocation.pathname}${resolvedLocation.search}${resolvedLocation.hash}`);
    }
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

async function cmsRequest(request: Request, env: Env, pathname?: string) {
  if (env.CMS_USE_ROLLBACK === "true") {
    return env.CMS_ROLLBACK
      ? env.CMS_ROLLBACK.fetch(serviceRequest(request, pathname))
      : cmsUnavailable("Public CMS rollback servisi yapılandırılmamış.");
  }

  if (!env.CMS_ORIGIN || !env.CMS_ORIGIN_TOKEN) {
    return cmsUnavailable("Public CMS origin yapılandırması eksik.");
  }

  try {
    const originRequest = buildCmsOriginRequest(request, env.CMS_ORIGIN, env.CMS_ORIGIN_TOKEN, pathname);
    const response = await fetch(originRequest);
    return rewriteCmsOriginResponse(response, env.CMS_ORIGIN, new URL(request.url).origin);
  } catch (error) {
    console.error("CMS origin request failed", error);
    return Response.json(
      { error: "Public CMS origin bağlantısı kurulamadı." },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}

async function mergeSitemaps(request: Request, env: Env) {
  const sitemapRequest = serviceRequest(request, "/sitemap.xml");
  const [legacyResponse, cmsResponse] = await Promise.all([
    env.LEGACY.fetch(sitemapRequest.clone()),
    cmsRequest(sitemapRequest.clone(), env),
  ]);
  const [legacyXml, cmsXml] = await Promise.all([
    legacyResponse.ok ? legacyResponse.text() : Promise.resolve(""),
    cmsResponse.ok ? cmsResponse.text() : Promise.resolve(""),
  ]);
  const entries = [...legacyXml.matchAll(/<url>[\s\S]*?<\/url>/g), ...cmsXml.matchAll(/<url>[\s\S]*?<\/url>/g)]
    .map((match) => match[0])
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}

function robotsResponse(request: Request) {
  const origin = new URL(request.url).origin;
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /admin2",
      "Disallow: /manager",
      "Disallow: /coach",
      "Disallow: /parent",
      "Disallow: /api",
      "Disallow: /cms-api",
      "Disallow: /login",
      `Sitemap: ${origin}/sitemap.xml`,
    ].join("\n"),
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap.xml") return mergeSitemaps(request, env);
    if (url.pathname === "/robots.txt") return robotsResponse(request);
    if (url.pathname === "/cms-api" || url.pathname.startsWith("/cms-api/")) {
      return cmsRequest(request, env);
    }
   if (url.pathname === "/admin2" || url.pathname.startsWith("/admin2/")) {
  return env.LEGACY.fetch(request);
}
    }
    if (url.pathname === CMS_ASSET_PREFIX || url.pathname.startsWith(`${CMS_ASSET_PREFIX}/`)) {
      return cmsRequest(request, env);
    }
    if (isCmsRoute(url.pathname)) return cmsRequest(request, env);
    return env.LEGACY.fetch(request);
  },
} satisfies ExportedHandler<Env>;
