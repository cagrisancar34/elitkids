"use client";

import { useActionState, useMemo, useState } from "react";
import { FileText, PencilLine, ReceiptText, Trash2 } from "lucide-react";

import {
  deactivateStudentAction,
  grantStudentLessonsAction,
  rebuildStudentAllocationsAction,
  saveStudentDetailAction,
  type ActionState,
  updateStudentAction,
} from "@/app/(app)/manager/students/actions";
import { ManualPaymentForm } from "@/components/manual-payment-form";
import { FormSubmitButton } from "@/components/form-submit-button";
import { StudentDetailForm } from "@/components/student-detail-form";
import { StudentReportCardView } from "@/components/student-report-card-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  DetailQuestionRecord,
  ProgramRecord,
  SessionSeriesOption,
  StudentRecord,
} from "@/lib/types";

const initialState: ActionState = {
  error: null,
  success: null,
};

function toGenderValue(value: string) {
  const lower = value.toLocaleLowerCase("tr-TR");

  if (lower.includes("kadin")) {
    return "female";
  }

  if (lower.includes("erkek")) {
    return "male";
  }

  return "other";
}

function toDateInputValue(value: string) {
  if (value.includes(".")) {
    const [day, month, year] = value.split(".");
    return `${year}-${month}-${day}`;
  }

  return value;
}

export function StudentActions({
  student,
  programs,
  sessionSeriesOptions,
  questions,
}: {
  student: StudentRecord;
  programs: ProgramRecord[];
  sessionSeriesOptions: SessionSeriesOption[];
  questions: DetailQuestionRecord[];
}) {
  const [updateState, updateAction] = useActionState(updateStudentAction, initialState);
  const [deactivateState, deactivateAction] = useActionState(deactivateStudentAction, initialState);
  const [grantState, grantAction] = useActionState(grantStudentLessonsAction, initialState);
  const [rebuildState, rebuildAction] = useActionState(rebuildStudentAllocationsAction, initialState);
  const [selectedProgramId, setSelectedProgramId] = useState(student.programId ?? "");
  const filteredSeries = useMemo(
    () => sessionSeriesOptions.filter((series) => series.programId === selectedProgramId),
    [selectedProgramId, sessionSeriesOptions],
  );

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Detay
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ogrenci detay girisi</DialogTitle>
            <DialogDescription>
              Bu form dinamik soru sablonundan beslenir. Kayit tamamlandiginda karne ayni veriden guncellenir.
            </DialogDescription>
          </DialogHeader>
          <StudentDetailForm
            studentId={student.id}
            questions={questions}
            initialAnswers={student.detailEntries ?? []}
            action={saveStudentDetailAction}
            submitLabel="Detayi kaydet ve karneyi olustur"
            pendingLabel="Detay kaydediliyor..."
          />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={!student.reportCard}>
            <FileText className="h-4 w-4" />
            Karne
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Karne gorunumu</DialogTitle>
            <DialogDescription>
              Detay kaydi girilip kaydedildikten sonra olusan karnenin ozet gorunumu.
            </DialogDescription>
          </DialogHeader>
          <StudentReportCardView reportCard={student.reportCard} />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <ReceiptText className="h-4 w-4" />
            Odeme
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ogrenci odeme girisi</DialogTitle>
            <DialogDescription>
              Secili ogrencinin acik tahakkuklarina manuel tahsilat kaydi eklenir.
            </DialogDescription>
          </DialogHeader>
          {student.chargeOptions?.length ? (
            <ManualPaymentForm charges={student.chargeOptions} />
          ) : (
            <p className="text-sm text-muted-foreground">Bu ogrenci icin acik tahakkuk bulunmuyor.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            + Hak
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ek seans hakki ver</DialogTitle>
            <DialogDescription>
              Ogrenciye ek hak verildiginde sistem ileri tarihten yeni seans atamalari olusturur.
            </DialogDescription>
          </DialogHeader>
          <form action={grantAction} className="grid gap-4">
            <input type="hidden" name="studentId" value={student.id} />
            <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Kalan hak: <span className="font-semibold text-slate-900">{student.remainingLessons ?? 0}</span>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`student-bonus-lessons-${student.id}`}>
                Eklenecek hak
              </label>
              <Input id={`student-bonus-lessons-${student.id}`} name="lessonCount" type="number" min={1} max={16} defaultValue={1} />
            </div>
            {grantState.error ? <p className="text-sm text-destructive">{grantState.error}</p> : null}
            {grantState.success ? <p className="text-sm text-success">{grantState.success}</p> : null}
            <FormSubmitButton className="w-full" pendingLabel="Hak aciliyor...">
              Eklenecek hakki kaydet
            </FormSubmitButton>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <PencilLine className="h-4 w-4" />
            Duzenle
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ogrenciyi duzenle</DialogTitle>
            <DialogDescription>
              Temel profil, program ve cinsiyet bilgisini manager ekranindan guncelle.
            </DialogDescription>
          </DialogHeader>
          <form action={updateAction} className="grid gap-4">
            <input type="hidden" name="studentId" value={student.id} />
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`student-name-${student.id}`}>
                Ad soyad
              </label>
              <Input id={`student-name-${student.id}`} name="fullName" defaultValue={student.name} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`student-birth-${student.id}`}>
                Dogum tarihi
              </label>
              <Input
                id={`student-birth-${student.id}`}
                name="birthDate"
                type="date"
                defaultValue={toDateInputValue(student.birthDate)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`student-program-${student.id}`}>
                Program
              </label>
              <Select
                id={`student-program-${student.id}`}
                name="programId"
                value={selectedProgramId}
                onChange={(event) => setSelectedProgramId(event.target.value)}
              >
                <option value="" disabled>
                  Program sec
                </option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`student-session-series-${student.id}`}>
                Grup / seans serisi
              </label>
              <Select
                id={`student-session-series-${student.id}`}
                name="sessionSeriesId"
                defaultValue={student.sessionSeriesId ?? ""}
                disabled={!selectedProgramId}
              >
                <option value="" disabled>
                  {selectedProgramId ? "Grup sec" : "Once program sec"}
                </option>
                {filteredSeries.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`student-gender-${student.id}`}>
                Cinsiyet
              </label>
              <Select id={`student-gender-${student.id}`} name="gender" defaultValue={toGenderValue(student.gender)}>
                <option value="female">Kadin</option>
                <option value="male">Erkek</option>
                <option value="other">Belirtilmedi</option>
              </Select>
            </div>
            {updateState.error ? <p className="text-sm text-destructive">{updateState.error}</p> : null}
            {updateState.success ? <p className="text-sm text-success">{updateState.success}</p> : null}
            <FormSubmitButton className="w-full" pendingLabel="Ogrenci guncelleniyor...">
              Ogrenciyi kaydet
            </FormSubmitButton>
          </form>
        </DialogContent>
      </Dialog>

      <form action={deactivateAction}>
        <input type="hidden" name="studentId" value={student.id} />
        <FormSubmitButton variant="ghost" size="sm" pendingLabel="Siliniyor...">
          <Trash2 className="h-4 w-4" />
          Sil
        </FormSubmitButton>
      </form>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Paketi Yenile
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paketi Yenile</DialogTitle>
            <DialogDescription>
              Uyenin yeni paket (kayit) baslangic tarihini sec. Secilen tarihten itibaren mevcut programa gore yeni paket olusturulacaktir.
            </DialogDescription>
          </DialogHeader>
          <form action={rebuildAction} className="grid gap-4">
            <input type="hidden" name="studentId" value={student.id} />
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`student-rebuild-${student.id}`}>
                Kayıt Tarihi
              </label>
              <Input id={`student-rebuild-${student.id}`} name="startsOn" type="date" required />
            </div>
            {rebuildState.error ? <p className="text-sm text-destructive">{rebuildState.error}</p> : null}
            {rebuildState.success ? <p className="text-sm text-success">{rebuildState.success}</p> : null}
            <FormSubmitButton className="w-full" pendingLabel="Yenileniyor...">
              Kaydet ve Yeni Paket Olustur
            </FormSubmitButton>
          </form>
        </DialogContent>
      </Dialog>

      {deactivateState.error ? <p className="w-full text-right text-sm text-destructive">{deactivateState.error}</p> : null}
      {deactivateState.success ? <p className="w-full text-right text-sm text-success">{deactivateState.success}</p> : null}
    </div>
  );
}
