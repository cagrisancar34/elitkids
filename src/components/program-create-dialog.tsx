"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProgramCreateForm } from "@/components/program-create-form";
import type { ProgramFormOptions } from "@/lib/types";

export function ProgramCreateDialog({ options }: { options: ProgramFormOptions }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Program olustur</Button>
      </DialogTrigger>
      <DialogContent className="w-[min(94vw,1280px)] max-h-[92vh] overflow-y-auto rounded-[2rem] px-10 py-10">
        <DialogHeader>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Program karti
          </div>
          <DialogTitle>Yeni Program</DialogTitle>
          <DialogDescription>
            Program, egitmen, brans ve kapasite akisini bu alandan yonetin.
          </DialogDescription>
        </DialogHeader>
        <ProgramCreateForm options={options} />
      </DialogContent>
    </Dialog>
  );
}
