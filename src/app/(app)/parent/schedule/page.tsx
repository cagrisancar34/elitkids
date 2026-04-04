import { DashboardPage } from "@/components/dashboard-page";
import { ParentSchedulePanel } from "@/components/parent-schedule-panel";
import { getSessionsData } from "@/lib/dashboard-data";

export default async function ParentSchedulePage() {
  const sessions = await getSessionsData();

  return (
    <DashboardPage
      role="parent"
      eyebrow="Program takvimi"
      title="Yaklasan dersler"
      description="Veli deneyiminde takvim, gereksiz tablo karmasasi olmadan okunur ve hizli aksiyonlar icin uygun olur."
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ParentSchedulePanel sessions={sessions} />
        <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Haftalik akis</div>
          <div className="mt-4 font-display text-[2.2rem] font-semibold leading-[0.95] tracking-[-0.05em]">
            Yaklaşan dersler veli için tek bakışta güven verici olmalı.
          </div>
          <p className="mt-4 text-sm leading-6 text-white/64">
            Takvim daha yumuşak ama yine Stitch ailesine ait; yoğun tablo yerine okunaklı kart akışı kullanılıyor.
          </p>
        </div>
      </section>
    </DashboardPage>
  );
}
