"use client";

import { FileText } from "lucide-react";

import { saveStudentDetailAction } from "@/app/(app)/manager/students/actions";
import { StudentDetailForm } from "@/components/student-detail-form";
import { StudentReportCardView } from "@/components/student-report-card-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CoachStudentRecord, DetailQuestionRecord } from "@/lib/types";

export function CoachStudentActions({
  student,
  questions,
}: {
  student: CoachStudentRecord;
  questions: DetailQuestionRecord[];
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            Detay
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gelisim detayi gir</DialogTitle>
            <DialogDescription>
              Koc saha gozlemini kaydeder; kayit tamamlandiginda karne guncellenir.
            </DialogDescription>
          </DialogHeader>
          <StudentDetailForm
            studentId={student.id}
            questions={questions}
            initialAnswers={student.detailEntries ?? []}
            action={saveStudentDetailAction}
            submitLabel="Detayi kaydet ve karneyi guncelle"
            pendingLabel="Detay kaydediliyor..."
          />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={!student.reportCard}>
            <FileText className="h-4 w-4" />
            Karne
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Karne gorunumu</DialogTitle>
            <DialogDescription>Koc karnenin ozetini gorur, ancak buradan duzenlemez.</DialogDescription>
          </DialogHeader>
          <StudentReportCardView reportCard={student.reportCard} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
