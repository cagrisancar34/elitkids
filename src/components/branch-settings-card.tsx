"use client";

import { useActionState } from "react";

import {
  toggleBranchArchiveAction,
  toggleBranchStatusAction,
  type SettingsActionState,
  updateBranchAction,
} from "@/app/(app)/admin/settings/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import type { BranchSetting } from "@/lib/types";

const initialState: SettingsActionState = {
  error: null,
  success: null,
};

export function BranchSettingsCard({ branch }: { branch: BranchSetting }) {
  const [editState, editAction] = useActionState(updateBranchAction, initialState);
  const [statusState, statusAction] = useActionState(toggleBranchStatusAction, initialState);
  const [archiveState, archiveAction] = useActionState(toggleBranchArchiveAction, initialState);

  return (
    <div className="rounded-[1.25rem] bg-accent p-4">
      <form action={editAction} className="grid gap-3">
        <input type="hidden" name="branchId" value={branch.id} />
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={`branch-name-${branch.id}`}>
            Sube adi
          </label>
          <Input
            id={`branch-name-${branch.id}`}
            name="name"
            defaultValue={branch.name}
            className="bg-white"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={`branch-slug-${branch.id}`}>
            Slug
          </label>
          <Input
            id={`branch-slug-${branch.id}`}
            name="slug"
            defaultValue={branch.slug}
            className="bg-white"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={`branch-location-${branch.id}`}>
            Lokasyon
          </label>
          <Input
            id={`branch-location-${branch.id}`}
            name="location"
            defaultValue={branch.location}
            className="bg-white"
          />
        </div>
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {branch.status}
        </div>
        {branch.archived ? (
          <p className="text-xs leading-5 text-muted-foreground">
            Bu sube arsivde tutuluyor. Gecmis seans ve kayit baglantilari korunur.
          </p>
        ) : null}
        {editState.error ? <p className="text-sm text-destructive">{editState.error}</p> : null}
        {editState.success ? <p className="text-sm text-success">{editState.success}</p> : null}
        <FormSubmitButton
          size="sm"
          className="w-full"
          pendingLabel="Kaydediliyor..."
          disabled={branch.archived}
        >
          Sube bilgilerini guncelle
        </FormSubmitButton>
      </form>

      {!branch.archived ? (
        <form action={statusAction} className="mt-3 grid gap-2">
          <input type="hidden" name="branchId" value={branch.id} />
          <input type="hidden" name="nextState" value={branch.active ? "inactive" : "active"} />
          {statusState.error ? <p className="text-sm text-destructive">{statusState.error}</p> : null}
          {statusState.success ? <p className="text-sm text-success">{statusState.success}</p> : null}
          <FormSubmitButton variant="outline" size="sm" pendingLabel="Guncelleniyor...">
            {branch.active ? "Pasife al" : "Aktif yap"}
          </FormSubmitButton>
        </form>
      ) : null}

      <form action={archiveAction} className="mt-3 grid gap-2">
        <input type="hidden" name="branchId" value={branch.id} />
        <input type="hidden" name="nextState" value={branch.archived ? "restore" : "archive"} />
        {archiveState.error ? <p className="text-sm text-destructive">{archiveState.error}</p> : null}
        {archiveState.success ? <p className="text-sm text-success">{archiveState.success}</p> : null}
        <FormSubmitButton variant="outline" size="sm" pendingLabel="Guncelleniyor...">
          {branch.archived ? "Arsivden cikar" : "Guvenli arsivle"}
        </FormSubmitButton>
      </form>
    </div>
  );
}
