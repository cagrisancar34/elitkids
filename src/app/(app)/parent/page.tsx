import Link from "next/link";

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
  const totalOutstanding = charges.reduce((sum, charge) => {
    const digits = charge.amount.replace(/[^\d]/g, "");
    return sum + Number(digits || 0);
  }, 0);
  const unreadNotifications = notifications.filter((notification) => notification.status !== "read").length;

  return (
    <DashboardPage
      role="parent"
      eyebrow="Veli"
      title="Aile paneli"
      primaryAction={{ href: "/parent/support", label: "Destek talebi" }}
      contextCard={{
        eyebrow: "Durum",
        title: `${sessions.length} ders · ₺${totalOutstanding.toLocaleString("tr-TR")} acik bakiye`,
        badge: `${reportCards.length} karne kaydi`,
      }}
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <WorkspaceContentLayout className="xl:grid-cols-[minmax(0,1fr)_360px]">
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Aile ozeti"
            contentClassName="grid gap-4 lg:grid-cols-3"
          >
            <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(2,83,205,0.1),rgba(2,83,205,0.03))] p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Yaklasan ders</div>
              <div className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{sessions.length}</div>
            </div>
            <div className="rounded-[1.5rem] bg-amber-500/10 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">Acik aidat</div>
              <div className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">₺{totalOutstanding.toLocaleString("tr-TR")}</div>
            </div>
            <div className="rounded-[1.5rem] bg-violet-500/10 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700">Okunmamis bildirim</div>
              <div className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{unreadNotifications}</div>
            </div>
          </WorkspacePanel>
          <WorkspacePanel title="Yaklasan seanslar" contentClassName="grid gap-3">
            {sessions.length ? (
              sessions.slice(0, 3).map((session) => (
                <div key={session.title} className="workspace-panel rounded-[1.45rem] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{session.title}</div>
                      <div className="mt-2 text-sm leading-6 text-muted-foreground">
                        {session.slot} · {session.location}
                      </div>
                    </div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                      Yaklasiyor
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-muted rounded-[1.3rem] p-4 text-sm text-muted-foreground">
                Yaklasan seans yok.
              </div>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Finans ozeti" contentClassName="grid gap-3">
            {charges.length ? (
              charges.slice(0, 3).map((charge) => (
                <div key={charge.item} className="workspace-panel rounded-[1.45rem] p-4">
                  <div className="font-medium text-foreground">{charge.item}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {charge.dueDate} · {charge.amount}
                  </div>
                  <div className="mt-3 inline-flex rounded-full bg-amber-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    {charge.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-muted rounded-[1.3rem] p-4 text-sm text-muted-foreground">
                Acik odeme kalemi yok.
              </div>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Karne ozeti">
            <ParentReportCardsPanel reportCards={reportCards.slice(0, 1)} />
          </WorkspacePanel>
          <WorkspacePanel title="Duyurular" contentClassName="grid gap-4">
            {announcements.length ? (
              announcements.map((announcement) => (
                <div key={announcement.title} className="workspace-panel rounded-[1.45rem] p-4">
                  <div className="font-medium text-foreground">{announcement.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{announcement.summary}</p>
                </div>
              ))
            ) : (
              <div className="surface-muted rounded-[1.3rem] p-4 text-sm text-muted-foreground">
                Guncel duyuru yok.
              </div>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Bildirimler" contentClassName="grid gap-4">
            {notifications.length ? <MarkAllNotificationsReadForm /> : null}
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="workspace-panel rounded-[1.45rem] p-4"
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
            eyebrow="Aile"
            title="Kisa yollar"
            badge="Mobil once"
          />
          <WorkspacePanel
            title="Hizli ulasim"
            contentClassName="grid gap-3"
          >
            <Link
              href="/parent/schedule"
              className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-5 text-sm font-semibold text-secondary-foreground transition hover:bg-[#c9daf8]"
            >
              Takvimi ac
            </Link>
            <Link
              href="/parent/payments"
              className="inline-flex h-11 items-center justify-center rounded-full bg-white/80 px-5 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Odemeleri gor
            </Link>
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
