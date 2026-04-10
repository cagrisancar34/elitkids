import { NextResponse } from "next/server";

import { buildRateLimitHeaders, consumeRateLimit } from "@/lib/rate-limit";
import { extractClientSecurityContext } from "@/lib/request-security";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BUCKET_NAME = "pre-registration-assets";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function POST(request: Request) {
  const securityContext = extractClientSecurityContext(request);
  const rateLimit = consumeRateLimit({
    bucket: "public:pre-registration-asset-upload",
    key: securityContext.submittedIp ?? securityContext.userAgent ?? "anonymous",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Cok fazla dosya yukleme denemesi yapildi. Lutfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar dene.` },
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
  const field = String(formData.get("field") ?? "student-photo");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Gecerli bir dosya secilmedi." },
      { status: 400, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Yalnizca PNG, JPG veya WebP yuklenebilir." },
      { status: 400, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Dosya boyutu 5MB sinirini asiyor." },
      { status: 400, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      { error: "Dosya uzantisi desteklenmiyor." },
      { status: 400, headers: buildRateLimitHeaders(rateLimit) },
    );
  }
  const objectPath = `${sanitizeSegment(field)}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const fileBuffer = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage.from(BUCKET_NAME).upload(objectPath, fileBuffer, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
    .from(BUCKET_NAME)
    .createSignedUrl(objectPath, 60 * 30);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json(
      { error: signedUrlError?.message ?? "Dosya onizleme baglantisi olusturulamadi." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  return NextResponse.json({
    url: signedUrlData.signedUrl,
    path: objectPath,
  }, {
    headers: buildRateLimitHeaders(rateLimit),
  });
}
