"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  MessageSquareQuote,
  Search,
  Settings2,
  ShieldCheck,
  Timer,
  UsersRound,
} from "lucide-react";

import { signOut } from "@/app/(auth)/login/actions";
import { BrandMark } from "@/components/brand-mark";
import type { DashboardContextCard, DashboardPrimaryAction } from "@/components/dashboard-page";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navigationByRole, roleLabels } from "@/lib/navigation";
import type { AppRole } from "@/lib/types";

type AppShellProps = {
  role: AppRole;
  title: string;
  description: string;
  eyebrow?: string;
  contextCard?: DashboardContextCard;
  primaryAction?: DashboardPrimaryAction;
  children: React.ReactNode;
};

export function AppShell({
  role,
  title,
  description,
  eyebrow,
  contextCard,
  primaryAction,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const navigation = navigationByRole[role];
  const quickAction = getQuickAction(role);
  const headerAction = primaryAction ?? quickAction;
  const heroContext = contextCard ?? getDefaultContextCard(role);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(2,83,205,0.12),transparent_18%),linear-gradient(180deg,#f7f9fb_0%,#f1f4f6_100%)]">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col lg:overflow-hidden lg:bg-[linear-gradient(180deg,#0b0f10_0%,#12181a_100%)] lg:px-4 lg:py-4 lg:text-[var(--rail-foreground)] lg:shadow-[20px_0_40px_rgba(0,0,0,0.18)]">
        <div className="rounded-[1.75rem] bg-white/4 px-4 py-5">
          <BrandMark inverse />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-2">
          <div className="mt-6 rounded-[1.5rem] bg-white/6 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Aktif yuzey</div>
            <div className="mt-2 font-display text-[1.75rem] font-semibold">{roleLabels[role]}</div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Stitch shadcn duzeni, Supabase ile calisan operasyon akisina dogrudan aktarildi.
            </p>
          </div>

          <nav className="mt-8 space-y-1.5 px-2 pr-3">
            {navigation.map((item) => {
              const active =
                pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
              const Icon = getNavIcon(item.href, item.label);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  className={cn(
                    "pulse-strip group flex items-start gap-3 rounded-[1.15rem] px-4 py-3.5 transition-all",
                    active
                      ? "bg-[#d5e3fc] text-[#0b0f10] shadow-[0_0_15px_rgba(2,83,205,0.22)]"
                      : "text-white/58 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className={cn("mt-0.5 h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-white/55")} />
                  <div className="space-y-1">
                    <div className={cn("font-medium", active ? "text-foreground" : "text-white/86")}>
                      {item.label}
                    </div>
                    <div className={cn("text-sm leading-5", active ? "text-foreground/62" : "text-white/45")}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-3 space-y-3 px-2 pb-2">
          <Link
            href={quickAction.href}
            className="flex items-center justify-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#0253cd,#0048b5)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(2,83,205,0.22)]"
          >
            {quickAction.label}
          </Link>
          <div className="rounded-[1.25rem] bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <ShieldCheck className="h-4 w-4 text-[#789dff]" />
              Supabase ve RLS hazir
            </div>
            <p className="mt-2 text-sm leading-6 text-white/48">
              Yetki ayrimi ve veri akislari ayni sport-tech omurgada calisiyor.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <div className="mx-auto flex min-h-screen max-w-[1720px] flex-col px-4 py-4 lg:px-8">
          <header className="glass-panel stadium-shadow sticky top-4 z-20 rounded-[1.7rem] border border-white/50 px-4 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="lg:hidden">
                  <BrandMark />
                </div>
                <div className="hidden min-w-[320px] items-center gap-3 rounded-full bg-[#eef1f3] px-4 py-3 xl:flex">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder={getSearchPlaceholder(role)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={headerAction.href} className={cn(buttonVariants({ size: "sm" }), "h-11 rounded-full px-5")}>
                  {headerAction.label}
                </Link>
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-muted-foreground transition-colors hover:text-foreground">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-muted-foreground transition-colors hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                </button>
                <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
                  <LogIn className="h-4 w-4" />
                  Rol degistir
                </Link>
                <form action={signOut}>
                  <Button type="submit" variant="ghost">
                    Oturumu kapat
                  </Button>
                </form>
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-8 py-6">
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
              <div className="space-y-4">
                {eyebrow ? (
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    {eyebrow}
                  </div>
                ) : null}
                <div className="space-y-3">
                  <h1 className="max-w-4xl font-display text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.05em] text-foreground md:text-[3.5rem]">
                    {title}
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="surface-panel rounded-[1.9rem] border border-white/50 p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {heroContext.eyebrow}
                </div>
                <div className="mt-3 font-display text-2xl font-semibold text-foreground">
                  {heroContext.title}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {heroContext.description}
                </p>
                {heroContext.badge ? (
                  <div className="mt-5 inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                    {heroContext.badge}
                  </div>
                ) : null}
              </div>
            </section>

            <div className="flex flex-1 flex-col gap-6">{children}</div>
          </main>

          <footer className="px-1 pb-6 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span>Elit Kids Akademi</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>Next.js 16</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>Supabase</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>shadcn/ui temali arayuz</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function getDefaultContextCard(role: AppRole): DashboardContextCard {
  return {
    eyebrow: "Calisma baglami",
    title: roleLabels[role],
    description:
      "Stitch ekranlarindaki data-once ritmi; koyu rail, sakin yuzey katmanlari ve hizli taranan paneller ile korunuyor.",
    badge: "Aktif operasyon",
  };
}

function getNavIcon(href: string, label: string) {
  const value = `${href} ${label}`.toLocaleLowerCase("tr-TR");

  if (value.includes("ogrenci") || value.includes("kullanici") || value.includes("veli")) {
    return UsersRound;
  }

  if (value.includes("finans") || value.includes("odeme") || value.includes("borc")) {
    return CreditCard;
  }

  if (value.includes("duyuru") || value.includes("destek")) {
    return MessageSquareQuote;
  }

  if (value.includes("seans") || value.includes("yoklama")) {
    return Timer;
  }

  if (value.includes("program") || value.includes("takvim")) {
    return CalendarDays;
  }

  if (value.includes("ayar") || value.includes("guvenlik")) {
    return Settings2;
  }

  return LayoutDashboard;
}

function getSearchPlaceholder(role: AppRole) {
  if (role === "parent") {
    return "Ders, odeme veya duyuru ara...";
  }

  if (role === "coach") {
    return "Seans veya ogrenci ara...";
  }

  if (role === "admin") {
    return "Kullanici, rol veya ayar ara...";
  }

  return "Ogrenci, veli veya program ara...";
}

function getQuickAction(role: AppRole) {
  if (role === "admin") {
    return { href: "/admin/users" as Route, label: "Yeni davet" };
  }

  if (role === "coach") {
    return { href: "/coach/sessions" as Route, label: "Yoklamaya git" };
  }

  if (role === "parent") {
    return { href: "/parent/support" as Route, label: "Destek talebi" };
  }

  return { href: "/manager/students" as Route, label: "Yeni kayit" };
}
