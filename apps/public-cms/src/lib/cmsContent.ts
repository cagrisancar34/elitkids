import "server-only";

import type {
  Gallery as CMSGallery,
  Location as CMSLocation,
  Partner as CMSPartner,
  Program as CMSProgram,
  Testimonial as CMSTestimonial,
} from "@/payload-types";

import {
  locations as fallbackLocations,
  partners as fallbackPartners,
  programs as fallbackPrograms,
  testimonials as fallbackTestimonials,
  type Program,
  type Location,
  type ProgramStatus,
} from "./content";
import { getPublicCmsPayload } from "./payload-client";
import { getText, resolveMediaUrl, resolveRelationText } from "./payload-utils";

const fallbackProgramMap = new Map(fallbackPrograms.map((program) => [program.slug, program]));
const fallbackLocationMap = new Map(fallbackLocations.map((location) => [location.slug, location]));
const fallbackTestimonialMap = new Map(fallbackTestimonials.map((testimonial) => [testimonial.title, testimonial]));
const defaultProgramImage =
  fallbackPrograms[0]?.image ||
  fallbackLocations[0]?.image ||
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85";
const defaultLocationImage =
  fallbackLocations[0]?.image ||
  defaultProgramImage;

type ManagedTestimonial = {
  body: string;
  childInfo: string;
  id: string;
  parentName: string;
  programName: string;
  title: string;
};

type ManagedPartner = {
  id: string;
  title: string;
};

function getFallbackGallery(): CMSGallery {
  return {
    id: -1,
    cover: null,
    externalCover: fallbackLocations[0]?.image ?? "",
    createdAt: "2026-01-01T00:00:00.000Z",
    images: fallbackLocations.map((location) => ({
      alt: location.title,
      caption: location.summary,
      externalImage: location.image,
      id: location.slug,
      image: null,
    })),
    _status: "published" as const,
    slug: "dogada-anlar",
    seo: {
      description: "Dört Mevsim Doğada programlarından seçilmiş anlar.",
      title: "Doğada Anlar",
    },
    summary: "Programlardan, rotalardan ve birlikte geçirilen anlardan seçkiler.",
    title: "Doğada Anlar",
    updatedAt: "2026-01-01T00:00:00.000Z",
    workflowStatus: "draft" as const,
  };
}

function mapProgram(doc: CMSProgram): Program {
  const fallback = fallbackProgramMap.get(doc.slug);
  const category = resolveRelationText(doc.category, ["slug", "title"], fallback?.category ?? "");
  const categoryLabel = resolveRelationText(doc.category, ["title", "slug"], fallback?.categoryLabel ?? "");
  const location = resolveRelationText(doc.location, ["title"], fallback?.location ?? "");
  const locationSlug = resolveRelationText(doc.location, ["slug"], fallback?.locationSlug ?? "");

  return {
    audience: getText(doc.audience, fallback?.audience ?? ""),
    category,
    categoryLabel,
    dates:
      doc.dates?.length && Array.isArray(doc.dates)
        ? doc.dates.map((date) => ({
            capacityStatus:
              date.capacityStatus === "limited" || date.capacityStatus === "full"
                ? date.capacityStatus
                : "available",
            label: getText(date.label, ""),
          }))
        : fallback?.dates ?? [],
    details:
      doc.details?.length && Array.isArray(doc.details)
        ? doc.details.map((detail) => ({
            body: getText(detail.body, ""),
            heading: getText(detail.heading, ""),
          }))
        : fallback?.details ?? [],
    excluded:
      doc.excluded?.length && Array.isArray(doc.excluded)
        ? doc.excluded.map((item) => getText(item.item, "")).filter(Boolean)
        : fallback?.excluded ?? [],
    featured: Boolean(doc.featured),
    faq:
      doc.faq?.length && Array.isArray(doc.faq)
        ? doc.faq.map((item) => ({
            answer: getText(item.answer, ""),
            question: getText(item.question, ""),
          }))
        : fallback?.faq ?? [],
    highlights:
      doc.included?.length && Array.isArray(doc.included)
        ? doc.included.map((item) => getText(item.item, "")).filter(Boolean)
        : fallback?.highlights ?? [],
    image: resolveMediaUrl(doc.cover, doc.externalCover, fallback?.image ?? defaultProgramImage),
    included:
      doc.included?.length && Array.isArray(doc.included)
        ? doc.included.map((item) => getText(item.item, "")).filter(Boolean)
        : fallback?.included ?? [],
    location,
    locationSlug,
    priceLabel: getText(doc.price?.label, fallback?.priceLabel ?? "Bilgi almak için iletişime geçin"),
    region: doc.region === "international" ? "international" : "domestic",
    season: getText(doc.season, fallback?.season ?? ""),
    slug: doc.slug,
    status:
      doc.availabilityStatus === "open" || doc.availabilityStatus === "soon" || doc.availabilityStatus === "full"
        ? doc.availabilityStatus
        : (fallback?.status ?? ("soon" as ProgramStatus)),
    summary: getText(doc.summary, fallback?.summary ?? ""),
    title: getText(doc.title, fallback?.title ?? "Başlıksız program"),
  };
}

function mapLocation(doc: CMSLocation): Location {
  const fallback = fallbackLocationMap.get(doc.slug);
  return {
    city: getText(doc.city, fallback?.city ?? ""),
    country: getText(doc.country, fallback?.country ?? "Türkiye"),
    image: resolveMediaUrl(doc.cover, doc.externalCover, fallback?.image ?? defaultLocationImage),
    slug: doc.slug,
    summary: getText(doc.summary, fallback?.summary ?? ""),
    title: getText(doc.title, fallback?.title ?? "Başlıksız lokasyon"),
  };
}

function mapTestimonial(doc: CMSTestimonial): ManagedTestimonial {
  const fallback = fallbackTestimonialMap.get(doc.title);
  return {
    body: getText(doc.body, fallback?.body ?? ""),
    childInfo: getText(doc.childInfo, fallback?.childInfo ?? ""),
    id: String(doc.id),
    parentName: getText(doc.parentName, fallback?.parentName ?? ""),
    programName: getText(doc.programName, fallback?.programName ?? ""),
    title: getText(doc.title, fallback?.title ?? "Başlıksız yorum"),
  };
}

function mapPartner(doc: CMSPartner): ManagedPartner {
  return {
    id: String(doc.id),
    title: getText(doc.title, "Başlıksız partner"),
  };
}

function mapGallery(doc: CMSGallery): CMSGallery {
  return doc;
}

async function fetchPrograms(draft = false) {
  const payload = await getPublicCmsPayload();
  const result = await payload.find({
    collection: "programs",
    depth: 1,
    limit: 250,
    ...(draft
      ? { draft: true as const }
      : {
          draft: false as const,
        }),
    sort: "createdAt",
  });

  return result.docs as CMSProgram[];
}

async function fetchLocations() {
  const payload = await getPublicCmsPayload();
  const result = await payload.find({
    collection: "locations",
    depth: 1,
    limit: 250,
    sort: "createdAt",
  });

  return result.docs as CMSLocation[];
}

async function fetchTestimonials() {
  const payload = await getPublicCmsPayload();
  const result = await payload.find({
    collection: "testimonials",
    depth: 1,
    limit: 250,
    sort: "createdAt",
  });

  return result.docs as CMSTestimonial[];
}

async function fetchPartners() {
  const payload = await getPublicCmsPayload();
  const result = await payload.find({
    collection: "partners",
    depth: 1,
    limit: 250,
    sort: "order",
  });

  return result.docs as CMSPartner[];
}

async function fetchGalleries(draft = false) {
  const payload = await getPublicCmsPayload();
  const result = await payload.find({
    collection: "galleries",
    depth: 1,
    limit: 250,
    ...(draft
      ? { draft: true as const }
      : {
          draft: false as const,
        }),
    sort: "createdAt",
  });

  return result.docs as CMSGallery[];
}

export async function getCMSPrograms(draft = false): Promise<Program[]> {
  try {
    const docs = await fetchPrograms(draft);
    if (docs.length > 0) {
      return docs.map(mapProgram).sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }
        return a.title.localeCompare(b.title, "tr-TR");
      });
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackPrograms;
}

export async function getCMSProgramBySlug(
  slug: string,
  draft = false,
): Promise<Program | undefined> {
  try {
    const payload = await getPublicCmsPayload();
    const result = await payload.find({
      collection: "programs",
      depth: 1,
      limit: 1,
      ...(draft
        ? { draft: true as const }
        : {
            draft: false as const,
          }),
      where: {
        slug: {
          equals: slug,
        },
      },
    });

    const doc = result.docs[0];
    if (doc) {
      return mapProgram(doc as CMSProgram);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackPrograms.find((program) => program.slug === slug);
}

export async function getCMSLocations(): Promise<Location[]> {
  try {
    const docs = await fetchLocations();
    if (docs.length > 0) {
      return docs.map(mapLocation);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackLocations;
}

export async function getCMSTestimonials(): Promise<ManagedTestimonial[]> {
  try {
    const docs = await fetchTestimonials();
    if (docs.length > 0) {
      return [...docs]
        .sort((a, b) => {
          const featuredA = Boolean(a.isFeatured) ? 1 : 0;
          const featuredB = Boolean(b.isFeatured) ? 1 : 0;
          if (featuredA !== featuredB) {
            return featuredB - featuredA;
          }
          return a.title.localeCompare(b.title, "tr-TR");
        })
        .map(mapTestimonial);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackTestimonials.map((testimonial, index) => ({
    ...testimonial,
    id: `fallback-${index}`,
  }));
}

export async function getCMSPartners(): Promise<ManagedPartner[]> {
  try {
    const docs = await fetchPartners();
    if (docs.length > 0) {
      return docs
        .filter((doc) => doc.isActive !== false)
        .map(mapPartner);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return fallbackPartners.map((title, index) => ({ id: `fallback-${index}`, title }));
}

export async function getCMSGallery(
  slug: string,
  draft = false,
): Promise<CMSGallery | undefined> {
  try {
    const payload = await getPublicCmsPayload();
    const result = await payload.find({
      collection: "galleries",
      depth: 1,
      limit: 1,
      ...(draft
        ? { draft: true as const }
        : {
            draft: false as const,
          }),
      where: {
        slug: {
          equals: slug,
        },
      },
    });

    const doc = result.docs[0];
    if (doc) {
      return mapGallery(doc as CMSGallery);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  if (slug !== "dogada-anlar") {
    return undefined;
  }

  return getFallbackGallery();
}

export async function getCMSGallerySlugs() {
  try {
    const docs = await fetchGalleries(false);
    if (docs.length > 0) {
      return docs.map((gallery) => gallery.slug);
    }
  } catch {
    // Fall back to the seeded demo content below.
  }

  return ["dogada-anlar"];
}
