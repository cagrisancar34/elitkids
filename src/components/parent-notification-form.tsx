"use client";

import { useActionState } from "react";

import {
  toggleParentNotificationReadAction,
  type ParentNotificationActionState,
} from "@/app/(app)/parent/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { ParentNotification } from "@/lib/types";

const initialState: ParentNotificationActionState = {
  error: null,
  success: null,
};

export function ParentNotificationForm({
  notification,
}: {
  notification: ParentNotification;
}) {
  const [state, formAction] = useActionState(toggleParentNotificationReadAction, initialState);
  const markAsRead = notification.status !== "Okundu";

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="notificationId" value={notification.id} />
      <input type="hidden" name="nextState" value={markAsRead ? "read" : "unread"} />
      <div>
        <div className="font-medium text-foreground">{notification.title}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.body}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span>{notification.channel}</span>
        <span>{notification.status}</span>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton variant="outline" size="sm" pendingLabel="Guncelleniyor...">
        {markAsRead ? "Okundu isaretle" : "Tekrar okunmamis yap"}
      </FormSubmitButton>
    </form>
  );
}
