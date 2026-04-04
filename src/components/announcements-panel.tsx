"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AnnouncementRecord } from "@/lib/types";

type AnnouncementFilter = "all" | "all-users" | "manager" | "coach" | "parent";
type AnnouncementSort = "latest" | "title-asc" | "audience";

const filterLabels: Record<AnnouncementFilter, string> = {
  all: "Tum yayinlar",
  "all-users": "Tum kullanicilar",
  manager: "Yonetici",
  coach: "Koc",
  parent: "Veli",
};

function audienceKey(value: string) {
  const lower = value.toLocaleLowerCase("tr-TR");

  if (lower.includes("tum")) {
    return "all-users";
  }

  if (lower.includes("manager") || lower.includes("yonetici")) {
    return "manager";
  }

  if (lower.includes("coach") || lower.includes("koc")) {
    return "coach";
  }

  if (lower.includes("parent") || lower.includes("veli")) {
    return "parent";
  }

  return "all";
}

export function AnnouncementsPanel({
  announcements,
}: {
  announcements: AnnouncementRecord[];
}) {
  const [filter, setFilter] = useState<AnnouncementFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<AnnouncementSort>("latest");

  const counts = useMemo(
    () => ({
      all: announcements.length,
      "all-users": announcements.filter((item) => audienceKey(item.audience) === "all-users").length,
      manager: announcements.filter((item) => audienceKey(item.audience) === "manager").length,
      coach: announcements.filter((item) => audienceKey(item.audience) === "coach").length,
      parent: announcements.filter((item) => audienceKey(item.audience) === "parent").length,
    }),
    [announcements],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((item) => (filter === "all" ? true : audienceKey(item.audience) === filter))
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${item.title} ${item.summary} ${item.audience}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "title-asc") {
          return left.title.localeCompare(right.title, "tr");
        }

        if (sort === "audience") {
          return left.audience.localeCompare(right.audience, "tr");
        }

        return right.time.localeCompare(left.time, "tr");
      });
  }, [announcements, filter, normalizedSearch, sort]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "latest";

  return (
    <div className="grid gap-4">
      <div className="surface-muted flex flex-wrap gap-2 rounded-full px-3 py-2">
        {(Object.keys(filterLabels) as AnnouncementFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={
              filter === key
                ? "rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-[0_10px_22px_rgba(44,47,49,0.08)]"
                : "rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
            }
          >
            {filterLabels[key]} · {counts[key]}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Duyuru ara: baslik, metin veya hedef rol"
          aria-label="Duyuru ara"
        />
        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value as AnnouncementSort)}
          aria-label="Duyuru siralama"
        >
          <option value="latest">En yeni yayin once</option>
          <option value="title-asc">Basliga gore A-Z</option>
          <option value="audience">Hedef role gore</option>
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
      <div className="grid gap-4">
        {filteredAnnouncements.length ? (
          filteredAnnouncements.map((announcement) => (
            <article key={`${announcement.title}-${announcement.time}`} className="surface-muted rounded-[1.3rem] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-[1.3rem] font-semibold tracking-[-0.03em] text-foreground">
                    {announcement.title}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {announcement.audience} · {announcement.time}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm leading-6 text-muted-foreground">{announcement.summary}</div>
            </article>
          ))
        ) : (
          <div className="surface-muted rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
            Bu filtre ve arama sonucunda gosterilecek duyuru yok.
          </div>
        )}
      </div>
    </div>
  );
}
