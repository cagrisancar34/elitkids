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
import { Textarea } from "@/components/ui/textarea";
import type { AttendanceStudent, CoachSessionDetail } from "@/lib/types";

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
  students = [],
  fetchPath,
  triggerLabel = "Yoklama",
  triggerVariant = "default",
  triggerClassName,
}: {
  sessionId: string;
  sessionTitle: string;
  students?: AttendanceStudent[];
  fetchPath?: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "secondary";
  triggerClassName?: string;
}) {
  const [state, formAction] = useActionState(saveAttendanceAction, initialState);
  const [open, setOpen] = useState(false);
  const [roster, setRoster] = useState<AttendanceStudent[]>(students);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(students.map((student) => [student.studentId, student.status])),
  );
  const effectiveStatusMap = useMemo(
    () =>
      roster.reduce<Record<string, string>>((accumulator, student) => {
        accumulator[student.studentId] = statusMap[student.studentId] ?? student.status;
        return accumulator;
      }, {}),
    [roster, statusMap],
  );

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen || roster.length || !fetchPath) {
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(fetchPath, { method: "GET", cache: "no-store" });
      const body = (await response.json().catch(() => null)) as { session?: CoachSessionDetail; error?: string } | null;

      if (!response.ok || !body?.session) {
        throw new Error(body?.error ?? "Seans roster detayi yuklenemedi.");
      }

      setRoster(body.session.students);
      setStatusMap(Object.fromEntries(body.session.students.map((student) => [student.studentId, student.status])));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Seans roster detayi yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant={triggerVariant} className={triggerClassName}>
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
          {loading ? (
            <div className="text-sm text-muted-foreground">Roster yukleniyor...</div>
          ) : loadError ? (
            <div className="text-sm text-destructive">{loadError}</div>
          ) : (
          <div className="grid gap-4">
            {roster.map((student) => (
              <div
                key={student.studentId}
                className="surface-muted grid gap-3 rounded-[1.35rem] border border-white/50 p-4 md:grid-cols-[1.2fr_220px_320px]"
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
                  placeholder={
                    effectiveStatusMap[student.studentId] === "absent"
                      ? "Devamsizlik nedeni"
                      : effectiveStatusMap[student.studentId] === "excused"
                        ? "Izin / istisna nedeni"
                        : "Kisa gozlem / not"
                  }
                />
              </div>
            ))}
          </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`session-closing-${sessionId}`}>
              Seans sonrasi hizli degerlendirme
            </label>
            <Textarea
              id={`session-closing-${sessionId}`}
              name="sessionClosingNote"
              placeholder="Bugunku akistan kisa not dus: tempo, dikkat edilmesi gereken ogrenci, ekip icin kapanis notu..."
              className="min-h-24"
            />
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
