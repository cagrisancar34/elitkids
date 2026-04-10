"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock3, FileText, MapPin } from "lucide-react";

import { AttendanceModal } from "@/components/attendance-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CoachSessionBoard } from "@/lib/types";

type SessionFilter = "all" | "open" | "full";
type SessionSort = "slot-asc" | "title-asc" | "roster-desc";
type ViewMode = "day" | "week";

function rosterStats(roster: string) {
  const match = roster.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return { current: 0, capacity: 0 };
  return { current: Number(match[1]), capacity: Number(match[2]) };
}

export function CoachSessionsPanel({ sessions }: { sessions: CoachSessionBoard[] }) {
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SessionSort>("slot-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const counts = useMemo(
    () => ({
      all: sessions.length,
      open: sessions.filter((session) => {
        const roster = rosterStats(session.roster);
        return roster.capacity === 0 || roster.current < roster.capacity;
      }).length,
      full: sessions.filter((session) => {
        const roster = rosterStats(session.roster);
        return roster.capacity > 0 && roster.current >= roster.capacity;
      }).length,
    }),
    [sessions],
  );

  const dayBuckets = useMemo(() => {
    const grouped = new Map<
      string,
      { dayKey: string; dayShort: string; dateLabel: string; sessions: CoachSessionBoard[] }
    >();

    sessions.forEach((session) => {
      const dayKey = session.dayKey ?? session.slot;
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, {
          dayKey,
          dayShort: session.dayShort ?? "Gun",
          dateLabel: session.dateLabel ?? session.slot,
          sessions: [],
        });
      }

      grouped.get(dayKey)?.sessions.push(session);
    });

    return Array.from(grouped.values()).sort((left, right) => left.dayKey.localeCompare(right.dayKey, "tr"));
  }, [sessions]);

  const [selectedDayKey, setSelectedDayKey] = useState(dayBuckets[0]?.dayKey ?? "");

  const filteredSessions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

    return sessions
      .filter((session) => {
        const roster = rosterStats(session.roster);
        if (filter === "open") return roster.capacity === 0 || roster.current < roster.capacity;
        if (filter === "full") return roster.capacity > 0 && roster.current >= roster.capacity;
        return true;
      })
      .filter((session) => {
        if (!normalizedSearch) return true;
        const haystack = `${session.title} ${session.slot} ${session.location}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "title-asc") return left.title.localeCompare(right.title, "tr");
        if (sort === "roster-desc") return rosterStats(right.roster).current - rosterStats(left.roster).current;
        return `${left.dayKey ?? ""}${left.startTime ?? left.slot}`.localeCompare(
          `${right.dayKey ?? ""}${right.startTime ?? right.slot}`,
          "tr",
        );
      });
  }, [filter, search, sessions, sort]);

  const visibleDayBuckets = useMemo(
    () =>
      dayBuckets
        .map((bucket) => ({
          ...bucket,
          sessions: filteredSessions.filter((session) => session.dayKey === bucket.dayKey),
        }))
        .filter((bucket) => bucket.sessions.length),
    [dayBuckets, filteredSessions],
  );

  const activeDay =
    visibleDayBuckets.find((bucket) => bucket.dayKey === selectedDayKey) ?? visibleDayBuckets[0] ?? null;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Toplam seans" value={counts.all} />
        <Metric label="Yer acik" value={counts.open} />
        <Metric label="Dolu" value={counts.full} />
      </section>

      <section className="grid gap-4">
        <div className="surface-muted flex flex-wrap gap-2 rounded-full px-3 py-2">
          {[
            ["all", "Tum seanslar", counts.all],
            ["open", "Yer acik", counts.open],
            ["full", "Dolu", counts.full],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as SessionFilter)}
              className={
                filter === key
                  ? "rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-[0_10px_22px_rgba(44,47,49,0.08)]"
                  : "rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
              }
            >
              {label} · {count}
            </button>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_260px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Seans ara: baslik, alan veya saat"
            aria-label="Koc seans ara"
          />
          <Select value={sort} onChange={(event) => setSort(event.target.value as SessionSort)}>
            <option value="slot-asc">Saate gore</option>
            <option value="title-asc">Basliga gore A-Z</option>
            <option value="roster-desc">Doluluga gore</option>
          </Select>
          <div className="surface-muted flex rounded-full p-1">
            {[
              ["day", "Gun gorunumu"],
              ["week", "Hafta gorunumu"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setViewMode(value as ViewMode)}
                className={
                  viewMode === value
                    ? "flex-1 rounded-full bg-white px-4 py-3 text-sm font-semibold text-primary shadow-[0_10px_22px_rgba(44,47,49,0.08)]"
                    : "flex-1 rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "day" ? (
          <div className="grid gap-4">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {visibleDayBuckets.map((bucket) => (
                <button
                  key={bucket.dayKey}
                  type="button"
                  onClick={() => setSelectedDayKey(bucket.dayKey)}
                  className={
                    activeDay?.dayKey === bucket.dayKey
                      ? "workspace-panel min-w-[140px] rounded-[1.5rem] px-4 py-4 text-left"
                      : "min-w-[140px] rounded-[1.5rem] border border-white/55 bg-white/55 px-4 py-4 text-left backdrop-blur-md"
                  }
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{bucket.dayShort}</div>
                  <div className="mt-2 font-display text-[1.35rem] font-semibold tracking-[-0.04em] text-foreground">{bucket.dateLabel}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{bucket.sessions.length} seans</div>
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {activeDay ? (
                activeDay.sessions.map((session) => (
                  <SessionCard key={session.sessionId} session={session} />
                ))
              ) : (
                <div className="surface-muted rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
                  Bu filtre ve arama sonucunda gosterilecek seans yok.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {visibleDayBuckets.length ? (
              visibleDayBuckets.map((bucket) => (
                <section key={bucket.dayKey} className="workspace-panel rounded-[1.8rem] p-4">
                  <div className="mb-4 flex items-end justify-between gap-3 border-b border-slate-200/70 pb-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{bucket.dayShort}</div>
                      <div className="mt-2 font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-foreground">
                        {bucket.dateLabel}
                      </div>
                    </div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                      {bucket.sessions.length} seans
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {bucket.sessions.map((session) => (
                      <SessionCard key={session.sessionId} session={session} compact />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="surface-muted rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
                Bu filtre ve arama sonucunda gosterilecek seans yok.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="workspace-panel rounded-[1.5rem] px-5 py-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{value}</div>
    </div>
  );
}

function SessionCard({ session, compact = false }: { session: CoachSessionBoard; compact?: boolean }) {
  return (
    <article className="workspace-panel rounded-[1.7rem] p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-foreground">
          <Clock3 className="mr-1.5 h-3.5 w-3.5" />
          {session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : session.slot}
        </div>
        <div className="rounded-full bg-[rgba(2,83,205,0.08)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
          {session.roster}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground md:text-[1.7rem]">
          {session.title}
        </h3>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {session.location}
        </span>
        {session.dateLabel ? (
          <span className="rounded-full bg-slate-950/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {session.dayShort} · {session.dateLabel}
          </span>
        ) : null}
      </div>
      {!compact ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {session.students.slice(0, 3).map((student) => (
            <div key={student.studentId} className="rounded-[1.15rem] bg-slate-50/90 p-3">
              <div className="truncate text-sm font-semibold text-foreground">{student.name}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{student.status === "present" ? "Geldi" : student.status === "excused" ? "Izinli" : "Gelmedi"}</div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <AttendanceModal sessionId={session.sessionId} sessionTitle={session.title} students={session.students} />
        <Button asChild type="button" variant="outline" size="sm">
          <Link href="/coach/students">
            <FileText className="h-4 w-4" />
            Gelisim notu
          </Link>
        </Button>
      </div>
    </article>
  );
}
