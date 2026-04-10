import { NextResponse } from "next/server";

import { getWhatsAppServerConfig } from "@/lib/whatsapp-config";
import { updateDispatchFromWebhook } from "@/lib/whatsapp-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const config = getWhatsAppServerConfig();

  if (mode === "subscribe" && token && token === config.verifyToken) {
    return new Response(challenge ?? "ok", { status: 200 });
  }

  return NextResponse.json({ error: "Verify token eslesmedi." }, { status: 403 });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        entry?: Array<{
          changes?: Array<{
            value?: {
              statuses?: Array<{
                id?: string;
                status?: "sent" | "delivered" | "read" | "failed";
              }>;
            };
          }>;
        }>;
      }
    | null;

  const statuses =
    body?.entry?.flatMap((entry) =>
      (entry.changes ?? []).flatMap((change) => change.value?.statuses ?? []),
    ) ?? [];

  for (const status of statuses) {
    if (!status.id || !status.status) {
      continue;
    }

    await updateDispatchFromWebhook({
      providerMessageId: status.id,
      status: status.status,
      payload: status as Record<string, unknown>,
    });
  }

  return NextResponse.json({ ok: true });
}
