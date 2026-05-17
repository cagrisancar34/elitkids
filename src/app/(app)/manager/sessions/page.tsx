import { CalendarDays, Goal } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { SessionCreateForm } from "@/components/session-create-form";
import { SessionsPanel } from "@/components/sessions-panel";
import {
  getManagerAttendanceBoards,
  getCoachOptions,
  getProgramFormOptions,
  getProgramOptions,
  getSessionsData,
} from "@/lib/dashboard-data";

export default async function ManagerSessionsPage() {
  const [sessions, programs, coaches, attendanceBoards, formOptions] = await Promise.all([
    getSessionsData(),
    getProgramOptions(),
    getCoachOptions(),
    getManagerAttendanceBoards(),
    getProgramFormOptions(),
  ]);

  return (
    <AppShell
      role="manager"
      eyebrow="Operasyon"
      title="Seanslar"
      description="Takvimi haftalik akista yonet, seans uzerinden hizli islem al ve yeni grup plani kur."
      hidePrimaryAction
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="min-w-0">
          <SessionsPanel
            sessions={sessions}
            programs={programs}
            coaches={coaches}
            areas={formOptions.areas}
            attendanceBoards={attendanceBoards}
            showSummary={false}
          />
        </div>

        <aside className="grid gap-6">
          <section className="rounded-[2rem] border border-indigo-100 bg-[linear-gradient(180deg,rgba(244,247,255,0.98),rgba(255,255,255,0.96))] p-6 shadow-[0_24px_48px_rgba(17,32,74,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,rgba(15,99,234,0.12),rgba(0,77,194,0.18))] text-primary">
                <Goal className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Yeni grup</div>
                <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-foreground">Seans serisi olustur</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Program urununu haftalik takvime indiren seans serisini burada planlayabilirsin.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-white/70 bg-white/88 p-5 shadow-[0_16px_36px_rgba(17,32,74,0.04)]">
              <SessionCreateForm programs={programs} coaches={coaches} areas={formOptions.areas} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/55 bg-white/86 p-6 shadow-[0_20px_40px_rgba(17,32,74,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-slate-100 text-slate-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Takvim notu</div>
                <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-foreground">Grup bazli gorunum</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Her kart belirli bir program urununun sahadaki grup uygulamasini gosterir. Kart uzerine geldiginizde detay,
                  duzenleme ve yoklama aksiyonlari acilir.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
