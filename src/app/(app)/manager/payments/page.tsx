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

function parseTry(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export default async function ManagerPaymentsPage() {
  const [charges, chargeOptions] = await Promise.all([getChargeData(), getChargeOptions()]);
  const pendingCharges = charges.filter((charge) => !charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const paidCharges = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const pendingAmount = pendingCharges.reduce((sum, charge) => sum + parseTry(charge.amount), 0);
  const paidAmount = paidCharges.reduce((sum, charge) => sum + parseTry(charge.amount), 0);
  const collectionRate = pendingAmount + paidAmount > 0 ? Math.round((paidAmount / (pendingAmount + paidAmount)) * 100) : 0;

  return (
    <DashboardPage
      role="manager"
      eyebrow="Islem merkezi"
      title="Odemeler"
      description="Tahsilat hareketleri, manuel odeme girisi ve acik tahakkuklar artik ayri bir odeme workspace icinde yonetilir."
      primaryAction={{ href: "/manager/payments", label: "Manuel odeme gir" }}
      contextCard={{
        eyebrow: "Tahsilat orani",
        title: `%${collectionRate} kapanis`,
        description: "Acik tahakkuklari solda tara, sag panelden yeni tahsilat kaydini gir ve veliyi ayni akista bilgilendir.",
        badge: `${pendingCharges.length} acik kayit`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Bugun islenen"
          value={`${paidCharges.length}`}
          description="Kapanmis odeme hareketlerinin toplami."
          accent="green"
          badge="Tahsil edildi"
        />
        <WorkspaceKpiCard
          label="Acik bakiye"
          value={`₺${pendingAmount.toLocaleString("tr-TR")}`}
          description="Odeme bekleyen kayitlarin toplami."
          accent="amber"
          badge="Bekliyor"
        />
        <WorkspaceKpiCard
          label="Toplam tahsilat"
          value={`₺${paidAmount.toLocaleString("tr-TR")}`}
          description="Kapanmis odemelerden gelen tahsil hacmi."
          accent="blue"
          badge="Kapanan"
        />
        <WorkspaceKpiCard
          label="Tahsilat orani"
          value={`%${collectionRate}`}
          description="Acik ve kapanan hareketler uzerinden tahsil verimi."
          accent="violet"
          badge="Verim"
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Odeme hareketleri"
            description="Acik ve kapanmis tahakkuk hareketlerini ayni tabloda tara; durum rozetleri finans ailesi ile tutarlidir."
            contentClassName="pt-0"
          >
            <FinanceChargesPanel charges={charges} showSummary={false} />
          </WorkspacePanel>
        </WorkspaceMainColumn>

        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Tahsilat akisi"
            title="Odeme kaydi, bildirim ve bakiye guncellemesi ayni modulde."
            description="Bu sayfa mevcut finans genel gorunumunden ayrildi; artik odeme operasyonunun birincil merkezi gibi calisiyor."
            badge="Canli islem"
          />
          <WorkspacePanel
            title="Yeni manuel odeme"
            description="Tahakkugu sec, tahsil edilen tutari gir ve kaydi isleyerek veli bildirimini tetikle."
          >
            <ManualPaymentForm charges={chargeOptions} />
          </WorkspacePanel>
          <WorkspacePanel
            title="Kapanan son hareketler"
            description="Hizli kontrol icin son kapanan tahsilat kayitlari."
            contentClassName="grid gap-3"
          >
            {paidCharges.slice(0, 4).map((charge) => (
              <div key={`${charge.item}-${charge.dueDate}`} className="surface-muted rounded-[1.2rem] p-4">
                <div className="font-medium text-foreground">{charge.item}</div>
                <div className="mt-1 text-sm text-muted-foreground">{charge.dueDate}</div>
                <div className="mt-3 inline-flex rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {charge.amount}
                </div>
              </div>
            ))}
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
