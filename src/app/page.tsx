"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Dumbbell,
  MapPin,
  Medal,
  MessageCircleHeart,
  Newspaper,
  Play,
  Quote,
  ShieldCheck,
  Snowflake,
  Star,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type IconKey =
  | "snowflake"
  | "users"
  | "medal"
  | "shield"
  | "clock"
  | "map"
  | "dumbbell"
  | "heart"
  | "news"
  | "star"
  | "quote"
  | "instagram"
  | "youtube";

type LandingContent = {
  siteSettings: {
    brandName: string;
    brandTagline: string;
    contactPhone: string;
    contactEmail: string;
    copyright: string;
  };
  navbar: {
    logoLabel: string;
    links: Array<{ label: string; href: string }>;
    ctaLabel: string;
    ctaHref: string;
  };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    backgroundImage: string;
  };
  stats: Array<{
    value: string;
    label: string;
    description: string;
    icon: IconKey;
  }>;
  programs: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      image: string;
      href: string;
      ctaLabel: string;
      layout: "wide" | "tall" | "full";
    }>;
  };
  whyUs: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    features: Array<{
      title: string;
      description: string;
      icon: IconKey;
    }>;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      name: string;
      role: string;
      quote: string;
      rating: number;
      avatar?: string;
    }>;
  };
  news: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      image: string;
      category: string;
      title: string;
      description: string;
      href: string;
    }>;
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    branchLabel: string;
    branchPlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    submitLabel: string;
    footnote: string;
  };
  footer: {
    description: string;
    groups: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    socials: Array<{
      label: string;
      href: string;
      icon: IconKey;
    }>;
  };
};

const iconMap = {
  snowflake: Snowflake,
  users: Users,
  medal: Medal,
  shield: ShieldCheck,
  clock: Clock3,
  map: MapPin,
  dumbbell: Dumbbell,
  heart: MessageCircleHeart,
  news: Newspaper,
  star: Star,
  quote: Quote,
  instagram: MessageCircleHeart,
  youtube: Play,
} satisfies Record<IconKey, typeof Snowflake>;

const defaultLandingContent: LandingContent = {
  siteSettings: {
    brandName: "Buz Akademi",
    brandTagline: "Premium buz sporları akademisi",
    contactPhone: "+90 850 190 42 85",
    contactEmail: "iletisim@buzakademi.com",
    copyright: "Buz Akademi. Tum haklari saklidir.",
  },
  navbar: {
    logoLabel: "BA",
    links: [
      { label: "Branslar", href: "#branslar" },
      { label: "Programlar", href: "#programlar" },
      { label: "Egitmenler", href: "#neden-biz" },
      { label: "Tesisler", href: "#tesisler" },
      { label: "Duyurular", href: "#haberler" },
    ],
    ctaLabel: "Hemen Kayit Ol",
    ctaHref: "#kayit",
  },
  hero: {
    badge: "2026 sezon kayitlari acildi",
    title: "Buzda zarafet,",
    highlight: "akademik disiplinle",
    description:
      "Patenden buz hokeyine uzanan premium programlarimizla sporculari guvenli, rafine ve ilham veren bir akademi deneyimiyle bulusturuyoruz.",
    primaryCtaLabel: "Hemen Kayit Ol",
    primaryCtaHref: "#kayit",
    secondaryCtaLabel: "Programlari Incele",
    secondaryCtaHref: "#branslar",
    backgroundImage:
      "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1800&q=80",
  },
  stats: [
    {
      value: "15+",
      label: "yillik deneyim",
      description: "Buz ustunde nesiller boyu sureklilik kuran egitim omurgasi.",
      icon: "snowflake",
    },
    {
      value: "500+",
      label: "aktif sporcu",
      description: "Her sezon farkli seviyelerde ritmini bulan genis akademi toplulugu.",
      icon: "users",
    },
    {
      value: "12+",
      label: "milli atlet",
      description: "Yarismaci gelisim programindan cikmis ulusal seviye sporcular.",
      icon: "medal",
    },
  ],
  programs: {
    eyebrow: "Branslar",
    title: "Buz ustunde her yolculuk, karakterli bir antrenman diliyle baslar.",
    description:
      "Her brans kendi ritmini tasir; biz o ritmi editorial bir sahneleme, guclu teknik egitim ve sahici atmosferle sunuyoruz.",
    items: [
      {
        title: "Artistik Patinaj",
        description:
          "Zarafet, denge ve sahne bilincini teknik dogrulukla birlestiren premium program.",
        image:
          "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
        href: "#kayit",
        ctaLabel: "Detaylari Gor",
        layout: "wide",
      },
      {
        title: "Buz Hokeyi",
        description:
          "Hiz, kuvvet ve takim ritmini modern saha standardinda bulusturan rekabetci gelisim hattı.",
        image:
          "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80",
        href: "#kayit",
        ctaLabel: "Takim Programi",
        layout: "tall",
      },
      {
        title: "Surat Pateni",
        description:
          "Ivme, teknik cizgi ve dayaniklilik uzerine kurulan yuksek tempolu performans yolu.",
        image:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1500&q=80",
        href: "#kayit",
        ctaLabel: "Performans Plani",
        layout: "full",
      },
    ],
  },
  whyUs: {
    eyebrow: "Neden Biz",
    title: "Gelecegin sampiyonlarini bugunden yetistiren sakin ama iddiali bir kultur.",
    description:
      "Buz Akademi yalnizca ders veren bir kurum degil; sporcu psikolojisini, aile iletisimi ve guvenli ilerleme cizgisini ayni kalite standardinda yoneten bir gelisim ortami.",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    features: [
      {
        title: "Uluslararasi standarda yakin metodoloji",
        description:
          "Teknik kadromuz gelisim planlarini yas ve seviye bazli net kilometre taslariyla kurar.",
        icon: "medal",
      },
      {
        title: "Guvenli ve izlenebilir egitim",
        description:
          "Her sporcu icin devam, yuklenme ve saha disi koordinasyon duzenli takip edilir.",
        icon: "shield",
      },
      {
        title: "Modern tesis ritmi",
        description:
          "Pist saatleri, isinma alanlari ve aile akisi premium bir deneyim olarak tasarlanir.",
        icon: "map",
      },
      {
        title: "Performans odakli destek",
        description:
          "Fiziksel gelisim, mental dayaniklilik ve surekli geri bildirim tek omurgada ilerler.",
        icon: "dumbbell",
      },
    ],
  },
  testimonials: {
    eyebrow: "Deneyimler",
    title: "Sporcu ve veli tarafinda guven, ilham ve devam hissi birakiyoruz.",
    description:
      "Akademi atmosferinin en dogru olcusu, piste gelen sporcularin ve ailelerin hissettigi netliktir.",
    items: [
      {
        name: "Aylin Yildiz",
        role: "Veli",
        quote:
          "Kizim pistte hem cok daha guvenli hem de cok daha istekli. Akademinin duzeni bizi ilk haftadan itibaren rahatlatti.",
        rating: 5,
      },
      {
        name: "Deniz Erdem",
        role: "Milli takim adayi sporcu",
        quote:
          "Antrenman kalitesi kadar ortam da cok kuvvetli. Her seansa ne icin geldigimi biliyorum ve ritmimi koruyabiliyorum.",
        rating: 5,
      },
      {
        name: "Mert Kaya",
        role: "Veli",
        quote:
          "Iletisimleri net, ekip profesyonel ve tesis kullanimi son derece duzenli. Premium bir deneyim hissi veriyor.",
        rating: 5,
      },
    ],
  },
  news: {
    eyebrow: "Akademi Guncel",
    title: "Sezon takvimi, etkinlikler ve pistten gelen yeni haberler.",
    description:
      "Akademi vitrinini canli tutan tum duyurular tek bir editoryal akista ilerler.",
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
        category: "Basari Hikayesi",
        title: "Balkan Sampiyonasi icin 3 sporcu milli havuza davet edildi",
        description:
          "Yarisma gelisim grubumuzdan uc sporcu yeni sezon performans havuzuna secildi.",
        href: "#kayit",
      },
      {
        image:
          "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=900&q=80",
        category: "Etkinlik",
        title: "Yeni donem tanitim gunu ve ucretsiz deneme dersi",
        description:
          "Aileler ve aday sporcular icin pist uzeri tanisma programi acildi.",
        href: "#kayit",
      },
      {
        image:
          "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80",
        category: "Duyuru",
        title: "Milli performans atolyemiz yenilenmis programiyla basliyor",
        description:
          "Kuvvet, denge ve esneklik hattinda yeni salon kurgusu kullanima giriyor.",
        href: "#kayit",
      },
    ],
  },
  cta: {
    eyebrow: "Kayit Basvurusu",
    title: "Sampiyonlarin arasina katilmak icin ilk adimi bugun at.",
    description:
      "Brans, yas seviyesi ve hedefe gore sana uygun grup planini iletelim. Akademi ekibi ayni gun icinde geri donus saglar.",
    fullNameLabel: "Adiniz soyadiniz",
    fullNamePlaceholder: "Sporcu veya veli adi",
    emailLabel: "E-posta adresi",
    emailPlaceholder: "ornek@buzakademi.com",
    phoneLabel: "Telefon numarasi",
    phonePlaceholder: "+90 5xx xxx xx xx",
    branchLabel: "Ilgilendiginiz brans",
    branchPlaceholder: "Artistik patinaj, buz hokeyi, surat pateni...",
    noteLabel: "Kisa not",
    notePlaceholder: "Yas, deneyim seviyesi veya hedefinizden kisaca bahsedin.",
    submitLabel: "Basvuruyu Gonder",
    footnote: "Form kurgusu su an statik fallback ile calisir; ileride Supabase uzerinden admin panelden guncellenebilir.",
  },
  footer: {
    description:
      "Buz Akademi, sporculari premium egitim, rafine tesis deneyimi ve guvenli ilerleme cizgisiyle bulusturur.",
    groups: [
      {
        title: "Akademi",
        links: [
          { label: "Hakkimizda", href: "#neden-biz" },
          { label: "Egitmenler", href: "#neden-biz" },
          { label: "Branslar", href: "#branslar" },
        ],
      },
      {
        title: "Guncel",
        links: [
          { label: "Duyurular", href: "#haberler" },
          { label: "Sezon Takvimi", href: "#haberler" },
          { label: "Basvuru", href: "#kayit" },
        ],
      },
      {
        title: "Iletisim",
        links: [
          { label: "Tesisler", href: "#tesisler" },
          { label: "Kayit Ofisi", href: "#kayit" },
          { label: "Bize Ulasin", href: "#kayit" },
        ],
      },
    ],
    socials: [
      { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
      { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
    ],
  },
};

function mergeLandingContent(
  base: LandingContent,
  override?: Partial<LandingContent> | null,
): LandingContent {
  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    siteSettings: {
      ...base.siteSettings,
      ...override.siteSettings,
    },
    navbar: {
      ...base.navbar,
      ...override.navbar,
    },
    hero: {
      ...base.hero,
      ...override.hero,
    },
    programs: {
      ...base.programs,
      ...override.programs,
      items: override.programs?.items ?? base.programs.items,
    },
    whyUs: {
      ...base.whyUs,
      ...override.whyUs,
      features: override.whyUs?.features ?? base.whyUs.features,
    },
    testimonials: {
      ...base.testimonials,
      ...override.testimonials,
      items: override.testimonials?.items ?? base.testimonials.items,
    },
    news: {
      ...base.news,
      ...override.news,
      items: override.news?.items ?? base.news.items,
    },
    cta: {
      ...base.cta,
      ...override.cta,
    },
    footer: {
      ...base.footer,
      ...override.footer,
      groups: override.footer?.groups ?? base.footer.groups,
      socials: override.footer?.socials ?? base.footer.socials,
    },
    stats: override.stats ?? base.stats,
  };
}

async function loadLandingContent() {
  // Future Supabase/CMS integration point:
  // This route currently returns a single normalized payload. Later we can
  // swap it with joined reads from homepage_settings, homepage_stats,
  // homepage_programs, homepage_features, homepage_testimonials,
  // homepage_news and homepage_footer_links without changing the UI layer.
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function syncLandingContent() {
      setIsLoading(true);

      try {
        const nextContent = await loadLandingContent();

        if (mounted && nextContent) {
          setContent((current) => mergeLandingContent(current, nextContent));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void syncLandingContent();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      setHasScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-[#f2f6fb] text-slate-950">
      <header
        className="relative min-h-screen overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(5, 14, 25, 0.30) 0%, rgba(5, 14, 25, 0.68) 100%), url(${content.hero.backgroundImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,165,255,0.28),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />

        <div
          className={cn(
            "fixed inset-x-0 top-0 z-50 transition-all duration-300",
            hasScrolled ? "px-3 py-3 md:px-6" : "px-3 py-5 md:px-6",
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-full max-w-[1380px] items-center justify-between rounded-full border border-white/10 px-4 py-3 md:px-6",
              hasScrolled
                ? "bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl"
                : "bg-white/10 backdrop-blur-md",
            )}
          >
            <a href="#" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b6bff,#59b4ff)] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(11,107,255,0.35)]">
                {content.navbar.logoLabel}
              </div>
              <div>
                <div className={cn("font-display text-sm font-semibold md:text-base", hasScrolled ? "text-slate-950" : "text-white")}>
                  {content.siteSettings.brandName}
                </div>
                <div className={cn("text-[11px] uppercase tracking-[0.26em]", hasScrolled ? "text-slate-500" : "text-white/64")}>
                  {content.siteSettings.brandTagline}
                </div>
              </div>
            </a>

            <nav className="hidden items-center gap-7 lg:flex">
              {content.navbar.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    hasScrolled ? "text-slate-700 hover:text-slate-950" : "text-white/80 hover:text-white",
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "hidden items-center gap-2 rounded-full px-3 py-2 text-xs md:flex",
                  hasScrolled ? "bg-slate-100 text-slate-600" : "bg-white/10 text-white/72",
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", isLoading ? "bg-amber-400" : "bg-emerald-400")} />
                {isLoading ? "Icerik guncelleniyor" : "Canli vitrinde"}
              </div>
              <Button asChild size="lg" className="h-11 px-5 text-sm md:px-6">
                <a href={content.navbar.ctaHref}>{content.navbar.ctaLabel}</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1380px] flex-col justify-center px-6 pb-20 pt-32 md:px-10 lg:px-12">
          <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
            <Badge
              variant="neutral"
              className="border-white/20 bg-white/10 px-4 py-2 text-[11px] tracking-[0.28em] text-white backdrop-blur-md"
            >
              {content.hero.badge}
            </Badge>

            <h1 className="mt-8 max-w-[13ch] font-display text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-6xl md:text-7xl lg:text-[6.3rem]">
              {content.hero.title}
              <span className="block bg-[linear-gradient(135deg,#a8d9ff_0%,#2f9fff_45%,#0a63f0_100%)] bg-clip-text text-transparent">
                {content.hero.highlight}
              </span>
              bulusuyor
            </h1>

            <p className="mt-8 max-w-[760px] text-base leading-8 text-white/76 md:text-lg">
              {content.hero.description}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-13 px-7 text-base">
                <a href={content.hero.primaryCtaHref}>
                  {content.hero.primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 border-white/24 bg-white/10 px-7 text-base text-white backdrop-blur-md hover:bg-white/16"
              >
                <a href={content.hero.secondaryCtaHref}>
                  <Play className="h-4 w-4" />
                  {content.hero.secondaryCtaLabel}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative -mt-16 pb-24">
        <section className="mx-auto w-full max-w-[1380px] px-6 md:px-10 lg:px-12">
          <div className="grid gap-4 md:grid-cols-3">
            {content.stats.map((stat) => {
              const Icon = iconMap[stat.icon];

              return (
                <Card
                  key={stat.label}
                  className="rounded-[2rem] border border-white/75 bg-white/88 p-7 backdrop-blur-sm shadow-[0_30px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-4xl font-semibold tracking-[-0.06em] text-slate-950">
                        {stat.value}
                      </div>
                      <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                        {stat.label}
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f3ff] text-[#1263eb]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-5 max-w-[28ch] text-sm leading-7 text-slate-600">{stat.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="branslar" className="mx-auto w-full max-w-[1380px] px-6 pt-24 md:px-10 lg:px-12">
          <div className="mx-auto max-w-[760px] text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0b6bff]">
              {content.programs.eyebrow}
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-5xl">
              {content.programs.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">{content.programs.description}</p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            {content.programs.items.map((program) => {
              const layoutClass =
                program.layout === "wide"
                  ? "lg:col-span-8 lg:min-h-[430px]"
                  : program.layout === "tall"
                    ? "lg:col-span-4 lg:min-h-[430px]"
                    : "lg:col-span-12 lg:min-h-[360px]";

              return (
                <a
                  key={program.title}
                  href={program.href}
                  className={cn(
                    "group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 shadow-[0_30px_70px_rgba(15,23,42,0.18)]",
                    layoutClass,
                  )}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${program.image})` }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,26,0.05)_0%,rgba(8,15,26,0.82)_75%,rgba(8,15,26,0.96)_100%)]" />
                  <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
                    <div className="max-w-xl">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-white/70">
                        Premium program
                      </div>
                      <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                        {program.title}
                      </h3>
                      <p className="mt-3 max-w-[44ch] text-sm leading-7 text-white/74 md:text-base">
                        {program.description}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9fd4ff]">
                        {program.ctaLabel}
                        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section
          id="neden-biz"
          className="mx-auto grid w-full max-w-[1380px] gap-10 px-6 pt-24 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)] lg:px-12"
        >
          <div className="rounded-[2.3rem] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] p-7 shadow-[0_30px_70px_rgba(15,23,42,0.08)] md:p-10">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0b6bff]">
              {content.whyUs.eyebrow}
            </div>
            <h2 className="mt-4 max-w-[14ch] font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-5xl">
              {content.whyUs.title}
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-8 text-slate-600">
              {content.whyUs.description}
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {content.whyUs.features.map((feature) => {
                const Icon = iconMap[feature.icon];

                return (
                  <div
                    key={feature.title}
                    className="rounded-[1.7rem] border border-white/80 bg-white/88 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf3ff] text-[#1263eb]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div id="tesisler" className="relative overflow-hidden rounded-[2.3rem] shadow-[0_30px_70px_rgba(15,23,42,0.14)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${content.whyUs.image})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,26,0.12)_0%,rgba(8,15,26,0.82)_100%)]" />
            <div className="relative flex h-full min-h-[500px] flex-col justify-between p-7 md:p-9">
              <div className="flex items-center justify-between">
                <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72 backdrop-blur-md">
                  Tesis atmosferi
                </div>
                <div className="rounded-full bg-white/12 px-4 py-2 text-sm text-white/80 backdrop-blur-md">
                  Premium buz deneyimi
                </div>
              </div>
              <div className="max-w-sm">
                <h3 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">
                  Disiplini soguk degil, ilham veren bir ortamla birlestiriyoruz.
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/74">
                  Pistten kuvvet alanina kadar tum yuzeyler sporcu ve aile akisina gore sakin, temiz ve modern bir ritimle kurgulanir.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1380px] px-6 pt-24 md:px-10 lg:px-12">
          <div className="mx-auto max-w-[820px] text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0b6bff]">
              {content.testimonials.eyebrow}
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-5xl">
              {content.testimonials.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">{content.testimonials.description}</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.testimonials.items.map((item) => (
              <Card key={item.name} className="rounded-[2rem] p-7">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-[#0b6bff]">
                    {Array.from({ length: item.rating }).map((_, index) => (
                      <Star key={`${item.name}-${index}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-slate-300" />
                </div>
                <p className="mt-6 text-base leading-8 text-slate-700">“{item.quote}”</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b6bff,#82c7ff)] text-sm font-semibold text-white">
                    {item.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-950">{item.name}</div>
                    <div className="text-sm text-slate-500">{item.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="haberler" className="mx-auto w-full max-w-[1380px] px-6 pt-24 md:px-10 lg:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[720px]">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0b6bff]">
                {content.news.eyebrow}
              </div>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-5xl">
                {content.news.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">{content.news.description}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <Newspaper className="h-4 w-4 text-[#0b6bff]" />
              Yeni icerikler admin panelden guncellenmeye hazir
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.news.items.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
              >
                <div className="aspect-[16/11] overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                </div>
                <div className="p-6">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-[#0b6bff]">{item.category}</div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                    Haberi incele
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="kayit" className="mx-auto w-full max-w-[1380px] px-6 pt-24 md:px-10 lg:px-12">
          <div className="overflow-hidden rounded-[2.6rem] bg-[linear-gradient(135deg,#07101c_0%,#0d1830_45%,#102442_100%)] px-7 py-8 shadow-[0_34px_80px_rgba(7,16,28,0.30)] md:px-10 md:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
            <div className="max-w-[620px]">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#79c2ff]">
                {content.cta.eyebrow}
              </div>
              <h2 className="mt-4 max-w-[12ch] font-display text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                {content.cta.title}
              </h2>
              <p className="mt-5 max-w-[56ch] text-base leading-8 text-white/72">
                {content.cta.description}
              </p>

              <div className="mt-10 hidden items-center gap-4 text-sm text-white/70 lg:flex">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#79c2ff]" />
                  Ayni gun geri donus
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#79c2ff]" />
                  Kisisel veri guvencesi
                </div>
              </div>
            </div>

            <Card className="mt-10 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-none backdrop-blur-xl lg:mt-0">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-white" htmlFor="fullName">
                    {content.cta.fullNameLabel}
                  </label>
                  <Input
                    id="fullName"
                    placeholder={content.cta.fullNamePlaceholder}
                    className="border-white/10 bg-white/90"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-white" htmlFor="email">
                    {content.cta.emailLabel}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={content.cta.emailPlaceholder}
                    className="border-white/10 bg-white/90"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-white" htmlFor="phone">
                    {content.cta.phoneLabel}
                  </label>
                  <Input
                    id="phone"
                    placeholder={content.cta.phonePlaceholder}
                    className="border-white/10 bg-white/90"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-white" htmlFor="branch">
                    {content.cta.branchLabel}
                  </label>
                  <Input
                    id="branch"
                    placeholder={content.cta.branchPlaceholder}
                    className="border-white/10 bg-white/90"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-white" htmlFor="note">
                    {content.cta.noteLabel}
                  </label>
                  <Textarea
                    id="note"
                    placeholder={content.cta.notePlaceholder}
                    className="min-h-28 border-white/10 bg-white/90"
                  />
                </div>
                <Button size="lg" className="mt-2 h-12 text-base">
                  {content.cta.submitLabel}
                </Button>
                <p className="text-xs leading-6 text-white/60">{content.cta.footnote}</p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-[#07101c]">
        <div className="mx-auto grid w-full max-w-[1380px] gap-12 px-6 py-14 md:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b6bff,#59b4ff)] text-sm font-semibold text-white">
                {content.navbar.logoLabel}
              </div>
              <div>
                <div className="font-display text-lg font-semibold text-white">{content.siteSettings.brandName}</div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/48">
                  {content.siteSettings.brandTagline}
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-[46ch] text-sm leading-7 text-white/66">{content.footer.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/56">
              <span>{content.siteSettings.contactPhone}</span>
              <span>{content.siteSettings.contactEmail}</span>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-4">
            {content.footer.groups.map((group) => (
              <div key={group.title}>
                <div className="text-sm font-semibold text-white">{group.title}</div>
                <div className="mt-4 grid gap-3">
                  {group.links.map((link) => (
                    <a key={link.label} href={link.href} className="text-sm text-white/62 transition-colors hover:text-white">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <div className="text-sm font-semibold text-white">Sosyal</div>
              <div className="mt-4 flex gap-3">
                {content.footer.socials.map((social) => {
                  const Icon = iconMap[social.icon];

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/72 transition hover:bg-white hover:text-slate-950"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/8">
          <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-4 px-6 py-5 text-xs text-white/42 md:px-10 lg:px-12">
            <span>{content.siteSettings.copyright}</span>
            <Link href="/login" className="inline-flex items-center gap-2 text-white/56 transition hover:text-white">
              Kurumsal giris
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
