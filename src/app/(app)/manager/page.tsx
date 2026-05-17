import { AppShell } from "@/components/app-shell";
import {
  getManagerDashboardSummary,
} from "@/lib/dashboard/manager-data";
import { ArrowUpRight, Trophy, FileText, Wallet, Calendar, BellRing, UsersRound } from "lucide-react";

export default async function ManagerPage() {
  const summary = await getManagerDashboardSummary();
  const { metrics, criticalStudents, announcements, todaySessions, priorityPayments } = summary;

  return (
    <AppShell
      role="manager"
      eyebrow="Yönetici"
      title="Operasyon Merkezi"
      primaryAction={{ href: "/manager/students", label: "Yeni Öğrenci" }}
      contextCard={{
        eyebrow: "Sistem Durumu",
        title: "Tüm servisler aktif, operasyonlar olağan seyrinde",
        badge: "Canlı",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
        
        {/* HERO METRIC BENTO - 8 colspan */}
        <div className="md:col-span-8 rounded-[3rem] bg-slate-900 bg-gradient-to-bl from-slate-800 via-slate-900 to-black p-8 md:p-12 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col justify-between min-h-[360px] group border border-slate-700">
          {/* Animated meshes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-violet-600/20 blur-[80px] mix-blend-screen pointer-events-none transition-transform duration-1000 group-hover:scale-150"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-blue-200 backdrop-blur-md shadow-inner">
                Ana Metrik &amp; Performans
              </div>
              <div className="mt-8 flex items-baseline gap-6">
                <span className="text-[6rem] leading-[0.8] font-black tracking-[-0.06em] bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {metrics[0]?.value || "0"}
                </span>
                <span className="inline-flex items-center rounded-[1rem] bg-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-300 backdrop-blur-md ring-1 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <ArrowUpRight className="mr-1 h-5 w-5 stroke-[3]" /> {metrics[0]?.delta || "0%"}
                </span>
              </div>
              <p className="mt-4 text-slate-400 font-medium text-lg max-w-sm">{metrics[0]?.label || "Genel Performans"}</p>
            </div>
          </div>

          <div className="relative z-10 mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.slice(1, 4).map((m, i) => (
              <div key={m.label} className="bg-white/5 rounded-[1.5rem] p-5 backdrop-blur-md border border-white/5 hover:bg-white/10 hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${i === 0 ? 'bg-blue-500/20 text-blue-300' : i === 1 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {i === 0 ? <UsersRound className="w-4 h-4" /> : i === 1 ? <Wallet className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-tight">{m.label}</div>
                </div>
                <div className="text-3xl font-black mt-2 text-white/90 tracking-tight">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING SESSIONS BENTO - 4 colspan */}
        <div className="md:col-span-4 rounded-[3rem] bg-[#f8fafe] border border-blue-100 p-8 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.1)] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-blue-200 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
            <Calendar className="w-32 h-32 opacity-[0.15]" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3 relative z-10">
            <span className="w-2 h-8 rounded-full bg-blue-500"></span>
            Günün Seansları
          </h2>
          
          {todaySessions.length > 0 ? (
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 relative z-10">
              {todaySessions.map((s, idx) => (
                <div key={`${s.title}-${idx}`} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{s.slot}</div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                  <div className="text-xl font-bold text-slate-900 leading-tight">{s.title}</div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {s.location}
                    </span>
                    <span className="text-slate-800">{s.coach}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border-2 border-dashed border-slate-200 rounded-[2rem]">
               <div className="bg-slate-50 p-4 rounded-full mb-4"><Calendar className="w-8 h-8 text-slate-300" /></div>
               <p className="text-slate-500 font-medium">Bugün aktif takvim kaydı bulunamadı.</p>
             </div>
          )}
        </div>

        {/* CRITICAL STUDENTS TABLE - 8 colspan */}
        <div className="md:col-span-8 rounded-[3rem] bg-white border border-slate-100 p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
              <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
                <UsersRound className="w-6 h-6 text-white" />
              </div>
              Kritik Operasyon Listesi
            </h2>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-slate-800 hover:-translate-y-0.5 transition-all outline-none ring-2 ring-slate-900/20 ring-offset-2">
              Tüm Kayıtları Aç
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-6 font-bold text-slate-400 text-xs uppercase tracking-widest px-4 border-b border-slate-100">Öğrenci Profili</th>
                  <th className="pb-6 font-bold text-slate-400 text-xs uppercase tracking-widest px-4 border-b border-slate-100">Program / Brans</th>
                  <th className="pb-6 font-bold text-slate-400 text-xs uppercase tracking-widest px-4 border-b border-slate-100">Durum</th>
                  <th className="pb-6 font-bold text-slate-400 text-xs uppercase tracking-widest px-4 border-b border-slate-100 text-right">Tahakkuk / Bakiye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/80">
                {criticalStudents.map((student, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4">
                      <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{student.name}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${student.attendance.includes('Eksik') ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                        Devam: {student.attendance}
                      </div>
                    </td>
                    <td className="py-6 px-4 font-bold text-slate-500">{student.program}</td>
                    <td className="py-6 px-4">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${
                        student.status === 'Aktif' 
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <div className="font-black text-slate-800 text-lg">{student.balance}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN (RISKS + ANNOUNCEMENTS) - 4 colspan */}
        <div className="md:col-span-4 flex flex-col gap-8">
          
          {/* RISKS BENTO */}
          <div className="rounded-[3rem] bg-gradient-to-b from-[#fff5f5] to-white border border-rose-100 p-8 shadow-[0_20px_50px_-15px_rgba(244,63,94,0.1)] relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="bg-rose-500 p-2.5 rounded-[1.25rem] shadow-lg shadow-rose-500/20">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                Odeme Durumu
              </h2>
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm">{priorityPayments.length}</div>
            </div>
            
            <div className="space-y-4 relative z-10">
              {priorityPayments.length > 0 ? (
                priorityPayments.map(c => (
                  <div key={`${c.item}-${c.dueDate}`} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-rose-50 hover:shadow-md hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-bold text-slate-800 pr-4 leading-tight">{c.item}</div>
                      <div className="shrink-0 bg-slate-50 px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.dueDate}</div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-[10px] uppercase font-black tracking-widest text-rose-500">{c.status}</div>
                      <div className="font-black text-slate-900 text-lg">{c.remainingAmount ?? c.amount}</div>
                    </div>
                  </div>
                ))
              ) : (
              <p className="text-slate-500 font-medium text-center py-6">Geciken veya bekleyen ödeme bulunmuyor.</p>
              )}
            </div>
          </div>

          {/* ANNOUNCEMENTS BENTO */}
          <div className="rounded-[3rem] bg-amber-50/50 border border-amber-100/60 p-8 shadow-[0_20px_50px_-15px_rgba(245,158,11,0.05)] flex-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
            
            <div className="relative z-10 flex items-center gap-3 mb-8">
              <div className="bg-amber-400 p-2.5 rounded-[1.25rem] shadow-lg shadow-amber-400/20 group-hover:scale-110 transition-transform">
                <BellRing className="w-5 h-5 text-amber-950" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Panodan Notlar</h2>
            </div>

            <div className="space-y-4 relative z-10">
              {announcements.length > 0 ? (
                announcements.map((a, i) => (
                  <div key={`${a.title}-${i}`} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 hover:bg-amber-50/30 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-extrabold text-slate-900 text-sm">{a.title}</div>
                      <div className="text-[9px] shrink-0 font-black uppercase text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full tracking-widest">{a.audience}</div>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-4">{a.summary}</p>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> {a.time}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 font-medium text-center py-6">Yeni not bulunmuyor.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
