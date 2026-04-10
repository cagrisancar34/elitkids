import { DashboardPage } from "@/components/dashboard-page";
import { MarkAllNotificationsReadForm } from "@/components/mark-all-notifications-read-form";
import { MetricCard } from "@/components/metric-card";
import {
  WorkspaceContentLayout,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceHighlight,
} from "@/components/operations-workspace";
import { ParentNotificationForm } from "@/components/parent-notification-form";
import { ParentReportCardsPanel } from "@/components/parent-report-cards-panel";
import {
  getAnnouncementsData,
  getChargeData,
  getParentNotificationsData,
  getParentMetrics,
  getParentReportCards,
  getSessionsData,
} from "@/lib/dashboard-data";

export default async function ParentPage() {
  const [metrics, sessions, charges, announcements, notifications, reportCards] = await Promise.all([
    getParentMetrics(),
    getSessionsData(),
    getChargeData(),
    getAnnouncementsData(),
    getParentNotificationsData(),
    getParentReportCards(),
  ]);

  return (
    <DashboardPage
      role="parent"
      eyebrow="Mobil once aile paneli"
      title="Mina Kaya icin haftalik ozet"
      description="Veli yuzeyi; program, devam ve odeme durumunu belirsizlik yaratmadan tek akista sunar."
      primaryAction={{ href: "/parent/support", label: "Destek talebi" }}
      contextCard={{
        eyebrow: "Aile baglami",
        title: `${sessions.length} ders · ${charges.length} finans kalemi`,
        description: "Veli deneyiminde netlik once gelir; program, bildirim ve karne sinyalleri tek yerde gorunur.",
        badge: `${reportCards.length} karne`,
      }}
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <WorkspaceContentLayout className="xl:grid-cols-[minmax(0,1fr)_360px]">
        <WorkspaceMainColumn>
          <WorkspacePanel title="Yaklasan seanslar" description="Mobil ekranlarda da rahat okunacak sade takvim akisi." contentClassName="grid gap-3">
            {sessions.slice(0, 2).map((session) => (
              <div key={session.title} className="surface-muted rounded-[1.3rem] p-4">
                <div className="font-medium text-foreground">{session.title}</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {session.slot} · {session.location}
                </div>
              </div>
            ))}
          </WorkspacePanel>
          <WorkspacePanel title="Finans ozeti" description="Yaklasan odemeler ve acik kalemler tek yerde toplanir." contentClassName="grid gap-3">
            {charges.slice(0, 2).map((charge) => (
              <div key={charge.item} className="surface-panel rounded-[1.3rem] border border-white/40 p-4">
                <div className="font-medium text-foreground">{charge.item}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {charge.dueDate} · {charge.amount}
                </div>
              </div>
            ))}
          </WorkspacePanel>
          <WorkspacePanel title="Karne ozeti" description="Koc tarafindan kaydedilen gelisim raporu burada gorunur.">
            <ParentReportCardsPanel reportCards={reportCards.slice(0, 1)} />
          </WorkspacePanel>
          <WorkspacePanel title="Duyurular" description="Veliyi ilgilendiren guncellemeler net ve kisa metinlerle aktarilir." contentClassName="grid gap-4">
            {announcements.map((announcement) => (
              <div key={announcement.title} className="surface-muted rounded-[1.3rem] p-4">
                <div className="font-medium text-foreground">{announcement.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{announcement.summary}</p>
              </div>
            ))}
          </WorkspacePanel>
          <WorkspacePanel title="Bildirimler" description="In-app bildirimler okundu ve okunmadi durumuyla veli panelinden yonetilir." contentClassName="grid gap-4">
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
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Aile deneyimi"
            title="Program, bildirim ve karne aynı dilde sakince okunuyor."
            description="Mobil once veli akisi korunurken, bu yuzey de artik ayni operasyon workspace ailesinden geliyor."
            badge="Mobil once"
          />
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
