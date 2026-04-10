import { AdminRoleForm } from "@/components/admin-role-form";
import { AdminUserCreateForm } from "@/components/admin-user-create-form";
import { AdminUsersPanel } from "@/components/admin-users-panel";
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
import { getAdminUsers } from "@/lib/dashboard-data";
import { getSupabaseServerConfig } from "@/lib/supabase/server-config";

export default async function AdminUsersPage() {
  const userRows = await getAdminUsers();
  const { isAdminConfigured } = getSupabaseServerConfig();
  const userOptions = userRows.map((user) => ({
    id: user.id,
    label: `${user.name} · ${user.role}`,
    role: user.role,
  }));
  const roleCounts = userRows.reduce<Record<string, number>>((acc, user) => {
    const key = user.role;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardPage
      role="admin"
      eyebrow="Kimlik ve erisim"
      title="Kullanici ve rol yonetimi"
      description="Davet, kapsam ve rol atamasi iskeleti Supabase auth profilleri ile eslesecek sekilde kuruldu."
      primaryAction={{ href: "/admin/users", label: "Yeni davet" }}
      contextCard={{
        eyebrow: "Kimlik sinyali",
        title: `${userRows.length} kullanici gorunuyor`,
        description: "Auth hesabi, profil ve rol atamasi admin tarafinda ayni operasyon hattindan yonetiliyor.",
        badge: isAdminConfigured ? "Yazma aktif" : "Secret gerekli",
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard label="Tum kullanicilar" value={userRows.length} description="Auth ve profil tabaninda gorunen toplam kayit." badge="Kimlik" />
        <WorkspaceKpiCard label="Admin" value={roleCounts.admin ?? 0} description="Kritik sistem alanlarina yazabilen roller." accent="red" badge="Kritik" />
        <WorkspaceKpiCard label="Yonetici" value={roleCounts.manager ?? 0} description="Operasyon ve finans akisina tam erisimli roller." accent="blue" badge="Operasyon" />
        <WorkspaceKpiCard label="Koc + Veli" value={(roleCounts.coach ?? 0) + (roleCounts.parent ?? 0)} description="Saha ve aile deneyimi tarafinda gorunen kullanicilar." accent="green" badge="Saha / aile" />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel title="Rol dagilimi" description="Auth users tablosuna baglanan profil modeli, kurum ici erisimi net sinirlarla ayirmak icin hazir." contentClassName="pt-0">
            <AdminUsersPanel users={userRows} />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Davet ve kapsam"
            title="Kullanici olusturma ve rol guncelleme ayni admin kolonunda toplanir."
            description={
              isAdminConfigured
                ? "Auth hesabi, profil kaydi ve ilk rol atamasi tek akista olusturulur."
                : "Bu ekranin yazma akislarinin calismasi icin deploy ortaminda yonetici yazma secret'i tanimli olmali."
            }
            badge={isAdminConfigured ? "Hazir" : "Secret eksik"}
          />
          <WorkspacePanel title="Yeni kullanici ac" description="Auth hesabi, profil kaydi ve ilk rol atamasi tek akista olusturulur.">
            <AdminUserCreateForm adminEnabled={isAdminConfigured} />
          </WorkspacePanel>
          <WorkspacePanel
            title="Rol guncelle"
            description="Mevcut ekip uyelerinin rolunu degistir ve uygulama erisimini aninda yenile."
          >
            <AdminRoleForm users={userOptions} adminEnabled={isAdminConfigured} />
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
