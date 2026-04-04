import { CoachStudentsPanel } from "@/components/coach-students-panel";
import { DashboardPage } from "@/components/dashboard-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoachStudents } from "@/lib/dashboard-data";

export default async function CoachStudentsPage() {
  const students = await getCoachStudents();

  return (
    <DashboardPage
      role="coach"
      eyebrow="Bagli roster"
      title="Ogrenci listeleri"
      description="Koc sadece kendi seans ve program baglamindaki ogrencileri gorur; finansal detaylar bilerek bu yuzeyde acilmaz."
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Rosters</CardTitle>
            <CardDescription>Saha icin gerekli sinyaller acik, gereksiz sistem ayrintilari kapali tutulur.</CardDescription>
          </CardHeader>
          <CardContent>
            <CoachStudentsPanel students={students} />
          </CardContent>
        </Card>
        <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Koç odağı</div>
          <div className="mt-4 font-display text-[2.2rem] font-semibold leading-[0.95] tracking-[-0.05em]">
            Sadece saha için anlamlı sinyaller açık kalır.
          </div>
          <p className="mt-4 text-sm leading-6 text-white/64">
            Finans ve sistem gürültüsü çıkarıldı; koç kendi grubunu ve devam ritmini hızlıca okuyabiliyor.
          </p>
        </div>
      </section>
    </DashboardPage>
  );
}
