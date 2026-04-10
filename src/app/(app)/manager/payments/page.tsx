import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FinanceChargesPanel } from "@/components/finance-charges-panel";
import { ManualPaymentForm } from "@/components/manual-payment-form";
import { getChargeData, getChargeOptions } from "@/lib/dashboard-data";
import { HandCoins, CreditCard, WalletCards, BriefcaseBusiness, ScanEye, BadgeCheck, CheckCircle2, TrendingUp, PiggyBank } from "lucide-react";

function parseTry(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export default async function ManagerPaymentsPage() {
  const [charges, chargeOptions] = await Promise.all([getChargeData(), getChargeOptions()]);
  const pendingCharges = charges.filter((charge) => !charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const paidCharges = charges.filter((charge) => charge.status.toLocaleLowerCase("tr-TR").includes("odendi"));
  const pendingAmount = pendingCharges.reduce((sum, charge) => sum + parseTry(charge.amount), 0);
  const paidAmount = paidCharges.reduce((sum, charge) => sum + parseTry(charge.amount), 0);
  const collectionRate = pendingAmount + paidAmount > 0 ? Math.round((paidAmount / (pendingAmount + paidAmount)) * 100) : 0;

  return (
    <AppShell
      role="manager"
      eyebrow="Operasyonel Finans"
      title="Borçlar & Tahsilat"
      primaryAction={{ href: "#", label: "Yeni Tahsilat Gir" }}
      contextCard={{
        eyebrow: "Tahsilat Performansı",
        title: `%${collectionRate} Kapanış Oranı`,
        badge: `${pendingCharges.length} Açık Kayıt Bekliyor`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><BadgeCheck className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">ÖDEME İŞLEMİ</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">{paidCharges.length}</div>
          <div className="text-sm font-medium text-emerald-600/70 mt-2">Başarılı İşlem Adedi</div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><WalletCards className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">BEKLEYEN</div>
          </div>
          <div className="text-4xl font-black text-amber-950">₺{(pendingAmount / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-amber-600/70 mt-2">Açık Bakiye Toplamı</div>
        </div>

        <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-sky-100 p-2.5 rounded-xl"><PiggyBank className="w-5 h-5 text-sky-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-sky-600">TAHSİLAT</div>
          </div>
          <div className="text-4xl font-black text-sky-950">₺{(paidAmount / 1000).toFixed(1)}k</div>
          <div className="text-sm font-medium text-sky-600/70 mt-2">Kapanan Hacim</div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100 p-2.5 rounded-xl"><TrendingUp className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">VERİM</div>
          </div>
          <div className="text-4xl font-black text-violet-950">% {collectionRate}</div>
          <div className="text-sm font-medium text-violet-600/70 mt-2">Tahsilat Oranı</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="flex items-center gap-3">
                 <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><BriefcaseBusiness className="w-6 h-6 text-slate-500" /></div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cari Hareketler</h2>
               </div>
            </div>
            
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
              <FinanceChargesPanel charges={charges} showSummary={false} />
            </div>
          </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* QUICK PAYMENT ACTION */}
          <div className="rounded-[3rem] bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-8 shadow-[0_20px_50px_-15px_rgba(99,102,241,0.1)] relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[40px] transition-transform duration-700 group-hover:scale-150"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="bg-indigo-500 p-2.5 rounded-[1.25rem] shadow-lg shadow-indigo-500/20">
                 <CreditCard className="w-5 h-5 text-white" />
               </div>
               <h2 className="text-xl font-black tracking-tight text-indigo-950">Tahsilat Gir</h2>
             </div>
             
             <p className="text-sm leading-relaxed text-indigo-900/70 font-medium relative z-10 mb-8">
               Bekleyen tahakkuk seç, nakit/kredi kartı işlemini gir, borç kaydını kapat.
             </p>

             <div className="relative z-10 p-6 bg-white rounded-[2rem] border border-indigo-50 shadow-sm [&_.rounded-md]:rounded-xl [&_.border-input]:border-slate-200">
               <ManualPaymentForm charges={chargeOptions} />
             </div>
          </div>

          {/* RECENT PAYMENTS */}
          <div className="rounded-[3rem] bg-emerald-50 border border-emerald-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <CheckCircle2 className="w-6 h-6 text-emerald-600" />
               <h3 className="text-lg font-black text-emerald-900">Son Tahsilatlar</h3>
             </div>
             
             <div className="space-y-3">
                {paidCharges.slice(0, 4).map((charge, i) => (
                   <div key={i} className="bg-white border border-emerald-50 rounded-[1.5rem] p-4 shadow-sm flex flex-col transition-transform hover:-translate-y-0.5">
                      <div className="font-bold text-[14px] text-slate-800">{charge.item}</div>
                      <div className="flex items-center justify-between mt-3">
                         <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Ödendi: {charge.dueDate}</div>
                         <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
                            {charge.amount}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
