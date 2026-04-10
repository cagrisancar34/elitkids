"use client";

import { useActionState } from "react";
import { Archive, PencilLine } from "lucide-react";

import {
  archiveProgramAction,
  type ProgramActionState,
  updateProgramAction,
} from "@/app/(app)/manager/programs/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { ProgramFormFields } from "@/components/program-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProgramFormOptions, ProgramRecord } from "@/lib/types";

const initialState: ProgramActionState = {
  error: null,
  success: null,
};

export function ProgramActions({
  program,
  options,
}: {
  program: ProgramRecord;
  options: ProgramFormOptions;
}) {
  const [updateState, updateAction] = useActionState(updateProgramAction, initialState);
  const [archiveState, archiveAction] = useActionState(archiveProgramAction, initialState);

  return (
    <div className="mt-5 grid gap-3 border-t border-white/50 pt-5">
      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <PencilLine className="h-4 w-4" />
              Duzenle
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[min(94vw,1280px)] max-h-[92vh] overflow-y-auto rounded-[2rem] px-10 py-10">
            <DialogHeader>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Program urunu
              </div>
              <DialogTitle>Program urununu duzenle</DialogTitle>
              <DialogDescription>Bu ekran urunun tanimini gunceller; grup ve seans planlari ayri akista yonetilir.</DialogDescription>
            </DialogHeader>
            <form action={updateAction} className="grid gap-5">
              <input type="hidden" name="programId" value={program.id} />
              <ProgramFormFields options={options} values={program} idPrefix={`program-${program.id}`} />
              {updateState.error ? <p className="text-sm text-destructive">{updateState.error}</p> : null}
              {updateState.success ? <p className="text-sm text-success">{updateState.success}</p> : null}
              <div className="flex justify-end">
                <FormSubmitButton className="min-w-44" pendingLabel="Program guncelleniyor...">
                  Kaydet
                </FormSubmitButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <form action={archiveAction}>
          <input type="hidden" name="programId" value={program.id} />
          <FormSubmitButton variant="ghost" size="sm" pendingLabel="Arsivleniyor...">
            <Archive className="h-4 w-4" />
            Arsivle
          </FormSubmitButton>
        </form>
      </div>

      {archiveState.error ? <p className="text-sm text-destructive">{archiveState.error}</p> : null}
      {archiveState.success ? <p className="text-sm text-success">{archiveState.success}</p> : null}
    </div>
  );
}
