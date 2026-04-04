"use client";

import { useActionState } from "react";

import {
  createBranchAction,
  type SettingsActionState,
} from "@/app/(app)/admin/settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";

const initialState: SettingsActionState = {
  error: null,
  success: null,
};

export function BranchCreateForm() {
  const [state, formAction] = useActionState(createBranchAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          Sube adi
        </label>
        <Input id="name" name="name" placeholder="Ana Pist" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="slug">
          Sube slug
        </label>
        <Input id="slug" name="slug" placeholder="ana-pist" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="location">
          Lokasyon
        </label>
        <Input id="location" name="location" placeholder="Zeytinburnu Buz Pisti" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Sube olusturuluyor...">
        Sube olustur
      </FormSubmitButton>
      <p className="text-xs leading-5 text-muted-foreground">
        Silme yerine guvenli arsiv akisi kullanilir; arsivlenen sube kayitlari gecmis referanslari korur.
      </p>
    </form>
  );
}
