"use client";

import { useState } from "react";

import { SeasonSettingsCard } from "@/components/season-settings-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SeasonSetting } from "@/lib/types";

type SeasonFilter = "all" | "active" | "default" | "planned";
type SeasonSort = "latest" | "oldest" | "title-asc" | "title-desc";

const filterLabels: Record<SeasonFilter, string> = {
  all: "Tum sezonlar",
  active: "Aktif",
  default: "Varsayilan",
  planned: "Planli",
};

export function SeasonSettingsPanel({ seasons }: { seasons: SeasonSetting[] }) {
  const [filter, setFilter] = useState<SeasonFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SeasonSort>("latest");

  const counts = {
    all: seasons.length,
    active: seasons.filter((season) => season.isActive).length,
    default: seasons.filter((season) => season.isDefault).length,
    planned: seasons.filter((season) => !season.isActive).length,
  };

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");
  const filteredSeasons = seasons
    .filter((season) => {
      if (filter === "active") {
        return season.isActive;
      }

      if (filter === "default") {
        return season.isDefault;
      }

      if (filter === "planned") {
        return !season.isActive;
      }

      return true;
    })
    .filter((season) => {
      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${season.title} ${season.duration} ${season.status}`.toLocaleLowerCase("tr-TR");
      return haystack.includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (sort === "title-asc") {
        return left.title.localeCompare(right.title, "tr");
      }

      if (sort === "title-desc") {
        return right.title.localeCompare(left.title, "tr");
      }

      if (sort === "oldest") {
        return left.startsOn.localeCompare(right.startsOn);
      }

      return right.startsOn.localeCompare(left.startsOn);
    });

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "latest";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(filterLabels) as SeasonFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-all",
              filter === key
                ? "border-primary bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(11,76,194,0.18)]"
                : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <span>{filterLabels[key]}</span>
            <Badge variant="neutral" className="border-none bg-white/15 px-2 py-0.5 text-[10px] tracking-[0.14em] text-current">
              {counts[key]}
            </Badge>
          </button>
        ))}
      </div>
      <div className="surface-muted flex items-center justify-between gap-3 rounded-[1.15rem] px-4 py-3 text-sm text-muted-foreground">
        <span>{filterLabels[filter]} gorunumu</span>
        <span>{filteredSeasons.length} kayit</span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Sezon ara: ad veya durum"
          aria-label="Sezon ara"
        />
        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value as SeasonSort)}
          aria-label="Sezon siralama"
        >
          <option value="latest">En yeni baslangic once</option>
          <option value="oldest">En eski baslangic once</option>
          <option value="title-asc">Ada gore A-Z</option>
          <option value="title-desc">Ada gore Z-A</option>
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
      <div className="grid gap-3 transition-all duration-200">
        {filteredSeasons.length ? (
          filteredSeasons.map((season) => <SeasonSettingsCard key={season.id} season={season} />)
        ) : (
          <div className="rounded-[1.25rem] bg-accent p-4 text-sm leading-6 text-muted-foreground">
            Bu filtre ve arama sonucunda gosterilecek sezon yok.
          </div>
        )}
      </div>
    </div>
  );
}
