import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />;
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "[&_tr]:border-b [&_tr]:border-slate-200/80 [&_tr]:bg-[linear-gradient(180deg,rgba(230,237,247,0.95),rgba(223,233,245,0.85))] [&_tr]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        "[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-slate-200/65 [&_tr:nth-child(even)]:bg-[#f8fbff]/95 [&_tr:nth-child(odd)]:bg-white/92",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-all duration-200 hover:bg-[rgba(20,86,215,0.05)]", className)} {...props} />;
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("h-14 px-5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d7d94]", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-4.5 align-middle text-[0.96rem]", className)} {...props} />;
}
