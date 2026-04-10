"use client";

import { useActionState } from "react";

import {
  createProgramAction,
  type ProgramActionState,
} from "@/app/(app)/manager/programs/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { ProgramFormFields } from "@/components/program-form-fields";
import type { ProgramFormOptions } from "@/lib/types";

const initialState: ProgramActionState = {
  error: null,
  success: null,
};

export function ProgramCreateForm({ options }: { options: ProgramFormOptions }) {
  const [state, formAction] = useActionState(createProgramAction, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      <ProgramFormFields options={options} idPrefix="program-create" />
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Program kaydolduktan sonra seans planlama ve ogrenci aktivasyon akislari icin secilebilir hale gelir.
        </p>
        <FormSubmitButton className="min-w-44" pendingLabel="Program olusturuluyor...">
          Kaydet
        </FormSubmitButton>
      </div>
    </form>
  );
}
