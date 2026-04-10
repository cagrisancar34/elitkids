"use client";

import { useMemo, useState } from "react";
import { Download, Funnel, Search } from "lucide-react";

import { StudentActions } from "@/components/student-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { DetailQuestionRecord, ProgramRecord, StudentRecord } from "@/lib/types";

type GenderFilter = "all" | "female" | "male";

function genderKey(value: string) {
  const lower = value.toLocaleLowerCase("tr-TR");

  if (lower.includes("kadin")) {
    return "female";
  }

  if (lower.includes("erkek")) {
    return "male";
  }

  return "all";
}

function statusTone(status: string) {
  const lower = status.toLocaleLowerCase("tr-TR");

  if (lower.includes("aktif")) {
    return "bg-emerald-500";
  }

  if (lower.includes("takip")) {
    return "bg-amber-500";
  }

  if (lower.includes("risk")) {
    return "bg-rose-500";
  }

  return "bg-slate-400";
}

export function ManagerStudentsPanel({
  students,
  programs,
  questions,
}: {
  students: StudentRecord[];
  programs: ProgramRecord[];
  questions: DetailQuestionRecord[];
}) {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [club, setClub] = useState("all");
  const [category, setCategory] = useState("all");

  const clubs = useMemo(
    () => ["all", ...Array.from(new Set(students.map((student) => student.club).filter(Boolean)))],
    [students],
  );
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(students.map((student) => student.category).filter(Boolean)))],
    [students],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (gender !== "all" && genderKey(student.gender) !== gender) {
        return false;
      }

      if (club !== "all" && student.club !== club) {
        return false;
      }

      if (category !== "all" && student.category !== category) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack =
        `${student.name} ${student.club} ${student.category} ${student.gender} ${student.birthDate} ${student.status}`.toLocaleLowerCase(
          "tr-TR",
        );

      return haystack.includes(normalizedSearch);
    });
  }, [category, club, gender, normalizedSearch, students]);

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-white/70 bg-[#edf3ff] p-5 shadow-[0_22px_50px_rgba(18,43,84,0.08)]">
        <div className="grid gap-3 xl:grid-cols-[1fr_340px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Sporcu, kulup veya kategori ara..."
              aria-label="Ogrenci ara"
              className="h-16 rounded-[1.4rem] bg-white pl-14 text-base"
            />
          </div>
          <div className="grid gap-3">
            <Select
              value={club}
              onChange={(event) => setClub(event.target.value)}
              aria-label="Kulup filtresi"
              className="h-16 rounded-[1.4rem] bg-white text-base"
            >
              <option value="all">Tum Kulupler</option>
              {clubs.slice(1).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Kategori filtresi"
              className="h-16 rounded-[1.4rem] bg-white text-base"
            >
              <option value="all">Tum Kategoriler</option>
              {categories.slice(1).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {[
              ["all", "Tumu"],
              ["female", "Kadin Sporcular"],
              ["male", "Erkek Sporcular"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setGender(key as GenderFilter)}
                className={
                  gender === key
                    ? "rounded-full bg-white px-7 py-4 text-sm font-semibold text-primary shadow-[0_10px_24px_rgba(18,43,84,0.1)]"
                    : "rounded-full px-7 py-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/70"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-muted-foreground shadow-[0_10px_22px_rgba(18,43,84,0.08)]"
            >
              <Funnel className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-muted-foreground shadow-[0_10px_22px_rgba(18,43,84,0.08)]"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_22px_50px_rgba(18,43,84,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                {["Ad soyad", "Kulup", "Kategori", "Cinsiyet", "Dogum tarihi", "Durum", ""].map((label) => (
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
                          <div className="text-[1.1rem] font-semibold text-slate-800">{student.name}</div>
                          <div className="mt-1 text-sm font-medium text-[#7e8aa2]">ID: #{student.id.slice(0, 6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-[1.05rem] font-semibold text-slate-700">{student.club}</td>
                    <td className="px-6 py-6">
                      <span className="inline-flex rounded-full bg-[rgba(133,94,255,0.12)] px-4 py-2 text-sm font-semibold text-[#7b49ff]">
                        {student.category}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-[1.05rem] font-semibold text-slate-700">{student.gender}</td>
                    <td className="px-6 py-6 text-[1.05rem] font-semibold text-slate-700">{student.birthDate}</td>
                    <td className="px-6 py-6">
                      <div className="inline-flex items-center gap-2 text-[1.05rem] font-semibold text-slate-700">
                        <span className={`h-3 w-3 rounded-full ${statusTone(student.status)}`} />
                        {student.status}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <StudentActions student={student} programs={programs} questions={questions} />
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

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 text-sm text-muted-foreground">
          <p>
            Toplam {students.length} sporcu arasindan {filteredStudents.length === 0 ? 0 : 1}-
            {filteredStudents.length} arasi gosteriliyor
          </p>
          <Button type="button" size="sm" className="h-12 w-12 rounded-full p-0">
            1
          </Button>
        </div>
      </div>
    </div>
  );
}
