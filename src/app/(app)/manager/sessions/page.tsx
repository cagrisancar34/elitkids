import { DashboardPage } from "@/components/dashboard-page";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import { SessionCreateForm } from "@/components/session-create-form";
import { SessionsPanel } from "@/components/sessions-panel";
import {
  getManagerAttendanceBoards,
  getCoachOptions,
  getProgramFormOptions,
  getProgramOptions,
  getSessionsData,
} from "@/lib/dashboard-data";

export default async function ManagerSessionsPage() {
  const [sessions, programs, coaches, attendanceBoards, formOptions] = await Promise.all([
    getSessionsData(),
    getProgramOptions(),
    getCoachOptions(),
    getManagerAttendanceBoards(),
    getProgramFormOptions(),
  ]);
  const openSessions = sessions.filter((session) => !session.roster.includes("/"));
  const assignedCoaches = new Set(sessions.map((session) => session.coach).filter((coach) => coach !== "Atanacak")).size;
  const activeLocations = new Set(sessions.map((session) => session.location)).size;

  return (
    <DashboardPage
      role="manager"
      eyebrow="Takvim ve saha"
      title="Seanslar"
      description="Koc atamalari, lokasyonlar ve doluluk gibi saha sinyalleri karmasik takvim chrome'u olmadan okunur hale getirildi."
      primaryAction={{ href: "/manager/sessions", label: "Yeni seans" }}
      contextCard={{
        eyebrow: "Takvim sinyali",
        title: `${sessions.length} aktif seans`,
        description: "Gunluk, haftalik ve liste gorunumleriyle saha planlamasi ayni modulde akiyor.",
        badge: `${activeLocations} alan`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Toplam seans"
          value={sessions.length}
          description="Gunluk ve haftalik akista gorunen aktif seans bloklari."
          badge="Takvim"
        />
        <WorkspaceKpiCard
          label="Atanan koc"
          value={assignedCoaches}
          description="Seanslara baglanmis farkli egitmen sayisi."
          accent="green"
          badge="Kadro"
        />
        <WorkspaceKpiCard
          label="Acik roster"
          value={openSessions.length}
          description="Doluluk sinyaline gore hala yer acik gorunen bloklar."
          accent="amber"
          badge="Kontenjan"
        />
        <WorkspaceKpiCard
          label="Kullanilan alan"
          value={activeLocations}
          description="Planlamada ayni anda aktif gorunen saha ve lokasyonlar."
          accent="violet"
          badge="Tesis"
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Seans takvimi"
            description="Gunluk, haftalik ve liste modlari ayni veri omurgasini kullanir; saha planlamasi tek yerde kalir."
            contentClassName="pt-0"
          >
            <SessionsPanel
              sessions={sessions}
              programs={programs}
              coaches={coaches}
              areas={formOptions.areas}
              attendanceBoards={attendanceBoards}
              showSummary={false}
            />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Saha planlama"
            title="Seans doluluklari ve alan atamalari tek bakista planlamaya donusuyor."
            description="Stitch seans ekranindaki gibi takvim hissi korunurken, roster doluluk sinyali ve yeni seans formu sag kolonda destekleniyor."
            badge="Gunluk / haftalik / liste"
          />
          <WorkspacePanel
            title="Yeni seans planla"
            description="Program, koc ve saat bilgisini ayni yerden olustur. Kayitli ogrenciler sonraki adimda roster listesine baglanir."
          >
            <SessionCreateForm programs={programs} coaches={coaches} areas={formOptions.areas} />
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
