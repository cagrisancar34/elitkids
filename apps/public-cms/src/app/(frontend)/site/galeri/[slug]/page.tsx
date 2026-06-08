import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCMSGallery } from "@/lib/cmsContent";
import { canPreview } from "@/lib/preview";

type Args = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

function imageUrl(image: unknown, external?: null | string) {
  if (typeof image === "object" && image && "url" in image && typeof image.url === "string") return image.url;
  return external || undefined;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const gallery = await getCMSGallery((await params).slug);
  if (!gallery) return {};
  const cover = imageUrl(gallery.cover, gallery.externalCover);
  return {
    description: gallery.seo?.description || gallery.summary || undefined,
    openGraph: { images: cover ? [{ url: cover }] : undefined, title: gallery.seo?.title || gallery.title },
    title: gallery.seo?.title || gallery.title,
  };
}

export default async function GalleryPage({ params, searchParams }: Args) {
  const gallery = await getCMSGallery((await params).slug, await canPreview(searchParams));
  if (!gallery) notFound();
  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Header />
      <main>
        <header className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-[#c96632]">Galeri</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-semibold leading-[1.06] md:text-7xl">{gallery.title}</h1>
          {gallery.summary ? <p className="mt-5 max-w-3xl text-xl leading-8 text-stone-600">{gallery.summary}</p> : null}
        </header>
        <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          {gallery.images.map((item) => {
            const image = imageUrl(item.image, item.externalImage);
            return image ? <figure key={item.id || item.alt}><div className="relative aspect-[4/3] overflow-hidden rounded-md"><Image src={image} alt={item.alt} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" /></div>{item.caption ? <figcaption className="mt-2 text-sm text-stone-500">{item.caption}</figcaption> : null}</figure> : null;
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}
