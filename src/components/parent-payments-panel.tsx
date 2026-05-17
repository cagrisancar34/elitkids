"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ChargeRecord, PaymentLifecycleStatus } from "@/lib/types";

type PaymentFilter = "all" | PaymentLifecycleStatus;
type PaymentSort = "due" | "amount-desc" | "amount-asc";

function chargeKey(charge: ChargeRecord): PaymentLifecycleStatus {
  return charge.paymentStatus ?? "pending";
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

        const haystack = `${charge.item} ${charge.remainingAmount ?? charge.amount} ${charge.dueDate} ${charge.status}`.toLocaleLowerCase(
          "tr-TR",
        );
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "amount-desc") {
          return (right.remainingAmountValue ?? amountValue(right.amount)) - (left.remainingAmountValue ?? amountValue(left.amount));
        }

        if (sort === "amount-asc") {
          return (left.remainingAmountValue ?? amountValue(left.amount)) - (right.remainingAmountValue ?? amountValue(right.amount));
        }

        return left.dueDate.localeCompare(right.dueDate, "tr");
      });
  }, [charges, filter, normalizedSearch, sort]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "due";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="page-surface rounded-[1.7rem] px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tum kalemler</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
        </div>
        <div className="page-surface rounded-[1.7rem] px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Bekleyen toplam</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
            ₺{totals.pending.toLocaleString("tr-TR")}
          </div>
        </div>
        <div className="page-surface rounded-[1.7rem] px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ödeme yapılmadı</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.overdue}</div>
        </div>
        <div className="page-surface rounded-[1.7rem] px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Kapanan toplam</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
            ₺{totals.completed.toLocaleString("tr-TR")}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="page-toolbar flex flex-wrap gap-2 rounded-[1.7rem] px-3 py-3">
          {[
            ["all", "Tum kalemler", counts.all],
            ["pending", "Odeme bekleniyor", counts.pending],
            ["overdue", "Odeme yapilmadi", counts.overdue],
            ["completed", "Odeme tamamlandi", counts.completed],
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

        <div className="page-toolbar grid gap-3 rounded-[1.8rem] p-3 md:grid-cols-[1fr_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Odeme kalemi ara"
            aria-label="Odeme kalemi ara"
            className="bg-white/80"
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
            { key: "remainingAmount", label: "Kalan" },
            { key: "status", label: "Durum" },
          ]}
          rows={filteredCharges}
        />
      </section>
    </div>
  );
}
