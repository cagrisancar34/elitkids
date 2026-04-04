import { AdminLandingEditor } from "@/components/admin-landing-editor";
import { DashboardPage } from "@/components/dashboard-page";
import { getLandingContentFromStorage } from "@/lib/landing-content-server";

export default async function AdminLandingPage() {
  const result = await getLandingContentFromStorage();

  return (
    <DashboardPage
      role="admin"
      eyebrow="Vitrin yonetimi"
      title="Landing page editoru"
      description="Anasayfada gorunen hero, brans kartlari, haberler, CTA ve footer alanlari yalnizca admin tarafindan bu panelden guncellenir."
    >
      <AdminLandingEditor
        initialContent={result.content}
        updatedAt={result.updatedAt}
        storageError={result.error}
      />
    </DashboardPage>
  );
}
