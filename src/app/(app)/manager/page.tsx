import { DataTable } from "@/components/data-table";
import { DashboardPage } from "@/components/dashboard-page";
import { MetricCard } from "@/components/metric-card";
import {
  WorkspaceContentLayout,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceHighlight,
} from "@/components/operations-workspace";
import {
  getAnnouncementsData,
  getManagerMetrics,
  getManagerStudents,
  getChargeData,
  getSessionsData,
} from "@/lib/dashboard-data";

export default async function ManagerPage() {
  const [metrics, students, announcements, sessions, charges] = await Promise.all([
    getManagerMetrics(),
    getManagerStudents(),
    getAnnouncementsData(),
    getSessionsData(),
    getChargeData(),
  ]);

  const pendingCharges = charges.filter((charge) => !charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const pendingRisk = pendingCharges.slice(0, 4);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Gunluk operasyon"
      title="Yonetici genel bakisi"
      description="Stitch'teki dashboard dili, kayit, seans, finans ve iletisim akisini ayni sakin yuzeyde yonetmek icin yeniden kuruldu."
      primaryAction={{ href: "/manager/students", label: "Yeni ogrenci" }}
      contextCard={{
        eyebrow: "Operasyon sinyali",
        title: `${sessions.length} seans · ${pendingCharges.length} acik hareket`,
        description: "Gunluk saha akisi, tahsilat riski ve yayin kuyrugu ayni operasyon yuzeyinde toplanir.",
        badge: "Canli izleme",
      }}
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Bugunun kritik ogrenci listesi"
            description="Devam, bakiye ve saha sorumlusu ayni tabloda toplanir; kalabalik card mozayigi yerine net operasyon layoutu tercih edilir."
          >
            <DataTable
              columns={[
                { key: "name", label: "Ogrenci" },
                { key: "program", label: "Program" },
                { key: "attendance", label: "Devam" },
                { key: "balance", label: "Bakiye" },
                { key: "status", label: "Durum" },
              ]}
              rows={students.map((student) => ({
                name: student.name,
                program: student.program,
                attendance: student.attendance,
                balance: student.balance,
                status: student.status,
              }))}
            />
          </WorkspacePanel>

          <section className="grid gap-6 xl:grid-cols-3">
            {sessions.map((session) => (
              <WorkspacePanel
                key={session.title}
                title={session.title}
                description={`${session.slot} · ${session.location}`}
                contentClassName="text-sm leading-6 text-muted-foreground"
              >
                <>
                  Koc: {session.coach}
                  <br />
                  Roster: {session.roster}
                </>
              </WorkspacePanel>
            ))}
          </section>
        </WorkspaceMainColumn>

        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Yayin takvimi"
            title="Iletisim, saha ve tahsilat ayni ritimde ilerliyor."
            description="Operasyon workspace mantiginda sag kolon, karar alman gereken ozetleri ve mini aksiyonlari tek yerde topluyor."
            badge={`${announcements.length} yayin`}
          />
          <WorkspacePanel
            title="Yayin akisi"
            description="Kurum geneli duyurular ve saha bazli operasyon notlari ayni akista izlenir."
            contentClassName="grid gap-4"
          >
            {announcements.map((announcement) => (
              <div key={announcement.title} className="surface-muted rounded-[1.4rem] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-medium text-foreground">{announcement.title}</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-primary">{announcement.audience}</div>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{announcement.summary}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">{announcement.time}</p>
              </div>
            ))}
          </WorkspacePanel>
          <WorkspacePanel
            title="Oncelikli finans riski"
            description="Takip ve kapanis gerektiren acik hareketler once sag kolonda taranir."
            contentClassName="grid gap-3"
          >
            {pendingRisk.length ? (
              pendingRisk.map((charge) => (
                <div key={`${charge.item}-${charge.dueDate}`} className="surface-muted rounded-[1.2rem] p-4">
                  <div className="font-medium text-foreground">{charge.item}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{charge.dueDate}</div>
                  <div className="mt-3 inline-flex rounded-full bg-amber-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    {charge.amount} · {charge.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-muted rounded-[1.2rem] p-4 text-sm text-muted-foreground">
                Bugun icin acik risk kaydi yok.
              </div>
            )}
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
