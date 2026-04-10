import { DashboardPage } from "@/components/dashboard-page";
import { PreRegistrationsPanel } from "@/components/pre-registrations-panel";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import { getOperatorPreRegistrations } from "@/lib/pre-registration-server";

export default async function ManagerPreRegistrationsPage() {
  const { records, options, error } = await getOperatorPreRegistrations();

  const newCount = records.filter((record) => record.status === "new").length;
  const reviewingCount = records.filter((record) => record.status === "reviewing").length;
  const contactedCount = records.filter((record) => record.status === "contacted").length;
  const activatedCount = records.filter((record) => record.status === "activated").length;
  const rejectedCount = records.filter((record) => record.status === "rejected").length;

  return (
    <DashboardPage
      role="manager"
      eyebrow="Lead -> aktivasyon"
      title="On Kayitlar"
      description="Landing'den gelen basvurular once burada toplanir. Inceleme ve onaydan sonra aktif ogrenci kaydina donusturulur."
      primaryAction={{ href: "/manager/pre-registrations", label: "Yeni basvuru yoksa listele" }}
      contextCard={{
        eyebrow: "Basvuru ritmi",
        title: `${newCount} yeni · ${activatedCount} aktive`,
        description: "On kayitlar ogrenci moduluyle karismadan ayrik tutulur; uygun gorulurse tek aksiyonla aktif kayda doner.",
        badge: `${reviewingCount + contactedCount} takip`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Yeni basvuru"
          value={newCount}
          description="Henuz isleme alinmamis, yeni gelen on kayitlar."
          badge="New"
        />
        <WorkspaceKpiCard
          label="Incelemede"
          value={reviewingCount}
          description="Ekibin kontrol ettigi ama henuz netlestirmedigi basvurular."
          accent="amber"
          badge="Review"
        />
        <WorkspaceKpiCard
          label="Iletisime gecildi"
          value={contactedCount}
          description="Veli ile temasa gecilen, geri donus bekleyen basvurular."
          accent="violet"
          badge="Contact"
        />
        <WorkspaceKpiCard
          label="Aktive edilen"
          value={activatedCount}
          description="Aktif ogrenci kaydina donusturulmus basvurular."
          accent="green"
          badge="Live"
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Basvuru havuzu"
            description="Tum on kayitlar, durum degisiklikleri ve aktivasyon aksiyonlari ayni listede toplanir."
            contentClassName="pt-0"
          >
            {error ? <p className="px-1 py-4 text-sm text-destructive">{error}</p> : null}
            <PreRegistrationsPanel
              records={records}
              branches={options.branches}
              seasons={options.seasons}
              programs={options.programs}
            />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Aktivasyon mantigi"
            title="Basvuru once lead olarak kalir, sonra ogrenciye doner."
            description="Bu modulde aktif kayitla karismayan ayrik bir havuz tutulur. Manuel yeni ogrenci akisi korunur; burada ise landing basvurulari filtrelenir."
            badge="Ayrik mod"
          />
          <WorkspacePanel
            title="Kritik sinyaller"
            description="Takip ve reddedilen basvurulari hizli karar icin sag panelde izleyin."
            contentClassName="grid gap-3"
          >
            <Signal label="Reddedilen" value={rejectedCount} accent="red" />
            <Signal label="Sezon secilmis" value={records.filter((record) => record.seasonId).length} accent="blue" />
            <Signal label="Fotografli basvuru" value={records.filter((record) => record.assets.length).length} accent="violet" />
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}

function Signal({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "red" | "blue" | "violet";
}) {
  const accentClass =
    accent === "red"
      ? "bg-rose-500/12 text-rose-700"
      : accent === "violet"
        ? "bg-violet-500/12 text-violet-700"
        : "bg-secondary text-secondary-foreground";

  return (
    <div className="surface-muted rounded-[1.2rem] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${accentClass}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
