import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth";
import { getCoachSessionDetail } from "@/lib/dashboard/coach-data";

type CoachSessionRouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: CoachSessionRouteContext) {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId || !["admin", "coach"].includes(auth.role)) {
    return NextResponse.json({ error: "Bu kayda erisim iznin yok." }, { status: 401 });
  }

  const { sessionId } = await context.params;

  if (!sessionId) {
    return NextResponse.json({ error: "Gecerli bir seans secilmeli." }, { status: 400 });
  }

  const session = await getCoachSessionDetail(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Seans detayi bulunamadi." }, { status: 404 });
  }

  return NextResponse.json({ session });
}
