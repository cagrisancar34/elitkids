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
import { getChargeData } from "@/lib/dashboard-data";

function parseTry(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export default async function ManagerDebtsPage() {
  const charges = await getChargeData();
  const openCharges = charges.filter((charge) => !charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const paidCharges = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const trackedCharges = openCharges
    .map((charge) => ({ ...charge, amountRaw: parseTry(charge.amount) }))
    .sort((left, right) => right.amountRaw - left.amountRaw);
  const riskyCharges = trackedCharges.filter((charge) => charge.amountRaw >= 5000);
  const openBalance = trackedCharges.reduce((sum, charge) => sum + charge.amountRaw, 0);
  const closedBalance = paidCharges.reduce((sum, charge) => sum + parseTry(charge.amount), 0);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Risk merkezi"
      title="Borc takibi"
      description="Acik tahakkuklar, oncelikli takip listeleri ve buyuk bakiyeler ayri bir risk workspace icinde okunur."
      primaryAction={{ href: "/manager/payments", label: "Tahsilata gec" }}
      contextCard={{
        eyebrow: "Acik bakiye",
        title: `₺${openBalance.toLocaleString("tr-TR")} acik`,
        description: "Yuksek tutarli ve bekleyen kayitlari sag kolon risk akisinda hizla gorup tahsilata yonlen.",
        badge: `${riskyCharges.length} kritik kayit`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Acik bakiye"
          value={`₺${openBalance.toLocaleString("tr-TR")}`}
          description="Odeme bekleyen tum tahakkuklarin toplami."
          accent="amber"
          badge="Bekleyen"
        />
        <WorkspaceKpiCard
          label="Acil takip"
          value={riskyCharges.length}
          description="Yuksek tutar bandinda hizli aksiyon gerektiren kayitlar."
          accent="red"
          badge="Kritik risk"
        />
        <WorkspaceKpiCard
          label="Acik dosya"
          value={openCharges.length}
          description="Takipte tutulan aktif borc kayitlari."
          accent="violet"
          badge="Dosya"
        />
        <WorkspaceKpiCard
          label="Kapanan hacim"
          value={`₺${closedBalance.toLocaleString("tr-TR")}`}
          description="Tahsil edilip kapanan kayitlarin hacmi."
          accent="green"
          badge={`${paidCharges.length} odeme`}
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Acik borc listesi"
            description="Ogrenci, vade ve tutar bazinda acik hareketleri tek tabloda gor; yuksek bakiye once listelenir."
            contentClassName="pt-0"
          >
            <DataTable
              columns={[
                { key: "item", label: "Tahakkuk" },
                { key: "dueDate", label: "Vade" },
                { key: "amount", label: "Tutar" },
                { key: "priority", label: "Oncelik" },
                { key: "status", label: "Durum" },
              ]}
              rows={trackedCharges.map((charge) => ({
                item: charge.item,
                dueDate: charge.dueDate,
                amount: charge.amount,
                priority: charge.amountRaw >= 5000 ? "Kritik" : charge.amountRaw >= 3000 ? "Takip" : "Normal",
                status: charge.amountRaw >= 5000 ? "Risk" : charge.status,
              }))}
            />
          </WorkspacePanel>
        </WorkspaceMainColumn>

        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Oncelikli takip"
            title="Buyuk bakiyeleri ilk bakista ayir."
            description="Borclu listeyi acik bakiye ve takip yogunluguna gore ayirdik; odeme merkezine tek tikla gecebilirsin."
            badge="Risk"
          />
          <WorkspacePanel
            title="En buyuk acik kayitlar"
            description="Finans ekibinin bugun once ele almasi gereken tahakkuklar."
            contentClassName="grid gap-3"
          >
            {trackedCharges.slice(0, 5).map((charge) => (
              <div key={`${charge.item}-${charge.dueDate}`} className="surface-muted rounded-[1.2rem] p-4">
                <div className="font-medium text-foreground">{charge.item}</div>
                <div className="mt-1 text-sm text-muted-foreground">{charge.dueDate}</div>
                <div className="mt-3 inline-flex rounded-full bg-rose-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
                  {charge.amount}
                </div>
              </div>
            ))}
          </WorkspacePanel>
          <WorkspacePanel
            title="Aksiyon yolu"
            description="Borclu kaydi secip manuel tahsilat akisi ile odeme isleyebilir veya veliyle iletisim kurabilirsin."
          >
            <Button asChild className="w-full">
              <Link href="/manager/payments">Odeme merkezine git</Link>
            </Button>
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
