import { Siren, Sparkles, Activity, ShieldAlert, FileText, WifiHigh } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getAuditLogRows, getLeadSubmissionRows } from "@/lib/dashboard/admin-data";

export default async function AdminSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ highlightLead?: string }>;
}) {
  const params = await searchParams;
  const [auditRows, leadRows] = await Promise.all([
    getAuditLogRows(),
    getLeadSubmissionRows(),
  ]);

  return (
    <AppShell
      role="admin"
      eyebrow="Güvenlik & Denetim"
      title="Sistem Logları"
      primaryAction={{ href: "/admin/security", label: "Audit Kayıtlarını Yenile" }}
      contextCard={{
        eyebrow: "Sistem Durumu",
        title: `${auditRows.length} audit · ${leadRows.length} basvuru`,
        badge: "İzleniyor",
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-50 rounded-[2rem] p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:!border-slate-300 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-900 p-2.5 rounded-xl"><FileText className="w-5 h-5 text-white" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Aksiyon Logu</div>
          </div>
          <div className="text-4xl font-black text-slate-800">{auditRows.length}</div>
        </div>

        <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-sky-100/50 p-2.5 rounded-xl"><Activity className="w-5 h-5 text-sky-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-sky-600">Yeni Başvuru</div>
          </div>
          <div className="text-4xl font-black text-sky-950">{leadRows.length}</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100 p-2.5 rounded-xl"><ShieldAlert className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">Kritik Alan</div>
          </div>
          <div className="text-4xl font-black text-rose-950">3</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><WifiHigh className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">Sinyal Durumu</div>
          </div>
          <div className="text-xl mt-3 font-black text-emerald-950 uppercase tracking-widest">Canlı</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="md:col-span-8 flex flex-col gap-8">
          
          <div className="rounded-[3rem] bg-white border border-slate-100 p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                 <div className="bg-slate-100 p-2 rounded-xl text-slate-500"><FileText className="w-5 h-5" /></div>
                 Son Audit Olayları
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="pb-6 px-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">Tetkik / Olay</th>
                    <th className="pb-6 px-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">Aktör / Kaynak</th>
                    <th className="pb-6 px-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100 text-right">Zaman Damgası</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {auditRows.map((row, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-4">
                        <div className="font-bold text-slate-800 text-sm">{row.event}</div>
                        <div className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-widest">{row.scope}</div>
                      </td>
                      <td className="py-5 px-4 font-semibold text-slate-500 text-xs">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md">{row.actor}</span>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.createdAt}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div id="landing-basvurulari" className="rounded-[3rem] bg-white border border-slate-100 p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                 <div className="bg-sky-50 border border-sky-100 p-2 rounded-xl text-sky-500"><Activity className="w-5 h-5" /></div>
                 Ulaşan Landing Formları
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="pb-6 px-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">Kişi / İletişim</th>
                    <th className="pb-6 px-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">Durum</th>
                    <th className="pb-6 px-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100 text-right">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leadRows.map((row) => {
                    const isHighlighted = row.id === params.highlightLead;
                    return (
                      <tr key={row.id} className={`group transition-colors ${
                        isHighlighted ? "bg-sky-50/50 relative" : "hover:bg-slate-50/50"
                      }`}>
                        {isHighlighted && (
                          <td colSpan={0} className="w-0 p-0 m-0 absolute left-0 top-0 bottom-0 border-l-4 border-sky-500 rounded-l-md"></td>
                        )}
                        <td className="py-5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{row.fullName}</div>
                          <div className="text-xs font-semibold text-slate-500 mt-1 flex flex-col md:flex-row gap-1 md:gap-3">
                            <span>{row.email}</span>
                            <span className="text-slate-300 hidden md:inline">•</span>
                            <span>{row.phone}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <span className="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm bg-slate-100 text-slate-600">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.createdAt}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* SIDE COLUMN */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-b from-slate-900 to-[#020617] border border-slate-800 p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
             
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem]">
                 <Siren className="w-5 h-5 text-rose-300" />
               </div>
               <h2 className="text-2xl font-black text-white tracking-tight">Erişim Uyarıları</h2>
             </div>
             
             <div className="relative z-10 space-y-4">
               {[
                 "Manager rolüne system-security yazma yetkisi verilmez.",
                 "Public lead formu service-role ile yazılır; ham auth istemcisine bırakılmaz.",
                 "Landing editörü her kayıtta audit izi bırakır."
               ].map((item, idx) => (
                 <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                    <p className="text-slate-300 text-xs leading-relaxed font-medium">{item}</p>
                 </div>
               ))}
               
               <div className="mt-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-widest">
                   <Sparkles className="h-4 w-4" />
                   Audit Omurgası Aktif
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
