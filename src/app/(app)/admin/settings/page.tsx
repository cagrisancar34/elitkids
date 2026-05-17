import { AdminSettingsTabs } from "@/components/admin-settings-tabs";
import { AppShell } from "@/components/app-shell";
import {
  getBranchSettingsData,
  getOrganizationSettingsData,
  getSeasonSettingsData,
} from "@/lib/dashboard/admin-data";
import { getWhatsAppSettingsOverview } from "@/lib/whatsapp-server";
import { MapPin, Archive, AlertTriangle, CalendarDays } from "lucide-react";

export default async function AdminSettingsPage() {
  const [organization, branches, seasons, whatsappOverview] = await Promise.all([
    getOrganizationSettingsData(),
    getBranchSettingsData(),
    getSeasonSettingsData(),
    getWhatsAppSettingsOverview(),
  ]);

  const activeBranches = branches.filter((branch) => branch.active && !branch.archived).length;
  const inactiveBranches = branches.filter((branch) => !branch.active && !branch.archived).length;
  const archivedBranches = branches.filter((branch) => branch.archived).length;
  const defaultSeasons = seasons.filter((season) => season.isDefault).length;

  return (
    <AppShell
      role="admin"
      eyebrow="Kritik Konfigürasyon"
      title="Sistem Ayarları"
      primaryAction={{ href: "/admin/settings", label: "Kurum Ayarlarını Aç" }}
      contextCard={{
        eyebrow: "Mevcut Durum",
        title: organization?.name ?? "Kurum bağlamı kurulacak",
        badge: organization ? "Ayarlar Aktif" : "İlk Kurulum",
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100/50 p-2.5 rounded-xl"><MapPin className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">Canlı Merkez</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">{activeBranches}</div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100/50 p-2.5 rounded-xl"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Pasif Şube</div>
          </div>
          <div className="text-4xl font-black text-amber-950">{inactiveBranches}</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100/50 p-2.5 rounded-xl"><Archive className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">Arşivlenen</div>
          </div>
          <div className="text-4xl font-black text-rose-950">{archivedBranches}</div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100/50 p-2.5 rounded-xl"><CalendarDays className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">Baz Sezon</div>
          </div>
          <div className="text-4xl font-black text-violet-950">{defaultSeasons}</div>
        </div>
      </div>

      {!organization ? (
        <div className="mb-10 rounded-[2rem] bg-rose-500 bg-[linear-gradient(135deg,#f43f5e_0%,#be123c_100%)] p-8 text-white shadow-lg border border-rose-400">
           <h3 className="text-xl font-black mb-2 flex items-center gap-2"><AlertTriangle /> Kurum Kaydı Gerekli</h3>
           <p className="text-rose-100 font-medium">Lütfen devam etmeden önce kuruluş tanımınızı tamamlayın.</p>
        </div>
      ) : null}

      <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
        {/* Settings tabs component left intact but inside luxury envelope */}
        <div className="[&_.tab-list]:bg-slate-50 [&_.tab-list]:p-2 [&_.tab-list]:rounded-2xl [&_.tab-trigger]:rounded-xl [&_.tab-trigger[data-state=active]]:shadow-md">
          <AdminSettingsTabs
            organization={organization}
            branches={branches}
            seasons={seasons}
            whatsappOverview={whatsappOverview}
          />
        </div>
      </div>
    </AppShell>
  );
}
