import { AppShell } from "@/components/app-shell";
import { FinanceChargesPanel } from "@/components/finance-charges-panel";
import { ManualPaymentForm } from "@/components/manual-payment-form";
import { PaymentReminderPanel } from "@/components/payment-reminder-panel";
import { getChargeData, getChargeOptions } from "@/lib/dashboard-data";
import { Wallet, ShieldAlert, BarChart3, Coins, Zap, ReceiptText, ShieldCheck, MailWarning } from "lucide-react";

function parseTry(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

function monthLabel(value: string) {
  const [day, month] = value.split(".");
  return `${month ?? "--"}.${day ?? "--"}`;
}

export default async function ManagerFinancePage() {
  const [charges, chargeOptions] = await Promise.all([getChargeData(), getChargeOptions()]);
  const pending = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("bek"));
  const follow = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("takip"));
  const paid = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const amountTotal = (items: typeof charges) => items.reduce((sum, charge) => sum + parseTry(charge.amount), 0);
  const collectionRate =
    amountTotal(charges) > 0 ? Math.round((amountTotal(paid) / amountTotal(charges)) * 100) : 0;
  const trend = charges.slice(0, 6).map((charge) => ({
    label: monthLabel(charge.dueDate),
    value: parseTry(charge.amount),
    status: charge.status,
  }));
  const maxTrend = Math.max(...trend.map((point) => point.value), 1);

  return (
    <AppShell
      role="manager"
      eyebrow="Gelir & Tahsilat"
      title="Finans Merkezi"
      primaryAction={{ href: "/manager/payments", label: "Hızlı Tahsilat" }}
      contextCard={{
        eyebrow: "Genel Durum",
        title: `₺${(amountTotal(pending) / 1000).toFixed(1)}k Bekleyen`,
        badge: `%${collectionRate} Tahsilat Performansı`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-sky-100 p-2.5 rounded-xl"><Wallet className="w-5 h-5 text-sky-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-sky-600">TAHAKKUK</div>
          </div>
          <div className="text-4xl font-black text-sky-950">{charges.length}</div>
          <div className="text-sm font-medium text-sky-600/70 mt-2">Toplam İşlem</div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><Coins className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">AÇIK LİMİT</div>
          </div>
          <div className="text-4xl font-black text-amber-950">₺{(amountTotal(pending) / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-amber-600/70 mt-2">Bekleyen Ödeme</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100 p-2.5 rounded-xl"><ShieldAlert className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">RİSK HACMİ</div>
          </div>
          <div className="text-4xl font-black text-rose-950">₺{(amountTotal(follow) / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-rose-600/70 mt-2">Takipteki Bakiye</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><BarChart3 className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">TAHSİLAT</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">₺{(amountTotal(paid) / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-emerald-600/70 mt-2">Kapanan Hacim</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          {/* TRENDS CHART */}
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><BarChart3 className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Finansal Ritim & Beklenti</h2>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
               <div className="flex flex-col gap-4 justify-between bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                  <div>
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">DÖNEM HEDEFİ</h3>
                    <div className="text-4xl font-black text-emerald-500">% {collectionRate}</div>
                  </div>
                  <div>
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">RİSKLİ DOSYA</h3>
                    <div className="text-3xl font-black text-rose-500">{follow.length}</div>
                  </div>
                  <div>
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">VADESİ GELEN</h3>
                    <div className="text-3xl font-black text-amber-500">{pending.length}</div>
                  </div>
               </div>

               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-end gap-3 h-64 relative">
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-30 rounded-[2rem]"></div>
                  
                  {trend.length ? (
                    trend.map((point, index) => {
                       let barClass = "from-sky-400 to-blue-600";
                       if (point.status.toLocaleLowerCase("tr-TR").includes("odendi")) barClass = "from-emerald-400 to-emerald-600";
                       else if (point.status.toLocaleLowerCase("tr-TR").includes("takip")) barClass = "from-rose-400 to-red-600";

                       return (
                         <div key={index} className="flex-1 flex flex-col items-center gap-3 relative z-10 h-full justify-end group">
                           <div className="w-full max-w-[40px] relative rounded-t-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-end justify-center">
                             <div className={`w-full bg-gradient-to-t ${barClass} opacity-90 group-hover:opacity-100 transition-opacity rounded-t-xl`} style={{ height: `${Math.max(15, Math.round((point.value / maxTrend) * 100))}%` }}></div>
                             <span className="absolute top-[-26px] opacity-0 group-hover:opacity-100 transition-opacity text-xs font-black bg-slate-800 text-white px-2 py-1 rounded-md">₺{(point.value/1000).toFixed(0)}k</span>
                           </div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-[20px] shrink-0">{point.label}</div>
                         </div>
                       )
                    })
                  ) : (
                    <div className="w-full flex items-center justify-center text-sm font-medium text-slate-400 relative z-10 h-full">Tahakkuk verisi bekleniyor.</div>
                  )}
               </div>
            </div>
          </div>

          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><ReceiptText className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tüm İşlemler & Ekstreler</h2>
            </div>
            
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
               <FinanceChargesPanel charges={charges} showSummary={false} />
            </div>
          </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem] backdrop-blur-md">
                 <Zap className="w-5 h-5 text-amber-400" />
               </div>
               <h2 className="text-xl font-black tracking-tight">Hızlı İşlem Hattı</h2>
             </div>
             
             <p className="text-sm leading-relaxed text-slate-300 font-medium relative z-10 mb-8">
               Yeni ödemeleri tahsil et veya SMS/WP aracılığıyla geciken taksitleri velilere hatırlat.
             </p>

             <div className="relative z-10 w-full flex flex-col gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md [&_.rounded-md]:rounded-xl [&_.border-input]:border-slate-700/50 [&_.text-foreground]:text-slate-200">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Tahsilat Gir</h3>
                  <ManualPaymentForm charges={chargeOptions} />
                </div>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md [&_.rounded-md]:rounded-xl [&_.border-input]:border-slate-700/50 [&_.text-foreground]:text-slate-200 [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><MailWarning className="w-4 h-4 text-amber-400" /> Hatırlatma Gönder</h3>
                  <PaymentReminderPanel charges={chargeOptions} />
                </div>
             </div>
          </div>

          <div className="rounded-[3rem] bg-rose-50 border border-rose-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <ShieldAlert className="w-6 h-6 text-rose-600" />
               <h3 className="text-lg font-black text-rose-900">Öncelikli Riskler</h3>
             </div>
             
             <div className="space-y-3">
                {follow.length ? (
                  follow.slice(0, 4).map((charge, i) => (
                     <div key={i} className="bg-white border border-rose-50 rounded-[1.5rem] p-4 shadow-sm flex flex-col transition-transform hover:-translate-y-0.5">
                        <div className="font-bold text-[14px] text-slate-800">{charge.item}</div>
                        <div className="flex items-center justify-between mt-3">
                           <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Vade: {charge.dueDate}</div>
                           <div className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-rose-600 border border-rose-100">
                              {charge.amount}
                           </div>
                        </div>
                     </div>
                  ))
                ) : (
                  <div className="text-sm font-medium text-slate-500 py-4 text-center">Takipte kayıtlı risk yok.</div>
                )}
             </div>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
