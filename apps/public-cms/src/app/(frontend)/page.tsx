import { ArrowRight, CalendarDays, Leaf, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeadlineCarousel } from "@/components/HeadlineCarousel";
import { ProgramCard } from "@/components/ProgramCard";
import { SectionIntro } from "@/components/SectionIntro";
import { getCMSPartners, getCMSPrograms, getCMSTestimonials } from "@/lib/cmsContent";
import { getHomepageHeadlines } from "@/lib/headlines";
import { getHomeHero } from "@/lib/homepage";
import { canPreview } from "@/lib/preview";
import { getSitePageByPath } from "@/lib/sitePages";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const metricIcons = {
  calendar: CalendarDays,
  leaf: Leaf,
  location: MapPin,
  shield: ShieldCheck,
  sparkles: Sparkles,
  users: Users,
};

const fallbackMetrics = [
  { icon: "leaf", label: "Doğa rotaları", value: "Her mevsim açık hava" },
  { icon: "users", label: "Yaş grupları", value: "3-14 yaş arası" },
  { icon: "calendar", label: "Takvim", value: "Sezonluk oturumlar" },
  { icon: "shield", label: "Güven", value: "Öğretmen ekip eşliği" },
] as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const preview = await canPreview(searchParams);
  const [headlines, fallbackHero, homePage, programs, testimonials, partners] = await Promise.all([
    getHomepageHeadlines(preview),
    getHomeHero(),
    getSitePageByPath("/", preview),
    getCMSPrograms(preview),
    getCMSTestimonials(),
    getCMSPartners(),
  ]);
  const featuredPrograms = programs.filter((program) => program.featured);
  const metrics = homePage?.homeMetrics?.length ? homePage.homeMetrics : fallbackMetrics;
  const fallbackProcess = {
    description: "Ekip CMS panelinden programları, tarihleri, lokasyonları, yorumları ve başvuruları tek yerden yönetir.",
    eyebrow: "Nasıl çalışır?",
    steps: [
      { text: "Program içeriği ve tarih oturumları panelden güncellenir." },
      { text: "Ziyaretçi filtrelerle uygun rotayı bulur ve detay sayfasında ön başvuru bırakır." },
      { text: "Başvurular yönetim panelinde durum ve iç notlarla takip edilir." },
    ],
    title: "Yönetilebilir, sade ve güven veren başvuru akışı",
  };
  const process = {
    description: homePage?.homeProcess?.description || fallbackProcess.description,
    eyebrow: homePage?.homeProcess?.eyebrow || fallbackProcess.eyebrow,
    steps: homePage?.homeProcess?.steps?.length ? homePage.homeProcess.steps : fallbackProcess.steps,
    title: homePage?.homeProcess?.title || fallbackProcess.title,
  };
  const hero = homePage
    ? {
        ...fallbackHero,
        backgroundAlt: homePage.hero.imageAlt || fallbackHero.backgroundAlt,
        backgroundImage:
          typeof homePage.hero.image === "object" && homePage.hero.image?.url
            ? homePage.hero.image.url
            : homePage.hero.externalImage || fallbackHero.backgroundImage,
        description: homePage.hero.summary || fallbackHero.description,
        eyebrow: homePage.hero.eyebrow || fallbackHero.eyebrow,
        title: homePage.hero.heading,
      }
    : fallbackHero;
  const heroOverlay = {
    dark: "from-[#102d25]/95 via-[#173d33]/68 to-[#173d33]/20",
    light: "from-[#173d33]/72 via-[#173d33]/36 to-transparent",
    medium: "from-[#173d33]/88 via-[#173d33]/52 to-transparent",
  }[hero.overlayStrength];

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Header />
      <main>
        <section className="relative min-h-[calc(100svh-72px)] overflow-hidden">
          <Image
            src={hero.backgroundImage}
            alt={hero.backgroundAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${heroOverlay}`} />
          <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-white">
              <p className="text-sm font-semibold uppercase text-[#f2b46d]">
                {hero.eyebrow}
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] md:text-7xl">
                {hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/86">
                {hero.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {hero.primaryButton ? (
                  <Link
                    href={hero.primaryButton.url}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#d9783d] px-5 text-sm font-semibold text-white transition hover:bg-[#bf6530]"
                  >
                    {hero.primaryButton.label}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                ) : null}
                {hero.secondaryButton ? (
                  <Link
                    href={hero.secondaryButton.url}
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {hero.secondaryButton.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-6">
            <SectionIntro
              eyebrow="Ana manşet"
              title="Şu anda öne çıkanlar"
              body="Yeni dönemler, özel rotalar ve önemli duyurular."
            />
            <Link
              href="/site/programlar"
              className="hidden min-h-11 items-center gap-2 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800 transition hover:border-[#214d3f] hover:text-[#214d3f] md:inline-flex"
            >
              Tüm programlar
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <HeadlineCarousel headlines={headlines} />
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {metrics.map((item) => {
            const MetricIcon = metricIcons[item.icon || "leaf"];
            return (
            <div key={item.label} className="rounded-lg border border-stone-200 bg-white p-5">
              <MetricIcon className="text-[#2e7d5f]" size={22} aria-hidden="true" />
              <p className="mt-4 text-sm text-stone-500">{item.label}</p>
              <p className="mt-1 font-semibold text-stone-950">{item.value}</p>
            </div>
            );
          })}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionIntro
              eyebrow="Yaklaşan programlar"
              title="Çocuklu aileler için seçilmiş rotalar"
              body="Satış ve ödeme akışı olmadan; programları inceleyin, ön başvuru bırakın, ekip sizinle iletişime geçsin."
            />
            <Link
              href="/site/programlar"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800 transition hover:border-[#214d3f] hover:text-[#214d3f]"
            >
              Tüm programlar
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredPrograms.map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))}
          </div>
        </section>

        <section className="bg-[#e9f0eb] py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <SectionIntro
                eyebrow={process.eyebrow}
                title={process.title}
                body={process.description}
              />
            </div>
            <div className="grid gap-4">
              {process.steps.map((item, index) => (
                <div key={item.text} className="flex gap-4 rounded-lg bg-white p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#214d3f] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-lg leading-7 text-stone-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Misafir deneyimi"
            title="Ailelerin dilinden"
            body="Program sonrası yorumlar CMS üzerinden seçilip ana sayfada öne çıkarılabilir."
          />
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure key={item.title} className="rounded-lg border border-stone-200 bg-white p-6">
                <Sparkles className="text-[#d9783d]" size={20} aria-hidden="true" />
                <blockquote className="mt-5 leading-7 text-stone-700">“{item.body}”</blockquote>
                <figcaption className="mt-5 text-sm font-semibold text-stone-950">
                  {item.parentName} · {item.childInfo}
                </figcaption>
                <p className="mt-1 text-sm text-stone-500">{item.programName}</p>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-[#214d3f] p-8 text-white md:p-10">
            <p className="text-sm uppercase text-white/60">{homePage?.partnerEyebrow || "Katkılarıyla"}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-md border border-white/14 px-5 py-4 text-lg font-semibold">
                  {partner.title}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
