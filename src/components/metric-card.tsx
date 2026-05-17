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
    <div className="page-surface group relative flex min-h-[192px] flex-col justify-between rounded-[2rem] p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(20,86,215,0.12)] md:p-7">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(20,86,215,0.12),rgba(20,86,215,0.04))] text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,1)] ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-[1.04]">
          {icon}
        </div>
        <div className="inline-flex max-h-7 items-center gap-1.5 rounded-full border border-primary/10 bg-primary/8 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-primary/80 shadow-sm backdrop-blur-md">
          <ArrowUpRight className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
          {metric.delta}
        </div>
      </div>
      <div className="relative z-10 mt-8">
        <div className="font-display text-[3.4rem] font-semibold leading-[0.9] tracking-[-0.05em] text-slate-800 transition-colors group-hover:text-black">
          {metric.value}
        </div>
        <div className="mt-3.5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
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
