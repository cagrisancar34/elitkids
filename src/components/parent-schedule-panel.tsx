"use client";

import { useMemo, useState } from "react";
import { Clock3, MapPin, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SessionRecord } from "@/lib/types";

type ScheduleSort = "slot-asc" | "title-asc" | "coach-asc";

export function ParentSchedulePanel({ sessions }: { sessions: SessionRecord[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ScheduleSort>("slot-asc");

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack =
          `${session.title} ${session.slot} ${session.location} ${session.coach}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "title-asc") {
          return left.title.localeCompare(right.title, "tr");
        }

        if (sort === "coach-asc") {
          return left.coach.localeCompare(right.coach, "tr");
        }

        return left.slot.localeCompare(right.slot, "tr");
      });
  }, [normalizedSearch, sessions, sort]);

  const hasCustomView = search.length > 0 || sort !== "slot-asc";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Toplam ders</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{sessions.length}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ilk gorunen</div>
          <div className="mt-4 text-lg font-semibold text-foreground">{sessions[0]?.title ?? "-"}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Aktif sonuc</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{filteredSessions.length}</div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ders ara: baslik, yer veya koc"
            aria-label="Ders ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as ScheduleSort)}
            aria-label="Ders siralama"
          >
            <option value="slot-asc">Saate gore</option>
            <option value="title-asc">Basliga gore A-Z</option>
            <option value="coach-asc">Koca gore A-Z</option>
          </Select>
        </div>

        {hasCustomView ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
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
            filteredSessions.map((session) => (
              <article key={`${session.title}-${session.slot}`} className="surface-panel rounded-[1.65rem] border border-white/40 px-6 py-6">
                <div className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-foreground">
                  <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                  {session.slot}
                </div>
                <h3 className="mt-5 font-display text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
                  {session.title}
                </h3>
                <div className="mt-5 grid gap-3 text-sm leading-6 text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {session.location}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    {session.coach}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="surface-muted rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
              Bu arama sonucunda gosterilecek ders yok.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
