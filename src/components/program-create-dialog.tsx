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

export function ProgramCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Program olustur</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni program tanimla</DialogTitle>
          <DialogDescription>
            Yas grubu, kapasite ve aylik ucreti girerek yeni program ve fee plan olustur.
          </DialogDescription>
        </DialogHeader>
        <ProgramCreateForm />
      </DialogContent>
    </Dialog>
  );
}
