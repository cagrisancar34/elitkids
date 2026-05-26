"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  className?: string;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
};

function getVisiblePageItems(page: number, pageCount: number) {
  const pages = Array.from(
    new Set([1, page - 1, page, page + 1, pageCount].filter((item) => item >= 1 && item <= pageCount)),
  ).sort((left, right) => left - right);

  return pages.flatMap((pageNumber, index) => {
    const previousPage = pages[index - 1] ?? 0;

    if (pageNumber - previousPage > 1) {
      return [`gap-${previousPage}-${pageNumber}`, pageNumber] as const;
    }

    return [pageNumber] as const;
  });
}

export function PaginationControls({
  className,
  itemLabel = "kayit",
  onPageChange,
  page,
  pageCount,
  pageSize,
  totalItems,
}: PaginationControlsProps) {
  const startItem = totalItems ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, totalItems);
  const visiblePageItems = getVisiblePageItems(page, pageCount);

  return (
    <div
      className={cn(
        "surface-muted flex flex-col gap-3 rounded-[1.25rem] px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="font-semibold">
        {startItem}-{endItem} / {totalItems} {itemLabel}
      </div>

      {pageCount > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Onceki sayfa"
          >
            <ChevronLeft className="h-4 w-4" />
            Onceki
          </Button>

          <div className="flex items-center gap-1">
            {visiblePageItems.map((pageItem) => {
              if (typeof pageItem === "string") {
                return (
                  <span key={pageItem} className="px-1 text-xs text-muted-foreground/70">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={pageItem}
                  type="button"
                  onClick={() => onPageChange(pageItem)}
                  className={cn(
                    "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-bold transition-all",
                    page === pageItem
                      ? "bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(11,76,194,0.16)]"
                      : "bg-white/70 text-muted-foreground hover:bg-white hover:text-foreground",
                  )}
                  aria-current={page === pageItem ? "page" : undefined}
                >
                  {pageItem}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            aria-label="Sonraki sayfa"
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
