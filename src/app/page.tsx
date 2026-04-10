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

import { PreRegistrationModal } from "@/components/pre-registration-modal";
import { TrackedButton } from "@/components/tracked-button";
import { TrackedLinkButton } from "@/components/tracked-link-button";
import {
  defaultLandingContent,
  mergeLandingContent,
  type IconKey,
  type LandingContent,
} from "@/lib/landing-content";
import { trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";
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
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isPreRegistrationOpen, setIsPreRegistrationOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function syncLandingContent() {
      const nextContent = await loadLandingContent();

      if (mounted && nextContent) {
        setContent((current) => mergeLandingContent(current, nextContent));
      }
    }

    void syncLandingContent();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      setHasScrolled(window.scrollY > 12);
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
          className="h-8 w-8 rounded-full object-cover"
        />
      );
    }

    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-cyan-100 text-[11px] font-extrabold text-[#071223]">
        {content.siteSettings.logoLabel}
      </div>
    );
  }, [content.siteSettings.brandName, content.siteSettings.logoImage, content.siteSettings.logoLabel]);

  const normalizedPhone = content.siteSettings.contactPhone.replace(/[^\d+]/g, "");
  const whatsappDigits = content.siteSettings.contactPhone.replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-[#091224] text-white">
      <div className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-6">
        <header
          className={cn(
            "mx-auto flex max-w-[1420px] items-center justify-between rounded-[2rem] border px-4 py-3 transition-all duration-300 md:px-8 md:py-4",
            hasScrolled
              ? "border-white/10 bg-[#08101f]/92 shadow-[0_18px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
              : "border-white/6 bg-[#08101f]/60 backdrop-blur-xl",
          )}
        >
          <Link href="/" className="flex items-center gap-3 md:gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-[#42baf9] shadow-[0_14px_30px_rgba(66,186,249,0.28)]">
              {content.siteSettings.logoImage ? (
                <img
                  src={content.siteSettings.logoImage}
                  alt={content.siteSettings.brandName}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-black tracking-[-0.04em] text-[#071223]">
                  {content.siteSettings.logoLabel}
                </span>
              )}
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="font-display text-[1.05rem] font-extrabold tracking-[-0.04em] text-white">
                {content.siteSettings.brandName}
              </div>
              <div className="mt-0.5 text-[0.7rem] font-medium uppercase tracking-[0.34em] text-slate-400">
                {content.siteSettings.brandTagline}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {content.navbar.links.map((link, index) => (
              <a
                key={`${link.label}-${index}`}
                href={link.href}
                className={cn(
                  "text-base font-bold tracking-[-0.03em] transition-colors",
                  index === 0
                    ? "border-b-2 border-sky-300 pb-2 text-sky-300"
                    : "text-slate-300 hover:text-white",
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 lg:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.75)]" />
              <span>{content.navbar.statusLabel}</span>
            </div>
            <TrackedButton
              className="h-12 rounded-full bg-[#0f6bff] px-6 text-sm font-bold text-white shadow-[0_18px_38px_rgba(15,107,255,0.28)] hover:bg-[#3384ff] md:px-8"
              trackingName={content.navbar.ctaLabel}
              trackingLocation="navbar"
              onClick={() => setIsPreRegistrationOpen(true)}
            >
              {content.navbar.ctaLabel}
            </TrackedButton>
          </div>
        </header>
      </div>

      <main>
        <section className="relative overflow-hidden pt-28 md:pt-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(64,164,255,0.18),transparent_24%),radial-gradient(circle_at_top_left,rgba(65,131,255,0.12),transparent_20%),linear-gradient(180deg,#091224_0%,#0a1427_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:112px_112px] opacity-70" />
          <div className="absolute inset-y-0 right-0 w-[36%] bg-[radial-gradient(circle_at_center,rgba(57,164,255,0.18),transparent_60%)]" />
          <div className="relative mx-auto max-w-[1420px] px-5 pb-18 pt-8 md:px-8 md:pb-24 md:pt-14">
            <div className="grid items-center gap-10 xl:grid-cols-[1.12fr_0.88fr]">
              <div className="max-w-[820px]">
                <div className="inline-flex rounded-full border border-sky-300/28 bg-sky-300/[0.08] px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-sky-200 shadow-[0_20px_40px_rgba(34,164,255,0.08)]">
                  {content.hero.eyebrow}
                </div>

                <h1 className="mt-10 max-w-[9ch] whitespace-pre-line font-display text-[3.6rem] font-black leading-[0.9] tracking-[-0.065em] text-white sm:text-[4.3rem] lg:text-[5.7rem] xl:text-[6.2rem]">
                  {content.hero.title}
                  <span className="mt-1 block whitespace-pre-line bg-gradient-to-b from-sky-300 via-[#44c5ff] to-[#1b98ff] bg-clip-text text-transparent">
                    {content.hero.highlight}
                  </span>
                </h1>

                <p className="mt-9 max-w-[640px] text-[1.15rem] leading-[1.7] text-slate-300 md:text-[1.25rem]">
                  {content.hero.description}
                </p>

                <div className="mt-12 flex flex-wrap gap-4">
                  <TrackedButton
                    className="h-14 rounded-[1.2rem] bg-[#0f6bff] px-8 text-lg font-bold text-white shadow-[0_20px_44px_rgba(15,107,255,0.35)] hover:bg-[#3384ff]"
                    trackingName={content.hero.primaryCtaLabel}
                    trackingLocation="hero_primary"
                    onClick={() => setIsPreRegistrationOpen(true)}
                  >
                    {content.hero.primaryCtaLabel}
                  </TrackedButton>
                  <TrackedLinkButton
                    href={content.hero.secondaryCtaHref}
                    variant="outline"
                    className="h-14 rounded-[1.2rem] border-white/14 bg-white/[0.03] px-8 text-lg font-bold text-white hover:bg-white/[0.06]"
                    trackingName={content.hero.secondaryCtaLabel}
                    trackingLocation="hero_secondary"
                  >
                    {content.hero.secondaryCtaLabel}
                  </TrackedLinkButton>
                </div>
              </div>

              <div className="grid grid-cols-2 items-end gap-6 xl:justify-self-end">
                <div className="overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#0e1a31] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
                  <img
                    src={content.hero.visualPrimaryImage}
                    alt={`${content.siteSettings.brandName} hero bir`}
                    className="aspect-[0.72] h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#0e1a31] shadow-[0_30px_70px_rgba(0,0,0,0.32)] xl:translate-y-[-58px]">
                  <img
                    src={content.hero.visualSecondaryImage}
                    alt={`${content.siteSettings.brandName} hero iki`}
                    className="aspect-[0.98] h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.04] bg-[#0a1427]">
          <div className="mx-auto max-w-[1320px] px-4 py-10 md:px-6 md:py-12">
            <div className="grid gap-4 md:grid-cols-3">
              {content.stats.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <div
                    key={item.label}
                    className="rounded-[1.35rem] border border-white/[0.04] bg-[#111a2f] px-6 py-6 text-center shadow-[0_14px_40px_rgba(0,0,0,0.16)]"
                  >
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-sky-400/10 text-sky-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="mt-4 font-display text-[2.15rem] font-black tracking-[-0.04em] text-white">
                      {item.value}
                    </div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="system" className="border-t border-white/[0.04] bg-[#0b162b]">
          <div className="mx-auto max-w-[1320px] px-4 py-18 md:px-6 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300">
                {content.methodology.eyebrow}
              </div>
              <h2 className="mt-4 font-display text-[2.3rem] font-black tracking-[-0.05em] text-white md:text-[3rem]">
                {content.methodology.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400 md:text-base">
                {content.methodology.description}
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {content.methodology.items.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <div
                    key={item.title}
                    className="rounded-[1.35rem] border border-white/[0.05] bg-[#111a2f] px-5 py-5 shadow-[0_16px_42px_rgba(0,0,0,0.15)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400/10 text-sky-300">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="mt-5 font-display text-[1.25rem] font-bold tracking-[-0.03em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="programs" className="border-t border-white/[0.04] bg-[#091224]">
          <div className="mx-auto max-w-[1320px] px-4 py-18 md:px-6 md:py-24">
            <h2 className="font-display text-[2.2rem] font-black tracking-[-0.05em] text-sky-300 md:text-[2.8rem]">
              {content.programs.eyebrow}
            </h2>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {content.programs.items.map((program) => (
                <article
                  key={program.title}
                  className="overflow-hidden rounded-[1.45rem] border border-white/[0.05] bg-[#111a2f] shadow-[0_18px_52px_rgba(0,0,0,0.18)]"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111a2f] via-[#111a2f]/30 to-transparent" />
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    <h3 className="font-display text-[1.35rem] font-bold tracking-[-0.03em] text-white">
                      {program.title}
                    </h3>
                    <div className="mt-4 space-y-2.5">
                      {program.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-center gap-2.5 text-sm text-slate-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                    <TrackedLinkButton
                      href={program.href}
                      variant="outline"
                      className="mt-5 h-10 w-full rounded-full border-white/[0.06] bg-white/[0.02] text-sm font-semibold text-white hover:bg-white/[0.05]"
                      trackingName={program.ctaLabel}
                      trackingLocation={`program_card_${program.title}`}
                    >
                      {program.ctaLabel}
                    </TrackedLinkButton>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="coaches" className="border-t border-white/[0.04] bg-[#0b162b]">
          <div className="mx-auto max-w-[1320px] px-4 py-18 md:px-6 md:py-24">
            <div className="max-w-2xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300">
                {content.coaches.eyebrow}
              </div>
              <h2 className="mt-4 font-display text-[2.2rem] font-black tracking-[-0.05em] text-white md:text-[2.8rem]">
                {content.coaches.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
                {content.coaches.description}
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {content.coaches.items.map((coach) => (
                <article
                  key={coach.name}
                  className="overflow-hidden rounded-[1.45rem] border border-white/[0.05] bg-[#111a2f] shadow-[0_18px_52px_rgba(0,0,0,0.18)]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img src={coach.image} alt={coach.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111a2f] via-[#111a2f]/10 to-transparent" />
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-sky-300">
                      {coach.specialty}
                    </div>
                    <h3 className="mt-3 font-display text-[1.35rem] font-bold tracking-[-0.03em] text-white">
                      {coach.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{coach.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-us" className="border-t border-white/[0.04] bg-[#0a1427]">
          <div className="mx-auto max-w-[1320px] px-4 py-18 md:px-6 md:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
              <div className="max-w-[560px]">
                <h2 className="max-w-[10ch] font-display text-[2.5rem] font-black leading-[0.96] tracking-[-0.055em] text-white md:text-[3.55rem]">
                  {content.whyUs.title}
                  <span className="block text-sky-300">{content.whyUs.highlight}.</span>
                </h2>
                <p className="mt-6 text-[15px] leading-7 text-slate-300 md:text-base">
                  {content.whyUs.description}
                </p>
                <div className="mt-8 space-y-7">
                  {content.whyUs.points.map((point) => (
                    <div key={point.title}>
                      <h3 className="font-display text-[1.2rem] font-bold tracking-[-0.03em] text-white">
                        {point.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{point.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative max-w-[420px] lg:justify-self-end">
                <div className="overflow-hidden rounded-[1.7rem] border border-white/[0.06] bg-[#111a2f] shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
                  <img
                    src={content.whyUs.image}
                    alt={content.whyUs.title}
                    className="aspect-[0.9] h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 left-5 rounded-[1.2rem] border border-white/[0.06] bg-[#111a2f] px-5 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
                  <div className="font-display text-[1.7rem] font-black text-sky-300">
                    {content.whyUs.statValue}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {content.whyUs.statLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-white/[0.04] bg-[#091224]">
          <div className="mx-auto max-w-[1320px] px-4 py-18 md:px-6 md:py-24">
            <div className="mb-10 max-w-3xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300">
                {content.faq.eyebrow}
              </div>
              <h2 className="mt-4 font-display text-[2.1rem] font-black tracking-[-0.05em] text-white md:text-[2.7rem]">
                {content.faq.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
                {content.faq.description}
              </p>
            </div>

            <div className="mb-10 grid gap-4 lg:grid-cols-2">
              {content.faq.items.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[1.4rem] border border-white/[0.05] bg-[#111a2f] px-5 py-5 shadow-[0_16px_42px_rgba(0,0,0,0.15)]"
                >
                  <div className="font-display text-[1.15rem] font-bold tracking-[-0.03em] text-white">
                    {item.question}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.answer}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[1.8rem] border border-white/[0.05] bg-[#111a2f] shadow-[0_24px_60px_rgba(0,0,0,0.2)] md:grid md:grid-cols-[0.95fr_1.05fr]">
              <div className="bg-[#42baf9] px-7 py-8 text-[#071223] md:px-10 md:py-10">
                <h2 className="max-w-[12ch] font-display text-[2rem] font-black leading-[0.96] tracking-[-0.04em]">
                  {content.cta.title}
                </h2>
                <p className="mt-4 max-w-[28ch] text-sm leading-7 text-[#0b2435]/78">
                  {content.cta.description}
                </p>
                <div className="mt-8 space-y-3 text-sm font-semibold">
                  <a
                    href={`tel:${normalizedPhone}`}
                    onClick={() => trackPhoneClick("cta_contact_panel")}
                    className="block hover:text-[#0d3350]"
                  >
                    {content.siteSettings.contactPhone}
                  </a>
                  <div>{content.siteSettings.location}</div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6 px-7 py-8 md:px-10 md:py-10">
                <div className="grid gap-4">
                  <div className="rounded-[1rem] border border-white/[0.05] bg-[#202a3f] px-4 py-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      On kayit mantigi
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      Basvuru once on kayit havuzuna duser. Ekibimiz inceleyip uygun programa aktive ettiginde ogrenci kaydi olusur.
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-400">
                    <div>• Ogrenci ve veli bilgileri tek formda toplanir</div>
                    <div>• KVKK ve veli izin metni okunup onaylanir</div>
                    <div>• Fotograf yukleme ve program secimi ayni akista tamamlanir</div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <TrackedButton
                    type="button"
                    className="h-12 rounded-[0.95rem] bg-sky-400 text-sm font-bold text-[#071223] hover:bg-sky-300"
                    trackingName={content.cta.submitLabel}
                    trackingLocation="cta_panel"
                    onClick={() => setIsPreRegistrationOpen(true)}
                  >
                    {content.cta.submitLabel}
                  </TrackedButton>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TrackedLinkButton
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noreferrer"
                      variant="outline"
                      className="h-11 rounded-[0.95rem] border-white/[0.08] bg-white/[0.02] text-sm font-semibold text-white hover:bg-white/[0.05]"
                      trackingName="WhatsApp"
                      trackingLocation="cta_panel"
                      eventType="whatsapp_click"
                    >
                      WhatsApp ile Ulas
                    </TrackedLinkButton>
                    <TrackedLinkButton
                      href={`tel:${normalizedPhone}`}
                      variant="outline"
                      className="h-11 rounded-[0.95rem] border-white/[0.08] bg-white/[0.02] text-sm font-semibold text-white hover:bg-white/[0.05]"
                      trackingName="Telefon"
                      trackingLocation="cta_panel"
                      eventType="phone_click"
                    >
                      Telefon ile Ara
                    </TrackedLinkButton>
                  </div>
                  <p className="text-xs leading-6 text-slate-500">{content.cta.footnote}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.04] bg-[#050b16]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 md:px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_auto]">
            <div className="max-w-[320px]">
              <div className="flex items-center gap-2.5">
                {logoNode}
                <div className="font-display text-base font-extrabold tracking-tight text-white">
                  {content.siteSettings.brandName}
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-500">{content.footer.description}</p>
              <div className="mt-6 flex gap-2">
                {content.footer.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    onClick={() => {
                      if (social.label.toLowerCase().includes("whats")) {
                        trackWhatsAppClick("footer_social");
                        return;
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#121b2f] text-[10px] font-bold text-slate-300 hover:bg-sky-300 hover:text-[#071223]"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-10 sm:grid-cols-2">
              {content.footer.groups.map((group) => (
                <div key={group.title}>
                  <div className="font-display text-sm font-bold text-white">{group.title}</div>
                  <div className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="block text-xs text-slate-500 hover:text-sky-200"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.05] pt-5 text-[11px] text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>{content.siteSettings.copyright}</div>
            <div>{content.footer.bottomBadge}</div>
          </div>
        </div>
      </footer>

      <PreRegistrationModal open={isPreRegistrationOpen} onOpenChange={setIsPreRegistrationOpen} />
    </div>
  );
}
