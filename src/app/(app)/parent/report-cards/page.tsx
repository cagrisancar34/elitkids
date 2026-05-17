import { DashboardPage } from "@/components/dashboard-page";
import { ParentReportCardsPanel } from "@/components/parent-report-cards-panel";
import { getParentReportCards } from "@/lib/dashboard/parent-data";

export default async function ParentReportCardsPage() {
  const reportCards = await getParentReportCards();

  return (
    <DashboardPage
      role="parent"
      eyebrow="Gelisim takibi"
      title="Karne gorunumu"
      description="Koc tarafindan kaydedilen detaylar tamamlandiginda olusan karneler bu yuzeyde veliye acilir."
    >
      <ParentReportCardsPanel reportCards={reportCards} />
    </DashboardPage>
  );
}
