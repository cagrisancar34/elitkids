import { AttendanceModal } from "@/components/attendance-modal";
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
import { getManagerAttendanceBoards } from "@/lib/dashboard-data";

export default async function ManagerAttendancePage() {
  const sessions = await getManagerAttendanceBoards();
  const totalStudents = sessions.reduce((sum, session) => sum + session.students.length, 0);
  const absentCount = sessions.reduce(
    (sum, session) => sum + session.students.filter((student) => student.status === "absent").length,
    0,
  );
  const excusedCount = sessions.reduce(
    (sum, session) => sum + session.students.filter((student) => student.status === "excused").length,
    0,
  );

  return (
    <DashboardPage
      role="manager"
      eyebrow="Yoklama merkezi"
      title="Yoklama"
      description="Yonetici, seans bazli katilimi hizli modal akislariyla gorur ve sahaya dokunmadan denetim saglar."
      primaryAction={{ href: "/manager/sessions", label: "Seans takvimini ac" }}
      contextCard={{
        eyebrow: "Katilim sinyali",
        title: `${sessions.length} seans izleniyor`,
        description: "Geldi, gelmedi ve izinli dagilimi ayni operasyon yuzeyinden okunuyor.",
        badge: `${absentCount} gelmedi`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard label="Bugunku seans" value={sessions.length} description="Yoklama acilabilen aktif seans bloklari." badge="Takvim" />
        <WorkspaceKpiCard label="Toplam roster" value={totalStudents} description="Secili seanslardaki tum ogrenci kayitlari." accent="blue" badge="Roster" />
        <WorkspaceKpiCard label="Gelmedi" value={absentCount} description="Yok durumuna cekilen ogrenci kayitlari." accent="red" badge="Risk" />
        <WorkspaceKpiCard label="Izinli" value={excusedCount} description="Mazeretli olarak isaretlenen ogrenciler." accent="amber" badge="Dikkat" />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout className="xl:grid-cols-[320px_minmax(0,1fr)]">
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Operasyon notu"
            title="Yoklama artik uzun form listesi degil, seans bazli hizli modal akisina donustu."
            description="Manager seans secip yoklamayi aninda acabilir; kocta oldugu gibi tek satirda durum ve not kaydedilir."
            badge="Hizli kaydet"
          />
        </WorkspaceSideColumn>

        <WorkspaceMainColumn>
          {sessions.map((session) => (
            <WorkspacePanel
              key={session.sessionId}
              title={session.title}
              description={`${session.slot} · ${session.location} · ${session.roster}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm leading-6 text-muted-foreground">
                  {session.students.length} ogrenci bu seansa bagli. Yoklama modali onceki kayitlari geri doldurur.
                </div>
                <AttendanceModal sessionId={session.sessionId} sessionTitle={session.title} students={session.students} />
              </div>
            </WorkspacePanel>
          ))}
        </WorkspaceMainColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
