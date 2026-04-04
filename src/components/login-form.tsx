"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound } from "lucide-react";

import {
  signInWithDemoRole,
  signInWithPassword,
  type AuthActionState,
} from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { roleLabels } from "@/lib/navigation";
import { credentialsSchema, type CredentialsSchema } from "@/lib/schemas/auth";
import type { AppRole } from "@/lib/types";

const roles: AppRole[] = ["admin", "manager", "coach", "parent"];

export function LoginForm({ supabaseEnabled }: { supabaseEnabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<CredentialsSchema>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handlePasswordSignIn(values: CredentialsSchema) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", values.email);
      formData.set("password", values.password);

      const result: AuthActionState = await signInWithPassword({ error: null }, formData);
      setMessage(result.error);
    });
  }

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
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(handlePasswordSignIn)}
          >
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                E-posta
              </label>
              <Input id="email" type="email" placeholder="ornek@elitkids.com" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Sifre
              </label>
              <Input id="password" type="password" placeholder="En az 8 karakter" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            <Button type="submit" disabled={isPending}>
              <KeyRound className="h-4 w-4" />
              Supabase ile giris yap
            </Button>
            {message ? <p className="text-sm leading-6 text-muted-foreground">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
