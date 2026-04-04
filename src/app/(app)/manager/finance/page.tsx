import { DashboardPage } from "@/components/dashboard-page";
import { FinanceChargesPanel } from "@/components/finance-charges-panel";
import { ManualPaymentForm } from "@/components/manual-payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChargeData, getChargeOptions } from "@/lib/dashboard-data";

export default async function ManagerFinancePage() {
  const [charges, chargeOptions] = await Promise.all([getChargeData(), getChargeOptions()]);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Tahakkuk ve tahsilat"
      title="Finans merkezi"
      description="Online odeme sonraki faza kalacak sekilde, manuel tahsilat ve borc takibi yonetici panelinin cekirdek parcasi olarak kurgulandi."
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Acik hareketler</CardTitle>
            <CardDescription>
              Tahakkuk, son odeme tarihi, dekont akisi ve durum rozetleri bu iskelette yerini aldi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceChargesPanel charges={charges} />
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Tahsilat merkezi</div>
            <div className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.05em]">
              Bekleyen, takipte kalan ve kapanan tahsilatlar ayni ritimde okunuyor.
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Stitch odeme ekranindaki gibi ana hareket tablosu solda, karar ve isleme paneli sagda kalir.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Manuel tahsilat</CardTitle>
              <CardDescription>
                Tahsil edilen tutari isleyip charge durumunu gunceller, ilgili veliye bildirim yollar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualPaymentForm charges={chargeOptions} />
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardPage>
  );
}
