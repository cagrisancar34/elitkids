"use client";

import { useActionState, useMemo } from "react";

import type { ActionState } from "@/app/(app)/manager/students/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getQuestionInputTypeLabel, getQuestionValueName } from "@/lib/student-reporting";
import type { DetailAnswerRecord, DetailQuestionRecord } from "@/lib/types";

const initialState: ActionState = {
  error: null,
  success: null,
};

export function StudentDetailForm({
  studentId,
  questions,
  initialAnswers,
  submitLabel,
  pendingLabel,
  action,
}: {
  studentId: string;
  questions: DetailQuestionRecord[];
  initialAnswers: DetailAnswerRecord[];
  submitLabel: string;
  pendingLabel: string;
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, initialState);

  const answerMap = useMemo(
    () => new Map(initialAnswers.map((answer) => [answer.fieldKey, answer.value])),
    [initialAnswers],
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="studentId" value={studentId} />
      {questions
        .filter((question) => question.active)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((question) => {
          const defaultValue = answerMap.get(question.fieldKey) ?? "";
          const inputName = getQuestionValueName(question.fieldKey);

          return (
            <div key={question.fieldKey} className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor={`${studentId}-${question.fieldKey}`}>
                {question.label}
                <span className="ml-2 text-xs font-normal uppercase tracking-[0.14em] text-muted-foreground">
                  {getQuestionInputTypeLabel(question.inputType)}
                </span>
              </label>
              {question.inputType === "textarea" ? (
                <textarea
                  id={`${studentId}-${question.fieldKey}`}
                  name={inputName}
                  defaultValue={defaultValue}
                  required={question.required}
                  placeholder={question.placeholder}
                  className="min-h-28 rounded-[1.2rem] border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              ) : null}
              {question.inputType === "select" ? (
                <Select
                  id={`${studentId}-${question.fieldKey}`}
                  name={inputName}
                  defaultValue={defaultValue}
                  required={question.required}
                  className="bg-background"
                >
                  <option value="">Secim yap</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              ) : null}
              {question.inputType === "text" ? (
                <Input
                  id={`${studentId}-${question.fieldKey}`}
                  name={inputName}
                  defaultValue={defaultValue}
                  required={question.required}
                  placeholder={question.placeholder}
                />
              ) : null}
              {question.inputType === "number" ? (
                <Input
                  id={`${studentId}-${question.fieldKey}`}
                  name={inputName}
                  defaultValue={defaultValue}
                  required={question.required}
                  type="number"
                  min="1"
                  max="10"
                  placeholder={question.placeholder}
                />
              ) : null}
              {question.helperText ? (
                <p className="text-xs leading-5 text-muted-foreground">{question.helperText}</p>
              ) : null}
            </div>
          );
        })}

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <FormSubmitButton className="w-full" pendingLabel={pendingLabel}>
        {submitLabel}
      </FormSubmitButton>
    </form>
  );
}
