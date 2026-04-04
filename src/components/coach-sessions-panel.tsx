"use client";

import { useMemo, useState } from "react";
import { Clock3, MapPin } from "lucide-react";

import { AttendanceForm } from "@/components/attendance-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CoachSessionBoard } from "@/lib/types";

type SessionFilter = "all" | "open" | "full";
type SessionSort = "slot-asc" | "title-asc" | "roster-desc";

function rosterStats(roster: string) {
  const match = roster.match(/(\d+)\s*\/\s*(\d+)/);

  if (!match) {
    return { current: 0, capacity: 0 };
  }

  return {
    current: Number(match[1]),
    capacity: Number(match[2]),
  };
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

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        const roster = rosterStats(session.roster);

        if (filter === "open") {
          return roster.capacity === 0 || roster.current < roster.capacity;
        }

        if (filter === "full") {
          return roster.capacity > 0 && roster.current >= roster.capacity;
        }

        return true;
      })
      .filter((session) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack =
          `${session.title} ${session.slot} ${session.location} ${session.roster}`.toLocaleLowerCase(
            "tr-TR",
          );
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "title-asc") {
          return left.title.localeCompare(right.title, "tr");
        }

        if (sort === "roster-desc") {
          return rosterStats(right.roster).current - rosterStats(left.roster).current;
        }

        return left.slot.localeCompare(right.slot, "tr");
      });
  }, [filter, normalizedSearch, sessions, sort]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "slot-asc";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Toplam seans</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Yer acik</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.open}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Dolu</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.full}</div>
        </div>
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
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as SessionSort)}
            aria-label="Koc seans siralama"
          >
            <option value="slot-asc">Saate gore</option>
            <option value="title-asc">Basliga gore A-Z</option>
            <option value="roster-desc">Doluluga gore yuksekten dusuge</option>
          </Select>
        </div>

        {hasCustomView ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter("all");
                setSearch("");
                setSort("slot-asc");
              }}
            >
              Filtreleri temizle
            </Button>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          {filteredSessions.length ? (
            filteredSessions.map((session) => {
              const roster = rosterStats(session.roster);
              const ratio = roster.capacity > 0 ? Math.round((roster.current / roster.capacity) * 100) : 100;
              const isFull = roster.capacity > 0 && roster.current >= roster.capacity;

              return (
                <article key={session.sessionId} className="surface-panel rounded-[1.7rem] border border-white/40 px-6 py-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-foreground">
                      <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                      {session.slot}
                    </div>
                    <div
                      className={
                        isFull
                          ? "rounded-full bg-[rgba(179,27,37,0.08)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-destructive"
                          : "rounded-full bg-[rgba(2,83,205,0.08)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary"
                      }
                    >
                      {isFull ? "Dolu" : "Acilabilir"}
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="font-display text-[1.7rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
                      {session.title}
                    </h3>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm leading-6 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {session.location}
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      <span>Doluluk</span>
                      <span>{session.roster}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#eef1f3]">
                      <div
                        className={isFull ? "h-2 rounded-full bg-destructive" : "h-2 rounded-full bg-[linear-gradient(135deg,#0253cd,#0048b5)]"}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <AttendanceForm sessionId={session.sessionId} students={session.students} />
                  </div>
                </article>
              );
            })
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
