import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ManagerStudentsPanel } from "@/components/manager-students-panel";
import { StudentCreateForm } from "@/components/student-create-form";
import {
  getManagerStudents,
  getProgramsData,
  getSessionSeriesOptions,
  getStudentDetailQuestions,
} from "@/lib/dashboard-data";
import { Users, UserCheck, AlertTriangle, Sparkles, Timer, ArrowRight, UserPlus, Inbox } from "lucide-react";

export default async function ManagerStudentsPage() {
  const [studentRows, programs, sessionSeriesOptions, questions] = await Promise.all([
    getManagerStudents(),
    getProgramsData(),
    getSessionSeriesOptions(),
    getStudentDetailQuestions(),
  ]);

  const activeStudents = studentRows.filter((student) => student.status.toLocaleLowerCase("tr-TR").includes("aktif"));
  const followStudents = studentRows.filter(
    (student) =>
      student.balance.toLocaleLowerCase("tr-TR") !== "odendi" ||
      student.status.toLocaleLowerCase("tr-TR").includes("takip"),
  );
  const detailReady = studentRows.filter((student) => student.detailSaved).length;
  const expiringStudents = studentRows.filter((student) => (student.remainingLessons ?? 0) === 1);
  const exhaustedStudents = studentRows.filter((student) => (student.remainingLessons ?? 0) === 0);

  return (
    <AppShell
      role="manager"
      eyebrow="Kayıt & Roster Akışı"
      title="Öğrenci Yönetimi"
      primaryAction={{ href: "/manager/students", label: "Verileri Yenile" }}
      contextCard={{
        eyebrow: "Sinyal Hattı",
        title: `${activeStudents.length} Aktif Öğrenci`,
        badge: `${followStudents.length} Takip`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-50 p-2.5 rounded-xl"><Users className="w-5 h-5 text-slate-500" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Tüm Kayıtlar</div>
          </div>
          <div className="text-4xl font-black text-slate-800">{studentRows.length}</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><UserCheck className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">Aktif & Canlı</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">{activeStudents.length}</div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Takip & Risk</div>
          </div>
          <div className="text-4xl font-black text-amber-950">{followStudents.length}</div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100 p-2.5 rounded-xl"><Sparkles className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">Karne Hedefi</div>
          </div>
          <div className="text-4xl font-black text-violet-950">{detailReady}</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100 p-2.5 rounded-xl"><Timer className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">Hak Biten</div>
          </div>
          <div className="text-4xl font-black text-rose-950">{expiringStudents.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
             {/* Render customized ManagerStudentsPanel here */}
             <ManagerStudentsPanel
                students={studentRows}
                programs={programs}
                sessionSeriesOptions={sessionSeriesOptions}
                questions={questions}
             />
          </div>

        </div>

        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          
          {/* New Student Form */}
          <div className="rounded-[3rem] bg-gradient-to-b from-sky-50 to-white border border-sky-100 p-8 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.15)] relative overflow-hidden group">
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <div className="bg-white p-2.5 rounded-[1.25rem] shadow-sm">
                 <UserPlus className="w-5 h-5 text-sky-500" />
               </div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Yeni Kayıt Aç</h2>
             </div>
             
             <div className="relative z-10 [&_label]:text-slate-500 [&_input]:bg-white [&_input]:border-slate-200 [&_input]:rounded-2xl [&_select]:bg-white [&_select]:border-slate-200 [&_select]:rounded-2xl [&_button]:bg-sky-500 [&_button]:text-white [&_button]:rounded-2xl [&_button]:font-bold [&_button:hover]:bg-sky-400">
               <StudentCreateForm programs={programs} sessionSeriesOptions={sessionSeriesOptions} />
             </div>
          </div>

          {/* Leads/Pre-registration inbox */}
          <div className="rounded-[3rem] bg-indigo-50 border border-indigo-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2.5 rounded-[1.25rem]">
                <Inbox className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black text-indigo-950 tracking-tight">Ön Kayıt Aktivasyonu</h2>
            </div>
            <p className="text-sm leading-relaxed text-indigo-900/60 font-medium mb-6">
              Landing üzerinden gelen web başvurularını ayrı bir onay penceresinde inceleyin ve onay verdiğiniz anda aktif öğrenci seans ataması yapılsın.
            </p>
            <Link
              href="/manager/pre-registrations"
              className="group/link flex items-center justify-between rounded-[1.25rem] bg-indigo-600 p-5 shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:-translate-y-1"
            >
              <div className="font-bold text-white">Ön Kayıt Havuzu</div>
              <div className="bg-white/10 p-2 rounded-full text-indigo-100 transition-colors">
                 <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* Alerts: Expiring */}
          <div className="rounded-[2.5rem] bg-amber-50/50 border border-amber-100 p-6 md:p-8">
            <h3 className="text-lg font-black text-amber-900 mb-6 flex items-center gap-2">
               <Timer className="w-5 h-5 text-amber-500" /> Yakında Hakkı Bitecek
            </h3>
            <div className="space-y-3">
              {(expiringStudents.length ? expiringStudents : followStudents).slice(0, 4).map((student) => (
                <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50 transition-all hover:shadow-md">
                  <div className="font-bold text-slate-800">{student.name}</div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {student.program} · {student.sessionSeriesLabel ?? "Grup Yok"}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                      {student.remainingLessons ?? 0} hak kaldı
                    </span>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {student.balance}
                    </span>
                  </div>
                </div>
              ))}
              {expiringStudents.length === 0 && followStudents.length === 0 && (
                <div className="text-sm font-medium text-amber-600/60 p-4 text-center">Uyarı kaydı bulunmuyor.</div>
              )}
            </div>
          </div>

          {/* Alerts: Exhausted */}
          <div className="rounded-[2.5rem] bg-rose-50/50 border border-rose-100 p-6 md:p-8">
            <h3 className="text-lg font-black text-rose-900 mb-6 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-rose-500" /> Seansı Bitenler
            </h3>
            <div className="space-y-3">
              {exhaustedStudents.length ? (
                exhaustedStudents.slice(0, 4).map((student) => (
                  <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50 transition-all hover:shadow-md">
                    <div className="font-bold text-slate-800">{student.name}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      {student.program} · {student.sessionSeriesLabel ?? "Grup Yok"}
                    </div>
                    <div className="mt-3 inline-flex rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-700">
                      Kontör Tükendi
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm font-medium text-rose-600/60 p-4 text-center border-2 border-dashed border-rose-100/50 rounded-2xl">
                  Bu listede henüz yeni paket bekleyen öğrenci yok.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
