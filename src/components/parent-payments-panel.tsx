"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ChargeRecord } from "@/lib/types";

type PaymentFilter = "all" | "pending" | "paid" | "follow";
type PaymentSort = "due" | "amount-desc" | "amount-asc";

function chargeKey(status: string) {
  const lower = status.toLocaleLowerCase("tr-TR");

  if (lower.includes("odendi")) {
    return "paid";
  }

  if (lower.includes("takip") || lower.includes("plan")) {
    return "follow";
  }

  return "pending";
}

function amountValue(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export function ParentPaymentsPanel({ charges }: { charges: ChargeRecord[] }) {
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<PaymentSort>("due");

  const counts = useMemo(
    () => ({
      all: charges.length,
      pending: charges.filter((charge) => chargeKey(charge.status) === "pending").length,
      paid: charges.filter((charge) => chargeKey(charge.status) === "paid").length,
      follow: charges.filter((charge) => chargeKey(charge.status) === "follow").length,
    }),
    [charges],
  );

  const totals = useMemo(
    () => ({
      pending: charges
        .filter((charge) => chargeKey(charge.status) === "pending")
        .reduce((sum, charge) => sum + amountValue(charge.amount), 0),
      paid: charges
        .filter((charge) => chargeKey(charge.status) === "paid")
        .reduce((sum, charge) => sum + amountValue(charge.amount), 0),
    }),
    [charges],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredCharges = useMemo(() => {
    return charges
      .filter((charge) => (filter === "all" ? true : chargeKey(charge.status) === filter))
      .filter((charge) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${charge.item} ${charge.amount} ${charge.dueDate} ${charge.status}`.toLocaleLowerCase(
          "tr-TR",
        );
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "amount-desc") {
          return amountValue(right.amount) - amountValue(left.amount);
        }

        if (sort === "amount-asc") {
          return amountValue(left.amount) - amountValue(right.amount);
        }

        return left.dueDate.localeCompare(right.dueDate, "tr");
      });
  }, [charges, filter, normalizedSearch, sort]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "due";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tum kalemler</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Bekleyen toplam</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
            ₺{totals.pending.toLocaleString("tr-TR")}
          </div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Takipte</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.follow}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Kapanan toplam</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
            ₺{totals.paid.toLocaleString("tr-TR")}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="surface-muted flex flex-wrap gap-2 rounded-full px-3 py-2">
          {[
            ["all", "Tum kalemler", counts.all],
            ["pending", "Bekleyen", counts.pending],
            ["follow", "Takipte", counts.follow],
            ["paid", "Kapandi", counts.paid],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as PaymentFilter)}
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
            placeholder="Odeme kalemi ara"
            aria-label="Odeme kalemi ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as PaymentSort)}
            aria-label="Odeme kalemi siralama"
          >
            <option value="due">Tarihe gore</option>
            <option value="amount-desc">Tutara gore yuksekten dusuge</option>
            <option value="amount-asc">Tutara gore kucukten buyuge</option>
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
                setSort("due");
              }}
            >
              Filtreleri temizle
            </Button>
          </div>
        ) : null}

        <DataTable
          columns={[
            { key: "item", label: "Kalem" },
            { key: "dueDate", label: "Tarih" },
            { key: "amount", label: "Tutar" },
            { key: "status", label: "Durum" },
          ]}
          rows={filteredCharges}
        />
      </section>
    </div>
  );
}
