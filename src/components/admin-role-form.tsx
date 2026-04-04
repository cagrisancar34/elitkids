"use client";

import { useActionState } from "react";

import {
  updateUserRoleAction,
  type AdminUserActionState,
} from "@/app/(app)/admin/users/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Select } from "@/components/ui/select";
import type { AdminUserOption } from "@/lib/types";

const initialState: AdminUserActionState = {
  error: null,
  success: null,
};

export function AdminRoleForm({ users }: { users: AdminUserOption[] }) {
  const [state, formAction] = useActionState(updateUserRoleAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="profileId">
          Kullanici
        </label>
        <Select id="profileId" name="profileId" defaultValue="">
          <option value="" disabled>
            Kullanici sec
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="role">
          Yeni rol
        </label>
        <Select id="role" name="role" defaultValue="manager">
          <option value="admin">Admin</option>
          <option value="manager">Yonetici</option>
          <option value="coach">Koc</option>
          <option value="parent">Veli</option>
        </Select>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Rol guncelleniyor...">
        Rolu guncelle
      </FormSubmitButton>
    </form>
  );
}
