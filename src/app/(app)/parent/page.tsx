import { DashboardPage } from "@/components/dashboard-page";
import { MarkAllNotificationsReadForm } from "@/components/mark-all-notifications-read-form";
import { MetricCard } from "@/components/metric-card";
import { ParentNotificationForm } from "@/components/parent-notification-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAnnouncementsData,
  getChargeData,
  getParentNotificationsData,
  getParentMetrics,
  getSessionsData,
} from "@/lib/dashboard-data";

export default async function ParentPage() {
  const [metrics, sessions, charges, announcements, notifications] = await Promise.all([
    getParentMetrics(),
    getSessionsData(),
    getChargeData(),
    getAnnouncementsData(),
    getParentNotificationsData(),
  ]);

  return (
    <DashboardPage
      role="parent"
      eyebrow="Mobil once aile paneli"
      title="Mina Kaya icin haftalik ozet"
      description="Veli yuzeyi; program, devam ve odeme durumunu belirsizlik yaratmadan tek akista sunar."
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Yaklasan seanslar</CardTitle>
            <CardDescription>Mobil ekranlarda da rahat okunacak sade takvim akisi.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {sessions.slice(0, 2).map((session) => (
              <div key={session.title} className="surface-muted rounded-[1.3rem] p-4">
                <div className="font-medium text-foreground">{session.title}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {session.slot} · {session.location}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Finans ozeti</CardTitle>
            <CardDescription>Yaklasan odemeler ve acik kalemler tek yerde toplanir.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {charges.slice(0, 2).map((charge) => (
              <div key={charge.item} className="surface-panel rounded-[1.3rem] border border-white/40 p-4">
                <div className="font-medium text-foreground">{charge.item}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {charge.dueDate} · {charge.amount}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Duyurular</CardTitle>
            <CardDescription>Veliyi ilgilendiren guncellemeler net ve kisa metinlerle aktarilir.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {announcements.map((announcement) => (
              <div key={announcement.title} className="surface-muted rounded-[1.3rem] p-4">
                <div className="font-medium text-foreground">{announcement.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{announcement.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bildirimler</CardTitle>
            <CardDescription>In-app bildirimler okundu ve okunmadi durumuyla veli panelinden yonetilir.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {notifications.length ? <MarkAllNotificationsReadForm /> : null}
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="surface-panel rounded-[1.3rem] border border-white/40 p-4"
                >
                  <ParentNotificationForm notification={notification} />
                </div>
              ))
            ) : (
              <div className="surface-muted rounded-[1.3rem] p-4 text-sm leading-6 text-muted-foreground">
                Henuz veliye hedeflenmis bildirim yok.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </DashboardPage>
  );
}
