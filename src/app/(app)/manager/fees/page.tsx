import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getProgramsData } from "@/lib/dashboard-data";
import { formatTry } from "@/lib/finance";
import { Tags, TrendingUp, Gem, Cuboid, Receipt, Coins, ShieldCheck, Fingerprint } from "lucide-react";

function getProgramTier(monthlyPrice: number) {
  if (monthlyPrice >= 6000) {
    return "Premium";
  }

  if (monthlyPrice >= 5000) {
    return "Performans";
  }

  return "Temel";
}

export default async function ManagerFeesPage() {
  const programs = await getProgramsData();
  const averagePrice = programs.length
    ? Math.round(programs.reduce((sum, program) => sum + program.monthlyPrice, 0) / programs.length)
    : 0;
  const totalCapacity = programs.reduce((sum, program) => sum + program.capacity, 0);
  const tierCounts = programs.reduce<Record<string, number>>((acc, program) => {
    const tier = getProgramTier(program.monthlyPrice);
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell
      role="manager"
      eyebrow="Finansal Modellemeler"
      title="Ücretler & Paketler"
      primaryAction={{ href: "/manager/programs", label: "Fiyat Stratejisi" }}
      contextCard={{
        eyebrow: "Merkez Bankası",
        title: `${programs.length} Aktif Fiyat Kuralı`,
        badge: formatTry(averagePrice),
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-sky-100 p-2.5 rounded-xl"><Tags className="w-5 h-5 text-sky-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-sky-600">KURALLAR</div>
          </div>
          <div className="text-4xl font-black text-sky-950">{programs.length}</div>
          <div className="text-sm font-medium text-sky-600/70 mt-2">Aktif Fiyat Şablonu</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">ORTALAMA</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">₺{(averagePrice / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-emerald-600/70 mt-2">Aylık Sözleşme Değeri</div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100 p-2.5 rounded-xl"><Gem className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">PREMIUM</div>
          </div>
          <div className="text-4xl font-black text-violet-950">{tierCounts.Premium ?? 0}</div>
          <div className="text-sm font-medium text-violet-600/70 mt-2">Yüksek Band Paket</div>
        </div>

        <div className="bg-indigo-50 rounded-[2rem] p-6 shadow-sm border border-indigo-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-indigo-100 p-2.5 rounded-xl"><Cuboid className="w-5 h-5 text-indigo-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-600">KAPASİTE</div>
          </div>
          <div className="text-4xl font-black text-indigo-950">{totalCapacity}</div>
          <div className="text-sm font-medium text-indigo-600/70 mt-2">Fiyatlandırılmış Satış</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="flex items-center gap-3">
                 <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><Receipt className="w-6 h-6 text-slate-500" /></div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Aktif Ücret Kuralları</h2>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Program Profili</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Demografi</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Ticari Değer</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program, idx) => (
                    <tr key={idx} className="border-b border-slate-50 align-middle hover:bg-slate-50/80 transition-colors last:border-b-0 group">
                       <td className="px-6 py-5">
                          <div className="text-[14px] font-bold text-slate-700">{program.title}</div>
                          <div className="mt-1 flex items-center gap-2">
                             <div className="inline-flex items-center rounded bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                               {String(program.capacity)} KONTENJAN
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <span className="inline-flex bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest max-w-max">
                            {program.ageBand}
                          </span>
                       </td>
                       <td className="px-6 py-5">
                          <div className="text-[15px] font-black text-slate-800">{formatTry(program.monthlyPrice)}</div>
                          <div className="text-[12px] font-semibold text-slate-400 inline-flex items-center gap-1 mt-1">
                             {getProgramTier(program.monthlyPrice) === 'Premium' && <Gem className="w-3 h-3 text-violet-500" />}
                             {getProgramTier(program.monthlyPrice)}
                          </div>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                             <ShieldCheck className="w-3.5 h-3.5" /> Aktif Onaylı
                          </span>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem] backdrop-blur-md">
                 <Coins className="w-5 h-5 text-amber-400" />
               </div>
               <h2 className="text-xl font-black tracking-tight">Segment Dağılımı</h2>
             </div>
             
             <p className="text-sm leading-relaxed text-slate-300 font-medium relative z-10 mb-8">
               Temel, performans ve premium paketleri akış içinde gör. Segment analizi stratejik konumlandırmayı okumayı kolaylaştırır.
             </p>

             <div className="space-y-3 relative z-10">
                {[
                  ["Temel", tierCounts.Temel ?? 0, "Başlangıç ve giriş seviyesi kurallar", "bg-slate-700/50 text-slate-200"],
                  ["Performans", tierCounts.Performans ?? 0, "Daha yoğun ritimde işleyen paketler", "bg-sky-500/20 text-sky-300"],
                  ["Premium", tierCounts.Premium ?? 0, "Yüksek fiyat bandlı VIP programlar", "bg-violet-500/20 text-violet-300"],
                ].map(([label, count, description, cls]) => (
                   <div key={label.toString()} className="bg-white/5 border border-white/5 rounded-[1.5rem] p-4 backdrop-blur-md flex flex-col gap-2 transition-colors hover:bg-white/10">
                      <div className="flex items-center justify-between">
                         <div className="font-bold text-[15px]">{label}</div>
                         <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${cls}`}>
                            {count} Paket
                         </div>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400">{description}</div>
                   </div>
                ))}
             </div>
          </div>

          <div className="rounded-[3rem] bg-indigo-50 border border-indigo-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <Fingerprint className="w-6 h-6 text-indigo-600" />
               <h3 className="text-lg font-black text-indigo-900">Hızlı Aksiyonlar</h3>
             </div>
             <p className="text-sm text-indigo-700/70 font-medium mb-6">Program bazlı fiyat düzenlemeleri ve yeni ücret bandı açılışları kalıcı kayıtlarda değiştirilebilir.</p>
             <Link 
               href="/manager/programs"
               className="flex items-center justify-center w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 transition-colors shadow-md shadow-indigo-600/20"
             >
               Program Fiyatlarını İncele
             </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
