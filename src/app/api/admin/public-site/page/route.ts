import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth";
import { getPublicPageByIdentifier } from "@/lib/public-site-server";

export async function GET(request: Request) {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId || auth.role !== "admin") {
    return NextResponse.json({ error: "Bu alana erisim iznin yok." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier");

  if (!identifier) {
    return NextResponse.json({ error: "Gecerli bir sayfa secilmeli." }, { status: 400 });
  }

  const detail = await getPublicPageByIdentifier(identifier);

  if (!detail) {
    return NextResponse.json({ error: "Sayfa detayi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ detail });
}
