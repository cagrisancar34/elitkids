import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceContentLayout, WorkspaceHighlight, WorkspaceMainColumn, WorkspacePanel, WorkspaceSideColumn } from "@/components/operations-workspace";
import { ParentPaymentsPanel } from "@/components/parent-payments-panel";
import { PaymentSupportForm } from "@/components/payment-support-form";
import { getChargeData, getChargeOptions } from "@/lib/dashboard-data";

export default async function ParentPaymentsPage() {
  const [charges, chargeOptions] = await Promise.all([getChargeData(), getChargeOptions()]);

  return (
    <DashboardPage
      role="parent"
      eyebrow="Odeme ve borc"
      title="Finans takibi"
      description="Veli tarafinda finansal akista netlik esastir; ne zaman, ne kadar ve hangi durum oldugu hemen okunur."
      primaryAction={{ href: "/parent/payments", label: "Odeme teyidi" }}
      contextCard={{
        eyebrow: "Finans netligi",
        title: `${charges.length} finans kalemi`,
        description: "Belirsizligi azaltan sakin ama net bir odeme ve borc gorunumu sunulur.",
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
            description="Veli ekraninda guven hissi kritik; bu yuzden odeme bilgisi sakin ama guclu bir hiyerarsiyle sunuluyor."
            badge="Guven hissi"
          />
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
