"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ChargeRecord, PaymentLifecycleStatus } from "@/lib/types";

type ChargeFilter = "all" | PaymentLifecycleStatus;
type ChargeSort = "due" | "amount-desc" | "amount-asc" | "item-asc";

function amountValue(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

function chargeKey(charge: ChargeRecord): PaymentLifecycleStatus {
  return charge.paymentStatus ?? "pending";
}

export function FinanceChargesPanel({
  charges,
  showSummary = true,
}: {
  charges: ChargeRecord[];
  showSummary?: boolean;
}) {
  const [filter, setFilter] = useState<ChargeFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ChargeSort>("due");

  const counts = useMemo(
    () => ({
      all: charges.length,
      pending: charges.filter((charge) => chargeKey(charge) === "pending").length,
      completed: charges.filter((charge) => chargeKey(charge) === "completed").length,
      overdue: charges.filter((charge) => chargeKey(charge) === "overdue").length,
    }),
    [charges],
  );

  const totals = useMemo(
    () => ({
      pending: charges
        .filter((charge) => chargeKey(charge) === "pending")
        .reduce((sum, charge) => sum + (charge.remainingAmountValue ?? amountValue(charge.amount)), 0),
      completed: charges
        .filter((charge) => chargeKey(charge) === "completed")
        .reduce((sum, charge) => sum + (charge.paidAmountValue ?? charge.totalAmountValue ?? amountValue(charge.amount)), 0),
      overdue: charges
        .filter((charge) => chargeKey(charge) === "overdue")
        .reduce((sum, charge) => sum + (charge.remainingAmountValue ?? amountValue(charge.amount)), 0),
    }),
    [charges],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredCharges = useMemo(() => {
    return charges
      .filter((charge) => (filter === "all" ? true : chargeKey(charge) === filter))
      .filter((charge) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${charge.item} ${charge.dueDate} ${charge.remainingAmount ?? charge.amount} ${charge.status}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "amount-desc") {
          return (right.remainingAmountValue ?? amountValue(right.amount)) - (left.remainingAmountValue ?? amountValue(left.amount));
        }

        if (sort === "amount-asc") {
          return (left.remainingAmountValue ?? amountValue(left.amount)) - (right.remainingAmountValue ?? amountValue(right.amount));
        }

        if (sort === "item-asc") {
          return left.item.localeCompare(right.item, "tr");
        }

        return left.dueDate.localeCompare(right.dueDate, "tr");
      });
  }, [charges, filter, normalizedSearch, sort]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "due";

  return (
    <div className="grid gap-6">
      {showSummary ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tum tahakkuklar</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
          </div>
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Odeme bekleyen</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
              ₺{totals.pending.toLocaleString("tr-TR")}
            </div>
          </div>
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ödeme yapılmadı</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
              ₺{totals.overdue.toLocaleString("tr-TR")}
            </div>
          </div>
          <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Kapanan tahsilat</div>
            <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
              ₺{totals.completed.toLocaleString("tr-TR")}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4">
        <div className="surface-muted flex flex-wrap gap-2 rounded-full px-3 py-2">
          {[
            ["all", "Tum tahakkuklar", counts.all],
            ["pending", "Odeme bekleniyor", counts.pending],
            ["overdue", "Odeme yapilmadi", counts.overdue],
            ["completed", "Odeme tamamlandi", counts.completed],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as ChargeFilter)}
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
            placeholder="Tahakkuk ara: kalem, tarih, tutar veya durum"
            aria-label="Tahakkuk ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as ChargeSort)}
            aria-label="Tahakkuk siralama"
          >
            <option value="due">Son tarihe gore</option>
            <option value="amount-desc">Tutara gore buyukten kucuge</option>
            <option value="amount-asc">Tutara gore kucukten buyuge</option>
            <option value="item-asc">Kaleme gore A-Z</option>
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
            { key: "dueDate", label: "Son tarih" },
            { key: "remainingAmount", label: "Kalan" },
            { key: "status", label: "Durum" },
          ]}
          rows={filteredCharges}
        />
      </section>
    </div>
  );
}
