import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { DashboardPage } from "@/components/dashboard-page";
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
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.9rem] border border-white/50 bg-[linear-gradient(135deg,#091425_0%,#13223d_65%,#152844_100%)] p-7 text-white shadow-[0_28px_90px_rgba(2,12,27,0.22)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/16 bg-sky-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
            landing ve yetki merkezi
          </div>
          <h2 className="mt-5 max-w-3xl font-display text-[2.4rem] font-black leading-[0.98] tracking-[-0.05em]">
            Landing page editoru, rol matrisi ve Supabase guvenligi ayni operasyon ekseninde.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Yeni vitrin yapisi ile public anasayfa artik admin kontrollu bir content modeli uzerinden akiyor. Sistem rolleri ve kritik ayarlar da ayni merkezden yonetiliyor.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
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
        </div>

        <div className="rounded-[1.9rem] border border-white/50 bg-[#0d1628] p-7 text-white shadow-[0_28px_90px_rgba(2,12,27,0.2)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Operasyon durumu
          </div>
          <div className="mt-4 grid gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {metric.label}
                </div>
                <div className="mt-3 font-display text-3xl font-black text-white">
                  {metric.value}
                </div>
                <div className="mt-2 text-sm text-slate-400">{metric.delta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.7rem] border border-white/50 bg-white/78 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Yetki matrisi
          </div>
          <p className="mb-5 text-sm leading-7 text-muted-foreground">
            Yonetici sistem ayarlarina yazamaz; landing page yazma akisi yalnizca admin tarafinda tutulur.
          </p>
          <DataTable
            columns={[
              { key: "scope", label: "Alan" },
              { key: "owner", label: "Sorumlu rol" },
              { key: "status", label: "Durum" },
            ]}
            rows={accessMatrix}
          />
        </div>

        <div className="rounded-[1.7rem] border border-white/50 bg-white/78 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          <div className="mb-5 text-lg font-display font-bold text-foreground">
            Bekleyen sistem sinyalleri
          </div>
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
        </div>
      </section>
    </DashboardPage>
  );
}
