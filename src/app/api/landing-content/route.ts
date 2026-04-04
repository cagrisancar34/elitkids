import { NextResponse } from "next/server";

import { getLandingContentFromStorage } from "@/lib/landing-content-server";

export async function GET() {
  const result = await getLandingContentFromStorage();

  return NextResponse.json(
    {
      content: result.content,
      updatedAt: result.updatedAt,
      error: result.error,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

