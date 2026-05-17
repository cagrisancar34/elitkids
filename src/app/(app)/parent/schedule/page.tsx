import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceContentLayout, WorkspaceHighlight, WorkspaceMainColumn, WorkspaceSideColumn } from "@/components/operations-workspace";
import { ParentSchedulePanel } from "@/components/parent-schedule-panel";
import { getSessionsData } from "@/lib/dashboard/parent-data";

export default async function ParentSchedulePage() {
  const sessions = await getSessionsData();

  return (
    <DashboardPage
      role="parent"
      eyebrow="Veli / Planner"
      title="Yaklasan Dersler"
      description="Takvim yogunluk yaratmadan, guven veren ve hizli okunur bir akista sunulur."
      primaryAction={{ href: "/parent/schedule", label: "Takvimi ac" }}
      contextCard={{
        eyebrow: "Haftalik akis",
        title: `${sessions.length} yaklasan ders`,
        description: "Aile takvimi ders, saat ve alan iliskisini tek bakista okutur.",
        badge: "Aile takvimi",
      }}
    >
      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <ParentSchedulePanel sessions={sessions} />
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Haftalik akis"
            title="Yaklasan dersler tek bakista guven vermeli."
            description="Takvim yuzeyi saat, yer ve koc bilgisini daha sakin ama daha net bir hiyerarsiyle sunar."
            badge="Takvim"
          />
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
