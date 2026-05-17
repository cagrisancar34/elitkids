import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceContentLayout, WorkspaceHighlight, WorkspaceMainColumn, WorkspacePanel, WorkspaceSideColumn } from "@/components/operations-workspace";
import { ParentPaymentsPanel } from "@/components/parent-payments-panel";
import { PaymentSupportForm } from "@/components/payment-support-form";
import { getChargeData, getChargeOptions } from "@/lib/dashboard/parent-data";

export default async function ParentPaymentsPage() {
  const [charges, chargeOptions] = await Promise.all([getChargeData(), getChargeOptions()]);
  const pendingAmount = charges.reduce((sum, charge) => {
    if (charge.paymentStatus === "completed") {
      return sum;
    }
    return sum + (charge.remainingAmountValue ?? 0);
  }, 0);

  return (
    <DashboardPage
      role="parent"
      eyebrow="Veli / Finans"
      title="Finans Takibi"
      description="Ne zaman, ne kadar ve hangi kalemin beklendigi belirsiz kalmaz."
      primaryAction={{ href: "/parent/payments", label: "Odeme teyidi" }}
      contextCard={{
        eyebrow: "Finans netligi",
        title: `${charges.length} finans kalemi`,
        description: "Aile bakiyesi, odeme teyidi ve bekleyen kalemler ayni akista toplanir.",
        badge: `${chargeOptions.length} secilebilir kayit`,
      }}
    >
      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel title="Kalemler" description="Dekont yukleme ve manuel odeme teyit akisi icin UI zemini hazir." contentClassName="pt-0">
            <ParentPaymentsPanel charges={charges} />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Finans netligi"
            title="Ne kadar, ne zaman ve hangi durumda oldugu belirsiz kalmaz."
            description="Veli ekraninda guven hissi kritik; bu yuzden odeme bilgisi sakin ama guclu bir hiyerarsiyle sunulur."
            badge="Guven hissi"
          >
            <div className="page-subsection rounded-[1.4rem] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Bekleyen toplam
              </div>
              <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-900">
                ₺{pendingAmount.toLocaleString("tr-TR")}
              </div>
            </div>
          </WorkspaceHighlight>
          <WorkspacePanel
            title="Odeme teyidi gonder"
            description="Dekont veya transfer bilgisini finans ekibine destek talebi olarak ilet."
          >
            <PaymentSupportForm charges={chargeOptions} />
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
