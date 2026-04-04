"use client";

import { useActionState } from "react";

import {
  createSupportThreadAction,
  type SupportActionState,
} from "@/app/(app)/parent/support/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: SupportActionState = {
  error: null,
  success: null,
};

export function SupportThreadForm() {
  const [state, formAction] = useActionState(createSupportThreadAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="subject">
          Konu
        </label>
        <Input id="subject" name="subject" placeholder="Talep konusu" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="body">
          Aciklama
        </label>
        <Textarea id="body" name="body" placeholder="Ihtiyacinizi kisa ve net anlatin..." />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Talep gonderiliyor...">
        Talep gonder
      </FormSubmitButton>
    </form>
  );
}
