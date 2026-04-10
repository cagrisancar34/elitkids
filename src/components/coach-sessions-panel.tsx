"use client";

import { useMemo, useState } from "react";
import { Clock3, MapPin } from "lucide-react";

import { AttendanceModal } from "@/components/attendance-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CoachSessionBoard } from "@/lib/types";

type SessionFilter = "all" | "open" | "full";
type SessionSort = "slot-asc" | "title-asc" | "roster-desc";

function rosterStats(roster: string) {
  const match = roster.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return { current: 0, capacity: 0 };
  return { current: Number(match[1]), capacity: Number(match[2]) };
}

export function CoachSessionsPanel({ sessions }: { sessions: CoachSessionBoard[] }) {
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SessionSort>("slot-asc");

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
        return left.slot.localeCompare(right.slot, "tr");
      });
  }, [filter, search, sessions, sort]);

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

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
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
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {filteredSessions.length ? (
            filteredSessions.map((session) => (
              <article key={session.sessionId} className="surface-panel rounded-[1.7rem] border border-white/40 px-6 py-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-foreground">
                    <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                    {session.slot}
                  </div>
                  <div className="rounded-full bg-[rgba(2,83,205,0.08)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    {session.roster}
                  </div>
                </div>
                <div className="mt-5">
                  <h3 className="font-display text-[1.7rem] font-semibold tracking-[-0.04em] text-foreground">{session.title}</h3>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {session.location}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <AttendanceModal sessionId={session.sessionId} sessionTitle={session.title} students={session.students} />
                  <Button type="button" variant="outline" size="sm">
                    Seans notlari
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="surface-muted rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
              Bu filtre ve arama sonucunda gosterilecek seans yok.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{value}</div>
    </div>
  );
}
