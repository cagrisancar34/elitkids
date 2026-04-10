"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  differenceInMinutes,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { SessionActions } from "@/components/session-actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Area, AttendanceStudent, CoachOption, ProgramOption, SessionRecord } from "@/lib/types";

type SessionView = "calendar" | "list";

const startHour = 9;
const endHour = 21;
const rowHeight = 92;

function toMinuteOffset(dateIso: string) {
  const date = parseISO(dateIso);
  return (date.getHours() - startHour) * 60 + date.getMinutes();
}

function getWeekRangeLabel(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  return `${format(weekStart, "d MMM", { locale: tr })} - ${format(weekEnd, "d MMM", { locale: tr })}`;
}

function getSessionTone(session: SessionRecord) {
  const value = `${session.sportsBranchName ?? ""} ${session.programTitle ?? session.title}`.toLocaleLowerCase("tr-TR");

  if (value.includes("elit") || value.includes("artistik")) {
    return "bg-[linear-gradient(180deg,rgba(197,156,255,0.38),rgba(157,112,242,0.26))] border-[rgba(180,129,255,0.45)]";
  }

  if (value.includes("yuzme")) {
    return "bg-[linear-gradient(180deg,rgba(173,247,196,0.55),rgba(132,226,165,0.32))] border-[rgba(88,190,122,0.45)]";
  }

  return "bg-[linear-gradient(180deg,rgba(222,237,255,0.82),rgba(202,225,255,0.55))] border-[rgba(131,180,248,0.5)]";
}

function buildAttendanceMap(attendanceBoards: Array<{ sessionId: string; students: AttendanceStudent[] }>) {
  return new Map(attendanceBoards.map((board) => [board.sessionId, board.students]));
}

export function SessionsPanel({
  sessions,
  programs,
  coaches,
  areas,
  attendanceBoards,
  showSummary = true,
}: {
  sessions: SessionRecord[];
  programs: ProgramOption[];
  coaches: CoachOption[];
  areas: Area[];
  attendanceBoards: Array<{ sessionId: string; students: AttendanceStudent[] }>;
  showSummary?: boolean;
}) {
  const [view, setView] = useState<SessionView>("calendar");
  const [search, setSearch] = useState("");
  const [sportsBranchFilter, setSportsBranchFilter] = useState("all");
  const [coachFilter, setCoachFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(sessions[0]?.startsAt ? parseISO(sessions[0].startsAt) : new Date(), { weekStartsOn: 1 }),
  );

  const attendanceMap = useMemo(() => buildAttendanceMap(attendanceBoards), [attendanceBoards]);

  const sportsBranchOptions = useMemo(
    () => ["all", ...Array.from(new Set(sessions.map((session) => session.sportsBranchName).filter(Boolean)))],
    [sessions],
  );

  const filteredSessions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

    return sessions.filter((session) => {
      if (sportsBranchFilter !== "all" && session.sportsBranchName !== sportsBranchFilter) {
        return false;
      }

      if (coachFilter !== "all" && session.coach !== coachFilter) {
        return false;
      }

      if (areaFilter !== "all" && (session.areaName ?? session.location) !== areaFilter) {
        return false;
      }

      if (normalizedSearch) {
        const haystack = `${session.title} ${session.programTitle ?? ""} ${session.coach} ${session.location}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      }

      return true;
    });
  }, [areaFilter, coachFilter, search, sessions, sportsBranchFilter]);

  const calendarSessions = useMemo(() => {
    const weekEnd = addDays(weekStart, 6);
    return filteredSessions.filter(
      (session) =>
        session.startsAt &&
        isWithinInterval(parseISO(session.startsAt), { start: weekStart, end: weekEnd }),
    );
  }, [filteredSessions, weekStart]);

  const dayColumns = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        return {
          key: format(date, "yyyy-MM-dd"),
          label: format(date, "EEE", { locale: tr }).toLocaleUpperCase("tr-TR"),
          dateLabel: format(date, "d MMM", { locale: tr }),
          date,
        };
      }),
    [weekStart],
  );

  const hourLabels = useMemo(() => Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index), []);

  return (
    <div className="grid gap-6">
      {showSummary ? (
        <section className="grid gap-4 md:grid-cols-4">
          <SummaryMetric label="Toplam seans" value={sessions.length} />
          <SummaryMetric label="Haftalik gorunen" value={calendarSessions.length} />
          <SummaryMetric label="Kullanilan alan" value={new Set(sessions.map((session) => session.areaName ?? session.location)).size} />
          <SummaryMetric label="Aktif egitmen" value={new Set(sessions.map((session) => session.coach)).size} />
        </section>
      ) : null}

      <section className="surface-panel grid gap-5 rounded-[1.8rem] border border-white/50 px-6 py-6">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Grup, program urunu veya egitmen ara..."
          />
          <Select value={sportsBranchFilter} onChange={(event) => setSportsBranchFilter(event.target.value)}>
            <option value="all">Tum branslar</option>
            {sportsBranchOptions.filter(Boolean).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={coachFilter} onChange={(event) => setCoachFilter(event.target.value)}>
            <option value="all">Tum egitmenler</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.name}>
                {coach.name}
              </option>
            ))}
          </Select>
          <Select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
            <option value="all">Tum alanlar</option>
            {areas.map((area) => (
              <option key={area.id} value={area.name}>
                {area.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="surface-muted inline-flex rounded-full p-2">
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={
                view === "calendar"
                  ? "rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-[0_12px_28px_rgba(15,33,66,0.12)]"
                  : "rounded-full px-6 py-3 text-sm font-semibold text-muted-foreground"
              }
              >
              Takvim
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={
                view === "list"
                  ? "rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-[0_12px_28px_rgba(15,33,66,0.12)]"
                  : "rounded-full px-6 py-3 text-sm font-semibold text-muted-foreground"
              }
              >
              Liste
            </button>
          </div>

          <div className="surface-muted inline-flex items-center gap-3 rounded-full px-4 py-3">
            <button
              type="button"
              onClick={() => setWeekStart((current) => subWeeks(current, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hafta</div>
              <div className="mt-1 text-xl font-semibold tracking-[-0.03em] text-foreground">{getWeekRangeLabel(weekStart)}</div>
            </div>
            <button
              type="button"
              onClick={() => setWeekStart((current) => addWeeks(current, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {view === "calendar" ? (
        <section className="surface-panel overflow-hidden rounded-[1.8rem] border border-white/50">
          <div className="grid grid-cols-[96px_repeat(7,minmax(0,1fr))] border-b border-[#dde5f0]">
            <div className="border-r border-[#dde5f0] px-4 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Saat
            </div>
            {dayColumns.map((day) => (
              <div key={day.key} className="border-r border-[#dde5f0] px-4 py-5 text-center last:border-r-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{day.label}</div>
                <div className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-foreground">{day.dateLabel}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[96px_repeat(7,minmax(0,1fr))]">
            <div className="border-r border-[#dde5f0]">
              {hourLabels.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-[#eef2f7] px-4 py-3 text-center text-sm font-semibold text-muted-foreground"
                  style={{ height: rowHeight }}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {dayColumns.map((day) => {
              const daySessions = calendarSessions.filter(
                (session) =>
                  session.startsAt && format(parseISO(session.startsAt), "yyyy-MM-dd") === day.key,
              );

              return (
                <div key={day.key} className="relative border-r border-[#dde5f0] last:border-r-0" style={{ height: rowHeight * hourLabels.length }}>
                  {hourLabels.map((hour) => (
                    <div
                      key={`${day.key}-${hour}`}
                      className="border-b border-[#eef2f7]"
                      style={{ height: rowHeight }}
                    />
                  ))}

                  {daySessions.map((session) => {
                    if (!session.startsAt || !session.endsAt) {
                      return null;
                    }

                    const top = (toMinuteOffset(session.startsAt) / 60) * rowHeight;
                    const duration = Math.max(
                      (differenceInMinutes(parseISO(session.endsAt), parseISO(session.startsAt)) / 60) * rowHeight,
                      92,
                    );
                    const students = attendanceMap.get(session.id) ?? [];

                    return (
                      <div
                        key={session.id}
                        className={`absolute left-3 right-3 overflow-hidden rounded-[1.4rem] border px-4 py-3 shadow-[0_18px_38px_rgba(22,38,65,0.14)] ${getSessionTone(session)}`}
                        style={{ top, height: duration }}
                      >
                        <div className="text-xl font-semibold tracking-[-0.04em] text-foreground">{session.title}</div>
                        {session.programTitle ? (
                          <div className="mt-1 text-sm text-slate-700">Program: {session.programTitle}</div>
                        ) : null}
                        <div className="mt-1 text-sm text-slate-700">
                          {format(parseISO(session.startsAt), "HH:mm")} - {format(parseISO(session.endsAt), "HH:mm")}
                        </div>
                        <div className="mt-1 text-sm text-slate-700">
                          {session.studentCount ?? 0} kayitli sporcu · {session.coach}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <SessionActions
                            session={session}
                            programs={programs}
                            coaches={coaches}
                            areas={areas}
                            students={students}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.length ? (
            filteredSessions.map((session) => (
              <article
                key={session.id}
                className="surface-panel rounded-[1.6rem] border border-white/50 px-6 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {session.sportsBranchName ?? "Seans"}
                    </div>
                    <h3 className="mt-2 font-display text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">
                      {session.title}
                    </h3>
                    {session.programTitle ? (
                      <p className="mt-2 text-sm font-medium text-foreground/80">Program urunu: {session.programTitle}</p>
                    ) : null}
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {session.startsAt
                        ? format(parseISO(session.startsAt), "d MMMM EEEE, HH:mm", { locale: tr })
                        : "Tarih bekleniyor"}{" "}
                      · {session.areaName ?? session.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                      {session.studentCount ?? 0} / {session.capacity ?? 0} kayitli sporcu
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SessionActions
                    session={session}
                    programs={programs}
                    coaches={coaches}
                    areas={areas}
                    students={attendanceMap.get(session.id) ?? []}
                  />
                </div>
              </article>
            ))
          ) : (
            <div className="surface-muted rounded-[1.25rem] p-5 text-sm leading-6 text-muted-foreground">
              Bu filtrelerle gosterilecek seans bulunmuyor.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{value}</div>
    </div>
  );
}
