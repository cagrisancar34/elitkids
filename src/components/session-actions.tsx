"use client";

import { useActionState, useMemo } from "react";
import { Ban, Eye, PencilLine } from "lucide-react";

import {
  cancelSessionAction,
  type SessionActionState,
  updateSessionAction,
} from "@/app/(app)/manager/sessions/actions";
import { AttendanceModal } from "@/components/attendance-modal";
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
import type { Area, AttendanceStudent, CoachOption, ProgramOption, SessionRecord } from "@/lib/types";

const initialState: SessionActionState = {
  error: null,
  success: null,
};

function toLocalDateTimeValue(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

export function SessionActions({
  session,
  programs,
  coaches,
  areas,
  students = [],
}: {
  session: SessionRecord;
  programs: ProgramOption[];
  coaches: CoachOption[];
  areas: Area[];
  students?: AttendanceStudent[];
}) {
  const [updateState, updateAction] = useActionState(updateSessionAction, initialState);
  const [cancelState, cancelAction] = useActionState(cancelSessionAction, initialState);

  const startsAtValue = useMemo(() => toLocalDateTimeValue(session.startsAt), [session.startsAt]);
  const endsAtValue = useMemo(() => toLocalDateTimeValue(session.endsAt), [session.endsAt]);

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline">
            <Eye className="h-4 w-4" />
            Detay
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[min(92vw,920px)] rounded-[2rem] px-8 py-8">
          <DialogHeader>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Seans detayi
            </div>
            <DialogTitle>{session.title}</DialogTitle>
            <DialogDescription>
              Program, egitmen, alan ve katilim ozeti tek panelde gorunur.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface-muted rounded-[1.2rem] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Program</div>
              <div className="mt-2 text-lg font-semibold text-foreground">{session.programTitle ?? session.title}</div>
            </div>
            <div className="surface-muted rounded-[1.2rem] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Egitmen</div>
              <div className="mt-2 text-lg font-semibold text-foreground">{session.coach}</div>
            </div>
            <div className="surface-muted rounded-[1.2rem] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Alan</div>
              <div className="mt-2 text-lg font-semibold text-foreground">{session.areaName ?? session.location}</div>
            </div>
            <div className="surface-muted rounded-[1.2rem] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Kapasite / Kayitli</div>
              <div className="mt-2 text-lg font-semibold text-foreground">
                {session.studentCount ?? 0} / {session.capacity ?? 0}
              </div>
            </div>
          </div>

          <div className="surface-panel rounded-[1.35rem] border border-white/50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Seans notu</div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {session.notes?.trim() || "Bu seans icin kayitli not bulunmuyor."}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline">
            <PencilLine className="h-4 w-4" />
            Duzenle
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[min(94vw,980px)] max-h-[88vh] overflow-y-auto rounded-[2rem] px-8 py-8">
          <DialogHeader>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Seans duzenleme
            </div>
            <DialogTitle>Seansi duzenle</DialogTitle>
            <DialogDescription>
              Bu seans, bu ve sonraki seanslar veya tum seri icin guncelleme yapabilirsin.
            </DialogDescription>
          </DialogHeader>

          <form action={updateAction} className="grid gap-5">
            <input type="hidden" name="sessionId" value={session.id} />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={`session-scope-${session.id}`}>
                  Uygulama kapsami
                </label>
                <Select id={`session-scope-${session.id}`} name="scope" defaultValue="single">
                  <option value="single">Bu seans</option>
                  <option value="following">Bu ve sonraki seanslar</option>
                  <option value="series">Tum seri</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={`session-title-${session.id}`}>
                  Seans basligi
                </label>
                <Input id={`session-title-${session.id}`} name="title" defaultValue={session.title} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={`session-program-${session.id}`}>
                  Program
                </label>
                <Select id={`session-program-${session.id}`} name="programId" defaultValue={session.programId ?? programs[0]?.id ?? ""}>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={`session-coach-${session.id}`}>
                  Egitmen
                </label>
                <Select id={`session-coach-${session.id}`} name="coachId" defaultValue={session.coachId ?? coaches[0]?.id ?? ""}>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={`session-start-${session.id}`}>
                  Baslangic
                </label>
                <Input id={`session-start-${session.id}`} name="startsAt" type="datetime-local" defaultValue={startsAtValue} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={`session-end-${session.id}`}>
                  Bitis
                </label>
                <Input id={`session-end-${session.id}`} name="endsAt" type="datetime-local" defaultValue={endsAtValue} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground" htmlFor={`session-area-${session.id}`}>
                  Alan / Pist
                </label>
                <Select id={`session-area-${session.id}`} name="areaId" defaultValue={session.areaId ?? areas[0]?.id ?? ""}>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor={`session-notes-${session.id}`}>
                Notlar
              </label>
              <Textarea id={`session-notes-${session.id}`} name="notes" defaultValue={session.notes ?? ""} className="min-h-28" />
            </div>

            {updateState.error ? <p className="text-sm text-destructive">{updateState.error}</p> : null}
            {updateState.success ? <p className="text-sm text-success">{updateState.success}</p> : null}

            <div className="flex justify-end">
              <FormSubmitButton className="min-w-44" pendingLabel="Seans guncelleniyor...">
                Kaydet
              </FormSubmitButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {students.length ? (
        <AttendanceModal
          sessionId={session.id}
          sessionTitle={session.title}
          students={students}
          triggerLabel="Yoklama"
          triggerVariant="default"
        />
      ) : null}

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="ghost">
            <Ban className="h-4 w-4" />
            Iptal et
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[min(92vw,640px)] rounded-[2rem] px-8 py-8">
          <DialogHeader>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Seans iptali
            </div>
            <DialogTitle>Seansi iptal et</DialogTitle>
            <DialogDescription>
              Iptali bu seans, bu ve sonraki seanslar veya tum seri icin uygulayabilirsin.
            </DialogDescription>
          </DialogHeader>

          <form action={cancelAction} className="grid gap-5">
            <input type="hidden" name="sessionId" value={session.id} />
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor={`cancel-scope-${session.id}`}>
                Iptal kapsami
              </label>
              <Select id={`cancel-scope-${session.id}`} name="scope" defaultValue="single">
                <option value="single">Bu seans</option>
                <option value="following">Bu ve sonraki seanslar</option>
                <option value="series">Tum seri</option>
              </Select>
            </div>

            {cancelState.error ? <p className="text-sm text-destructive">{cancelState.error}</p> : null}
            {cancelState.success ? <p className="text-sm text-success">{cancelState.success}</p> : null}

            <div className="flex justify-end">
              <FormSubmitButton variant="ghost" className="min-w-40" pendingLabel="Iptal ediliyor...">
                Iptal et
              </FormSubmitButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
