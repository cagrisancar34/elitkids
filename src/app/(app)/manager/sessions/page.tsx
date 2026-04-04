import { DashboardPage } from "@/components/dashboard-page";
import { SessionCreateForm } from "@/components/session-create-form";
import { SessionsPanel } from "@/components/sessions-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCoachOptions,
  getProgramOptions,
  getSessionsData,
} from "@/lib/dashboard-data";

export default async function ManagerSessionsPage() {
  const [sessions, programs, coaches] = await Promise.all([
    getSessionsData(),
    getProgramOptions(),
    getCoachOptions(),
  ]);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Takvim ve saha"
      title="Seanslar"
      description="Koc atamalari, lokasyonlar ve doluluk gibi saha sinyalleri karmasik takvim chrome'u olmadan okunur hale getirildi."
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SessionsPanel sessions={sessions} />
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Saha planlama</div>
            <div className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.05em]">
              Seans doluluklari ve alan atamalari tek bakista planlamaya donusuyor.
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Stitch seans ekranindaki gibi kartlar hem takvim hissi hem de roster doluluk sinyali veriyor.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Yeni seans planla</CardTitle>
              <CardDescription>
                Program, koc ve saat bilgisini ayni yerden olustur. Kayitli ogrenciler sonraki adimda roster listesine baglanir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionCreateForm programs={programs} coaches={coaches} />
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardPage>
  );
}
