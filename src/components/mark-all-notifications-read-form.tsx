"use client";

import { useActionState } from "react";

import {
  markAllParentNotificationsReadAction,
  type ParentNotificationActionState,
} from "@/app/(app)/parent/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

const initialState: ParentNotificationActionState = {
  error: null,
  success: null,
};

export function MarkAllNotificationsReadForm() {
  const [state, formAction] = useActionState(
    markAllParentNotificationsReadAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="scope" value="all" />
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton variant="outline" size="sm" pendingLabel="Guncelleniyor...">
        Hepsini okundu yap
      </FormSubmitButton>
    </form>
  );
}
