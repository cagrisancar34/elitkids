export type HomeHero = {
  backgroundAlt: string;
  backgroundImage: string;
  description: string;
  eyebrow: string;
  overlayStrength: "dark" | "light" | "medium";
  primaryButton?: {
    label: string;
    url: string;
  };
  secondaryButton?: {
    label: string;
    url: string;
  };
  title: string;
};

const fallbackHero: HomeHero = {
  backgroundAlt: "Doğada yürüyen aileler için sakin orman manzarası",
  backgroundImage:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=85",
  description:
    "Çocukların merakını, ailelerin güven ihtiyacını ve doğanın iyi gelen ritmini aynı programda buluşturan modern etkinlik platformu.",
  eyebrow: "Doğa, spor ve sanat odaklı aile programları",
  overlayStrength: "medium",
  primaryButton: {
    label: "Programları keşfet",
    url: "/site/programlar",
  },
  secondaryButton: {
    label: "Bilgi al",
    url: "/site/iletisim",
  },
  title: "Dört Mevsim Doğada",
};

export async function getHomeHero(): Promise<HomeHero> {
  return fallbackHero;
}
