"use client";

import { useActionState } from "react";

import {
  saveAttendanceAction,
  type AttendanceActionState,
} from "@/app/(app)/coach/sessions/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Select } from "@/components/ui/select";
import type { AttendanceStudent } from "@/lib/types";

const initialState: AttendanceActionState = {
  error: null,
  success: null,
};

const statusOptions = [
  { value: "present", label: "Katildi" },
  { value: "late", label: "Gecikti" },
  { value: "excused", label: "Mazeretli" },
  { value: "absent", label: "Yok" },
];

export function AttendanceForm({
  sessionId,
  students,
}: {
  sessionId: string;
  students: AttendanceStudent[];
}) {
  const [state, formAction] = useActionState(saveAttendanceAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      <div className="grid gap-3">
        {students.map((student) => (
          <div
            key={student.studentId}
            className="grid gap-2 rounded-[1.1rem] border border-border/60 bg-accent/60 p-3"
          >
            <label
              className="text-sm font-medium text-foreground"
              htmlFor={`status-${student.studentId}`}
            >
              {student.name}
            </label>
            <Select
              id={`status-${student.studentId}`}
              name={`status:${student.studentId}`}
              defaultValue={student.status}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Yoklama kaydediliyor...">
        Yoklamayi kaydet
      </FormSubmitButton>
    </form>
  );
}
