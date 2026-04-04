"use client";

import { useActionState } from "react";

import {
  toggleSeasonDefaultAction,
  toggleSeasonStatusAction,
  type SettingsActionState,
  updateSeasonAction,
} from "@/app/(app)/admin/settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SeasonSetting } from "@/lib/types";

const initialState: SettingsActionState = {
  error: null,
  success: null,
};

export function SeasonSettingsCard({ season }: { season: SeasonSetting }) {
  const [editState, editAction] = useActionState(updateSeasonAction, initialState);
  const [statusState, statusAction] = useActionState(toggleSeasonStatusAction, initialState);
  const [defaultState, defaultAction] = useActionState(toggleSeasonDefaultAction, initialState);

  return (
    <div className="rounded-[1.25rem] bg-accent p-4">
      <form action={editAction} className="grid gap-3">
        <input type="hidden" name="seasonId" value={season.id} />
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={`season-title-${season.id}`}>
            Sezon adi
          </label>
          <Input
            id={`season-title-${season.id}`}
            name="title"
            defaultValue={season.title}
            className="bg-white"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`season-start-${season.id}`}>
              Baslangic
            </label>
            <Input
              id={`season-start-${season.id}`}
              name="startsOn"
              type="date"
              defaultValue={season.startsOn}
              className="bg-white"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor={`season-end-${season.id}`}>
              Bitis
            </label>
            <Input
              id={`season-end-${season.id}`}
              name="endsOn"
              type="date"
              defaultValue={season.endsOn}
              className="bg-white"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={`season-active-${season.id}`}>
            Durum
          </label>
          <Select
            id={`season-active-${season.id}`}
            name="makeActive"
            defaultValue={season.isActive ? "yes" : "no"}
          >
            <option value="yes">Aktif sezon yap</option>
            <option value="no">Planli olarak tut</option>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={`season-default-${season.id}`}>
            Varsayilan etiketi
          </label>
          <Select
            id={`season-default-${season.id}`}
            name="makeDefault"
            defaultValue={season.isDefault ? "yes" : "no"}
          >
            <option value="yes">Varsayilan sezon</option>
            <option value="no">Varsayilan olmasin</option>
          </Select>
        </div>
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {season.duration} · {season.status}
          {season.isDefault ? " · Varsayilan" : ""}
        </div>
        {editState.error ? <p className="text-sm text-destructive">{editState.error}</p> : null}
        {editState.success ? <p className="text-sm text-success">{editState.success}</p> : null}
        <FormSubmitButton size="sm" className="w-full" pendingLabel="Kaydediliyor...">
          Sezonu guncelle
        </FormSubmitButton>
      </form>

      <form action={statusAction} className="mt-3 grid gap-2">
        <input type="hidden" name="seasonId" value={season.id} />
        <input type="hidden" name="nextState" value={season.isActive ? "inactive" : "active"} />
        {statusState.error ? <p className="text-sm text-destructive">{statusState.error}</p> : null}
        {statusState.success ? <p className="text-sm text-success">{statusState.success}</p> : null}
        <FormSubmitButton variant="outline" size="sm" pendingLabel="Guncelleniyor...">
          {season.isActive ? "Planli duruma al" : "Aktif yap"}
        </FormSubmitButton>
      </form>

      <form action={defaultAction} className="mt-3 grid gap-2">
        <input type="hidden" name="seasonId" value={season.id} />
        <input type="hidden" name="nextState" value={season.isDefault ? "clear" : "default"} />
        {defaultState.error ? <p className="text-sm text-destructive">{defaultState.error}</p> : null}
        {defaultState.success ? <p className="text-sm text-success">{defaultState.success}</p> : null}
        <FormSubmitButton variant="outline" size="sm" pendingLabel="Guncelleniyor...">
          {season.isDefault ? "Varsayilan etiketi kaldir" : "Varsayilan sezon yap"}
        </FormSubmitButton>
      </form>
    </div>
  );
}
