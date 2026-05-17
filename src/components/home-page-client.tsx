"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Dumbbell,
  Medal,
  MessageCircle,
  MessageCircleHeart,
  Phone,
  Play,
  Quote,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";

import { PreRegistrationModal } from "@/components/pre-registration-modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TrackedButton } from "@/components/tracked-button";
import { TrackedLinkButton } from "@/components/tracked-link-button";
import {
  type IconKey,
  type LandingContent,
} from "@/lib/landing-content";
import { trackFormSubmit, trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";
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

function formatPublicParentName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "Veli";
  }

  if (/^[^\s]+\s+[A-Z]\.$/i.test(normalized)) {
    return normalized;
  }

  const parts = normalized.split(" ");
  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1]?.charAt(0).toUpperCase();
  return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
}

export function HomePageClient({ initialContent }: { initialContent: LandingContent }) {
  const [content] = useState(initialContent);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isPreRegistrationOpen, setIsPreRegistrationOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(() => ({
    fullName: "",
    email: "",
    phone: "",
    status: initialContent.cta.statusOptions[0] ?? "",
  }));
  const [leadSubmitState, setLeadSubmitState] = useState<{
    pending: boolean;
    error: string | null;
    success: string | null;
  }>({
    pending: false,
    error: null,
    success: null,
  });

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
        <Image
          src={content.siteSettings.logoImage}
          alt={content.siteSettings.brandName}
          width={32}
          height={32}
          unoptimized
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
  const whatsappDigits = content.siteSettings.whatsappPhone.replace(/\D/g, "");
  const guideItems = useMemo(
    () =>
      content.guide.items.filter(
        (item) => item.label.trim().length > 0 && item.href.trim().length > 0,
      ),
    [content.guide.items],
  );
  const featuredGalleryItems = useMemo(
    () =>
      content.galleryItems.filter((item) => item.featured && item.published && item.image.trim().length > 0),
    [content.galleryItems],
  );
  const featuredTestimonials = useMemo(
    () =>
      content.testimonials.items
        .filter((item) => item.approved)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [content.testimonials.items],
  );

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLeadSubmitState({
      pending: true,
      error: null,
      success: null,
    });

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: leadForm.fullName,
        email: leadForm.email,
        phone: leadForm.phone,
        branchInterest: leadForm.status,
        source: "organic_home",
      }),
    }).catch(() => null);

    const payload = (await response?.json().catch(() => null)) as { error?: string } | null;

    if (!response?.ok) {
      setLeadSubmitState({
        pending: false,
        error: payload?.error ?? "Form gonderilirken bir sorun olustu. Lutfen tekrar deneyin.",
        success: null,
      });
      return;
    }

    trackFormSubmit("landing_lead_cta", { lead_source: "organic_home" });
    setLeadForm({
      fullName: "",
      email: "",
      phone: "",
      status: content.cta.statusOptions[0] ?? "",
    });
    setLeadSubmitState({
      pending: false,
      error: null,
      success: "Talebiniz alindi. Ekibimiz en kisa surede sizinle iletisime gececek.",
    });
  }

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
                <Image
                  src={content.siteSettings.logoImage}
                  alt={content.siteSettings.brandName}
                  width={56}
                  height={56}
                  unoptimized
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

          <div className="flex items-center gap-2.5 md:gap-3">
            <TrackedLinkButton
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              className="h-11 w-11 rounded-full border-white/12 bg-white/[0.03] p-0 text-slate-200 hover:bg-white/[0.06] hover:text-white"
              trackingName="WhatsApp"
              trackingLocation="navbar_contact"
              eventType="whatsapp_click"
            >
              <MessageCircle className="h-4.5 w-4.5" />
            </TrackedLinkButton>
            <TrackedLinkButton
              href={`tel:${normalizedPhone}`}
              variant="outline"
              className="h-11 w-11 rounded-full border-white/12 bg-white/[0.03] p-0 text-slate-200 hover:bg-white/[0.06] hover:text-white"
              trackingName="Telefon"
              trackingLocation="navbar_contact"
              eventType="phone_click"
            >
              <Phone className="h-4.5 w-4.5" />
            </TrackedLinkButton>
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
                  <Image
                    src={content.hero.visualPrimaryImage}
                    alt={`${content.siteSettings.brandName} hero bir`}
                    width={900}
                    height={1250}
                    unoptimized
                    className="aspect-[0.72] h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#0e1a31] shadow-[0_30px_70px_rgba(0,0,0,0.32)] xl:translate-y-[-58px]">
                  <Image
                    src={content.hero.visualSecondaryImage}
                    alt={`${content.siteSettings.brandName} hero iki`}
                    width={900}
                    height={880}
                    unoptimized
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

        {featuredGalleryItems.length ? (
          <section className="border-t border-white/[0.04] bg-[#091224]">
            <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-6 md:py-18">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300">
                    {content.homepageMediaRail.eyebrow}
                  </div>
                  <h2 className="mt-4 font-display text-[2.1rem] font-black tracking-[-0.05em] text-white md:text-[2.7rem]">
                    {content.homepageMediaRail.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
                    {content.homepageMediaRail.description}
                  </p>
                </div>
                <TrackedLinkButton
                  href={content.homepageMediaRail.ctaHref}
                  variant="outline"
                  className="h-12 rounded-full border-white/[0.08] bg-white/[0.03] px-6 text-sm font-semibold text-white hover:bg-white/[0.06]"
                  trackingName={content.homepageMediaRail.ctaLabel}
                  trackingLocation="homepage_media_rail"
                >
                  {content.homepageMediaRail.ctaLabel}
                </TrackedLinkButton>
              </div>

              <div className="mt-10 overflow-hidden rounded-[1.9rem] border border-white/[0.06] bg-[#0e182c] py-4 shadow-[0_18px_52px_rgba(0,0,0,0.18)]">
                <div className="homepage-media-rail-track flex w-max gap-4 px-4">
                  {[...featuredGalleryItems, ...featuredGalleryItems].map((item, index) => (
                    <article
                      key={`${item.id}-${index}`}
                      className="w-[280px] shrink-0 overflow-hidden rounded-[1.45rem] border border-white/[0.06] bg-[#10192d]"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={560}
                        height={384}
                        unoptimized
                        className="h-48 w-full object-cover"
                      />
                      <div className="px-4 pb-4 pt-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                          {item.category}
                        </div>
                        <div className="mt-2 font-display text-[1.05rem] font-bold tracking-[-0.03em] text-white">
                          {item.title}
                        </div>
                        {item.description ? (
                          <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

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
                    <Image
                      src={program.image}
                      alt={program.title}
                      width={720}
                      height={352}
                      unoptimized
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
                    <Image
                      src={coach.image}
                      alt={coach.name}
                      width={720}
                      height={640}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
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
                  <Image
                    src={content.whyUs.image}
                    alt={content.whyUs.title}
                    width={900}
                    height={1000}
                    unoptimized
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

        <section className="border-t border-white/[0.04] bg-[#091224]">
          <div className="mx-auto max-w-[1320px] px-4 py-18 md:px-6 md:py-24">
            <div className="grid gap-10 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="max-w-[520px]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300">
                  {content.localProof.eyebrow}
                </div>
                <h2 className="mt-4 font-display text-[2.2rem] font-black tracking-[-0.05em] text-white md:text-[2.9rem]">
                  {content.localProof.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
                  {content.localProof.description}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {content.localProof.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  return (
                    <article
                      key={item.title}
                      className="rounded-[1.45rem] border border-white/[0.05] bg-[#10192d] px-5 py-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-400/10 text-sky-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-display text-[1.18rem] font-bold tracking-[-0.03em] text-white">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="border-t border-white/[0.04] bg-[#0b162b]">
          <div className="mx-auto max-w-[1320px] px-4 py-18 md:px-6 md:py-24">
            <div className="max-w-3xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300">
                {content.process.eyebrow}
              </div>
              <h2 className="mt-4 font-display text-[2.2rem] font-black tracking-[-0.05em] text-white md:text-[2.8rem]">
                {content.process.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
                {content.process.description}
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {content.process.steps.map((step) => (
                <article
                  key={step.title}
                  className="rounded-[1.45rem] border border-white/[0.05] bg-[#111a2f] px-6 py-6 shadow-[0_18px_48px_rgba(0,0,0,0.16)]"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                    Surec
                  </div>
                  <h3 className="mt-4 font-display text-[1.28rem] font-bold tracking-[-0.03em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.04] bg-[#091224]">
          <div className="mx-auto max-w-[1320px] px-4 py-18 md:px-6 md:py-24">
            <div className="max-w-2xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300">
                {content.testimonials.eyebrow}
              </div>
              <h2 className="mt-4 font-display text-[2.2rem] font-black tracking-[-0.05em] text-white md:text-[2.8rem]">
                {content.testimonials.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
                {content.testimonials.description}
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {featuredTestimonials.map((item) => (
                <article
                  key={`${item.id}-${item.context}`}
                  className="rounded-[1.45rem] border border-white/[0.05] bg-[#10192d] px-6 py-6 shadow-[0_20px_48px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400/10 text-sky-300">
                    <Quote className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-300">{item.quote}</p>
                  <div className="mt-6">
                    <div className="font-display text-[1.05rem] font-bold tracking-[-0.03em] text-white">
                      {formatPublicParentName(item.parentDisplayName)}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      {[item.context, item.branch, item.childAgeGroup].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </article>
              ))}
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
                <form className="grid gap-4" onSubmit={handleLeadSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {content.cta.fullNameLabel}
                      </label>
                      <Input
                        value={leadForm.fullName}
                        onChange={(event) =>
                          setLeadForm((current) => ({ ...current, fullName: event.target.value }))
                        }
                        placeholder={content.cta.fullNamePlaceholder}
                        className="h-12 rounded-[0.95rem] border-white/[0.08] bg-white text-[#0a1427] placeholder:text-slate-400 focus-visible:bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {content.cta.emailLabel}
                      </label>
                      <Input
                        type="email"
                        value={leadForm.email}
                        onChange={(event) =>
                          setLeadForm((current) => ({ ...current, email: event.target.value }))
                        }
                        placeholder={content.cta.emailPlaceholder}
                        className="h-12 rounded-[0.95rem] border-white/[0.08] bg-white text-[#0a1427] placeholder:text-slate-400 focus-visible:bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {content.cta.phoneLabel}
                      </label>
                      <Input
                        value={leadForm.phone}
                        onChange={(event) =>
                          setLeadForm((current) => ({ ...current, phone: event.target.value }))
                        }
                        placeholder={content.cta.phonePlaceholder}
                        className="h-12 rounded-[0.95rem] border-white/[0.08] bg-white text-[#0a1427] placeholder:text-slate-400 focus-visible:bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {content.cta.statusLabel}
                      </label>
                      <Select
                        value={leadForm.status}
                        onChange={(event) =>
                          setLeadForm((current) => ({ ...current, status: event.target.value }))
                        }
                        className="h-12 rounded-[0.95rem] border-white/[0.08] bg-white text-[#0a1427] focus-visible:bg-white"
                      >
                        <option value="" disabled>
                          {content.cta.statusPlaceholder}
                        </option>
                        {content.cta.statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {leadSubmitState.error ? (
                    <div className="rounded-[0.95rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                      {leadSubmitState.error}
                    </div>
                  ) : null}

                  {leadSubmitState.success ? (
                    <div className="rounded-[0.95rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                      {leadSubmitState.success}
                    </div>
                  ) : null}

                  <TrackedButton
                    type="submit"
                    className="h-12 rounded-[0.95rem] bg-sky-400 text-sm font-bold text-[#071223] hover:bg-sky-300"
                    trackingName={content.cta.submitLabel}
                    trackingLocation="cta_panel"
                    disabled={leadSubmitState.pending}
                  >
                    {leadSubmitState.pending ? "Basvurunuz gonderiliyor..." : content.cta.submitLabel}
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
                      {content.cta.whatsappLabel}
                    </TrackedLinkButton>
                    <TrackedLinkButton
                      href={`tel:${normalizedPhone}`}
                      variant="outline"
                      className="h-11 rounded-[0.95rem] border-white/[0.08] bg-white/[0.02] text-sm font-semibold text-white hover:bg-white/[0.05]"
                      trackingName="Telefon"
                      trackingLocation="cta_panel"
                      eventType="phone_click"
                    >
                      {content.cta.phoneCtaLabel}
                    </TrackedLinkButton>
                  </div>
                  <TrackedButton
                    type="button"
                    className="h-11 rounded-[0.95rem] border border-sky-300/20 bg-sky-300/10 text-sm font-semibold text-sky-100 hover:bg-sky-300/16"
                    trackingName={content.cta.recommendationLabel}
                    trackingLocation="cta_panel_recommendation"
                    onClick={() => setIsPreRegistrationOpen(true)}
                  >
                    {content.cta.recommendationLabel}
                  </TrackedButton>
                  <p className="text-xs leading-6 text-slate-500">{content.cta.footnote}</p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {guideItems.length ? (
      <section className="border-t border-white/[0.04] bg-[#07101d]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 md:px-6">
          <div className="max-w-2xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300">
              {content.guide.eyebrow}
            </div>
            <h2 className="mt-4 font-display text-[2rem] font-black tracking-[-0.05em] text-white md:text-[2.4rem]">
              {content.guide.title}
            </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
                {content.guide.description}
              </p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {guideItems.map((pageLink) => (
              <Link
                key={pageLink.href}
                href={pageLink.href as Route}
                className="rounded-[1.25rem] border border-white/[0.06] bg-[#10192d] px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#142038] hover:text-sky-200"
              >
                {pageLink.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      ) : null}

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

            <div className="grid gap-10 sm:grid-cols-3">
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
              <div>
                <div className="font-display text-sm font-bold text-white">SEO sayfalari</div>
                <div className="mt-4 space-y-3">
                  {[...guideItems.slice(0, 5), { label: "Galeri", href: "/galeri" }].map((pageLink) => (
                    <Link
                      key={pageLink.href}
                      href={pageLink.href as Route}
                      className="block text-xs text-slate-500 hover:text-sky-200"
                    >
                      {pageLink.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.05] pt-5 text-[11px] text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>{content.siteSettings.copyright}</div>
            <div>{content.footer.bottomBadge}</div>
          </div>
        </div>
      </footer>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-3 md:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-[980px] flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-[#08101f]/90 px-4 py-4 shadow-[0_24px_54px_rgba(0,0,0,0.36)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between md:px-5">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                {content.cta.mobileStickyEyebrow}
              </div>
              <div className="mt-1 font-display text-[1.05rem] font-bold tracking-[-0.03em] text-white md:text-[1.2rem]">
                {content.cta.mobileStickyTitle}
              </div>
            </div>
          <div className="flex flex-wrap gap-2">
            <TrackedLinkButton
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              className="h-11 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-[#071223] hover:bg-emerald-400"
              trackingName="WhatsApp ile bilgi al"
              trackingLocation="sticky_footer_cta"
              eventType="whatsapp_click"
            >
              {content.cta.mobileStickyWhatsAppLabel}
            </TrackedLinkButton>
            <TrackedLinkButton
              href={`tel:${normalizedPhone}`}
              variant="outline"
              className="h-11 rounded-full border-white/12 bg-white/[0.04] px-5 text-sm font-semibold text-white hover:bg-white/[0.08]"
              trackingName="Telefonla gorus"
              trackingLocation="sticky_footer_cta"
              eventType="phone_click"
            >
              {content.cta.mobileStickyPhoneLabel}
            </TrackedLinkButton>
            <TrackedButton
              className="h-11 rounded-full bg-[#0f6bff] px-5 text-sm font-semibold text-white hover:bg-[#3384ff]"
              trackingName="Hemen Kayit Ol"
              trackingLocation="sticky_footer_cta"
              onClick={() => setIsPreRegistrationOpen(true)}
            >
              {content.cta.mobileStickyPrimaryLabel}
            </TrackedButton>
          </div>
        </div>
      </div>

      <PreRegistrationModal open={isPreRegistrationOpen} onOpenChange={setIsPreRegistrationOpen} />
      <style jsx>{`
        @keyframes homepageMediaRailMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.5rem));
          }
        }

        .homepage-media-rail-track {
          animation: homepageMediaRailMarquee 34s linear infinite;
        }

        .homepage-media-rail-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
