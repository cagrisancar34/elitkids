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
    <div className="group relative flex min-h-[208px] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/80 bg-white/40 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(20,86,215,0.15)] md:p-7">
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" />
      
      <div className="relative z-10 flex items-start justify-between gap-4">
        {/* Deep, glowing icon container */}
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-b from-primary/10 to-primary/5 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,1)] ring-1 ring-primary/10 transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1) group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10">
          {icon}
        </div>
        <div className="inline-flex max-h-7 items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-800 shadow-sm backdrop-blur-md">
          <ArrowUpRight className="h-3.5 w-3.5 text-cyan-600" strokeWidth={3} />
          {metric.delta}
        </div>
      </div>
      <div className="relative z-10 mt-8">
        <div className="font-display text-[3.6rem] font-semibold leading-[0.9] tracking-[-0.05em] text-slate-800 drop-shadow-sm transition-colors group-hover:text-black">
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
