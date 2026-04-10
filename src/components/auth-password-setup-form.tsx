"use client";

import { useActionState } from "react";

import type { AuthFlowState } from "@/app/(auth)/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";

const initialState: AuthFlowState = {
  error: null,
  success: null,
};

export function AuthPasswordSetupForm({
  action,
  tokenHash,
  type,
}: {
  action: (
    previousState: AuthFlowState,
    formData: FormData,
  ) => Promise<AuthFlowState>;
  tokenHash: string;
  type: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Yeni sifre
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="En az 8 karakter"
          autoComplete="new-password"
          required
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <FormSubmitButton pendingLabel="Kaydediliyor...">Sifreyi guncelle</FormSubmitButton>
    </form>
  );
}
