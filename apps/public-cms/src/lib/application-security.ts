import { z } from "zod";

const applicationSubmissionSchema = z.object({
  childAge: z.string().trim().max(40, "Çocuk yaşı en fazla 40 karakter olabilir.").optional().default(""),
  email: z
    .union([z.literal(""), z.string().trim().email("Geçerli bir e-posta adresi girin.").max(254)])
    .optional()
    .default(""),
  fullName: z.string().trim().min(2, "Ad soyad zorunludur.").max(120),
  kvkkConsent: z.literal(true, "KVKK onayı zorunludur."),
  message: z.string().trim().max(2_000, "Mesaj en fazla 2000 karakter olabilir.").optional().default(""),
  phone: z.string().trim().min(7, "Geçerli bir telefon numarası girin.").max(32),
  programSlug: z.string().trim().max(160).optional(),
  programTitle: z.string().trim().max(160).optional(),
});

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const applicationRateLimits = new Map<string, RateLimitEntry>();

export type ApplicationSubmission = z.infer<typeof applicationSubmissionSchema>;

export function parseApplicationSubmission(value: unknown) {
  return applicationSubmissionSchema.safeParse(value);
}

export function extractApplicationClientKey(request: Request) {
  const connectingIp = request.headers.get("cf-connecting-ip")?.trim();
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent")?.trim();

  return connectingIp || forwardedIp || userAgent || "anonymous";
}

export function consumeApplicationRateLimit(
  key: string,
  now = Date.now(),
  limit = 6,
  windowMs = 15 * 60 * 1000,
): RateLimitResult {
  const existing = applicationRateLimits.get(key);
  const entry = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : existing;

  entry.count += 1;
  applicationRateLimits.set(key, entry);

  if (applicationRateLimits.size > 5_000) {
    for (const [storedKey, storedEntry] of applicationRateLimits) {
      if (storedEntry.resetAt <= now) applicationRateLimits.delete(storedKey);
    }
  }

  return {
    allowed: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
  };
}

export function buildApplicationRateLimitHeaders(result: RateLimitResult) {
  return {
    "cache-control": "no-store",
    "x-ratelimit-limit": String(result.limit),
    "x-ratelimit-remaining": String(result.remaining),
    "x-ratelimit-reset": String(Math.ceil(result.resetAt / 1_000)),
    ...(result.allowed ? {} : { "retry-after": String(result.retryAfterSeconds) }),
  };
}

export function toLegacyLeadPayload(submission: ApplicationSubmission) {
  return {
    branchInterest: submission.programTitle || "Dört Mevsim Doğada",
    email: submission.email,
    fullName: submission.fullName,
    message: [
      submission.childAge ? `Çocuk yaşı: ${submission.childAge}` : "",
      submission.message,
    ]
      .filter(Boolean)
      .join("\n"),
    phone: submission.phone,
    source: "dort-mevsim-public-site",
  };
}

export function resetApplicationRateLimitsForTests() {
  applicationRateLimits.clear();
}
