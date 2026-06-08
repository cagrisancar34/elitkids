import { describe, expect, it } from "vitest";

import { hasValidCmsOriginToken } from "./origin-guard";

describe("CMS origin guard", () => {
  it("accepts only an exact configured token", () => {
    expect(hasValidCmsOriginToken("secret-value", "secret-value")).toBe(true);
    expect(hasValidCmsOriginToken("secret-value", "other-secret")).toBe(false);
    expect(hasValidCmsOriginToken(null, "secret-value")).toBe(false);
    expect(hasValidCmsOriginToken("secret-value", undefined)).toBe(false);
  });
});
