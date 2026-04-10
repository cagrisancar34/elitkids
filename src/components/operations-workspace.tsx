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
    <div className="panel-float workspace-hover-lift rounded-[1.75rem] p-5 md:p-6">
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
  children,
  className,
  contentClassName,
}: WorkspacePanelProps) {
  return (
    <Card className={cn("overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-b from-white/90 to-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]", className)}>
      {/* Decorative top glint */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <CardHeader className="pb-4">
        <CardTitle className="text-[1.35rem] font-semibold tracking-tight text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

export function WorkspaceHighlight({
  eyebrow,
  title,
  badge,
  children,
  className,
}: WorkspaceHighlightProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0a0f1a] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] md:p-8",
        className,
      )}
    >
      {/* Absolute dark glow meshes */}
      <div className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] animate-pulse bg-[radial-gradient(circle_at_40%_20%,rgba(40,110,255,0.18),transparent_40%)] duration-10000" />
      <div className="absolute -bottom-1/4 -right-1/4 h-full w-full bg-[radial-gradient(circle_at_60%_80%,rgba(20,200,255,0.1),transparent_50%)]" />
      
      {/* Top inner white glow ring */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200/60 drop-shadow-sm">{eyebrow}</div>
        {badge ? (
          <div className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white/90 shadow-sm backdrop-blur-md">
            {badge}
          </div>
        ) : null}
      </div>
      <div className="relative z-10 mt-6 font-display text-[2.5rem] font-semibold leading-[0.92] tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">{title}</div>
      {children ? <div className="relative z-10 mt-8">{children}</div> : null}
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
