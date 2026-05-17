import Link from "next/link";
import { CalendarDays, ClipboardCheck, FileText, UsersRound } from "lucide-react";

import { DashboardPage } from "@/components/dashboard-page";
import { Button } from "@/components/ui/button";
import { getCoachDashboardSummary } from "@/lib/dashboard/coach-data";

export default async function CoachPage() {
  const summary = await getCoachDashboardSummary();
  const {
    metrics,
    focusSessions,
    pendingAttendance,
    noteQueue,
    firstTimers,
    postSessionClosures,
    firstTimerStudents,
    exceptionStudents,
  } = summary;

  return (
    <DashboardPage
      role="coach"
      eyebrow="Koc"
      title="Saha Operasyonu"
      description="Bugunku seanslar, roster akislari ve not girisi tek bakista okunur."
      primaryAction={{ href: "/coach/sessions", label: "Yoklamayi ac" }}
      contextCard={{
        eyebrow: "Bugun",
        title: `${focusSessions.length} seans odagi`,
        description: "Gunun takvimi, yoklama sinyali ve saha notlari ayni ritimde tutulur.",
        badge: "Saha modu",
      }}
    >
      <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-12">
        <div className="page-hero-shell md:col-span-8 rounded-[3rem] p-8 text-white md:p-10">
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <div className="page-hero-kicker">Gunluk saha ritmi</div>
              <div className="mt-8 flex flex-wrap items-end gap-5">
                <div className="font-display text-[5.4rem] font-semibold leading-[0.84] tracking-[-0.08em] text-white">
                  {metrics[0]?.value ?? "0"}
                </div>
                <div className="inline-flex items-center rounded-[1rem] bg-emerald-500/18 px-4 py-2 text-sm font-bold text-emerald-200 ring-1 ring-emerald-400/28">
                  {metrics[0]?.delta ?? "Canli akış"}
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-white/74">{metrics[0]?.label ?? "Toplam seans"}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="page-soft-stat rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-[1rem] bg-blue-500/18 p-3 text-blue-200">
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">
                    {metrics[1]?.label ?? "Bagli roster"}
                  </div>
                </div>
                <div className="mt-5 font-display text-[2.25rem] font-semibold tracking-[-0.05em] text-white">
                  {metrics[1]?.value ?? "0"}
                </div>
              </div>
              <div className="page-soft-stat rounded-[1.8rem] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-[1rem] bg-amber-500/18 p-3 text-amber-200">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">
                    {metrics[2]?.label ?? "Aksiyon sinyali"}
                  </div>
                </div>
                <div className="mt-5 font-display text-[2.25rem] font-semibold tracking-[-0.05em] text-white">
                  {metrics[2]?.value ?? "0"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-utility-rail md:col-span-4 rounded-[3rem] p-8">
          <div className="pl-5">
            <h2 className="flex items-center gap-3 font-display text-[2rem] font-semibold tracking-[-0.05em] text-[#172133]">
              <span className="h-9 w-1.5 rounded-full bg-primary" />
              Bugunun Seanslari
            </h2>
            <div className="mt-7 grid gap-4">
              {focusSessions.length ? (
                focusSessions.map((session) => (
                  <div key={session.sessionId} className="page-surface rounded-[1.7rem] p-5">
                    <div className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                      {session.dateLabel} / {session.startTime}
                    </div>
                    <div className="mt-4 text-[1.45rem] font-semibold tracking-[-0.04em] text-slate-900">
                      {session.title}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm font-medium text-muted-foreground">
                      <span>{session.location}</span>
                      <span>{session.studentCount} sporcu</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        {session.pendingAttendanceCount} eksik yoklama
                      </span>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
                        {session.firstSessionCount} ilk ders
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="page-empty-state rounded-[1.8rem] p-6 text-sm leading-6 text-muted-foreground">
                  Koca bagli bugunluk seans bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-surface md:col-span-8 rounded-[3rem] p-8 md:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Bugun ve yakinda
              </div>
              <h2 className="mt-2 font-display text-[2.35rem] font-semibold tracking-[-0.05em] text-slate-900">
                Kritik Seans Listesi
              </h2>
            </div>
            <Button asChild className="h-11 rounded-full px-6">
              <Link href="/coach/sessions">Tum seanslari ac</Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {focusSessions.length ? (
              focusSessions.map((session) => {
                const alerts = session.pendingAttendanceCount;
                return (
                  <div
                    key={session.sessionId}
                    className="grid gap-4 rounded-[1.9rem] border border-slate-100 px-5 py-5 md:grid-cols-[minmax(0,1fr)_220px_180px]"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{session.title}</div>
                      <div className="mt-2 text-sm leading-6 text-muted-foreground">
                        {session.dayShort} · {session.dateLabel} · {session.startTime} - {session.endTime} · {session.location}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      <div>{session.studentCount} kisilik roster</div>
                      <div className="mt-2">{alerts} eksik yoklama</div>
                      <div className="mt-2">
                        {session.firstSessionCount} ilk kez gelen ogrenci
                      </div>
                    </div>
                    <div className="flex items-center justify-start gap-2 md:justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/coach/students">
                          <FileText className="h-4 w-4" />
                          Notlar
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href="/coach/sessions">Yoklama</Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="page-empty-state rounded-[1.9rem] p-6 text-sm leading-6 text-muted-foreground">
                Gosterilecek operasyon listesi bulunmuyor.
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 grid gap-6">
          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Eksik yoklama
            </div>
            <div className="mt-3 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-slate-900">
              {pendingAttendance}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Yoklama kaydi henuz acilmamis roster satirlari bugun kapanis bekliyor.
            </p>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Not kuyrugu
            </div>
            <div className="mt-3 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-slate-900">
              {noteQueue}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Henuz not girilmemis ogrenciler bir sonraki seans oncesi tamamlanabilir.
            </p>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Seans sonrasi kapanis
            </div>
            <div className="mt-3 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-slate-900">
              {postSessionClosures}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Eksik yoklama ve not satirlari gun sonunda tamamlanacak is yukunu gosterir.
            </p>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Ilk ders sinyali
            </div>
            <div className="mt-3 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-slate-900">
              {firstTimers}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Koctan daha yakin takip isteyen ilk seans ogrencileri burada toplanir.
            </p>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Bugun yakin takip
            </div>
            <div className="mt-4 grid gap-3">
              {firstTimerStudents.length ? (
                firstTimerStudents.slice(0, 4).map((item) => (
                  <div key={`first-${item.sessionId}-${item.studentName}`} className="rounded-[1rem] border border-cyan-200 bg-cyan-50 px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">{item.studentName}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      Ilk kez geliyor · {item.sessionTitle} · {item.dateLabel}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline" className="h-8 rounded-full border-cyan-200 bg-white/90 text-cyan-700">
                        <Link href="/coach/students">Ogrenci notlarini ac</Link>
                      </Button>
                      <Button asChild size="sm" className="h-8 rounded-full bg-cyan-600 text-white hover:bg-cyan-700">
                        <Link href="/coach/sessions">Yoklamaya git</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm leading-6 text-muted-foreground">Bugun ilk kez gelen ogrenci sinyali yok.</div>
              )}
            </div>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Istisna nedenleri
            </div>
            <div className="mt-4 grid gap-3">
              {exceptionStudents.length ? (
                exceptionStudents.slice(0, 4).map((item) => (
                  <div key={`exception-${item.sessionId}-${item.studentName}`} className="rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">{item.studentName}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                      {item.sessionTitle} · {item.dateLabel}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline" className="h-8 rounded-full border-amber-200 bg-white/90 text-amber-700">
                        <Link href="/coach/students">Koc notunu ac</Link>
                      </Button>
                      <Button asChild size="sm" className="h-8 rounded-full bg-amber-600 text-white hover:bg-amber-700">
                        <Link href="/coach/sessions">Seansa don</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm leading-6 text-muted-foreground">Bugun kaydedilmis istisna nedeni bulunmuyor.</div>
              )}
            </div>
          </div>

          <div className="page-surface rounded-[2.5rem] p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-[1rem] bg-amber-500/12 p-3 text-amber-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h3 className="font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-900">
                Hizli Aksiyon
              </h3>
            </div>
            <div className="mt-5 grid gap-3">
              <Button asChild className="h-11 rounded-full">
                <Link href="/coach/sessions">Yoklamayi ac</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full">
                <Link href="/coach/students">Rosteri ac</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
