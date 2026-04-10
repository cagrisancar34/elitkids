import { AdminProgramResourcesPanel } from "@/components/admin-program-resources-panel";
import { DashboardPage } from "@/components/dashboard-page";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
  WorkspaceKpiCard,
} from "@/components/operations-workspace";
import { getProgramResourceAdminData } from "@/lib/dashboard-data";

export default async function AdminProgramResourcesPage() {
  const data = await getProgramResourceAdminData();

  return (
    <DashboardPage
      role="admin"
      eyebrow="Program sozlugu"
      title="Program kaynaklari"
      description="Program, seans ve takvim akislari ayni tip, kategori, brans ve alan sozlugunu kullanir. Bu panel manager formlarindaki tum select alanlarini besler."
      primaryAction={{ href: "/admin/program-resources", label: "Kaynak ekle" }}
      contextCard={{
        eyebrow: "Kaynak durumu",
        title: `${data.programTypes.length} tip · ${data.categories.length} kategori`,
        description: "Manager tarafindaki program ve seans modalari yalnizca bu admin kontrollu kaynaklardan beslenir.",
        badge: "Admin only",
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard label="Program tipi" value={data.programTypes.length} description="Program karti ve olusturma akisi icin tip secenekleri." badge="Tip" />
        <WorkspaceKpiCard label="Kategori" value={data.categories.length} description="Seviye ve grup siniflandirmalari ayni sozlukten gelir." accent="violet" badge="Kategori" />
        <WorkspaceKpiCard label="Brans" value={data.sportsBranches.length} description="Takvim filtreleri ve rapor rozetlerinde kullanilan spor aileleri." accent="blue" badge="Brans" />
        <WorkspaceKpiCard label="Alan / Pist" value={data.areas.length} description="Seans serisi planlama ve saha atamalari icin kullanilan fiziksel alanlar." accent="green" badge="Alan" />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Yonetilebilir kaynak tablolar"
            description="Burada eklenen kayitlar manager tarafindaki Yeni Program ve Yeni Seans Serisi modallarina aninda yansir."
            contentClassName="pt-0"
          >
            <AdminProgramResourcesPanel
              branches={data.branches}
              programTypes={data.programTypes}
              categories={data.categories}
              sportsBranches={data.sportsBranches}
              areas={data.areas}
            />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Eski sistem paritesi"
            title="Program karti ve seans planlama modallari artik statik metin degil, yonetilebilir kaynaklarla besleniyor."
            description="Tip, kategori, brans ve alan pist sozlugu admin tarafinda merkezi tutulur. Manager bu kayitlari kullanir; koç ve veli yalnizca sonucunu gorur."
            badge="Select omurgasi"
            className="bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)]"
          />
          <WorkspacePanel
            title="Kullanim kurallari"
            description="Kaynak silme davranisi bagli program veya seans varsa guvenli sekilde engellenir."
            contentClassName="grid gap-4"
          >
            {[
              "Program tipleri, olusturma ve duzenleme modallarindaki program tipi alanini besler.",
              "Alan / Pist kayitlari seans serisi planlama ve haftalik takvim bloklarinda ayni sekilde gorunur.",
              "Bagli program veya seans bulunan bir kaynak silinmek istenirse sistem onu korur ve uyari verir.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-white/50 bg-[#eef3ff] px-4 py-4 text-sm leading-7 text-foreground"
              >
                {item}
              </div>
            ))}
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
