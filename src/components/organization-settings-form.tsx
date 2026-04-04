"use client";

import { useActionState } from "react";

import {
  updateOrganizationSettingsAction,
  type SettingsActionState,
} from "@/app/(app)/admin/settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { OrganizationSettings } from "@/lib/types";

const initialState: SettingsActionState = {
  error: null,
  success: null,
};

export function OrganizationSettingsForm({
  organization,
}: {
  organization: OrganizationSettings;
}) {
  const [state, formAction] = useActionState(updateOrganizationSettingsAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          Kurum adi
        </label>
        <Input id="name" name="name" defaultValue={organization.name} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="slug">
          Slug
        </label>
        <Input id="slug" name="slug" defaultValue={organization.slug} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="locale">
            Locale
          </label>
          <Select id="locale" name="locale" defaultValue={organization.locale}>
            <option value="tr-TR">tr-TR</option>
            <option value="en-US">en-US</option>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="timezone">
            Timezone
          </label>
          <Select id="timezone" name="timezone" defaultValue={organization.timezone}>
            <option value="Europe/Istanbul">Europe/Istanbul</option>
            <option value="Europe/London">Europe/London</option>
            <option value="UTC">UTC</option>
          </Select>
        </div>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Ayarlar kaydediliyor...">
        Kurum ayarlarini kaydet
      </FormSubmitButton>
    </form>
  );
}
