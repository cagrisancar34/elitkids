"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import {
  savePreRegistrationSettingsAction,
  type PreRegistrationSettingsActionState,
} from "@/app/(app)/admin/pre-registration-settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PreRegistrationSettings } from "@/lib/types";

const initialState: PreRegistrationSettingsActionState = {
  error: null,
  success: null,
};

export function AdminPreRegistrationSettingsForm({
  settings,
}: {
  settings: PreRegistrationSettings;
}) {
  const [state, formAction] = useActionState(savePreRegistrationSettingsAction, initialState);

  return (
    <form action={formAction} className="grid gap-6">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="KVKK basligi" htmlFor="kvkkTitle">
          <Input id="kvkkTitle" name="kvkkTitle" defaultValue={settings.kvkkTitle} />
        </Field>
        <Field label="KVKK checkbox metni" htmlFor="kvkkCheckboxLabel">
          <Input
            id="kvkkCheckboxLabel"
            name="kvkkCheckboxLabel"
            defaultValue={settings.kvkkCheckboxLabel}
          />
        </Field>
      </div>

      <Field label="KVKK metni" htmlFor="kvkkBody">
        <Textarea id="kvkkBody" name="kvkkBody" defaultValue={settings.kvkkBody} className="min-h-40" />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Veli izin basligi" htmlFor="parentPermissionTitle">
          <Input
            id="parentPermissionTitle"
            name="parentPermissionTitle"
            defaultValue={settings.parentPermissionTitle}
          />
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

      <Field label="Yardimci not" htmlFor="helperNote">
        <Textarea id="helperNote" name="helperNote" defaultValue={settings.helperNote} className="min-h-28" />
      </Field>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <FormSubmitButton className="w-full md:w-auto" pendingLabel="On kayit ayarlari kaydediliyor...">
        On kayit metinlerini kaydet
      </FormSubmitButton>
    </form>
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
