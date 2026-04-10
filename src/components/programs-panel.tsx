"use client";

import { useMemo, useState } from "react";
import { CalendarDays, UsersRound } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { ProgramActions } from "@/components/program-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProgramFormOptions, ProgramRecord } from "@/lib/types";

type ProgramSort = "title-asc" | "capacity-desc" | "price-desc";
type ProgramView = "cards" | "table";

function parseCapacity(detail: string) {
  const match = detail.match(/Kontenjan\s+(\d+)/i);
  return Number(match?.[1] ?? 0);
}

function parsePrice(detail: string) {
  return Number(detail.replace(/[^\d]/g, "") || 0);
}

function getProgramCategory(title: string) {
  return title.split("/")[0]?.trim() || title;
}

function estimateOccupancy(title: string, capacity: number) {
  if (capacity <= 0) {
    return 0;
  }

  const value = title.toLocaleLowerCase("tr-TR");

  if (value.includes("power") || value.includes("hiz")) {
    return Math.min(capacity, Math.round(capacity * 0.96));
  }

  if (value.includes("mini")) {
    return Math.min(capacity, Math.round(capacity * 0.84));
  }

  if (value.includes("artistik")) {
    return Math.min(capacity, Math.round(capacity * 0.72));
  }

  return Math.min(capacity, Math.round(capacity * 0.68));
}

function getCategoryTone(category: string) {
  const value = category.toLocaleLowerCase("tr-TR");

  if (value.includes("power") || value.includes("hokey")) {
    return "bg-[rgba(179,27,37,0.08)] text-destructive";
  }

  if (value.includes("artistik")) {
    return "bg-[rgba(140,58,140,0.12)] text-[#6e2f6f]";
  }

  return "bg-secondary text-secondary-foreground";
}

export function ProgramsPanel({
  programs,
  formOptions,
  showSummary = true,
}: {
  programs: ProgramRecord[];
  formOptions: ProgramFormOptions;
  showSummary?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProgramSort>("title-asc");
  const [category, setCategory] = useState<string>("all");
  const [view, setView] = useState<ProgramView>("cards");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(programs.map((program) => getProgramCategory(program.title))))],
    [programs],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredPrograms = useMemo(() => {
    return programs
      .filter((program) => {
        if (category === "all") {
          return true;
        }

        return getProgramCategory(program.title) === category;
      })
      .filter((program) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${program.title} ${program.detail}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "capacity-desc") {
          return parseCapacity(right.detail) - parseCapacity(left.detail);
        }

        if (sort === "price-desc") {
          return parsePrice(right.detail) - parsePrice(left.detail);
        }

        return left.title.localeCompare(right.title, "tr");
      });
  }, [category, normalizedSearch, programs, sort]);

  const hasCustomView = search.length > 0 || sort !== "title-asc" || category !== "all";
  const highestCapacity = Math.max(0, ...programs.map((program) => parseCapacity(program.detail)));
  const highestPrice = Math.max(0, ...programs.map((program) => parsePrice(program.detail)));

  return (
    <div className="grid gap-6">
      {showSummary ? (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Toplam program</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{programs.length}</div>
          </div>
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">En yuksek kontenjan</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{highestCapacity}</div>
          </div>
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">En yuksek aylik</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
              ₺{highestPrice.toLocaleString("tr-TR")}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4">
        <div className="surface-muted flex flex-wrap items-center gap-2 rounded-full px-3 py-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={
                category === item
                  ? "rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-[0_10px_22px_rgba(44,47,49,0.08)]"
                  : "rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
              }
            >
              {item === "all" ? "Tumu" : item}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Program ara: ad, yas grubu veya fiyat"
            aria-label="Program ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as ProgramSort)}
            aria-label="Program siralama"
          >
            <option value="title-asc">Ada gore A-Z</option>
            <option value="capacity-desc">Kontenjana gore yuksekten dusuge</option>
            <option value="price-desc">Ucrete gore yuksekten dusuge</option>
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="surface-muted inline-flex rounded-full px-2 py-2">
            {[
              ["cards", "Kart gorunumu"],
              ["table", "Tablo gorunumu"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key as ProgramView)}
                className={
                  view === key
                    ? "rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-[0_10px_22px_rgba(44,47,49,0.08)]"
                    : "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
                }
              >
                {label}
              </button>
            ))}
          </div>

          {hasCustomView ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSort("title-asc");
                setCategory("all");
              }}
            >
              Filtreleri temizle
            </Button>
          ) : null}
        </div>

        {view === "table" ? (
          <DataTable
            columns={[
              { key: "title", label: "Program" },
              { key: "category", label: "Kategori" },
              { key: "capacity", label: "Kontenjan" },
              { key: "price", label: "Aylik" },
              { key: "status", label: "Durum" },
            ]}
            rows={filteredPrograms.map((program) => {
              const categoryLabel = getProgramCategory(program.title);
              const capacity = parseCapacity(program.detail);
              const filled = estimateOccupancy(program.title, capacity);
              const ratio = capacity > 0 ? Math.round((filled / capacity) * 100) : 0;

              return {
                title: program.title,
                category: categoryLabel,
                capacity: `${filled} / ${capacity || "--"}`,
                price: `₺${parsePrice(program.detail).toLocaleString("tr-TR")}`,
                status: ratio >= 95 ? "Kontenjan dolu" : "Program acik",
              };
            })}
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {filteredPrograms.length ? (
              filteredPrograms.map((program) => {
                const detailParts = program.detail.split("·").map((item) => item.trim()).filter(Boolean);
                const categoryLabel = getProgramCategory(program.title);
                const capacity = parseCapacity(program.detail);
                const price = parsePrice(program.detail);
                const filled = estimateOccupancy(program.title, capacity);
                const ratio = capacity > 0 ? Math.round((filled / capacity) * 100) : 0;

                return (
                  <article
                    key={program.id}
                    className="surface-panel flex flex-col rounded-[1.7rem] border border-white/40 px-6 py-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${getCategoryTone(categoryLabel)}`}>
                        {categoryLabel}
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef1f3] text-muted-foreground">
                        <UsersRound className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.04em] text-foreground">
                        {program.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {detailParts[0] ?? program.detail}
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="surface-muted rounded-[1.1rem] px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Kontenjan</div>
                        <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-foreground">
                          {filled} / {capacity || "--"}
                        </div>
                      </div>
                      <div className="surface-muted rounded-[1.1rem] px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Aylik</div>
                        <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-foreground">
                          ₺{price.toLocaleString("tr-TR")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        <span>Doluluk</span>
                        <span>%{ratio}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#eef1f3]">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(135deg,#0253cd,#0048b5)]"
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {detailParts[1] ?? "Planlama acik"}
                      </div>
                      <Button type="button" variant={ratio >= 95 ? "secondary" : "outline"} size="sm">
                        {ratio >= 95 ? "Kontenjan dolu" : "Program acik"}
                      </Button>
                    </div>

                    <ProgramActions program={program} options={formOptions} />
                  </article>
                );
              })
            ) : (
              <div className="surface-muted rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
                Bu arama sonucunda gosterilecek program yok.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
