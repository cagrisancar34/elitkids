import { afterEach, describe, expect, it, vi } from "vitest";

import { isDemoAuthEnabled } from "@/lib/supabase/config";

const originalNodeEnv = process.env.NODE_ENV;
const originalDemoFlag = process.env.ENABLE_DEMO_AUTH;

describe("supabase auth config", () => {
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalDemoFlag === undefined) {
      delete process.env.ENABLE_DEMO_AUTH;
    } else {
      process.env.ENABLE_DEMO_AUTH = originalDemoFlag;
    }
    vi.unstubAllEnvs();
  });

  it("disables demo auth in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.ENABLE_DEMO_AUTH;

    expect(isDemoAuthEnabled()).toBe(false);
  });

  it("allows demo auth outside production unless explicitly disabled", () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.ENABLE_DEMO_AUTH;
    expect(isDemoAuthEnabled()).toBe(true);

    vi.stubEnv("ENABLE_DEMO_AUTH", "false");
    expect(isDemoAuthEnabled()).toBe(false);
  });
});
