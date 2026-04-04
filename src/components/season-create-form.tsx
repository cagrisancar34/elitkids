"use client";

import { useActionState } from "react";

import {
  createSeasonAction,
  type SettingsActionState,
} from "@/app/(app)/admin/settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const initialState: SettingsActionState = {
  error: null,
  success: null,
};

export function SeasonCreateForm() {
  const [state, formAction] = useActionState(createSeasonAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="title">
          Sezon adi
        </label>
        <Input id="title" name="title" placeholder="2026 Bahar Donemi" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="startsOn">
            Baslangic
          </label>
          <Input id="startsOn" name="startsOn" type="date" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="endsOn">
            Bitis
          </label>
          <Input id="endsOn" name="endsOn" type="date" />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="makeActive">
          Durum
        </label>
        <Select id="makeActive" name="makeActive" defaultValue="yes">
          <option value="yes">Olustur ve aktif yap</option>
          <option value="no">Sadece planli ekle</option>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="makeDefault">
          Varsayilan etiketi
        </label>
        <Select id="makeDefault" name="makeDefault" defaultValue="yes">
          <option value="yes">Varsayilan sezon yap</option>
          <option value="no">Varsayilan olmasin</option>
        </Select>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Sezon olusturuluyor...">
        Sezon olustur
      </FormSubmitButton>
    </form>
  );
}
