"use client";

import { useActionState, useMemo, useState } from "react";
import { MessageCircleMore } from "lucide-react";

import {
  createWhatsAppCampaignAction,
  type CommunicationActionState,
  updateManagerMessageTopicAction,
} from "@/app/(app)/manager/communication/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useListPagination } from "@/components/use-list-pagination";
import type {
  MessageTopic,
  ProgramOption,
  SessionSeriesOption,
  StudentOption,
  WhatsAppCampaignOverview,
} from "@/lib/types";
import { getMessageTopicLabel } from "@/lib/message-topics";
import { WHATSAPP_SEGMENTS, WHATSAPP_STATUS_LABELS } from "@/lib/whatsapp";

const initialState: CommunicationActionState = {
  error: null,
  success: null,
  manualWebWhatsAppHref: null,
};

function formatSegmentLabel(value: string) {
  return WHATSAPP_SEGMENTS.find((item) => item.value === value)?.label ?? value;
}

function formatCampaignStatus(value: string) {
  if (value === "completed") {
    return "Tamamlandi";
  }

  if (value === "processing") {
    return "Isleniyor";
  }

  if (value === "failed") {
    return "Basarisiz";
  }

  return "Kuyrukta";
}

function TopicEditor({
  topic,
}: {
  topic: MessageTopic;
}) {
  const [state, formAction] = useActionState(updateManagerMessageTopicAction, initialState);

  return (
    <form action={formAction} className="surface-muted grid gap-3 rounded-[1.2rem] border border-white/50 p-4">
      <input type="hidden" name="topicId" value={topic.id} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">
            {topic.title || getMessageTopicLabel(topic.topicKey)}
          </div>
          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {topic.topicKey}
          </div>
        </div>
        <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {topic.active ? "Etkin" : "Kapali"}
        </div>
      </div>

      <Input name="title" defaultValue={topic.title} placeholder="Baslik" />
      <Input name="description" defaultValue={topic.description} placeholder="Kisa aciklama" />
      <Select name="channel" defaultValue={topic.channel}>
        <option value="whatsapp">WhatsApp</option>
        <option value="panel">Panel</option>
        <option value="both">Her ikisi</option>
      </Select>
      <textarea
        name="bodyTemplate"
        defaultValue={topic.bodyTemplate}
        className="min-h-32 rounded-[1.1rem] border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
      />
      <Select name="active" defaultValue={topic.active ? "yes" : "no"}>
        <option value="yes">Etkin</option>
        <option value="no">Kapali</option>
      </Select>
      <div className="rounded-[1rem] bg-white/80 px-3 py-2 text-xs text-muted-foreground">
        Degiskenler:{" "}
        {topic.availableVariables.length
          ? topic.availableVariables.map((item) => `{{${item}}}`).join(", ")
          : "-"}
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton pendingLabel="Kaydediliyor...">Sablonu kaydet</FormSubmitButton>
    </form>
  );
}

export function WhatsAppCampaignPanel({
  overview,
  programOptions,
  branchOptions,
  sessionSeriesOptions,
  studentOptions,
}: {
  overview: WhatsAppCampaignOverview | null;
  programOptions: ProgramOption[];
  branchOptions: Array<{ id: string; label: string }>;
  sessionSeriesOptions: SessionSeriesOption[];
  studentOptions: StudentOption[];
}) {
  const [state, formAction] = useActionState(createWhatsAppCampaignAction, initialState);
  const editableTopics = useMemo(
    () => (overview?.messageTopics ?? []).filter((topic) => topic.editableByManager),
    [overview?.messageTopics],
  );
  const [topicKey, setTopicKey] = useState<string>(editableTopics[0]?.topicKey ?? "bulk_broadcast");
  const [audienceType, setAudienceType] = useState<string>("all_parents");
  const [programId, setProgramId] = useState("");
  const [sendMode, setSendMode] = useState<"meta" | "web">("meta");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [messageDraft, setMessageDraft] = useState(editableTopics[0]?.bodyTemplate ?? "");
  const campaignRows = useMemo(() => overview?.campaigns ?? [], [overview?.campaigns]);
  const dispatchRows = useMemo(() => overview?.dispatches ?? [], [overview?.dispatches]);
  const dispatchSummary = useMemo(() => {
    const dispatches = dispatchRows;
    return {
      total: dispatches.length,
      sent: dispatches.filter((item) => item.status === "sent" || item.status === "delivered" || item.status === "read").length,
      delivered: dispatches.filter((item) => item.status === "delivered" || item.status === "read").length,
      failed: dispatches.filter((item) => item.status === "failed" || item.status === "blocked").length,
      queued: dispatches.filter((item) => item.status === "queued" || item.status === "processing").length,
    };
  }, [dispatchRows]);
  const campaignSummary = useMemo(() => {
    const campaigns = campaignRows;
    return {
      total: campaigns.length,
      completed: campaigns.filter((item) => item.status === "completed").length,
      queued: campaigns.filter((item) => item.status === "queued" || item.status === "processing").length,
      failed: campaigns.filter((item) => item.status === "failed").length,
    };
  }, [campaignRows]);
  const paginatedCampaigns = useListPagination({
    items: campaignRows,
    pageSize: 6,
    resetKey: `campaigns:${campaignRows.length}`,
  });
  const paginatedDispatches = useListPagination({
    items: dispatchRows,
    pageSize: 6,
    resetKey: `dispatches:${dispatchRows.length}`,
  });

  const selectedTopic = useMemo(
    () => (overview?.messageTopics ?? []).find((topic) => topic.topicKey === topicKey) ?? null,
    [overview?.messageTopics, topicKey],
  );

  const filteredSeries = useMemo(
    () => sessionSeriesOptions.filter((series) => !programId || series.programId === programId),
    [programId, sessionSeriesOptions],
  );
  const filteredStudents = useMemo(() => {
    return studentOptions.filter((student) => {
      if (!programId) {
        return true;
      }

      return student.programLabel === programOptions.find((program) => program.id === programId)?.title;
    });
  }, [programId, programOptions, studentOptions]);

  function toggleStudent(studentId: string) {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((value) => value !== studentId)
        : [...current, studentId],
    );
  }

  const webModeRequiresSingleStudent =
    sendMode === "web" && (audienceType !== "specific_students" || selectedStudentIds.length !== 1);

  return (
    <div className="grid gap-6">
      <form action={formAction} className="grid gap-4 rounded-[1.5rem] border border-indigo-100 bg-white/80 p-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="title">
            Kampanya basligi
          </label>
          <Input id="title" name="title" placeholder="Nisan aidat hatirlatmasi" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="topicKey">
              Konu sablonu
            </label>
            <Select
              id="topicKey"
              name="topicKey"
              value={topicKey}
              onChange={(event) => {
                const nextTopicKey = event.target.value;
                setTopicKey(nextTopicKey);
                const nextTopic = (overview?.messageTopics ?? []).find(
                  (topic) => topic.topicKey === nextTopicKey,
                );
                setMessageDraft(nextTopic?.bodyTemplate ?? "");
              }}
            >
              {editableTopics.map((topic) => (
                <option key={topic.id} value={topic.topicKey}>
                  {topic.title || getMessageTopicLabel(topic.topicKey)}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="audienceType">
              Hedef segment
            </label>
            <Select
              id="audienceType"
              name="audienceType"
              value={audienceType}
              onChange={(event) => {
                const nextAudience = event.target.value;
                setAudienceType(nextAudience);
                if (nextAudience !== "specific_students") {
                  setSelectedStudentIds([]);
                }
              }}
            >
              {WHATSAPP_SEGMENTS.map((segment) => (
                <option key={segment.value} value={segment.value}>
                  {segment.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="programId">
              Program filtresi
            </label>
            <Select
              id="programId"
              name="programId"
              value={programId}
              onChange={(event) => setProgramId(event.target.value)}
            >
              <option value="">Tum programlar</option>
              {programOptions.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="branchId">
              Sube filtresi
            </label>
            <Select id="branchId" name="branchId" defaultValue="">
              <option value="">Tum subeler</option>
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="sendMode">
              Gonderim bicimi
            </label>
            <Select
              id="sendMode"
              name="sendMode"
              value={sendMode}
              onChange={(event) => {
                const nextMode = event.target.value === "web" ? "web" : "meta";
                setSendMode(nextMode);
                if (nextMode === "web") {
                  setAudienceType("specific_students");
                }
              }}
            >
              <option value="meta">Meta otomatik</option>
              <option value="web">Web WhatsApp fallback</option>
            </Select>
          </div>
        </div>

        {audienceType === "session_series_members" ? (
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="sessionSeriesId">
              Grup secimi
            </label>
            <Select id="sessionSeriesId" name="sessionSeriesId" defaultValue="">
              <option value="">Grup sec</option>
              {filteredSeries.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {audienceType === "specific_students" ? (
          <div className="grid gap-3 rounded-[1.2rem] border border-white/60 bg-indigo-50/60 p-4">
            <div className="text-sm font-semibold text-foreground">Ozel secili uyeler</div>
            <div className="grid max-h-48 gap-2 overflow-y-auto pr-1">
              {filteredStudents.length ? (
                filteredStudents.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-start gap-3 rounded-[1rem] border border-white/70 bg-white/80 px-3 py-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="studentIds"
                      value={student.id}
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="mt-1"
                    />
                    <span className="grid gap-1">
                      <span className="font-medium text-foreground">{student.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {[student.programLabel, student.sessionSeriesLabel].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </label>
                ))
              ) : (
                <div className="rounded-[1rem] bg-white/70 px-3 py-3 text-sm text-muted-foreground">
                  Secili filtrelere uyan uye bulunamadi.
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Web WhatsApp fallback yalnizca tek secili uye ile calisir.
            </div>
          </div>
        ) : null}

        {sendMode === "web" ? (
          <div className="rounded-[1.1rem] border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
            Web WhatsApp fallback su an yalnizca tek secili uye icin kullanilabilir. Sistemi toplu
            gonderimde kullanmak istersen `Meta otomatik` secili olmali.
          </div>
        ) : null}

        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="message">
            Mesaj onizlemesi
          </label>
          <textarea
            id="message"
            name="message"
            value={messageDraft}
            onChange={(event) => setMessageDraft(event.target.value)}
            className="min-h-32 rounded-[1.1rem] border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            placeholder="Mesaj metni"
          />
          {selectedTopic ? (
            <div className="rounded-[1rem] bg-white/80 px-3 py-2 text-xs text-muted-foreground">
              Degiskenler:{" "}
              {selectedTopic.availableVariables.length
                ? selectedTopic.availableVariables.map((item) => `{{${item}}}`).join(", ")
                : "-"}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="managerNote">
            Opsiyonel yonetici notu
          </label>
          <Input id="managerNote" name="managerNote" placeholder="Mesaj sonuna eklenecek kisa not" />
        </div>

        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

        {webModeRequiresSingleStudent ? (
          <p className="text-sm text-amber-700">
            Devam etmek icin `Ozel secili uyeler` segmentinde tam olarak 1 uye sec.
          </p>
        ) : null}

        {state.manualWebWhatsAppHref ? (
          <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="text-sm text-emerald-900">
              Tekil gonderim icin Web WhatsApp hazirlandi.
            </div>
            <div className="mt-3">
              <Button asChild>
                <a href={state.manualWebWhatsAppHref} target="_blank" rel="noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                  Web WhatsApp&apos;i ac
                </a>
              </Button>
            </div>
          </div>
        ) : null}

        <FormSubmitButton pendingLabel="Kampanya olusturuluyor..." disabled={webModeRequiresSingleStudent}>
          Mesaj gonderimini baslat
        </FormSubmitButton>
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-muted rounded-[1.2rem] border border-white/50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Kampanya</div>
          <div className="mt-3 text-3xl font-black text-foreground">{campaignSummary.total}</div>
          <div className="mt-1 text-sm text-muted-foreground">{campaignSummary.completed} tamamlandi</div>
        </div>
        <div className="surface-muted rounded-[1.2rem] border border-white/50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Dispatch</div>
          <div className="mt-3 text-3xl font-black text-foreground">{dispatchSummary.total}</div>
          <div className="mt-1 text-sm text-muted-foreground">{dispatchSummary.queued} kuyrukta</div>
        </div>
        <div className="surface-muted rounded-[1.2rem] border border-white/50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ulasan</div>
          <div className="mt-3 text-3xl font-black text-foreground">{dispatchSummary.delivered}</div>
          <div className="mt-1 text-sm text-muted-foreground">{dispatchSummary.sent} gonderilen kayit</div>
        </div>
        <div className="surface-muted rounded-[1.2rem] border border-white/50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hata</div>
          <div className="mt-3 text-3xl font-black text-foreground">{dispatchSummary.failed}</div>
          <div className="mt-1 text-sm text-muted-foreground">{campaignSummary.failed} basarisiz kampanya</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-3">
          <div className="text-sm font-semibold text-foreground">Kampanya gecmisi</div>
          {campaignRows.length ? (
            <>
              {paginatedCampaigns.pageItems.map((campaign) => (
                <div key={campaign.id} className="surface-muted rounded-[1.2rem] border border-white/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{campaign.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {campaign.topicKey ? getMessageTopicLabel(campaign.topicKey) : "Konu yok"}
                      </div>
                    </div>
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {formatCampaignStatus(campaign.status)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{formatSegmentLabel(campaign.audienceType)}</div>
                </div>
              ))}
              <PaginationControls
                itemLabel="kampanya"
                onPageChange={paginatedCampaigns.setPage}
                page={paginatedCampaigns.page}
                pageCount={paginatedCampaigns.pageCount}
                pageSize={paginatedCampaigns.pageSize}
                totalItems={paginatedCampaigns.totalItems}
              />
            </>
          ) : (
            <div className="surface-muted rounded-[1.2rem] border border-white/50 p-4 text-sm text-muted-foreground">
              Henuz WhatsApp kampanyasi olusturulmadi.
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <div className="text-sm font-semibold text-foreground">Dispatch gecmisi</div>
          {dispatchRows.length ? (
            <>
              {paginatedDispatches.pageItems.map((dispatch) => (
                <div key={dispatch.id} className="surface-muted rounded-[1.2rem] border border-white/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">{dispatch.recipientName}</div>
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {WHATSAPP_STATUS_LABELS[dispatch.status]}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{dispatch.recipientPhone}</div>
                  {dispatch.lastError ? (
                    <div className="mt-3 rounded-[1rem] bg-destructive/8 px-3 py-2 text-sm text-destructive">
                      {dispatch.lastError}
                    </div>
                  ) : null}
                </div>
              ))}
              <PaginationControls
                itemLabel="dispatch"
                onPageChange={paginatedDispatches.setPage}
                page={paginatedDispatches.page}
                pageCount={paginatedDispatches.pageCount}
                pageSize={paginatedDispatches.pageSize}
                totalItems={paginatedDispatches.totalItems}
              />
            </>
          ) : (
            <div className="surface-muted rounded-[1.2rem] border border-white/50 p-4 text-sm text-muted-foreground">
              Henuz dispatch gecmisi olusmadi.
            </div>
          )}
        </div>
      </div>

      {editableTopics.length ? (
        <div className="grid gap-4">
          <div className="text-sm font-semibold text-foreground">Operasyonel mesaj sablonlari</div>
          <div className="grid gap-4 xl:grid-cols-2">
            {editableTopics.map((topic) => (
              <TopicEditor key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
