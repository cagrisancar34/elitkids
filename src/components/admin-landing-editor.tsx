/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Eye,
  ImagePlus,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import {
  updateLandingContentAction,
  type LandingEditorActionState,
} from "@/app/(app)/admin/landing/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultLandingContent,
  type IconKey,
  type LandingContent,
} from "@/lib/landing-content";
import { cn } from "@/lib/utils";

const initialState: LandingEditorActionState = {
  error: null,
  success: null,
};

const iconOptions: Array<{ value: IconKey; label: string }> = [
  { value: "users", label: "Users" },
  { value: "waves", label: "Waves" },
  { value: "sparkles", label: "Sparkles" },
  { value: "shield", label: "Shield" },
  { value: "heart", label: "Heart" },
  { value: "medal", label: "Medal" },
  { value: "quote", label: "Quote" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "snowflake", label: "Snowflake" },
  { value: "dumbbell", label: "Dumbbell" },
];

function cloneLandingContent(content: LandingContent) {
  return JSON.parse(JSON.stringify(content)) as LandingContent;
}

function createEditorId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`;
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Henuz kayit yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type AdminLandingEditorProps = {
  initialContent: LandingContent;
  updatedAt: string | null;
  storageError: string | null;
  initialTab?: string;
};

export function AdminLandingEditor({
  initialContent,
  updatedAt,
  storageError,
  initialTab = "brand",
}: AdminLandingEditorProps) {
  const [state, formAction] = useActionState(updateLandingContentAction, initialState);
  const [content, setContent] = useState(() => cloneLandingContent(initialContent));
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setContent(cloneLandingContent(initialContent));
  }, [initialContent]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const serializedContent = useMemo(() => JSON.stringify(content), [content]);

  function updateRoot<K extends keyof LandingContent>(key: K, value: LandingContent[K]) {
    setContent((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateSiteSettings(
    field: keyof LandingContent["siteSettings"],
    value: string,
  ) {
    updateRoot("siteSettings", {
      ...content.siteSettings,
      [field]: value,
    });
  }

  function updateHero(field: keyof LandingContent["hero"], value: string) {
    updateRoot("hero", {
      ...content.hero,
      [field]: value,
    });
  }

  function updateNavbar(field: keyof LandingContent["navbar"], value: string) {
    updateRoot("navbar", {
      ...content.navbar,
      [field]: value,
    });
  }

  function updateHomepageMediaRail(
    field: keyof LandingContent["homepageMediaRail"],
    value: string,
  ) {
    updateRoot("homepageMediaRail", {
      ...content.homepageMediaRail,
      [field]: value,
    });
  }

  function updateNavbarLink(index: number, field: "label" | "href", value: string) {
    updateRoot("navbar", {
      ...content.navbar,
      links: content.navbar.links.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function updateStat(
    index: number,
    field: "value" | "label" | "description" | "icon",
    value: string,
  ) {
    updateRoot(
      "stats",
      content.stats.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "icon" ? (value as IconKey) : value,
            }
          : item,
      ),
    );
  }

  function updateMethodology(
    field: keyof LandingContent["methodology"],
    value: string,
  ) {
    updateRoot("methodology", {
      ...content.methodology,
      [field]: value,
    });
  }

  function updateMethodologyItem(
    index: number,
    field: "title" | "description" | "icon",
    value: string,
  ) {
    updateRoot("methodology", {
      ...content.methodology,
      items: content.methodology.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "icon" ? (value as IconKey) : value,
            }
          : item,
      ),
    });
  }

  function updatePrograms(field: keyof LandingContent["programs"], value: string) {
    updateRoot("programs", {
      ...content.programs,
      [field]: value,
    });
  }

  function updateProgramItem(
    index: number,
    field: "title" | "description" | "image" | "href" | "ctaLabel",
    value: string,
  ) {
    updateRoot("programs", {
      ...content.programs,
      items: content.programs.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function updateProgramBullet(index: number, bulletIndex: number, value: string) {
    updateRoot("programs", {
      ...content.programs,
      items: content.programs.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              bullets: item.bullets.map((bullet, currentBulletIndex) =>
                currentBulletIndex === bulletIndex ? value : bullet,
              ),
            }
          : item,
      ),
    });
  }

  function updateCoaches(field: keyof LandingContent["coaches"], value: string) {
    updateRoot("coaches", {
      ...content.coaches,
      [field]: value,
    });
  }

  function updateCoachItem(
    index: number,
    field: "name" | "specialty" | "bio" | "image",
    value: string,
  ) {
    updateRoot("coaches", {
      ...content.coaches,
      items: content.coaches.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function updateWhyUs(field: keyof LandingContent["whyUs"], value: string) {
    updateRoot("whyUs", {
      ...content.whyUs,
      [field]: value,
    });
  }

  function updateFaq(field: keyof LandingContent["faq"], value: string) {
    updateRoot("faq", {
      ...content.faq,
      [field]: value,
    });
  }

  function updateFaqItem(
    index: number,
    field: "question" | "answer",
    value: string,
  ) {
    updateRoot("faq", {
      ...content.faq,
      items: content.faq.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function updateGuide(field: keyof LandingContent["guide"], value: string) {
    updateRoot("guide", {
      ...content.guide,
      [field]: value,
    });
  }

  function updateGuideItem(index: number, field: "label" | "href", value: string) {
    updateRoot("guide", {
      ...content.guide,
      items: content.guide.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function updateWhyUsPoint(
    index: number,
    field: "title" | "description",
    value: string,
  ) {
    updateRoot("whyUs", {
      ...content.whyUs,
      points: content.whyUs.points.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function updateLocalProof(field: keyof LandingContent["localProof"], value: string) {
    updateRoot("localProof", {
      ...content.localProof,
      [field]: value,
    });
  }

  function updateLocalProofItem(
    index: number,
    field: "title" | "description" | "icon",
    value: string,
  ) {
    updateRoot("localProof", {
      ...content.localProof,
      items: content.localProof.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "icon" ? (value as IconKey) : value,
            }
          : item,
      ),
    });
  }

  function updateProcess(field: keyof LandingContent["process"], value: string) {
    updateRoot("process", {
      ...content.process,
      [field]: value,
    });
  }

  function updateProcessStep(index: number, field: "title" | "description", value: string) {
    updateRoot("process", {
      ...content.process,
      steps: content.process.steps.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function updateTestimonials(field: keyof LandingContent["testimonials"], value: string) {
    updateRoot("testimonials", {
      ...content.testimonials,
      [field]: value,
    });
  }

  function updateTestimonialItem(
    index: number,
    field:
      | "quote"
      | "parentDisplayName"
      | "context"
      | "branch"
      | "childAgeGroup"
      | "approved"
      | "featured",
    value: string | boolean,
  ) {
    updateRoot("testimonials", {
      ...content.testimonials,
      items: content.testimonials.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    });
  }

  function addTestimonialItem() {
    updateRoot("testimonials", {
      ...content.testimonials,
      items: [
        ...content.testimonials.items,
        {
          id: createEditorId("testimonial"),
          quote: "",
          parentDisplayName: "",
          context: "",
          branch: "Genel",
          childAgeGroup: "",
          approved: false,
          featured: false,
          sortOrder: content.testimonials.items.length + 1,
        },
      ],
    });
  }

  function removeTestimonialItem(index: number) {
    updateRoot("testimonials", {
      ...content.testimonials,
      items: content.testimonials.items
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sortOrder: itemIndex + 1 })),
    });
  }

  function moveTestimonialItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= content.testimonials.items.length) {
      return;
    }

    const nextItems = [...content.testimonials.items];
    const [current] = nextItems.splice(index, 1);
    nextItems.splice(nextIndex, 0, current);

    updateRoot("testimonials", {
      ...content.testimonials,
      items: nextItems.map((item, itemIndex) => ({ ...item, sortOrder: itemIndex + 1 })),
    });
  }

  function updateGalleryPage(field: keyof LandingContent["galleryPage"], value: string) {
    updateRoot("galleryPage", {
      ...content.galleryPage,
      [field]: value,
    });
  }

  function updateGalleryItem(
    index: number,
    field:
      | "title"
      | "description"
      | "image"
      | "category"
      | "featured"
      | "published",
    value: string | boolean,
  ) {
    updateRoot(
      "galleryItems",
      content.galleryItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addGalleryItem() {
    updateRoot("galleryItems", [
      ...content.galleryItems,
      {
        id: createEditorId("gallery"),
        image: "",
        title: "",
        description: "",
        category: "genel",
        featured: false,
        sortOrder: content.galleryItems.length + 1,
        published: false,
      },
    ]);
  }

  function removeGalleryItem(index: number) {
    updateRoot(
      "galleryItems",
      content.galleryItems
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, sortOrder: itemIndex + 1 })),
    );
  }

  function moveGalleryItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= content.galleryItems.length) {
      return;
    }

    const nextItems = [...content.galleryItems];
    const [current] = nextItems.splice(index, 1);
    nextItems.splice(nextIndex, 0, current);
    updateRoot(
      "galleryItems",
      nextItems.map((item, itemIndex) => ({ ...item, sortOrder: itemIndex + 1 })),
    );
  }

  function updateCta(field: keyof LandingContent["cta"], value: string) {
    updateRoot("cta", {
      ...content.cta,
      [field]: value,
    });
  }

  function updateCtaStatusOptions(value: string) {
    updateRoot("cta", {
      ...content.cta,
      statusOptions: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  function updateFooter(field: keyof LandingContent["footer"], value: string) {
    updateRoot("footer", {
      ...content.footer,
      [field]: value,
    });
  }

  function updateFooterGroup(index: number, title: string) {
    updateRoot("footer", {
      ...content.footer,
      groups: content.footer.groups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, title } : group,
      ),
    });
  }

  function updateFooterGroupLink(
    groupIndex: number,
    linkIndex: number,
    field: "label" | "href",
    value: string,
  ) {
    updateRoot("footer", {
      ...content.footer,
      groups: content.footer.groups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              links: group.links.map((link, currentLinkIndex) =>
                currentLinkIndex === linkIndex ? { ...link, [field]: value } : link,
              ),
            }
          : group,
      ),
    });
  }

  function updateFooterSocial(
    index: number,
    field: "label" | "href" | "icon",
    value: string,
  ) {
    updateRoot("footer", {
      ...content.footer,
      socials: content.footer.socials.map((social, socialIndex) =>
        socialIndex === index
          ? {
              ...social,
              [field]: field === "icon" ? (value as IconKey) : value,
            }
          : social,
      ),
    });
  }

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="content" value={serializedContent} readOnly />

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="bg-[linear-gradient(135deg,#091425_0%,#13223d_65%,#152844_100%)]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-300">
            Stitch referansli vitrin editoru
          </span>
          <h2 className="mt-4 font-display text-3xl font-black tracking-[-0.05em] text-white">
            Landing page artik admin tarafinda tam kontrollu.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Hero, 4G sistem alani, program kartlari, why-us split, form, footer, logo ve tum gorseller tek
            kaynaktan yonetilir. Public anasayfa bu content JSON&apos;unu okuyarak render edilir.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => setContent(cloneLandingContent(defaultLandingContent))}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Varsayilana don
            </Button>
            <Button asChild className="bg-sky-400 text-slate-950 hover:bg-sky-300">
              <Link href="/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Canli anasayfayi ac
              </Link>
            </Button>
          </div>
        </Panel>

        <Panel className="bg-[#0b162b]">
          <div className="grid gap-4 md:grid-cols-2">
            <StatTile label="Son kayit" value={formatUpdatedAt(updatedAt)} />
            <StatTile label="Kontrol edilen alan" value="14 ana section" />
          </div>
          <div className="mt-5 rounded-[1.4rem] border border-sky-400/18 bg-sky-400/8 px-4 py-4">
            <div className="text-sm font-semibold text-sky-200">Yazma yetkisi sadece admin</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Manager, koc ve veli rolleri landing content uzerinde duzenleme yapamaz.
            </p>
          </div>
          {storageError ? <p className="mt-4 text-sm text-rose-300">{storageError}</p> : null}
          {state.error ? <p className="mt-4 text-sm text-rose-300">{state.error}</p> : null}
          {state.success ? <p className="mt-4 text-sm text-emerald-300">{state.success}</p> : null}
          <div className="mt-6">
            <FormSubmitButton
              className="w-full rounded-2xl bg-sky-400 text-slate-950 hover:bg-sky-300"
              pendingLabel="Landing kaydediliyor..."
            >
              Landing page kaydini yap
            </FormSubmitButton>
          </div>
        </Panel>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="grid gap-5">
        <TabsList className="w-full justify-start bg-[#0d182d]">
          <TabsTrigger value="brand">Marka</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="gallery">Galeri</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="system">4G Sistem</TabsTrigger>
          <TabsTrigger value="programs">Programlar</TabsTrigger>
          <TabsTrigger value="coaches">Egitmenler</TabsTrigger>
          <TabsTrigger value="why-us">Why Us</TabsTrigger>
          <TabsTrigger value="local-proof">Lokal Kanit</TabsTrigger>
          <TabsTrigger value="process">Surec</TabsTrigger>
          <TabsTrigger value="testimonials">Yorumlar</TabsTrigger>
          <TabsTrigger value="faq">SSS</TabsTrigger>
          <TabsTrigger value="guide">Rehber</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="brand">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Marka ve navbar"
                description="Logo, marka metinleri, header akis ve sag ust iletisim/CTA alanlari bu section icinde."
              />
              <FieldGrid className="md:grid-cols-1 lg:grid-cols-2">
                <TextField
                  label="Marka adi"
                  value={content.siteSettings.brandName}
                  onChange={(value) => updateSiteSettings("brandName", value)}
                />
                <TextField
                  label="Brand tagline"
                  value={content.siteSettings.brandTagline}
                  onChange={(value) => updateSiteSettings("brandTagline", value)}
                />
                <TextField
                  label="Logo etiketi"
                  value={content.siteSettings.logoLabel}
                  onChange={(value) => updateSiteSettings("logoLabel", value)}
                />
                <AssetField
                  label="Logo gorseli"
                  value={content.siteSettings.logoImage}
                  onChange={(value) => updateSiteSettings("logoImage", value)}
                  uploadKey="brand-logo"
                  className="lg:col-span-2"
                />
                <TextField
                  label="Telefon"
                  value={content.siteSettings.contactPhone}
                  onChange={(value) => updateSiteSettings("contactPhone", value)}
                />
                <TextField
                  label="WhatsApp numarasi"
                  value={content.siteSettings.whatsappPhone}
                  onChange={(value) => updateSiteSettings("whatsappPhone", value)}
                />
                <TextField
                  label="E-posta"
                  value={content.siteSettings.contactEmail}
                  onChange={(value) => updateSiteSettings("contactEmail", value)}
                />
                <TextField
                  label="Lokasyon"
                  value={content.siteSettings.location}
                  onChange={(value) => updateSiteSettings("location", value)}
                  className="lg:col-span-2"
                />
                <TextField
                  label="Navbar CTA"
                  value={content.navbar.ctaLabel}
                  onChange={(value) => updateNavbar("ctaLabel", value)}
                />
                <TextField
                  label="Status etiketi"
                  value={content.navbar.statusLabel}
                  onChange={(value) => updateNavbar("statusLabel", value)}
                />
                <TextField
                  label="Navbar CTA href"
                  value={content.navbar.ctaHref}
                  onChange={(value) => updateNavbar("ctaHref", value)}
                  className="lg:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Menu baglantilari"
                description="Header icindeki navigation akisini bu bloktan guncelle."
              />
              <div className="mt-5 grid gap-4">
                {content.navbar.links.map((item, index) => (
                  <SubPanel
                    key={`${item.label}-${index}`}
                    title={`Menu linki ${index + 1}`}
                    description="Landing header navigation item."
                  >
                    <FieldGrid>
                      <TextField
                        label="Etiket"
                        value={item.label}
                        onChange={(value) => updateNavbarLink(index, "label", value)}
                      />
                      <TextField
                        label="Href"
                        value={item.href}
                        onChange={(value) => updateNavbarLink(index, "href", value)}
                      />
                    </FieldGrid>
                  </SubPanel>
                ))}
              </div>
            </Panel>
          </SectionGrid>
        </TabsContent>

        <TabsContent value="hero">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Hero composition"
                description="Ana baslik, mavi vurgu, CTA butonlari ve iki editorial gorsel."
              />
              <FieldGrid>
                <TextField
                  label="Hero badge"
                  value={content.hero.eyebrow}
                  onChange={(value) => updateHero("eyebrow", value)}
                />
                <TextAreaField
                  label="Baslik"
                  value={content.hero.title}
                  onChange={(value) => updateHero("title", value)}
                />
                <TextAreaField
                  label="Vurgulu metin"
                  value={content.hero.highlight}
                  onChange={(value) => updateHero("highlight", value)}
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.hero.description}
                  onChange={(value) => updateHero("description", value)}
                  className="md:col-span-2"
                />
                <TextField
                  label="Primary CTA"
                  value={content.hero.primaryCtaLabel}
                  onChange={(value) => updateHero("primaryCtaLabel", value)}
                />
                <TextField
                  label="Primary href"
                  value={content.hero.primaryCtaHref}
                  onChange={(value) => updateHero("primaryCtaHref", value)}
                />
                <TextField
                  label="Secondary CTA"
                  value={content.hero.secondaryCtaLabel}
                  onChange={(value) => updateHero("secondaryCtaLabel", value)}
                />
                <TextField
                  label="Secondary href"
                  value={content.hero.secondaryCtaHref}
                  onChange={(value) => updateHero("secondaryCtaHref", value)}
                />
                <AssetField
                  label="Hero gorseli 1"
                  value={content.hero.visualPrimaryImage}
                  onChange={(value) => updateHero("visualPrimaryImage", value)}
                  uploadKey="hero-primary"
                />
                <AssetField
                  label="Hero gorseli 2"
                  value={content.hero.visualSecondaryImage}
                  onChange={(value) => updateHero("visualSecondaryImage", value)}
                  uploadKey="hero-secondary"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Homepage medya bandi"
                description="Hero altinda 4G sisteminden once gorunen yatay galeri bandinin copy ve link alani."
              />
              <FieldGrid>
                <TextField
                  label="Eyebrow"
                  value={content.homepageMediaRail.eyebrow}
                  onChange={(value) => updateHomepageMediaRail("eyebrow", value)}
                />
                <TextField
                  label="Baslik"
                  value={content.homepageMediaRail.title}
                  onChange={(value) => updateHomepageMediaRail("title", value)}
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.homepageMediaRail.description}
                  onChange={(value) => updateHomepageMediaRail("description", value)}
                  className="md:col-span-2"
                />
                <TextField
                  label="CTA etiketi"
                  value={content.homepageMediaRail.ctaLabel}
                  onChange={(value) => updateHomepageMediaRail("ctaLabel", value)}
                />
                <TextField
                  label="CTA href"
                  value={content.homepageMediaRail.ctaHref}
                  onChange={(value) => updateHomepageMediaRail("ctaHref", value)}
                />
              </FieldGrid>
            </Panel>
          </SectionGrid>
        </TabsContent>

        <TabsContent value="gallery">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Galeri sayfasi"
                description="Public /galeri sayfasinin intro copy alani ve homepage medya bandinin kaynagi."
              />
              <FieldGrid>
                <TextField
                  label="Eyebrow"
                  value={content.galleryPage.eyebrow}
                  onChange={(value) => updateGalleryPage("eyebrow", value)}
                />
                <TextField
                  label="Baslik"
                  value={content.galleryPage.title}
                  onChange={(value) => updateGalleryPage("title", value)}
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.galleryPage.description}
                  onChange={(value) => updateGalleryPage("description", value)}
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Galeri yonetimi"
                description="Kategori, yayin durumu, one cikarma ve siralama aksiyonlariyla tesis ve branş gorsellerini yonetin."
              />
              <div className="mt-5 flex justify-end">
                <Button type="button" onClick={addGalleryItem} className="bg-sky-400 text-slate-950 hover:bg-sky-300">
                  <Plus className="h-4 w-4" />
                  Gorsel ekle
                </Button>
              </div>
              <div className="mt-5 grid gap-4">
                {content.galleryItems.map((item, index) => (
                  <SubPanel
                    key={item.id}
                    title={item.title.trim() || `Galeri gorseli ${index + 1}`}
                    description="Homepage featured bandinda yalniz featured+yayinda gorseller gorunur."
                    actions={
                      <ItemToolbar
                        onMoveUp={index === 0 ? undefined : () => moveGalleryItem(index, -1)}
                        onMoveDown={
                          index === content.galleryItems.length - 1
                            ? undefined
                            : () => moveGalleryItem(index, 1)
                        }
                        onRemove={() => removeGalleryItem(index)}
                      />
                    }
                  >
                    <FieldGrid>
                      <TextField
                        label="Baslik"
                        value={item.title}
                        onChange={(value) => updateGalleryItem(index, "title", value)}
                      />
                      <SelectField
                        label="Kategori"
                        value={item.category}
                        onChange={(value) => updateGalleryItem(index, "category", value)}
                        options={[
                          { value: "tesis", label: "Tesis" },
                          { value: "yuzme", label: "Yuzme" },
                          { value: "cimnastik", label: "Cimnastik" },
                          { value: "tenis", label: "Tenis" },
                          { value: "genel", label: "Genel" },
                        ]}
                      />
                      <TextAreaField
                        label="Aciklama"
                        value={item.description}
                        onChange={(value) => updateGalleryItem(index, "description", value)}
                        className="md:col-span-2"
                      />
                      <AssetField
                        label="Gorsel"
                        value={item.image}
                        onChange={(value) => updateGalleryItem(index, "image", value)}
                        uploadKey={`gallery-${item.id}`}
                        className="md:col-span-2"
                      />
                    </FieldGrid>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <ToggleTile
                        active={item.featured}
                        label="One cikar"
                        description="Homepage medya bandinda goster."
                        onToggle={() => updateGalleryItem(index, "featured", !item.featured)}
                      />
                      <ToggleTile
                        active={item.published}
                        label="Yayinda"
                        description="/galeri sayfasinda yayina ac."
                        onToggle={() => updateGalleryItem(index, "published", !item.published)}
                      />
                    </div>
                  </SubPanel>
                ))}
              </div>
            </Panel>
          </SectionGrid>
        </TabsContent>

        <TabsContent value="stats">
          <SectionGrid>
            {content.stats.map((item, index) => (
              <Panel key={`${item.label}-${index}`}>
                <SectionHeading
                  title={`Stat karti ${index + 1}`}
                  description="Hero altindaki 3 ana veri karti."
                />
                <FieldGrid>
                  <TextField
                    label="Deger"
                    value={item.value}
                    onChange={(value) => updateStat(index, "value", value)}
                  />
                  <TextField
                    label="Etiket"
                    value={item.label}
                    onChange={(value) => updateStat(index, "label", value)}
                  />
                  <SelectField
                    label="Ikon"
                    value={item.icon}
                    onChange={(value) => updateStat(index, "icon", value)}
                    options={iconOptions}
                  />
                  <TextAreaField
                    label="Aciklama"
                    value={item.description}
                    onChange={(value) => updateStat(index, "description", value)}
                    className="md:col-span-2"
                  />
                </FieldGrid>
              </Panel>
            ))}
          </SectionGrid>
        </TabsContent>

        <TabsContent value="system">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="4G sistem section"
                description="Section ust copy ve metodoloji basligi."
              />
              <FieldGrid>
                <TextField
                  label="Eyebrow"
                  value={content.methodology.eyebrow}
                  onChange={(value) => updateMethodology("eyebrow", value)}
                />
                <TextField
                  label="Baslik"
                  value={content.methodology.title}
                  onChange={(value) => updateMethodology("title", value)}
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.methodology.description}
                  onChange={(value) => updateMethodology("description", value)}
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="4G kartlari"
                description="Guvenlik, guler yuz, gelisim ve geri bildirim kartlari."
              />
              <div className="mt-5 grid gap-4">
                {content.methodology.items.map((item, index) => (
                  <SubPanel
                    key={`${item.title}-${index}`}
                    title={`Sistem karti ${index + 1}`}
                    description="Ikon, baslik ve aciklama."
                  >
                    <FieldGrid>
                      <TextField
                        label="Baslik"
                        value={item.title}
                        onChange={(value) => updateMethodologyItem(index, "title", value)}
                      />
                      <SelectField
                        label="Ikon"
                        value={item.icon}
                        onChange={(value) => updateMethodologyItem(index, "icon", value)}
                        options={iconOptions}
                      />
                      <TextAreaField
                        label="Aciklama"
                        value={item.description}
                        onChange={(value) => updateMethodologyItem(index, "description", value)}
                        className="md:col-span-2"
                      />
                    </FieldGrid>
                  </SubPanel>
                ))}
              </div>
            </Panel>
          </SectionGrid>
        </TabsContent>

        <TabsContent value="programs">
          <Panel>
            <SectionHeading
              title="Programlar section"
              description="Kartlarin uzerindeki genel copy ve alt 3 program karti."
            />
            <FieldGrid>
              <TextField
                label="Eyebrow"
                value={content.programs.eyebrow}
                onChange={(value) => updatePrograms("eyebrow", value)}
              />
              <TextField
                label="Baslik"
                value={content.programs.title}
                onChange={(value) => updatePrograms("title", value)}
                className="md:col-span-2"
              />
              <TextAreaField
                label="Aciklama"
                value={content.programs.description}
                onChange={(value) => updatePrograms("description", value)}
                className="md:col-span-2"
              />
            </FieldGrid>
          </Panel>

          <div className="grid gap-6">
            {content.programs.items.map((item, index) => (
              <Panel key={`${item.title}-${index}`}>
                <SectionHeading
                  title={`Program karti ${index + 1}`}
                  description="Gorsel, kisa tanim, 3 maddelik liste ve CTA."
                />
                <FieldGrid>
                  <TextField
                    label="Baslik"
                    value={item.title}
                    onChange={(value) => updateProgramItem(index, "title", value)}
                  />
                  <TextField
                    label="CTA etiketi"
                    value={item.ctaLabel}
                    onChange={(value) => updateProgramItem(index, "ctaLabel", value)}
                  />
                  <TextAreaField
                    label="Aciklama"
                    value={item.description}
                    onChange={(value) => updateProgramItem(index, "description", value)}
                    className="md:col-span-2"
                  />
                  <TextField
                    label="Href"
                    value={item.href}
                    onChange={(value) => updateProgramItem(index, "href", value)}
                  />
                  <AssetField
                    label="Program gorseli"
                    value={item.image}
                    onChange={(value) => updateProgramItem(index, "image", value)}
                    uploadKey={`program-${index + 1}`}
                  />
                </FieldGrid>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {item.bullets.map((bullet, bulletIndex) => (
                    <TextField
                      key={`${bullet}-${bulletIndex}`}
                      label={`Madde ${bulletIndex + 1}`}
                      value={bullet}
                      onChange={(value) => updateProgramBullet(index, bulletIndex, value)}
                    />
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="why-us">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Why us split section"
                description="Solda ana metin, sagda buyuk gorsel ve overline stat karti."
              />
              <FieldGrid>
                <TextField
                  label="Basligin ilk bolumu"
                  value={content.whyUs.title}
                  onChange={(value) => updateWhyUs("title", value)}
                />
                <TextField
                  label="Vurgulu kelime"
                  value={content.whyUs.highlight}
                  onChange={(value) => updateWhyUs("highlight", value)}
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.whyUs.description}
                  onChange={(value) => updateWhyUs("description", value)}
                  className="md:col-span-2"
                />
                <TextField
                  label="Stat degeri"
                  value={content.whyUs.statValue}
                  onChange={(value) => updateWhyUs("statValue", value)}
                />
                <TextField
                  label="Stat etiketi"
                  value={content.whyUs.statLabel}
                  onChange={(value) => updateWhyUs("statLabel", value)}
                />
                <AssetField
                  label="Section gorseli"
                  value={content.whyUs.image}
                  onChange={(value) => updateWhyUs("image", value)}
                  uploadKey="why-us"
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Why us madde akisi"
                description="3 editorial bilgi blogu."
              />
              <div className="mt-5 grid gap-4">
                {content.whyUs.points.map((point, index) => (
                  <SubPanel
                    key={`${point.title}-${index}`}
                    title={`Madde ${index + 1}`}
                    description="Baslik ve kisa paragraf."
                  >
                    <FieldGrid>
                      <TextField
                        label="Baslik"
                        value={point.title}
                        onChange={(value) => updateWhyUsPoint(index, "title", value)}
                      />
                      <TextAreaField
                        label="Aciklama"
                        value={point.description}
                        onChange={(value) => updateWhyUsPoint(index, "description", value)}
                        className="md:col-span-2"
                      />
                    </FieldGrid>
                  </SubPanel>
                ))}
              </div>
            </Panel>
          </SectionGrid>
        </TabsContent>

        <TabsContent value="local-proof">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Lokal guven section"
                description="Silivri lokasyonu, veli gorunurlugu ve tesis duzeni gibi karar kolaylastiran blok."
              />
              <FieldGrid>
                <TextField
                  label="Eyebrow"
                  value={content.localProof.eyebrow}
                  onChange={(value) => updateLocalProof("eyebrow", value)}
                />
                <TextField
                  label="Baslik"
                  value={content.localProof.title}
                  onChange={(value) => updateLocalProof("title", value)}
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.localProof.description}
                  onChange={(value) => updateLocalProof("description", value)}
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Proof kartlari"
                description="Lokal guven ve karar kolayligi veren 3 kart."
              />
              <div className="mt-5 grid gap-4">
                {content.localProof.items.map((item, index) => (
                  <SubPanel
                    key={`${item.title}-${index}`}
                    title={`Proof karti ${index + 1}`}
                    description="Ikon, baslik ve aciklama."
                  >
                    <FieldGrid>
                      <TextField
                        label="Baslik"
                        value={item.title}
                        onChange={(value) => updateLocalProofItem(index, "title", value)}
                      />
                      <SelectField
                        label="Ikon"
                        value={item.icon}
                        onChange={(value) => updateLocalProofItem(index, "icon", value)}
                        options={iconOptions}
                      />
                      <TextAreaField
                        label="Aciklama"
                        value={item.description}
                        onChange={(value) => updateLocalProofItem(index, "description", value)}
                        className="md:col-span-2"
                      />
                    </FieldGrid>
                  </SubPanel>
                ))}
              </div>
            </Panel>
          </SectionGrid>
        </TabsContent>

        <TabsContent value="process">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Kayit ve ilk ders sureci"
                description="Bilgi alma, grup secimi ve ilk ders akisini anlatan blok."
              />
              <FieldGrid>
                <TextField
                  label="Eyebrow"
                  value={content.process.eyebrow}
                  onChange={(value) => updateProcess("eyebrow", value)}
                />
                <TextField
                  label="Baslik"
                  value={content.process.title}
                  onChange={(value) => updateProcess("title", value)}
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.process.description}
                  onChange={(value) => updateProcess("description", value)}
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Surec adimlari"
                description="Landing icindeki 3 adimli akıs."
              />
              <div className="mt-5 grid gap-4">
                {content.process.steps.map((item, index) => (
                  <SubPanel
                    key={`${item.title}-${index}`}
                    title={`Adim ${index + 1}`}
                    description="Baslik ve aciklama."
                  >
                    <FieldGrid>
                      <TextField
                        label="Baslik"
                        value={item.title}
                        onChange={(value) => updateProcessStep(index, "title", value)}
                      />
                      <TextAreaField
                        label="Aciklama"
                        value={item.description}
                        onChange={(value) => updateProcessStep(index, "description", value)}
                        className="md:col-span-2"
                      />
                    </FieldGrid>
                  </SubPanel>
                ))}
              </div>
            </Panel>
          </SectionGrid>
        </TabsContent>

        <TabsContent value="testimonials">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Yorumlar section"
                description="SEO ve guven odakli veli yorum alanlari."
              />
              <FieldGrid>
                <TextField
                  label="Eyebrow"
                  value={content.testimonials.eyebrow}
                  onChange={(value) => updateTestimonials("eyebrow", value)}
                />
                <TextField
                  label="Baslik"
                  value={content.testimonials.title}
                  onChange={(value) => updateTestimonials("title", value)}
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.testimonials.description}
                  onChange={(value) => updateTestimonials("description", value)}
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Veli yorumlari"
                description="Yalniz approved yorumlar public tarafta gorunur. Kimlik Ad + soyad bas harfi olarak render edilir."
              />
              <div className="mt-5 flex justify-end">
                <Button type="button" onClick={addTestimonialItem} className="bg-sky-400 text-slate-950 hover:bg-sky-300">
                  <Plus className="h-4 w-4" />
                  Yorum ekle
                </Button>
              </div>
              <div className="mt-5 grid gap-4">
                {content.testimonials.items.map((item, index) => (
                  <SubPanel
                    key={item.id}
                    title={item.parentDisplayName.trim() || `Yorum ${index + 1}`}
                    description="Admin onayli manuel veli yorumu."
                    actions={
                      <ItemToolbar
                        onMoveUp={index === 0 ? undefined : () => moveTestimonialItem(index, -1)}
                        onMoveDown={
                          index === content.testimonials.items.length - 1
                            ? undefined
                            : () => moveTestimonialItem(index, 1)
                        }
                        onRemove={() => removeTestimonialItem(index)}
                      />
                    }
                  >
                    <FieldGrid>
                      <TextAreaField
                        label="Yorum"
                        value={item.quote}
                        onChange={(value) => updateTestimonialItem(index, "quote", value)}
                        className="md:col-span-2"
                      />
                      <TextField
                        label="Veli adi"
                        value={item.parentDisplayName}
                        onChange={(value) => updateTestimonialItem(index, "parentDisplayName", value)}
                      />
                      <TextField
                        label="Baglam"
                        value={item.context}
                        onChange={(value) => updateTestimonialItem(index, "context", value)}
                      />
                      <TextField
                        label="Brans"
                        value={item.branch}
                        onChange={(value) => updateTestimonialItem(index, "branch", value)}
                      />
                      <TextField
                        label="Yas grubu"
                        value={item.childAgeGroup}
                        onChange={(value) => updateTestimonialItem(index, "childAgeGroup", value)}
                      />
                    </FieldGrid>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <ToggleTile
                        active={item.approved}
                        label="Onayli"
                        description="Public sayfada gosterilebilir."
                        onToggle={() => updateTestimonialItem(index, "approved", !item.approved)}
                      />
                      <ToggleTile
                        active={item.featured}
                        label="One cikar"
                        description="Homepage yorum alaninda ust siralarda dursun."
                        onToggle={() => updateTestimonialItem(index, "featured", !item.featured)}
                      />
                    </div>
                    <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Public onizleme
                      </div>
                      <div className="mt-3 text-sm leading-7 text-white">
                        {item.quote || "Yorum metni buraya dusuyor."}
                      </div>
                      <div className="mt-4 text-sm font-semibold text-white">
                        {item.parentDisplayName || "Veli"}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                        {[item.context, item.branch, item.childAgeGroup].filter(Boolean).join(" · ") || "Baglam"}
                      </div>
                    </div>
                  </SubPanel>
                ))}
              </div>
            </Panel>
          </SectionGrid>
        </TabsContent>

        <TabsContent value="coaches">
          <Panel>
            <SectionHeading
              title="Egitmenler section"
              description="Landing page uzerindeki uzman kadro ve tanitim kartlari."
            />
            <FieldGrid>
              <TextField
                label="Section label"
                value={content.coaches.eyebrow}
                onChange={(value) => updateCoaches("eyebrow", value)}
              />
              <TextField
                label="Section baslik"
                value={content.coaches.title}
                onChange={(value) => updateCoaches("title", value)}
              />
              <TextAreaField
                label="Section aciklama"
                value={content.coaches.description}
                onChange={(value) => updateCoaches("description", value)}
                className="md:col-span-2"
              />
            </FieldGrid>

            <div className="mt-5 grid gap-4">
              {content.coaches.items.map((item, index) => (
                <SubPanel
                  key={`${item.name}-${index}`}
                  title={`Egitmen karti ${index + 1}`}
                  description="Landing coach spotlight karti."
                >
                  <FieldGrid>
                    <TextField
                      label="Ad soyad"
                      value={item.name}
                      onChange={(value) => updateCoachItem(index, "name", value)}
                    />
                    <TextField
                      label="Uzmanlik"
                      value={item.specialty}
                      onChange={(value) => updateCoachItem(index, "specialty", value)}
                    />
                    <TextAreaField
                      label="Bio"
                      value={item.bio}
                      onChange={(value) => updateCoachItem(index, "bio", value)}
                      className="md:col-span-2"
                    />
                    <AssetField
                      label="Gorsel"
                      value={item.image}
                      onChange={(value) => updateCoachItem(index, "image", value)}
                      uploadKey={`coach-${index + 1}`}
                      className="md:col-span-2"
                    />
                  </FieldGrid>
                </SubPanel>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="cta">
          <Panel>
            <SectionHeading
              title="Final CTA ve form"
              description="Contact section basligi, iletisim butonlari ve form etiketleri."
            />
            <FieldGrid>
              <TextField
                label="Baslik"
                value={content.cta.title}
                onChange={(value) => updateCta("title", value)}
                className="md:col-span-2"
              />
              <TextAreaField
                label="Aciklama"
                value={content.cta.description}
                onChange={(value) => updateCta("description", value)}
                className="md:col-span-2"
              />
              <TextField
                label="Mobil sticky ust etiket"
                value={content.cta.mobileStickyEyebrow}
                onChange={(value) => updateCta("mobileStickyEyebrow", value)}
              />
              <TextAreaField
                label="Mobil sticky baslik"
                value={content.cta.mobileStickyTitle}
                onChange={(value) => updateCta("mobileStickyTitle", value)}
                className="md:col-span-2"
              />
              <TextField
                label="Mobil sticky WhatsApp etiketi"
                value={content.cta.mobileStickyWhatsAppLabel}
                onChange={(value) => updateCta("mobileStickyWhatsAppLabel", value)}
              />
              <TextField
                label="Mobil sticky Telefon etiketi"
                value={content.cta.mobileStickyPhoneLabel}
                onChange={(value) => updateCta("mobileStickyPhoneLabel", value)}
              />
              <TextField
                label="Mobil sticky primary etiketi"
                value={content.cta.mobileStickyPrimaryLabel}
                onChange={(value) => updateCta("mobileStickyPrimaryLabel", value)}
              />
              <TextField
                label="Ad soyad etiketi"
                value={content.cta.fullNameLabel}
                onChange={(value) => updateCta("fullNameLabel", value)}
              />
              <TextField
                label="Ad soyad placeholder"
                value={content.cta.fullNamePlaceholder}
                onChange={(value) => updateCta("fullNamePlaceholder", value)}
              />
              <TextField
                label="Email etiketi"
                value={content.cta.emailLabel}
                onChange={(value) => updateCta("emailLabel", value)}
              />
              <TextField
                label="Email placeholder"
                value={content.cta.emailPlaceholder}
                onChange={(value) => updateCta("emailPlaceholder", value)}
              />
              <TextField
                label="Telefon etiketi"
                value={content.cta.phoneLabel}
                onChange={(value) => updateCta("phoneLabel", value)}
              />
              <TextField
                label="Telefon placeholder"
                value={content.cta.phonePlaceholder}
                onChange={(value) => updateCta("phonePlaceholder", value)}
              />
              <TextField
                label="Durum etiketi"
                value={content.cta.statusLabel}
                onChange={(value) => updateCta("statusLabel", value)}
              />
              <TextField
                label="Durum placeholder"
                value={content.cta.statusPlaceholder}
                onChange={(value) => updateCta("statusPlaceholder", value)}
              />
              <TextAreaField
                label="Durum secenekleri"
                value={content.cta.statusOptions.join("\n")}
                onChange={updateCtaStatusOptions}
                className="md:col-span-2"
              />
              <TextField
                label="Buton etiketi"
                value={content.cta.submitLabel}
                onChange={(value) => updateCta("submitLabel", value)}
              />
              <TextField
                label="WhatsApp buton etiketi"
                value={content.cta.whatsappLabel}
                onChange={(value) => updateCta("whatsappLabel", value)}
              />
              <TextField
                label="Telefon buton etiketi"
                value={content.cta.phoneCtaLabel}
                onChange={(value) => updateCta("phoneCtaLabel", value)}
              />
              <TextField
                label="Program onerisi etiketi"
                value={content.cta.recommendationLabel}
                onChange={(value) => updateCta("recommendationLabel", value)}
              />
              <TextField
                label="Program onerisi href"
                value={content.cta.recommendationHref}
                onChange={(value) => updateCta("recommendationHref", value)}
              />
              <TextField
                label="CTA telefon numarasi"
                value={content.siteSettings.contactPhone}
                onChange={(value) => updateSiteSettings("contactPhone", value)}
              />
              <TextField
                label="CTA WhatsApp numarasi"
                value={content.siteSettings.whatsappPhone}
                onChange={(value) => updateSiteSettings("whatsappPhone", value)}
              />
              <TextAreaField
                label="Alt not"
                value={content.cta.footnote}
                onChange={(value) => updateCta("footnote", value)}
                className="md:col-span-2"
              />
            </FieldGrid>
          </Panel>
        </TabsContent>

        <TabsContent value="faq">
          <Panel>
            <SectionHeading
              title="SSS section"
              description="Kayit, deneme dersi ve veli paneli hakkindaki sik sorulan sorular."
            />
            <FieldGrid>
              <TextField
                label="Section label"
                value={content.faq.eyebrow}
                onChange={(value) => updateFaq("eyebrow", value)}
              />
              <TextField
                label="Section baslik"
                value={content.faq.title}
                onChange={(value) => updateFaq("title", value)}
              />
              <TextAreaField
                label="Section aciklama"
                value={content.faq.description}
                onChange={(value) => updateFaq("description", value)}
                className="md:col-span-2"
              />
            </FieldGrid>

            <div className="mt-5 grid gap-4">
              {content.faq.items.map((item, index) => (
                <SubPanel
                  key={`${item.question}-${index}`}
                  title={`SSS maddesi ${index + 1}`}
                  description="Landing FAQ satiri."
                >
                  <FieldGrid>
                    <TextField
                      label="Soru"
                      value={item.question}
                      onChange={(value) => updateFaqItem(index, "question", value)}
                      className="md:col-span-2"
                    />
                    <TextAreaField
                      label="Cevap"
                      value={item.answer}
                      onChange={(value) => updateFaqItem(index, "answer", value)}
                      className="md:col-span-2"
                    />
                  </FieldGrid>
                </SubPanel>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="guide">
          <Panel>
            <SectionHeading
              title="Silivri Spor Rehberi"
              description="Landing altindaki lokal SEO rehber blogunun baslik, aciklama ve buton linklerini yonet."
            />
            <FieldGrid>
              <TextField
                label="Eyebrow"
                value={content.guide.eyebrow}
                onChange={(value) => updateGuide("eyebrow", value)}
              />
              <TextAreaField
                label="Baslik"
                value={content.guide.title}
                onChange={(value) => updateGuide("title", value)}
                className="md:col-span-2"
              />
              <TextAreaField
                label="Aciklama"
                value={content.guide.description}
                onChange={(value) => updateGuide("description", value)}
                className="md:col-span-2"
              />
            </FieldGrid>

            <div className="mt-5 grid gap-4">
              {content.guide.items.map((item, index) => (
                <SubPanel
                  key={`${item.label}-${index}`}
                  title={`Rehber linki ${index + 1}`}
                  description="Silivri Spor Rehberi icindeki tiklanabilir buton."
                >
                  <FieldGrid>
                    <TextField
                      label="Etiket"
                      value={item.label}
                      onChange={(value) => updateGuideItem(index, "label", value)}
                    />
                    <TextField
                      label="Href"
                      value={item.href}
                      onChange={(value) => updateGuideItem(index, "href", value)}
                    />
                  </FieldGrid>
                </SubPanel>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="footer">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Footer genel ayarlar"
                description="Footer aciklamasi, alt metin ve bagde."
              />
              <FieldGrid>
                <TextAreaField
                  label="Footer aciklamasi"
                  value={content.footer.description}
                  onChange={(value) => updateFooter("description", value)}
                  className="md:col-span-2"
                />
                <TextField
                  label="Bottom text"
                  value={content.footer.bottomText}
                  onChange={(value) => updateFooter("bottomText", value)}
                />
                <TextField
                  label="Bottom badge"
                  value={content.footer.bottomBadge}
                  onChange={(value) => updateFooter("bottomBadge", value)}
                />
                <TextField
                  label="Copyright"
                  value={content.siteSettings.copyright}
                  onChange={(value) => updateSiteSettings("copyright", value)}
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Sosyal linkler"
                description="Footer social chipleri."
              />
              <div className="mt-5 grid gap-4">
                {content.footer.socials.map((social, index) => (
                  <SubPanel
                    key={`${social.label}-${index}`}
                    title={`Sosyal ${index + 1}`}
                    description="Etiket, ikon ve href."
                  >
                    <FieldGrid>
                      <TextField
                        label="Etiket"
                        value={social.label}
                        onChange={(value) => updateFooterSocial(index, "label", value)}
                      />
                      <SelectField
                        label="Ikon"
                        value={social.icon}
                        onChange={(value) => updateFooterSocial(index, "icon", value)}
                        options={iconOptions}
                      />
                      <TextField
                        label="Href"
                        value={social.href}
                        onChange={(value) => updateFooterSocial(index, "href", value)}
                        className="md:col-span-2"
                      />
                    </FieldGrid>
                  </SubPanel>
                ))}
              </div>
            </Panel>
          </SectionGrid>

          <Panel>
            <SectionHeading
              title="Footer link gruplari"
              description="Kurumsal ve hizli baglantilar kolonlari."
            />
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {content.footer.groups.map((group, groupIndex) => (
                <SubPanel
                  key={`${group.title}-${groupIndex}`}
                  title={`Grup ${groupIndex + 1}`}
                  description="Kolon basligi ve alt linkler."
                >
                  <FieldGrid>
                    <TextField
                      label="Grup basligi"
                      value={group.title}
                      onChange={(value) => updateFooterGroup(groupIndex, value)}
                      className="md:col-span-2"
                    />
                  </FieldGrid>
                  <div className="mt-4 grid gap-3">
                    {group.links.map((link, linkIndex) => (
                      <div
                        key={`${link.label}-${linkIndex}`}
                        className="grid gap-3 rounded-[1.1rem] border border-white/8 bg-white/[0.03] p-3 md:grid-cols-2"
                      >
                        <TextField
                          label={`Link ${linkIndex + 1} etiketi`}
                          value={link.label}
                          onChange={(value) =>
                            updateFooterGroupLink(groupIndex, linkIndex, "label", value)
                          }
                        />
                        <TextField
                          label={`Link ${linkIndex + 1} href`}
                          value={link.href}
                          onChange={(value) =>
                            updateFooterGroupLink(groupIndex, linkIndex, "href", value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </SubPanel>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </form>
  );
}

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.8rem] border border-white/8 bg-[#0f1a2d] p-5 shadow-[0_28px_90px_rgba(2,12,27,0.25)] md:p-6 ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

function SectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 xl:grid-cols-2">{children}</div>;
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-display text-[1.75rem] font-black tracking-[-0.04em] text-white">
        {title}
      </h3>
      <p className="max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function SubPanel({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-sm leading-6 text-slate-400">{description}</div>
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ItemToolbar({
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" variant="outline" className="h-9 px-3" onClick={onMoveUp} disabled={!onMoveUp}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 px-3"
        onClick={onMoveDown}
        disabled={!onMoveDown}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-9 px-3 text-rose-300" onClick={onRemove}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ToggleTile({
  active,
  label,
  description,
  onToggle,
}: {
  active: boolean;
  label: string;
  description: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "rounded-[1.2rem] border px-4 py-4 text-left transition",
        active
          ? "border-emerald-400/30 bg-emerald-400/10"
          : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="mt-1 text-sm leading-6 text-slate-400">{description}</div>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            active ? "bg-emerald-400 text-[#071223]" : "bg-white/[0.05] text-slate-400",
          )}
        >
          {active ? <Check className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </div>
      </div>
    </button>
  );
}

function FieldGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mt-5 grid gap-4 md:grid-cols-2 ${className ?? ""}`}>{children}</div>;
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </div>
      <div className="mt-3 font-display text-xl font-black text-white">{value}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-slate-200/90 bg-[#f7f9fc] text-slate-950 placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:bg-white focus-visible:ring-sky-300/15"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </label>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 border-slate-200/90 bg-[#f7f9fc] text-slate-950 placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:bg-white focus-visible:ring-sky-300/15"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </label>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-slate-200/90 bg-[#f7f9fc] text-slate-950 focus-visible:border-sky-300 focus-visible:bg-white focus-visible:ring-sky-300/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function AssetField({
  label,
  value,
  onChange,
  uploadKey,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  uploadKey: string;
  className?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("field", uploadKey);

      const response = await fetch("/api/admin/landing-assets", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        setUploadError(payload.error ?? "Gorsel yuklenemedi.");
        return;
      }

      onChange(payload.url);
    } catch {
      setUploadError("Gorsel yukleme sirasinda beklenmeyen bir hata olustu.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </label>
      <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-[#121f36] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
            {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Dosya yukle
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
            />
          </label>
          <span className="text-xs text-slate-500">PNG, JPG, WebP veya SVG kullan.</span>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[120px_1fr]">
          <div className="overflow-hidden rounded-[1rem] border border-white/8 bg-white/[0.03]">
            {value ? (
              <img src={value} alt={label} className="h-28 w-full object-cover" />
            ) : (
              <div className="flex h-28 items-center justify-center text-slate-500">
                <ImagePlus className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="border-slate-200/90 bg-[#f7f9fc] text-slate-950 placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:bg-white focus-visible:ring-sky-300/15"
              placeholder="https://..."
            />
            {uploadError ? <p className="text-sm text-rose-300">{uploadError}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
