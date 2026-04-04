import { AdminRoleForm } from "@/components/admin-role-form";
import { AdminUserCreateForm } from "@/components/admin-user-create-form";
import { AdminUsersPanel } from "@/components/admin-users-panel";
import { DashboardPage } from "@/components/dashboard-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminUsers } from "@/lib/dashboard-data";

export default async function AdminUsersPage() {
  const userRows = await getAdminUsers();
  const userOptions = userRows.map((user) => ({
    id: user.id,
    label: `${user.name} · ${user.role}`,
    role: user.role,
  }));

  return (
    <DashboardPage
      role="admin"
      eyebrow="Kimlik ve erisim"
      title="Kullanici ve rol yonetimi"
      description="Davet, kapsam ve rol atamasi iskeleti Supabase auth profilleri ile eslesecek sekilde kuruldu."
    >
      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Yeni kullanici ac</CardTitle>
            <CardDescription>
              Auth hesabi, profil kaydi ve ilk rol atamasi tek akista olusturulur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminUserCreateForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rol guncelle</CardTitle>
            <CardDescription>
              Mevcut ekip uyelerinin rolunu degistir ve uygulama erisimini aninda yenile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminRoleForm users={userOptions} />
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Rol dagilimi</CardTitle>
          <CardDescription>
            Auth users tablosuna baglanan profil modeli, kurum ici erisimi net sinirlarla ayirmak icin hazir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUsersPanel users={userRows} />
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
