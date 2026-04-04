"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SupportThread } from "@/lib/types";

type ThreadFilter = "all" | "open" | "closed";
type ThreadSort = "latest" | "subject-asc";

function threadKey(status: string) {
  return status.toLocaleLowerCase("tr-TR").includes("cozuldu") ? "closed" : "open";
}

export function ParentSupportPanel({ threads }: { threads: SupportThread[] }) {
  const [filter, setFilter] = useState<ThreadFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ThreadSort>("latest");

  const counts = useMemo(
    () => ({
      all: threads.length,
      open: threads.filter((thread) => threadKey(thread.status) === "open").length,
      closed: threads.filter((thread) => threadKey(thread.status) === "closed").length,
    }),
    [threads],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredThreads = useMemo(() => {
    return threads
      .filter((thread) => (filter === "all" ? true : threadKey(thread.status) === filter))
      .filter((thread) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${thread.subject} ${thread.status} ${thread.updatedAt}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "subject-asc") {
          return left.subject.localeCompare(right.subject, "tr");
        }

        return right.updatedAt.localeCompare(left.updatedAt, "tr");
      });
  }, [filter, normalizedSearch, sort, threads]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "latest";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tum talepler</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Acik talepler</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.open}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cozulmus</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.closed}</div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="surface-muted flex flex-wrap gap-2 rounded-full px-3 py-2">
          {[
            ["all", "Tum talepler", counts.all],
            ["open", "Acik", counts.open],
            ["closed", "Cozuldu", counts.closed],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as ThreadFilter)}
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
            placeholder="Talep ara: konu veya durum"
            aria-label="Destek talebi ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as ThreadSort)}
            aria-label="Destek talebi siralama"
          >
            <option value="latest">Son guncellenene gore</option>
            <option value="subject-asc">Konuya gore A-Z</option>
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
                setSort("latest");
              }}
            >
              Filtreleri temizle
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3">
          {filteredThreads.length ? (
            filteredThreads.map((thread) => (
              <article key={`${thread.subject}-${thread.updatedAt}`} className="surface-panel rounded-[1.4rem] border border-white/40 px-5 py-5">
                <div className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">
                  {thread.subject}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {thread.status} · {thread.updatedAt}
                </div>
              </article>
            ))
          ) : (
            <div className="surface-muted rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
              Bu filtre ve arama sonucunda gosterilecek destek talebi yok.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
