import { NextResponse } from "next/server";

import { getPublicPreRegistrationPayload } from "@/lib/pre-registration-server";

export async function GET() {
  const payload = await getPublicPreRegistrationPayload();

  return NextResponse.json(payload);
}
