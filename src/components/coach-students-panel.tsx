"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CoachStudentRecord } from "@/lib/types";

type CoachFilter = "all" | "active" | "risk";
type CoachSort = "name-asc" | "attendance-desc" | "program-asc";

function coachStatusKey(status: string) {
  return status.toLocaleLowerCase("tr-TR").includes("risk") ? "risk" : "active";
}

function attendanceValue(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export function CoachStudentsPanel({ students }: { students: CoachStudentRecord[] }) {
  const [filter, setFilter] = useState<CoachFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CoachSort>("name-asc");

  const counts = useMemo(
    () => ({
      all: students.length,
      active: students.filter((student) => coachStatusKey(student.status) === "active").length,
      risk: students.filter((student) => coachStatusKey(student.status) === "risk").length,
    }),
    [students],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => (filter === "all" ? true : coachStatusKey(student.status) === filter))
      .filter((student) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack =
          `${student.name} ${student.program} ${student.coach} ${student.attendance} ${student.status}`.toLocaleLowerCase(
            "tr-TR",
          );
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "attendance-desc") {
          return attendanceValue(right.attendance) - attendanceValue(left.attendance);
        }

        if (sort === "program-asc") {
          return left.program.localeCompare(right.program, "tr");
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

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tum roster</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Aktif ogrenci</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.active}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ortalama devam</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">%{averageAttendance}</div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="surface-muted flex flex-wrap gap-2 rounded-full px-3 py-2">
          {[
            ["all", "Tum roster", counts.all],
            ["active", "Aktif", counts.active],
            ["risk", "Risk", counts.risk],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as CoachFilter)}
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
            placeholder="Roster ara: ad, program veya devam"
            aria-label="Roster ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as CoachSort)}
            aria-label="Roster siralama"
          >
            <option value="name-asc">Ada gore A-Z</option>
            <option value="attendance-desc">Devama gore yuksekten dusuge</option>
            <option value="program-asc">Programa gore A-Z</option>
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
            { key: "status", label: "Durum" },
          ]}
          rows={filteredStudents}
        />
      </section>
    </div>
  );
}
