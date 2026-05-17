"use client";

import { useActionState } from "react";

import type { AuthFlowState } from "@/app/(auth)/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";

const initialState: AuthFlowState = {
  error: null,
  success: null,
};

export function AuthEmailActionForm({
  action,
  submitLabel,
  description,
}: {
  action: (
    previousState: AuthFlowState,
    formData: FormData,
  ) => Promise<AuthFlowState>;
  submitLabel: string;
  description?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          E-posta
        </label>
        <Input id="email" name="email" type="email" placeholder="ornek@elitsanatvesporkulubu.com" required />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton pendingLabel="Gonderiliyor...">{submitLabel}</FormSubmitButton>
    </form>
  );
}
