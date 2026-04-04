import { AnnouncementComposer } from "@/components/announcement-composer";
import { AnnouncementsPanel } from "@/components/announcements-panel";
import { DashboardPage } from "@/components/dashboard-page";
import { NotificationQueuePanel } from "@/components/notification-queue-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnouncementsData, getNotificationData } from "@/lib/dashboard-data";

export default async function ManagerAnnouncementsPage() {
  const [announcements, notifications] = await Promise.all([
    getAnnouncementsData(),
    getNotificationData(),
  ]);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Iletisim akisi"
      title="Duyurular ve bildirimler"
      description="In-app first stratejisine uygun olarak duyuru yayini, hedef rol secimi ve operasyonel aksiyon kuyrugu ayni yerde toplandi."
    >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Son yayinlar</CardTitle>
              <CardDescription>Rol ve hedef grup bazli planlanmis icerik akisi.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementsPanel announcements={announcements} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bildirim kuyrugu</CardTitle>
              <CardDescription>Kanal bagimsiz notification modeli icin hazir kuyruk mantigi.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationQueuePanel notifications={notifications} />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Yayin akisi</div>
            <div className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.05em]">
              Duyuru, hedef rol ve notification kuyrugu artik tek operasyon hattinda.
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Stitch duzenindeki gibi ana yayin listesi solda, yeni aksiyon ve kural notlari sagda akiyor.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Yeni duyuru olustur</CardTitle>
              <CardDescription>Yayin, announcement ve notification tablolarina birlikte yazilir.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementComposer />
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardPage>
  );
}
