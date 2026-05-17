import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth";
import { getSupportThreadDetail } from "@/lib/dashboard/parent-data";

type SupportThreadRouteContext = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function GET(_request: Request, context: SupportThreadRouteContext) {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId || !["admin", "manager", "parent"].includes(auth.role)) {
    return NextResponse.json({ error: "Bu kayda erisim iznin yok." }, { status: 401 });
  }

  const { threadId } = await context.params;

  if (!threadId) {
    return NextResponse.json({ error: "Gecerli bir thread secilmeli." }, { status: 400 });
  }

  const thread = await getSupportThreadDetail(threadId);

  if (!thread) {
    return NextResponse.json({ error: "Destek threadi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ thread });
}
