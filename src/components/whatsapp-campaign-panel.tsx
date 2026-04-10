"use client";

import { useActionState } from "react";

import {
  createWhatsAppCampaignAction,
  type CommunicationActionState,
} from "@/app/(app)/manager/communication/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProgramOption, WhatsAppCampaignOverview } from "@/lib/types";
import { WHATSAPP_SEGMENTS, WHATSAPP_STATUS_LABELS } from "@/lib/whatsapp";

const initialState: CommunicationActionState = {
  error: null,
  success: null,
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

export function WhatsAppCampaignPanel({
  overview,
  programOptions,
  branchOptions,
}: {
  overview: WhatsAppCampaignOverview | null;
  programOptions: ProgramOption[];
  branchOptions: Array<{ id: string; label: string }>;
}) {
  const [state, formAction] = useActionState(createWhatsAppCampaignAction, initialState);

  return (
    <div className="grid gap-4">
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="title">
            Kampanya basligi
          </label>
          <Input id="title" name="title" placeholder="Nisan aidat hatirlatmasi" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="audienceType">
              Hedef segment
            </label>
            <Select id="audienceType" name="audienceType" defaultValue="all_parents">
              {WHATSAPP_SEGMENTS.map((segment) => (
                <option key={segment.value} value={segment.value}>
                  {segment.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="programId">
              Program filtresi
            </label>
            <Select id="programId" name="programId" defaultValue="">
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
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="message">
            Template icerigi / kampanya metni
          </label>
          <textarea
            id="message"
            name="message"
            className="min-h-32 rounded-[1.1rem] border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            placeholder="Merhaba, bu hafta aidat kontrolu ve devam durumu icin panelinizi kontrol etmeyi unutmayin."
          />
        </div>

        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
        <FormSubmitButton pendingLabel="Kampanya olusturuluyor...">WhatsApp kampanyasi olustur</FormSubmitButton>
      </form>

      <div className="grid gap-3">
        {(overview?.campaigns ?? []).length ? (
          overview?.campaigns.map((campaign) => (
            <div key={campaign.id} className="surface-muted rounded-[1.2rem] border border-white/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-foreground">{campaign.title}</div>
                <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {formatCampaignStatus(campaign.status)}
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{formatSegmentLabel(campaign.audienceType)}</div>
            </div>
          ))
        ) : (
          <div className="surface-muted rounded-[1.2rem] border border-white/50 p-4 text-sm text-muted-foreground">
            Henuz WhatsApp kampanyasi olusturulmadi.
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {(overview?.dispatches ?? []).length ? (
          overview?.dispatches.map((dispatch) => (
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
          ))
        ) : (
          <div className="surface-muted rounded-[1.2rem] border border-white/50 p-4 text-sm text-muted-foreground">
            Henuz dispatch gecmisi olusmadi.
          </div>
        )}
      </div>
    </div>
  );
}
