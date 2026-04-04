"use client";

import { useActionState } from "react";

import {
  createSessionAction,
  type SessionActionState,
} from "@/app/(app)/manager/sessions/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CoachOption, ProgramOption } from "@/lib/types";

const initialState: SessionActionState = {
  error: null,
  success: null,
};

export function SessionCreateForm({
  programs,
  coaches,
}: {
  programs: ProgramOption[];
  coaches: CoachOption[];
}) {
  const [state, formAction] = useActionState(createSessionAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="title">
          Seans basligi
        </label>
        <Input id="title" name="title" placeholder="Mini Ice Teknik" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="programId">
          Program
        </label>
        <Select id="programId" name="programId" defaultValue="">
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
        <label className="text-sm font-medium text-foreground" htmlFor="coachId">
          Koc
        </label>
        <Select id="coachId" name="coachId" defaultValue="">
          <option value="" disabled>
            Koc sec
          </option>
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="startsAt">
            Baslangic
          </label>
          <Input id="startsAt" name="startsAt" type="datetime-local" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="endsAt">
            Bitis
          </label>
          <Input id="endsAt" name="endsAt" type="datetime-local" />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="location">
          Alan
        </label>
        <Input id="location" name="location" placeholder="Ana Pist" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Seans olusturuluyor...">
        Seans olustur
      </FormSubmitButton>
    </form>
  );
}
