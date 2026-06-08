import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProgramFilters } from "@/components/ProgramFilters";
import { SectionIntro } from "@/components/SectionIntro";
import { getCMSPrograms } from "@/lib/cmsContent";
import { canPreview } from "@/lib/preview";
import { getSitePageByPath } from "@/lib/sitePages";

export const metadata: Metadata = {
  title: "Programlar",
  description:
    "Seyahat, kamp, atölye ve yurt dışı programlarını kategori, lokasyon ve kontenjan durumuna göre keşfedin.",
};

export const dynamic = "force-dynamic";

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const preview = await canPreview(searchParams);
  const [programs, page] = await Promise.all([getCMSPrograms(preview), getSitePageByPath("/programlar", preview)]);
  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Header />
      <main>
        <section className="border-b border-stone-200 bg-[#e9f0eb]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionIntro
              eyebrow={page?.hero.eyebrow || "Program keşfi"}
              title={page?.hero.heading || "Ailenize uygun etkinliği bulun"}
              body={page?.hero.summary || "Kategori, rota, yaş grubu ve durum filtreleriyle doğru programa hızlıca ulaşın."}
            />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <ProgramFilters programs={programs} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
