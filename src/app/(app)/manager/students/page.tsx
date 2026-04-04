import { DashboardPage } from "@/components/dashboard-page";
import { ManagerStudentsPanel } from "@/components/manager-students-panel";
import { StudentCreateForm } from "@/components/student-create-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getManagerStudents, getProgramsData } from "@/lib/dashboard-data";

export default async function ManagerStudentsPage() {
  const [studentRows, programs] = await Promise.all([
    getManagerStudents(),
    getProgramsData(),
  ]);

  return (
    <DashboardPage
      role="manager"
      eyebrow="Kayit ve roster"
      title="Ogrenciler"
      description="Kayit durumu, program eslesmesi, devam ve bakiye gibi temel sinyaller tek tabloda gorunur."
    >
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Aktif ogrenci havuzu</CardTitle>
            <CardDescription>
              Canli Supabase verisi ile gelen ogrenciler, devam ve finans sinyalleriyle listelenir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManagerStudentsPanel students={studentRows} />
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Kayit nabzi</div>
            <div className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.05em]">
              Kayit, veli baglantisi ve ilk tahakkuk ayni sutunda akiyor.
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Stitch ogrenci ekranindaki gibi ana tablo solda kalirken, operasyonel aksiyonlar daha dar ve odakli bir sag sutunda tutuluyor.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Yeni ogrenci ac</CardTitle>
              <CardDescription>
                Ogrenci, program ve ilk tahakkuk ayni akista olusur. Veli e-postasi varsa hesapla bag kurulur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentCreateForm programs={programs.map((program) => program.title)} />
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardPage>
  );
}
