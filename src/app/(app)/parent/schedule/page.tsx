import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceContentLayout, WorkspaceHighlight, WorkspaceMainColumn, WorkspaceSideColumn } from "@/components/operations-workspace";
import { ParentSchedulePanel } from "@/components/parent-schedule-panel";
import { getSessionsData } from "@/lib/dashboard-data";

export default async function ParentSchedulePage() {
  const sessions = await getSessionsData();

  return (
    <DashboardPage
      role="parent"
      eyebrow="Program takvimi"
      title="Yaklasan dersler"
      description="Veli deneyiminde takvim, gereksiz tablo karmasasi olmadan okunur ve hizli aksiyonlar icin uygun olur."
      primaryAction={{ href: "/parent/schedule", label: "Takvimi ac" }}
      contextCard={{
        eyebrow: "Haftalik akis",
        title: `${sessions.length} yaklasan ders`,
        description: "Takvim daha yumusak ama yine Stitch ailesine ait; yogun tablo yerine okunakli kart akisi kullaniliyor.",
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
            title="Yaklasan dersler veli icin tek bakista guven verici olmali."
            description="Takvim daha yumusak ama yine Stitch ailesine ait; yogun tablo yerine okunakli kart akisi kullaniliyor."
            badge="Takvim"
          />
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
