"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { GripVertical, ListOrdered, PlusCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createPreRegistrationFieldAction,
  deletePreRegistrationFieldAction,
  reorderPreRegistrationFieldsAction,
  togglePreRegistrationFieldStatusAction,
  type PreRegistrationFieldActionState,
  updatePreRegistrationFieldAction,
} from "@/app/(app)/admin/pre-registration-settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getPreRegistrationInputTypeLabel } from "@/lib/pre-registration";
import type { PreRegistrationFieldRecord, PreRegistrationFieldSection } from "@/lib/types";
import { cn } from "@/lib/utils";

const initialState: PreRegistrationFieldActionState = {
  error: null,
  success: null,
};

type BuilderField = PreRegistrationFieldRecord & {
  localSection: PreRegistrationFieldSection;
  localSortOrder: number;
};

const sectionMeta: Record<
  PreRegistrationFieldSection,
  { title: string; description: string; accent: string; badge: string }
> = {
  student: {
    title: "Ogrenci alani",
    description: "Kimlik, temel profil ve sporcuya ait sorular.",
    accent: "from-sky-600/15 to-cyan-500/10",
    badge: "Ogrenci",
  },
  parent: {
    title: "Veli alani",
    description: "Iletisim, veli profili ve acil ulasim alanlari.",
    accent: "from-fuchsia-600/15 to-violet-500/10",
    badge: "Veli",
  },
  application: {
    title: "Basvuru alani",
    description: "Program secimi, notlar ve basvuruya ait ek bilgiler.",
    accent: "from-amber-500/20 to-orange-500/10",
    badge: "Basvuru",
  },
};

function buildOrderedFields(fields: PreRegistrationFieldRecord[]): BuilderField[] {
  return fields
    .map((field) => ({
      ...field,
      localSection: field.section,
      localSortOrder: field.sortOrder,
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder || left.label.localeCompare(right.label, "tr"));
}

function normalizeLayout(fields: BuilderField[]) {
  const next = [...fields];

  (Object.keys(sectionMeta) as PreRegistrationFieldSection[]).forEach((section) => {
    const scoped = next
      .filter((field) => field.localSection === section)
      .sort((left, right) => left.localSortOrder - right.localSortOrder || left.label.localeCompare(right.label, "tr"));

    scoped.forEach((field, index) => {
      const target = next.find((entry) => entry.id === field.id);
      if (target) {
        target.localSortOrder = (index + 1) * 10;
      }
    });
  });

  return next;
}

function arrayMove(fields: BuilderField[], activeId: string, targetId: string, targetSection: PreRegistrationFieldSection) {
  const current = normalizeLayout(fields);
  const activeField = current.find((field) => field.id === activeId);

  if (!activeField) {
    return current;
  }

  const remaining = current.filter((field) => field.id !== activeId);
  const destination = remaining
    .filter((field) => field.localSection === targetSection)
    .sort((left, right) => left.localSortOrder - right.localSortOrder);

  const insertIndex = targetId === "__end__" ? destination.length : Math.max(destination.findIndex((field) => field.id === targetId), 0);

  const regrouped = [...destination];
  regrouped.splice(insertIndex, 0, {
    ...activeField,
    localSection: targetSection,
  });

  const rebuilt = remaining.map((field) => ({ ...field }));
  regrouped.forEach((field, index) => {
    const target = rebuilt.find((entry) => entry.id === field.id);
    if (target) {
      target.localSection = targetSection;
      target.localSortOrder = (index + 1) * 10;
    } else {
      rebuilt.push({
        ...field,
        localSection: targetSection,
        localSortOrder: (index + 1) * 10,
      });
    }
  });

  return normalizeLayout(rebuilt);
}

function FieldCard({
  field,
  onUpdated,
}: {
  field: PreRegistrationFieldRecord;
  onUpdated: () => void;
}) {
  const [updateState, updateAction] = useActionState(updatePreRegistrationFieldAction, initialState);
  const [toggleState, toggleAction] = useActionState(togglePreRegistrationFieldStatusAction, initialState);
  const [deleteState, deleteAction] = useActionState(deletePreRegistrationFieldAction, initialState);

  useEffect(() => {
    if (updateState.success || toggleState.success || deleteState.success) {
      onUpdated();
    }
  }, [deleteState.success, onUpdated, toggleState.success, updateState.success]);

  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <form action={updateAction} className="grid gap-4">
        <input type="hidden" name="fieldId" value={field.id} />

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {field.system ? "Sistem alani" : "Ozel alan"} · {getPreRegistrationInputTypeLabel(field.inputType)}
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{field.label}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
              {sectionMeta[field.section].badge}
            </div>
          </div>
          <span
            className={
              field.active
                ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700"
                : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600"
            }
          >
            {field.active ? "Formda aktif" : "Formda gizli"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Alan etiketi</label>
            <Input name="label" defaultValue={field.label} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Alan anahtari</label>
            <Input value={field.fieldKey} disabled className="opacity-70" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Bolum</label>
            <Select name="section" defaultValue={field.section}>
              <option value="student">Ogrenci</option>
              <option value="parent">Veli</option>
              <option value="application">Basvuru</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Zorunluluk</label>
            <Select name="required" defaultValue={field.required ? "yes" : "no"}>
              <option value="yes">Zorunlu</option>
              <option value="no">Opsiyonel</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Sira</label>
            <Input name="sortOrder" type="number" min="1" max="999" defaultValue={String(field.sortOrder)} />
          </div>
        </div>

        <input type="hidden" name="active" value={field.active ? "yes" : "no"} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Placeholder</label>
            <Input name="placeholder" defaultValue={field.placeholder} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Secenekler</label>
            <Input
              name="optionsText"
              defaultValue={field.options.join(", ")}
              placeholder={field.inputType === "select" ? "A, B, C gibi virgulle ayir" : "Secim yoksa bos birak"}
              disabled={field.inputType !== "select"}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-900">Yardim metni</label>
          <Textarea name="helperText" defaultValue={field.helperText} className="min-h-24" />
        </div>

        {updateState.error ? <p className="text-sm text-destructive">{updateState.error}</p> : null}
        {updateState.success ? <p className="text-sm text-success">{updateState.success}</p> : null}

        <FormSubmitButton pendingLabel="Alan guncelleniyor...">Alani guncelle</FormSubmitButton>
      </form>

      <div className="mt-4 flex flex-wrap gap-3">
        <form action={toggleAction}>
          <input type="hidden" name="fieldId" value={field.id} />
          <input type="hidden" name="nextState" value={field.active ? "inactive" : "active"} />
          <FormSubmitButton
            variant="outline"
            pendingLabel={field.active ? "Gizleniyor..." : "Aktiflestiriliyor..."}
          >
            {field.active ? "Formdan cikar" : "Forma geri al"}
          </FormSubmitButton>
        </form>

        <form action={deleteAction}>
          <input type="hidden" name="fieldId" value={field.id} />
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

function BuilderColumn({
  section,
  fields,
  activeFieldId,
  selectedFieldId,
  onCardDragStart,
  onDropField,
  onSelectField,
}: {
  section: PreRegistrationFieldSection;
  fields: BuilderField[];
  activeFieldId: string | null;
  selectedFieldId: string | null;
  onCardDragStart: (fieldId: string) => void;
  onDropField: (targetId: string, targetSection: PreRegistrationFieldSection) => void;
  onSelectField: (fieldId: string) => void;
}) {
  const meta = sectionMeta[section];

  return (
    <div
      className={cn(
        "rounded-[1.9rem] border border-slate-200 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]",
        `bg-gradient-to-b ${meta.accent}`,
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDropField("__end__", section)}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-base font-semibold text-slate-900">{meta.title}</div>
          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {fields.length} alan
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">{meta.description}</p>
      </div>

      <div className="grid gap-3">
        {fields.length ? (
          fields.map((field) => (
            <button
              key={field.id}
              type="button"
              draggable
              onDragStart={() => onCardDragStart(field.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onDropField(field.id, section);
              }}
              onClick={() => onSelectField(field.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-[1.3rem] border p-4 text-left transition",
                selectedFieldId === field.id
                  ? "border-sky-300 bg-sky-50 shadow-[0_12px_24px_rgba(12,87,220,0.1)]"
                  : "border-slate-200 bg-white/90 hover:border-slate-300 hover:bg-white",
                activeFieldId === field.id ? "opacity-75" : "",
              )}
            >
              <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-500">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold text-slate-900">{field.label}</div>
                  {!field.active ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Gizli
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-400">
                  {getPreRegistrationInputTypeLabel(field.inputType)} · sira {field.localSortOrder}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
            Bu bolumde henuz alan yok. Sol ustten alan ekleyebilir veya bir alani buraya surukleyebilirsin.
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPreRegistrationFieldsEditor({ fields }: { fields: PreRegistrationFieldRecord[] }) {
  const router = useRouter();
  const [createState, createAction] = useActionState(createPreRegistrationFieldAction, initialState);
  const [reorderState, reorderAction] = useActionState(reorderPreRegistrationFieldsAction, initialState);
  const [builderFields, setBuilderFields] = useState<BuilderField[]>(() => buildOrderedFields(fields));
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(fields[0]?.id ?? null);

  useEffect(() => {
    if (createState.success || reorderState.success) {
      router.refresh();
    }
  }, [createState.success, reorderState.success, router]);

  const orderedFields = useMemo(() => normalizeLayout(builderFields), [builderFields]);
  const selectedField = fields.find((field) => field.id === selectedFieldId) ?? fields[0] ?? null;
  const layoutPayload = JSON.stringify(
    orderedFields.map((field) => ({
      id: field.id,
      section: field.localSection,
      sortOrder: field.localSortOrder,
    })),
  );

  function handleDrop(targetId: string, targetSection: PreRegistrationFieldSection) {
    if (!draggedFieldId) {
      return;
    }

    setBuilderFields((current) => arrayMove(current, draggedFieldId, targetId, targetSection));
    setDraggedFieldId(null);
  }

  const fieldsBySection = useMemo(
    () =>
      (Object.keys(sectionMeta) as PreRegistrationFieldSection[]).reduce(
        (accumulator, section) => {
          accumulator[section] = orderedFields
            .filter((field) => field.localSection === section)
            .sort((left, right) => left.localSortOrder - right.localSortOrder);
          return accumulator;
        },
        {} as Record<PreRegistrationFieldSection, BuilderField[]>,
      ),
    [orderedFields],
  );

  return (
    <div className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-slate-50/70 p-5">
        <div className="mb-5 flex items-start gap-4">
          <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">Yeni form alani ekle</div>
            <div className="text-sm text-slate-500">
              Ozel bir ek alan acabilir, bunu ilgili bolume tasiyabilir ve public forma ekleyebilirsin.
            </div>
          </div>
        </div>
        <form action={createAction} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Alan etiketi</label>
              <Input name="label" placeholder="Kardes bilgisi" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Alan anahtari</label>
              <Input name="fieldKey" placeholder="kardes_bilgisi" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Alan tipi</label>
              <Select name="inputType" defaultValue="text">
                <option value="text">Kisa metin</option>
                <option value="textarea">Uzun metin</option>
                <option value="date">Tarih</option>
                <option value="select">Secimli liste</option>
                <option value="email">E-posta</option>
                <option value="phone">Telefon</option>
                <option value="file">Dosya / Gorsel</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Bolum</label>
              <Select name="section" defaultValue="student">
                <option value="student">Ogrenci</option>
                <option value="parent">Veli</option>
                <option value="application">Basvuru</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Zorunluluk</label>
              <Select name="required" defaultValue="no">
                <option value="yes">Zorunlu</option>
                <option value="no">Opsiyonel</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Sira</label>
              <Input name="sortOrder" type="number" min="1" max="999" defaultValue="220" />
            </div>
          </div>
          <input type="hidden" name="active" value="yes" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Placeholder</label>
              <Input name="placeholder" placeholder="Bu alan icin ornek cevap" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Secenekler</label>
              <Input name="optionsText" placeholder="A, B, C gibi virgulle ayir" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900">Yardim metni</label>
            <Textarea name="helperText" className="min-h-24" placeholder="Bu alanin amacini kisaca acikla." />
          </div>
          {createState.error ? <p className="text-sm text-destructive">{createState.error}</p> : null}
          {createState.success ? <p className="text-sm text-success">{createState.success}</p> : null}
          <FormSubmitButton pendingLabel="Alan ekleniyor...">Alan ekle</FormSubmitButton>
        </form>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-50/60 p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Surukle-birak form kurucusu</div>
              <div className="text-sm text-slate-500">
                Alanlari istedigin bolume tasiyip sirasini surukleyerek degistir. Sonra yerlesimi kaydet.
              </div>
            </div>
          </div>

          <form action={reorderAction} className="flex items-center gap-3">
            <input type="hidden" name="layout" value={layoutPayload} />
            <FormSubmitButton variant="outline" pendingLabel="Yerlesim kaydediliyor...">
              Alan yerlesimini kaydet
            </FormSubmitButton>
          </form>
        </div>

        {reorderState.error ? <p className="mb-4 text-sm text-destructive">{reorderState.error}</p> : null}
        {reorderState.success ? <p className="mb-4 text-sm text-success">{reorderState.success}</p> : null}

        <div className="grid gap-4 xl:grid-cols-3">
          {(Object.keys(sectionMeta) as PreRegistrationFieldSection[]).map((section) => (
            <BuilderColumn
              key={section}
              section={section}
              fields={fieldsBySection[section]}
              activeFieldId={draggedFieldId}
              selectedFieldId={selectedFieldId}
              onCardDragStart={setDraggedFieldId}
              onDropField={handleDrop}
              onSelectField={setSelectedFieldId}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <ListOrdered className="h-4 w-4" />
        Alan detay editörü
      </div>

      {selectedField ? (
        <FieldCard key={selectedField.id} field={selectedField} onUpdated={() => router.refresh()} />
      ) : (
        <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
          Duzenlemek istedigin bir alani yukaridaki kurucudan sec.
        </div>
      )}
    </div>
  );
}
