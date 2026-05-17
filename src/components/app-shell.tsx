"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageSquareQuote,
  Search,
  Shield,
  Settings2,
  ShieldCheck,
  Timer,
  UsersRound,
} from "lucide-react";

import { signOut } from "@/app/(auth)/login/actions";
import { AdminDocumentationCenter } from "@/components/admin-documentation-center";
import { BrandMark } from "@/components/brand-mark";
import type { DashboardContextCard, DashboardPrimaryAction } from "@/components/dashboard-page";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navigationSectionsByRole, roleHomeRoutes, roleLabels } from "@/lib/navigation";
import type { AppNotificationItem, AppRole, NavSectionId, RoleNavSection } from "@/lib/types";

type AppShellProps = {
  role: AppRole;
  title: string;
  description?: string;
  eyebrow?: string;
  contextCard?: DashboardContextCard;
  primaryAction?: DashboardPrimaryAction;
  headerActionSlot?: React.ReactNode;
  hidePrimaryAction?: boolean;
  children: React.ReactNode;
};

export function AppShell({
  role,
  title,
  description,
  eyebrow,
  contextCard,
  primaryAction,
  headerActionSlot,
  hidePrimaryAction = false,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navigationSections = navigationSectionsByRole[role];
  const quickAction = getQuickAction(role);
  const headerAction = primaryAction ?? quickAction;
  const heroContext = contextCard ?? null;
  const useLeadNotifications = role === "admin" || role === "manager";
  const initialSection = useMemo(
    () => resolveNavSection(pathname, navigationSections, role),
    [pathname, navigationSections, role],
  );
  const [activeSection, setActiveSection] = useState<NavSectionId>(initialSection);
  const currentSection =
    navigationSections.find((section) => section.id === activeSection) ?? navigationSections[0];

  useEffect(() => {
    setActiveSection(resolveNavSection(pathname, navigationSections, role));
  }, [pathname, navigationSections, role]);

  useEffect(() => {
    const hrefs = new Set<string>([
      headerAction.href,
      roleHomeRoutes[role],
      ...Object.values(roleHomeRoutes),
      ...navigationSections.flatMap((section) => section.items.map((item) => item.href)),
    ]);

    hrefs.forEach((href) => {
      router.prefetch(href as Route);
    });
  }, [headerAction.href, navigationSections, role, router]);

  return (
    <div className="workspace-mesh editorial-grid relative min-h-screen">
      <div className="pointer-events-none absolute left-[-8rem] top-[8rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(20,86,215,0.16),transparent_68%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[3rem] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(88,213,255,0.14),transparent_70%)] blur-3xl" />
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[23.5rem] lg:gap-3 lg:px-4 lg:py-5">
        <div className="split-rail-surface flex w-[5.15rem] flex-col items-center rounded-[2rem] px-3 py-4 text-[var(--rail-foreground)]">
          <Link
            href={roleHomeRoutes[role]}
            prefetch
            className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/12 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <span className="font-display text-lg font-semibold tracking-[-0.05em] text-white">EK</span>
          </Link>

          <div className="mt-6 flex flex-1 flex-col items-center gap-3">
            {navigationSections.map((section) => {
              const active = currentSection.id === section.id;
              const Icon = getSectionIcon(section.id);

              return (
                <button
                  key={section.id}
                  type="button"
                  title={section.label}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "split-rail-icon relative flex h-12 w-12 items-center justify-center rounded-[1rem]",
                    active && "is-active",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <Link
              href={headerAction.href}
              prefetch
              className="split-rail-utility flex h-12 w-12 items-center justify-center rounded-[1rem]"
              title={headerAction.label}
            >
              <ShieldCheck className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/login"
              prefetch
              className="split-rail-utility flex h-12 w-12 items-center justify-center rounded-[1rem]"
              title="Rol degistir"
            >
              <LogIn className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>

        <div className="split-context-surface flex min-w-0 flex-1 flex-col rounded-[2rem] px-4 py-4 text-[var(--rail-foreground)]">
          <div className="border-b border-white/8 px-1 pb-4">
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-[1.35rem] font-semibold text-white">
                  {currentSection.label}
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/56">
                {roleLabels[role]}
              </div>
            </div>
          </div>

          <nav className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {currentSection.items.map((item) => {
              const active =
                pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
              const Icon = getNavIcon(item.href, item.label);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={cn("split-nav-item group", active && "is-active")}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.95rem] border transition-colors",
                      active
                        ? "border-primary/16 bg-primary/10 text-primary"
                        : "border-white/8 bg-white/[0.04] text-white/50",
                    )}
                  >
                    <Icon className="h-[17px] w-[17px]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{compactNavLabel(item.label)}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[23.5rem]">
        <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-4 lg:px-7">
          <header className="panel-float stadium-shadow sticky top-4 z-20 rounded-[2rem] px-4 py-3.5 md:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-foreground shadow-[0_12px_24px_rgba(18,43,84,0.08)]">
                        <Menu className="h-5 w-5" />
                      </button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="workspace-dark-mesh overflow-y-auto p-0 text-white"
                    >
                      <div className="flex h-full flex-col px-4 py-4">
                        <div className="workspace-panel-dark rounded-[1.6rem] px-4 py-5">
                          <BrandMark inverse />
                        </div>
                        <SheetHeader className="pt-5">
                          <SheetTitle className="font-display text-[1.65rem] text-white">
                            {roleLabels[role]}
                          </SheetTitle>
                        </SheetHeader>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {navigationSections.map((section) => {
                            const Icon = getSectionIcon(section.id);
                            const active = currentSection.id === section.id;

                            return (
                              <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                                  active
                                    ? "border-white/18 bg-white/14 text-white"
                                    : "border-white/8 bg-white/5 text-white/62",
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                {section.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-5 grid gap-2">
                          {currentSection.items.map((item) => {
                            const active =
                              pathname === item.href ||
                              (item.href !== `/${role}` && pathname.startsWith(item.href));
                            const Icon = getNavIcon(item.href, item.label);

                            return (
                              <SheetClose asChild key={item.href}>
                            <Link
                              href={item.href}
                              prefetch
                              className={cn(
                                "flex items-start gap-3 rounded-[1.25rem] border px-4 py-3.5",
                                active
                                      ? "border-white/18 bg-white/14 text-white"
                                      : "border-white/8 bg-white/5 text-white/72",
                                  )}
                                >
                                  <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" />
                                  <div>
                                    <div className="font-medium">{compactNavLabel(item.label)}</div>
                                  </div>
                                </Link>
                              </SheetClose>
                            );
                          })}
                        </div>
                        {!hidePrimaryAction ? (
                          <div className="mt-auto space-y-3 pt-5">
                            <SheetClose asChild>
                              <Link
                                href={headerAction.href}
                                prefetch
                                className="flex items-center justify-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#0253cd,#0048b5)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(2,83,205,0.22)]"
                              >
                                {headerAction.label}
                              </Link>
                            </SheetClose>
                          </div>
                        ) : null}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="lg:hidden">
                  <BrandMark />
                </div>
                <div className="hidden min-w-[340px] items-center gap-3 rounded-full border border-white/70 bg-white/68 px-4 py-3 backdrop-blur-md xl:flex">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder={getSearchPlaceholder(role)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
                {headerActionSlot ? (
                  headerActionSlot
                ) : !hidePrimaryAction ? (
                  <Link
                    href={headerAction.href}
                    prefetch
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "h-11 rounded-full px-5 shadow-[0_14px_28px_rgba(20,86,215,0.2)]",
                    )}
                  >
                    {headerAction.label}
                  </Link>
                ) : null}
                {useLeadNotifications ? (
                  <LeadNotificationsBell role={role} />
                ) : (
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/68 text-muted-foreground shadow-[0_8px_18px_rgba(18,43,84,0.05)] transition-colors hover:text-foreground">
                    <Bell className="h-4 w-4" />
                  </button>
                )}
                {role === "admin" ? <AdminDocumentationCenter currentPath={pathname} /> : null}
                <Link href="/login" prefetch className={cn(buttonVariants({ variant: "outline" }))}>
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
            <section
              className={cn(
                "grid gap-6",
                heroContext ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "xl:grid-cols-1",
              )}
            >
              <div className="page-hero-shell rounded-[2.5rem] px-6 py-7 text-white md:px-8 md:py-8">
                <div className="relative z-10">
                  {eyebrow ? (
                    <div className="page-hero-kicker">
                      {eyebrow}
                    </div>
                  ) : null}
                  <div className="mt-5 max-w-4xl space-y-4">
                    <h1 className="max-w-4xl text-balance font-display text-[2.85rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white md:text-[4.15rem]">
                      {title}
                    </h1>
                    {description ? (
                      <p className="max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                        {description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              {heroContext ? (
                <div className="page-utility-rail rounded-[2.5rem] p-6 md:p-7">
                  <div className="pl-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
                    {heroContext.eyebrow}
                  </div>
                  <div className="mt-4 font-display text-[2rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#172133]">
                    {heroContext.title}
                  </div>
                  {heroContext.description ? (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {heroContext.description}
                    </p>
                  ) : null}
                  {heroContext.badge ? (
                    <div className="mt-6 inline-flex items-center rounded-full border border-primary/10 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                      {heroContext.badge}
                    </div>
                  ) : null}
                  </div>
                </div>
              ) : null}
            </section>

            <div className="flex flex-1 flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function LeadNotificationsBell({ role }: { role: AppRole }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<AppNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      const response = await fetch("/api/app-notifications", {
        method: "GET",
        cache: "no-store",
      }).catch(() => null);

      const payload = (await response?.json().catch(() => null)) as
        | { items?: AppNotificationItem[]; unreadCount?: number }
        | null;

      if (cancelled || !response?.ok) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      setItems(payload?.items ?? []);
      setUnreadCount(payload?.unreadCount ?? 0);
      setLoading(false);
    }

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function syncReadState(action: "read" | "read_all", notificationId?: string) {
    setPendingId(notificationId ?? "all");

    const response = await fetch("/api/app-notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, notificationId }),
    }).catch(() => null);

    if (!response?.ok) {
      setPendingId(null);
      return false;
    }

    setItems((current) =>
      current.map((item) =>
        action === "read_all" || item.id === notificationId
          ? { ...item, read: true }
          : item,
      ),
    );
    setUnreadCount((current) => (action === "read_all" ? 0 : Math.max(0, current - 1)));
    setPendingId(null);
    return true;
  }

  async function openNotification(item: AppNotificationItem) {
    if (!item.read) {
      await syncReadState("read", item.id);
    }

    setOpen(false);
    router.push(item.href as Route);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/68 text-muted-foreground shadow-[0_8px_18px_rgba(18,43,84,0.05)] transition-colors hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#0f63ea] px-1.5 text-[10px] font-bold text-white shadow-[0_10px_18px_rgba(15,99,234,0.35)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="panel-float absolute right-0 top-12 z-50 w-[min(92vw,430px)] rounded-[1.9rem] border border-white/70 p-0 shadow-[0_24px_80px_rgba(18,30,54,0.18)]">
          <div className="border-b border-border/55 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-[1.2rem] font-semibold tracking-[-0.04em] text-foreground">
                  Landing bildirimleri
                </div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                  {role === "admin"
                    ? "Anasayfadan gelen basvurular burada aninda gorunur."
                    : "Landing basvurulari operasyon raporu ile senkron takip edilir."}
                </div>
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void syncReadState("read_all")}
                  disabled={pendingId === "all"}
                  className="rounded-full border border-border/60 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-[#eef4ff] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tumunu okundu yap
                </button>
              ) : null}
            </div>
          </div>
          <div className="max-h-[min(70vh,560px)] space-y-3 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-secondary/25 px-4 py-6 text-sm leading-6 text-muted-foreground">
                Bildirimler yukleniyor...
              </div>
            ) : items.length ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-[1.25rem] border px-4 py-4 shadow-[0_10px_24px_rgba(18,43,84,0.06)] transition-all duration-200",
                    item.read
                      ? "border-border/55 bg-white/86"
                      : "border-[#0f63ea]/20 bg-[linear-gradient(180deg,rgba(240,246,255,0.95),rgba(231,240,255,0.85))]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => void openNotification(item)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{item.title}</div>
                          <div className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</div>
                        </div>
                        <div
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                            item.read ? "bg-secondary text-muted-foreground" : "bg-[#0f63ea] text-white",
                          )}
                        >
                          {item.read ? "Okundu" : "Yeni"}
                        </div>
                      </div>
                      <div className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                        {item.createdAt}
                      </div>
                    </button>
                    {!item.read ? (
                      <button
                        type="button"
                        onClick={() => void syncReadState("read", item.id)}
                        disabled={pendingId === item.id}
                        className="shrink-0 rounded-full border border-border/60 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Okundu
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-secondary/25 px-4 py-6 text-sm leading-6 text-muted-foreground">
                Su an landing tarafindan gelen bildirim yok.
              </div>
            )}
          </div>
          <div className="border-t border-border/55 px-4 py-4">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(
                  role === "admin"
                    ? ("/admin/security#landing-basvurulari" as Route)
                    : ("/manager/reports#lead-akisi" as Route),
                );
              }}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Tum landing basvurularini ac
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getSectionIcon(sectionId: NavSectionId) {
  if (sectionId === "manager") {
    return CalendarDays;
  }

  if (sectionId === "coach") {
    return Timer;
  }

  if (sectionId === "parent") {
    return UsersRound;
  }

  return Shield;
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

function compactNavLabel(label: string) {
  const compact = label.split("/").at(-1)?.trim();
  return compact && compact.length > 0 ? compact : label;
}

function resolveNavSection(
  pathname: string,
  sections: RoleNavSection[],
  role: AppRole,
): NavSectionId {
  const matchingSection = sections.find((section) =>
    section.items.some(
      (item) => pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href)),
    ),
  );

  return matchingSection?.id ?? sections[0]?.id ?? role;
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
