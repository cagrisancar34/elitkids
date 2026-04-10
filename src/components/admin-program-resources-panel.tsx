"use client";

import { useActionState } from "react";

import {
  createAreaAction,
  createCategoryAction,
  createProgramTypeAction,
  createSportsBranchAction,
  deleteCatalogResourceAction,
  initialProgramResourceActionState,
  type ProgramResourceActionState,
} from "@/app/(app)/admin/program-resources/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Area, Category, ProgramType, SportsBranch } from "@/lib/types";

type BranchOption = {
  id: string;
  label: string;
};

type ResourceSectionProps = {
  title: string;
  description: string;
  resourceType: "programType" | "category" | "sportsBranch" | "area";
  items: Array<ProgramType | Category | SportsBranch | Area>;
  branches?: BranchOption[];
};

function ResourceDeleteButton({
  resourceId,
  resourceType,
}: {
  resourceId: string;
  resourceType: ResourceSectionProps["resourceType"];
}) {
  const [deleteState, deleteAction] = useActionState(deleteCatalogResourceAction, initialProgramResourceActionState);

  return (
    <form action={deleteAction} className="grid gap-2">
      <input type="hidden" name="resourceId" value={resourceId} />
      <input type="hidden" name="resourceType" value={resourceType} />
      <Button type="submit" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5">
        Sil
      </Button>
      {deleteState.error ? <p className="text-xs text-destructive">{deleteState.error}</p> : null}
      {deleteState.success ? <p className="text-xs text-emerald-700">{deleteState.success}</p> : null}
    </form>
  );
}

function ResourceSection({
  title,
  description,
  resourceType,
  items,
  branches = [],
}: ResourceSectionProps) {
  const createAction =
    resourceType === "programType"
      ? createProgramTypeAction
      : resourceType === "category"
        ? createCategoryAction
        : resourceType === "sportsBranch"
          ? createSportsBranchAction
          : createAreaAction;
  const [state, action] = useActionState<ProgramResourceActionState, FormData>(createAction, initialProgramResourceActionState);

  return (
    <div className="grid gap-5 rounded-[1.7rem] border border-white/50 bg-white/92 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
      <div>
        <h3 className="font-display text-[1.7rem] font-semibold tracking-[-0.05em] text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <form action={action} className="grid gap-4 rounded-[1.35rem] border border-[#d9e3f5] bg-[#eef3ff] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Ad</label>
            <Input name="name" placeholder={`${title} adi`} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Slug</label>
            <Input name="slug" placeholder="ornek-slug" />
          </div>
        </div>

        {resourceType === "area" ? (
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Bagli sube</label>
            <Select name="branchId" defaultValue="">
              <option value="">Subesiz / ortak alan</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

        <div className="flex justify-end">
          <FormSubmitButton pendingLabel="Kaydediliyor...">{title} ekle</FormSubmitButton>
        </div>
      </form>

      <div className="grid gap-3">
        {items.length ? (
          items.map((item) => {
            const areaItem = resourceType === "area" ? (item as Area) : null;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[1.35rem] border border-[#d9e3f5] bg-[#f8fbff] px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-base font-semibold text-foreground">{item.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.slug ?? "slug yok"}</div>
                  {areaItem?.branchName ? (
                    <div className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {areaItem.branchName}
                    </div>
                  ) : null}
                </div>
                <ResourceDeleteButton resourceId={item.id} resourceType={resourceType} />
              </div>
            );
          })
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[#d6dfef] bg-[#f8fbff] px-5 py-6 text-sm leading-6 text-muted-foreground">
            Henuz kayit yok. Manager tarafindaki select alanlarini zenginlestirmek icin ilk kaynagi buradan ekleyebilirsin.
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminProgramResourcesPanel({
  branches,
  programTypes,
  categories,
  sportsBranches,
  areas,
}: {
  branches: BranchOption[];
  programTypes: ProgramType[];
  categories: Category[];
  sportsBranches: SportsBranch[];
  areas: Area[];
}) {
  return (
    <div className="grid gap-6">
      <ResourceSection
        title="Program tipleri"
        description="Grup dersi, ozel ders ve deneme gibi secenekler program kartlarindaki tip alanini besler."
        resourceType="programType"
        items={programTypes}
      />
      <ResourceSection
        title="Kategoriler"
        description="Yas veya seviye segmentleri olarak program ve ogrenci listelerinde ayni sekilde gorunur."
        resourceType="category"
        items={categories}
      />
      <ResourceSection
        title="Branslar"
        description="Takvim filtreleri, program kartlari ve raporlar ayni brans sozlugunu kullanir."
        resourceType="sportsBranch"
        items={sportsBranches}
      />
      <ResourceSection
        title="Alan / Pistler"
        description="Seans planlama modalindaki alan secimi ve haftalik takvim hucreleri bu kaynaktan beslenir."
        resourceType="area"
        items={areas}
        branches={branches}
      />
    </div>
  );
}
