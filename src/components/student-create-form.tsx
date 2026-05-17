"use client";

import { useActionState, useMemo, useState } from "react";
import { ExternalLink, Link2, MessageCircleMore, TriangleAlert } from "lucide-react";

import {
  createStudentAction,
  type ActionState,
} from "@/app/(app)/manager/students/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProgramRecord, SessionSeriesOption } from "@/lib/types";

const initialState: ActionState = {
  error: null,
  success: null,
};

const today = new Date().toISOString().slice(0, 10);

export function StudentCreateForm({
  programs,
  sessionSeriesOptions,
}: {
  programs: ProgramRecord[];
  sessionSeriesOptions: SessionSeriesOption[];
}) {
  const [state, formAction] = useActionState(createStudentAction, initialState);
  const [programId, setProgramId] = useState("");

  const filteredSeries = useMemo(
    () => sessionSeriesOptions.filter((series) => series.programId === programId),
    [programId, sessionSeriesOptions],
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="fullName">
          Ogrenci adi
        </label>
        <Input id="fullName" name="fullName" placeholder="Ogrenci adi soyadi" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="birthDate">
          Dogum tarihi
        </label>
        <Input id="birthDate" name="birthDate" type="date" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="gender">
          Cinsiyet
        </label>
        <Select id="gender" name="gender" defaultValue="">
          <option value="" disabled>
            Cinsiyet sec
          </option>
          <option value="male">Erkek</option>
          <option value="female">Kadin</option>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="programId">
          Program
        </label>
        <Select
          id="programId"
          name="programId"
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
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
        <label className="text-sm font-medium text-foreground" htmlFor="sessionSeriesId">
          Grup / seans serisi
        </label>
        <Select id="sessionSeriesId" name="sessionSeriesId" defaultValue="" disabled={!programId}>
          <option value="" disabled>
            {programId ? "Grup sec" : "Once program sec"}
          </option>
          {filteredSeries.map((series) => (
            <option key={series.id} value={series.id}>
              {series.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="startsOn">
          Kayit tarihi
        </label>
        <Input id="startsOn" name="startsOn" type="date" defaultValue={today} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="parentEmail">
          Veli e-postasi
        </label>
        <Input
          id="parentEmail"
          name="parentEmail"
          type="email"
          placeholder="Mevcut veli hesabi e-postasi"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="parentWhatsapp">
          Veli WhatsApp
        </label>
        <Input
          id="parentWhatsapp"
          name="parentWhatsapp"
          type="tel"
          placeholder="05XX XXX XX XX"
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      {state.registrationResult ? (
        <div className="grid gap-4 rounded-[1.2rem] border border-emerald-200/60 bg-emerald-50/60 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
            Veli mesaji ve panel erisimi
          </div>

          {state.registrationResult.warning ? (
            <div className="rounded-[1rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{state.registrationResult.warning}</span>
              </div>
            </div>
          ) : null}

          <div className="grid gap-2 text-sm text-foreground">
            <InfoRow label="Ilk ders" value={state.registrationResult.firstLessonLabel ?? "Henuz uretilemedi"} />
            <InfoRow label="Panel giris" value={state.registrationResult.loginUrl} />
            <InfoRow label="Gecici sifre" value={state.registrationResult.temporaryPassword ?? "Mevcut sifre korunuyor"} />
            <InfoRow
              label="Otomatik gonderim"
              value={
                state.registrationResult.autoDispatchStatus === "queued"
                  ? "Kuyruga alindi"
                  : state.registrationResult.autoDispatchStatus === "failed"
                    ? "Basarisiz"
                    : "Atlandi"
              }
            />
          </div>

          <Textarea
            readOnly
            value={state.registrationResult.messagePreview ?? "Mesaj onizlemesi hazirlanamadi."}
            className="min-h-36 bg-white"
          />

          <div className="flex flex-wrap gap-3">
            {state.registrationResult.webWhatsAppHref ? (
              <Button asChild>
                <a href={state.registrationResult.webWhatsAppHref} target="_blank" rel="noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                  WhatsApp ile gonder
                </a>
              </Button>
            ) : null}
            {state.registrationResult.temporaryPassword ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(state.registrationResult?.temporaryPassword ?? "")}
              >
                <Link2 className="h-4 w-4" />
                Gecici sifreyi kopyala
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <a href={state.registrationResult.loginUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Giris sayfasini ac
              </a>
            </Button>
          </div>
        </div>
      ) : null}

      <FormSubmitButton className="w-full" pendingLabel="Ogrenci olusturuluyor...">
        Ogrenci kaydini ac
      </FormSubmitButton>
    </form>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div>{value}</div>
    </div>
  );
}
