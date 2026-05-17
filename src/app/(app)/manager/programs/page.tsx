import { AppShell } from "@/components/app-shell";
import { ProgramCreateDialog } from "@/components/program-create-dialog";
import { ProgramsPanel } from "@/components/programs-panel";
import { getProgramFormOptions, getProgramsData, getSessionsData } from "@/lib/dashboard/manager-data";
import { Layers, Cuboid, DollarSign, UsersRound, Zap, ListPlus, MapPin, Clock } from "lucide-react";

export default async function ManagerProgramsPage() {
  const [programs, sessions, formOptions] = await Promise.all([
    getProgramsData(),
    getSessionsData(),
    getProgramFormOptions(),
  ]);
  const totalCapacity = programs.reduce((sum, program) => sum + program.capacity, 0);
  const totalMonthlyValue = programs.reduce((sum, program) => sum + program.monthlyPrice, 0);
  const activePrograms = programs.length;
  const totalGroups = programs.reduce((sum, program) => sum + (program.sessionSeriesCount ?? 0), 0);
  const totalStudents = programs.reduce((sum, program) => sum + (program.enrolledCount ?? 0), 0);

  return (
    <AppShell
      role="manager"
      eyebrow="Grup Yönetim Modeli"
      title="Programlar & Ürünler"
      primaryAction={{ href: "/manager/programs", label: "Envanteri Yenile" }}
      contextCard={{
        eyebrow: "Doluluk Sinyali",
        title: `${activePrograms} Aktif Program`,
        badge: `${totalGroups} Gruba Dağıtıldı`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-sky-100 p-2.5 rounded-xl"><Layers className="w-5 h-5 text-sky-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-sky-600">BRANŞ</div>
          </div>
          <div className="text-4xl font-black text-sky-950">{programs.length}</div>
          <div className="text-sm font-medium text-sky-600/70 mt-2">Toplam ürün</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><Cuboid className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">KONTENJAN</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">{totalCapacity}</div>
          <div className="text-sm font-medium text-emerald-600/70 mt-2">Toplam kapasite</div>
        </div>

        <div className="bg-indigo-50 rounded-[2rem] p-6 shadow-sm border border-indigo-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-indigo-100 p-2.5 rounded-xl"><DollarSign className="w-5 h-5 text-indigo-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-600">VOLÜM</div>
          </div>
          <div className="text-4xl font-black text-indigo-950">₺{(totalMonthlyValue / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-indigo-600/70 mt-2">Aylık ürün değeri</div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100 p-2.5 rounded-xl"><UsersRound className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">ÜYELİK</div>
          </div>
          <div className="text-4xl font-black text-violet-950">{totalStudents}</div>
          <div className="text-sm font-medium text-violet-600/70 mt-2">{totalGroups} grupta kayıtlı</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><ListPlus className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Ürün Listesi</h2>
            </div>
            
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
              <ProgramsPanel programs={programs} formOptions={formOptions} showSummary={false} />
            </div>
          </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-8 shadow-[0_20px_50px_-15px_rgba(59,130,246,0.1)] relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="bg-white p-2.5 rounded-[1.25rem] shadow-sm">
                 <Zap className="w-5 h-5 text-blue-500" />
               </div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Ürün Modellemesi</h2>
             </div>
             
             <p className="text-sm leading-relaxed text-slate-500 font-medium relative z-10 mb-8">
               Elitkids altyapısında ticari hedefler <strong>Programlar</strong> ile tasarlanırken, operasyonel süreçler takvim bazlı seanslara oturtulmuş <strong>Gruplarla</strong> takip edilir.
             </p>

             <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">YENİ ÜRÜN TANIMLA</h3>
             <div className="relative z-10 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
               <ProgramCreateDialog options={formOptions} />
             </div>
          </div>

          <div className="rounded-[3rem] bg-white border border-slate-100 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-xl">
                 <Clock className="w-5 h-5 text-slate-600" />
              </div>
              Yaklaşan Seanslar
            </h3>
            
            <div className="space-y-4">
              {sessions.length ? (
                sessions.slice(0, 4).map((session, i) => (
                  <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-slate-800 text-sm leading-snug pr-4">{session.title}</div>
                      <div className="shrink-0 text-[10px] font-black tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">{session.slot}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {session.location}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm font-medium text-slate-500 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  Yakın zamanda planlanan seans yok.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
