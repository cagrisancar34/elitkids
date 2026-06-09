import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import Image from "next/image";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SectionIntro } from "@/components/SectionIntro";
import { getCMSLocations } from "@/lib/cmsContent";
import { canPreview } from "@/lib/preview";
import { getSitePageByPath } from "@/lib/sitePages";

export const metadata: Metadata = {
  title: "Lokasyonlar",
  description: "Program rotalarının şehir, ülke ve doğa deneyimi bilgileri.",
};

export const dynamic = "force-dynamic";

export default async function LocationsPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const preview = await canPreview(searchParams);
  const [locations, page] = await Promise.all([getCMSLocations(), getSitePageByPath("/lokasyonlar", preview)]);
  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow={page?.hero.eyebrow || "Rotalar"}
          title={page?.hero.heading || "Programların geçtiği yerler"}
          body={page?.hero.summary || "Her lokasyon çocuklu ailelerin güvenliği, erişimi ve deneyim derinliği düşünülerek seçilir."}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {locations.map((location) => (
            <article key={location.slug} className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              <div className="relative aspect-[4/3]">
                <Image
                  src={location.image}
                  alt={location.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-[#2e7d5f]">
                  <MapPin size={16} aria-hidden="true" />
                  {location.city}, {location.country}
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-stone-950">{location.title}</h2>
                <p className="mt-3 leading-7 text-stone-600">{location.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
