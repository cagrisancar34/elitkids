import { DashboardPage } from "@/components/dashboard-page";
import { ParentSupportPanel } from "@/components/parent-support-panel";
import { SupportComposeSheet } from "@/components/support-compose-sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupportThreadsData } from "@/lib/dashboard-data";

export default async function ParentSupportPage() {
  const threads = await getSupportThreadsData();

  return (
    <DashboardPage
      role="parent"
      eyebrow="Mesaj ve talepler"
      title="Destek merkezi"
      description="Kayit yenileme, dekont teyidi ve operasyonel destek talepleri ayni sade mesajlasma yapisinda toplanir."
    >
      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Acik talepler</CardTitle>
            <CardDescription>Son guncellenen destek dizileri.</CardDescription>
          </CardHeader>
          <CardContent>
            <ParentSupportPanel threads={threads} />
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Destek akisi</div>
            <div className="mt-4 font-display text-[2.2rem] font-semibold leading-[0.95] tracking-[-0.05em]">
              Talep açmak, mesaj yazmak ve durum takip etmek tek yerde kalır.
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Veli tarafında destek yüzeyi daha yumuşak ama yine Stitch’teki editorial blok düzenini taşıyor.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Yeni talep ac</CardTitle>
              <CardDescription>Yeni talebi sheet icinde acip ekran akisini bozmadan gonderebilirsin.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <SupportComposeSheet />
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardPage>
  );
}
