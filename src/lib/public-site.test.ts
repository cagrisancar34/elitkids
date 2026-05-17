import { describe, expect, it } from "vitest";

import {
  createDefaultCustomPublicPage,
  getCustomPublicPageStorageSlug,
  getSlugFromCustomPublicStorageSlug,
  isReservedPublicSlug,
} from "@/lib/public-site";

describe("public site helpers", () => {
  it("marks panel and system routes as reserved public slugs", () => {
    expect(isReservedPublicSlug("admin")).toBe(true);
    expect(isReservedPublicSlug("manager")).toBe(true);
    expect(isReservedPublicSlug("galeri")).toBe(true);
    expect(isReservedPublicSlug("silivri-spor-okulu")).toBe(false);
  });

  it("creates reversible custom page storage keys", () => {
    const storageSlug = getCustomPublicPageStorageSlug("tesis-ve-guvenlik");
    expect(storageSlug).toBe("public-page:tesis-ve-guvenlik");
    expect(getSlugFromCustomPublicStorageSlug(storageSlug)).toBe("tesis-ve-guvenlik");
  });

  it("builds a safe draft custom public page scaffold", () => {
    const page = createDefaultCustomPublicPage({
      slug: "tesis-ve-guvenlik",
      title: "Tesis ve Guvenlik",
      template: "guide",
    });

    expect(page.status).toBe("draft");
    expect(page.canonicalPath).toBe("/tesis-ve-guvenlik");
    expect(page.customSections.length).toBeGreaterThan(0);
    expect(page.faqItems.length).toBeGreaterThan(0);
  });
});
