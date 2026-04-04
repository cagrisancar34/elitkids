import { DashboardPage } from "@/components/dashboard-page";
import { DataTable } from "@/components/data-table";
import { ProgramCreateDialog } from "@/components/program-create-dialog";
import { ProgramsPanel } from "@/components/programs-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProgramsData, getSessionsData } from "@/lib/dashboard-data";

export default async function ManagerProgramsPage() {
  const [programs, sessions] = await Promise.all([getProgramsData(), getSessionsData()]);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Brans ve kontenjan"
      title="Programlar"
      description="Yas grubu, kapasite ve fiyatlandirma ayni dil icinde yonetilir; agir admin chrome yerine hizli taranabilir bloklar kullanilir."
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ProgramsPanel programs={programs} />
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Program ritmi</div>
            <div className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.05em]">
              Kontenjan, aylik fiyat ve pist yogunlugu ayni panoda hizla okunuyor.
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Stitch program ekranindaki gibi kartlar daha editoryal, alttaki akis ise daha operasyonel tutuluyor.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Yeni program tanimla</CardTitle>
              <CardDescription>
                Form artik dialog icinde acilir; listeyi terk etmeden yeni program tanimlayabilirsin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramCreateDialog />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Yaklasan seans akisi</CardTitle>
              <CardDescription>Program kararlarini hemen alttaki saha ritmiyle birlikte izle.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { key: "title", label: "Seans" },
                  { key: "slot", label: "Saat" },
                  { key: "location", label: "Alan" },
                ]}
                rows={sessions.slice(0, 4).map((session) => ({
                  title: session.title,
                  slot: session.slot,
                  location: session.location,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardPage>
  );
}
