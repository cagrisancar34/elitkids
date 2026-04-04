import { DataTable } from "@/components/data-table";
import { DashboardPage } from "@/components/dashboard-page";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminMetrics, getAdminNotifications } from "@/lib/dashboard-data";

const accessMatrix = [
  { scope: "Rol matrisleri", owner: "Admin", status: "Aktif" },
  { scope: "Supabase RLS politikasi", owner: "Admin", status: "Aktif" },
  { scope: "Audit izlemesi", owner: "Admin", status: "Takip" },
];

export default async function AdminPage() {
  const [metrics, notifications] = await Promise.all([
    getAdminMetrics(),
    getAdminNotifications(),
  ]);

  return (
    <DashboardPage
      role="admin"
      eyebrow="Sistem kontrol merkezi"
      title="Yetki ve guvenlik omurgasi"
      description="Admin yuzeyi Supabase auth, RLS politikasi, kurum geneli kullanici modeli ve kritik sistem ayarlarini tek merkezden yonetmek icin tasarlandi."
    >
      <section className="grid gap-4 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Yetki matrisi</CardTitle>
            <CardDescription>
              Yonetici sistem ayarlarina yazamaz; koc sadece saha odakli varliklari, veli ise yalnizca bagli ogrencilerini gorur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { key: "scope", label: "Alan" },
                { key: "owner", label: "Sorumlu rol" },
                { key: "status", label: "Durum" },
              ]}
              rows={accessMatrix}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yayin bekleyen sistem olaylari</CardTitle>
            <CardDescription>In-app first bildirim omurgasi uzerinden desteklenen operasyonel sinyaller.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {notifications.map((notification) => (
              <div key={notification.title} className="surface-muted rounded-[1.4rem] p-4">
                <div className="font-medium text-foreground">{notification.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {notification.channel} · {notification.status}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </DashboardPage>
  );
}
