"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, KeyRound } from "lucide-react";

import {
  signInWithDemoRole,
  signInWithPassword,
} from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { roleLabels } from "@/lib/navigation";
import type { AppRole } from "@/lib/types";

const roles: AppRole[] = ["admin", "manager", "coach", "parent"];
const initialAuthState = {
  error: null,
};

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <KeyRound className="h-4 w-4" />
      {pending ? "Giris yapiliyor..." : "Supabase ile giris yap"}
    </Button>
  );
}

export function LoginForm({ supabaseEnabled }: { supabaseEnabled: boolean }) {
  const [state, formAction] = useActionState(signInWithPassword, initialAuthState);

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>{supabaseEnabled ? "Demo gecisi" : "Canli demo gecisi"}</CardTitle>
          <CardDescription>
            Rol bazli ekranlari hizlica gezmek icin bir demo oturumu baslat.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {roles.map((role) => (
            <form key={role} action={signInWithDemoRole}>
              <input type="hidden" name="role" value={role} />
              <Button type="submit" variant={role === "manager" ? "default" : "secondary"} className="w-full justify-between">
                {roleLabels[role]} paneline gir
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase girisi</CardTitle>
          <CardDescription>
            {supabaseEnabled
              ? "Bu form artik Supabase Auth ile gercek oturum acar ve kullaniciyi rolune gore yonlendirir."
              : "Canli auth icin .env.local icinde Supabase URL ve publishable key tanimlanmali."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" action={formAction}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                E-posta
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@elitkids.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Sifre
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="En az 8 karakter"
                autoComplete="current-password"
                required
              />
            </div>
            <SignInButton />
            {state.error ? <p className="text-sm leading-6 text-muted-foreground">{state.error}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
