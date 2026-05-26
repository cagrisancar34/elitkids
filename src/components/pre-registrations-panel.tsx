/* eslint-disable @next/next/no-img-element */

"use client";

import { useActionState, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCheck,
  ExternalLink,
  FilePenLine,
  Link2,
  MessageCircleMore,
  MessageSquarePlus,
  TriangleAlert,
  UserRoundCheck,
} from "lucide-react";

import {
  activatePreRegistrationAction,
  addPreRegistrationNoteAction,
  updatePreRegistrationStatusAction,
  type PreRegistrationActionState,
} from "@/app/(app)/manager/pre-registrations/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useListPagination } from "@/components/use-list-pagination";
import type {
  PreRegistrationOption,
  PreRegistrationRecord,
  PreRegistrationSessionSeriesOption,
  PreRegistrationStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const initialState: PreRegistrationActionState = {
  error: null,
  success: null,
};

const statusTabs: Array<{ label: string; value: "all" | PreRegistrationStatus }> = [
  { label: "Tum basvurular", value: "all" },
  { label: "Yeni", value: "new" },
  { label: "Incelemede", value: "reviewing" },
  { label: "Evrak bekleniyor", value: "documents_pending" },
  { label: "Deneme dersi", value: "trial_scheduled" },
  { label: "Iletisime gecildi", value: "contacted" },
  { label: "Aktivasyona hazir", value: "ready_to_activate" },
  { label: "Onayli", value: "approved" },
  { label: "Aktive", value: "activated" },
  { label: "Kaybedildi", value: "lost" },
];

export function PreRegistrationsPanel({
  records,
  branches,
  seasons,
  programs,
  sessionSeries,
}: {
  records: PreRegistrationRecord[];
  branches: PreRegistrationOption[];
  seasons: PreRegistrationOption[];
  programs: PreRegistrationOption[];
  sessionSeries: PreRegistrationSessionSeriesOption[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PreRegistrationStatus>("all");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(records[0]?.id ?? null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesQuery =
        !query ||
        record.studentFullName.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")) ||
        record.parentEmail.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")) ||
        record.programLabel.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"));

      const matchesStatus = statusFilter === "all" || record.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, records, statusFilter]);
  const paginatedRecords = useListPagination({
    items: filteredRecords,
    pageSize: 10,
    resetKey: `${query}:${statusFilter}`,
  });

  const selectedRecord =
    paginatedRecords.pageItems.find((record) => record.id === selectedRecordId) ??
    paginatedRecords.pageItems[0] ??
    null;

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.4rem] border border-white/50 bg-secondary/40 p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Basvuru sahibi, veli e-postasi veya program ara..."
            className="h-14 bg-white text-foreground placeholder:text-muted-foreground"
          />
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | PreRegistrationStatus)}
            className="h-14 bg-white text-foreground"
          >
            {statusTabs.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-[0_18px_44px_rgba(18,43,84,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-border bg-secondary/35 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Ogrenci</th>
                  <th className="px-5 py-4 font-semibold">Program</th>
                  <th className="px-5 py-4 font-semibold">Sube</th>
                  <th className="px-5 py-4 font-semibold">Durum</th>
                  <th className="px-5 py-4 font-semibold">Tarih</th>
                  <th className="px-5 py-4 font-semibold">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length ? (
                  paginatedRecords.pageItems.map((record) => (
                    <tr key={record.id} className="border-b border-border/70 last:border-b-0">
                      <td className="px-5 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => setSelectedRecordId(record.id)}
                          className="text-left"
                        >
                          <div className="font-semibold text-foreground">{record.studentFullName}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{record.parentEmail}</div>
                        </button>
                      </td>
                      <td className="px-5 py-4 align-top text-sm text-foreground">{record.programLabel}</td>
                      <td className="px-5 py-4 align-top text-sm text-muted-foreground">{record.branchLabel}</td>
                      <td className="px-5 py-4 align-top">
                        <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]", getStatusClasses(record.status))}>
                          {record.statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top text-sm text-muted-foreground">{record.submittedAt}</td>
                      <td className="px-5 py-4 align-top">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRecordId(record.id);
                            setDetailOpen(true);
                          }}
                        >
                          Detay
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Filtreye uyan on kayit bulunamadi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredRecords.length ? (
            <PaginationControls
              className="rounded-none border-t border-border bg-secondary/20"
              itemLabel="basvuru"
              onPageChange={paginatedRecords.setPage}
              page={paginatedRecords.page}
              pageCount={paginatedRecords.pageCount}
              pageSize={paginatedRecords.pageSize}
              totalItems={paginatedRecords.totalItems}
            />
          ) : null}
        </div>

        <div className="rounded-[1.6rem] border border-border bg-card p-5 shadow-[0_18px_44px_rgba(18,43,84,0.08)]">
          {selectedRecord ? (
            <SelectedRecordCard record={selectedRecord} onOpenDetail={() => setDetailOpen(true)} />
          ) : (
            <div className="text-sm text-muted-foreground">Detay gormek icin bir basvuru sec.</div>
          )}
        </div>
      </div>

      {selectedRecord ? (
            <PreRegistrationDetailDialog
              key={selectedRecord.id}
              open={detailOpen}
              onOpenChange={setDetailOpen}
              record={selectedRecord}
              branches={branches}
              seasons={seasons}
              programs={programs}
              sessionSeries={sessionSeries}
            />
      ) : null}
    </div>
  );
}

function SelectedRecordCard({
  record,
  onOpenDetail,
}: {
  record: PreRegistrationRecord;
  onOpenDetail: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Secili basvuru
        </div>
        <div className="mt-3 font-display text-[2rem] font-semibold tracking-[-0.05em] text-foreground">
          {record.studentFullName}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {record.programLabel} · {record.branchLabel}
        </div>
      </div>

      <div className="grid gap-3">
        <InfoRow label="Durum" value={record.statusLabel} />
        <InfoRow label="Veli" value={record.parentEmail} />
        <InfoRow label="WhatsApp" value={record.parentWhatsapp || "-"} />
        <InfoRow label="Kaynak" value={record.sourceLabel} />
        <InfoRow label="Tarih" value={record.submittedAt} />
      </div>

      <div className="rounded-[1.2rem] bg-secondary/35 p-4 text-sm leading-6 text-muted-foreground">
        Basvuru detayi, ic notlar ve aktivasyon akisi alttaki detay modali icinden yonetilir.
      </div>
      <Button className="w-full" onClick={onOpenDetail}>
        Detay modali ac
      </Button>
    </div>
  );
}

function PreRegistrationDetailDialog({
  open,
  onOpenChange,
  record,
  branches,
  seasons,
  programs,
  sessionSeries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PreRegistrationRecord;
  branches: PreRegistrationOption[];
  seasons: PreRegistrationOption[];
  programs: PreRegistrationOption[];
  sessionSeries: PreRegistrationSessionSeriesOption[];
}) {
  const customAnswerEntries = Object.entries(record.customAnswers ?? {}).filter(([, value]) =>
    typeof value === "string" && value.trim().length > 0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,1100px)] max-h-[92vh] overflow-y-auto rounded-[1.9rem]">
        <DialogHeader className="pr-10">
          <DialogTitle>{record.studentFullName} · On kayit detayi</DialogTitle>
          <DialogDescription>
            Basvuruyu incele, not ekle ve uygun gorursen aktif ogrenci kaydina donustur.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <DetailBlock title="Ogrenci bilgileri">
                <InfoRow label="TC Kimlik" value={record.tcIdentityNo || "-"} />
                <InfoRow label="Ad soyad" value={record.studentFullName} />
                <InfoRow label="Dogum tarihi" value={record.studentBirthDate} />
                <InfoRow label="Cinsiyet" value={record.studentGender || "-"} />
                <InfoRow label="Not" value={record.note || "-"} />
              </DetailBlock>
              <DetailBlock title="Veli bilgileri">
                <InfoRow label="E-posta" value={record.parentEmail} />
                <InfoRow label="WhatsApp" value={record.parentWhatsapp || "-"} />
                <InfoRow label="Acil kisi" value={record.emergencyContact || "-"} />
                <InfoRow label="Adres" value={record.address || "-"} />
              </DetailBlock>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailBlock title="Anne bilgileri">
                <InfoRow label="Ad soyad" value={record.motherName || "-"} />
                <InfoRow label="Telefon" value={record.motherPhone || "-"} />
                <InfoRow label="Meslek" value={record.motherOccupation || "-"} />
              </DetailBlock>
              <DetailBlock title="Baba bilgileri">
                <InfoRow label="Ad soyad" value={record.fatherName || "-"} />
                <InfoRow label="Telefon" value={record.fatherPhone || "-"} />
                <InfoRow label="Meslek" value={record.fatherOccupation || "-"} />
              </DetailBlock>
            </div>

            {customAnswerEntries.length ? (
              <DetailBlock title="Ek basvuru alanlari">
                <div className="grid gap-3 md:grid-cols-2">
                  {customAnswerEntries.map(([key, value]) => (
                    <InfoRow key={key} label={formatCustomAnswerLabel(key)} value={value} />
                  ))}
                </div>
              </DetailBlock>
            ) : null}

            {record.assets.length ? (
              <DetailBlock title="Yuklenen varliklar">
                <div className="grid gap-4 sm:grid-cols-2">
                  {record.assets.map((asset) => (
                    <div key={asset.id} className="overflow-hidden rounded-[1.2rem] border border-border bg-secondary/30">
                      <img src={asset.url} alt={asset.fileType} className="aspect-[4/3] w-full object-cover" />
                      <div className="px-4 py-3 text-sm text-muted-foreground">{asset.fileType}</div>
                    </div>
                  ))}
                </div>
              </DetailBlock>
            ) : null}
          </div>

          <div className="grid gap-5">
            <DetailBlock title="Durum aksiyonlari">
              <div className="grid gap-2">
                <StatusActionForm preRegistrationId={record.id} status="reviewing" label="Incelemeye al" icon={<FilePenLine className="h-4 w-4" />} />
                <StatusActionForm preRegistrationId={record.id} status="documents_pending" label="Evrak bekleniyor" icon={<TriangleAlert className="h-4 w-4" />} />
                <StatusActionForm preRegistrationId={record.id} status="trial_scheduled" label="Deneme dersi planla" icon={<MessageSquarePlus className="h-4 w-4" />} />
                <StatusActionForm preRegistrationId={record.id} status="contacted" label="Iletisime gecildi" icon={<MessageSquarePlus className="h-4 w-4" />} />
                <StatusActionForm preRegistrationId={record.id} status="ready_to_activate" label="Aktivasyona hazir" icon={<UserRoundCheck className="h-4 w-4" />} />
                <StatusActionForm preRegistrationId={record.id} status="approved" label="Onayli olarak isle" icon={<CheckCheck className="h-4 w-4" />} />
                <StatusActionForm preRegistrationId={record.id} status="lost" label="Kaybedildi" variant="outline" />
                <StatusActionForm preRegistrationId={record.id} status="rejected" label="Reddet" variant="outline" />
                <StatusActionForm preRegistrationId={record.id} status="archived" label="Arsivle" variant="outline" />
              </div>
            </DetailBlock>

            <DetailBlock title="Satis takip notlari">
              <InfoRow label="Son deneme sonucu" value={record.latestTrialOutcome || "-"} />
              <InfoRow label="Kaybedilme nedeni" value={record.latestLostReason || "-"} />
            </DetailBlock>

            <DetailBlock title="Ic not ekle">
              <PreRegistrationNoteForm preRegistrationId={record.id} />
            </DetailBlock>

            <DetailBlock title="Aktivasyon">
              <ActivatePreRegistrationForm
                record={record}
                branches={branches}
                seasons={seasons}
                programs={programs}
                sessionSeries={sessionSeries}
              />
            </DetailBlock>

            <DetailBlock title="Ic notlar">
              <div className="grid gap-3">
                {record.notes.length ? (
                  record.notes.map((note) => (
                    <div key={note.id} className="rounded-[1rem] bg-secondary/35 p-3">
                      <div className="text-sm leading-6 text-foreground">{note.body}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {note.author} · {note.createdAt}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">Henuz ic not eklenmedi.</div>
                )}
              </div>
            </DetailBlock>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusActionForm({
  preRegistrationId,
  status,
  label,
  icon,
  variant = "default",
}: {
  preRegistrationId: string;
  status:
    | "reviewing"
    | "documents_pending"
    | "trial_scheduled"
    | "contacted"
    | "ready_to_activate"
    | "approved"
    | "lost"
    | "rejected"
    | "archived";
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline";
}) {
  const [state, formAction] = useActionState(updatePreRegistrationStatusAction, initialState);
  const requiresContext = status === "lost" || status === "ready_to_activate" || status === "trial_scheduled";
  const contextLabel =
    status === "lost"
      ? "Kaybedilme nedeni"
      : status === "ready_to_activate"
        ? "Deneme dersi sonucu"
        : "Deneme plan notu";
  const contextPlaceholder =
    status === "lost"
      ? "Kayit neden donusmedi, kisa not dus..."
      : status === "ready_to_activate"
        ? "Deneme dersinin sonucu ve aktivasyon notu..."
        : "Saat, beklenti veya deneme ders notu...";

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="preRegistrationId" value={preRegistrationId} />
      <input type="hidden" name="status" value={status} />
      {requiresContext ? (
        <div className="grid gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {contextLabel}
          </label>
          <Textarea
            name="contextNote"
            placeholder={contextPlaceholder}
            className="min-h-20"
          />
        </div>
      ) : null}
      <FormSubmitButton variant={variant} className="w-full justify-center" pendingLabel="Kaydediliyor...">
        {icon}
        {label}
      </FormSubmitButton>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-success">{state.success}</p> : null}
    </form>
  );
}

function PreRegistrationNoteForm({ preRegistrationId }: { preRegistrationId: string }) {
  const [state, formAction] = useActionState(addPreRegistrationNoteAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="preRegistrationId" value={preRegistrationId} />
      <Textarea
        name="body"
        placeholder="Arama notu, eksik belge bilgisi veya yonlendirme notu..."
        className="min-h-24"
      />
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Not ekleniyor...">
        Notu kaydet
      </FormSubmitButton>
    </form>
  );
}

function ActivatePreRegistrationForm({
  record,
  branches,
  seasons,
  programs,
  sessionSeries,
}: {
  record: PreRegistrationRecord;
  branches: PreRegistrationOption[];
  seasons: PreRegistrationOption[];
  programs: PreRegistrationOption[];
  sessionSeries: PreRegistrationSessionSeriesOption[];
}) {
  const [state, formAction] = useActionState(activatePreRegistrationAction, initialState);
  const [programId, setProgramId] = useState(record.programId ?? programs[0]?.id ?? "");
  const [sessionSeriesId, setSessionSeriesId] = useState("");
  const [startsOn, setStartsOn] = useState(new Date().toISOString().slice(0, 10));
  const filteredSeries = useMemo(
    () => sessionSeries.filter((item) => item.programId === programId),
    [programId, sessionSeries],
  );
  const selectedProgram = useMemo(
    () => programs.find((option) => option.id === programId) ?? null,
    [programId, programs],
  );
  const selectedSeries = useMemo(
    () => filteredSeries.find((option) => option.id === sessionSeriesId) ?? null,
    [filteredSeries, sessionSeriesId],
  );
  const firstLessonPreview = state.activationResult?.firstLessonLabel ?? null;
  const temporaryPasswordPreview = state.activationResult?.temporaryPassword ?? null;
  const whatsAppHref = state.activationResult?.webWhatsAppHref ?? null;

  function handleProgramChange(nextProgramId: string) {
    setProgramId(nextProgramId);
    setSessionSeriesId("");
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[1.1rem] border border-border/70 bg-white/60 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Aktivasyon onizlemesi
        </div>
        <div className="mt-3 grid gap-3 text-sm text-foreground">
          <InfoRow label="Secili program" value={selectedProgram?.label ?? "Henuz secilmedi"} />
          <InfoRow label="Secili grup" value={selectedSeries?.label ?? "Henuz secilmedi"} />
          <InfoRow label="Baslangic tarihi" value={startsOn ? formatDateLabel(startsOn) : "Henuz secilmedi"} />
          <InfoRow
            label="Ilk atanacak seans"
            value={firstLessonPreview ?? "Aktivasyon sonrasi ilk uygun atanmis seans otomatik bulunacak"}
          />
        </div>
      </div>

      <form action={formAction} className="grid gap-3">
        <input type="hidden" name="preRegistrationId" value={record.id} />
        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sube</span>
          <Select name="branchId" defaultValue={record.branchId ?? branches[0]?.id ?? ""}>
            <option value="" disabled>Sube sec</option>
            {branches.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sezon</span>
          <Select name="seasonId" defaultValue={record.seasonId ?? seasons[0]?.id ?? ""}>
            <option value="" disabled>Sezon sec</option>
            {seasons.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Program</span>
          <Select name="programId" value={programId} onChange={(event) => handleProgramChange(event.target.value)}>
            <option value="" disabled>Program sec</option>
            {programs.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Grup</span>
          <Select
            name="sessionSeriesId"
            value={sessionSeriesId}
            onChange={(event) => setSessionSeriesId(event.target.value)}
            disabled={!programId}
          >
            <option value="" disabled>{programId ? "Grup sec" : "Once program sec"}</option>
            {filteredSeries.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Baslangic tarihi</span>
          <Input type="date" name="startsOn" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ilk tahakkuk</span>
          <Select name="createInitialCharge" defaultValue="yes">
            <option value="yes">Olustur</option>
            <option value="no">Daha sonra</option>
          </Select>
        </label>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-success">{state.success}</p> : null}
        <FormSubmitButton className="w-full" pendingLabel="Aktive ediliyor...">
          <UserRoundCheck className="h-4 w-4" />
          Onayla ve aktive et
        </FormSubmitButton>
      </form>

      {state.activationResult ? (
        <div className="grid gap-4 rounded-[1.2rem] border border-emerald-200/60 bg-emerald-50/60 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
            Veli mesaji ve panel erisimi
          </div>

          {state.activationResult.warning ? (
            <div className="rounded-[1rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{state.activationResult.warning}</span>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3">
            <InfoRow label="Ilk ders" value={state.activationResult.firstLessonLabel ?? "Henuz uretilemedi"} />
            <InfoRow label="Panel giris linki" value={state.activationResult.loginUrl} />
            <InfoRow label="Gecici sifre" value={temporaryPasswordPreview ?? "Henuz uretilemedi"} />
            <InfoRow
              label="Meta otomatik gonderim"
              value={
                state.activationResult.autoDispatchStatus === "queued"
                  ? "Kuyruga alindi"
                  : state.activationResult.autoDispatchStatus === "failed"
                    ? "Basarisiz, manuel gonderim kullan"
                    : "Atlandi"
              }
            />
          </div>

          <div className="rounded-[1rem] border border-border/70 bg-white/80 p-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <MessageCircleMore className="h-4 w-4" />
              WhatsApp onizlemesi
            </div>
            <Textarea
              value={state.activationResult.messagePreview ?? "Mesaj metni tam uretilemedi. Ilk ders ve gecici sifreyi kontrol et."}
              readOnly
              className="min-h-40 bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {whatsAppHref ? (
              <Button asChild>
                <a href={whatsAppHref} target="_blank" rel="noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                  WhatsApp ile gonder
                </a>
              </Button>
            ) : null}
            {temporaryPasswordPreview ? (
              <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(temporaryPasswordPreview)}>
                <Link2 className="h-4 w-4" />
                Gecici sifreyi kopyala
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <a href={state.activationResult.loginUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Giris sayfasini ac
              </a>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-secondary/20 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="text-sm leading-6 text-foreground">{value}</div>
    </div>
  );
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(date);
}

function formatCustomAnswerLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusClasses(status: PreRegistrationStatus) {
  if (status === "activated") {
    return "bg-emerald-500/12 text-emerald-700";
  }

  if (status === "approved") {
    return "bg-sky-500/12 text-sky-700";
  }

  if (status === "documents_pending") {
    return "bg-orange-500/12 text-orange-700";
  }

  if (status === "trial_scheduled") {
    return "bg-fuchsia-500/12 text-fuchsia-700";
  }

  if (status === "contacted") {
    return "bg-violet-500/12 text-violet-700";
  }

  if (status === "ready_to_activate") {
    return "bg-cyan-500/12 text-cyan-700";
  }

  if (status === "lost") {
    return "bg-rose-500/12 text-rose-700";
  }

  if (status === "rejected") {
    return "bg-rose-500/12 text-rose-700";
  }

  if (status === "archived") {
    return "bg-slate-500/12 text-slate-700";
  }

  if (status === "reviewing") {
    return "bg-amber-500/12 text-amber-700";
  }

  return "bg-secondary text-secondary-foreground";
}
