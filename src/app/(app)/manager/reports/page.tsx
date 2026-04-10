import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  getChargeData,
  getLeadSubmissionRows,
  getManagerMetrics,
  getManagerStudents,
  getParentReportCards,
  getSessionsData,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { LineChart, Users, CalendarCheck, Wallet, FileText, Zap, ChevronRight } from "lucide-react";

function parseTry(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export default async function ManagerReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ highlightLead?: string }>;
}) {
  const params = await searchParams;
  const [metrics, students, sessions, charges, leadRows, reportCards] = await Promise.all([
    getManagerMetrics(),
    getManagerStudents(),
    getSessionsData(),
    getChargeData(),
    getLeadSubmissionRows(),
    getParentReportCards(),
  ]);
  const openAmount = charges
    .filter((charge) => !charge.status.toLocaleLowerCase("tr-TR").includes("odendi"))
    .reduce((sum, charge) => sum + parseTry(charge.amount), 0);
  const attendanceValues = students
    .map((student) => Number(student.attendance.replace("%", "")))
    .filter((value) => !Number.isNaN(value));
  const averageAttendance = attendanceValues.length
    ? Math.round(attendanceValues.reduce((sum, value) => sum + value, 0) / attendanceValues.length)
    : 0;

  return (
    <AppShell
      role="manager"
      eyebrow="Operasyon Raporları"
      title="Rapor Merkezi"
      primaryAction={{ href: "/manager/reports", label: "Raporları Yenile" }}
      contextCard={{
        eyebrow: "Yönetim Özeti",
        title: `${students.length} Öğrenci · ${sessions.length} Seans`,
        badge: `${reportCards.length} Aktif Karne`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
        {metrics.map((metric, i) => (
           <div key={metric.label} className={cn("rounded-[2rem] p-6 shadow-sm border relative overflow-hidden group", 
                i === 0 ? "bg-sky-50 border-sky-100" : 
                i === 1 ? "bg-violet-50 border-violet-100" : 
                i === 2 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
              )}>
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-2.5 rounded-xl", 
                   i === 0 ? "bg-sky-100" : 
                   i === 1 ? "bg-violet-100" : 
                   i === 2 ? "bg-emerald-100" : "bg-amber-100"
                )}>
                   <LineChart className={cn("w-5 h-5", 
                      i === 0 ? "text-sky-600" : 
                      i === 1 ? "text-violet-600" : 
                      i === 2 ? "text-emerald-600" : "text-amber-600"
                   )} />
                </div>
                <div className={cn("text-[10px] uppercase tracking-widest font-bold", 
                   i === 0 ? "text-sky-600" : 
                   i === 1 ? "text-violet-600" : 
                   i === 2 ? "text-emerald-600" : "text-amber-600"
                )}>METRİK {i+1}</div>
              </div>
              <div className={cn("text-3xl font-black", 
                   i === 0 ? "text-sky-950" : 
                   i === 1 ? "text-violet-950" : 
                   i === 2 ? "text-emerald-950" : "text-amber-950"
              )}>{metric.value}</div>
              <div className={cn("text-xs font-medium mt-2", 
                   i === 0 ? "text-sky-600/70" : 
                   i === 1 ? "text-violet-600/70" : 
                   i === 2 ? "text-emerald-600/70" : "text-amber-600/70"
              )}>{metric.label} ({metric.delta})</div>
           </div>
        ))}
        
        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100 p-2.5 rounded-xl"><Users className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">DEVAM ORANI</div>
          </div>
          <div className="text-3xl font-black text-rose-950">% {averageAttendance}</div>
          <div className="text-xs font-medium text-rose-600/70 mt-2">Kayıtlı Öğrenci Ort. Devam</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><LineChart className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Operasyon Özeti</h2>
            </div>
            
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
               <DataTable
                 columns={[
                   { key: "signal", label: "Sinyal" },
                   { key: "value", label: "Değer" },
                   { key: "meta", label: "Açıklama" },
                   { key: "status", label: "Durum" },
                 ]}
                 rows={[
                   {
                     signal: "Aktif öğrenci",
                     value: String(students.length),
                     meta: "Kayıtlı öğrenci havuzu",
                     status: "Aktif",
                   },
                   {
                     signal: "Planlı seans",
                     value: String(sessions.length),
                     meta: "Takvimde görünen açık seanslar",
                     status: "Aktif",
                   },
                   {
                     signal: "Açık bakiye",
                     value: `₺${openAmount.toLocaleString("tr-TR")}`,
                     meta: "Tahsil bekleyen toplam hacim",
                     status: openAmount > 0 ? "Takip" : "Ödendi",
                   },
                   {
                     signal: "Lead havuzu",
                     value: String(leadRows.length),
                     meta: "Landing ve kayıt akışından gelen adaylar",
                     status: leadRows.length ? "Aktif" : "Planlandı",
                   },
                   {
                     signal: "Karne çıkışı",
                     value: String(reportCards.length),
                     meta: "Detay verisi ile oluşan karneler",
                     status: reportCards.length ? "Aktif" : "Planlandı",
                   },
                 ]}
               />
            </div>
          </div>

          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><FileText className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Son Karne Çıktıları</h2>
            </div>
            
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
              <DataTable
                 columns={[
                   { key: "student", label: "Öğrenci" },
                   { key: "summary", label: "Karne Özeti" },
                   { key: "generatedAt", label: "Tarih" },
                   { key: "status", label: "Durum" },
                 ]}
                 rows={reportCards.slice(0, 8).map((card) => ({
                   student: card.studentName,
                   summary: card.summary,
                   generatedAt: card.generatedAt,
                   status: "Aktif",
                 }))}
               />
            </div>
          </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <Zap className="w-6 h-6 text-indigo-600" />
               <h3 className="text-lg font-black text-indigo-900">Lead Akışı</h3>
             </div>
             
             <div className="space-y-3">
               {leadRows.length ? (
                 leadRows.slice(0, 4).map((lead) => (
                   <div
                     key={lead.id}
                     className={cn(
                       "bg-white border border-indigo-50 rounded-[1.5rem] p-4 shadow-sm flex flex-col transition-transform hover:-translate-y-0.5",
                       lead.id === params.highlightLead
                         ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50 shadow-md"
                         : "",
                     )}
                   >
                     <div className="font-bold text-[14px] text-slate-800">{lead.fullName}</div>
                     <div className="text-xs text-slate-500 mt-1">{lead.email}</div>
                     <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100">
                           {lead.status}
                        </div>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-sm font-medium text-slate-500 py-4 text-center">Henüz lead kaydı yok.</div>
               )}
             </div>
          </div>

          <div className="rounded-[3rem] bg-slate-900 border border-slate-800 p-8 text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-800/50 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
             
             <div className="flex items-center justify-between mb-6 relative z-10">
               <h3 className="text-lg font-black tracking-tight text-white">Hızlı Aksiyonlar</h3>
               <ChevronRight className="w-5 h-5 text-slate-500" />
             </div>
             
             <div className="relative z-10 flex flex-col gap-3">
                <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-2xl h-12">
                  <Link href="/manager/students">Öğrenci Listesine Git</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold rounded-2xl h-12">
                  <Link href="/manager/payments">Ödeme Merkezine Git</Link>
                </Button>
             </div>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
