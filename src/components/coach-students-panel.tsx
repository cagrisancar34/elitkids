"use client";

import { useMemo, useState } from "react";

import { CoachStudentActions } from "@/components/coach-student-actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CoachStudentRecord, DetailQuestionRecord } from "@/lib/types";

type CoachFilter = "all" | "active" | "risk";
type CoachSort = "name-asc" | "attendance-desc" | "program-asc";

function coachStatusKey(status: string) {
  return status.toLocaleLowerCase("tr-TR").includes("risk") ? "risk" : "active";
}

function attendanceValue(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

function statusTone(status: string) {
  return status.toLocaleLowerCase("tr-TR").includes("risk") ? "bg-amber-500" : "bg-emerald-500";
}

export function CoachStudentsPanel({
  students,
  questions,
}: {
  students: CoachStudentRecord[];
  questions: DetailQuestionRecord[];
}) {
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
          `${student.name} ${student.program} ${student.category} ${student.club} ${student.status}`.toLocaleLowerCase(
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

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tum roster</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Detay girilen</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">
            {students.filter((student) => student.detailSaved).length}
          </div>
        </div>
        <div className="surface-panel rounded-[1.35rem] border border-white/40 px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risk sinyali</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.risk}</div>
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
            placeholder="Roster ara: ad, program veya kategori"
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
            <button
              type="button"
              className="text-sm font-medium text-primary"
              onClick={() => {
                setFilter("all");
                setSearch("");
                setSort("name-asc");
              }}
            >
              Filtreleri temizle
            </button>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[1.7rem] border border-white/50 bg-white/92">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  {["Ogrenci", "Kulup", "Kategori", "Program", "Devam", "Durum", ""].map((label) => (
                    <th
                      key={label}
                      className="px-6 py-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#71809a]"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100 align-top last:border-b-0">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#dcecff,#d7d8ff)] text-xl font-bold text-slate-700">
                            {student.initials}
                          </div>
                          <div>
                            <div className="text-[1.05rem] font-semibold text-slate-800">{student.name}</div>
                            <div className="mt-1 text-sm text-[#7e8aa2]">{student.birthDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-[1.02rem] font-semibold text-slate-700">{student.club}</td>
                      <td className="px-6 py-6">
                        <span className="inline-flex rounded-full bg-[rgba(133,94,255,0.12)] px-4 py-2 text-sm font-semibold text-[#7b49ff]">
                          {student.category}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-[1.02rem] font-semibold text-slate-700">{student.program}</td>
                      <td className="px-6 py-6 text-[1.02rem] font-semibold text-slate-700">{student.attendance}</td>
                      <td className="px-6 py-6">
                        <div className="inline-flex items-center gap-2 text-[1rem] font-semibold text-slate-700">
                          <span className={`h-3 w-3 rounded-full ${statusTone(student.status)}`} />
                          {student.status}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <CoachStudentActions student={student} questions={questions} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      Bu filtreye uygun ogrenci bulunamadi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
