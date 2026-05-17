"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { LandingContent } from "@/lib/landing-content";

const categoryLabels = {
  tumu: "Tum gorseller",
  tesis: "Tesis",
  yuzme: "Yuzme",
  cimnastik: "Cimnastik",
  tenis: "Tenis",
  genel: "Genel",
} as const;

type GalleryCategory = keyof typeof categoryLabels;

export function GalleryPageClient({ content }: { content: LandingContent }) {
  const [category, setCategory] = useState<GalleryCategory>("tumu");

  const publishedItems = useMemo(
    () =>
      content.galleryItems
        .filter((item) => item.published && item.image.trim().length > 0)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [content.galleryItems],
  );

  const visibleItems = useMemo(() => {
    if (category === "tumu") {
      return publishedItems;
    }

    return publishedItems.filter((item) => item.category === category);
  }, [category, publishedItems]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f9ff_0%,#eef4ff_52%,#f9fbff_100%)] text-foreground">
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(40,129,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(52,211,255,0.12),transparent_26%)]" />
        <div className="relative mx-auto max-w-[1320px] px-5 pb-16 pt-10 md:px-8 md:pb-20 md:pt-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="font-display text-xl font-black tracking-[-0.04em] text-foreground">
              {content.siteSettings.brandName}
            </Link>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-foreground shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
              >
                Ana sayfaya don
              </Link>
              <Link
                href="/#contact"
                className="inline-flex h-11 items-center rounded-full bg-[linear-gradient(135deg,#0f63ea,#004dc2)] px-5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,86,215,0.18)]"
              >
                Bilgi al
              </Link>
            </div>
          </div>

          <div className="mt-12 max-w-4xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              {content.galleryPage.eyebrow}
            </div>
            <h1 className="mt-5 font-display text-[2.8rem] font-black leading-[0.92] tracking-[-0.06em] text-foreground md:text-[4rem]">
              {content.galleryPage.title}
            </h1>
            <p className="mt-6 max-w-[60ch] text-base leading-8 text-muted-foreground md:text-lg">
              {content.galleryPage.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap gap-3">
          {Object.entries(categoryLabels).map(([value, label]) => {
            const active = category === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value as GalleryCategory)}
                className={`inline-flex h-11 items-center rounded-full border px-5 text-sm font-semibold transition ${
                  active
                    ? "border-primary/10 bg-[linear-gradient(135deg,#0f63ea,#004dc2)] text-white shadow-[0_16px_30px_rgba(20,86,215,0.18)]"
                    : "border-slate-300 bg-white text-foreground hover:border-primary/20 hover:text-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {visibleItems.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[1.9rem] border border-white/70 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.07)]"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={560}
                  height={432}
                  unoptimized
                  className="h-72 w-full object-cover"
                />
                <div className="px-5 pb-5 pt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    {categoryLabels[item.category]}
                  </div>
                  <h2 className="mt-3 font-display text-[1.4rem] font-bold tracking-[-0.03em] text-foreground">
                    {item.title}
                  </h2>
                  {item.description ? (
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className="font-display text-2xl font-black tracking-[-0.04em] text-foreground">
              Bu kategori icin henuz yayinlanmis gorsel yok.
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Admin panelinden galeriye yeni gorsel ekledigimizde bu alan otomatik guncellenir.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
