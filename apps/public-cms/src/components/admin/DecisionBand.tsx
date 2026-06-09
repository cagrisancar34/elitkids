"use client";

import { CheckCircle2, Eye, Globe2, Search, TriangleAlert } from "lucide-react";
import { useAllFormFields, useAuth, useDocumentInfo, useLivePreviewContext } from "@payloadcms/ui";
import { reduceFieldsToValues } from "payload/shared";

import { getPublicPath, getReadiness, type PublicSiteSource } from "@/lib/publicSite";

export function DecisionBand({ source }: { source: PublicSiteSource }) {
  const [fields] = useAllFormFields();
  const { user } = useAuth();
  const { hasPublishedDoc, unpublishedVersionCount } = useDocumentInfo();
  const livePreview = useLivePreviewContext();
  const data = reduceFieldsToValues(fields, true) as Record<string, unknown>;
  const readiness = getReadiness(source, data);
  const path = getPublicPath(source, data) || "URL bekleniyor";
  const workflow = data.workflowStatus === "review" ? "İncelemede" : hasPublishedDoc ? "Yayında" : "Taslak";
  const canPublish = user?.role === "admin" && readiness.critical.length === 0;

  return (
    <section className="dmd-decision-band">
      <div className="dmd-decision-band__identity">
        <span><Globe2 size={15} /> {path}</span>
        <strong>{workflow}{hasPublishedDoc && unpublishedVersionCount ? " + taslak değişiklik" : ""}</strong>
      </div>
      <div className="dmd-decision-band__checks">
        <span className={readiness.critical.length ? "is-critical" : "is-ready"}>
          {readiness.critical.length ? <TriangleAlert size={15} /> : <CheckCircle2 size={15} />}
          {readiness.critical.length ? `${readiness.critical.length} kritik eksik` : "Kritikler tamam"}
        </span>
        <span><Search size={15} /> {readiness.warnings.length ? `${readiness.warnings.length} öneri` : "SEO hazır"}</span>
        <span className={canPublish ? "is-ready" : ""}>{canPublish ? "Yayınlanabilir" : user?.role === "admin" ? "Yayın için eksikleri tamamlayın" : "Admin onayı gerekli"}</span>
      </div>
      <button type="button" onClick={() => livePreview.setIsLivePreviewing(!livePreview.isLivePreviewing)}>
        <Eye size={16} /> {livePreview.isLivePreviewing ? "Önizlemeyi kapat" : "Canlı önizleme"}
      </button>
      {(readiness.critical.length || readiness.warnings.length) ? (
        <details>
          <summary>Kontrol ayrıntıları</summary>
          <div>
            {readiness.critical.map((item) => <p key={item}><TriangleAlert size={14} /> {item}</p>)}
            {readiness.warnings.map((item) => <p key={item}><Search size={14} /> {item}</p>)}
          </div>
        </details>
      ) : null}
    </section>
  );
}
