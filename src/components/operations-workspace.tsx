import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkspaceStatGridProps = {
  children: ReactNode;
  className?: string;
};

type WorkspaceKpiCardProps = {
  label: string;
  value: string | number;
  description?: string;
  accent?: "blue" | "green" | "amber" | "red" | "violet";
  badge?: string;
};

type WorkspacePanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

type WorkspaceHighlightProps = {
  eyebrow: string;
  title: string;
  description?: string;
  badge?: string;
  children?: ReactNode;
  className?: string;
};

export function WorkspaceStatGrid({ children, className }: WorkspaceStatGridProps) {
  return <section className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>{children}</section>;
}

export function WorkspaceKpiCard({
  label,
  value,
  description,
  accent = "blue",
  badge,
}: WorkspaceKpiCardProps) {
  return (
    <div className="page-surface workspace-hover-lift rounded-[1.9rem] p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        {badge ? (
          <div className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", getAccentClasses(accent))}>
            {badge}
          </div>
        ) : null}
      </div>
      <div className="mt-4 font-display text-[2.7rem] font-semibold leading-none tracking-[-0.06em] text-foreground">
        {value}
      </div>
      {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function WorkspaceContentLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]", className)}>{children}</section>;
}

export function WorkspaceMainColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("grid min-w-0 gap-6", className)}>{children}</div>;
}

export function WorkspaceSideColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <aside className={cn("grid gap-6", className)}>{children}</aside>;
}

export function WorkspacePanel({
  title,
  description,
  children,
  className,
  contentClassName,
}: WorkspacePanelProps) {
  return (
    <Card className={cn("page-surface overflow-hidden rounded-[2.2rem] transition-all duration-300 hover:shadow-[0_12px_38px_rgba(0,0,0,0.08)]", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-[1.35rem] font-semibold tracking-tight text-slate-800">{title}</CardTitle>
        {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

export function WorkspaceHighlight({
  eyebrow,
  title,
  description,
  badge,
  children,
  className,
}: WorkspaceHighlightProps) {
  return (
    <div
      className={cn(
        "page-utility-rail group rounded-[2.2rem] p-6 md:p-7",
        className,
      )}
    >
      <div className="relative z-10 pl-5">
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/70">{eyebrow}</div>
        {badge ? (
          <div className="rounded-full border border-primary/10 bg-primary/8 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 shadow-sm backdrop-blur-md">
            {badge}
          </div>
        ) : null}
      </div>
      <div className="mt-5 font-display text-[1.85rem] font-semibold leading-[0.95] tracking-[-0.04em] text-[#152133]">{title}</div>
      {description ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  );
}

function getAccentClasses(accent: NonNullable<WorkspaceKpiCardProps["accent"]>) {
  if (accent === "green") {
    return "bg-emerald-500/10 text-emerald-700";
  }

  if (accent === "amber") {
    return "bg-amber-500/12 text-amber-700";
  }

  if (accent === "red") {
    return "bg-rose-500/12 text-rose-700";
  }

  if (accent === "violet") {
    return "bg-violet-500/12 text-violet-700";
  }

  return "bg-secondary text-secondary-foreground";
}
