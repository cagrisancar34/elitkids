import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";
import { buttonVariants } from "@/components/ui/button";
import { academyProfile } from "@/lib/mock-data";
import { redirectIfAuthenticated } from "@/lib/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  const { isConfigured } = getSupabaseConfig();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(2,83,205,0.12),_transparent_24%),linear-gradient(180deg,#f7f9fb_0%,#eef2f5_100%)] px-5 py-5 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1450px] overflow-hidden rounded-[2.1rem] border border-white/60 bg-white/70 shadow-[0_30px_70px_rgba(44,47,49,0.08)] lg:grid-cols-[minmax(0,1.08fr)_minmax(430px,0.92fr)]">
        <section className="hero-grid relative overflow-hidden bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] px-6 py-6 text-white lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(120,157,255,0.18),_transparent_28%)]" />
          <div className="relative flex h-full flex-col">
            <BrandMark inverse />
            <div className="my-auto max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/72">
                <LockKeyhole className="h-3.5 w-3.5" />
                Yetkili giris
              </div>
              <h1 className="mt-8 font-display text-5xl font-semibold tracking-tight">
                Admin, yonetici, koc ve veli ayni urunde ama kendi ritminde calisir.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/74">
                {academyProfile.name} icin hazirlanan bu iskelet, Supabase auth ve RLS ile role-based deneyimi guvenli sekilde buyutmek uzere tasarlandi.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
                  Ana sayfaya don
                </Link>
                <Link href="/manager" className={cn(buttonVariants({ variant: "ghost" }), "border border-white/14 bg-white/8 text-white hover:bg-white/14")}>
                  Yonetici arayuzune bak
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-muted flex items-center px-5 py-8 lg:px-8">
          <div className="mx-auto w-full max-w-lg">
            <LoginForm supabaseEnabled={isConfigured} />
          </div>
        </section>
      </div>
    </div>
  );
}
