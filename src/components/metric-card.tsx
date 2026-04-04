import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";

import type { Metric } from "@/lib/types";

export function MetricCard({ metric }: { metric: Metric }) {
  const icon = getMetricIcon(metric.label);

  return (
    <div className="surface-panel group flex min-h-[220px] flex-col justify-between rounded-[1.75rem] border border-white/40 p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-primary/10 text-primary transition-transform group-hover:scale-105">
          {icon}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {metric.delta}
        </div>
      </div>
      <div className="mt-10">
        <div className="font-display text-[3.75rem] font-semibold leading-none tracking-[-0.06em] text-foreground">
          {metric.value}
        </div>
        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {metric.label}
        </div>
      </div>
    </div>
  );
}

function getMetricIcon(label: string) {
  const value = label.toLocaleLowerCase("tr-TR");

  if (value.includes("ogrenci") || value.includes("veli") || value.includes("kullanici")) {
    return <UsersRound className="h-6 w-6" />;
  }

  if (value.includes("odeme") || value.includes("tahsilat") || value.includes("bakiye")) {
    return <CreditCard className="h-6 w-6" />;
  }

  if (value.includes("guvenlik") || value.includes("rol") || value.includes("yetki")) {
    return <ShieldCheck className="h-6 w-6" />;
  }

  if (value.includes("seans") || value.includes("program") || value.includes("takvim")) {
    return <CalendarDays className="h-6 w-6" />;
  }

  if (value.includes("performans") || value.includes("trial")) {
    return <Trophy className="h-6 w-6" />;
  }

  return <UsersRound className="h-6 w-6" />;
}
