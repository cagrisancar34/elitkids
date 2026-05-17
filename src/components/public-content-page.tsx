import type { Route } from "next";
import Link from "next/link";

import { SeoLeadForm } from "@/components/seo-lead-form";
import { SeoStickyCta } from "@/components/seo-sticky-cta";
import type { LandingContent } from "@/lib/landing-content";
import { buildSeoPageJsonLd } from "@/lib/seo-metadata";
import type { PublicPageRenderable } from "@/lib/public-site";

export function PublicContentPage({
  page,
  landingContent,
}: {
  page: PublicPageRenderable;
  landingContent: LandingContent;
}) {
  const phone = landingContent.siteSettings.contactPhone;
  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  const whatsappDigits = landingContent.siteSettings.whatsappPhone.replace(/\D/g, "");
  const structuredData = buildSeoPageJsonLd(page);
  const internalLinks = page.internalLinks ?? [];
  const customSections = page.customSections ?? [];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f8ff_0%,#eef3ff_54%,#f8fbff_100%)] text-foreground">
      {structuredData.map((item, index) => (
        <script
          key={`${page.slug}-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(40,129,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(52,211,255,0.12),transparent_26%)]" />
        <div className="relative mx-auto max-w-[1320px] px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="font-display text-xl font-black tracking-[-0.04em] text-foreground">
              Elit Sanat ve Spor Kulubu
            </Link>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${normalizedPhone}`}
                className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-foreground shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
              >
                {phone}
              </a>
              <a
                href={`https://wa.me/${whatsappDigits}`}
                className="inline-flex h-11 items-center rounded-full bg-[linear-gradient(135deg,#0f63ea,#004dc2)] px-5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,86,215,0.18)]"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
            <div className="rounded-[2rem] border border-white/60 bg-white/84 p-8 shadow-[0_26px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {page.heroEyebrow}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[page.targetLocation, page.targetBranch, page.targetAgeGroup]
                  .filter(Boolean)
                  .map((item) => (
                    <span
                      key={item}
                      className="inline-flex rounded-full border border-primary/15 bg-primary/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
                    >
                      {item}
                    </span>
                  ))}
              </div>
              <h1 className="mt-5 max-w-[14ch] font-display text-[2.8rem] font-black leading-[0.92] tracking-[-0.06em] text-foreground md:text-[4.1rem]">
                {page.heroTitle}
              </h1>
              <p className="mt-6 max-w-[66ch] text-base leading-8 text-muted-foreground md:text-lg">
                {page.heroDescription}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={page.ctaPrimaryHref as Route}
                  className="inline-flex h-12 items-center rounded-[1rem] bg-[linear-gradient(135deg,#0f63ea,#004dc2)] px-6 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(20,86,215,0.18)]"
                >
                  {page.ctaPrimaryLabel}
                </Link>
                <Link
                  href={page.ctaSecondaryHref as Route}
                  className="inline-flex h-12 items-center rounded-[1rem] border border-slate-300 bg-white px-6 text-sm font-semibold text-foreground"
                >
                  {page.ctaSecondaryLabel}
                </Link>
              </div>
            </div>

            <aside className="rounded-[2rem] bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)] p-7 text-white shadow-[0_28px_60px_rgba(15,23,42,0.18)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/46">
                {page.locationTitle}
              </div>
              <p className="mt-5 text-sm leading-7 text-white/72">{page.locationBody}</p>
              <div className="mt-8 space-y-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5">
                {page.bulletItems.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-white/78">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            [page.introTitle, page.introBody],
            [page.sectionOneTitle, page.sectionOneBody],
            [page.sectionTwoTitle, page.sectionTwoBody],
            [page.sectionThreeTitle, page.sectionThreeBody],
          ].map(([title, body], index) => (
            <article
              key={`${page.slug}-section-${index}`}
              className={index === 0 ? "panel-soft rounded-[1.9rem] p-7 lg:col-span-3" : "panel-soft rounded-[1.9rem] p-7"}
            >
              <h2 className="font-display text-[1.8rem] font-bold tracking-[-0.04em] text-foreground">
                {title}
              </h2>
              <p className="mt-4 text-sm leading-8 text-muted-foreground md:text-base">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {customSections.length > 0 ? (
        <section className="mx-auto max-w-[1320px] px-5 pb-4 md:px-8 md:pb-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {customSections.map((section) => (
              <article
                key={section.id}
                className={
                  section.style === "highlight"
                    ? "rounded-[1.9rem] bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)] p-7 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
                    : section.style === "proof"
                      ? "rounded-[1.9rem] border border-sky-200 bg-sky-50 p-7 shadow-[0_16px_34px_rgba(15,23,42,0.06)]"
                      : "panel-soft rounded-[1.9rem] p-7"
                }
              >
                {section.eyebrow ? (
                  <div
                    className={
                      section.style === "highlight"
                        ? "text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50"
                        : "text-[11px] font-semibold uppercase tracking-[0.22em] text-primary"
                    }
                  >
                    {section.eyebrow}
                  </div>
                ) : null}
                <h2
                  className={
                    section.style === "highlight"
                      ? "mt-4 font-display text-[1.8rem] font-bold tracking-[-0.04em] text-white"
                      : "mt-4 font-display text-[1.8rem] font-bold tracking-[-0.04em] text-foreground"
                  }
                >
                  {section.title}
                </h2>
                <p
                  className={
                    section.style === "highlight"
                      ? "mt-4 text-sm leading-8 text-white/76 md:text-base"
                      : "mt-4 text-sm leading-8 text-muted-foreground md:text-base"
                  }
                >
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-slate-200/70 bg-white/60">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              FAQ
            </div>
            <h2 className="mt-4 font-display text-[2.2rem] font-black tracking-[-0.05em] text-foreground md:text-[3rem]">
              {page.faqTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              {page.faqDescription}
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {page.faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[1.6rem] border border-white/60 bg-white/88 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
              >
                <h3 className="font-display text-[1.2rem] font-bold tracking-[-0.03em] text-foreground">
                  {item.question}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {page.testimonialQuote ? (
        <section className="mx-auto max-w-[1320px] px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 rounded-[2rem] border border-white/70 bg-white/86 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:grid-cols-[0.9fr_1.1fr] md:p-10">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Lokal guven sinyali
              </div>
              <h2 className="mt-4 font-display text-[2rem] font-black tracking-[-0.05em] text-foreground md:text-[2.6rem]">
                Bu sayfa yalnizca bilgi vermek icin degil, aileye karar kolayligi vermek icin kurgulandi.
              </h2>
            </div>
            <blockquote className="rounded-[1.5rem] bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)] p-6 text-white shadow-[0_20px_44px_rgba(15,23,42,0.16)]">
              <p className="text-base leading-8 text-white/80 md:text-lg">{page.testimonialQuote}</p>
              <footer className="mt-6">
                <div className="font-display text-lg font-bold tracking-[-0.03em]">{page.testimonialAuthor}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/46">
                  {page.testimonialRole}
                </div>
              </footer>
            </blockquote>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-6 rounded-[2rem] bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)] p-8 text-white shadow-[0_26px_60px_rgba(15,23,42,0.18)] md:p-10 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46">
              CTA
            </div>
            <h2 className="mt-4 max-w-[14ch] font-display text-[2.2rem] font-black leading-[0.96] tracking-[-0.05em]">
              {page.ctaTitle}
            </h2>
            <p className="mt-4 max-w-[62ch] text-sm leading-8 text-white/72 md:text-base">
              {page.ctaDescription}
            </p>
          </div>

          <div className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6">
            <Link
              href={page.ctaPrimaryHref as Route}
              className="inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#42baf9] px-6 text-sm font-semibold text-[#071223]"
            >
              {page.ctaPrimaryLabel}
            </Link>
            <Link
              href={page.ctaSecondaryHref as Route}
              className="inline-flex h-12 items-center justify-center rounded-[1rem] border border-white/12 bg-white/[0.04] px-6 text-sm font-semibold text-white"
            >
              {page.ctaSecondaryLabel}
            </Link>
            <div className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4 text-sm leading-7 text-white/70">
              <div>{landingContent.siteSettings.location}</div>
              <div>{landingContent.siteSettings.contactPhone}</div>
              <div>{landingContent.siteSettings.contactEmail}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-white/70">
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8">
          <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Icerikten talebe gecis
              </div>
              <h2 className="font-display text-[2.1rem] font-black tracking-[-0.05em] text-foreground md:text-[2.8rem]">
                Bu sayfadan ayrilmadan bilgi alin, program sorusu birakin veya geri arama isteyin.
              </h2>
              <p className="max-w-[64ch] text-base leading-8 text-muted-foreground">
                SEO sayfalari yalnizca okunacak metinler degil; lead uretecek net CTA ve kaynak izleme akisiyla tasarlandi.
              </p>

              {internalLinks.length > 0 ? (
                <div className="grid gap-3 rounded-[1.6rem] border border-slate-200 bg-white/88 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                    Ilgili sayfalar
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {internalLinks.map((item) => (
                      <Link
                        key={`${page.slug}-${item.href}-${item.label}`}
                        href={item.href as Route}
                        className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 rounded-[1.6rem] border border-slate-200 bg-white/88 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Hizli bilgi formu
                </div>
                <h3 className="mt-3 font-display text-[1.4rem] font-bold tracking-[-0.04em] text-foreground">
                  Bilgi almak icin kisa formu doldurun
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Program, yas grubu ve ilk ders sureci icin ekip size geri donsun.
                </p>
              </div>
              <SeoLeadForm
                source="organic_seo_page"
                branchInterest={page.targetBranch || page.title}
              />
            </div>
          </div>
        </div>
      </section>

      <SeoStickyCta
        title={page.ctaTitle}
        primaryLabel={page.ctaPrimaryLabel}
        primaryHref={page.ctaPrimaryHref}
        phone={landingContent.siteSettings.contactPhone}
        whatsappDigits={landingContent.siteSettings.whatsappPhone.replace(/\D/g, "")}
      />
    </main>
  );
}
