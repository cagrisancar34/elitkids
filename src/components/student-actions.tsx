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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  DetailQuestionRecord,
  ManagerStudentListRow,
  ManagerStudentSheet,
  ProgramRecord,
  SessionSeriesOption,
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

export function StudentActions({
  student,
  programs,
  sessionSeriesOptions,
  questions,
}: {
  student: ManagerStudentListRow;
  programs: ProgramRecord[];
  sessionSeriesOptions: SessionSeriesOption[];
  questions: DetailQuestionRecord[];
}) {
  const [updateState, updateAction] = useActionState(updateStudentAction, initialState);
  const [deactivateState, deactivateAction] = useActionState(deactivateStudentAction, initialState);
  const [grantState, grantAction] = useActionState(grantStudentLessonsAction, initialState);
  const [rebuildState, rebuildAction] = useActionState(rebuildStudentAllocationsAction, initialState);
  const [selectedProgramId, setSelectedProgramId] = useState(student.programId ?? "");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [studentSheet, setStudentSheet] = useState<ManagerStudentSheet | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const filteredSeries = useMemo(
    () => sessionSeriesOptions.filter((series) => series.programId === selectedProgramId),
    [selectedProgramId, sessionSeriesOptions],
  );
  const runtimeStudent = useMemo(
    () => ({
      ...student,
      ...(studentSheet ?? {}),
    }),
    [student, studentSheet],
  );

  async function ensureStudentSheetLoaded() {
    if (studentSheet || sheetLoading) {
      return;
    }

    setSheetLoading(true);
    setSheetError(null);

    try {
      const response = await fetch(`/api/manager/students/${student.id}`, {
        method: "GET",
        credentials: "same-origin",
      });

      const body = (await response.json().catch(() => null)) as
        | { sheet?: ManagerStudentSheet; error?: string }
        | null;

      if (!response.ok || !body?.sheet) {
        throw new Error(body?.error ?? "Ogrenci detayi alinamadi.");
      }

      setStudentSheet(body.sheet);
    } catch (error) {
      setSheetError(error instanceof Error ? error.message : "Ogrenci detayi alinamadi.");
    } finally {
      setSheetLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Dialog
        open={detailDialogOpen}
        onOpenChange={(nextOpen) => {
          setDetailDialogOpen(nextOpen);
          if (nextOpen) {
            void ensureStudentSheetLoaded();
          }
        }}
      >
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
          <div className="grid gap-4 rounded-[1.35rem] border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Ogrenci operasyon ozeti
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoChip label="Yasam dongusu" value={runtimeStudent.status} />
              <InfoChip label="Odeme durumu" value={runtimeStudent.lastChargeStatusLabel ?? "Tahakkuk yok"} />
              <InfoChip label="Kalan hak" value={String(runtimeStudent.remainingLessons ?? 0)} />
              <InfoChip label="Siradaki seans" value={formatAllocationDate(runtimeStudent.nextAllocatedSessionAt)} />
            </div>
          </div>
          {sheetLoading && !studentSheet ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Ogrenci detaylari yukleniyor...
            </div>
          ) : sheetError && !studentSheet ? (
            <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
              {sheetError}
            </div>
          ) : (
            <div className="grid gap-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                CRM zamani
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoChip label="Kayit kaynagi" value={runtimeStudent.registrationSourceLabel ?? "Kaynak yok"} />
                <InfoChip label="Bagli veli" value={runtimeStudent.parentName ?? "Henuz baglanmadi"} />
                <InfoChip label="Son tahakkuk" value={runtimeStudent.lastChargeLabel ?? "Tahakkuk yok"} />
                <InfoChip label="Son iletisim" value={runtimeStudent.lastCommunicationLabel ?? "Iletisim yok"} />
              </div>
              <div className="grid gap-2">
                {(runtimeStudent.crmTimeline ?? []).length ? (
                  runtimeStudent.crmTimeline?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-1 text-sm text-slate-600">{item.detail}</div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                        {item.createdAt}
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    className="text-sm text-slate-500"
                  >
                    Bu ogrenci icin okunacak CRM akisi henuz olusmadi.
                  </div>
                )}
              </div>
            </div>
          )}
          <StudentDetailForm
            key={`${runtimeStudent.id}-${runtimeStudent.reportCard?.id ?? "detail"}-${runtimeStudent.detailEntries?.length ?? 0}`}
            studentId={runtimeStudent.id}
            questions={questions}
            initialAnswers={runtimeStudent.detailEntries ?? []}
            action={saveStudentDetailAction}
            submitLabel="Detayi kaydet ve karneyi olustur"
            pendingLabel="Detay kaydediliyor..."
          />
        </DialogContent>
      </Dialog>

      <Sheet
        open={operationsOpen}
        onOpenChange={(nextOpen) => {
          setOperationsOpen(nextOpen);
          if (nextOpen) {
            void ensureStudentSheetLoaded();
          }
        }}
      >
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Operasyon
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[min(100vw,1180px)] max-w-[min(100vw,1180px)] overflow-y-auto rounded-none md:rounded-l-[1.9rem] px-6 md:px-8"
        >
          <SheetHeader className="pt-4">
            <SheetTitle>{student.name} · Ogrenci CRM Merkezi</SheetTitle>
            <SheetDescription>
              Finans, iletisim, destek ve seans sinyalleri tek calisma yuzeyinde okunur.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoChip label="Yasam dongusu" value={runtimeStudent.status} />
              <InfoChip label="Kayit kaynagi" value={runtimeStudent.registrationSourceLabel ?? "Kaynak yok"} />
              <InfoChip label="Bagli veli" value={runtimeStudent.parentName ?? "Veli baglanmadi"} />
              <InfoChip label="WhatsApp" value={runtimeStudent.parentWhatsapp ?? "Numara yok"} />
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Finans ozeti
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <InfoChip label="Son tahakkuk" value={runtimeStudent.lastChargeLabel ?? "Tahakkuk yok"} />
                <InfoChip label="Odeme durumu" value={runtimeStudent.lastChargeStatusLabel ?? "Durum yok"} />
                <InfoChip label="Bakiye" value={runtimeStudent.balance} />
                <InfoChip label="Kalan hak" value={String(runtimeStudent.remainingLessons ?? 0)} />
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Iletisim ozeti
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <InfoChip label="Son destek" value={runtimeStudent.lastCommunicationLabel ?? "Kayit yok"} />
                <InfoChip label="Son WhatsApp" value={runtimeStudent.lastWhatsAppStatusLabel ?? "Kayit yok"} />
                <InfoChip label="Siradaki seans" value={formatAllocationDate(runtimeStudent.nextAllocatedSessionAt)} />
                <InfoChip label="Son atanan seans" value={formatAllocationDate(runtimeStudent.lastAllocatedSessionAt)} />
              </div>
              <div className="mt-3 grid gap-3">
                <InfoLine
                  label="Son destek konusu"
                  value={runtimeStudent.lastSupportSubject ?? "Kayitli destek konusu yok"}
                />
                <InfoLine
                  label="Son kampanya temasi"
                  value={runtimeStudent.lastCampaignLabel ?? "Kampanya gecmisi yok"}
                />
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Son odeme izi
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <InfoChip label="Son tahakkuk" value={student.lastChargeLabel ?? "Tahakkuk yok"} />
                <InfoChip label="Odeme durumu" value={student.lastChargeStatusLabel ?? "Durum yok"} />
              </div>
              <div className="mt-3">
                <InfoLine
                  label="Son odeme notu"
                  value={runtimeStudent.lastPaymentNote ?? "Kayitli odeme notu yok"}
                />
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                CRM zamani
              </div>
              <div className="mt-3 grid gap-2">
                {sheetLoading && !studentSheet ? (
                  <div className="text-sm text-slate-500">Operasyon ozeti yukleniyor...</div>
                ) : (runtimeStudent.crmTimeline ?? []).length ? (
                  runtimeStudent.crmTimeline?.map((item) => (
                    <div key={item.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {item.createdAt}
                        </div>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">Henuz okunacak operasyon zamani yok.</div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={reportCardOpen}
        onOpenChange={(nextOpen) => {
          setReportCardOpen(nextOpen);
          if (nextOpen) {
            void ensureStudentSheetLoaded();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={!student.detailSaved}>
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
          {sheetLoading && !studentSheet ? (
            <div className="text-sm text-slate-500">Karne yukleniyor...</div>
          ) : (
            <StudentReportCardView reportCard={runtimeStudent.reportCard} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={paymentOpen}
        onOpenChange={(nextOpen) => {
          setPaymentOpen(nextOpen);
          if (nextOpen) {
            void ensureStudentSheetLoaded();
          }
        }}
      >
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
          {sheetLoading && !studentSheet ? (
            <p className="text-sm text-muted-foreground">Tahakkuklar yukleniyor...</p>
          ) : runtimeStudent.chargeOptions?.length ? (
            <ManualPaymentForm charges={runtimeStudent.chargeOptions} />
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
            Paketi yenile
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni 8 hakli paket ac</DialogTitle>
            <DialogDescription>
              Secilen kayit tarihinden sonraki ilk uygun 8 seans atanir. Yeterli seans yoksa sistem
              program veya grup bitis tarihini uzatman gerektigini soyler.
            </DialogDescription>
          </DialogHeader>
          <form action={rebuildAction} className="grid gap-4">
            <input type="hidden" name="studentId" value={student.id} />
            <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Mevcut kalan hak: <span className="font-semibold text-slate-900">{student.remainingLessons ?? 0}</span>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`student-rebuild-${student.id}`}>
                Yeni paket kayit tarihi
              </label>
              <Input
                id={`student-rebuild-${student.id}`}
                name="startsOn"
                type="date"
                required
                defaultValue={student.nextAllocatedSessionAt ? student.nextAllocatedSessionAt.slice(0, 10) : new Date().toISOString().slice(0, 10)}
              />
            </div>
            {rebuildState.error ? <p className="text-sm text-destructive">{rebuildState.error}</p> : null}
            {rebuildState.success ? <p className="text-sm text-success">{rebuildState.success}</p> : null}
            <FormSubmitButton className="w-full" pendingLabel="Paket aciliyor...">
              8 hakli paketi olustur
            </FormSubmitButton>
          </form>
        </DialogContent>
      </Dialog>

      {deactivateState.error ? <p className="w-full text-right text-sm text-destructive">{deactivateState.error}</p> : null}
      {deactivateState.success ? <p className="w-full text-right text-sm text-success">{deactivateState.success}</p> : null}
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-700">{value}</div>
    </div>
  );
}
