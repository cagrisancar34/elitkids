"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SupportThreadForm } from "@/components/support-thread-form";

export function SupportComposeSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full">Yeni talep ac</Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Yeni talep ac</SheetTitle>
          <SheetDescription>
            Destek talebin dogrudan Supabase support tablolarina yazilir.
          </SheetDescription>
        </SheetHeader>
        <SupportThreadForm />
      </SheetContent>
    </Sheet>
  );
}
