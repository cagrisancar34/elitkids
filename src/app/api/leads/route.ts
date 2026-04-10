import { NextResponse } from "next/server";

import { buildRateLimitHeaders, consumeRateLimit } from "@/lib/rate-limit";
import { extractClientSecurityContext } from "@/lib/request-security";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createLeadSubmissionSchema } from "@/lib/schemas/app-forms";

export async function POST(request: Request) {
  const securityContext = extractClientSecurityContext(request);
  const rateLimit = consumeRateLimit({
    bucket: "public:lead-submit",
    key: securityContext.submittedIp ?? securityContext.userAgent ?? "anonymous",
    limit: 6,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Cok fazla form denemesi yapildi. Lutfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar dene.` },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const parsed = createLeadSubmissionSchema.safeParse({
    fullName: body?.fullName,
    email: body?.email,
    phone: body?.phone,
    branchInterest: body?.branchInterest,
    message: body?.message,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Basvuru formu gecersiz.",
      },
      { status: 400, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json(
      { error: "Supabase admin baglantisi kurulamadi." },
      { status: 500, headers: buildRateLimitHeaders(rateLimit) },
    );
  }

  const { data: organization } = await adminClient
    .from("organizations")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { error } = await adminClient.from("lead_submissions").insert({
    organization_id: organization?.id ?? null,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    branch_interest: parsed.data.branchInterest || null,
    message: parsed.data.message || null,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: buildRateLimitHeaders(rateLimit) });
  }

  return NextResponse.json({ ok: true }, { headers: buildRateLimitHeaders(rateLimit) });
}
