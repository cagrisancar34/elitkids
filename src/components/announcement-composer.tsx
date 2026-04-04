"use client";

import { useActionState } from "react";

import {
  createAnnouncementAction,
  type AnnouncementActionState,
} from "@/app/(app)/manager/announcements/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: AnnouncementActionState = {
  error: null,
  success: null,
};

export function AnnouncementComposer() {
  const [state, formAction] = useActionState(createAnnouncementAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="title">
          Baslik
        </label>
        <Input id="title" name="title" placeholder="Duyuru basligi" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="audienceRole">
          Hedef rol
        </label>
        <Select id="audienceRole" name="audienceRole" defaultValue="all">
          <option value="all">Tum kullanicilar</option>
          <option value="manager">Yoneticiler</option>
          <option value="coach">Koclar</option>
          <option value="parent">Veliler</option>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="body">
          Metin
        </label>
        <Textarea id="body" name="body" placeholder="Yayinlanacak duyuru metni" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <FormSubmitButton className="w-full" pendingLabel="Duyuru yayinlaniyor...">
        Duyuru yayinla
      </FormSubmitButton>
    </form>
  );
}
