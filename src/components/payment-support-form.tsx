"use client";

import { useActionState } from "react";

import {
  createPaymentSupportAction,
  type ParentPaymentActionState,
} from "@/app/(app)/parent/payments/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ChargeOption } from "@/lib/types";

const initialState: ParentPaymentActionState = {
  error: null,
  success: null,
};

export function PaymentSupportForm({ charges }: { charges: ChargeOption[] }) {
  const [state, formAction] = useActionState(createPaymentSupportAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="chargeId">
          Hangi odeme icin?
        </label>
        <Select id="chargeId" name="chargeId" defaultValue="">
          <option value="" disabled>
            Kalem sec
          </option>
          {charges.map((charge) => (
            <option key={charge.id} value={charge.id}>
              {charge.label} · {charge.amount}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="body">
          Dekont veya not
        </label>
        <Textarea
          id="body"
          name="body"
          placeholder="Odeme yaptiginiz banka, tarih veya dekont aciklamasini yazin..."
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Teyit gonderiliyor...">
        Odeme teyidi gonder
      </FormSubmitButton>
    </form>
  );
}
