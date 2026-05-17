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
  const todayKey = format(new Date(), "yyyy-MM-dd");

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
  const activeTodayCount = useMemo(
    () => calendarSessions.filter((session) => session.startsAt && format(parseISO(session.startsAt), "yyyy-MM-dd") === todayKey).length,
    [calendarSessions, todayKey],
  );

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start">
        <div className="pt-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Haftalik plan</div>
          <h2 className="mt-3 font-display text-[clamp(2.9rem,5vw,4.35rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-foreground">
            Seans Takvimi
          </h2>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-7 text-muted-foreground">
            Yogunlugu gorun, cakismalari fark edin ve seans yonetimini tek akista yonetin.
            {showSummary ? " Takvim ve liste gorunumleri ayni filtrelerle birlikte calisir." : null}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <SummaryMetric label="Bu hafta" value={calendarSessions.length} helper="planli seans" />
          <SummaryMetric label="Bugun" value={activeTodayCount} helper="aktif takvim akisi" />
        </div>
      </section>

      <section className="surface-panel overflow-hidden rounded-[2rem] border border-white/55">
        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-end">
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <LabeledFilter label="Brans">
                <Select value={sportsBranchFilter} onChange={(event) => setSportsBranchFilter(event.target.value)}>
                  <option value="all">Tum branslar</option>
                  {sportsBranchOptions.filter(Boolean).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </LabeledFilter>
              <LabeledFilter label="Egitmen">
                <Select value={coachFilter} onChange={(event) => setCoachFilter(event.target.value)}>
                  <option value="all">Tum egitmenler</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.name}>
                      {coach.name}
                    </option>
                  ))}
                </Select>
              </LabeledFilter>
              <LabeledFilter label="Alan">
                <Select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
                  <option value="all">Tum alanlar</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.name}>
                      {area.name}
                    </option>
                  ))}
                </Select>
              </LabeledFilter>
            </div>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Grup, program, egitmen veya alan ara..."
            />
          </div>

          <div className="grid gap-4">
            <div className="surface-muted inline-flex rounded-full p-2">
              <button
                type="button"
                onClick={() => setView("calendar")}
                className={
                  view === "calendar"
                    ? "rounded-full bg-white px-7 py-3 text-base font-semibold text-primary shadow-[0_12px_28px_rgba(15,33,66,0.12)]"
                    : "rounded-full px-7 py-3 text-base font-semibold text-muted-foreground"
                }
              >
                Takvim Gorunumu
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={
                  view === "list"
                    ? "rounded-full bg-white px-7 py-3 text-base font-semibold text-primary shadow-[0_12px_28px_rgba(15,33,66,0.12)]"
                    : "rounded-full px-7 py-3 text-base font-semibold text-muted-foreground"
                }
              >
                Liste Gorunumu
              </button>
            </div>

            <div className="surface-muted inline-flex items-center justify-between gap-3 rounded-full px-4 py-3">
              <button
                type="button"
                onClick={() => setWeekStart((current) => subWeeks(current, 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-foreground shadow-[0_10px_20px_rgba(18,43,84,0.06)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hafta</div>
                <div className="mt-1 text-[1.8rem] font-semibold tracking-[-0.05em] text-foreground">{getWeekRangeLabel(weekStart)}</div>
              </div>
              <button
                type="button"
                onClick={() => setWeekStart((current) => addWeeks(current, 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-foreground shadow-[0_10px_20px_rgba(18,43,84,0.06)]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#dbe3ee]" />

      {view === "calendar" ? (
        <section className="px-6 py-7">
          <div className="overflow-hidden rounded-[2rem] border border-[#d9e2ee] bg-white">
            <div className="grid grid-cols-[96px_repeat(7,minmax(0,1fr))] border-b border-[#dde5f0]">
            <div className="border-r border-[#dde5f0] px-4 py-5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Saat
            </div>
            {dayColumns.map((day) => (
              <div key={day.key} className="border-r border-[#dde5f0] px-4 py-5 text-center last:border-r-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{day.label}</div>
                <div className="mt-2 text-[1.75rem] font-semibold tracking-[-0.05em] text-foreground">{day.dateLabel}</div>
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
                        90,
                      );
                      const students = attendanceMap.get(session.id) ?? [];

                      return (
                        <div
                          key={session.id}
                          className={`group/session absolute left-0.5 right-0.5 overflow-hidden rounded-[1.55rem] border px-4 py-3 text-center shadow-[0_18px_38px_rgba(22,38,65,0.14)] transition-transform duration-200 hover:z-10 hover:-translate-y-0.5 ${getSessionTone(session)}`}
                          style={{ top, height: duration }}
                        >
                          <div className="relative h-full">
                            <div className="pointer-events-none transition-opacity duration-200 group-hover/session:opacity-15">
                              <div className="text-[1.45rem] font-semibold tracking-[-0.05em] text-foreground">{session.title}</div>
                              <div className="mt-1.5 text-sm font-medium text-slate-800">
                                {format(parseISO(session.startsAt), "HH:mm")} - {format(parseISO(session.endsAt), "HH:mm")}
                              </div>
                              <div className="mt-1.5 text-sm leading-5 text-slate-700">
                                {session.studentCount ?? 0} ogrenci · {session.coach}
                              </div>
                            </div>

                            <div className="absolute inset-x-2 bottom-2 flex translate-y-2 justify-center opacity-0 transition-all duration-200 group-hover/session:translate-y-0 group-hover/session:opacity-100">
                              <div className="rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.44))] p-1.5 backdrop-blur">
                                <SessionActions
                                  session={session}
                                  programs={programs}
                                  coaches={coaches}
                                  areas={areas}
                                  students={students}
                                  layout="calendar-overlay"
                                  showCancel={false}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          {!calendarSessions.length ? (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#d7e0ec] bg-[#f8fbff] px-5 py-6 text-sm text-muted-foreground">
              Bu hafta secili filtrelerle eslesen bir seans bulunmuyor.
            </div>
          ) : null}
        </section>
      ) : (
        <div className="grid gap-4 px-6 py-7">
          {filteredSessions.length ? (
            filteredSessions.map((session) => (
              <article
                key={session.id}
                className="surface-panel rounded-[1.8rem] border border-white/50 px-6 py-5"
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
      </section>
    </div>
  );
}

function LabeledFilter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function SummaryMetric({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <div className="surface-panel rounded-[1.7rem] border border-white/40 px-6 py-5 text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-[3rem] font-semibold tracking-[-0.06em] text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{helper}</div>
    </div>
  );
}
