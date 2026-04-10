import { AppShell } from "@/components/app-shell";
import { PreRegistrationsPanel } from "@/components/pre-registrations-panel";
import { getOperatorPreRegistrations } from "@/lib/pre-registration-server";
import { Inbox, UserPlus, FileSearch, PhoneForwarded, CopyCheck, AlertOctagon, CalendarSearch, ImagePlus } from "lucide-react";

export default async function ManagerPreRegistrationsPage() {
  const { records, options, error } = await getOperatorPreRegistrations();

  const newCount = records.filter((record) => record.status === "new").length;
  const reviewingCount = records.filter((record) => record.status === "reviewing").length;
  const contactedCount = records.filter((record) => record.status === "contacted").length;
  const activatedCount = records.filter((record) => record.status === "activated").length;
  const rejectedCount = records.filter((record) => record.status === "rejected").length;

  return (
    <AppShell
      role="manager"
      eyebrow="Lead → Aktivasyon Akışı"
      title="Ön Kayıt Havuzu"
      primaryAction={{ href: "/manager/pre-registrations", label: "Verileri Yenile" }}
      contextCard={{
        eyebrow: "Sinyal Hattı",
        title: `${newCount} Yeni Başvuru Bekliyor`,
        badge: `${activatedCount} Aktive Edildi`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-sky-100 p-2.5 rounded-xl"><UserPlus className="w-5 h-5 text-sky-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-sky-600">Yeni Başvuru</div>
          </div>
          <div className="text-4xl font-black text-sky-950">{newCount}</div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><FileSearch className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">İncelemede</div>
          </div>
          <div className="text-4xl font-black text-amber-950">{reviewingCount}</div>
        </div>

        <div className="bg-fuchsia-50 rounded-[2rem] p-6 shadow-sm border border-fuchsia-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-fuchsia-100 p-2.5 rounded-xl"><PhoneForwarded className="w-5 h-5 text-fuchsia-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-fuchsia-600">İletişimde</div>
          </div>
          <div className="text-4xl font-black text-fuchsia-950">{contactedCount}</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><CopyCheck className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">Aktive Edilen</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">{activatedCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><Inbox className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kabul Masası</h2>
            </div>
            
            {error ? <p className="px-4 py-4 text-sm text-rose-500 font-bold bg-rose-50 rounded-2xl mb-6">{error}</p> : null}
            
            {/* The Panel handles its own DataGrid/Table UI inside */}
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
              <PreRegistrationsPanel
                records={records}
                branches={options.branches}
                seasons={options.seasons}
                programs={options.programs}
                sessionSeries={options.sessionSeries}
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
                 <CopyCheck className="w-5 h-5 text-indigo-500" />
               </div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Aktivasyon Mentilitesi</h2>
             </div>
             
             <p className="text-sm leading-relaxed text-slate-500 font-medium relative z-10 mb-8">
               Başvuru önce havuzda kalır. Formlar incelendikten ve onaya uygun görülürse, tek tıkla doğrudan Aktif Kayıt sistemine çekilir.
             </p>
             
             <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">KRİTİK SİNYALLER</h3>
             
             <div className="space-y-3 relative z-10">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center justify-between transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                     <AlertOctagon className="w-4 h-4 text-rose-500" /> Reddedilenler
                  </div>
                  <div className="bg-rose-50 text-rose-700 font-black px-3 py-1 rounded-full text-[11px] tracking-widest">{rejectedCount}</div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center justify-between transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                     <CalendarSearch className="w-4 h-4 text-blue-500" /> Sezonu Seçilmiş
                  </div>
                  <div className="bg-blue-50 text-blue-700 font-black px-3 py-1 rounded-full text-[11px] tracking-widest">{records.filter((record) => record.seasonId).length}</div>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center justify-between transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                     <ImagePlus className="w-4 h-4 text-violet-500" /> Fotoğraflı Formlar
                  </div>
                  <div className="bg-violet-50 text-violet-700 font-black px-3 py-1 rounded-full text-[11px] tracking-widest">{records.filter((record) => record.assets.length).length}</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
