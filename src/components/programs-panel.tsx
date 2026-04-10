"use client";

import { useMemo, useState } from "react";
import { CalendarDays, UsersRound } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { ProgramActions } from "@/components/program-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProgramFormOptions, ProgramRecord } from "@/lib/types";

type ProgramSort = "title-asc" | "students-desc" | "groups-desc" | "price-desc";
type ProgramView = "cards" | "table";

function getProgramCategory(title: string) {
  return title.split("/")[0]?.trim() || title;
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
        if (sort === "students-desc") {
          return (right.enrolledCount ?? 0) - (left.enrolledCount ?? 0);
        }

        if (sort === "groups-desc") {
          return (right.sessionSeriesCount ?? 0) - (left.sessionSeriesCount ?? 0);
        }

        if (sort === "price-desc") {
          return right.monthlyPrice - left.monthlyPrice;
        }

        return left.title.localeCompare(right.title, "tr");
      });
  }, [category, normalizedSearch, programs, sort]);

  const hasCustomView = search.length > 0 || sort !== "title-asc" || category !== "all";
  const totalGroups = programs.reduce((sum, program) => sum + (program.sessionSeriesCount ?? 0), 0);
  const totalStudents = programs.reduce((sum, program) => sum + (program.enrolledCount ?? 0), 0);
  const highestPrice = Math.max(0, ...programs.map((program) => program.monthlyPrice));

  return (
    <div className="grid gap-6">
      {showSummary ? (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Toplam program urunu</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{programs.length}</div>
          </div>
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Toplam grup serisi</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{totalGroups}</div>
          </div>
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Kayitli sporcu / en yuksek aylik</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
              {totalStudents} / ₺{highestPrice.toLocaleString("tr-TR")}
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
            placeholder="Program urunu ara: ad, yas grubu veya alan"
            aria-label="Program ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as ProgramSort)}
            aria-label="Program siralama"
          >
            <option value="title-asc">Ada gore A-Z</option>
            <option value="students-desc">Kayitli sporcuya gore yuksekten dusuge</option>
            <option value="groups-desc">Grup sayisina gore yuksekten dusuge</option>
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
              { key: "title", label: "Program urunu" },
              { key: "category", label: "Kategori" },
              { key: "groups", label: "Grup" },
              { key: "students", label: "Kayitli" },
              { key: "price", label: "Aylik" },
              { key: "status", label: "Durum" },
            ]}
            rows={filteredPrograms.map((program) => {
              const categoryLabel = getProgramCategory(program.title);
              const groups = program.sessionSeriesCount ?? 0;
              const students = program.enrolledCount ?? 0;
              const hasCapacity = program.capacity > 0;
              const hasOpenSlots = !hasCapacity || students < program.capacity;

              return {
                title: program.title,
                category: categoryLabel,
                groups: String(groups),
                students: `${students}${hasCapacity ? ` / ${program.capacity}` : ""}`,
                price: `₺${program.monthlyPrice.toLocaleString("tr-TR")}`,
                status: hasOpenSlots ? "Kayit acik" : "Kontenjan kapandi",
              };
            })}
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {filteredPrograms.length ? (
              filteredPrograms.map((program) => {
                const detailParts = program.detail.split("·").map((item) => item.trim()).filter(Boolean);
                const categoryLabel = getProgramCategory(program.title);
                const students = program.enrolledCount ?? 0;
                const groups = program.sessionSeriesCount ?? 0;
                const capacity = program.capacity;
                const hasCapacity = capacity > 0;
                const fillRatio = hasCapacity ? Math.round((students / capacity) * 100) : 0;
                const hasOpenSlots = !hasCapacity || students < capacity;

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
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Kayitli / kontenjan</div>
                        <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-foreground">
                          {students} / {capacity || "--"}
                        </div>
                      </div>
                      <div className="surface-muted rounded-[1.1rem] px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Grup / aylik</div>
                        <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-foreground">
                          {groups} / ₺{program.monthlyPrice.toLocaleString("tr-TR")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        <span>Kayit dolulugu</span>
                        <span>{hasCapacity ? `%${fillRatio}` : "Esnek"}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#eef1f3]">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(135deg,#0253cd,#0048b5)]"
                          style={{ width: `${Math.min(fillRatio, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {groups ? `${groups} aktif grup serisi` : detailParts[1] ?? "Grup olusturulmadi"}
                      </div>
                      <Button type="button" variant={hasOpenSlots ? "outline" : "secondary"} size="sm">
                        {hasOpenSlots ? "Kayit acik" : "Kontenjan kapandi"}
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
