import { NextResponse } from "next/server";

import { getCurrentAuthContext } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BUCKET_NAME = "homepage-assets";

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function POST(request: Request) {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || auth.mode !== "supabase" || !auth.userId) {
    return NextResponse.json(
      { error: "Bu islem yalnizca admin tarafindan yapilabilir." },
      { status: 403 },
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
    return NextResponse.json({ error: "Gecerli bir dosya secilmedi." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Yalnizca gorsel dosyasi yuklenebilir." }, { status: 400 });
  }

  const { error: bucketError } = await adminClient.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 6 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
  });

  if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
    return NextResponse.json({ error: bucketError.message }, { status: 500 });
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
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from(BUCKET_NAME).getPublicUrl(objectPath);

  return NextResponse.json({ url: publicUrl });
}
