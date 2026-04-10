import { DashboardPage } from "@/components/dashboard-page";
import { MetricCard } from "@/components/metric-card";
import { WorkspacePanel } from "@/components/operations-workspace";
import { getCoachMetrics, getSessionsData } from "@/lib/dashboard-data";

export default async function CoachPage() {
  const [metrics, sessions] = await Promise.all([getCoachMetrics(), getSessionsData()]);

  return (
    <DashboardPage
      role="coach"
      eyebrow="Saha operasyonu"
      title="Koc gunluk paneli"
      description="Koc yuzeyi, dikkat dagitan yonetim detaylarini ayiklayip roster, yoklama ve seans hazirligina odaklanir."
      primaryAction={{ href: "/coach/sessions", label: "Yoklamaya git" }}
      contextCard={{
        eyebrow: "Saha ritmi",
        title: `${sessions.length} seans bugun akista`,
        description: "Kocta odak, roster, hazirlik ve hizli yoklama kararlarinin ayni yuzeyde kalmasi.",
        badge: "Koc modu",
      }}
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {sessions.map((session) => (
          <WorkspacePanel
            key={session.title}
            title={session.title}
            description={session.slot}
            contentClassName="space-y-2 text-sm leading-6 text-muted-foreground"
          >
            <>
              <p>Alan: {session.location}</p>
              <p>Roster: {session.roster}</p>
              <p>Hazirlik: Buz saati ve ekipman onayi bekliyor.</p>
            </>
          </WorkspacePanel>
        ))}
      </section>
    </DashboardPage>
  );
}
