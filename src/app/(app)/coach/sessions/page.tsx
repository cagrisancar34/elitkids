import { CoachSessionsPanel } from "@/components/coach-sessions-panel";
import { DashboardPage } from "@/components/dashboard-page";
import { getCoachSessionBoards } from "@/lib/dashboard-data";

export default async function CoachSessionsPage() {
  const sessions = await getCoachSessionBoards();

  return (
    <DashboardPage
      role="coach"
      eyebrow="Yoklama ve notlar"
      title="Seans akisi"
      description="Her seans icin hizli yoklama, saha notu ve veliye acik geribildirim satirlari ayni blokta dusunuldu."
    >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <CoachSessionsPanel sessions={sessions} />
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Saha ritmi</div>
            <div className="mt-4 font-display text-[2.2rem] font-semibold leading-[0.95] tracking-[-0.05em]">
              Yoklama, roster ve seans notlari ayni blokta hizla isleniyor.
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Koç ekranı daha sade kalıyor ama Stitch’teki yüzey hiyerarşisini ve güçlü başlık ritmini koruyor.
            </p>
          </div>
        </div>
      </section>
    </DashboardPage>
  );
}
