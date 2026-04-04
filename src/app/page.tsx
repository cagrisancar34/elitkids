"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Dumbbell,
  Medal,
  MessageCircleHeart,
  Play,
  Quote,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultLandingContent,
  mergeLandingContent,
  type IconKey,
  type LandingContent,
} from "@/lib/landing-content";
import { cn } from "@/lib/utils";

const iconMap = {
  snowflake: Snowflake,
  users: Users,
  medal: Medal,
  shield: ShieldCheck,
  dumbbell: Dumbbell,
  heart: MessageCircleHeart,
  quote: Quote,
  instagram: MessageCircleHeart,
  youtube: Play,
  waves: Waves,
  sparkles: Sparkles,
  clock: Sparkles,
  map: Sparkles,
  news: Quote,
  star: Sparkles,
} satisfies Record<IconKey, typeof Snowflake>;

async function loadLandingContent() {
  try {
    const response = await fetch("/api/landing-content", {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      content?: Partial<LandingContent> | null;
    };

    return payload.content ?? null;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const [content, setContent] = useState(defaultLandingContent);
  const [isLoading, setIsLoading] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function syncLandingContent() {
      setIsLoading(true);

      try {
        const nextContent = await loadLandingContent();

        if (mounted && nextContent) {
          setContent((current) => mergeLandingContent(current, nextContent));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void syncLandingContent();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      setHasScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logoNode = useMemo(() => {
    if (content.siteSettings.logoImage) {
      return (
        <img
          src={content.siteSettings.logoImage}
          alt={content.siteSettings.brandName}
          className="h-11 w-11 rounded-full object-cover ring-1 ring-white/20"
        />
      );
    }

    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-200 text-sm font-bold text-slate-950">
        {content.siteSettings.logoLabel}
      </div>
    );
  }, [content.siteSettings.brandName, content.siteSettings.logoImage, content.siteSettings.logoLabel]);

  return (
    <div className="bg-[#081224] text-slate-100">
      <div className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-8">
        <div
          className={cn(
            "mx-auto flex max-w-[1480px] items-center justify-between rounded-full border px-5 py-4 transition-all duration-300 md:px-8",
            hasScrolled
              ? "border-white/10 bg-slate-950/78 shadow-[0_24px_60px_rgba(2,12,27,0.45)] backdrop-blur-2xl"
              : "border-white/8 bg-slate-950/38 backdrop-blur-xl",
          )}
        >
          <Link href="/" className="flex items-center gap-3">
            {logoNode}
            <div>
              <div className="font-display text-xl font-extrabold tracking-tight text-white">
                {content.siteSettings.brandName}
              </div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                {content.siteSettings.brandTagline}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {content.navbar.links.map((link, index) => (
              <a
                key={`${link.label}-${index}`}
                href={link.href}
                className={cn(
                  "font-display text-sm font-semibold tracking-tight transition-colors",
                  index === 0
                    ? "border-b-2 border-sky-400 pb-1 text-sky-300"
                    : "text-slate-300 hover:text-white",
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-sky-200 md:flex">
              <span className={cn("h-2 w-2 rounded-full", isLoading ? "bg-amber-400" : "bg-emerald-400")} />
              {isLoading ? "Icerik senkronize oluyor" : "Canli vitrinde"}
            </div>
            <Button asChild className="rounded-full bg-sky-400 px-6 text-slate-950 hover:bg-sky-300">
              <a href={content.navbar.ctaHref}>{content.navbar.ctaLabel}</a>
            </Button>
          </div>
        </div>
      </div>

      <main className="overflow-hidden">
        <section className="relative min-h-screen overflow-hidden pt-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.26),transparent_28%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_24%),linear-gradient(180deg,#081224_0%,#0b1326_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:84px_84px] opacity-70" />

          <div className="relative mx-auto grid min-h-[calc(100vh-7rem)] max-w-[1480px] items-center gap-16 px-6 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
                premium gelisim modeli
              </div>

              <h1 className="mt-8 font-display text-5xl font-black leading-[0.98] tracking-[-0.06em] text-white md:text-7xl">
                {content.hero.title}
                <span className="block bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-200 bg-clip-text text-transparent">
                  {content.hero.highlight}
                </span>
                gelisir.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-9 text-slate-300 md:text-2xl md:leading-10">
                {content.hero.description}
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-200 px-9 text-base font-bold text-slate-950 shadow-[0_24px_60px_rgba(56,189,248,0.22)] hover:brightness-110"
                >
                  <a href={content.hero.primaryCtaHref}>{content.hero.primaryCtaLabel}</a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-white/10 bg-white/5 px-9 text-base font-bold text-white backdrop-blur-xl hover:bg-white/10"
                >
                  <a href={content.hero.secondaryCtaHref}>{content.hero.secondaryCtaLabel}</a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="mt-12 overflow-hidden rounded-[2rem] shadow-[0_30px_90px_rgba(2,12,27,0.42)]">
                <img
                  src={content.hero.visualPrimaryImage}
                  alt={`${content.siteSettings.brandName} birinci hero gorseli`}
                  className="aspect-[3/4] h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_90px_rgba(2,12,27,0.42)]">
                <img
                  src={content.hero.visualSecondaryImage}
                  alt={`${content.siteSettings.brandName} ikinci hero gorseli`}
                  className="aspect-[3/4] h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-[1480px] px-6 pb-24 md:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {content.stats.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Card
                  key={item.label}
                  className="border-white/6 bg-[#111a2d] p-8 text-center shadow-[0_24px_70px_rgba(2,12,27,0.26)]"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-400/12 text-sky-300">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="mt-6 font-display text-4xl font-black text-white">{item.value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {item.label}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="system" className="bg-[#060d1d] py-28">
          <div className="mx-auto max-w-[1480px] px-6 md:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
                {content.methodology.eyebrow}
              </div>
              <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">
                {content.methodology.title}
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-400">
                {content.methodology.description}
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {content.methodology.items.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <Card
                    key={item.title}
                    className="border-white/5 bg-white/[0.04] p-8 backdrop-blur-xl transition-transform hover:-translate-y-2"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-400/12 text-sky-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-8 font-display text-2xl font-bold text-white">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{item.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="programs" className="mx-auto max-w-[1480px] px-6 py-28 md:px-10">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
              {content.programs.eyebrow}
            </div>
            <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
              {content.programs.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{content.programs.description}</p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {content.programs.items.map((program) => (
              <Card
                key={program.title}
                className="overflow-hidden border-white/6 bg-[#111a2d] p-0 shadow-[0_26px_80px_rgba(2,12,27,0.3)]"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111a2d] via-[#111a2d]/50 to-transparent" />
                </div>
                <div className="p-8">
                  <h3 className="font-display text-2xl font-bold text-white">{program.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{program.description}</p>
                  <div className="mt-6 space-y-3">
                    {program.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    variant="secondary"
                    className="mt-8 w-full rounded-xl bg-[#1e2a45] text-white hover:bg-sky-500"
                  >
                    <a href={program.href}>{program.ctaLabel}</a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="why-us" className="bg-[#081224] py-28">
          <div className="mx-auto grid max-w-[1480px] gap-16 px-6 md:grid-cols-[1fr_0.95fr] md:px-10">
            <div>
              <h2 className="font-display text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
                {content.whyUs.title}{" "}
                <span className="text-sky-300">{content.whyUs.highlight}</span>.
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
                {content.whyUs.description}
              </p>

              <div className="mt-12 space-y-10">
                {content.whyUs.points.map((point) => (
                  <div key={point.title}>
                    <h3 className="font-display text-2xl font-bold text-white">{point.title}</h3>
                    <p className="mt-3 text-base leading-8 text-slate-400">{point.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_90px_rgba(2,12,27,0.42)]">
                <img
                  src={content.whyUs.image}
                  alt={content.whyUs.title}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 left-4 rounded-[1.7rem] border border-white/8 bg-slate-950/72 px-7 py-6 shadow-[0_24px_70px_rgba(2,12,27,0.42)] backdrop-blur-xl">
                <div className="font-display text-3xl font-black text-sky-300">{content.whyUs.statValue}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                  {content.whyUs.statLabel}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-6 py-28 md:px-10">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/6 bg-[#111a2d] shadow-[0_32px_90px_rgba(2,12,27,0.34)] md:grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-sky-400 to-cyan-200 p-10 text-slate-950 md:p-14">
              <h2 className="font-display text-4xl font-black tracking-[-0.05em]">
                {content.cta.title}
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-900/80">
                {content.cta.description}
              </p>
              <div className="mt-10 space-y-4 text-base font-semibold">
                <div>{content.siteSettings.contactPhone}</div>
                <div>{content.siteSettings.location}</div>
                <div>{content.siteSettings.contactEmail}</div>
              </div>
            </div>

            <div className="p-10 md:p-14">
              <div className="space-y-5">
                <Field label={content.cta.fullNameLabel}>
                  <Input
                    placeholder={content.cta.fullNamePlaceholder}
                    className="border-white/5 bg-[#1b2740] text-white placeholder:text-slate-500"
                  />
                </Field>
                <Field label={content.cta.emailLabel}>
                  <Input
                    type="email"
                    placeholder={content.cta.emailPlaceholder}
                    className="border-white/5 bg-[#1b2740] text-white placeholder:text-slate-500"
                  />
                </Field>
                <Field label={content.cta.phoneLabel}>
                  <Input
                    placeholder={content.cta.phonePlaceholder}
                    className="border-white/5 bg-[#1b2740] text-white placeholder:text-slate-500"
                  />
                </Field>
                <Field label="Mesaj">
                  <Textarea
                    placeholder={content.cta.description}
                    className="min-h-28 border-white/5 bg-[#1b2740] text-white placeholder:text-slate-500"
                  />
                </Field>
                <Button className="w-full rounded-xl bg-sky-400 py-6 text-lg font-extrabold text-slate-950 hover:bg-sky-300">
                  {content.cta.submitLabel}
                </Button>
                <p className="text-sm leading-7 text-slate-500">{content.cta.footnote}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="rounded-t-[3rem] bg-[#050b16]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-14 px-8 py-20 md:flex-row md:justify-between md:px-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              {logoNode}
              <div className="font-display text-2xl font-black text-white">
                {content.siteSettings.brandName}
              </div>
            </div>
            <p className="mt-7 text-base leading-8 text-slate-500">{content.footer.description}</p>
            <div className="mt-8 flex gap-3">
              {content.footer.socials.map((social) => {
                const Icon = iconMap[social.icon];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#131d31] text-slate-300 transition-all hover:bg-sky-400 hover:text-slate-950"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {content.footer.groups.map((group) => (
              <div key={group.title}>
                <div className="font-display text-lg font-bold text-white">{group.title}</div>
                <div className="mt-6 space-y-4">
                  {group.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="block text-sm text-slate-500 transition-all hover:translate-x-1 hover:text-sky-200"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-8 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-12">
            <div>{content.footer.bottomText}</div>
            <div>{content.footer.bottomBadge}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
