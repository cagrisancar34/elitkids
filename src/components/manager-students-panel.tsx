"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Download, Funnel, Search, Sparkles } from "lucide-react";

import { StudentActions } from "@/components/student-actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  DetailQuestionRecord,
  ManagerStudentListRow,
  PaymentLifecycleStatus,
  ProgramRecord,
  SessionSeriesOption,
} from "@/lib/types";

type AgeFilter = "all" | "child" | "teen" | "adult";
type PaymentFilter = "all" | PaymentLifecycleStatus;

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

function resolveAge(birthDate: string) {
  const [day, month, year] = birthDate.split(".").map(Number);
  if (!day || !month || !year) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthOffset = today.getMonth() + 1 - month;
  const dayOffset = today.getDate() - day;

  if (monthOffset < 0 || (monthOffset === 0 && dayOffset < 0)) {
    age -= 1;
  }

  return age;
}

function getAgeBand(age: number | null) {
  if (age === null) {
    return { key: "all" as AgeFilter, label: "Yas belirtilmedi" };
  }

  if (age <= 9) {
    return { key: "child" as AgeFilter, label: "6-9 yas" };
  }

  if (age <= 15) {
    return { key: "teen" as AgeFilter, label: "10-15 yas" };
  }

  return { key: "adult" as AgeFilter, label: "16+ yas" };
}

function getPaymentState(student: ManagerStudentListRow): PaymentLifecycleStatus {
  return student.paymentStatus ?? "completed";
}

function getPaymentLabel(state: PaymentLifecycleStatus) {
  if (state === "completed") {
    return "Odeme Tamamlandi";
  }

  if (state === "overdue") {
    return "Odeme Yapilmadi";
  }

  return "Odeme Bekleniyor";
}

function paymentBadgeTone(state: PaymentLifecycleStatus) {
  if (state === "completed") {
    return "bg-emerald-500/12 text-emerald-700";
  }

  if (state === "overdue") {
    return "bg-rose-500/12 text-rose-700";
  }

  return "bg-amber-500/12 text-amber-700";
}

function formatAllocationDate(value?: string | null) {
  if (!value) {
    return "Seans atanmadi";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Seans atanmadi"
    : date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
}

function StudentAvatar({ student, size = "md" }: { student: ManagerStudentListRow; size?: "md" | "sm" }) {
  const sizeClass = size === "sm" ? "h-12 w-12 rounded-xl" : "h-12 w-12 rounded-full";

  if (student.photoUrl) {
    return (
      <Image
        src={student.photoUrl}
        alt={student.name}
        width={48}
        height={48}
        unoptimized
        className={`${sizeClass} shrink-0 object-cover border border-slate-200 bg-slate-100`}
      />
    );
  }

  return (
    <div
      className={`flex ${sizeClass} shrink-0 items-center justify-center bg-sky-100 text-lg font-black text-sky-700 shadow-inner`}
    >
      {student.initials}
    </div>
  );
}

export function ManagerStudentsPanel({
  students,
  programs,
  sessionSeriesOptions,
  questions,
}: {
  students: ManagerStudentListRow[];
  programs: ProgramRecord[];
  sessionSeriesOptions: SessionSeriesOption[];
  questions: DetailQuestionRecord[];
}) {
  const [view, setView] = useState<"active" | "passive">("active");
  const [search, setSearch] = useState("");
  const [ageBand, setAgeBand] = useState<AgeFilter>("all");
  const [program, setProgram] = useState("all");
  const [payment, setPayment] = useState<PaymentFilter>("all");

  const activeStudents = useMemo(
    () => students.filter((student) => !student.status.toLocaleLowerCase("tr-TR").includes("pasif")),
    [students],
  );
  const passiveStudents = useMemo(
    () => students.filter((student) => student.status.toLocaleLowerCase("tr-TR").includes("pasif")),
    [students],
  );
  const sourceStudents = view === "active" ? activeStudents : passiveStudents;

  const programsSet = useMemo(
    () => ["all", ...Array.from(new Set(sourceStudents.map((student) => student.program).filter(Boolean)))],
    [sourceStudents],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredStudents = useMemo(() => {
    return sourceStudents.filter((student) => {
      const studentAgeBand = getAgeBand(resolveAge(student.birthDate)).key;
      const paymentState = getPaymentState(student);

      if (ageBand !== "all" && studentAgeBand !== ageBand) {
        return false;
      }

      if (program !== "all" && student.program !== program) {
        return false;
      }

      if (payment !== "all" && paymentState !== payment) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack =
        `${student.name} ${student.club} ${student.category} ${student.gender} ${student.birthDate} ${student.status} ${student.program} ${student.parentName ?? ""} ${student.registrationSourceLabel ?? ""}`.toLocaleLowerCase(
          "tr-TR",
        );

      return haystack.includes(normalizedSearch);
    });
  }, [ageBand, normalizedSearch, payment, program, sourceStudents]);

  return (
    <div className="grid gap-8">
      {/* FILTER SECTION BENTO BLOCK */}
      <section className="overflow-hidden rounded-[2.5rem] p-6 lg:p-8 bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)]">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setView("active")}
            className={
              view === "active"
                ? "rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white"
                : "rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-500"
            }
          >
            Aktif Ogrenciler ({activeStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setView("passive")}
            className={
              view === "passive"
                ? "rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white"
                : "rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-500"
            }
          >
            Pasif Ogrenciler ({passiveStudents.length})
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="relative group">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Sporcu, kulüp veya kategori ara..."
              aria-label="Öğrenci ara"
              className="h-16 rounded-[2rem] bg-slate-50 border-slate-100 pl-14 text-base placeholder:text-slate-400 focus-visible:ring-sky-500 focus-visible:ring-offset-0 focus-visible:bg-white transition-all hover:bg-slate-50/80"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <Select
              value={program}
              onChange={(event) => setProgram(event.target.value)}
              aria-label="Program filtresi"
            >
              <option value="all">Tüm Programlar</option>
              {programsSet.slice(1).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select
              value={payment}
              onChange={(event) => setPayment(event.target.value as PaymentFilter)}
              aria-label="Ödeme filtresi"
            >
              <option value="all">Tüm Ödeme Durumları</option>
              <option value="completed">Ödeme Tamamlandı</option>
              <option value="pending">Ödeme Bekleniyor</option>
              <option value="overdue">Ödeme Yapılmadı</option>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "Tüm Yaş Grupları"],
              ["child", "Çocuk (6-9)"],
              ["teen", "Genç (10-15)"],
              ["adult", "Yetişkin (16+)"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAgeBand(key as AgeFilter)}
                className={
                  ageBand === key
                    ? "rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform active:scale-95"
                    : "rounded-full bg-slate-50 border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors active:scale-95"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <Funnel className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Öğrenci Profili", "Kayıt Organizasyonu", "Demografi", "Finansal Sinyal", "Operasyonel Durum", ""].map((label) => (
                  <th
                    key={label}
                    className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-50 align-middle hover:bg-slate-50/80 transition-colors last:border-b-0 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <StudentAvatar student={student} />
                        <div>
                          <div className="text-[15px] font-bold text-slate-800">{student.name}</div>
                          <div className="mt-0.5 text-[12px] font-medium text-slate-400">ID: #{student.id.slice(0, 6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="text-[14px] font-bold text-slate-700">{student.program}</div>
                        <div className="text-[13px] font-medium text-slate-500">
                          {student.sessionSeriesLabel ?? student.club}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          {student.registrationSourceLabel ?? "Kaynak belirtilmedi"}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span className="text-sky-600">{student.remainingLessons ?? 0} HAK</span> · {formatAllocationDate(student.lastAllocatedSessionAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="inline-flex rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-600">
                          {student.category}
                        </div>
                        <div className="text-[13px] font-medium text-slate-500">
                          {getAgeBand(resolveAge(student.birthDate)).label}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className={`inline-flex rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-widest ${paymentBadgeTone(getPaymentState(student))}`}>
                          {getPaymentLabel(getPaymentState(student))}
                        </div>
                        <div className="text-[13px] font-bold text-slate-600">{student.balance}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 shadow-sm">
                          <span className={`h-2.5 w-2.5 rounded-full ${statusTone(student.status)}`} />
                          {student.status}
                        </div>
                        <div className="text-[12px] font-medium text-slate-500">
                          {student.parentName ? `${student.parentName} · ${student.parentWhatsapp ?? "Telefon yok"}` : "Veli baglantisi bekleniyor"}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          Son tahakkuk: {student.lastChargeLabel ?? "Kayit yok"}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          Son iletisim: {student.lastCommunicationLabel ?? "Kayit yok"}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          Son WhatsApp: {student.lastWhatsAppStatusLabel ?? "Kayit yok"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <StudentActions
                        student={student}
                        programs={programs}
                        sessionSeriesOptions={sessionSeriesOptions}
                        questions={questions}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm font-medium text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-10 h-10 text-slate-200 mb-4" />
                      Bu filtreye uygun öğrenci bulunamadı.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          <p>
            {sourceStudents.length} SPORCU ARASINDAN {filteredStudents.length === 0 ? 0 : 1}-
            {filteredStudents.length} LİSTELENİYOR
          </p>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="grid gap-4 lg:hidden">
        {filteredStudents.length ? (
          filteredStudents.map((student) => {
            const derivedAge = resolveAge(student.birthDate);
            const derivedBand = getAgeBand(derivedAge);
            const paymentState = getPaymentState(student);

            return (
              <article key={student.id} className="rounded-[2rem] bg-white border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <StudentAvatar student={student} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-bold text-slate-800">{student.name}</div>
                      <div className="mt-0.5 truncate text-[12px] font-medium text-slate-500">
                        {student.program}
                      </div>
                    </div>
                  </div>
                  {student.detailSaved ? (
                    <div className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-violet-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">
                      <Sparkles className="h-3 w-3" />
                      KARNE
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Program / Grup</div>
                    <div className="mt-2 text-[13px] font-bold text-slate-800">{student.program}</div>
                    <div className="mt-1 text-[12px] font-medium text-slate-500">{student.sessionSeriesLabel ?? student.club}</div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-500">{student.registrationSourceLabel ?? "Kaynak belirtilmedi"}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yaş Grubu</div>
                    <div className="mt-2 text-[13px] font-bold text-slate-800">{derivedBand.label}</div>
                    <div className="mt-1 text-[12px] font-medium text-slate-500">{student.birthDate}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Finans</div>
                    <div className={`mt-2 inline-flex rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest ${paymentBadgeTone(paymentState)}`}>
                      {getPaymentLabel(paymentState)}
                    </div>
                    <div className="mt-2 text-[13px] font-bold text-slate-800">{student.balance}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Durum</div>
                    <div className="mt-2 inline-flex items-center gap-2 text-[13px] font-bold text-slate-800">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusTone(student.status)}`} />
                      {student.status}
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-slate-500">
                      {student.remainingLessons ?? 0} hak · {formatAllocationDate(student.lastAllocatedSessionAt)}
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-slate-500">
                      {student.parentName ? `${student.parentName} · ${student.parentWhatsapp ?? "Telefon yok"}` : "Veli baglantisi bekleniyor"}
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-slate-500">
                      Son tahakkuk: {student.lastChargeLabel ?? "Kayit yok"}
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-slate-500">
                      Son WhatsApp: {student.lastWhatsAppStatusLabel ?? "Kayit yok"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <StudentActions
                    student={student}
                    programs={programs}
                    sessionSeriesOptions={sessionSeriesOptions}
                    questions={questions}
                  />
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[2rem] bg-white border border-slate-100 p-8 text-center text-sm font-medium text-slate-500">
            Filtrelere uygun sporcu bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
