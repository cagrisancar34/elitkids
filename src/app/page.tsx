import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CreditCard,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { academyProfile, marketingHighlights, roleSpotlights, sessionRecords } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const featureIcons = [UsersRound, CalendarRange, CreditCard, ShieldCheck];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f7f9fb_0%,#eef2f5_100%)]">
        <div className="hero-grid absolute inset-0 opacity-80" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(2,83,205,0.12),_transparent_60%)]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 pb-10 pt-5 lg:px-8">
          <nav className="glass-panel stadium-shadow flex items-center justify-between rounded-[1.7rem] border border-white/50 px-5 py-4">
            <BrandMark />
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/manager" className={cn(buttonVariants({ variant: "ghost" }))}>
                Yonetici onizlemesi
              </Link>
              <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
                Giris akisini ac
              </Link>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
            <div className="max-w-3xl">
              <div className="fade-up inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Stitch referansli shadcn arayuzu
              </div>
              <h1 className="fade-up fade-up-delay balance mt-8 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-[var(--hero-ink)] md:text-7xl">
                Buz ustundeki operasyonu kayittan tahsilata kadar ayni ritimde yoneten tek sistem.
              </h1>
              <p className="fade-up fade-up-late mt-6 max-w-2xl text-lg leading-8 text-[#44506a]">
                {academyProfile.promise} Marketing yuzu tam ekran, uygulama yuzu ise Stitch&apos;te tasarlanan sakin ve profesyonel dashboard hissiyle kurgulandi.
              </p>
              <div className="fade-up fade-up-late mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
                  Platforma gir
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/parent" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  Veli panelini gor
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {marketingHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-white/70 bg-white/70 px-4 py-4 text-sm leading-6 text-[#44506a] shadow-[0_12px_30px_rgba(17,34,70,0.08)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.2rem] bg-[linear-gradient(135deg,rgba(2,83,205,0.12),rgba(255,255,255,0.36))] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] p-5 text-white shadow-[0_30px_70px_rgba(10,16,24,0.28)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/64">
                      Operasyon canli gorunumu
                    </div>
                    <div className="mt-2 font-display text-3xl font-semibold">
                      19 seans / 312 aktif sporcu
                    </div>
                  </div>
                  <div className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium">
                    {academyProfile.season}
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {sessionRecords.map((session) => (
                    <div
                      key={session.title}
                      className="rounded-[1.6rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{session.title}</div>
                          <div className="mt-1 text-sm text-white/64">
                            {session.slot} · {session.location}
                          </div>
                        </div>
                        <div className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium">
                          {session.roster}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {Object.entries(roleSpotlights).map(([role, summary]) => (
                    <div key={role} className="rounded-[1.4rem] bg-white/8 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/58">{role}</div>
                      <p className="mt-2 text-sm leading-6 text-white/76">{summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1500px] px-5 py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {[
            "Cok rollu erisim ve kurum ici operasyon",
            "Yonetici icin veri yogun ama sakin dashboard ritmi",
            "Koclar icin saha odakli hizli aksiyonlar",
            "Veliler icin mobil once, net ve guven verici deneyim",
          ].map((feature, index) => {
            const Icon = featureIcons[index];

            return (
              <Card key={feature}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl">{feature}</CardTitle>
                  <CardDescription>
                    Supabase tabanli veri modeli, shadcn/ui bilesenleri ve Stitch&apos;te kurulan editoryal dashboard dili tek omurgada bulusur.
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
