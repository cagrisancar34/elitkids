import { DashboardPage } from "@/components/dashboard-page";
import { FinanceChargesPanel } from "@/components/finance-charges-panel";
import { ManualPaymentForm } from "@/components/manual-payment-form";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import { getChargeData, getChargeOptions } from "@/lib/dashboard-data";

export default async function ManagerFinancePage() {
  const [charges, chargeOptions] = await Promise.all([getChargeData(), getChargeOptions()]);
  const pending = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("bek"));
  const follow = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("takip"));
  const paid = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const amountTotal = (items: typeof charges) =>
    items.reduce((sum, charge) => sum + Number(charge.amount.replace(/[^\d]/g, "") || 0), 0);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Tahakkuk ve tahsilat"
      title="Finans merkezi"
      description="Online odeme sonraki faza kalacak sekilde, manuel tahsilat ve borc takibi yonetici panelinin cekirdek parcasi olarak kurgulandi."
      primaryAction={{ href: "/manager/finance", label: "Tahsilat gir" }}
      contextCard={{
        eyebrow: "Risk merkezi",
        title: `₺${amountTotal(pending).toLocaleString("tr-TR")} bekleyen bakiye`,
        description: "Tahakkuk, takip ve tahsilat kararlarini ayni operasyon workspace icinde hizla yonet.",
        badge: `${follow.length} takip kaydi`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Toplam tahakkuk"
          value={charges.length}
          description="Finans motorunda gorunen tum hareket kayitlari."
          badge="Hareket"
        />
        <WorkspaceKpiCard
          label="Odeme bekleyen"
          value={`₺${amountTotal(pending).toLocaleString("tr-TR")}`}
          description="Bu asamada tahsil edilmesi beklenen acik bakiye."
          accent="amber"
          badge={`${pending.length} kayit`}
        />
        <WorkspaceKpiCard
          label="Takipteki hacim"
          value={`₺${amountTotal(follow).toLocaleString("tr-TR")}`}
          description="Risk ve takip bandinda kalan tahakkuk toplami."
          accent="red"
          badge="Risk"
        />
        <WorkspaceKpiCard
          label="Kapanan tahsilat"
          value={`₺${amountTotal(paid).toLocaleString("tr-TR")}`}
          description="Odeme alinmis ve kapanmis hareketlerin toplami."
          accent="green"
          badge={`${paid.length} kayit`}
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Acik hareketler"
            description="Tahakkuk, son odeme tarihi, dekont akisi ve durum rozetleri bu iskelette yerini aldi."
            contentClassName="pt-0"
          >
            <FinanceChargesPanel charges={charges} showSummary={false} />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Tahsilat merkezi"
            title="Bekleyen, takipte kalan ve kapanan tahsilatlar ayni ritimde okunuyor."
            description="Stitch odeme ekranindaki gibi ana hareket tablosu solda, karar ve isleme paneli sagda kalir."
            badge="Finans ailesi"
          />
          <WorkspacePanel
            title="Manuel tahsilat"
            description="Tahsil edilen tutari isleyip charge durumunu gunceller, ilgili veliye bildirim yollar."
          >
            <ManualPaymentForm charges={chargeOptions} />
          </WorkspacePanel>
          <WorkspacePanel
            title="Oncelikli takip"
            description="Bugun ekip tarafindan ilk ele alinmasi gereken finans kayitlari."
            contentClassName="grid gap-3"
          >
            {follow.slice(0, 4).map((charge) => (
              <div key={`${charge.item}-${charge.dueDate}`} className="surface-muted rounded-[1.2rem] p-4">
                <div className="font-medium text-foreground">{charge.item}</div>
                <div className="mt-1 text-sm text-muted-foreground">{charge.dueDate}</div>
                <div className="mt-3 inline-flex rounded-full bg-rose-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
                  {charge.amount} · {charge.status}
                </div>
              </div>
            ))}
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
