import {
  Bike,
  Brush,
  HeartHandshake,
  Leaf,
  Mail,
  MapPin,
  Mountain,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { SitePage } from "@/payload-types";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeadlineCarousel } from "@/components/HeadlineCarousel";
import { ProgramCard } from "@/components/ProgramCard";
import { SectionIntro } from "@/components/SectionIntro";
import { SimpleRichText } from "@/components/SimpleRichText";
import { getCMSLocations, getCMSPartners, getCMSPrograms, getCMSTestimonials } from "@/lib/cmsContent";
import { getHomepageHeadlines } from "@/lib/headlines";
import { getSiteSettings } from "@/lib/siteSettings";
import { toPublicSitePath } from "@/lib/routes";

const icons = {
  bike: Bike,
  brush: Brush,
  heart: HeartHandshake,
  leaf: Leaf,
  mountain: Mountain,
  plane: Plane,
  shield: ShieldCheck,
  sparkles: Sparkles,
};

function getImageUrl(image: unknown, externalImage?: null | string) {
  if (typeof image === "object" && image && "url" in image && typeof image.url === "string") {
    return image.url;
  }

  return externalImage || undefined;
}

export async function ContentPage({ page }: { page: SitePage }) {
  const heroImage = getImageUrl(page.hero.image, page.hero.externalImage);
  const [programs, locations, testimonials, partners, headlines, siteSettings] = await Promise.all([
    getCMSPrograms(),
    getCMSLocations(),
    getCMSTestimonials(),
    getCMSPartners(),
    getHomepageHeadlines(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Header />
      <main>
        {page.hero.style === "image" && heroImage ? (
          <section className="relative min-h-[500px] overflow-hidden bg-[#173d33]">
            <Image
              src={heroImage}
              alt={page.hero.imageAlt || page.hero.heading}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#173d33]/90 via-[#173d33]/50 to-transparent" />
            <div className="relative mx-auto flex min-h-[500px] max-w-7xl items-end px-4 py-16 text-white sm:px-6 lg:px-8">
              <div className="max-w-5xl">
                {page.hero.eyebrow ? (
                  <p className="text-sm font-semibold uppercase text-[#f2b46d]">{page.hero.eyebrow}</p>
                ) : null}
                <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.06] md:text-7xl">
                  {page.hero.heading}
                </h1>
                {page.hero.summary ? (
                  <p className="mt-5 max-w-3xl text-xl leading-8 text-white/80">{page.hero.summary}</p>
                ) : null}
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8 lg:pt-20">
            <div className="max-w-5xl">
              {page.hero.eyebrow ? (
                <p className="text-sm font-semibold uppercase text-[#d9783d]">{page.hero.eyebrow}</p>
              ) : null}
              <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.06] text-stone-950 md:text-7xl">
                {page.hero.heading}
              </h1>
              {page.hero.summary ? (
                <p className="mt-5 max-w-3xl text-xl leading-8 text-stone-600">{page.hero.summary}</p>
              ) : null}
            </div>
          </section>
        )}

        {page.layout?.map((block, index) => {
          const key = block.id || `${block.blockType}-${index}`;

          if (block.blockType === "richContent") {
            return (
              <section
                key={key}
                className={`px-4 py-12 sm:px-6 lg:px-8 ${block.width === "wide" ? "mx-auto max-w-7xl" : "mx-auto max-w-4xl"}`}
              >
                {block.title || block.eyebrow || block.intro ? (
                  <div className="mb-8">
                    <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || ""} body={block.intro || undefined} />
                  </div>
                ) : null}
                <SimpleRichText data={block.content} className="news-rich-text" />
              </section>
            );
          }

          if (block.blockType === "mediaText") {
            const image = getImageUrl(block.image, block.externalImage);
            return (
              <section key={key} className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div className={block.imagePosition === "left" ? "lg:order-2" : ""}>
                  <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || ""} body={block.intro || undefined} />
                  <SimpleRichText data={block.content} className="news-rich-text mt-7" />
                </div>
                {image ? (
                  <div className={`relative aspect-[4/3] overflow-hidden rounded-lg ${block.imagePosition === "left" ? "lg:order-1" : ""}`}>
                    <Image src={image} alt={block.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                  </div>
                ) : null}
              </section>
            );
          }

          if (block.blockType === "featureList") {
            const columnClass = block.columns === "2" ? "md:grid-cols-2" : block.columns === "4" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";
            return (
              <section key={key} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                {block.title || block.eyebrow || block.intro ? (
                  <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || ""} body={block.intro || undefined} />
                ) : null}
                <div className={`mt-9 grid gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 ${columnClass}`}>
                  {block.items.map((item) => {
                    const Icon = icons[item.icon || "leaf"];
                    return (
                      <article key={item.id || item.title} className="bg-white p-6">
                        <Icon className="text-[#2e7d5f]" size={24} aria-hidden="true" />
                        <h2 className="mt-5 text-2xl font-semibold text-stone-950">{item.title}</h2>
                        <p className="mt-3 leading-7 text-stone-600">{item.body}</p>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (block.blockType === "callToAction") {
            const green = block.tone !== "light";
            return (
              <section key={key} className={green ? "bg-[#173d33] text-white" : "bg-[#e9f0eb] text-stone-950"}>
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
                  <div>
                    {block.eyebrow ? <p className={`text-sm font-semibold uppercase ${green ? "text-[#f2b46d]" : "text-[#d9783d]"}`}>{block.eyebrow}</p> : null}
                    <h2 className="mt-2 max-w-3xl text-3xl font-semibold md:text-4xl">{block.title}</h2>
                    {block.body ? <p className={`mt-3 max-w-2xl leading-7 ${green ? "text-white/70" : "text-stone-600"}`}>{block.body}</p> : null}
                  </div>
                  <Link href={toPublicSitePath(block.buttonUrl)} className={`inline-flex min-h-12 shrink-0 items-center justify-center rounded-md px-5 text-sm font-semibold transition ${green ? "bg-[#d9783d] text-white hover:bg-[#bf6530]" : "bg-[#214d3f] text-white hover:bg-[#173d33]"}`}>
                    {block.buttonLabel}
                  </Link>
                </div>
              </section>
            );
          }

          if (block.blockType === "contactForm") {
            const whatsappNumber = siteSettings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905551112233";
            return (
              <section key={key} className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                <div>
                  <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title} body={block.body || undefined} />
                  {block.showContactDetails ? (
                    <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200 text-stone-700">
                      <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="flex gap-3 py-4 transition hover:text-[#214d3f]">
                        <Phone size={19} className="text-[#2e7d5f]" aria-hidden="true" /> WhatsApp ile iletişime geç
                      </a>
                      <p className="flex gap-3 py-4"><Mail size={19} className="text-[#2e7d5f]" aria-hidden="true" /> {siteSettings.email}</p>
                      <p className="flex gap-3 py-4"><MapPin size={19} className="text-[#2e7d5f]" aria-hidden="true" /> {siteSettings.address}</p>
                    </div>
                  ) : null}
                </div>
                <ApplicationForm />
              </section>
            );
          }

          if (block.blockType === "locationGrid") {
            return (
              <section key={key} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || "Programların geçtiği yerler"} body={block.intro || undefined} />
                <div className="mt-9 grid gap-6 md:grid-cols-3">
                  {locations.map((location) => (
                    <article key={location.slug} className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                      <div className="relative aspect-[4/3]"><Image src={location.image} alt={location.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div>
                      <div className="p-5"><p className="text-sm text-[#2e7d5f]">{location.city}, {location.country}</p><h2 className="mt-3 text-2xl font-semibold">{location.title}</h2><p className="mt-3 leading-7 text-stone-600">{location.summary}</p></div>
                    </article>
                  ))}
                </div>
              </section>
            );
          }

          if (block.blockType === "programGrid") {
            return (
              <section key={key} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || "Öne çıkan programlar"} body={block.intro || undefined} />
                <div className="mt-9 grid gap-6 md:grid-cols-3">
                  {programs.slice(0, block.limit).map((program) => <ProgramCard key={program.slug} program={program} />)}
                </div>
              </section>
            );
          }

          if (block.blockType === "gallery") {
            const gallery = typeof block.gallery === "object" && block.gallery ? block.gallery : undefined;
            const images = gallery?.images || [];
            return (
              <section key={key} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || gallery?.title || "Galeri"} body={block.intro || gallery?.summary || undefined} />
                <div className={`mt-9 grid gap-3 ${block.display === "strip" ? "grid-cols-2 md:grid-cols-4" : "md:grid-cols-3"}`}>
                  {images.map((item) => {
                    const image = getImageUrl(item.image, item.externalImage);
                    return image ? <figure key={item.id || item.alt} className="relative aspect-[4/3] overflow-hidden rounded-md"><Image src={image} alt={item.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></figure> : null;
                  })}
                </div>
              </section>
            );
          }

          if (block.blockType === "testimonialGrid") {
            return (
              <section key={key} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || "Ailelerin dilinden"} body={block.intro || undefined} />
                <div className="mt-9 grid gap-5 md:grid-cols-3">
                  {testimonials.slice(0, block.limit).map((item) => <figure key={item.id} className="border-t border-stone-300 py-5"><blockquote className="leading-7 text-stone-700">“{item.body}”</blockquote><figcaption className="mt-5 text-sm font-semibold">{item.parentName}</figcaption></figure>)}
                </div>
              </section>
            );
          }

          if (block.blockType === "partnerGrid") {
            return (
              <section key={key} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || "Partnerler"} body={block.intro || undefined} />
                <div className="mt-8 flex flex-wrap border-y border-stone-200 py-6">{partners.map((item) => <span key={item.id} className="px-5 py-3 text-lg font-semibold">{item.title}</span>)}</div>
              </section>
            );
          }

          if (block.blockType === "headlineGrid") {
            return (
              <section key={key} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <SectionIntro eyebrow={block.eyebrow || undefined} title={block.title || "Öne çıkanlar"} body={block.intro || undefined} />
                <div className="mt-8"><HeadlineCarousel headlines={headlines.slice(0, block.limit)} /></div>
              </section>
            );
          }

          return null;
        })}
      </main>
      <Footer />
    </div>
  );
}
