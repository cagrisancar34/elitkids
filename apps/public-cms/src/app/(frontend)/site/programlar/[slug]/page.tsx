import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Check, Info, MapPin, Users, X } from "lucide-react";

import { ApplicationForm } from "@/components/ApplicationForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  getRegionLabel,
  getStatusLabel,
} from "@/lib/content";
import { getCMSProgramBySlug } from "@/lib/cmsContent";
import { canPreview } from "@/lib/preview";

type Args = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const program = await getCMSProgramBySlug(slug);

  if (!program) {
    return {};
  }

  return {
    title: program.title,
    description: program.summary,
    openGraph: {
      images: [{ url: program.image }],
      title: program.title,
      description: program.summary,
    },
  };
}

export default async function ProgramDetailPage({ params, searchParams }: Args) {
  const { slug } = await params;
  const program = await getCMSProgramBySlug(slug, await canPreview(searchParams));

  if (!program) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    description: program.summary,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [program.image],
    location: {
      "@type": "Place",
      address: program.location,
      name: program.location,
    },
    name: program.title,
    organizer: {
      "@type": "Organization",
      name: "Dört Mevsim Doğada",
      url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Header />
      <main>
        <section className="relative min-h-[560px] overflow-hidden">
          <Image
            src={program.image}
            alt={program.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#173d33]/90 via-[#173d33]/58 to-transparent" />
          <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-end px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-4xl text-white">
              <p className="text-sm font-semibold uppercase text-[#f2b46d]">
                {program.categoryLabel} · {getStatusLabel(program.status)}
              </p>
              <h1 className="mt-4 text-5xl font-semibold leading-[1.06] md:text-7xl">
                {program.title}
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-8 text-white/86">{program.summary}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_390px] lg:px-8">
          <div className="space-y-10">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { icon: MapPin, label: "Lokasyon", value: program.location },
                { icon: Users, label: "Yaş grubu", value: program.audience },
                { icon: CalendarDays, label: "Sezon", value: program.season },
                { icon: Info, label: "Rota", value: getRegionLabel(program.region) },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-stone-200 bg-white p-5">
                  <item.icon size={20} className="text-[#2e7d5f]" aria-hidden="true" />
                  <p className="mt-4 text-sm text-stone-500">{item.label}</p>
                  <p className="mt-1 font-semibold text-stone-950">{item.value}</p>
                </div>
              ))}
            </div>

            <section className="rounded-lg border border-stone-200 bg-white p-6">
              <h2 className="text-3xl font-semibold text-stone-950">Tarih oturumları</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {program.dates.map((date) => (
                  <div key={date.label} className="flex items-center justify-between rounded-md bg-[#fbfaf6] px-4 py-3">
                    <span className="font-medium text-stone-800">{date.label}</span>
                    <span className="text-sm text-stone-500">
                      {date.capacityStatus === "available"
                        ? "Uygun"
                        : date.capacityStatus === "limited"
                          ? "Az kaldı"
                          : "Doldu"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              {program.details.map((detail) => (
                <div key={detail.heading} className="rounded-lg border border-stone-200 bg-white p-6">
                  <h2 className="text-3xl font-semibold text-stone-950">{detail.heading}</h2>
                  <p className="mt-4 whitespace-pre-line text-lg leading-8 text-stone-600">
                    {detail.body}
                  </p>
                </div>
              ))}
            </section>

            <section className="grid gap-5 md:grid-cols-2">
              <div className="rounded-lg border border-stone-200 bg-white p-6">
                <h2 className="text-2xl font-semibold text-stone-950">Dahil olanlar</h2>
                <ul className="mt-5 space-y-3">
                  {program.included.map((item) => (
                    <li key={item} className="flex gap-3 text-stone-700">
                      <Check className="mt-1 shrink-0 text-[#2e7d5f]" size={17} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-6">
                <h2 className="text-2xl font-semibold text-stone-950">Hariç olanlar</h2>
                <ul className="mt-5 space-y-3">
                  {program.excluded.map((item) => (
                    <li key={item} className="flex gap-3 text-stone-700">
                      <X className="mt-1 shrink-0 text-[#d9783d]" size={17} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-6">
              <h2 className="text-3xl font-semibold text-stone-950">Sık sorulan sorular</h2>
              <div className="mt-5 divide-y divide-stone-100">
                {program.faq.map((item) => (
                  <details key={item.question} className="group py-4">
                    <summary className="cursor-pointer text-lg font-semibold text-stone-900">
                      {item.question}
                    </summary>
                    <p className="mt-3 leading-7 text-stone-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <ApplicationForm programSlug={program.slug} programTitle={program.title} />
          </aside>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Footer />
    </div>
  );
}
