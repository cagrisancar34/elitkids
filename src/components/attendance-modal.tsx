"use client";

import { useActionState, useMemo, useState } from "react";

import {
  saveAttendanceAction,
  type AttendanceActionState,
} from "@/app/(app)/coach/sessions/actions";
import { AttendanceWhatsAppButton } from "@/components/attendance-whatsapp-button";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AttendanceStudent } from "@/lib/types";

const initialState: AttendanceActionState = {
  error: null,
  success: null,
};

const statusOptions = [
  { value: "present", label: "Geldi" },
  { value: "absent", label: "Gelmedi" },
  { value: "excused", label: "Izinli" },
] as const;

export function AttendanceModal({
  sessionId,
  sessionTitle,
  students,
  triggerLabel = "Yoklama",
  triggerVariant = "default",
}: {
  sessionId: string;
  sessionTitle: string;
  students: AttendanceStudent[];
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "secondary";
}) {
  const [state, formAction] = useActionState(saveAttendanceAction, initialState);
  const [statusMap, setStatusMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(students.map((student) => [student.studentId, student.status])),
  );
  const effectiveStatusMap = useMemo(
    () =>
      students.reduce<Record<string, string>>((accumulator, student) => {
        accumulator[student.studentId] = statusMap[student.studentId] ?? student.status;
        return accumulator;
      }, {}),
    [statusMap, students],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant={triggerVariant}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(92vw,1080px)] max-h-[88vh] overflow-y-auto rounded-[2rem] px-8 py-8">
        <DialogHeader>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Yoklama
          </div>
          <DialogTitle>{sessionTitle} yoklamasi</DialogTitle>
          <DialogDescription>
            Secilen seans icin geldi, gelmedi ve izinli durumlarini hizli sekilde kaydedin.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="sessionId" value={sessionId} />
          <div className="grid gap-4">
            {students.map((student) => (
              <div
                key={student.studentId}
                className="surface-muted grid gap-3 rounded-[1.35rem] border border-white/50 p-4 md:grid-cols-[1.2fr_280px_280px]"
              >
                <div>
                  <div className="text-xl font-semibold tracking-[-0.03em] text-foreground">{student.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Aktif ogrenci</div>
                  <div className="mt-4">
                    <AttendanceWhatsAppButton
                      sessionId={sessionId}
                      studentId={student.studentId}
                      disabled={effectiveStatusMap[student.studentId] !== "absent"}
                    />
                  </div>
                </div>
                <Select
                  id={`status-${student.studentId}`}
                  name={`status:${student.studentId}`}
                  value={effectiveStatusMap[student.studentId]}
                  onChange={(event) =>
                    setStatusMap((current) => ({
                      ...current,
                      [student.studentId]: event.target.value,
                    }))
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Input
                  id={`note-${student.studentId}`}
                  name={`note:${student.studentId}`}
                  defaultValue={student.note ?? ""}
                  placeholder="Not"
                />
              </div>
            ))}
          </div>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

          <div className="flex justify-end gap-3">
            <FormSubmitButton className="min-w-40" pendingLabel="Kaydediliyor...">
              Hizli Kaydet
            </FormSubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
