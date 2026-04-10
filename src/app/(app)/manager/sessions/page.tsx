import { AppShell } from "@/components/app-shell";
import { SessionCreateForm } from "@/components/session-create-form";
import { SessionsPanel } from "@/components/sessions-panel";
import {
  getManagerAttendanceBoards,
  getCoachOptions,
  getProgramFormOptions,
  getProgramOptions,
  getSessionsData,
} from "@/lib/dashboard-data";
import { CalendarDays, ShieldAlert, BadgeCheck, Map as MapIcon, PlusSquare, Goal } from "lucide-react";

export default async function ManagerSessionsPage() {
  const [sessions, programs, coaches, attendanceBoards, formOptions] = await Promise.all([
    getSessionsData(),
    getProgramOptions(),
    getCoachOptions(),
    getManagerAttendanceBoards(),
    getProgramFormOptions(),
  ]);
  const openSessions = sessions.filter((session) => !session.roster.includes("/"));
  const assignedCoaches = new Set(sessions.map((session) => session.coach).filter((coach) => coach !== "Atanacak")).size;
  const activeLocations = new Set(sessions.map((session) => session.location)).size;
  const totalGroups = new Set(sessions.map((session) => session.sessionSeriesId).filter(Boolean)).size;

  return (
    <AppShell
      role="manager"
      eyebrow="Takvim & Operasyon"
      title="Grup Seans Planları"
      primaryAction={{ href: "/manager/sessions", label: "Takvimi Senkronize Et" }}
      contextCard={{
        eyebrow: "Saha Durumu",
        title: `${totalGroups || sessions.length} Grup Seansı Aktif`,
        badge: `${activeLocations} Tesiste`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-50 rounded-[2rem] p-6 shadow-sm border border-blue-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-100 p-2.5 rounded-xl"><CalendarDays className="w-5 h-5 text-blue-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-blue-600">TAKVİM</div>
          </div>
          <div className="text-4xl font-black text-blue-950">{sessions.length}</div>
          <div className="text-sm font-medium text-blue-600/70 mt-2">Planlanmış Seans</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><BadgeCheck className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">KADRO</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">{assignedCoaches}</div>
          <div className="text-sm font-medium text-emerald-600/70 mt-2">Aktif Antrenör</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100 p-2.5 rounded-xl"><ShieldAlert className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">KAYIT</div>
          </div>
          <div className="text-4xl font-black text-rose-950">{openSessions.length}</div>
          <div className="text-sm font-medium text-rose-600/70 mt-2">Açık Kontenjan</div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100 p-2.5 rounded-xl"><MapIcon className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">ALAN</div>
          </div>
          <div className="text-4xl font-black text-violet-950">{totalGroups || 0}</div>
          <div className="text-sm font-medium text-violet-600/70 mt-2">{activeLocations} Farklı Tesis</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><CalendarDays className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Grup Seans Takvimi</h2>
            </div>
            
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
              <SessionsPanel
                sessions={sessions}
                programs={programs}
                coaches={coaches}
                areas={formOptions.areas}
                attendanceBoards={attendanceBoards}
                showSummary={false}
              />
            </div>
          </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-8 shadow-[0_20px_50px_-15px_rgba(99,102,241,0.1)] relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="bg-white p-2.5 rounded-[1.25rem] shadow-sm">
                 <Goal className="w-5 h-5 text-indigo-500" />
               </div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Model Özeti</h2>
             </div>
             
             <p className="text-sm leading-relaxed text-slate-500 font-medium relative z-10 mb-8">
               <strong>Önemli:</strong> Program bir üründür. Takvimde gördüğün her blok bir ürünün sahaya inmiş "grup seansı" uygulamasıdır.
             </p>

             <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2 flex items-center gap-2"><PlusSquare className="w-3.5 h-3.5"/> YENİ GRUP OLUŞTUR</h3>
             <div className="relative z-10 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm [&_.rounded-md]:rounded-xl [&_.border-input]:border-slate-200">
               <SessionCreateForm programs={programs} coaches={coaches} areas={formOptions.areas} />
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
