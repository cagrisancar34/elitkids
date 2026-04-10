import { DashboardPage } from "@/components/dashboard-page";
import { ManagerStudentsPanel } from "@/components/manager-students-panel";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import { StudentCreateForm } from "@/components/student-create-form";
import { getManagerStudents, getProgramsData, getStudentDetailQuestions } from "@/lib/dashboard-data";

export default async function ManagerStudentsPage() {
  const [studentRows, programs, questions] = await Promise.all([
    getManagerStudents(),
    getProgramsData(),
    getStudentDetailQuestions(),
  ]);

  const activeStudents = studentRows.filter((student) => student.status.toLocaleLowerCase("tr-TR").includes("aktif"));
  const followStudents = studentRows.filter(
    (student) =>
      student.balance.toLocaleLowerCase("tr-TR") !== "odendi" ||
      student.status.toLocaleLowerCase("tr-TR").includes("takip"),
  );
  const detailReady = studentRows.filter((student) => student.detailSaved).length;

  return (
    <DashboardPage
      role="manager"
      eyebrow="Kayit ve roster"
      title="Ogrenciler"
      description="Kayit durumu, program eslesmesi, devam ve bakiye gibi temel sinyaller tek tabloda gorunur."
      primaryAction={{ href: "/manager/students", label: "Yeni ogrenci" }}
      contextCard={{
        eyebrow: "Kayit sinyali",
        title: `${activeStudents.length} aktif ogrenci`,
        description: "Kayit, veli baglantisi ve ilk tahakkuk ayni operasyon hattinda ilerler.",
        badge: `${followStudents.length} takip kaydi`,
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard
          label="Toplam ogrenci"
          value={studentRows.length}
          description="Canli listede gorunen tum aktif ve takip kayitlari."
          badge="Roster"
        />
        <WorkspaceKpiCard
          label="Aktif ogrenci"
          value={activeStudents.length}
          description="Program akisi icinde aktif durumda gorunen sporcular."
          accent="green"
          badge="Canli"
        />
        <WorkspaceKpiCard
          label="Takip gerektiren"
          value={followStudents.length}
          description="Bakiye, durum veya operasyonda ek ilgi isteyen kayitlar."
          accent="amber"
          badge="Risk"
        />
        <WorkspaceKpiCard
          label="Karneye hazir"
          value={detailReady}
          description="Detay girisi tamamlanmis ve karne olusturabilecek ogrenciler."
          accent="violet"
          badge="Detay"
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Aktif ogrenci havuzu"
            description="Canli Supabase verisi ile gelen ogrenciler, devam ve finans sinyalleriyle listelenir."
            contentClassName="pt-0"
          >
            <ManagerStudentsPanel students={studentRows} programs={programs} questions={questions} />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Kayit nabzi"
            title="Kayit, veli baglantisi ve tahakkuk ayni sutunda akiyor."
            description="Stitch ogrenci ekranindaki gibi ana tablo solda kalirken, operasyonel aksiyonlar daha dar ve odakli bir sag sutunda tutuluyor."
            badge={`${programs.length} program`}
          />
          <WorkspacePanel
            title="Yeni ogrenci ac"
            description="Ogrenci, program ve ilk tahakkuk ayni akista olusur. Veli e-postasi varsa hesapla bag kurulur."
          >
            <StudentCreateForm programs={programs} />
          </WorkspacePanel>
          <WorkspacePanel
            title="On kayittan aktivasyon"
            description="Landing'den gelen basvurulari once ayri modulde incele, sonra uygun gorursen aktif ogrenciye donustur."
          >
            <div className="grid gap-3">
              <p className="text-sm leading-6 text-muted-foreground">
                Manuel yeni ogrenci kaydi burada kalir. On kayit basvurulari ise ayrik bir havuzda tutulur ve programa aktivasyonla dusurulur.
              </p>
              <a
                href="/manager/pre-registrations"
                className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-5 text-sm font-semibold text-secondary-foreground transition hover:bg-[#c9daf8]"
              >
                On kayit havuzunu ac
              </a>
            </div>
          </WorkspacePanel>
          <WorkspacePanel
            title="Takip listesi"
            description="Bakiye veya durum nedeniyle operasyonel goz isteyen ogrenciler."
            contentClassName="grid gap-3"
          >
            {followStudents.slice(0, 4).map((student) => (
              <div key={student.id} className="surface-muted rounded-[1.2rem] p-4">
                <div className="font-medium text-foreground">{student.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {student.program} · {student.coach}
                </div>
                <div className="mt-3 inline-flex rounded-full bg-amber-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  {student.balance} · {student.status}
                </div>
              </div>
            ))}
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
