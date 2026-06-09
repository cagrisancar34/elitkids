import { beforeEach, describe, expect, it } from "vitest";

import {
  consumeApplicationRateLimit,
  parseApplicationSubmission,
  resetApplicationRateLimitsForTests,
  toLegacyLeadPayload,
} from "./application-security";

describe("public application security", () => {
  beforeEach(() => resetApplicationRateLimitsForTests());

  it("accepts a bounded valid submission and maps it to the legacy lead shape", () => {
    const parsed = parseApplicationSubmission({
      childAge: "8",
      email: "veli@example.com",
      fullName: "Test Veli",
      kvkkConsent: true,
      message: "Hafta sonu programı",
      phone: "+90 555 111 22 33",
      programTitle: "Longoz",
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(toLegacyLeadPayload(parsed.data)).toMatchObject({
      branchInterest: "Longoz",
      fullName: "Test Veli",
      source: "dort-mevsim-public-site",
    });
  });

  it("rejects missing consent and oversized messages", () => {
    expect(parseApplicationSubmission({
      fullName: "Test Veli",
      kvkkConsent: false,
      message: "x".repeat(2_001),
      phone: "5551112233",
    }).success).toBe(false);
  });

  it("limits repeated submissions from the same client key", () => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      expect(consumeApplicationRateLimit("client", 1_000).allowed).toBe(true);
    }

    expect(consumeApplicationRateLimit("client", 1_000).allowed).toBe(false);
    expect(consumeApplicationRateLimit("other-client", 1_000).allowed).toBe(true);
  });
});
