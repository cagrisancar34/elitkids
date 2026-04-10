"use client";

import { useActionState } from "react";

import {
  createDetailQuestionAction,
  deleteDetailQuestionAction,
  toggleDetailQuestionStatusAction,
  type TemplateActionState,
  updateDetailQuestionAction,
} from "@/app/(app)/admin/detail-templates/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getQuestionInputTypeLabel } from "@/lib/student-reporting";
import type { DetailQuestionRecord } from "@/lib/types";

const initialState: TemplateActionState = {
  error: null,
  success: null,
};

function QuestionCard({ question }: { question: DetailQuestionRecord }) {
  const [updateState, updateAction] = useActionState(updateDetailQuestionAction, initialState);
  const [toggleState, toggleAction] = useActionState(toggleDetailQuestionStatusAction, initialState);
  const [deleteState, deleteAction] = useActionState(deleteDetailQuestionAction, initialState);

  return (
    <div className="rounded-[1.5rem] border border-white/50 bg-white/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <form action={updateAction} className="grid gap-4">
        <input type="hidden" name="questionId" value={question.id} />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {getQuestionInputTypeLabel(question.inputType)}
            </div>
            <div className="mt-2 text-lg font-semibold text-foreground">{question.label}</div>
          </div>
          <span
            className={
              question.active
                ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700"
                : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600"
            }
          >
            {question.active ? "Formda aktif" : "Formdan cikti"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Soru etiketi</label>
            <Input name="label" defaultValue={question.label} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Alan anahtari</label>
            <Input name="fieldKey" defaultValue={question.fieldKey} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Alan tipi</label>
            <Select name="inputType" defaultValue={question.inputType}>
              <option value="text">Kisa metin</option>
              <option value="textarea">Uzun metin</option>
              <option value="number">Sayisal puan</option>
              <option value="select">Secimli liste</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Zorunluluk</label>
            <Select name="required" defaultValue={question.required ? "yes" : "no"}>
              <option value="yes">Zorunlu</option>
              <option value="no">Opsiyonel</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Sira</label>
            <Input name="sortOrder" type="number" min="1" max="999" defaultValue={String(question.sortOrder)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Placeholder</label>
            <Input name="placeholder" defaultValue={question.placeholder} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Secenekler</label>
            <Input
              name="optionsText"
              defaultValue={question.options.join(", ")}
              placeholder="A, B, C gibi virgulle ayir"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground">Yardim metni</label>
          <textarea
            name="helperText"
            defaultValue={question.helperText}
            className="min-h-24 rounded-[1.2rem] border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {updateState.error ? <p className="text-sm text-destructive">{updateState.error}</p> : null}
        {updateState.success ? <p className="text-sm text-success">{updateState.success}</p> : null}

        <div className="flex flex-wrap gap-3">
          <FormSubmitButton pendingLabel="Soru guncelleniyor...">Soruyu guncelle</FormSubmitButton>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-3">
        <form action={toggleAction}>
          <input type="hidden" name="questionId" value={question.id} />
          <input type="hidden" name="nextState" value={question.active ? "inactive" : "active"} />
          <FormSubmitButton
            variant="outline"
            pendingLabel={question.active ? "Cikariliyor..." : "Aktiflestiriliyor..."}
          >
            {question.active ? "Formdan cikar" : "Forma geri al"}
          </FormSubmitButton>
        </form>

        <form action={deleteAction}>
          <input type="hidden" name="questionId" value={question.id} />
          <Button type="submit" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5">
            Kalici sil
          </Button>
        </form>
      </div>

      {toggleState.error ? <p className="mt-3 text-sm text-destructive">{toggleState.error}</p> : null}
      {toggleState.success ? <p className="mt-3 text-sm text-success">{toggleState.success}</p> : null}
      {deleteState.error ? <p className="mt-3 text-sm text-destructive">{deleteState.error}</p> : null}
      {deleteState.success ? <p className="mt-3 text-sm text-success">{deleteState.success}</p> : null}
    </div>
  );
}

export function AdminDetailQuestionsPanel({ questions }: { questions: DetailQuestionRecord[] }) {
  const [createState, createAction] = useActionState(createDetailQuestionAction, initialState);

  return (
    <div className="grid gap-6">
      <div className="rounded-[1.7rem] border border-white/50 bg-white/92 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
        <div className="mb-4">
          <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-foreground">
            Yeni detay sorusu ekle
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Buradan eklenen sorular manager ve koc detay formlarinda aninda gorunur. Veli tarafinda ise karnede yalnizca kaydedilen alanlar listelenir.
          </p>
        </div>
        <form action={createAction} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Soru etiketi</label>
              <Input name="label" placeholder="Kavrama gucu" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Alan anahtari</label>
              <Input name="fieldKey" placeholder="kavrama_gucu" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Alan tipi</label>
              <Select name="inputType" defaultValue="text">
                <option value="text">Kisa metin</option>
                <option value="textarea">Uzun metin</option>
                <option value="number">Sayisal puan</option>
                <option value="select">Secimli liste</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Zorunluluk</label>
              <Select name="required" defaultValue="yes">
                <option value="yes">Zorunlu</option>
                <option value="no">Opsiyonel</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Sira</label>
              <Input name="sortOrder" type="number" min="1" max="999" defaultValue="90" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Placeholder</label>
              <Input name="placeholder" placeholder="Bu alan icin ornek cevap" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Secenekler</label>
              <Input name="optionsText" placeholder="Iyi, Orta, Gelisiyor" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Yardim metni</label>
            <textarea
              name="helperText"
              className="min-h-24 rounded-[1.2rem] border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Koca bu alanin ne icin dolduruldugunu hatirlat."
            />
          </div>
          {createState.error ? <p className="text-sm text-destructive">{createState.error}</p> : null}
          {createState.success ? <p className="text-sm text-success">{createState.success}</p> : null}
          <FormSubmitButton pendingLabel="Soru ekleniyor...">Soruyu ekle</FormSubmitButton>
        </form>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
