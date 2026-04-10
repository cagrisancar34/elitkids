import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth";
import { buildRateLimitHeaders, consumeRateLimit } from "@/lib/rate-limit";
import { extractClientSecurityContext } from "@/lib/request-security";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BUCKET_NAME = "homepage-assets";
const MAX_SIZE = 6 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function POST(request: Request) {
  const auth = await getCurrentAuthContext();
  const securityContext = extractClientSecurityContext(request);
  const rateLimit = consumeRateLimit({
    bucket: "admin:landing-asset-upload",
    key: auth?.userId ?? securityContext.submittedIp ?? "anonymous",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!auth || auth.role !== "admin" || auth.mode !== "supabase" || !auth.userId) {
    return NextResponse.json(
      { error: "Bu islem yalnizca admin tarafindan yapilabilir." },
      { status: 403 },
    );
  }

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Cok fazla yukleme denemesi yapildi. Lutfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar dene.` },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      { error: "Supabase admin baglantisi kurulamadi." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const field = String(formData.get("field") ?? "landing");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Gecerli bir dosya secilmedi." }, { status: 400, headers: buildRateLimitHeaders(rateLimit) });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Yalnizca gorsel dosyasi yuklenebilir." }, { status: 400, headers: buildRateLimitHeaders(rateLimit) });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Dosya boyutu 6MB sinirini asiyor." }, { status: 400, headers: buildRateLimitHeaders(rateLimit) });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeField = sanitizeSegment(field);
  const objectPath = `${safeField}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const fileBuffer = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage
    .from(BUCKET_NAME)
    .upload(objectPath, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500, headers: buildRateLimitHeaders(rateLimit) });
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from(BUCKET_NAME).getPublicUrl(objectPath);

  return NextResponse.json({ url: publicUrl }, { headers: buildRateLimitHeaders(rateLimit) });
}
