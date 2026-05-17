import type { Route } from "next";
import Link from "next/link";
import { BellRing, CalendarDays, CreditCard, LifeBuoy, Sparkles } from "lucide-react";

import { DashboardPage } from "@/components/dashboard-page";
import { Button } from "@/components/ui/button";
import { getParentDashboardSummary } from "@/lib/dashboard/parent-data";

export default async function ParentPage() {
  const summary = await getParentDashboardSummary();
  const {
    metrics,
    linkedStudentsLabel,
    linkedStudentsSummary,
    totalOutstandingValue,
    unreadNotifications,
    reportCardCount,
    upcomingSessions,
    actionItems,
    linkedStudentSummaries,
    financeCharges,
  } = summary;

  return (
    <DashboardPage
      role="parent"
      eyebrow="Veli"
      title="Aile Kontrol Merkezi"
      description="Takvim, finans ve destek akislari cocugunuzun gunluk ritmini tek ekranda toplar."
      primaryAction={{ href: "/parent/support", label: "Destek talebi" }}
      contextCard={{
        eyebrow: "Aile durumu",
        title: `${linkedStudentsSummary} · ${upcomingSessions.length} ders`,
        description: `${linkedStudentsLabel} · ₺${totalOutstandingValue.toLocaleString("tr-TR")} bakiye`,
        badge: `${reportCardCount} karne`,
      }}
    >
      <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-12">
        <div className="page-hero-shell md:col-span-8 rounded-[3rem] p-8 text-white md:p-10">
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <div className="page-hero-kicker">Aile ritmi</div>
              <div className="mt-5 inline-flex max-w-full items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/88 ring-1 ring-white/12">
                Bagli ogrenci: <span className="ml-2 truncate text-white">{linkedStudentsLabel}</span>
              </div>
              <div className="mt-8 flex flex-wrap items-end gap-5">
                <div className="font-display text-[5.2rem] font-semibold leading-[0.84] tracking-[-0.08em] text-white">
                  {metrics[0]?.value ?? upcomingSessions.length}
                </div>
                <div className="inline-flex items-center rounded-[1rem] bg-cyan-400/16 px-4 py-2 text-sm font-bold text-cyan-100 ring-1 ring-cyan-300/24">
                  {metrics[0]?.delta ?? "Yaklasan ders"}
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-white/74">{metrics[0]?.label ?? "Takvim odagi"}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="page-soft-stat rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-[1rem] bg-blue-500/18 p-3 text-blue-200">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">
                    Yaklasan ders
                  </div>
                </div>
                <div className="mt-5 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-white">
                  {upcomingSessions.length}
                </div>
              </div>
              <div className="page-soft-stat rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-[1rem] bg-amber-500/18 p-3 text-amber-200">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">
                    Acik bakiye
                  </div>
                </div>
                <div className="mt-5 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-white">
                  ₺{totalOutstandingValue.toLocaleString("tr-TR")}
                </div>
              </div>
              <div className="page-soft-stat rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-[1rem] bg-violet-500/18 p-3 text-violet-200">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">
                    Okunmamis
                  </div>
                </div>
                <div className="mt-5 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-white">
                  {unreadNotifications}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-utility-rail md:col-span-4 rounded-[3rem] p-8">
          <div className="pl-5">
            <h2 className="flex items-center gap-3 font-display text-[2rem] font-semibold tracking-[-0.05em] text-[#172133]">
              <span className="h-9 w-1.5 rounded-full bg-primary" />
              Yaklasan Dersler
            </h2>
            <div className="mt-7 grid gap-4">
              {upcomingSessions.length ? (
                upcomingSessions.map((session) => (
                  <div key={`${session.id ?? session.title}-${session.slot}`} className="page-surface rounded-[1.7rem] p-5">
                    <div className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                      {session.slot}
                    </div>
                    <div className="mt-4 text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-900">
                      {session.title}
                    </div>
                    <div className="mt-3 text-sm font-medium text-muted-foreground">
                      {session.location} · {session.coach}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      {session.studentNames?.length ? session.studentNames.join(", ") : linkedStudentsLabel}
                    </div>
                  </div>
                ))
              ) : (
                <div className="page-empty-state rounded-[1.8rem] p-6 text-sm leading-6 text-muted-foreground">
                  Yaklasan ders bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-surface md:col-span-8 rounded-[3rem] p-8 md:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Bugun ne onemli
              </div>
              <h2 className="mt-2 font-display text-[2.35rem] font-semibold tracking-[-0.05em] text-slate-900">
                Aile Aksiyon Listesi
              </h2>
            </div>
            <Button asChild className="h-11 rounded-full px-6">
              <Link href="/parent/schedule">Takvimi ac</Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {actionItems.length ? (
              actionItems.map((item) => (
                <div
                  key={`${item.title}-${item.subtitle}`}
                  className="grid gap-4 rounded-[1.9rem] border border-slate-100 px-5 py-5 md:grid-cols-[minmax(0,1fr)_160px_160px]"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">{item.subtitle}</div>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-slate-600">{item.state}</div>
                  <div className="flex items-center justify-start md:justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href={item.href as Route}>{item.actionLabel}</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="page-empty-state rounded-[1.9rem] p-6 text-sm leading-6 text-muted-foreground">
                Su an icin bekleyen aile aksiyonu bulunmuyor.
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 grid gap-6">
          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-[1rem] bg-cyan-500/12 p-3 text-cyan-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-900">
                Bagli Ogrenci
              </h3>
            </div>
            <div className="mt-5 grid gap-3">
              {linkedStudentSummaries.length ? (
                linkedStudentSummaries.slice(0, 2).map((student) => (
                  <div key={student.studentId} className="page-subsection rounded-[1.6rem] p-4">
                    <div className="font-semibold text-slate-900">{student.studentName}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{student.programName}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{student.sessionSeriesLabel}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{student.ageBand}</span>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{student.coachName}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="page-empty-state rounded-[1.6rem] p-5 text-sm leading-6 text-muted-foreground">
                  Bu veli hesabina bagli ogrenci bulunmuyor.
                </div>
              )}
            </div>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-[1rem] bg-rose-500/12 p-3 text-rose-700">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-900">
                Finans Durumu
              </h3>
            </div>
            <div className="mt-5 grid gap-3">
              {financeCharges.map((charge) => (
                <div key={`${charge.item}-${charge.dueDate}`} className="page-subsection rounded-[1.6rem] p-4">
                  <div className="font-semibold text-slate-900">{charge.item}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {charge.billingPeriodLabel ?? "Donem yok"} · Son odeme {charge.dueDate}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Odenen: {charge.paidAmount ?? "₺0"} · Kalan: {charge.remainingAmount ?? charge.amount}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600">{charge.status}</span>
                    <span className="font-display text-[1.5rem] font-semibold tracking-[-0.04em] text-slate-900">
                      {charge.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-[1rem] bg-amber-500/12 p-3 text-amber-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-900">
                Karne ve Notlar
              </h3>
            </div>
            <div className="mt-4 text-sm leading-6 text-muted-foreground">
              {reportCardCount
                ? `${reportCardCount} karne kaydi veli ekraninda gorunmeye hazir.`
                : "Yeni koc notu girdiginde karne ve gelisim ozeti burada gorunecek."}
            </div>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-[1rem] bg-blue-500/12 p-3 text-blue-700">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <h3 className="font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-900">
                Hizli Ulasim
              </h3>
            </div>
            <div className="mt-5 grid gap-3">
              <Button asChild className="h-11 rounded-full">
                <Link href="/parent/payments">Odemeleri gor</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full">
                <Link href="/parent/support">Destek merkezi</Link>
              </Button>
              {actionItems.length ? (
                <div className="page-subsection rounded-[1.4rem] p-4 text-sm leading-6 text-muted-foreground">
                  Siradaki aksiyon: <span className="font-semibold text-slate-800">{actionItems[0]?.title}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
