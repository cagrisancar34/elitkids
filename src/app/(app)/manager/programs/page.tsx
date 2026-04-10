import { DashboardPage } from "@/components/dashboard-page";
import { DataTable } from "@/components/data-table";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import { ProgramCreateDialog } from "@/components/program-create-dialog";
import { ProgramsPanel } from "@/components/programs-panel";
import { getProgramFormOptions, getProgramsData, getSessionsData } from "@/lib/dashboard-data";

export default async function ManagerProgramsPage() {
  const [programs, sessions, formOptions] = await Promise.all([
    getProgramsData(),
    getSessionsData(),
    getProgramFormOptions(),
  ]);
  const totalCapacity = programs.reduce((sum, program) => sum + program.capacity, 0);
  const totalMonthlyValue = programs.reduce((sum, program) => sum + program.monthlyPrice, 0);
  const activePrograms = programs.length;

  return (
    <DashboardPage
      role="manager"
      eyebrow="Brans ve kontenjan"
      title="Programlar"
      description="Yas grubu, kapasite ve fiyatlandirma ayni dil icinde yonetilir; agir admin chrome yerine hizli taranabilir bloklar kullanilir."
      primaryAction={{ href: "/manager/programs", label: "Yeni program" }}
      contextCard={{
        eyebrow: "Doluluk sinyali",
        title: `${activePrograms} aktif program`,
        description: "Brans kararlarini kapasite, haftalik ritim ve fiyat katmaniyla birlikte yonet.",
        badge: `${sessions.length} seans bagli`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Toplam program"
          value={programs.length}
          description="Aktif ve arsivdeki tum brans/paket tanimlari."
          badge="Brans"
        />
        <WorkspaceKpiCard
          label="Acilabilir kapasite"
          value={totalCapacity}
          description="Tum aktif programlarin toplam kontenjan kapasitesi."
          accent="green"
          badge="Kontenjan"
        />
        <WorkspaceKpiCard
          label="Aylik hacim"
          value={`₺${totalMonthlyValue.toLocaleString("tr-TR")}`}
          description="Program fiyatlarinin toplam aylik hacim gorunumu."
          accent="blue"
          badge="Fiyat"
        />
        <WorkspaceKpiCard
          label="Bagli seans"
          value={sessions.length}
          description="Programlara baglanan gunluk saha ritmi ve aktif seans sayisi."
          accent="violet"
          badge="Takvim"
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Program portfoyu"
            description="Kart ve tablo hibrit gorunumu ile kapasite, fiyat ve doluluk ayni aileden okunur."
            contentClassName="pt-0"
          >
            <ProgramsPanel programs={programs} formOptions={formOptions} showSummary={false} />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Program ritmi"
            title="Kontenjan, fiyat ve pist yogunlugu ayni panoda hizla okunuyor."
            description="Stitch program ekranindaki gibi kartlar daha editoryal, seans akisina baglanan kararlar ise sag kolonda toplanir."
            badge="Kart + tablo"
          />
          <WorkspacePanel
            title="Yeni program tanimla"
            description="Form artik dialog icinde acilir; listeyi terk etmeden yeni program tanimlayabilirsin."
          >
            <ProgramCreateDialog options={formOptions} />
          </WorkspacePanel>
          <WorkspacePanel
            title="Yaklasan seans akisi"
            description="Program kararlarini hemen alttaki saha ritmiyle birlikte izle."
          >
            <DataTable
              columns={[
                { key: "title", label: "Seans" },
                { key: "slot", label: "Saat" },
                { key: "location", label: "Alan" },
              ]}
              rows={sessions.slice(0, 4).map((session) => ({
                title: session.title,
                slot: session.slot,
                location: session.location,
              }))}
            />
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
