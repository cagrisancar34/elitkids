import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SimpleRichText } from "@/components/SimpleRichText";
import { getNewsArticleBySlug } from "@/lib/headlines";
import { toPublicSitePath } from "@/lib/routes";
import { canPreview } from "@/lib/preview";

type Args = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    description: article.summary,
    openGraph: {
      description: article.summary,
      images: [{ url: article.image }],
      title: article.title,
      type: "article",
    },
    title: article.title,
  };
}

export default async function NewsDetailPage({ params, searchParams }: Args) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug, await canPreview(searchParams));

  if (!article) {
    notFound();
  }

  const publishedAt = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(article.publishedAt));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    datePublished: article.publishedAt,
    description: article.summary,
    headline: article.title,
    image: [article.image],
    publisher: {
      "@type": "Organization",
      name: "Dört Mevsim Doğada",
    },
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Header />
      <main>
        <article>
          <header className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#285d49] transition hover:text-[#173d33]"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Ana manşete dön
            </Link>
            <div className="mt-9 max-w-5xl">
              <p className="text-sm font-semibold uppercase text-[#c96632]">{article.kicker}</p>
              <h1 className="mt-4 text-balance text-5xl font-semibold leading-[1.06] text-stone-950 md:text-7xl">
                {article.title}
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-stone-600">{article.summary}</p>
              <p className="mt-6 flex items-center gap-2 text-sm font-medium text-stone-500">
                <CalendarDays size={17} aria-hidden="true" />
                {publishedAt}
              </p>
            </div>
          </header>

          <div className="relative mx-auto aspect-[16/9] max-w-[1500px] overflow-hidden bg-stone-200 md:aspect-[2/1]">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              sizes="(min-width: 1500px) 1500px, 100vw"
              className="object-cover"
            />
          </div>

          <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <SimpleRichText data={article.content} className="news-rich-text" />

            {article.ctaHref ? (
              <div className="mt-12 border-y border-stone-200 py-8">
                <p className="text-sm font-semibold uppercase text-[#c96632]">İlgili bağlantı</p>
                <Link
                  href={toPublicSitePath(article.ctaHref)}
                  className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#214d3f] px-5 text-sm font-semibold text-white transition hover:bg-[#173d33]"
                >
                  {article.ctaLabel}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            ) : null}
          </section>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Footer />
    </div>
  );
}
