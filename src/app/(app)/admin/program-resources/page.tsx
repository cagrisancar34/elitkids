import { AdminProgramResourcesPanel } from "@/components/admin-program-resources-panel";
import { AppShell } from "@/components/app-shell";
import { getProgramResourceAdminData } from "@/lib/dashboard/admin-data";
import { Library, Shapes, Activity, Map, Database, ArrowRight } from "lucide-react";

export default async function AdminProgramResourcesPage() {
  const data = await getProgramResourceAdminData();

  return (
    <AppShell
      role="admin"
      eyebrow="Program Sözlüğü"
      title="Program Kaynakları"
      primaryAction={{ href: "/admin/program-resources", label: "Kaynak Alanını Yenile" }}
      contextCard={{
        eyebrow: "Veritabanı Durumu",
        title: `${data.programTypes.length} tip · ${data.categories.length} kategori`,
        badge: "Parametrik",
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-50 rounded-[2rem] p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-900 p-2.5 rounded-xl"><Database className="w-5 h-5 text-white" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Program Tipi</div>
          </div>
          <div className="text-4xl font-black text-slate-800">{data.programTypes.length}</div>
        </div>

        <div className="bg-fuchsia-50 rounded-[2rem] p-6 shadow-sm border border-fuchsia-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-fuchsia-100 p-2.5 rounded-xl"><Shapes className="w-5 h-5 text-fuchsia-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-fuchsia-600">Kategori</div>
          </div>
          <div className="text-4xl font-black text-fuchsia-950">{data.categories.length}</div>
        </div>

        <div className="bg-blue-50 rounded-[2rem] p-6 shadow-sm border border-blue-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-100 p-2.5 rounded-xl"><Activity className="w-5 h-5 text-blue-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-blue-600">Branş</div>
          </div>
          <div className="text-4xl font-black text-blue-950">{data.sportsBranches.length}</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><Map className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">Alan / Tesis</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">{data.areas.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="md:col-span-8 flex flex-col gap-8">
          
          <div className="rounded-[3rem] bg-white border border-slate-100 p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><Library className="w-6 h-6 text-slate-500" /></div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Merkezi Kaynak Tabloları</h2>
            </div>
            
            <div className="[&_.bg-background]:bg-slate-50 [&_.border-border]:border-slate-200 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-md">
              <AdminProgramResourcesPanel
                branches={data.branches}
                programTypes={data.programTypes}
                categories={data.categories}
                sportsBranches={data.sportsBranches}
                areas={data.areas}
              />
            </div>
          </div>

        </div>

        {/* SIDE COLUMN */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-b from-slate-900 to-[#020617] border border-slate-800 p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
             
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem] border border-white/10">
                 <Database className="w-5 h-5 text-cyan-300" />
               </div>
               <h2 className="text-2xl font-black text-white tracking-tight">Sözlük Kuralları</h2>
             </div>
             
             <div className="relative z-10 space-y-4">
               {[
                 "Program tipleri, oluşturma ve düzenleme formlarındaki program tipi seçeneğini besler.",
                 "Alan / Tesis kayıtları seans planlama ve takvim bloklarında kullanılır.",
                 "Bağlı program veya seans bulunan bir kaynak silinmek istenirse sistem SQL bütünlüğünü korur ve engeller."
               ].map((item, idx) => (
                 <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-md">
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">{item}</p>
                 </div>
               ))}
               
               <div className="mt-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-widest">
                   <ArrowRight className="w-4 h-4" />
                   Referential Integrity Aktif
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
