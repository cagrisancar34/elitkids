"use client";

import { useActionState } from "react";

import {
  createProgramAction,
  type ProgramActionState,
} from "@/app/(app)/manager/programs/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";

const initialState: ProgramActionState = {
  error: null,
  success: null,
};

export function ProgramCreateForm() {
  const [state, formAction] = useActionState(createProgramAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="title">
          Program adi
        </label>
        <Input id="title" name="title" placeholder="Mini Ice / 6-8 Yas" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="ageBand">
          Yas bandi
        </label>
        <Input id="ageBand" name="ageBand" placeholder="6-8 Yas" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="capacity">
            Kontenjan
          </label>
          <Input id="capacity" name="capacity" type="number" min="1" step="1" placeholder="16" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="monthlyPrice">
            Aylik ucret
          </label>
          <Input
            id="monthlyPrice"
            name="monthlyPrice"
            type="number"
            min="1"
            step="1"
            placeholder="4800"
          />
        </div>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Program olusturuluyor...">
        Program olustur
      </FormSubmitButton>
    </form>
  );
}
