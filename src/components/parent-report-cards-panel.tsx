import { StudentReportCardView } from "@/components/student-report-card-view";
import type { StudentReportCard } from "@/lib/types";

export function ParentReportCardsPanel({
  reportCards,
}: {
  reportCards: Array<
    StudentReportCard & {
      studentId: string;
      studentName: string;
    }
  >;
}) {
  if (!reportCards.length) {
    return (
      <div className="surface-muted rounded-[1.4rem] p-5 text-sm leading-6 text-muted-foreground">
        Henuz kaydedilmis karne yok. Koc detay girdiginde karne burada gorunecek.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {reportCards.map((reportCard) => (
        <div
          key={reportCard.id}
          className="rounded-[1.5rem] border border-white/40 bg-white/85 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
        >
          <div className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sporcu karnesi
            </div>
            <div className="mt-2 font-display text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground">
              {reportCard.studentName}
            </div>
          </div>
          <StudentReportCardView reportCard={reportCard} />
        </div>
      ))}
    </div>
  );
}
