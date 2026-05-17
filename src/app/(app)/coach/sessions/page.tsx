import { CoachSessionsPanel } from "@/components/coach-sessions-panel";
import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceContentLayout, WorkspaceHighlight, WorkspaceMainColumn, WorkspaceSideColumn } from "@/components/operations-workspace";
import { getCoachClosingNoteArchive, getCoachSessionSummaries } from "@/lib/dashboard/coach-data";

export default async function CoachSessionsPage() {
  const [sessions, closingArchive] = await Promise.all([getCoachSessionSummaries(), getCoachClosingNoteArchive()]);
  const noteQueue = sessions.reduce((sum, session) => sum + session.pendingNotesCount, 0);
  const closingNotes = sessions.filter((session) => Boolean(session.sessionClosingNote)).slice(0, 4);

  return (
    <DashboardPage
      role="coach"
      eyebrow="Koc / Planner"
      title="Seans Akisi"
      description="Yoklama, roster ve saha notlari ayni akista kalir."
      primaryAction={{ href: "/coach/sessions", label: "Seans akisini ac" }}
      contextCard={{
        eyebrow: "Bugunku ritim",
        title: `${sessions.length} seans karti hazir`,
        description: "Gorev sirasi, seans kartlari ve saha sinyalleri ayni ritimde tutulur.",
        badge: "Hizli islem",
      }}
    >
      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <CoachSessionsPanel sessions={sessions} />
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Saha odagi"
            title="Bugunun saha ritmi"
            description="Hangi seans once acilmali, hangi roster not bekliyor ve nerede alan yogunlugu var tek bakista okunur."
            badge="Canli akis"
          >
            <div className="grid gap-3">
              <div className="page-subsection rounded-[1.4rem] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Not kuyrugu
                </div>
                <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-900">
                  {noteQueue}
                </div>
              </div>
              <div className="page-subsection rounded-[1.4rem] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Gunluk kapanis notlari
                </div>
                <div className="mt-3 grid gap-3">
                  {closingNotes.length ? (
                    closingNotes.map((session) => (
                      <div key={session.sessionId} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                        <div className="text-sm font-semibold text-slate-900">{session.title}</div>
                        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {session.sessionClosingUpdatedAt ?? session.dateLabel}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-muted-foreground">{session.sessionClosingNote}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm leading-6 text-muted-foreground">
                      Henuz geri okunacak seans kapanis notu bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
              <div className="page-subsection rounded-[1.4rem] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Kapanis arsivi
                </div>
                <div className="mt-3 grid gap-3">
                  {closingArchive.length ? (
                    closingArchive.map((item) => (
                      <div key={`${item.sessionId}-${item.createdAtValue ?? item.createdAt}`} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-900">{item.sessionTitle}</div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {item.createdAt}
                          </div>
                        </div>
                        <div className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm leading-6 text-muted-foreground">
                      Arsivde geri okunacak kapanis notu bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </WorkspaceHighlight>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
