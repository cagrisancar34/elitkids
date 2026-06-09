import type { Payload } from "payload";

import {
  getPublicPath,
  getPublicType,
  getReadiness,
  type PublicSiteInventoryItem,
  type PublicSiteSource,
} from "./publicSite.ts";
import { toAdminPath } from "./routes.ts";

type PublicDocument = Record<string, unknown> & {
  id: number | string;
  title?: string;
  updatedAt?: string;
  workflowStatus?: string;
  _status?: string;
};

function mapItem(source: PublicSiteSource, doc: PublicDocument, hasPublishedVersion: boolean): PublicSiteInventoryItem {
  const readiness = getReadiness(source, doc);
  const workflow =
    doc.workflowStatus === "review"
      ? "review"
      : doc._status === "published"
        ? "published"
        : hasPublishedVersion
          ? "published-with-draft"
          : "draft";
  const path = getPublicPath(source, doc);

  return {
    criticalCount: readiness.critical.length,
    editHref: toAdminPath(`/collections/${source}/${doc.id}`),
    path,
    previewHref: path || "/",
    readiness: readiness.score,
    source,
    status: workflow,
    title: doc.title || "Başlıksız içerik",
    type: getPublicType(source, doc),
    updatedAt: doc.updatedAt || new Date(0).toISOString(),
    warningCount: readiness.warnings.length,
  };
}

export async function getPublicInventory(payload: Payload) {
  const sources: PublicSiteSource[] = ["site-pages", "programs", "headlines", "galleries"];
  const results = await Promise.all(
    sources.map((collection) =>
      Promise.all([
        payload.find({
          collection,
          depth: 1,
          draft: true,
          limit: 250,
          sort: "-updatedAt",
        }),
        payload.find({
          collection,
          depth: 0,
          draft: false,
          limit: 250,
          where: { _status: { equals: "published" } },
        }),
      ]),
    ),
  );

  return results
    .flatMap(([draftResult, publishedResult], index) => {
      const publishedIDs = new Set(publishedResult.docs.map((doc) => String(doc.id)));
      return draftResult.docs.map((doc) =>
        mapItem(sources[index], doc as unknown as PublicDocument, publishedIDs.has(String(doc.id))),
      );
    },
    )
    .filter((item) => item.path)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
