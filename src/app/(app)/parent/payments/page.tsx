import { DashboardPage } from "@/components/dashboard-page";
import { ParentPaymentsPanel } from "@/components/parent-payments-panel";
import { PaymentSupportForm } from "@/components/payment-support-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChargeData, getChargeOptions } from "@/lib/dashboard-data";

export default async function ParentPaymentsPage() {
  const [charges, chargeOptions] = await Promise.all([getChargeData(), getChargeOptions()]);

  return (
    <DashboardPage
      role="parent"
      eyebrow="Odeme ve borc"
      title="Finans takibi"
      description="Veli tarafinda finansal akista netlik esastir; ne zaman, ne kadar ve hangi durum oldugu hemen okunur."
    >
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Kalemler</CardTitle>
            <CardDescription>Dekont yukleme ve manuel odeme teyit akisi icin UI zemini hazir.</CardDescription>
          </CardHeader>
          <CardContent>
            <ParentPaymentsPanel charges={charges} />
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Finans netligi</div>
            <div className="mt-4 font-display text-[2.2rem] font-semibold leading-[0.95] tracking-[-0.05em]">
              Ne kadar, ne zaman ve hangi durumda oldugu belirsiz kalmaz.
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Veli ekranında güven hissi kritik; bu yüzden ödeme bilgisi sakin ama güçlü bir hiyerarşiyle sunuluyor.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Odeme teyidi gonder</CardTitle>
              <CardDescription>
                Dekont veya transfer bilgisini finans ekibine destek talebi olarak ilet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentSupportForm charges={chargeOptions} />
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardPage>
  );
}
