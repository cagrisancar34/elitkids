"use client";

import { useState } from "react";

import { BranchSettingsCard } from "@/components/branch-settings-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BranchSetting } from "@/lib/types";

type BranchFilter = "all" | "active" | "inactive" | "archived";
type BranchSort = "name-asc" | "name-desc" | "status";

const filterLabels: Record<BranchFilter, string> = {
  all: "Tum subeler",
  active: "Aktif",
  inactive: "Pasif",
  archived: "Arsivde",
};

export function BranchSettingsPanel({ branches }: { branches: BranchSetting[] }) {
  const [filter, setFilter] = useState<BranchFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<BranchSort>("status");

  const counts = {
    all: branches.length,
    active: branches.filter((branch) => branch.active && !branch.archived).length,
    inactive: branches.filter((branch) => !branch.active && !branch.archived).length,
    archived: branches.filter((branch) => branch.archived).length,
  };

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");
  const filteredBranches = branches
    .filter((branch) => {
      if (filter === "active") {
        return branch.active && !branch.archived;
      }

      if (filter === "inactive") {
        return !branch.active && !branch.archived;
      }

      if (filter === "archived") {
        return branch.archived;
      }

      return true;
    })
    .filter((branch) => {
      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${branch.name} ${branch.slug} ${branch.location}`.toLocaleLowerCase("tr-TR");
      return haystack.includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (sort === "name-asc") {
        return left.name.localeCompare(right.name, "tr");
      }

      if (sort === "name-desc") {
        return right.name.localeCompare(left.name, "tr");
      }

      const leftRank = left.archived ? 2 : left.active ? 0 : 1;
      const rightRank = right.archived ? 2 : right.active ? 0 : 1;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return left.name.localeCompare(right.name, "tr");
    });

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "status";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(filterLabels) as BranchFilter[]).map((key) => (
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
            <Badge variant={filter === key ? "neutral" : "neutral"} className="border-none bg-white/15 px-2 py-0.5 text-[10px] tracking-[0.14em] text-current">
              {counts[key]}
            </Badge>
          </button>
        ))}
      </div>
      <div className="surface-muted flex items-center justify-between gap-3 rounded-[1.15rem] px-4 py-3 text-sm text-muted-foreground">
        <span>{filterLabels[filter]} gorunumu</span>
        <span>{filteredBranches.length} kayit</span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Sube ara: ad, slug veya lokasyon"
          aria-label="Sube ara"
        />
        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value as BranchSort)}
          aria-label="Sube siralama"
        >
          <option value="status">Duruma gore sirala</option>
          <option value="name-asc">Ada gore A-Z</option>
          <option value="name-desc">Ada gore Z-A</option>
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
              setSort("status");
            }}
          >
            Filtreleri temizle
          </Button>
        </div>
      ) : null}
      <div className="grid gap-3 transition-all duration-200">
        {filteredBranches.length ? (
          filteredBranches.map((branch) => <BranchSettingsCard key={branch.id} branch={branch} />)
        ) : (
          <div className="rounded-[1.25rem] bg-accent p-4 text-sm leading-6 text-muted-foreground">
            Bu filtre ve arama sonucunda gosterilecek sube yok.
          </div>
        )}
      </div>
    </div>
  );
}
