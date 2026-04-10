import { AnnouncementComposer } from "@/components/announcement-composer";
import { AnnouncementsPanel } from "@/components/announcements-panel";
import { DashboardPage } from "@/components/dashboard-page";
import { NotificationQueuePanel } from "@/components/notification-queue-panel";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import {
  getAnnouncementsData,
  getNotificationData,
  getSupportThreadsData,
} from "@/lib/dashboard-data";

export default async function ManagerCommunicationPage() {
  const [announcements, notifications, supportThreads] = await Promise.all([
    getAnnouncementsData(),
    getNotificationData(),
    getSupportThreadsData(),
  ]);
  const queuedNotifications = notifications.filter((item) =>
    item.status.toLocaleLowerCase("tr-TR").includes("hazir"),
  );
  const openThreads = supportThreads.filter((thread) =>
    thread.status.toLocaleLowerCase("tr-TR").includes("bekli"),
  );

  return (
    <DashboardPage
      role="manager"
      eyebrow="Duyuru ve mesajlasma"
      title="Iletisim"
      description="Duyurular, bildirim kuyrugu ve destek akislarini ayni operasyon haberlesme katmaninda yonet."
      primaryAction={{ href: "/manager/communication", label: "Yeni duyuru" }}
      contextCard={{
        eyebrow: "Canli iletisim",
        title: `${announcements.length} yayin · ${queuedNotifications.length} kuyruk`,
        description: "Kuruma giden mesajlar ile veliden gelen destek akisini ayni iletişim workspace icinde birlestiriyoruz.",
        badge: `${openThreads.length} acik talep`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Aktif duyuru"
          value={announcements.length}
          description="Kullanicilara acilmis yayin ve operasyon duyurulari."
          badge="Yayin"
        />
        <WorkspaceKpiCard
          label="Bildirim kuyrugu"
          value={queuedNotifications.length}
          description="Henuz okunmamis veya kuyrukta kalan bilgilendirmeler."
          accent="amber"
          badge="Kuyruk"
        />
        <WorkspaceKpiCard
          label="Destek talebi"
          value={supportThreads.length}
          description="Veli tarafindan acilan tum destek thread kayitlari."
          accent="violet"
          badge="Thread"
        />
        <WorkspaceKpiCard
          label="Acil cevap"
          value={openThreads.length}
          description="Yanit bekleyen ve ekibin donmesi gereken mesajlar."
          accent="red"
          badge="Bekliyor"
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Duyurular"
            description="Hedef rol, yayin zamani ve aciklama ile kurum cıkislarini soldan takip et."
            contentClassName="pt-0"
          >
            <AnnouncementsPanel announcements={announcements} />
          </WorkspacePanel>
          <WorkspacePanel
            title="Bildirim kuyrugu"
            description="In-app bildirimlerin durumunu, okundu bilgisini ve kanal dagilimini ikinci panelde gor."
            contentClassName="pt-0"
          >
            <NotificationQueuePanel notifications={notifications} />
          </WorkspacePanel>
        </WorkspaceMainColumn>

        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Mesajlasma merkezi"
            title="Yayin, bildirim ve destek ayni aileden geliyor."
            description="Eski duyuru sayfasini ayri bir modula cevirdik; artik kurum iletisim operasyonu daha net okunuyor."
            badge="Iletisim"
          />
          <WorkspacePanel
            title="Yeni duyuru"
            description="Kurum geneline, koca veya veli kitlesine hedefli mesaj gonder."
          >
            <AnnouncementComposer />
          </WorkspacePanel>
          <WorkspacePanel
            title="Destek bekleyenler"
            description="Veli destek isteklerinden acik olanlar once bu panelde gorunur."
            contentClassName="grid gap-3"
          >
            {supportThreads.length ? (
              supportThreads.map((thread) => (
                <div key={`${thread.subject}-${thread.updatedAt}`} className="surface-muted rounded-[1.2rem] p-4">
                  <div className="font-medium text-foreground">{thread.subject}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{thread.updatedAt}</div>
                  <div className="mt-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                    {thread.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-muted rounded-[1.2rem] p-4 text-sm text-muted-foreground">
                Acik destek talebi bulunmuyor.
              </div>
            )}
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
