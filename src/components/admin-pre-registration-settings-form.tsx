/* eslint-disable @next/next/no-img-element */

"use client";

import { useActionState, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { ImagePlus, LoaderCircle, Scale, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

import {
  savePreRegistrationSettingsAction,
  type PreRegistrationSettingsActionState,
} from "@/app/(app)/admin/pre-registration-settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PreRegistrationSettings } from "@/lib/types";

const initialState: PreRegistrationSettingsActionState = {
  error: null,
  success: null,
};

type FormMode = "appearance" | "legal";

type UploadState = {
  pending: boolean;
  error: string | null;
  url: string;
  path: string;
};

export function AdminPreRegistrationSettingsForm({
  settings,
  mode,
}: {
  settings: PreRegistrationSettings;
  mode: FormMode;
}) {
  const [state, formAction] = useActionState(savePreRegistrationSettingsAction, initialState);
  const [logoState, setLogoState] = useState<UploadState>({
    pending: false,
    error: null,
    url: settings.formLogoUrl,
    path: settings.formLogoPath,
  });

  const isAppearance = mode === "appearance";
  const logoPreview = logoState.url || settings.formLogoUrl;
  const currentLogoPath = logoState.path || settings.formLogoPath;

  const hiddenSettings = useMemo(
    () => ({
      formEnabled: settings.formEnabled ? "enabled" : "disabled",
      formEyebrow: settings.formEyebrow,
      formTitle: settings.formTitle,
      formDescription: settings.formDescription,
      formLogoUrl: logoPreview,
      formLogoPath: currentLogoPath,
      kvkkTitle: settings.kvkkTitle,
      kvkkBody: settings.kvkkBody,
      kvkkCheckboxLabel: settings.kvkkCheckboxLabel,
      parentPermissionTitle: settings.parentPermissionTitle,
      parentPermissionBody: settings.parentPermissionBody,
      parentPermissionCheckboxLabel: settings.parentPermissionCheckboxLabel,
      successMessage: settings.successMessage,
      helperNote: settings.helperNote,
    }),
    [currentLogoPath, logoPreview, settings],
  );

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setLogoState((current) => ({
      ...current,
      pending: true,
      error: null,
    }));

    const requestFormData = new FormData();
    requestFormData.append("file", file);
    requestFormData.append("field", "form-logo");

    try {
      const response = await fetch("/api/pre-registration-assets", {
        method: "POST",
        body: requestFormData,
      });

      const result = (await response.json().catch(() => null)) as { error?: string; url?: string; path?: string } | null;

      if (!response.ok || !result?.url || !result.path) {
        setLogoState((current) => ({
          ...current,
          pending: false,
          error: result?.error ?? "Form logosu yuklenemedi.",
        }));
        return;
      }

      setLogoState({
        pending: false,
        error: null,
        url: result.url,
        path: result.path,
      });
    } catch {
      setLogoState((current) => ({
        ...current,
        pending: false,
        error: "Logo yuklenirken baglanti hatasi olustu.",
      }));
    }
  }

  return (
    <form action={formAction} className="grid gap-6">
      {isAppearance ? (
        <>
          <HiddenFields
            values={{
              kvkkTitle: settings.kvkkTitle,
              kvkkBody: settings.kvkkBody,
              kvkkCheckboxLabel: settings.kvkkCheckboxLabel,
              parentPermissionTitle: settings.parentPermissionTitle,
              parentPermissionBody: settings.parentPermissionBody,
              parentPermissionCheckboxLabel: settings.parentPermissionCheckboxLabel,
            }}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Form durumu" htmlFor="formEnabled">
              <Select id="formEnabled" name="formEnabled" defaultValue={settings.formEnabled ? "enabled" : "disabled"}>
                <option value="enabled">Acik</option>
                <option value="disabled">Kapali</option>
              </Select>
            </Field>
            <Field label="Basari mesaji" htmlFor="successMessage">
              <Input id="successMessage" name="successMessage" defaultValue={settings.successMessage} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4">
              <Field label="Form etiketi" htmlFor="formEyebrow">
                <Input id="formEyebrow" name="formEyebrow" defaultValue={settings.formEyebrow} />
              </Field>
              <Field label="Form basligi" htmlFor="formTitle">
                <Textarea id="formTitle" name="formTitle" defaultValue={settings.formTitle} className="min-h-24" />
              </Field>
              <Field label="Form aciklamasi" htmlFor="formDescription">
                <Textarea
                  id="formDescription"
                  name="formDescription"
                  defaultValue={settings.formDescription}
                  className="min-h-32"
                />
              </Field>
              <Field label="Bilgilendirme notu" htmlFor="helperNote">
                <Textarea id="helperNote" name="helperNote" defaultValue={settings.helperNote} className="min-h-24" />
              </Field>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-2 text-sky-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Form logosu</div>
                  <div className="text-xs text-slate-500">Modalin ustunde gorunur.</div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white p-4">
                <div className="flex min-h-48 items-center justify-center rounded-[1.2rem] bg-[radial-gradient(circle_at_top,#17305d,transparent_55%),linear-gradient(180deg,#091224_0%,#0f1a31_100%)] p-4">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Form logosu"
                      className="max-h-28 w-auto rounded-2xl object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center text-slate-200">
                      <div className="rounded-full bg-white/10 p-4">
                        {logoState.pending ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                      </div>
                      <div className="text-sm font-medium">Henuz logo yuklenmedi</div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                    {logoState.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    Logo yukle
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={handleLogoChange}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() =>
                      setLogoState({
                        pending: false,
                        error: null,
                        url: "",
                        path: "",
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    Logoyu kaldir
                  </Button>
                </div>
                <input type="hidden" name="formLogoUrl" value={logoPreview} />
                <input type="hidden" name="formLogoPath" value={currentLogoPath} />
                {logoState.error ? <p className="mt-3 text-sm text-rose-600">{logoState.error}</p> : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <HiddenFields
            values={{
              formEnabled: hiddenSettings.formEnabled,
              formEyebrow: hiddenSettings.formEyebrow,
              formTitle: hiddenSettings.formTitle,
              formDescription: hiddenSettings.formDescription,
              formLogoUrl: hiddenSettings.formLogoUrl,
              formLogoPath: hiddenSettings.formLogoPath,
              successMessage: hiddenSettings.successMessage,
              helperNote: hiddenSettings.helperNote,
            }}
          />

          <div className="grid gap-6">
            <SectionCard
              title="KVKK metni"
              description="Formdaki aydinlatma metni ve checkbox etiketi."
              icon={<ShieldCheck className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="KVKK basligi" htmlFor="kvkkTitle">
                  <Input id="kvkkTitle" name="kvkkTitle" defaultValue={settings.kvkkTitle} />
                </Field>
                <Field label="KVKK checkbox metni" htmlFor="kvkkCheckboxLabel">
                  <Input id="kvkkCheckboxLabel" name="kvkkCheckboxLabel" defaultValue={settings.kvkkCheckboxLabel} />
                </Field>
              </div>
              <Field label="KVKK metni" htmlFor="kvkkBody">
                <Textarea id="kvkkBody" name="kvkkBody" defaultValue={settings.kvkkBody} className="min-h-40" />
              </Field>
            </SectionCard>

            <SectionCard
              title="Veli izin metni"
              description="Veli onay kutusu ve acilan yasal metin."
              icon={<Scale className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Veli izin basligi" htmlFor="parentPermissionTitle">
                  <Input id="parentPermissionTitle" name="parentPermissionTitle" defaultValue={settings.parentPermissionTitle} />
                </Field>
                <Field label="Veli izin checkbox metni" htmlFor="parentPermissionCheckboxLabel">
                  <Input
                    id="parentPermissionCheckboxLabel"
                    name="parentPermissionCheckboxLabel"
                    defaultValue={settings.parentPermissionCheckboxLabel}
                  />
                </Field>
              </div>
              <Field label="Veli izin metni" htmlFor="parentPermissionBody">
                <Textarea
                  id="parentPermissionBody"
                  name="parentPermissionBody"
                  defaultValue={settings.parentPermissionBody}
                  className="min-h-40"
                />
              </Field>
            </SectionCard>
          </div>
        </>
      )}

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <FormSubmitButton className="w-full md:w-auto" pendingLabel="On kayit ayarlari kaydediliyor...">
        {isAppearance ? "Form gorunumunu kaydet" : "Yasal metinleri kaydet"}
      </FormSubmitButton>
    </form>
  );
}

function HiddenFields({ values }: { values: Record<string, string> }) {
  return (
    <>
      {Object.entries(values).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </>
  );
}

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50/70 p-5">
      <div className="mb-5 flex items-start gap-4">
        <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">{icon}</div>
        <div>
          <div className="text-lg font-semibold text-slate-900">{title}</div>
          <div className="text-sm text-slate-500">{description}</div>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2" htmlFor={htmlFor}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
