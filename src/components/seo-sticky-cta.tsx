"use client";

import type { Route } from "next";
import Link from "next/link";

import { trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";

type SeoStickyCtaProps = {
  title: string;
  primaryLabel: string;
  primaryHref: string;
  phone: string;
  whatsappDigits: string;
};

export function SeoStickyCta({
  title,
  primaryLabel,
  primaryHref,
  phone,
  whatsappDigits,
}: SeoStickyCtaProps) {
  const normalizedPhone = phone.replace(/[^\d+]/g, "");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-3 md:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-[980px] flex-col gap-3 rounded-[1.4rem] border border-slate-200/80 bg-white/92 px-4 py-4 shadow-[0_24px_56px_rgba(15,23,42,0.14)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            Silivri bilgi alma hatti
          </div>
          <div className="mt-1 font-display text-[1.02rem] font-bold tracking-[-0.03em] text-foreground md:text-[1.16rem]">
            {title}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://wa.me/${whatsappDigits}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackWhatsAppClick("seo_sticky_cta")}
            className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-[#071223] transition hover:bg-emerald-400"
          >
            WhatsApp
          </a>
          <a
            href={`tel:${normalizedPhone}`}
            onClick={() => trackPhoneClick("seo_sticky_cta")}
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:text-primary"
          >
            Telefon
          </a>
          <Link
            href={primaryHref as Route}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f63ea,#004dc2)] px-5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(20,86,215,0.18)]"
          >
            {primaryLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
