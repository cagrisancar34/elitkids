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
import { getAnnouncementsData, getNotificationData } from "@/lib/dashboard-data";

export default async function ManagerAnnouncementsPage() {
  const [announcements, notifications] = await Promise.all([
    getAnnouncementsData(),
    getNotificationData(),
  ]);
  const unreadCount = notifications.filter((notification) => notification.status.toLocaleLowerCase("tr-TR").includes("bek")).length;

  return (
    <DashboardPage
      role="manager"
      eyebrow="Iletisim akisi"
      title="Duyurular ve bildirimler"
      description="In-app first stratejisine uygun olarak duyuru yayini, hedef rol secimi ve operasyonel aksiyon kuyrugu ayni yerde toplandi."
      primaryAction={{ href: "/manager/announcements", label: "Yeni duyuru" }}
      contextCard={{
        eyebrow: "Iletisim sinyali",
        title: `${announcements.length} yayin · ${notifications.length} bildirim`,
        description: "Yayin, hedef rol ve notification kuyrugu ayni operasyon hattinda ilerliyor.",
        badge: `${unreadCount} bekleyen`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard label="Yayinlar" value={announcements.length} description="Sistemde gorunen duyuru ve bilgilendirme kayitlari." badge="Announcement" />
        <WorkspaceKpiCard label="Bildirim kuyrugu" value={notifications.length} description="In-app first bildirim omurgasinda bekleyen toplam akis." accent="blue" badge="Queue" />
        <WorkspaceKpiCard label="Bekleyen aksiyon" value={unreadCount} description="Takip veya gonderim bekleyen kritik bildirimler." accent="amber" badge="Takip" />
        <WorkspaceKpiCard label="Hedef rol" value={new Set(announcements.map((item) => item.audience)).size} description="Aktif yayinlarda kullanilan hedef rol ve segment sayisi." accent="violet" badge="Segment" />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel title="Son yayinlar" description="Rol ve hedef grup bazli planlanmis icerik akisi.">
            <AnnouncementsPanel announcements={announcements} />
          </WorkspacePanel>
          <WorkspacePanel title="Bildirim kuyrugu" description="Kanal bagimsiz notification modeli icin hazir kuyruk mantigi.">
            <NotificationQueuePanel notifications={notifications} />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Yayin akisi"
            title="Duyuru, hedef rol ve notification kuyrugu artik tek operasyon hattinda."
            description="Stitch duzenindeki gibi ana yayin listesi solda, yeni aksiyon ve kural notlari sagda akiyor."
            badge="In-app first"
          />
          <WorkspacePanel
            title="Yeni duyuru olustur"
            description="Yayin, announcement ve notification tablolarina birlikte yazilir."
          >
            <AnnouncementComposer />
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
