import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { getManagerBillingDashboardData } from "@/lib/billing";
import {
  getManagerMetrics,
  getParentReportCards,
} from "@/lib/dashboard-data";
import {
  getAuditLogRows,
  getLeadSubmissionRows,
  getManagerStudentListRows,
  getSessionsData,
  getSupportThreadsData,
} from "@/lib/dashboard/manager-data";
import { cn } from "@/lib/utils";
import { LineChart, Users, FileText, Zap, ChevronRight } from "lucide-react";

export default async function ManagerReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ highlightLead?: string }>;
}) {
  await searchParams;
  const [metrics, students, sessions, billingDashboard, leadRows, reportCards, auditRows, supportThreads] = await Promise.all([
    getManagerMetrics(),
    getManagerStudentListRows(),
    getSessionsData(),
    getManagerBillingDashboardData(),
    getLeadSubmissionRows(),
    getParentReportCards(),
    getAuditLogRows({ limit: 24 }),
    getSupportThreadsData(),
  ]);
  const charges = billingDashboard.charges;
  const openAmount = charges
    .filter((charge) => charge.paymentStatus !== "completed")
    .reduce((sum, charge) => sum + (charge.remainingAmountValue ?? 0), 0);
  const attendanceValues = students
    .map((student) => Number(student.attendance.replace("%", "")))
    .filter((value) => !Number.isNaN(value));
  const averageAttendance = attendanceValues.length
    ? Math.round(attendanceValues.reduce((sum, value) => sum + value, 0) / attendanceValues.length)
    : 0;
  const completedCharges = charges.filter((charge) => charge.paymentStatus === "completed");
  const pendingCharges = charges.filter((charge) => charge.paymentStatus === "pending");
  const overdueCharges = charges.filter((charge) => charge.paymentStatus === "overdue");
  const totalCapacity = sessions.reduce((sum, session) => sum + Number(session.capacity ?? 0), 0);
  const filledSeats = sessions.reduce((sum, session) => sum + Number(session.studentCount ?? 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((filledSeats / totalCapacity) * 100) : 0;
  const lowLessonStudents = students.filter((student) => (student.remainingLessons ?? 0) <= 2).length;
  const coachLoad = Array.from(
    sessions.reduce((map, session) => {
      const key = session.coach || "Atanacak";
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([coach, count]) => ({ coach, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
  const leadSourceRows = Array.from(
    leadRows.reduce((map, lead) => {
      const key = lead.source ?? "Bilinmiyor";
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([source, count]) => ({ source, count }))
    .sort((left, right) => right.count - left.count);
  const processedLeadCount = leadRows.filter((lead) => lead.status !== "Yeni").length;
  const processedLeadRate = leadRows.length ? Math.round((processedLeadCount / leadRows.length) * 100) : 0;
  const collectionRate = charges.length
    ? Math.round((completedCharges.length / charges.length) * 100)
    : 0;
  const pendingAmountTotal = pendingCharges.reduce((sum, charge) => sum + charge.remainingAmountValue, 0);
  const overdueAmountTotal = overdueCharges.reduce((sum, charge) => sum + charge.remainingAmountValue, 0);
  const completedAmountTotal = completedCharges.reduce((sum, charge) => sum + charge.paidAmountValue, 0);
  const leadSourceQualityRows = leadSourceRows.map((item) => {
    const sourceLeads = leadRows.filter((lead) => lead.source === item.source);
    const processed = sourceLeads.filter((lead) => lead.status !== "Yeni").length;

    return {
      source: item.source,
      total: item.count,
      processed,
      processedRate: item.count ? Math.round((processed / item.count) * 100) : 0,
    };
  });
  const auditScopeRows = Array.from(
    auditRows.reduce((map, row) => {
      const scopeKey = row.scope || "Diger";
      const current = map.get(scopeKey) ?? { scope: scopeKey, count: 0, latest: row.createdAt };
      current.count += 1;
      map.set(scopeKey, current);
      return map;
    }, new Map<string, { scope: string; count: number; latest: string }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
  const supportOpenCount = supportThreads.filter((thread) => thread.statusKey === "open").length;
  const supportWaitingCount = supportThreads.filter((thread) => thread.statusKey === "waiting_parent").length;
  const supportResolvedCount = supportThreads.filter((thread) => thread.statusKey === "resolved").length;
  const resolvedSupportDurations = supportThreads
    .filter((thread) => thread.statusKey === "resolved" && thread.openedAtValue && thread.updatedAtValue)
    .map((thread) => {
      const openedAt = new Date(thread.openedAtValue ?? "").getTime();
      const updatedAt = new Date(thread.updatedAtValue ?? "").getTime();
      if (!Number.isFinite(openedAt) || !Number.isFinite(updatedAt) || updatedAt < openedAt) {
        return null;
      }
      return Math.max(1, Math.round((updatedAt - openedAt) / (1000 * 60 * 60 * 24)));
    })
    .filter((value): value is number => value !== null);
  const averageSupportResolutionDays = resolvedSupportDurations.length
    ? Math.round(resolvedSupportDurations.reduce((sum, value) => sum + value, 0) / resolvedSupportDurations.length)
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
                     signal: "Aktif ogrenci",
                     value: String(students.length),
                     meta: "Kayitli ogrenci havuzu",
                     status: "Aktif",
                   },
                   {
                     signal: "Planli seans",
                     value: String(sessions.length),
                     meta: "Takvimde gorunen acik seanslar",
                     status: "Aktif",
                   },
                   {
                     signal: "Tahsilat hunisi",
                     value: `%${billingDashboard.summary.collectionRate || collectionRate}`,
                     meta: `${completedCharges.length} kapanan · ${overdueCharges.length} gecikmis · ${billingDashboard.summary.openCount} acik`,
                     status: overdueCharges.length ? "Oncelikli takip" : "Dengeli",
                   },
                   {
                     signal: "Acik bakiye",
                     value: `₺${openAmount.toLocaleString("tr-TR")}`,
                     meta: "Tahsil bekleyen toplam hacim",
                     status: openAmount > 0 ? "Odeme Bekleniyor" : "Odeme Tamamlandi",
                   },
                   {
                     signal: "Lead kalitesi",
                     value: String(leadRows.length),
                     meta: `%${processedLeadRate} islenmis lead orani`,
                     status: leadRows.length ? "Takipte" : "Planlandi",
                   },
                   {
                     signal: "Seans doluluk",
                     value: `%${occupancyRate}`,
                     meta: `${filledSeats} / ${totalCapacity || 0} koltuk dolu`,
                     status: occupancyRate >= 70 ? "Guclu" : "Gelisim alani",
                   },
                   {
                     signal: "Hak tuketimi",
                     value: String(lowLessonStudents),
                     meta: "2 hak ve alti kalan ogrenci",
                     status: lowLessonStudents ? "Takip et" : "Dengeli",
                   },
                   {
                     signal: "Karne cikisi",
                     value: String(reportCards.length),
                     meta: "Detay verisi ile olusan karneler",
                     status: reportCards.length ? "Aktif" : "Planlandi",
                   },
                 ]}
               />
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><Users className="w-6 h-6 text-slate-500" /></div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tahsilat Hunisi</h2>
              </div>
              <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
                <DataTable
                  columns={[
                    { key: "step", label: "Adim" },
                    { key: "count", label: "Adet" },
                    { key: "meta", label: "Aciklama" },
                  ]}
                  rows={[
                    {
                      step: "Odeme bekleniyor",
                      count: String(pendingCharges.length),
                      meta: `Toplam ₺${pendingAmountTotal.toLocaleString("tr-TR")} · 7 gunluk pencere`,
                    },
                    {
                      step: "Odeme yapilmadi",
                      count: String(overdueCharges.length),
                      meta: `Toplam ₺${overdueAmountTotal.toLocaleString("tr-TR")} · gecikmis hacim`,
                    },
                    {
                      step: "Odeme tamamlandi",
                      count: String(completedCharges.length),
                      meta: `Toplam ₺${completedAmountTotal.toLocaleString("tr-TR")} · kapanan tahsilat`,
                    },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><Zap className="w-6 h-6 text-slate-500" /></div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Koc Yuk Dengesi</h2>
              </div>
              <div className="grid gap-3">
                {coachLoad.length ? (
                  coachLoad.map((item) => (
                    <div key={item.coach} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 px-4 py-4">
                      <div className="font-bold text-slate-800">{item.coach}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.count} aktif seans yukunde</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">Henüz koç yük verisi oluşmadı.</div>
                )}
              </div>
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
               <h3 className="text-lg font-black text-indigo-900">Lead Kaynak Kalitesi</h3>
             </div>
             
             <div className="space-y-3">
               {leadSourceQualityRows.length ? (
                 leadSourceQualityRows.slice(0, 5).map((item) => (
                   <div key={item.source} className="bg-white border border-indigo-50 rounded-[1.5rem] p-4 shadow-sm flex items-center justify-between gap-4">
                     <div>
                       <div className="font-bold text-[14px] text-slate-800">{item.source}</div>
                       <div className="text-xs text-slate-500 mt-1">
                         {item.processed} islenen lead · %{item.processedRate} ilerleme
                       </div>
                     </div>
                     <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100">
                       {item.total}
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-sm font-medium text-slate-500 py-4 text-center">Henüz lead kaydı yok.</div>
               )}
             </div>
          </div>

          <div className="rounded-[3rem] bg-white border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                 <Users className="w-6 h-6 text-slate-600" />
               </div>
               <h3 className="text-lg font-black text-slate-800">Destek Performansi</h3>
             </div>

             <div className="grid gap-3">
               <Link
                 href="/manager/communication?supportStatus=open"
                 className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 px-4 py-4 transition hover:border-rose-200 hover:bg-rose-50/70"
               >
                 <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Acil yanit</div>
                 <div className="mt-2 text-2xl font-black text-slate-900">{supportOpenCount}</div>
                 <div className="mt-1 text-sm text-slate-500">Ekip yaniti bekleyen aktif thread</div>
               </Link>
               <Link
                 href="/manager/communication?supportStatus=waiting_parent"
                 className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 px-4 py-4 transition hover:border-amber-200 hover:bg-amber-50/70"
               >
                 <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Veli donusu bekleniyor</div>
                 <div className="mt-2 text-2xl font-black text-slate-900">{supportWaitingCount}</div>
                 <div className="mt-1 text-sm text-slate-500">Son yanit ekipten cikmis thread sayisi</div>
               </Link>
               <Link
                 href="/manager/communication?supportStatus=resolved"
                 className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50/70"
               >
                 <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Cozum hizi</div>
                 <div className="mt-2 text-2xl font-black text-slate-900">{averageSupportResolutionDays} gun</div>
                 <div className="mt-1 text-sm text-slate-500">{supportResolvedCount} cozulmus thread uzerinden ortalama</div>
               </Link>
             </div>
          </div>

          <div className="rounded-[3rem] bg-white border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <FileText className="w-6 h-6 text-slate-600" />
               <h3 className="text-lg font-black text-slate-900">Kritik aksiyon izi</h3>
             </div>

             <div className="space-y-3">
               {auditRows.length ? (
                 auditRows.slice(0, 6).map((row) => (
                   <div key={`${row.event}-${row.createdAtValue}`} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/60 p-4">
                     <div className="font-bold text-[14px] text-slate-800">{row.event}</div>
                     <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{row.scope}</div>
                     <div className="mt-2 text-sm text-slate-500">{row.actor}</div>
                     <div className="mt-2 text-xs leading-5 text-slate-500">{row.detail ?? "Audit izi kaydedildi."}</div>
                     <div className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{row.createdAt}</div>
                   </div>
                 ))
               ) : (
                 <div className="text-sm font-medium text-slate-500 py-4 text-center">Henüz audit izi yok.</div>
               )}
             </div>
          </div>

          <div className="rounded-[3rem] bg-slate-900 border border-slate-800 p-8 text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-800/50 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
             
             <div className="flex items-center justify-between mb-6 relative z-10">
               <h3 className="text-lg font-black tracking-tight text-white">Scope dagilimi</h3>
               <ChevronRight className="w-5 h-5 text-slate-500" />
             </div>
             
             <div className="relative z-10 flex flex-col gap-3">
               {auditScopeRows.length ? (
                 auditScopeRows.map((row) => (
                   <div key={row.scope} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                     <div className="flex items-center justify-between gap-4">
                       <div className="font-bold text-white">{row.scope}</div>
                       <div className="text-sm font-black text-cyan-300">{row.count}</div>
                     </div>
                     <div className="mt-2 text-xs text-slate-300">Son iz: {row.latest}</div>
                   </div>
                 ))
               ) : (
                 <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                   Scope bazli hareket henuz olusmadi.
                 </div>
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
