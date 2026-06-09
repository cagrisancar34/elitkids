"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { ProgramCard } from "@/components/ProgramCard";
import { getRegionLabel, type Program, type ProgramStatus, type Region } from "@/lib/content";

const statusOptions: { label: string; value: ProgramStatus | "all" }[] = [
  { label: "Tüm durumlar", value: "all" },
  { label: "Başvuru açık", value: "open" },
  { label: "Yakında", value: "soon" },
  { label: "Kontenjan doldu", value: "full" },
];

const regionOptions: { label: string; value: Region | "all" }[] = [
  { label: "Tüm rotalar", value: "all" },
  { label: getRegionLabel("domestic"), value: "domestic" },
  { label: getRegionLabel("international"), value: "international" },
];

export function ProgramFilters({ programs }: { programs: Program[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState<Region | "all">("all");
  const [status, setStatus] = useState<ProgramStatus | "all">("all");
  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>();

    for (const program of programs) {
      if (!program.category) {
        continue;
      }

      if (!seen.has(program.category)) {
        seen.set(program.category, program.categoryLabel || program.category);
      }
    }

    return Array.from(seen.entries())
      .map(([value, label]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label, "tr-TR"));
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

    return programs.filter((program) => {
      const matchesQuery =
        !normalizedQuery ||
        [program.title, program.summary, program.location, program.audience]
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(normalizedQuery);
      const matchesCategory = category === "all" || program.category === category;
      const matchesRegion = region === "all" || program.region === region;
      const matchesStatus = status === "all" || program.status === status;

      return matchesQuery && matchesCategory && matchesRegion && matchesStatus;
    });
  }, [category, programs, query, region, status]);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="relative block">
            <span className="sr-only">Program ara</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 w-full rounded-md border border-stone-200 bg-[#fbfaf6] pl-11 pr-4 text-sm outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
              placeholder="Program, lokasyon veya yaş ara"
            />
          </label>
          <label>
            <span className="sr-only">Kategori</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-12 w-full rounded-md border border-stone-200 bg-[#fbfaf6] px-4 text-sm outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
            >
              <option value="all">Tüm kategoriler</option>
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Bölge</span>
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value as Region | "all")}
              className="h-12 w-full rounded-md border border-stone-200 bg-[#fbfaf6] px-4 text-sm outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
            >
              {regionOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Durum</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ProgramStatus | "all")}
              className="h-12 w-full rounded-md border border-stone-200 bg-[#fbfaf6] px-4 text-sm outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-stone-500">
          <SlidersHorizontal size={16} aria-hidden="true" />
          {filteredPrograms.length} program listeleniyor
        </div>
      </div>

      {filteredPrograms.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrograms.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
          Seçilen filtrelerle eşleşen program bulunamadı.
        </div>
      )}
    </div>
  );
}
