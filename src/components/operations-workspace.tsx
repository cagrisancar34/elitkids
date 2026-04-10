import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkspaceStatGridProps = {
  children: ReactNode;
  className?: string;
};

type WorkspaceKpiCardProps = {
  label: string;
  value: string | number;
  description: string;
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
  description: string;
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
    <div className="surface-panel rounded-[1.65rem] border border-white/45 p-6 shadow-[0_22px_50px_rgba(18,43,84,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        {badge ? (
          <div className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", getAccentClasses(accent))}>
            {badge}
          </div>
        ) : null}
      </div>
      <div className="mt-5 font-display text-[3rem] font-semibold leading-none tracking-[-0.06em] text-foreground">
        {value}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
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
    <Card className={cn("rounded-[1.9rem] border-white/50 shadow-[0_22px_50px_rgba(18,43,84,0.08)]", className)}>
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
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
        "overflow-hidden rounded-[1.9rem] bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-6 text-white shadow-[0_24px_50px_rgba(11,15,16,0.22)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">{eyebrow}</div>
        {badge ? (
          <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            {badge}
          </div>
        ) : null}
      </div>
      <div className="mt-4 font-display text-[2.25rem] font-semibold leading-[0.96] tracking-[-0.05em]">{title}</div>
      <p className="mt-4 text-sm leading-6 text-white/64">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
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
