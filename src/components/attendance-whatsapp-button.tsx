"use client";

import { useActionState } from "react";

import {
  sendAttendanceWhatsAppAction,
  type AttendanceActionState,
} from "@/app/(app)/coach/sessions/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

const initialState: AttendanceActionState = {
  error: null,
  success: null,
};

export function AttendanceWhatsAppButton({
  sessionId,
  studentId,
  disabled,
}: {
  sessionId: string;
  studentId: string;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(sendAttendanceWhatsAppAction, initialState);

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="studentId" value={studentId} />
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-success">{state.success}</p> : null}
      <FormSubmitButton
        variant="outline"
        size="sm"
        pendingLabel="Gonderiliyor..."
        disabled={disabled}
      >
        Veliye WhatsApp gonder
      </FormSubmitButton>
    </form>
  );
}
