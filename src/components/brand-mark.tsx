import { cn } from "@/lib/utils";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold shadow-[0_14px_28px_rgba(2,83,205,0.22)]",
          inverse
            ? "bg-white text-[#0b0f10]"
            : "bg-[linear-gradient(135deg,#0253cd,#0048b5)] text-primary-foreground",
        )}
      >
        EK
      </div>
      <div>
        <div
          className={cn(
            "font-display text-base font-semibold tracking-tight",
            inverse ? "text-white" : "text-foreground",
          )}
        >
          Elit Sanat ve Spor Kulubu
        </div>
        <p
          className={cn(
            "text-xs uppercase tracking-[0.18em]",
            inverse ? "text-white/56" : "text-muted-foreground",
          )}
        >
          Spor Okulu Operasyon Sistemi
        </p>
      </div>
    </div>
  );
}
