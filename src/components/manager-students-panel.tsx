"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { StudentRecord } from "@/lib/types";

type StudentFilter = "all" | "active" | "follow" | "risk";
type StudentSort = "name-asc" | "attendance-desc" | "balance-desc";

function statusKey(status: string) {
  const lower = status.toLocaleLowerCase("tr-TR");

  if (lower.includes("takip")) {
    return "follow";
  }

  if (lower.includes("risk")) {
    return "risk";
  }

  return "active";
}

function attendanceValue(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

function balanceValue(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export function ManagerStudentsPanel({ students }: { students: StudentRecord[] }) {
  const [filter, setFilter] = useState<StudentFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<StudentSort>("name-asc");

  const counts = useMemo(
    () => ({
      all: students.length,
      active: students.filter((student) => statusKey(student.status) === "active").length,
      follow: students.filter((student) => statusKey(student.status) === "follow").length,
      risk: students.filter((student) => statusKey(student.status) === "risk").length,
    }),
    [students],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => (filter === "all" ? true : statusKey(student.status) === filter))
      .filter((student) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack =
          `${student.name} ${student.program} ${student.coach} ${student.balance} ${student.status}`.toLocaleLowerCase(
            "tr-TR",
          );
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "attendance-desc") {
          return attendanceValue(right.attendance) - attendanceValue(left.attendance);
        }

        if (sort === "balance-desc") {
          return balanceValue(right.balance) - balanceValue(left.balance);
        }

        return left.name.localeCompare(right.name, "tr");
      });
  }, [filter, normalizedSearch, sort, students]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "name-asc";
  const averageAttendance = filteredStudents.length
    ? Math.round(
        filteredStudents.reduce((sum, student) => sum + attendanceValue(student.attendance), 0) /
          filteredStudents.length,
      )
    : 0;
  const totalOpenBalance = filteredStudents.reduce((sum, student) => sum + balanceValue(student.balance), 0);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tum ogrenciler</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Aktif</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.active}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Takipte</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.follow}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risk</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.risk}</div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="surface-muted flex flex-wrap gap-2 rounded-full px-3 py-2">
          {[
            ["all", "Tum ogrenciler", counts.all],
            ["active", "Aktif", counts.active],
            ["follow", "Takipte", counts.follow],
            ["risk", "Risk", counts.risk],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as StudentFilter)}
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
            placeholder="Ogrenci ara: ad, program, koc veya bakiye"
            aria-label="Ogrenci ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as StudentSort)}
            aria-label="Ogrenci siralama"
          >
            <option value="name-asc">Ada gore A-Z</option>
            <option value="attendance-desc">Devama gore yuksekten dusuge</option>
            <option value="balance-desc">Bakiyeye gore yuksekten dusuge</option>
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
                setSort("name-asc");
              }}
            >
              Filtreleri temizle
            </Button>
          </div>
        ) : null}

        <DataTable
          columns={[
            { key: "name", label: "Ogrenci" },
            { key: "program", label: "Program" },
            { key: "coach", label: "Koc" },
            { key: "attendance", label: "Devam" },
            { key: "balance", label: "Bakiye" },
            { key: "status", label: "Durum" },
          ]}
          rows={filteredStudents}
        />

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="surface-muted rounded-[1.25rem] px-5 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ortalama devam</div>
            <div className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-foreground">%{averageAttendance}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Sezon ritmini bozan gruplar bu banttan hizla okunur.</p>
          </div>
          <div className="surface-muted rounded-[1.25rem] px-5 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Acik bakiye</div>
            <div className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-foreground">
              ₺{totalOpenBalance.toLocaleString("tr-TR")}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Finans ve roster sinyali ayni tabloda birlikte yorumlanir.</p>
          </div>
          <div className="surface-muted rounded-[1.25rem] px-5 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Oncelikli aksiyon</div>
            <div className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-foreground">{counts.risk + counts.follow}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Takip ve risk grubu tek bakista aksiyona donusturulur.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
