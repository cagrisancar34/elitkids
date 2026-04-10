"use client";

import { useActionState } from "react";
import { FileText, PencilLine, ReceiptText, Trash2 } from "lucide-react";

import {
  deactivateStudentAction,
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
import type { DetailQuestionRecord, ProgramRecord, StudentRecord } from "@/lib/types";

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
  questions,
}: {
  student: StudentRecord;
  programs: ProgramRecord[];
  questions: DetailQuestionRecord[];
}) {
  const [updateState, updateAction] = useActionState(updateStudentAction, initialState);
  const [deactivateState, deactivateAction] = useActionState(deactivateStudentAction, initialState);

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
              <Select id={`student-program-${student.id}`} name="programId" defaultValue={student.programId ?? ""}>
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

      {deactivateState.error ? <p className="w-full text-right text-sm text-destructive">{deactivateState.error}</p> : null}
      {deactivateState.success ? <p className="w-full text-right text-sm text-success">{deactivateState.success}</p> : null}
    </div>
  );
}
