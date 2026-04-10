import { DashboardPage } from "@/components/dashboard-page";
import { MetricCard } from "@/components/metric-card";
import { WorkspacePanel } from "@/components/operations-workspace";
import { getCoachMetrics, getSessionsData } from "@/lib/dashboard-data";

export default async function CoachPage() {
  const [metrics, sessions] = await Promise.all([getCoachMetrics(), getSessionsData()]);

  return (
    <DashboardPage
      role="coach"
      eyebrow="Koc"
      title="Koc paneli"
      primaryAction={{ href: "/coach/sessions", label: "Yoklamaya git" }}
      contextCard={{
        eyebrow: "Bugun",
        title: `${sessions.length} seans`,
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
            contentClassName="space-y-2 text-sm leading-6 text-muted-foreground"
          >
            <>
              <p>Saat: {session.slot}</p>
              <p>Alan: {session.location}</p>
              <p>Roster: {session.roster}</p>
              <p>Hazirlik: Yoklama ve alan duzeni kontrol edilmeli.</p>
            </>
          </WorkspacePanel>
        ))}
      </section>
    </DashboardPage>
  );
}
