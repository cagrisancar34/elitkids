import { AdminSettingsTabs } from "@/components/admin-settings-tabs";
import { DashboardPage } from "@/components/dashboard-page";
import {
  getBranchSettingsData,
  getOrganizationSettingsData,
  getSeasonSettingsData,
} from "@/lib/dashboard-data";

export default async function AdminSettingsPage() {
  const [organization, branches, seasons] = await Promise.all([
    getOrganizationSettingsData(),
    getBranchSettingsData(),
    getSeasonSettingsData(),
  ]);

  const activeBranches = branches.filter((branch) => branch.active && !branch.archived).length;
  const inactiveBranches = branches.filter((branch) => !branch.active && !branch.archived).length;
  const archivedBranches = branches.filter((branch) => branch.archived).length;
  const defaultSeasons = seasons.filter((season) => season.isDefault).length;

  return (
    <DashboardPage
      role="admin"
      eyebrow="Kritik konfigurasyon"
      title="Sistem ayarlari"
      description="Bu alan yalnizca admin tarafindan yonetilir ve yonetici rolune kasitli olarak tam yazma erisimi verilmez."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-panel rounded-[1.45rem] border border-white/40 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Aktif sube
          </div>
          <div className="mt-3 font-display text-3xl text-foreground">{activeBranches}</div>
          <p className="mt-2 text-sm text-muted-foreground">Operasyon akisinda canli gorunen lokasyonlar.</p>
        </div>
        <div className="surface-panel rounded-[1.45rem] border border-white/40 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Pasif sube
          </div>
          <div className="mt-3 font-display text-3xl text-foreground">{inactiveBranches}</div>
          <p className="mt-2 text-sm text-muted-foreground">Gecmis kayitlari korunan ama su an kullanilmayan lokasyonlar.</p>
        </div>
        <div className="surface-panel rounded-[1.45rem] border border-white/40 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Arsivlenen sube
          </div>
          <div className="mt-3 font-display text-3xl text-foreground">{archivedBranches}</div>
          <p className="mt-2 text-sm text-muted-foreground">Silmek yerine korunan, sadece referans icin tutulan subeler.</p>
        </div>
        <div className="surface-panel rounded-[1.45rem] border border-white/40 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Varsayilan sezon
          </div>
          <div className="mt-3 font-display text-3xl text-foreground">{defaultSeasons}</div>
          <p className="mt-2 text-sm text-muted-foreground">Yeni planlamada birincil referans olarak kullanilan donem.</p>
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr_0.9fr]">
        <div className="xl:col-span-3">
          <AdminSettingsTabs
            organization={organization}
            branches={branches}
            seasons={seasons}
          />
        </div>
      </section>
    </DashboardPage>
  );
}
