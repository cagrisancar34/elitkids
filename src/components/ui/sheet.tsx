"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const sheetVariants = cva(
  "fixed z-50 grid gap-4 bg-card p-6 shadow-[0_24px_80px_rgba(18,30,54,0.22)]",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-white/60",
        bottom: "inset-x-0 bottom-0 border-t border-white/60",
        left: "inset-y-0 left-0 h-full w-[min(92vw,480px)] border-r border-white/60",
        right: "inset-y-0 right-0 h-full w-[min(92vw,480px)] border-l border-white/60",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

function Sheet(props: React.ComponentProps<typeof Dialog>) {
  return <Dialog data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof DialogClose>) {
  return <DialogClose data-slot="sheet-close" {...props} />;
}

function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent> & VariantProps<typeof sheetVariants>) {
  return (
    <DialogContent
      className={cn(
        "translate-x-0 translate-y-0 top-auto left-auto w-auto rounded-none",
        sheetVariants({ side }),
        className,
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogHeader className={className} {...props} />;
}

function SheetTitle(props: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle {...props} />;
}

function SheetDescription(props: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription {...props} />;
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
