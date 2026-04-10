import { CoachSessionsPanel } from "@/components/coach-sessions-panel";
import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceContentLayout, WorkspaceHighlight, WorkspaceMainColumn, WorkspaceSideColumn } from "@/components/operations-workspace";
import { getCoachSessionBoards } from "@/lib/dashboard-data";

export default async function CoachSessionsPage() {
  const sessions = await getCoachSessionBoards();

  return (
    <DashboardPage
      role="coach"
      eyebrow="Yoklama ve notlar"
      title="Seans akisi"
      description="Her seans icin hizli yoklama, saha notu ve veliye acik geribildirim satirlari ayni blokta dusunuldu."
      primaryAction={{ href: "/coach/sessions", label: "Seans akisini ac" }}
      contextCard={{
        eyebrow: "Seans sinyali",
        title: `${sessions.length} seans karti hazir`,
        description: "Kocta hedef, yoklama ve not akisini tek bir saha odakli yuzeyde tutmak.",
        badge: "Hizli islem",
      }}
    >
      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <CoachSessionsPanel sessions={sessions} />
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Saha ritmi"
            title="Yoklama, roster ve seans notlari ayni blokta hizla isleniyor."
            description="Koc ekranı daha sade kalıyor ama Stitch'teki yuzey hiyerarsisini ve guclu baslik ritmini koruyor."
            badge="Saha odagi"
          />
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
