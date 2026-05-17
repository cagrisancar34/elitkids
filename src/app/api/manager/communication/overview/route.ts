import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth";
import {
  getManagerCommunicationTimeline,
  getProgramFormOptions,
  getProgramOptions,
  getSessionSeriesOptions,
  getStudentOptions,
} from "@/lib/dashboard/manager-data";
import { getWhatsAppCampaignOverview } from "@/lib/whatsapp-server";

export async function GET() {
  const auth = await getCurrentAuthContext();

  if (!auth?.userId || !["admin", "manager"].includes(auth.role)) {
    return NextResponse.json({ error: "Bu alana erisim iznin yok." }, { status: 401 });
  }

  const [timeline, whatsappOverview, programOptions, programFormOptions, sessionSeriesOptions, studentOptions] =
    await Promise.all([
      getManagerCommunicationTimeline(),
      getWhatsAppCampaignOverview(),
      getProgramOptions(),
      getProgramFormOptions(),
      getSessionSeriesOptions(),
      getStudentOptions(),
    ]);

  return NextResponse.json({
    timeline,
    whatsappOverview,
    programOptions,
    branchOptions: programFormOptions.branches,
    sessionSeriesOptions,
    studentOptions,
  });
}
