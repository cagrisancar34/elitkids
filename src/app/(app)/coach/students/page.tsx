import { CoachStudentsPanel } from "@/components/coach-students-panel";
import { DashboardPage } from "@/components/dashboard-page";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
} from "@/components/operations-workspace";
import { getCoachStudents } from "@/lib/dashboard/coach-data";
import { getStudentDetailQuestions } from "@/lib/dashboard/shared-lookups";

export default async function CoachStudentsPage() {
  const [students, questions] = await Promise.all([getCoachStudents(), getStudentDetailQuestions()]);
  const detailSaved = students.filter((student) => student.detailSaved).length;
  const firstTimers = students.filter((student) => student.firstSessionFlag).length;
  const missingCoachNotes = students.filter((student) => !(student.coachNoteSummary ?? "").trim()).length;

  return (
    <DashboardPage
      role="coach"
      eyebrow="Koc / Collection"
      title="Roster Listesi"
      description="Koc sadece kendi grubundaki sporculari ve saha icin gerekli sinyalleri gorur."
      primaryAction={{ href: "/coach/students", label: "Detay gir" }}
      contextCard={{
        eyebrow: "Roster sinyali",
        title: `${students.length} ogrenci koc gorunumunde`,
        description: "Finansal ve sistemsel gurultu kapali; sadece saha icin gerekli sinyal acik.",
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
            description="Detay girilen sporcu sayisi, risk gorunen roster ve grup ritmi bu rail icinden okunur."
            badge="Saha odagi"
          >
            <div className="grid gap-3">
              <div className="page-subsection rounded-[1.4rem] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Detay girilen
                </div>
                <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-900">
                  {detailSaved}
                </div>
              </div>
              <div className="page-subsection rounded-[1.4rem] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Ilk kez gelen
                </div>
                <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-900">
                  {firstTimers}
                </div>
              </div>
              <div className="page-subsection rounded-[1.4rem] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Ic not eksigi
                </div>
                <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-900">
                  {missingCoachNotes}
                </div>
              </div>
            </div>
          </WorkspaceHighlight>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
