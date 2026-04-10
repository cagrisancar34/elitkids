import { AdminPreRegistrationSettingsForm } from "@/components/admin-pre-registration-settings-form";
import { DashboardPage } from "@/components/dashboard-page";
import {
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspacePanel,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import { getAdminPreRegistrationSettings } from "@/lib/pre-registration-server";

export default async function AdminPreRegistrationSettingsPage() {
  const { settings, error } = await getAdminPreRegistrationSettings();

  return (
    <DashboardPage
      role="admin"
      eyebrow="On kayit konfigurasyonu"
      title="On Kayit Ayarlari"
      description="Public landing formunda gorunecek KVKK, veli izin metni ve basvuru acik/kapali akisi bu panelden yonetilir."
      primaryAction={{ href: "/admin/pre-registration-settings", label: "Metinleri kaydet" }}
      contextCard={{
        eyebrow: "Yasal metinler",
        title: settings.formEnabled ? "Form aktif" : "Form pasif",
        description: "Landing CTA bu paneldeki metinleri runtime olarak okur. Degisiklikler yayin yuzune ayni kaynaktan yansir.",
        badge: "Admin only",
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Form durumu"
          value={settings.formEnabled ? "Acik" : "Kapali"}
          description="Public on kayit formunun yeni basvurulara acik olup olmadigini gosterir."
          badge="Landing"
        />
        <WorkspaceKpiCard
          label="KVKK metni"
          value={settings.kvkkBody.length}
          description="KVKK metnindeki toplam karakter sayisi. Metin runtime'da public forma akar."
          accent="blue"
          badge="Yasal"
        />
        <WorkspaceKpiCard
          label="Veli izin metni"
          value={settings.parentPermissionBody.length}
          description="Veli izin panelinde okunacak tam metin uzunlugu."
          accent="violet"
          badge="Izin"
        />
        <WorkspaceKpiCard
          label="Helper note"
          value={settings.helperNote.length}
          description="Form altindaki guvenlik bilgilendirmesi."
          accent="amber"
          badge="Not"
        />
      </WorkspaceStatGrid>

      <WorkspaceHighlight
        eyebrow="Public form kaynagi"
        title="Landing icindeki on kayit drawer'i bu ayarlardan beslenir."
        description="Admin metni degistirdiginde hem KVKK hem veli izin paneli yeni yaziya otomatik gecer. Manager okuyabilir ama degistiremez."
        badge="Runtime"
        className="bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)]"
      />

      <WorkspacePanel
        title="Metin editoru"
        description="KVKK, veli izin belgesi, checkbox etiketleri ve form acik/kapali durumu tek bir panelde tutulur."
      >
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        <AdminPreRegistrationSettingsForm settings={settings} />
      </WorkspacePanel>
    </DashboardPage>
  );
}
