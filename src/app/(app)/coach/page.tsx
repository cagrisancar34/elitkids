import { DashboardPage } from "@/components/dashboard-page";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoachMetrics, getSessionsData } from "@/lib/dashboard-data";

export default async function CoachPage() {
  const [metrics, sessions] = await Promise.all([getCoachMetrics(), getSessionsData()]);

  return (
    <DashboardPage
      role="coach"
      eyebrow="Saha operasyonu"
      title="Koc gunluk paneli"
      description="Koc yuzeyi, dikkat dagitan yonetim detaylarini ayiklayip roster, yoklama ve seans hazirligina odaklanir."
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.title}>
            <CardHeader>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription>{session.slot}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>Alan: {session.location}</p>
              <p>Roster: {session.roster}</p>
              <p>Hazirlik: Buz saati ve ekipman onayi bekliyor.</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </DashboardPage>
  );
}
