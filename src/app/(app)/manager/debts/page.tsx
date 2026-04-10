import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getChargeData } from "@/lib/dashboard-data";
import { formatTry } from "@/lib/finance";
import { HandCoins, ShieldAlert, BadgeInfo, Radar, Receipt, ShieldX, WalletCards, BriefcaseBusiness, ScanEye } from "lucide-react";

function parseTry(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export default async function ManagerDebtsPage() {
  const charges = await getChargeData();
  const openCharges = charges.filter((charge) => !charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const paidCharges = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const trackedCharges = openCharges
    .map((charge) => ({ ...charge, amountRaw: parseTry(charge.amount) }))
    .sort((left, right) => right.amountRaw - left.amountRaw);
  const riskyCharges = trackedCharges.filter((charge) => charge.amountRaw >= 5000);
  const openBalance = trackedCharges.reduce((sum, charge) => sum + charge.amountRaw, 0);
  const closedBalance = paidCharges.reduce((sum, charge) => sum + parseTry(charge.amount), 0);

  return (
    <AppShell
      role="manager"
      eyebrow="Finansal Alarm Sistemi"
      title="Bakiye & Risk Takibi"
      primaryAction={{ href: "/manager/payments", label: "Tahsilata Git" }}
      contextCard={{
        eyebrow: "Risk Radar Merkezi",
        title: `₺${openBalance.toLocaleString("tr-TR")} Açık Bakiye`,
        badge: `${riskyCharges.length} Kritik Kayıt`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><WalletCards className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">AÇIK BAKIYE</div>
          </div>
          <div className="text-4xl font-black text-amber-950">₺{(openBalance / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-amber-600/70 mt-2">Ödeme Bekleyen Tutar</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100 p-2.5 rounded-xl"><ShieldX className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">ACİL TAKİP</div>
          </div>
          <div className="text-4xl font-black text-rose-950">{riskyCharges.length}</div>
          <div className="text-sm font-medium text-rose-600/70 mt-2">Kritik Limit Aşımı</div>
        </div>

        <div className="bg-indigo-50 rounded-[2rem] p-6 shadow-sm border border-indigo-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-indigo-100 p-2.5 rounded-xl"><BriefcaseBusiness className="w-5 h-5 text-indigo-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-600">AÇIK DOSYA</div>
          </div>
          <div className="text-4xl font-black text-indigo-950">{openCharges.length}</div>
          <div className="text-sm font-medium text-indigo-600/70 mt-2">Ödenmeyen Tahakkuk</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><HandCoins className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">TAHSİLAT</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">₺{(closedBalance / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-emerald-600/70 mt-2">{paidCharges.length} Başarılı İşlem</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="flex items-center gap-3">
                 <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><Receipt className="w-6 h-6 text-slate-500" /></div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bekleyen Tahakkuklar</h2>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Tahakkuk / İşlem</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Vade & Durum</th>
                    <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Ödenecek Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {trackedCharges.map((charge, idx) => {
                    const isCritical = charge.amountRaw >= 5000;
                    const isTrack = charge.amountRaw >= 3000 && charge.amountRaw < 5000;
                    
                    return (
                      <tr key={idx} className="border-b border-slate-50 align-middle hover:bg-slate-50/80 transition-colors last:border-b-0 group">
                        <td className="px-6 py-5">
                            <div className="text-[14px] font-bold text-slate-800">{charge.item}</div>
                            <div className="mt-1 flex items-center gap-2">
                              {isCritical && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100">
                                  KRİTİK
                                </span>
                              )}
                              {isTrack && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100">
                                  TAKİP
                                </span>
                              )}
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <div className="text-[13px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg inline-flex max-w-max">
                              Son Gün: {charge.dueDate}
                            </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className="text-[16px] font-black text-slate-800">{charge.amount}</div>
                            <div className={`mt-1 text-[11px] font-bold uppercase tracking-widest ${isCritical ? 'text-rose-500' : 'text-slate-400'}`}>
                              {isCritical ? 'Riskli Bakiye' : charge.status}
                            </div>
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
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* PRIORITY RISKS */}
          <div className="rounded-[3rem] bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-8 shadow-[0_20px_50px_-15px_rgba(225,29,72,0.1)] relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-[40px] transition-transform duration-700 group-hover:scale-150"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="bg-rose-500 p-2.5 rounded-[1.25rem] shadow-lg shadow-rose-500/20">
                 <ScanEye className="w-5 h-5 text-white" />
               </div>
               <h2 className="text-xl font-black tracking-tight text-rose-950">Öncelikli Radar</h2>
             </div>
             
             <p className="text-sm leading-relaxed text-rose-900/70 font-medium relative z-10 mb-8">
               Borç listesindeki bakiyeler finans ekibi tarafından öncelikli tahsil edilmesi gereken hesaplar olarak işaretlenmiştir.
             </p>

             <div className="space-y-3 relative z-10">
                {trackedCharges.slice(0, 5).map((charge, i) => (
                   <div key={i} className="bg-white border border-rose-50 rounded-[1.5rem] p-4 shadow-sm flex flex-col transition-transform hover:-translate-y-0.5">
                      <div className="font-bold text-[14px] text-slate-800">{charge.item}</div>
                      <div className="flex items-center justify-between mt-3">
                         <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Vade: {charge.dueDate}</div>
                         <div className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-rose-600 border border-rose-100">
                            {charge.amount}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* ACTION PANEL */}
          <div className="rounded-[3rem] bg-white border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                 <ShieldAlert className="w-6 h-6 text-slate-600" />
               </div>
               <h3 className="text-lg font-black text-slate-800">Aksiyon Hattı</h3>
             </div>
             <p className="text-sm text-slate-500 font-medium mb-6">Veliyle iletişime geçildiğinde veya tahsilat yapıldığında ödeme işlemine geç.</p>
             <Link 
               href="/manager/payments"
               className="flex items-center justify-center w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 transition-colors shadow-md shadow-slate-900/20 ring-2 ring-slate-900/10 ring-offset-2 outline-none"
             >
               Ödeme Ekranına Dön
             </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
