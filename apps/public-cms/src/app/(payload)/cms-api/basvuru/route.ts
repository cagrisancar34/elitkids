import config from "@payload-config";
import { getPayload } from "payload";

import {
  buildApplicationRateLimitHeaders,
  consumeApplicationRateLimit,
  extractApplicationClientKey,
  parseApplicationSubmission,
  toLegacyLeadPayload,
  type ApplicationSubmission,
} from "@/lib/application-security";

const LEGACY_SYNC_TIMEOUT_MS = 8_000;

function legacyLeadsUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL("/api/leads", siteUrl);
}

async function syncLegacyLead(submission: ApplicationSubmission, applicationId: number) {
  try {
    const response = await fetch(legacyLeadsUrl(), {
      body: JSON.stringify(toLegacyLeadPayload(submission)),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        "x-cms-application-id": String(applicationId),
      },
      method: "POST",
      signal: AbortSignal.timeout(LEGACY_SYNC_TIMEOUT_MS),
    });

    return response.ok
      ? { message: "ElitKids başvuru akışına aktarıldı.", status: "synced" as const }
      : { message: `ElitKids aktarımı HTTP ${response.status} ile başarısız oldu.`, status: "failed" as const };
  } catch (error) {
    const reason = error instanceof Error && error.name === "TimeoutError"
      ? "ElitKids aktarımı zaman aşımına uğradı."
      : "ElitKids aktarımı bağlantı hatası nedeniyle başarısız oldu.";
    return { message: reason, status: "failed" as const };
  }
}

export async function POST(request: Request) {
  const rateLimit = consumeApplicationRateLimit(extractApplicationClientKey(request));
  const rateLimitHeaders = buildApplicationRateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return Response.json(
      { message: `Çok fazla form denemesi yapıldı. Lütfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar deneyin.` },
      { status: 429, headers: rateLimitHeaders },
    );
  }

  const parsed = parseApplicationSubmission(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message || "Başvuru formu geçersiz." },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  try {
    const payload = await getPayload({ config });
    const applicationData = { ...parsed.data };
    delete applicationData.programSlug;
    const application = await payload.create({
      collection: "applications",
      data: {
        ...applicationData,
        legacySyncStatus: "pending",
        status: "new",
      },
      overrideAccess: true,
    });
    const sync = await syncLegacyLead(parsed.data, application.id);

    try {
      await payload.update({
        collection: "applications",
        data: {
          legacySyncMessage: sync.message,
          legacySyncStatus: sync.status,
          legacySyncedAt: sync.status === "synced" ? new Date().toISOString() : undefined,
        },
        id: application.id,
        overrideAccess: true,
      });
    } catch (error) {
      console.error("Application legacy sync state could not be updated", error);
    }

    return Response.json(
      { ok: true, syncStatus: sync.status },
      { status: 201, headers: rateLimitHeaders },
    );
  } catch (error) {
    console.error("Application submission could not be stored", error);
    return Response.json(
      { message: "Başvuru şu anda kaydedilemedi. Lütfen kısa süre sonra tekrar deneyin." },
      { status: 500, headers: rateLimitHeaders },
    );
  }
}
