import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { CMS_ORIGIN_HEADER, hasValidCmsOriginToken } from "@/lib/origin-guard";

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "production" || request.nextUrl.pathname === "/health") {
    return NextResponse.next();
  }

  const expectedToken = process.env.CMS_ORIGIN_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "CMS origin yapılandırması eksik." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  if (!hasValidCmsOriginToken(request.headers.get(CMS_ORIGIN_HEADER), expectedToken)) {
    return NextResponse.json(
      { error: "Bu adres yalnızca güvenli ağ geçidi üzerinden kullanılabilir." },
      { status: 403, headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
