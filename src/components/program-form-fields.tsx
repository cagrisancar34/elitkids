"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProgramFormOptions, ProgramRecord } from "@/lib/types";

type ProgramFormValues = {
  title?: string;
  programTypeId?: string;
  seasonId?: string;
  categoryId?: string;
  branchId?: string;
  sportsBranchId?: string;
  coachProfileId?: string;
  areaId?: string;
  ageBand?: string;
  capacity?: number | string;
  monthlyPrice?: number | string;
  status?: "active" | "draft" | "paused" | string;
  notes?: string;
  monthlyLessonQuota?: number | string;
};

function labelClassName() {
  return "text-sm font-semibold text-foreground";
}

function eyebrowClassName() {
  return "text-[11px] font-semibold uppercase tracking-[0.18em] text-primary";
}

function getDefaultProgramValues(
  options: ProgramFormOptions,
  values?: ProgramFormValues | ProgramRecord,
): Required<ProgramFormValues> {
  const programTypeId = values?.programTypeId ?? options.programTypes[0]?.id ?? "";
  const seasonId = values?.seasonId ?? options.seasons[0]?.id ?? "";
  const categoryId = values?.categoryId ?? options.categories[0]?.id ?? "";
  const branchId = values?.branchId ?? options.branches[0]?.id ?? "";
  const sportsBranchId = values?.sportsBranchId ?? options.sportsBranches[0]?.id ?? "";
  const coachProfileId = values?.coachProfileId ?? options.coaches[0]?.id ?? "";

  const candidateAreaId =
    values?.areaId ??
    options.areas.find((area) => area.branchId === branchId)?.id ??
    options.areas[0]?.id ??
    "";

  return {
    title: values?.title ?? "",
    programTypeId,
    seasonId,
    categoryId,
    branchId,
    sportsBranchId,
    coachProfileId,
    areaId: candidateAreaId,
    ageBand: values?.ageBand ?? "",
    capacity: values?.capacity ?? "",
    monthlyPrice: values?.monthlyPrice ?? "",
    status: values?.status ?? "active",
    notes: values?.notes ?? "",
    monthlyLessonQuota: values?.monthlyLessonQuota ?? 8,
  };
}

export function ProgramFormFields({
  options,
  values,
  idPrefix,
}: {
  options: ProgramFormOptions;
  values?: ProgramFormValues | ProgramRecord;
  idPrefix: string;
}) {
  const defaults = getDefaultProgramValues(options, values);
  const areasForBranch = options.areas.filter((area) => !defaults.branchId || !area.branchId || area.branchId === defaults.branchId);

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <span className={eyebrowClassName()}>Program karti</span>
        <div className="font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-foreground">
          {values ? "Programi guncelle" : "Yeni Program"}
        </div>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Program, egitmen, brans ve kapasite akisini bu alandan yonetin.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-title`}>
            Program adi
          </label>
          <Input id={`${idPrefix}-title`} name="title" defaultValue={defaults.title} placeholder="Elit Grup" />
        </div>
        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-program-type`}>
            Program tipi
          </label>
          <Select id={`${idPrefix}-program-type`} name="programTypeId" defaultValue={defaults.programTypeId}>
            {options.programTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-season`}>
            Sezon
          </label>
          <Select id={`${idPrefix}-season`} name="seasonId" defaultValue={defaults.seasonId}>
            {options.seasons.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-category`}>
            Kategori
          </label>
          <Select id={`${idPrefix}-category`} name="categoryId" defaultValue={defaults.categoryId}>
            {options.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-sports-branch`}>
            Brans
          </label>
          <Select id={`${idPrefix}-sports-branch`} name="sportsBranchId" defaultValue={defaults.sportsBranchId}>
            {options.sportsBranches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-coach`}>
            Egitmen
          </label>
          <Select id={`${idPrefix}-coach`} name="coachProfileId" defaultValue={defaults.coachProfileId}>
            {options.coaches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-branch`}>
            Sube
          </label>
          <Select id={`${idPrefix}-branch`} name="branchId" defaultValue={defaults.branchId}>
            {options.branches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-area`}>
            Alan / Pist
          </label>
          <Select id={`${idPrefix}-area`} name="areaId" defaultValue={defaults.areaId}>
            {(areasForBranch.length ? areasForBranch : options.areas).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-capacity`}>
            Kontenjan
          </label>
          <Input
            id={`${idPrefix}-capacity`}
            name="capacity"
            type="number"
            min="1"
            step="1"
            defaultValue={String(defaults.capacity)}
            placeholder="12"
          />
        </div>
        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-age-band`}>
            Yas bandi
          </label>
          <Input
            id={`${idPrefix}-age-band`}
            name="ageBand"
            defaultValue={defaults.ageBand}
            placeholder="8-12 Yas"
          />
        </div>

        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-status`}>
            Durum
          </label>
          <Select id={`${idPrefix}-status`} name="status" defaultValue={defaults.status}>
            <option value="active">Aktif</option>
            <option value="draft">Taslak</option>
            <option value="paused">Pasif</option>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-price`}>
            Aylik ucret
          </label>
          <Input
            id={`${idPrefix}-price`}
            name="monthlyPrice"
            type="number"
            min="1"
            step="1"
            defaultValue={String(defaults.monthlyPrice)}
            placeholder="4800"
          />
        </div>

        <div className="grid gap-2">
          <label className={labelClassName()} htmlFor={`${idPrefix}-quota`}>
            Aylik ders hakki
          </label>
          <Input
            id={`${idPrefix}-quota`}
            name="monthlyLessonQuota"
            type="number"
            min="1"
            step="1"
            defaultValue={String(defaults.monthlyLessonQuota)}
            placeholder="8"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className={labelClassName()} htmlFor={`${idPrefix}-notes`}>
          Notlar
        </label>
        <Textarea
          id={`${idPrefix}-notes`}
          name="notes"
          defaultValue={defaults.notes}
          placeholder="Programin ritmi, hedefi veya operasyon notlari"
          className="min-h-32"
        />
      </div>
    </div>
  );
}
