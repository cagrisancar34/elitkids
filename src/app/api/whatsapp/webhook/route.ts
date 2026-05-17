import { NextResponse } from "next/server";

import { getWhatsAppServerConfig } from "@/lib/whatsapp-config";
import { verifyMetaWebhookSignature } from "@/lib/whatsapp-webhook-security";
import { updateDispatchFromWebhook } from "@/lib/whatsapp-server";

type WhatsAppWebhookPayload = {
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
};

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
  const config = getWhatsAppServerConfig();
  const rawBody = await request.text();

  if (!config.appSecret) {
    return NextResponse.json({ error: "Webhook imza secret eksik." }, { status: 503 });
  }

  const verified = await verifyMetaWebhookSignature({
    payload: rawBody,
    signatureHeader: request.headers.get("x-hub-signature-256"),
    appSecret: config.appSecret,
  });

  if (!verified) {
    return NextResponse.json({ error: "Webhook imzasi dogrulanamadi." }, { status: 403 });
  }

  let body: WhatsAppWebhookPayload | null = null;

  try {
    body = rawBody ? (JSON.parse(rawBody) as WhatsAppWebhookPayload) : null;
  } catch {
    body = null;
  }

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
