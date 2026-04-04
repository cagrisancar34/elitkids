"use client";

import { useActionState } from "react";

import {
  createManualPaymentAction,
  type FinanceActionState,
} from "@/app/(app)/manager/finance/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ChargeOption } from "@/lib/types";

const initialState: FinanceActionState = {
  error: null,
  success: null,
};

export function ManualPaymentForm({ charges }: { charges: ChargeOption[] }) {
  const [state, formAction] = useActionState(createManualPaymentAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="chargeId">
          Tahakkuk
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
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="amount">
          Tahsil edilen tutar
        </label>
        <Input id="amount" name="amount" type="number" min="1" step="1" placeholder="3250" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Odeme kaydi isleniyor...">
        Manuel odeme kaydi ekle
      </FormSubmitButton>
    </form>
  );
}
