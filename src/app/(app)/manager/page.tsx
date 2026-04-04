import { DataTable } from "@/components/data-table";
import { DashboardPage } from "@/components/dashboard-page";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAnnouncementsData,
  getManagerMetrics,
  getManagerStudents,
  getSessionsData,
} from "@/lib/dashboard-data";

export default async function ManagerPage() {
  const [metrics, students, announcements, sessions] = await Promise.all([
    getManagerMetrics(),
    getManagerStudents(),
    getAnnouncementsData(),
    getSessionsData(),
  ]);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Gunluk operasyon"
      title="Yonetici genel bakisi"
      description="Stitch'teki dashboard dili, kayit, seans, finans ve iletisim akisini ayni sakin yuzeyde yonetmek icin yeniden kuruldu."
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Bugunun kritik ogrenci listesi</CardTitle>
            <CardDescription>
              Devam, bakiye ve saha sorumlusu ayni tabloda toplanir; kalabalik card mozayigi yerine net operasyon layoutu tercih edilir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { key: "name", label: "Ogrenci" },
                { key: "program", label: "Program" },
                { key: "attendance", label: "Devam" },
                { key: "balance", label: "Bakiye" },
                { key: "status", label: "Durum" },
              ]}
              rows={students}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yayin takvimi</CardTitle>
            <CardDescription>Kurum geneli duyurular ve saha bazli operasyon notlari ayni akista izlenir.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
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
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.title}>
            <CardHeader>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>
                {session.slot} · {session.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-6 text-muted-foreground">
                Koc: {session.coach}
                <br />
                Roster: {session.roster}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </DashboardPage>
  );
}
