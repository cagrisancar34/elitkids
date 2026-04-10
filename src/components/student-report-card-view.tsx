"use client";

import type { StudentReportCard } from "@/lib/types";

function getNumericEntries(reportCard: StudentReportCard) {
  return reportCard.entries.filter((entry) => entry.inputType === "number");
}

export function StudentReportCardView({
  reportCard,
}: {
  reportCard: StudentReportCard | null | undefined;
}) {
  if (!reportCard) {
    return (
      <p className="text-sm text-muted-foreground">
        Henuz detay kaydi girilmedi; bu nedenle karne olusmadi.
      </p>
    );
  }

  const numericEntries = getNumericEntries(reportCard);
  const textEntries = reportCard.entries.filter((entry) => entry.inputType !== "number");

  return (
    <div className="grid gap-4 text-sm text-muted-foreground">
      <div className="rounded-[1.2rem] border border-white/50 bg-white/70 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Uretilen ozet
        </div>
        <p className="mt-3 leading-6 text-foreground">{reportCard.summary}</p>
      </div>

      {numericEntries.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {numericEntries.map((entry) => (
            <div key={entry.fieldKey} className="rounded-[1.1rem] bg-secondary px-4 py-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{entry.label}</div>
              <div className="mt-2 font-display text-3xl text-foreground">{entry.value || "-"}</div>
            </div>
          ))}
        </div>
      ) : null}

      {textEntries.length ? (
        <div className="grid gap-3">
          {textEntries.map((entry) => (
            <div key={entry.fieldKey} className="rounded-[1.2rem] border border-white/50 bg-white/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {entry.label}
              </div>
              <p className="mt-3 leading-6 text-foreground">{entry.value || "-"}</p>
            </div>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">Olusturulma: {reportCard.generatedAt}</p>
    </div>
  );
}
