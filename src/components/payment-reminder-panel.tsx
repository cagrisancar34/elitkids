"use client";

import { useActionState } from "react";

import {
  sendBulkPaymentReminderAction,
  sendPaymentReminderAction,
  type FinanceActionState,
} from "@/app/(app)/manager/finance/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Select } from "@/components/ui/select";
import type { ChargeOption } from "@/lib/types";

const initialState: FinanceActionState = {
  error: null,
  success: null,
};

export function PaymentReminderPanel({ charges }: { charges: ChargeOption[] }) {
  const [singleState, singleAction] = useActionState(sendPaymentReminderAction, initialState);
  const [bulkState, bulkAction] = useActionState(sendBulkPaymentReminderAction, initialState);

  return (
    <div className="grid gap-5">
      <form action={singleAction} className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="chargeId">
            Tekil tahakkuk sec
          </label>
          <Select id="chargeId" name="chargeId" defaultValue="">
            <option value="" disabled>
              Tahakkuk sec
            </option>
            {charges.map((charge) => (
              <option key={charge.id} value={charge.id}>
                {charge.label} · {charge.amount}
              </option>
            ))}
          </Select>
        </div>
        {singleState.error ? <p className="text-sm text-destructive">{singleState.error}</p> : null}
        {singleState.success ? <p className="text-sm text-success">{singleState.success}</p> : null}
        <FormSubmitButton pendingLabel="Kuyruga aliniyor...">Secili veliye hatirlatma gonder</FormSubmitButton>
      </form>

      <div className="h-px bg-border" />

      <form action={bulkAction} className="grid gap-4">
        <input type="hidden" name="scope" value="overdue" />
        <div className="rounded-[1.2rem] bg-accent/70 px-4 py-3 text-sm text-muted-foreground">
          Bugun itibariyla gecikmis ve odemesi kapanmamis ilk 25 tahakkuk icin toplu hatirlatma dispatch&apos;i olusturur.
        </div>
        {bulkState.error ? <p className="text-sm text-destructive">{bulkState.error}</p> : null}
        {bulkState.success ? <p className="text-sm text-success">{bulkState.success}</p> : null}
        <FormSubmitButton pendingLabel="Toplu gonderim hazirlaniyor...">Gecikmis velilere toplu hatirlatma gonder</FormSubmitButton>
      </form>
    </div>
  );
}
