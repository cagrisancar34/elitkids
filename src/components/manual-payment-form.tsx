"use client";

import { useActionState } from "react";
import { CalendarDays, CreditCard, Landmark, Wallet } from "lucide-react";

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

type ManualPaymentFormProps = {
  charges: ChargeOption[];
  defaultChargeId?: string;
  heading?: string;
  description?: string;
};

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Nakit", icon: Wallet },
  { value: "transfer", label: "Havale / EFT", icon: Landmark },
  { value: "card", label: "Kart", icon: CreditCard },
  { value: "manual", label: "Diger", icon: CreditCard },
] as const;

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function ManualPaymentForm({
  charges,
  defaultChargeId,
  heading = "Tahsilat kaydi",
  description = "Genel geri odemeyi yansitin, tarih bazli odeme satirini ekleyin ve kalan bakiyeyi ayni tahakkuk icinde takip edin.",
}: ManualPaymentFormProps) {
  const [state, formAction] = useActionState(createManualPaymentAction, initialState);
  const singleCharge = charges.length === 1 ? charges[0] : null;

  return (
    <form action={formAction} className="grid gap-4">
      <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{heading}</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="chargeId">
          Tahakkuk
        </label>
        <Select id="chargeId" name="chargeId" defaultValue={defaultChargeId ?? ""}>
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="amount">
            Tutar
          </label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="1"
            placeholder={singleCharge?.remainingAmountValue ? String(singleCharge.remainingAmountValue) : "5000"}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="paymentMethod">
            Odeme yontemi
          </label>
          <Select id="paymentMethod" name="paymentMethod" defaultValue="transfer">
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="paymentDate">
            Tarih
          </label>
          <div className="relative">
            <Input id="paymentDate" name="paymentDate" type="date" defaultValue={todayValue()} className="pr-10" />
            <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="referenceNo">
            Referans no
          </label>
          <Input id="referenceNo" name="referenceNo" placeholder="Opsiyonel" />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="note">
          Not
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          placeholder="Odeme ile ilgili kisa not"
          className="min-h-[120px] rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Odeme kaydi isleniyor...">
        Odemeyi kaydet
      </FormSubmitButton>
    </form>
  );
}
