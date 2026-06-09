"use client";

import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { HomepageHeadline } from "@/lib/headlines";

export function HeadlineCarousel({ headlines }: { headlines: HomepageHeadline[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (headlines.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % headlines.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [headlines.length]);

  if (!headlines.length) {
    return null;
  }

  const safeActiveIndex = activeIndex < headlines.length ? activeIndex : 0;
  const active = headlines[safeActiveIndex];

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + headlines.length) % headlines.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % headlines.length);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-[#173d33] shadow-xl shadow-stone-950/10">
      <div className="relative min-h-[540px] md:min-h-[650px]">
        {headlines.map((headline, index) => (
          <Image
            key={headline.id}
            src={headline.image}
            alt={headline.title}
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            priority={index === 0}
            className={`object-cover transition duration-700 ${
              safeActiveIndex === index ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#102b24] via-[#102b24]/18 to-transparent" />
        <Link
          href={active.href}
          aria-label={`${active.title} haberini oku`}
          className="absolute inset-0 z-[5]"
        />

        {headlines.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Önceki manşet"
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-black/50 md:left-6"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Sonraki manşet"
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-black/50 md:right-6"
            >
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-6 text-white md:p-10">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase text-[#f2b46d]">{active.kicker}</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.08] md:text-6xl">
              {active.title}
            </h2>
            {active.summary ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/76 md:text-lg">
                {active.summary}
              </p>
            ) : null}
            <span className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#d9783d] px-4 text-sm font-semibold text-white">
              {active.buttonLabel}
              <ExternalLink size={16} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>

      {headlines.length > 1 ? (
        <div className="grid border-t border-white/12 bg-[#102b24] text-white" style={{ gridTemplateColumns: `repeat(${headlines.length}, minmax(0, 1fr))` }}>
          {headlines.map((headline, index) => (
            <button
              key={headline.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${index + 1}. manşeti göster`}
              aria-current={safeActiveIndex === index}
              className={`min-h-12 border-r border-white/10 text-sm font-semibold transition last:border-r-0 ${
                safeActiveIndex === index
                  ? "bg-[#d9783d] text-white"
                  : "text-white/56 hover:bg-white/8"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
