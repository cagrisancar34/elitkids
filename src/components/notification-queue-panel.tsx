"use client";

import { useMemo, useState } from "react";

import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useListPagination } from "@/components/use-list-pagination";
import type { NotificationRecord } from "@/lib/types";

type NotificationFilter = "all" | "queued" | "read";
type NotificationSort = "status" | "title-asc";

function isQueued(status: string) {
  return status.toLocaleLowerCase("tr-TR").includes("hazir");
}

export function NotificationQueuePanel({
  notifications,
}: {
  notifications: NotificationRecord[];
}) {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<NotificationSort>("status");

  const counts = useMemo(
    () => ({
      all: notifications.length,
      queued: notifications.filter((item) => isQueued(item.status)).length,
      read: notifications.filter((item) => !isQueued(item.status)).length,
    }),
    [notifications],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        if (filter === "queued") {
          return isQueued(item.status);
        }

        if (filter === "read") {
          return !isQueued(item.status);
        }

        return true;
      })
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${item.title} ${item.channel} ${item.status}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "title-asc") {
          return left.title.localeCompare(right.title, "tr");
        }

        const leftRank = isQueued(left.status) ? 0 : 1;
        const rightRank = isQueued(right.status) ? 0 : 1;
        if (leftRank !== rightRank) {
          return leftRank - rightRank;
        }

        return left.title.localeCompare(right.title, "tr");
      });
  }, [filter, normalizedSearch, notifications, sort]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "status";
  const paginatedNotifications = useListPagination({
    items: filteredNotifications,
    pageSize: 8,
    resetKey: `${filter}:${search}:${sort}`,
  });

  return (
    <div className="grid gap-4">
      <div className="surface-muted flex flex-wrap gap-2 rounded-full px-3 py-2">
        {[
          ["all", "Tum kayitlar", counts.all],
          ["queued", "Kuyrukta", counts.queued],
          ["read", "Okunanlar", counts.read],
        ].map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key as NotificationFilter)}
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
          placeholder="Bildirim ara: baslik, kanal veya durum"
          aria-label="Bildirim ara"
        />
        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value as NotificationSort)}
          aria-label="Bildirim siralama"
        >
          <option value="status">Duruma gore sirala</option>
          <option value="title-asc">Basliga gore A-Z</option>
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
      <div className="grid gap-4">
        {filteredNotifications.length ? (
          paginatedNotifications.pageItems.map((notification) => (
            <div key={`${notification.title}-${notification.status}`} className="surface-panel rounded-[1.3rem] border border-white/40 p-5">
              <div className="font-display text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">
                {notification.title}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {notification.channel} · {notification.status}
              </div>
            </div>
          ))
        ) : (
          <div className="surface-muted rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
            Bu filtre ve arama sonucunda gosterilecek bildirim yok.
          </div>
        )}
      </div>
      {filteredNotifications.length ? (
        <PaginationControls
          itemLabel="bildirim"
          onPageChange={paginatedNotifications.setPage}
          page={paginatedNotifications.page}
          pageCount={paginatedNotifications.pageCount}
          pageSize={paginatedNotifications.pageSize}
          totalItems={paginatedNotifications.totalItems}
        />
      ) : null}
    </div>
  );
}
