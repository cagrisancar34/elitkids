import { AdminDetailQuestionsPanel } from "@/components/admin-detail-questions-panel";
import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceHighlight, WorkspacePanel } from "@/components/operations-workspace";
import { getStudentDetailQuestions } from "@/lib/dashboard/admin-data";

export default async function AdminDetailTemplatesPage() {
  const questions = await getStudentDetailQuestions();

  return (
    <DashboardPage
      role="admin"
      eyebrow="Karne ve detay sablonu"
      title="Detay sorulari"
      description="Detay sayfasinda hangi sorularin cikacagi, hangi alanlarin zorunlu olacagi ve karnenin hangi verilerle beslenecegi bu panelden yonetilir."
      primaryAction={{ href: "/admin/detail-templates", label: "Soru ekle" }}
      contextCard={{
        eyebrow: "Sablon sinyali",
        title: `${questions.length} aktif soru/sablon`,
        description: "Manager ve koc tarafindaki detay formlari bu admin kontrollu soru setinden beslenir.",
        badge: "Karne omurgasi",
      }}
    >
      <WorkspaceHighlight
        eyebrow="Sablon merkezi"
        title="Detay formu ve karne ciktilari tek bir soru sistemi uzerinden yonetiliyor."
        description="Admin bu yuzeyde sorulari ekler, kaldirir, pasife alir ve siralar. Manager ve koc ayni seti kullanir; veli sadece sonucu gorur."
        badge="Dinamik sorular"
        className="bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)]"
      />
      <WorkspacePanel
        title="Detay soru editoru"
        description="Soru metni, input tipi, zorunluluk, helper text ve siralama bu panelde toplanir."
        contentClassName="pt-0"
      >
        <AdminDetailQuestionsPanel questions={questions} />
      </WorkspacePanel>
    </DashboardPage>
  );
}
