"use client";

import { useActionState } from "react";

import {
  processWhatsAppQueueAction,
  sendWhatsAppTestAction,
  type SettingsActionState,
  updateMessageTopicAction,
  updateWhatsAppTemplateAction,
} from "@/app/(app)/admin/settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { WhatsAppSettingsOverview } from "@/lib/types";
import { getMessageTopicLabel } from "@/lib/message-topics";
import { WHATSAPP_EVENT_KEYS, WHATSAPP_STATUS_LABELS } from "@/lib/whatsapp";

const initialState: SettingsActionState = {
  error: null,
  success: null,
};

function labelizeEventKey(value: string) {
  return value
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function TemplateForm({
  templateId,
  eventKey,
  metaTemplateName,
  enabled,
}: {
  templateId: string;
  eventKey: string;
  metaTemplateName: string;
  enabled: boolean;
}) {
  const [state, formAction] = useActionState(updateWhatsAppTemplateAction, initialState);

  return (
    <form action={formAction} className="surface-muted grid gap-3 rounded-[1.25rem] border border-white/50 p-4">
      <input type="hidden" name="templateId" value={templateId} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{labelizeEventKey(eventKey)}</div>
          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{eventKey}</div>
        </div>
        <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {enabled ? "Etkin" : "Kapali"}
        </div>
      </div>
      <Input name="metaTemplateName" defaultValue={metaTemplateName} placeholder="Meta template adi" />
      <Select name="enabled" defaultValue={enabled ? "yes" : "no"}>
        <option value="yes">Etkin</option>
        <option value="no">Kapali</option>
      </Select>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton pendingLabel="Kaydediliyor...">Template ayarini kaydet</FormSubmitButton>
    </form>
  );
}

function TopicForm({
  topicId,
  title,
  description,
  channel,
  bodyTemplate,
  active,
  availableVariables,
}: {
  topicId: string;
  title: string;
  description: string;
  channel: "whatsapp" | "panel" | "both";
  bodyTemplate: string;
  active: boolean;
  availableVariables: string[];
}) {
  const [state, formAction] = useActionState(updateMessageTopicAction, initialState);

  return (
    <form action={formAction} className="surface-muted grid gap-3 rounded-[1.25rem] border border-white/50 p-4">
      <input type="hidden" name="topicId" value={topicId} />
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {active ? "Etkin" : "Kapali"}
        </div>
      </div>
      <Input name="title" defaultValue={title} placeholder="Konu basligi" />
      <Input name="description" defaultValue={description} placeholder="Kisa aciklama" />
      <Select name="channel" defaultValue={channel}>
        <option value="whatsapp">WhatsApp</option>
        <option value="panel">Panel</option>
        <option value="both">Her ikisi</option>
      </Select>
      <textarea
        name="bodyTemplate"
        defaultValue={bodyTemplate}
        className="min-h-32 rounded-[1.1rem] border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
      />
      <Select name="active" defaultValue={active ? "yes" : "no"}>
        <option value="yes">Etkin</option>
        <option value="no">Kapali</option>
      </Select>
      <div className="rounded-[1rem] bg-white/80 px-3 py-2 text-xs text-muted-foreground">
        Degiskenler: {availableVariables.length ? availableVariables.map((item) => `{{${item}}}`).join(", ") : "-"}
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton pendingLabel="Kaydediliyor...">Mesaj konusunu kaydet</FormSubmitButton>
    </form>
  );
}

export function AdminWhatsAppSettingsPanel({
  overview,
}: {
  overview: WhatsAppSettingsOverview | null;
}) {
  const [queueState, processQueueAction] = useActionState(processWhatsAppQueueAction, initialState);
  const [testState, testAction] = useActionState(sendWhatsAppTestAction, initialState);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Meta baglanti durumu</CardTitle>
          <CardDescription>
            Cloud API secret&apos;lari yalniz server-side tutulur; burada sadece entegrasyon sagligi gorunur.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-3">
            <div className="surface-muted rounded-[1.25rem] border border-white/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Durum</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">
                {overview?.status.configured ? "Meta baglantisi hazir" : "Meta baglantisi eksik"}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {overview?.status.configured
                  ? "Webhook ve template eslesmeleri ile gonderim kuyruğu islenebilir."
                  : `Eksik secret: ${overview?.status.missingKeys.join(", ") || "konfig tanimi yok"}`}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-muted rounded-[1.25rem] border border-white/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Kuyruktaki mesaj</div>
                <div className="mt-3 text-3xl font-semibold text-foreground">{overview?.queueCount ?? 0}</div>
              </div>
              <div className="surface-muted rounded-[1.25rem] border border-white/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Engellenen mesaj</div>
                <div className="mt-3 text-3xl font-semibold text-foreground">{overview?.blockedCount ?? 0}</div>
              </div>
            </div>
          </div>

          <form action={processQueueAction} className="surface-panel grid gap-4 rounded-[1.5rem] border border-white/50 p-5">
            <div>
              <div className="text-sm font-semibold text-foreground">Kuyrugu isle</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Sessiz saat icinde olan ve Meta tarafina hazir dispatch&apos;leri tekrar dener.
              </div>
            </div>
            {queueState.error ? <p className="text-sm text-destructive">{queueState.error}</p> : null}
            {queueState.success ? <p className="text-sm text-success">{queueState.success}</p> : null}
            <FormSubmitButton pendingLabel="Isleniyor...">Kuyruktaki mesajlari isle</FormSubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template eslesmeleri</CardTitle>
          <CardDescription>Her olay Meta tarafinda onayli template adina baglanir. Template adi yoksa dispatch engellenir.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {(overview?.templates ?? []).map((template) => (
            <TemplateForm
              key={template.id}
              templateId={template.id}
              eventKey={template.eventKey}
              metaTemplateName={template.metaTemplateName}
              enabled={template.enabled}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mesaj konu sablonlari</CardTitle>
          <CardDescription>
            Sistemdeki veli mesaji ve panel bildirimi copy&apos;leri bu merkezden yonetilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {(overview?.messageTopics ?? []).map((topic) => (
            <TopicForm
              key={topic.id}
              topicId={topic.id}
              title={topic.title || getMessageTopicLabel(topic.topicKey)}
              description={topic.description}
              channel={topic.channel}
              bodyTemplate={topic.bodyTemplate}
              active={topic.active}
              availableVariables={topic.availableVariables}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test gonderimi</CardTitle>
          <CardDescription>Canli template akisini dogrulamak icin secili olay anahtarina gore test dispatch olustur.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_360px]">
          <form action={testAction} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="phone">
                Test numarasi
              </label>
              <Input id="phone" name="phone" placeholder="+90 5xx xxx xx xx" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="eventKey">
                Olay anahtari
              </label>
              <Select id="eventKey" name="eventKey" defaultValue="bulk_broadcast">
                {WHATSAPP_EVENT_KEYS.map((eventKey) => (
                  <option key={eventKey} value={eventKey}>
                    {labelizeEventKey(eventKey)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="message">
                Test mesaj notu
              </label>
              <Input id="message" name="message" placeholder="Opsiyonel test notu" />
            </div>
            {testState.error ? <p className="text-sm text-destructive">{testState.error}</p> : null}
            {testState.success ? <p className="text-sm text-success">{testState.success}</p> : null}
            <FormSubmitButton pendingLabel="Dispatch olusturuluyor...">Test dispatch olustur</FormSubmitButton>
          </form>

          <div className="grid gap-3">
            {(overview?.dispatches ?? []).length ? (
              overview?.dispatches.map((dispatch) => (
                <div key={dispatch.id} className="surface-muted rounded-[1.25rem] border border-white/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">{dispatch.recipientName}</div>
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {WHATSAPP_STATUS_LABELS[dispatch.status]}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{dispatch.recipientPhone}</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {labelizeEventKey(dispatch.eventKey)}
                  </div>
                  {dispatch.lastError ? (
                    <div className="mt-3 rounded-[1rem] bg-destructive/8 px-3 py-2 text-sm text-destructive">
                      {dispatch.lastError}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="surface-muted rounded-[1.25rem] border border-white/50 p-4 text-sm text-muted-foreground">
                Henuz WhatsApp dispatch gecmisi yok.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
