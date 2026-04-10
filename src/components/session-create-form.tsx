"use client";

import { useActionState, useMemo, useState } from "react";

import {
  createSessionSeriesAction,
  type SessionActionState,
} from "@/app/(app)/manager/sessions/actions";
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
import { buildSessionOccurrences } from "@/lib/program-workspace";
import type { Area, CoachOption, ProgramOption } from "@/lib/types";

const initialState: SessionActionState = {
  error: null,
  success: null,
};

const weekdayOptions = [
  { value: 1, short: "Pzt", label: "Pazartesi" },
  { value: 2, short: "Sal", label: "Sali" },
  { value: 3, short: "Car", label: "Carsamba" },
  { value: 4, short: "Per", label: "Persembe" },
  { value: 5, short: "Cum", label: "Cuma" },
  { value: 6, short: "Cts", label: "Cumartesi" },
  { value: 7, short: "Paz", label: "Pazar" },
] as const;

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function SessionCreateForm({
  programs,
  coaches,
  areas,
}: {
  programs: ProgramOption[];
  coaches: CoachOption[];
  areas: Area[];
}) {
  const [state, formAction] = useActionState(createSessionSeriesAction, initialState);
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]);
  const [startsOn, setStartsOn] = useState(todayValue());
  const [endsOn, setEndsOn] = useState(todayValue());
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:00");

  const preview = useMemo(() => {
    const occurrences = buildSessionOccurrences({
      startsOn,
      endsOn,
      startTime,
      endTime,
      weekdays,
    });

    return {
      sessionCount: occurrences.length,
      selectedDays: weekdays.length,
      rangeLabel:
        occurrences.length > 0
          ? `${occurrences[0]?.dateLabel ?? startsOn} - ${occurrences[occurrences.length - 1]?.dateLabel ?? endsOn}`
          : `${startsOn} - ${endsOn}`,
    };
  }, [endsOn, startTime, endTime, startsOn, weekdays]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Yeni Grup</Button>
      </DialogTrigger>
      <DialogContent className="w-[min(94vw,1320px)] max-h-[92vh] overflow-y-auto rounded-[2rem] px-10 py-10">
        <DialogHeader>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Grup planlama
          </div>
          <DialogTitle>Yeni Grup / Seans Serisi</DialogTitle>
          <DialogDescription>
            Bir program urunu altinda haftalik duzen kurarak ayni gruba ait seans akislarini otomatik olusturun.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-6">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="session-program">
                Program urunu
              </label>
              <Select id="session-program" name="programId" defaultValue={programs[0]?.id ?? ""}>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="session-starts-on">
                Baslangic Tarihi
              </label>
              <Input
                id="session-starts-on"
                name="startsOn"
                type="date"
                value={startsOn}
                onChange={(event) => setStartsOn(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="session-ends-on">
                Bitis Tarihi
              </label>
              <Input
                id="session-ends-on"
                name="endsOn"
                type="date"
                value={endsOn}
                onChange={(event) => setEndsOn(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="session-title">
                Grup basligi
              </label>
              <Input id="session-title" name="title" placeholder="Pzt-Cars 18:00 grubu" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="session-start-time">
                Baslangic Saati
              </label>
              <Input
                id="session-start-time"
                name="startTime"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="session-end-time">
                Bitis Saati
              </label>
              <Input
                id="session-end-time"
                name="endTime"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="session-coach">
                Egitmen
              </label>
              <Select id="session-coach" name="coachId" defaultValue={coaches[0]?.id ?? ""}>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="session-area">
                Alan / Pist
              </label>
              <Select id="session-area" name="areaId" defaultValue={areas[0]?.id ?? ""}>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="text-sm font-semibold text-foreground">Tekrar Gunleri</div>
            <div className="grid gap-3 md:grid-cols-7">
              {weekdayOptions.map((day) => {
                const selected = weekdays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() =>
                      setWeekdays((current) =>
                        current.includes(day.value)
                          ? current.filter((item) => item !== day.value)
                          : [...current, day.value].sort((left, right) => left - right),
                      )
                    }
                    className={
                      selected
                        ? "rounded-[1.35rem] border border-primary/20 bg-[rgba(2,83,205,0.08)] px-5 py-5 text-left shadow-[0_12px_28px_rgba(2,83,205,0.12)]"
                        : "rounded-[1.35rem] border border-border/70 bg-card px-5 py-5 text-left"
                    }
                  >
                    <div className="text-[1.1rem] font-semibold text-foreground">{day.short}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{day.label}</div>
                    {selected ? <input type="hidden" name="weekdays" value={String(day.value)} /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="session-notes">
              Notlar
            </label>
            <Textarea id="session-notes" name="notes" className="min-h-28" placeholder="Grup veya seriyle ilgili operasyon notu" />
          </div>

          <div className="surface-muted grid gap-4 rounded-[1.6rem] border border-white/40 p-5 md:grid-cols-[1fr_1fr_1.4fr]">
            <div className="rounded-[1.2rem] bg-card px-5 py-5 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Secilen gunler</div>
              <div className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.05em] text-foreground">{preview.selectedDays} gun</div>
            </div>
            <div className="rounded-[1.2rem] bg-card px-5 py-5 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Olusacak seans</div>
              <div className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.05em] text-foreground">{preview.sessionCount} seans</div>
            </div>
            <div className="flex items-center justify-center rounded-[1.2rem] bg-[rgba(2,83,205,0.88)] px-5 py-5 text-center text-lg font-medium text-white">
              {preview.rangeLabel} arasinda ayni gruba bagli {preview.sessionCount} seans planlanacak.
            </div>
          </div>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

          <div className="flex justify-end">
            <FormSubmitButton className="min-w-52" pendingLabel="Grup serisi olusturuluyor...">
              {preview.sessionCount} Seanslik Grup Olustur
            </FormSubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
