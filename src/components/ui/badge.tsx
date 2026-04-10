import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
  {
    variants: {
      variant: {
        neutral: "border-white/60 bg-white/78 text-accent-foreground",
        success: "border-transparent bg-[#def7ec] text-success",
        warning: "border-transparent bg-[#fff0d8] text-[#9c6514]",
        danger: "border-transparent bg-[#ffe6e8] text-destructive",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
