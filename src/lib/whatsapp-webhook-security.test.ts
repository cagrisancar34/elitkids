import { describe, expect, it } from "vitest";

import {
  createMetaWebhookSignature,
  verifyMetaWebhookSignature,
} from "@/lib/whatsapp-webhook-security";

describe("whatsapp webhook signature verification", () => {
  it("accepts a valid Meta x-hub-signature-256 HMAC", async () => {
    const payload = JSON.stringify({ entry: [{ id: "message-entry" }] });
    const appSecret = "test-meta-app-secret";
    const signatureHeader = await createMetaWebhookSignature(payload, appSecret);

    await expect(
      verifyMetaWebhookSignature({ payload, appSecret, signatureHeader }),
    ).resolves.toBe(true);
  });

  it("rejects missing, malformed, and tampered signatures", async () => {
    const payload = JSON.stringify({ entry: [{ id: "message-entry" }] });
    const appSecret = "test-meta-app-secret";
    const signatureHeader = await createMetaWebhookSignature(payload, appSecret);

    await expect(
      verifyMetaWebhookSignature({ payload, appSecret, signatureHeader: null }),
    ).resolves.toBe(false);
    await expect(
      verifyMetaWebhookSignature({ payload, appSecret, signatureHeader: "sha1=abc" }),
    ).resolves.toBe(false);
    await expect(
      verifyMetaWebhookSignature({
        payload: JSON.stringify({ entry: [{ id: "tampered" }] }),
        appSecret,
        signatureHeader,
      }),
    ).resolves.toBe(false);
    await expect(
      verifyMetaWebhookSignature({ payload, appSecret: undefined, signatureHeader }),
    ).resolves.toBe(false);
  });
});
