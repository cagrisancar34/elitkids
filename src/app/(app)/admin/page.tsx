import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { DashboardPage } from "@/components/dashboard-page";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import { getAdminMetrics, getAdminNotifications } from "@/lib/dashboard-data";

const accessMatrix = [
  { scope: "Rol matrisleri", owner: "Admin", status: "Aktif" },
  { scope: "Supabase RLS politikasi", owner: "Admin", status: "Aktif" },
  { scope: "Landing page editoru", owner: "Admin", status: "Canli" },
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
      title="Yonetim omurgasi"
      description="Admin yuzeyi artik landing vitrini, rol modeli, Supabase auth ve kritik sistem ayarlarini ayni tasarim dili icinde yonetiyor."
      primaryAction={{ href: "/admin/landing", label: "Landing editorunu ac" }}
      contextCard={{
        eyebrow: "Admin baglami",
        title: `${notifications.length} sistem sinyali`,
        description: "Landing, roller, audit ve kritik ayarlar ayni admin workspace icinde ilerliyor.",
        badge: "Admin only",
      }}
    >
      <WorkspaceStatGrid>
        {metrics.map((metric) => (
          <WorkspaceKpiCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.delta}
            badge="Sistem"
          />
        ))}
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspaceHighlight
            eyebrow="Landing ve yetki merkezi"
            title="Landing page editoru, rol matrisi ve Supabase guvenligi ayni operasyon ekseninde."
            description="Yeni vitrin yapisi ile public anasayfa artik admin kontrollu bir content modeli uzerinden akiyor. Sistem rolleri ve kritik ayarlar da ayni merkezden yonetiliyor."
            badge="Kontrol merkezi"
            className="bg-[linear-gradient(135deg,#091425_0%,#13223d_65%,#152844_100%)]"
          >
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/landing"
                className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
              >
                Landing editorunu ac
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Canli landing page
              </Link>
            </div>
          </WorkspaceHighlight>
          <WorkspacePanel title="Yetki matrisi" description="Yonetici sistem ayarlarina yazamaz; landing page yazma akisi yalnizca admin tarafinda tutulur.">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Yetki matrisi
            </div>
            <DataTable
              columns={[
                { key: "scope", label: "Alan" },
                { key: "owner", label: "Sorumlu rol" },
                { key: "status", label: "Durum" },
              ]}
              rows={accessMatrix}
            />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Operasyon durumu"
            title="Kritik sistem sinyalleri artik tek sag kolonda taraniyor."
            description="Admin tarafinda audit, rol ve landing akislarinin saglik durumu ayni aile icinde ozetleniyor."
            badge={`${notifications.length} sinyal`}
            className="bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)]"
          />
          <WorkspacePanel title="Bekleyen sistem sinyalleri" description="Rol, landing ve auth omurgasindan gelen guncel bildirimler.">
            <div className="grid gap-4">
              {notifications.map((notification) => (
                <div key={notification.title} className="rounded-[1.3rem] border border-white/50 bg-[#eef3ff] px-4 py-4">
                  <div className="font-medium text-foreground">{notification.title}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {notification.channel} · {notification.status}
                  </div>
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
