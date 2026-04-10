"use client";

import { useActionState } from "react";

import {
  createManagedUserAction,
  type AdminUserActionState,
} from "@/app/(app)/admin/users/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const initialState: AdminUserActionState = {
  error: null,
  success: null,
};

export function AdminUserCreateForm({ adminEnabled }: { adminEnabled: boolean }) {
  const [state, formAction] = useActionState(createManagedUserAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="fullName">
          Ad soyad
        </label>
        <Input id="fullName" name="fullName" placeholder="Yeni ekip kullanicisi" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          E-posta
        </label>
        <Input id="email" name="email" type="email" placeholder="kullanici@elitkids.com" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Gecici sifre
        </label>
        <Input id="password" name="password" type="password" placeholder="ElitKids123" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="phone">
          Telefon / WhatsApp
        </label>
        <Input id="phone" name="phone" type="tel" placeholder="+90 5xx xxx xx xx" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="whatsappOptIn">
          WhatsApp izni
        </label>
        <Select id="whatsappOptIn" name="whatsappOptIn" defaultValue="no">
          <option value="no">Izin yok</option>
          <option value="yes">Izin var</option>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="role">
          Rol
        </label>
        <Select id="role" name="role" defaultValue="manager">
          <option value="admin">Admin</option>
          <option value="manager">Yonetici</option>
          <option value="coach">Koc</option>
          <option value="parent">Veli</option>
        </Select>
      </div>
      {!adminEnabled ? (
        <p className="text-sm text-destructive">
          Kullanici olusturma icin deploy ortaminda yonetici yazma secret&apos;i tanimli olmali.
        </p>
      ) : null}
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Kullanici olusturuluyor..." disabled={!adminEnabled}>
        Kullanici olustur
      </FormSubmitButton>
    </form>
  );
}
