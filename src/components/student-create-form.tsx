"use client";

import { useActionState } from "react";

import {
  createStudentAction,
  type ActionState,
} from "@/app/(app)/manager/students/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const initialState: ActionState = {
  error: null,
  success: null,
};

export function StudentCreateForm({ programs }: { programs: string[] }) {
  const [state, formAction] = useActionState(createStudentAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="fullName">
          Ogrenci adi
        </label>
        <Input id="fullName" name="fullName" placeholder="Ogrenci adi soyadi" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="birthDate">
          Dogum tarihi
        </label>
        <Input id="birthDate" name="birthDate" type="date" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="programTitle">
          Program
        </label>
        <Select id="programTitle" name="programTitle" defaultValue="">
          <option value="" disabled>
            Program sec
          </option>
          {programs.map((program) => (
            <option key={program} value={program}>
              {program}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="parentEmail">
          Veli e-postasi
        </label>
        <Input
          id="parentEmail"
          name="parentEmail"
          type="email"
          placeholder="Mevcut veli hesabi e-postasi"
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Ogrenci olusturuluyor...">
        Ogrenci kaydini ac
      </FormSubmitButton>
    </form>
  );
}
