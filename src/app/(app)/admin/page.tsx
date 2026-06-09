import { AppShell } from "@/components/app-shell";
import { getAdminOverviewSummary } from "@/lib/dashboard/admin-data";
import { 
  ArrowUpRight, 
  ShieldCheck, 
  Settings, 
  Users, 
  ShieldAlert,
  TerminalSquare,
  ArrowRight,
  Radio
} from "lucide-react";
import Link from "next/link";

const accessMatrix = [
  { scope: "Rol matrisleri", owner: "Admin", status: "Aktif" },
  { scope: "Supabase RLS politikasi", owner: "Admin", status: "Aktif" },
  { scope: "Public Site CMS", owner: "Admin", status: "Canlı" },
];

export default async function AdminPage() {
  const summary = await getAdminOverviewSummary().catch((error) => {
  console.error("Admin page summary failed", error);

  return {
    metrics: [
      { label: "Aktif kullanıcı", value: "0", delta: "Yedek veri" },
      { label: "Rol kaydı", value: "0", delta: "Yedek veri" },
      { label: "Okunmamış bildirim", value: "0", delta: "Yedek veri" },
    ],
    notifications: [],
  };
});

const metrics = Array.isArray(summary?.metrics) && summary.metrics.length
  ? summary.metrics
  : [
      { label: "Aktif kullanıcı", value: "0", delta: "Yedek veri" },
      { label: "Rol kaydı", value: "0", delta: "Yedek veri" },
      { label: "Okunmamış bildirim", value: "0", delta: "Yedek veri" },
    ];

const notifications = Array.isArray(summary?.notifications)
  ? summary.notifications
  : [];

  return (
    <AppShell
      role="admin"
      eyebrow="Sistem Yöneticisi"
      title="Yönetim Merkezi"
      primaryAction={{ href: "/admin/public-site", label: "Public Site CMS'i Aç" }}
      contextCard={{
        eyebrow: "Güvenlik Düzeyi",
        title: "Tüm RLS politikaları ve veri yolları güvende",
        badge: "Şifreli",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
        
        {/* HERO METRIC BENTO - 8 colspan */}
        <div className="md:col-span-8 rounded-[3rem] bg-slate-900 bg-gradient-to-bl from-[#0f172a] via-[#020617] to-black p-8 md:p-12 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col justify-between min-h-[360px] group border border-slate-800">
          {/* Animated meshes - Teal & Cyan for Admin */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px] mix-blend-screen pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[80px] mix-blend-screen pointer-events-none transition-transform duration-1000 group-hover:scale-150"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200 backdrop-blur-md shadow-inner">
                Sistem Çekirdeği
              </div>
              <div className="mt-8 flex items-baseline gap-6">
                <span className="text-[6rem] leading-[0.8] font-black tracking-[-0.06em] bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {metrics[0]?.value || "0"}
                </span>
                <span className="inline-flex items-center rounded-[1rem] bg-cyan-500/20 px-4 py-2 text-sm font-black text-cyan-300 backdrop-blur-md ring-1 ring-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <ArrowUpRight className="mr-1 h-5 w-5 stroke-[3]" /> {metrics[0]?.delta || "Canlı"}
                </span>
              </div>
              <p className="mt-4 text-slate-400 font-medium text-lg max-w-sm">{metrics[0]?.label || "Aktif Kullanıcı"}</p>
            </div>
            
            {/* Top Right Mini Stats */}
            <div className="hidden lg:flex gap-4">
               <div className="p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10 text-center min-w-[100px]">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modül</div>
                 <div className="text-xl font-black text-white">3</div>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10 text-center min-w-[100px]">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kontrol</div>
                 <div className="text-xl font-black text-white">Merkez</div>
               </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
            {metrics.slice(1, 3).map((m, i) => (
              <div key={m.label} className="bg-white/5 rounded-[1.5rem] p-5 backdrop-blur-md border border-white/5 hover:bg-white/10 hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${i === 0 ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {i === 0 ? <Settings className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-tight">{m.label}</div>
                </div>
                <div className="text-3xl font-black mt-2 text-white/90 tracking-tight">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACCESS BENTO - 4 colspan */}
        <div className="md:col-span-4 rounded-[3rem] bg-gradient-to-b from-[#f0f9ff] to-white border border-sky-100 p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(14,165,233,0.15)] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-sky-200 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
            <TerminalSquare className="w-40 h-40 opacity-[0.1]" strokeWidth={1} />
          </div>
          
          <div className="relative z-10 mb-auto">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-sky-500"></span>
              Hızlı Erişim
            </h2>
            <p className="text-sm font-semibold text-slate-500">Sayfa, kullanıcı ve güvenlik işlemleri</p>
          </div>
          
          <div className="relative z-10 flex flex-col gap-4 mt-8">
             <Link
               href="/admin/public-site"
               className="group/link flex items-center justify-between rounded-[1.25rem] bg-slate-900 p-5 shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-1"
             >
               <div className="font-bold text-white text-lg">Public Site CMS</div>
               <div className="bg-white/10 p-2 rounded-full group-hover/link:bg-sky-500 group-hover/link:text-white text-slate-300 transition-colors">
                  <ArrowRight className="w-5 h-5" />
               </div>
             </Link>
             
             <Link
               href="/"
               target="_blank"
               className="flex items-center justify-center gap-2 rounded-[1.25rem] border-2 border-slate-100 bg-white p-5 font-bold text-slate-600 hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-700 transition-all"
             >
               <Radio className="w-5 h-5" />
               Canlı Siteyi Gör
             </Link>
          </div>
        </div>

        {/* ACCESS MATRIX (YETKİ MATRİSİ) - 8 colspan */}
        <div className="md:col-span-8 rounded-[3rem] bg-white border border-slate-100 p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
              <div className="bg-cyan-50 p-3 rounded-2xl shadow-sm border border-cyan-100">
                <ShieldCheck className="w-6 h-6 text-cyan-600" />
              </div>
              Güvenlik & Yetki Matrisi
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-6 font-bold text-slate-400 text-xs uppercase tracking-widest px-4 border-b border-slate-100">Güvenlik Alanı</th>
                  <th className="pb-6 font-bold text-slate-400 text-xs uppercase tracking-widest px-4 border-b border-slate-100">Sorumlu Rol</th>
                  <th className="pb-6 font-bold text-slate-400 text-xs uppercase tracking-widest px-4 border-b border-slate-100 text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {accessMatrix.map((item, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4">
                      <div className="font-bold text-slate-900 text-lg">{item.scope}</div>
                      <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        Core modülü
                      </div>
                    </td>
                    <td className="py-6 px-4">
                       <span className="inline-flex items-center gap-1.5 font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                         <Users className="w-4 h-4 text-slate-400" /> {item.owner}
                       </span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${
                        item.status === 'Aktif' || item.status === 'Canlı'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NOTIFICATION LOG - 4 colspan */}
        <div className="md:col-span-4 rounded-[3rem] bg-slate-50/80 border border-slate-200/60 p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               Sistem Kayıtları
            </h2>
            <div className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{notifications.length} Bekleyen</div>
          </div>

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.title} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 hover:-translate-y-0.5 transition-all">
                  <div className="font-bold text-slate-800 text-sm">{notification.title}</div>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded capitalize">{notification.channel}</span>
                    <span className="text-cyan-600 uppercase tracking-widest text-[9px] font-black">{notification.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                <ShieldCheck className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Bekleyen güvenlik veya sistem kaydı yok.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
