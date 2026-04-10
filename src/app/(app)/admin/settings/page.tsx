import { AdminSettingsTabs } from "@/components/admin-settings-tabs";
import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceHighlight, WorkspaceKpiCard, WorkspaceStatGrid } from "@/components/operations-workspace";
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
      primaryAction={{ href: "/admin/settings", label: "Kurum ayarlarini ac" }}
      contextCard={{
        eyebrow: "Sistem baglami",
        title: organization?.name ?? "Kurum baglami kurulacak",
        description: organization
          ? "Kurum, sube ve sezon yapisi ayni ayar workspace icinde yonetiliyor."
          : "Ilk kurum kaydini bu ekrandan olusturup admin profilini baglayabilirsin.",
        badge: organization ? "Ayarlar aktif" : "Ilk kurulum",
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard label="Aktif sube" value={activeBranches} description="Operasyon akisinda canli gorunen lokasyonlar." badge="Canli" />
        <WorkspaceKpiCard label="Pasif sube" value={inactiveBranches} description="Gecmis kayitlari korunan ama su an kullanilmayan lokasyonlar." accent="amber" badge="Pasif" />
        <WorkspaceKpiCard label="Arsivlenen sube" value={archivedBranches} description="Silmek yerine korunan, sadece referans icin tutulan subeler." accent="red" badge="Arsiv" />
        <WorkspaceKpiCard label="Varsayilan sezon" value={defaultSeasons} description="Yeni planlamada birincil referans olarak kullanilan donem." accent="violet" badge="Sezon" />
      </WorkspaceStatGrid>

      {!organization ? (
        <WorkspaceHighlight
          eyebrow="Ilk kurulum"
          title="Kurum kaydi henuz bagli degil."
          description="Bu durumdayken Sube ve Sezon sekmeleri baglam bulamaz. Once Kurum sekmesinden ilk organization kaydini olusturman gerekiyor."
          badge="Kurum gerekli"
          className="bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)]"
        />
      ) : null}

      <section>
        <AdminSettingsTabs organization={organization} branches={branches} seasons={seasons} />
      </section>
    </DashboardPage>
  );
}
