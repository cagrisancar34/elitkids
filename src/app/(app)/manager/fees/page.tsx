import Link from "next/link";

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
import { Button } from "@/components/ui/button";
import { getProgramsData } from "@/lib/dashboard-data";
import { formatTry } from "@/lib/finance";

function getProgramTier(monthlyPrice: number) {
  if (monthlyPrice >= 6000) {
    return "Premium";
  }

  if (monthlyPrice >= 5000) {
    return "Performans";
  }

  return "Temel";
}

export default async function ManagerFeesPage() {
  const programs = await getProgramsData();
  const averagePrice = programs.length
    ? Math.round(programs.reduce((sum, program) => sum + program.monthlyPrice, 0) / programs.length)
    : 0;
  const totalCapacity = programs.reduce((sum, program) => sum + program.capacity, 0);
  const tierCounts = programs.reduce<Record<string, number>>((acc, program) => {
    const tier = getProgramTier(program.monthlyPrice);
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardPage
      role="manager"
      eyebrow="Paket ve fiyat kurallari"
      title="Ucretler"
      description="Program fiyatlari, seviye segmentleri ve aktif kapasite dagilimi tek bir fiyat workspace icinde toplanir."
      primaryAction={{ href: "/manager/programs", label: "Ucret kurali ac" }}
      contextCard={{
        eyebrow: "Fiyat merkezi",
        title: `${programs.length} aktif fiyat kurali`,
        description: "Bu modulde program bazli ucret kurallarini, segment dagilimini ve aktif kapasiteyi birlikte okuyabilirsin.",
        badge: formatTry(averagePrice),
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Aktif kurallar"
          value={programs.length}
          description="Programlardan beslenen canli fiyat kayitlari."
          badge="Paket"
        />
        <WorkspaceKpiCard
          label="Ortalama aylik"
          value={formatTry(averagePrice)}
          description="Aktif fiyat kurallarinin ortalama aylik ucreti."
          accent="blue"
          badge="Aylik ortalama"
        />
        <WorkspaceKpiCard
          label="Premium seviye"
          value={tierCounts.Premium ?? 0}
          description="Yuksek paket bandinda konumlanan program sayisi."
          accent="violet"
          badge="Segment"
        />
        <WorkspaceKpiCard
          label="Toplam kapasite"
          value={totalCapacity}
          description="Ucret kurallarina bagli acik toplam kontenjan."
          accent="green"
          badge="Kontenjan"
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Aktif ucret kurallari"
            description="Bu ilk fazda program fiyatlari ayni zamanda ucret kurali gibi davranir; fiyat guncellemesi program kaydindan yonetilir."
            contentClassName="pt-0"
          >
            <DataTable
              columns={[
                { key: "program", label: "Program" },
                { key: "ageBand", label: "Yas grubu" },
                { key: "capacity", label: "Kontenjan" },
                { key: "monthlyPrice", label: "Aylik ucret" },
                { key: "segment", label: "Segment" },
                { key: "status", label: "Durum" },
              ]}
              rows={programs.map((program) => ({
                program: program.title,
                ageBand: program.ageBand,
                capacity: String(program.capacity),
                monthlyPrice: formatTry(program.monthlyPrice),
                segment: getProgramTier(program.monthlyPrice),
                status: "Aktif",
              }))}
            />
          </WorkspacePanel>
        </WorkspaceMainColumn>

        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Segment dagilimi"
            title="Temel, performans ve premium paketleri ayni akis icinde gor."
            description="Fiyat modulu artik finans ekranindan ayrildi; operasyon ekibi program fiyatlarini daha net okuyabiliyor."
            badge="Workspace"
          />
          <WorkspacePanel
            title="Paket aileleri"
            description="Segment dagilimi, aktif fiyat kurallarinin hangi seviyelerde yogunlastigini gosterir."
            contentClassName="grid gap-3"
          >
            {[
              ["Temel", tierCounts.Temel ?? 0, "Baslangic ve giris seviyesi kurallar"],
              ["Performans", tierCounts.Performans ?? 0, "Daha yogun ritimde isleyen orta paketler"],
              ["Premium", tierCounts.Premium ?? 0, "Yuksek fiyat bandindaki uzmanlasmis programlar"],
            ].map(([label, count, description]) => (
              <div key={label} className="surface-muted rounded-[1.2rem] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-foreground">{label}</div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {count}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </WorkspacePanel>
          <WorkspacePanel
            title="Hizli aksiyon"
            description="Program bazli fiyat duzenlemeleri ve yeni ucret bandi acilislari buradan ilgili module aktarilir."
          >
            <Button asChild className="w-full">
              <Link href="/manager/programs">Program fiyatlarini duzenle</Link>
            </Button>
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
