"use client";

import { useActionState, useMemo, useState } from "react";

import {
  createStudentAction,
  type ActionState,
} from "@/app/(app)/manager/students/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProgramRecord, SessionSeriesOption } from "@/lib/types";

const initialState: ActionState = {
  error: null,
  success: null,
};

const today = new Date().toISOString().slice(0, 10);

export function StudentCreateForm({
  programs,
  sessionSeriesOptions,
}: {
  programs: ProgramRecord[];
  sessionSeriesOptions: SessionSeriesOption[];
}) {
  const [state, formAction] = useActionState(createStudentAction, initialState);
  const [programId, setProgramId] = useState("");

  const filteredSeries = useMemo(
    () => sessionSeriesOptions.filter((series) => series.programId === programId),
    [programId, sessionSeriesOptions],
  );

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
        <label className="text-sm font-medium text-foreground" htmlFor="programId">
          Program
        </label>
        <Select
          id="programId"
          name="programId"
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
        >
          <option value="" disabled>
            Program sec
          </option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.title}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="sessionSeriesId">
          Grup / seans serisi
        </label>
        <Select id="sessionSeriesId" name="sessionSeriesId" defaultValue="" disabled={!programId}>
          <option value="" disabled>
            {programId ? "Grup sec" : "Once program sec"}
          </option>
          {filteredSeries.map((series) => (
            <option key={series.id} value={series.id}>
              {series.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="startsOn">
          Kayit tarihi
        </label>
        <Input id="startsOn" name="startsOn" type="date" defaultValue={today} />
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
