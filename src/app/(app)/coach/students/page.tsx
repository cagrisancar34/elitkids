import { CoachStudentsPanel } from "@/components/coach-students-panel";
import { DashboardPage } from "@/components/dashboard-page";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
} from "@/components/operations-workspace";
import { getCoachStudents, getStudentDetailQuestions } from "@/lib/dashboard-data";

export default async function CoachStudentsPage() {
  const [students, questions] = await Promise.all([getCoachStudents(), getStudentDetailQuestions()]);

  return (
    <DashboardPage
      role="coach"
      eyebrow="Bagli roster"
      title="Ogrenci listeleri"
      description="Koc sadece kendi seans ve program baglamindaki ogrencileri gorur; finansal detaylar bilerek bu yuzeyde acilmaz."
      primaryAction={{ href: "/coach/students", label: "Detay gir" }}
      contextCard={{
        eyebrow: "Roster sinyali",
        title: `${students.length} ogrenci koc gorunumunde`,
        description: "Finans ve sistem gurultusu gizlenir; sadece saha icin anlamli sinyaller acik kalir.",
        badge: "Saha filtreli",
      }}
    >
      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Roster listesi"
            description="Saha icin gerekli sinyaller acik, gereksiz sistem ayrintilari kapali tutulur."
            contentClassName="pt-0"
          >
            <CoachStudentsPanel students={students} questions={questions} />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Koc odagi"
            title="Sadece saha icin anlamli sinyaller acik kalir."
            description="Finans ve sistem gurultusu cikarildi; koc kendi grubunu ve devam ritmini hizlica okuyabiliyor."
            badge="Saha odagi"
          />
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
