import { AdminLandingEditor } from "@/components/admin-landing-editor";
import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceHighlight, WorkspacePanel } from "@/components/operations-workspace";
import { getLandingContentFromStorage } from "@/lib/landing-content-server";

export default async function AdminLandingPage() {
  const result = await getLandingContentFromStorage();

  return (
    <DashboardPage
      role="admin"
      eyebrow="Vitrin yonetimi"
      title="Landing page editoru"
      description="Anasayfada gorunen hero, brans kartlari, haberler, CTA ve footer alanlari yalnizca admin tarafindan bu panelden guncellenir."
      primaryAction={{ href: "/admin/landing", label: "Vitrini duzenle" }}
      contextCard={{
        eyebrow: "Icerik sinyali",
        title: result.updatedAt ? "Landing icerigi canli veriden geliyor" : "Fallback icerik acik",
        description: result.updatedAt
          ? `Son guncelleme ${result.updatedAt} tarihinde alindi.`
          : "Supabase kaydi yoksa fallback landing icerigi ile render edilir.",
        badge: result.error ? "Depolama uyarisi" : "CMS hazir",
      }}
    >
      <WorkspaceHighlight
        eyebrow="Vitrin akisi"
        title="Hero, CTA, branslar, haberler ve footer ayni icerik modelinden besleniyor."
        description="Bu editor public landing page ile ayni veri omurgasini kullanir; admin disindaki roller yalnizca sonucu gorur."
        badge="CMS-ready"
        className="bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)]"
      />
      <WorkspacePanel
        title="Landing editoru"
        description="Section bazli icerik duzenleme, logo ve gorsel upload, CTA ve footer yonetimi bu panelde toplanir."
        contentClassName="pt-0"
      >
        <AdminLandingEditor
          initialContent={result.content}
          updatedAt={result.updatedAt}
          storageError={result.error}
        />
      </WorkspacePanel>
    </DashboardPage>
  );
}
