"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

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

const initialState: LandingEditorActionState = {
  error: null,
  success: null,
};

const iconOptions: Array<{ value: IconKey; label: string }> = [
  { value: "snowflake", label: "Snowflake" },
  { value: "users", label: "Users" },
  { value: "medal", label: "Medal" },
  { value: "shield", label: "Shield" },
  { value: "clock", label: "Clock" },
  { value: "map", label: "Map" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "heart", label: "Heart" },
  { value: "news", label: "News" },
  { value: "star", label: "Star" },
  { value: "quote", label: "Quote" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
];

function cloneLandingContent(content: LandingContent) {
  return JSON.parse(JSON.stringify(content)) as LandingContent;
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Henuz kaydedilmedi";
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
};

export function AdminLandingEditor({
  initialContent,
  updatedAt,
  storageError,
}: AdminLandingEditorProps) {
  const [state, formAction] = useActionState(updateLandingContentAction, initialState);
  const [content, setContent] = useState(() => cloneLandingContent(initialContent));

  useEffect(() => {
    setContent(cloneLandingContent(initialContent));
  }, [initialContent]);

  const serializedContent = useMemo(() => JSON.stringify(content), [content]);

  function updateRoot<K extends keyof LandingContent>(
    key: K,
    value: LandingContent[K],
  ) {
    setContent((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateNestedSection<
    K extends keyof LandingContent,
    F extends keyof LandingContent[K] & string,
  >(section: K, field: F, value: string) {
    setContent((current) => ({
      ...current,
      [section]: {
        ...(current[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  }

  function updateNavbarLink(index: number, field: "label" | "href", value: string) {
    const links = content.navbar.links.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateRoot("navbar", { ...content.navbar, links });
  }

  function updateStat(
    index: number,
    field: "value" | "label" | "description" | "icon",
    value: string,
  ) {
    const stats = content.stats.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [field]: field === "icon" ? (value as IconKey) : value,
          }
        : item,
    );
    updateRoot("stats", stats);
  }

  function updateProgramItem(
    index: number,
    field: "title" | "description" | "image" | "href" | "ctaLabel" | "layout",
    value: string,
  ) {
    const items = content.programs.items.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [field]:
              field === "layout"
                ? (value as LandingContent["programs"]["items"][number]["layout"])
                : value,
          }
        : item,
    );
    updateRoot("programs", { ...content.programs, items });
  }

  function updateFeature(
    index: number,
    field: "title" | "description" | "icon",
    value: string,
  ) {
    const features = content.whyUs.features.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [field]: field === "icon" ? (value as IconKey) : value,
          }
        : item,
    );
    updateRoot("whyUs", { ...content.whyUs, features });
  }

  function updateTestimonial(
    index: number,
    field: "name" | "role" | "quote" | "avatar" | "rating",
    value: string,
  ) {
    const items = content.testimonials.items.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [field]: field === "rating" ? Number(value) || 0 : value,
          }
        : item,
    );
    updateRoot("testimonials", { ...content.testimonials, items });
  }

  function updateNewsItem(
    index: number,
    field: "image" | "category" | "title" | "description" | "href",
    value: string,
  ) {
    const items = content.news.items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    updateRoot("news", { ...content.news, items });
  }

  function updateFooterGroup(index: number, title: string) {
    const groups = content.footer.groups.map((item, itemIndex) =>
      itemIndex === index ? { ...item, title } : item,
    );
    updateRoot("footer", { ...content.footer, groups });
  }

  function updateFooterGroupLink(
    groupIndex: number,
    linkIndex: number,
    field: "label" | "href",
    value: string,
  ) {
    const groups = content.footer.groups.map((group, currentGroupIndex) =>
      currentGroupIndex === groupIndex
        ? {
            ...group,
            links: group.links.map((link, currentLinkIndex) =>
              currentLinkIndex === linkIndex ? { ...link, [field]: value } : link,
            ),
          }
        : group,
    );
    updateRoot("footer", { ...content.footer, groups });
  }

  function updateFooterSocial(
    index: number,
    field: "label" | "href" | "icon",
    value: string,
  ) {
    const socials = content.footer.socials.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [field]: field === "icon" ? (value as IconKey) : value,
          }
        : item,
    );
    updateRoot("footer", { ...content.footer, socials });
  }

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="content" value={serializedContent} readOnly />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <Panel>
          <Eyebrow>Yayin omurgasi</Eyebrow>
          <h2 className="mt-3 font-display text-2xl text-foreground">
            Landing page icerik yonetimi
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Anasayfada gorunen tum metinler, CTA alanlari, editorial kartlar ve footer baglantilari
            bu merkezden yonetilir. Public sayfa yalnizca kaydedilen content kaynagindan beslenir.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setContent(cloneLandingContent(defaultLandingContent))}
            >
              Varsayilan icerigi yukle
            </Button>
            <Button asChild variant="ghost">
              <Link href="/" target="_blank">
                Canli anasayfayi ac
              </Link>
            </Button>
          </div>
        </Panel>

        <Panel>
          <Eyebrow>Yayin durumu</Eyebrow>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Guncellenen section"
              value="9"
              description="Navbar, hero, stats, branslar, neden biz, yorumlar, haberler, CTA ve footer."
            />
            <MetricCard
              label="Son kayit"
              value={formatUpdatedAt(updatedAt)}
              description="Kayit sonrasi public homepage no-store fetch ile yeni icerigi alir."
            />
          </div>
        </Panel>

        <Panel>
          <Eyebrow>Yetki kurali</Eyebrow>
          <div className="mt-4 rounded-[1.3rem] bg-[#eef3ff] px-4 py-4">
            <div className="text-sm font-semibold text-foreground">Yalnizca admin yazabilir</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Yonetici, koc ve veli yuzeyleri landing content uzerinde yazma akisina sahip degil.
            </p>
          </div>
          {storageError ? (
            <p className="mt-4 text-sm text-destructive">{storageError}</p>
          ) : null}
          {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="mt-4 text-sm text-success">{state.success}</p> : null}
          <div className="mt-5">
            <FormSubmitButton className="w-full" pendingLabel="Landing kaydediliyor...">
              Landing page kaydini yap
            </FormSubmitButton>
          </div>
        </Panel>
      </section>

      <Tabs defaultValue="general" className="grid gap-5">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="programs">Branslar</TabsTrigger>
          <TabsTrigger value="why-us">Neden Biz</TabsTrigger>
          <TabsTrigger value="testimonials">Yorumlar</TabsTrigger>
          <TabsTrigger value="news">Haberler</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Site ayarlari"
                description="Marka dili, iletisim ve footer alt metnini bu bloktan guncelle."
              />
              <FieldGrid>
                <TextField
                  label="Marka adi"
                  value={content.siteSettings.brandName}
                  onChange={(value) => updateNestedSection("siteSettings", "brandName", value)}
                />
                <TextField
                  label="Tagline"
                  value={content.siteSettings.brandTagline}
                  onChange={(value) => updateNestedSection("siteSettings", "brandTagline", value)}
                />
                <TextField
                  label="Telefon"
                  value={content.siteSettings.contactPhone}
                  onChange={(value) => updateNestedSection("siteSettings", "contactPhone", value)}
                />
                <TextField
                  label="E-posta"
                  value={content.siteSettings.contactEmail}
                  onChange={(value) => updateNestedSection("siteSettings", "contactEmail", value)}
                />
                <TextAreaField
                  label="Copyright"
                  value={content.siteSettings.copyright}
                  onChange={(value) => updateNestedSection("siteSettings", "copyright", value)}
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Navbar"
                description="Sticky header icerigini ve sagdaki CTA aksiyonunu buradan yonet."
              />
              <FieldGrid>
                <TextField
                  label="Logo etiketi"
                  value={content.navbar.logoLabel}
                  onChange={(value) => updateNestedSection("navbar", "logoLabel", value)}
                />
                <TextField
                  label="CTA etiketi"
                  value={content.navbar.ctaLabel}
                  onChange={(value) => updateNestedSection("navbar", "ctaLabel", value)}
                />
                <TextField
                  label="CTA href"
                  value={content.navbar.ctaHref}
                  onChange={(value) => updateNestedSection("navbar", "ctaHref", value)}
                  className="md:col-span-2"
                />
              </FieldGrid>
              <div className="mt-5 grid gap-4">
                {content.navbar.links.map((item, index) => (
                  <SubPanel
                    key={`${item.label}-${index}`}
                    title={`Menu linki ${index + 1}`}
                    description="Navbar akisi sabit kalsin diye link sayisi korunuyor."
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
          <Panel>
            <SectionHeading
              title="Hero alani"
              description="Tam ekran ilk izlenim burada kurulur; baslik, vurgu, CTA ve arka plan gorseli ayni section'da tutulur."
            />
            <FieldGrid>
              <TextField
                label="Badge"
                value={content.hero.badge}
                onChange={(value) => updateNestedSection("hero", "badge", value)}
              />
              <TextField
                label="Baslik"
                value={content.hero.title}
                onChange={(value) => updateNestedSection("hero", "title", value)}
              />
              <TextField
                label="Vurgulu baslik"
                value={content.hero.highlight}
                onChange={(value) => updateNestedSection("hero", "highlight", value)}
                className="md:col-span-2"
              />
              <TextAreaField
                label="Aciklama"
                value={content.hero.description}
                onChange={(value) => updateNestedSection("hero", "description", value)}
                className="md:col-span-2"
              />
              <TextField
                label="Primary CTA"
                value={content.hero.primaryCtaLabel}
                onChange={(value) => updateNestedSection("hero", "primaryCtaLabel", value)}
              />
              <TextField
                label="Primary href"
                value={content.hero.primaryCtaHref}
                onChange={(value) => updateNestedSection("hero", "primaryCtaHref", value)}
              />
              <TextField
                label="Secondary CTA"
                value={content.hero.secondaryCtaLabel}
                onChange={(value) => updateNestedSection("hero", "secondaryCtaLabel", value)}
              />
              <TextField
                label="Secondary href"
                value={content.hero.secondaryCtaHref}
                onChange={(value) => updateNestedSection("hero", "secondaryCtaHref", value)}
              />
              <TextAreaField
                label="Arka plan gorseli"
                value={content.hero.backgroundImage}
                onChange={(value) => updateNestedSection("hero", "backgroundImage", value)}
                className="md:col-span-2"
              />
            </FieldGrid>
          </Panel>
        </TabsContent>

        <TabsContent value="stats">
          <SectionGrid>
            {content.stats.map((item, index) => (
              <Panel key={`${item.label}-${index}`}>
                <SectionHeading
                  title={`Stat karti ${index + 1}`}
                  description="Hero altindaki 3 sayisal karti bu alandan guncelleyebilirsin."
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

        <TabsContent value="programs">
          <Panel>
            <SectionHeading
              title="Branslar section"
              description="Section ust bilgisi ve editorial kartlarin tamami bu blokta tutulur."
            />
            <FieldGrid>
              <TextField
                label="Eyebrow"
                value={content.programs.eyebrow}
                onChange={(value) =>
                  updateRoot("programs", { ...content.programs, eyebrow: value })
                }
              />
              <TextField
                label="Baslik"
                value={content.programs.title}
                onChange={(value) =>
                  updateRoot("programs", { ...content.programs, title: value })
                }
                className="md:col-span-2"
              />
              <TextAreaField
                label="Aciklama"
                value={content.programs.description}
                onChange={(value) =>
                  updateRoot("programs", { ...content.programs, description: value })
                }
                className="md:col-span-2"
              />
            </FieldGrid>
          </Panel>
          <SectionGrid>
            {content.programs.items.map((item, index) => (
              <Panel key={`${item.title}-${index}`}>
                <SectionHeading
                  title={`Brans karti ${index + 1}`}
                  description="Editorial card akisi: baslik, kisa metin, gorsel, link ve layout."
                />
                <FieldGrid>
                  <TextField
                    label="Baslik"
                    value={item.title}
                    onChange={(value) => updateProgramItem(index, "title", value)}
                  />
                  <SelectField
                    label="Layout"
                    value={item.layout}
                    onChange={(value) => updateProgramItem(index, "layout", value)}
                    options={[
                      { value: "wide", label: "Wide" },
                      { value: "tall", label: "Tall" },
                      { value: "full", label: "Full" },
                    ]}
                  />
                  <TextAreaField
                    label="Aciklama"
                    value={item.description}
                    onChange={(value) => updateProgramItem(index, "description", value)}
                    className="md:col-span-2"
                  />
                  <TextAreaField
                    label="Gorsel URL"
                    value={item.image}
                    onChange={(value) => updateProgramItem(index, "image", value)}
                    className="md:col-span-2"
                  />
                  <TextField
                    label="Href"
                    value={item.href}
                    onChange={(value) => updateProgramItem(index, "href", value)}
                  />
                  <TextField
                    label="CTA etiketi"
                    value={item.ctaLabel}
                    onChange={(value) => updateProgramItem(index, "ctaLabel", value)}
                  />
                </FieldGrid>
              </Panel>
            ))}
          </SectionGrid>
        </TabsContent>

        <TabsContent value="why-us">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Neden biz section"
                description="Section copy ve sag tarafta akan ana gorsel."
              />
              <FieldGrid>
                <TextField
                  label="Eyebrow"
                  value={content.whyUs.eyebrow}
                  onChange={(value) => updateRoot("whyUs", { ...content.whyUs, eyebrow: value })}
                />
                <TextField
                  label="Baslik"
                  value={content.whyUs.title}
                  onChange={(value) => updateRoot("whyUs", { ...content.whyUs, title: value })}
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Aciklama"
                  value={content.whyUs.description}
                  onChange={(value) =>
                    updateRoot("whyUs", { ...content.whyUs, description: value })
                  }
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Gorsel URL"
                  value={content.whyUs.image}
                  onChange={(value) => updateRoot("whyUs", { ...content.whyUs, image: value })}
                  className="md:col-span-2"
                />
              </FieldGrid>
            </Panel>

            <Panel>
              <SectionHeading
                title="Ozellik kartlari"
                description="4 adet reason card burada tek tek degistirilebilir."
              />
              <div className="grid gap-4">
                {content.whyUs.features.map((item, index) => (
                  <SubPanel
                    key={`${item.title}-${index}`}
                    title={`Ozellik ${index + 1}`}
                    description="Kart basligi, aciklama ve ikon."
                  >
                    <FieldGrid>
                      <TextField
                        label="Baslik"
                        value={item.title}
                        onChange={(value) => updateFeature(index, "title", value)}
                      />
                      <SelectField
                        label="Ikon"
                        value={item.icon}
                        onChange={(value) => updateFeature(index, "icon", value)}
                        options={iconOptions}
                      />
                      <TextAreaField
                        label="Aciklama"
                        value={item.description}
                        onChange={(value) => updateFeature(index, "description", value)}
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
          <Panel>
            <SectionHeading
              title="Yorumlar section"
              description="Section copy ve yorum kartlari topluca yonetilir."
            />
            <FieldGrid>
              <TextField
                label="Eyebrow"
                value={content.testimonials.eyebrow}
                onChange={(value) =>
                  updateRoot("testimonials", { ...content.testimonials, eyebrow: value })
                }
              />
              <TextField
                label="Baslik"
                value={content.testimonials.title}
                onChange={(value) =>
                  updateRoot("testimonials", { ...content.testimonials, title: value })
                }
                className="md:col-span-2"
              />
              <TextAreaField
                label="Aciklama"
                value={content.testimonials.description}
                onChange={(value) =>
                  updateRoot("testimonials", { ...content.testimonials, description: value })
                }
                className="md:col-span-2"
              />
            </FieldGrid>
          </Panel>
          <SectionGrid>
            {content.testimonials.items.map((item, index) => (
              <Panel key={`${item.name}-${index}`}>
                <SectionHeading
                  title={`Yorum ${index + 1}`}
                  description="Isim, rol, puan ve alintiyi buradan guncelle."
                />
                <FieldGrid>
                  <TextField
                    label="Isim"
                    value={item.name}
                    onChange={(value) => updateTestimonial(index, "name", value)}
                  />
                  <TextField
                    label="Rol"
                    value={item.role}
                    onChange={(value) => updateTestimonial(index, "role", value)}
                  />
                  <TextField
                    label="Puan"
                    value={String(item.rating)}
                    onChange={(value) => updateTestimonial(index, "rating", value)}
                  />
                  <TextField
                    label="Avatar URL"
                    value={item.avatar ?? ""}
                    onChange={(value) => updateTestimonial(index, "avatar", value)}
                  />
                  <TextAreaField
                    label="Alinti"
                    value={item.quote}
                    onChange={(value) => updateTestimonial(index, "quote", value)}
                    className="md:col-span-2"
                  />
                </FieldGrid>
              </Panel>
            ))}
          </SectionGrid>
        </TabsContent>

        <TabsContent value="news">
          <Panel>
            <SectionHeading
              title="Haberler section"
              description="Akademi guncel kartlari ve section copy burada yonetilir."
            />
            <FieldGrid>
              <TextField
                label="Eyebrow"
                value={content.news.eyebrow}
                onChange={(value) => updateRoot("news", { ...content.news, eyebrow: value })}
              />
              <TextField
                label="Baslik"
                value={content.news.title}
                onChange={(value) => updateRoot("news", { ...content.news, title: value })}
                className="md:col-span-2"
              />
              <TextAreaField
                label="Aciklama"
                value={content.news.description}
                onChange={(value) =>
                  updateRoot("news", { ...content.news, description: value })
                }
                className="md:col-span-2"
              />
            </FieldGrid>
          </Panel>
          <SectionGrid>
            {content.news.items.map((item, index) => (
              <Panel key={`${item.title}-${index}`}>
                <SectionHeading
                  title={`Haber karti ${index + 1}`}
                  description="Gorsel, kategori, baslik, aciklama ve hedef link."
                />
                <FieldGrid>
                  <TextField
                    label="Kategori"
                    value={item.category}
                    onChange={(value) => updateNewsItem(index, "category", value)}
                  />
                  <TextField
                    label="Baslik"
                    value={item.title}
                    onChange={(value) => updateNewsItem(index, "title", value)}
                  />
                  <TextAreaField
                    label="Aciklama"
                    value={item.description}
                    onChange={(value) => updateNewsItem(index, "description", value)}
                    className="md:col-span-2"
                  />
                  <TextAreaField
                    label="Gorsel URL"
                    value={item.image}
                    onChange={(value) => updateNewsItem(index, "image", value)}
                    className="md:col-span-2"
                  />
                  <TextField
                    label="Href"
                    value={item.href}
                    onChange={(value) => updateNewsItem(index, "href", value)}
                    className="md:col-span-2"
                  />
                </FieldGrid>
              </Panel>
            ))}
          </SectionGrid>
        </TabsContent>

        <TabsContent value="cta">
          <Panel>
            <SectionHeading
              title="Final CTA ve form"
              description="Kayit section basligi, aciklamasi, tum field etiketleri ve placeholder alanlari bu bloktan yonetilir."
            />
            <FieldGrid>
              <TextField
                label="Eyebrow"
                value={content.cta.eyebrow}
                onChange={(value) => updateRoot("cta", { ...content.cta, eyebrow: value })}
              />
              <TextField
                label="Baslik"
                value={content.cta.title}
                onChange={(value) => updateRoot("cta", { ...content.cta, title: value })}
                className="md:col-span-2"
              />
              <TextAreaField
                label="Aciklama"
                value={content.cta.description}
                onChange={(value) => updateRoot("cta", { ...content.cta, description: value })}
                className="md:col-span-2"
              />
              <TextField
                label="Ad soyad etiketi"
                value={content.cta.fullNameLabel}
                onChange={(value) => updateRoot("cta", { ...content.cta, fullNameLabel: value })}
              />
              <TextField
                label="Ad soyad placeholder"
                value={content.cta.fullNamePlaceholder}
                onChange={(value) =>
                  updateRoot("cta", { ...content.cta, fullNamePlaceholder: value })
                }
              />
              <TextField
                label="E-posta etiketi"
                value={content.cta.emailLabel}
                onChange={(value) => updateRoot("cta", { ...content.cta, emailLabel: value })}
              />
              <TextField
                label="E-posta placeholder"
                value={content.cta.emailPlaceholder}
                onChange={(value) =>
                  updateRoot("cta", { ...content.cta, emailPlaceholder: value })
                }
              />
              <TextField
                label="Telefon etiketi"
                value={content.cta.phoneLabel}
                onChange={(value) => updateRoot("cta", { ...content.cta, phoneLabel: value })}
              />
              <TextField
                label="Telefon placeholder"
                value={content.cta.phonePlaceholder}
                onChange={(value) =>
                  updateRoot("cta", { ...content.cta, phonePlaceholder: value })
                }
              />
              <TextField
                label="Brans etiketi"
                value={content.cta.branchLabel}
                onChange={(value) => updateRoot("cta", { ...content.cta, branchLabel: value })}
              />
              <TextField
                label="Brans placeholder"
                value={content.cta.branchPlaceholder}
                onChange={(value) =>
                  updateRoot("cta", { ...content.cta, branchPlaceholder: value })
                }
              />
              <TextField
                label="Not etiketi"
                value={content.cta.noteLabel}
                onChange={(value) => updateRoot("cta", { ...content.cta, noteLabel: value })}
              />
              <TextField
                label="Not placeholder"
                value={content.cta.notePlaceholder}
                onChange={(value) =>
                  updateRoot("cta", { ...content.cta, notePlaceholder: value })
                }
              />
              <TextField
                label="Submit etiketi"
                value={content.cta.submitLabel}
                onChange={(value) => updateRoot("cta", { ...content.cta, submitLabel: value })}
              />
              <TextAreaField
                label="Alt not"
                value={content.cta.footnote}
                onChange={(value) => updateRoot("cta", { ...content.cta, footnote: value })}
                className="md:col-span-2"
              />
            </FieldGrid>
          </Panel>
        </TabsContent>

        <TabsContent value="footer">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Footer genel metni"
                description="Marka aciklamasi ve social linkler."
              />
              <FieldGrid>
                <TextAreaField
                  label="Marka aciklamasi"
                  value={content.footer.description}
                  onChange={(value) =>
                    updateRoot("footer", { ...content.footer, description: value })
                  }
                  className="md:col-span-2"
                />
              </FieldGrid>
              <div className="mt-5 grid gap-4">
                {content.footer.socials.map((item, index) => (
                  <SubPanel
                    key={`${item.label}-${index}`}
                    title={`Sosyal link ${index + 1}`}
                    description="Footer icon, label ve link yonetimi."
                  >
                    <FieldGrid>
                      <TextField
                        label="Etiket"
                        value={item.label}
                        onChange={(value) => updateFooterSocial(index, "label", value)}
                      />
                      <SelectField
                        label="Ikon"
                        value={item.icon}
                        onChange={(value) => updateFooterSocial(index, "icon", value)}
                        options={iconOptions}
                      />
                      <TextField
                        label="Href"
                        value={item.href}
                        onChange={(value) => updateFooterSocial(index, "href", value)}
                        className="md:col-span-2"
                      />
                    </FieldGrid>
                  </SubPanel>
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                title="Footer link gruplari"
                description="Footer kolon basliklari ve baglanti listeleri."
              />
              <div className="grid gap-4">
                {content.footer.groups.map((group, groupIndex) => (
                  <SubPanel
                    key={`${group.title}-${groupIndex}`}
                    title={`Link grubu ${groupIndex + 1}`}
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
                          className="grid gap-3 rounded-[1.05rem] border border-white/50 bg-white/70 px-3 py-3 md:grid-cols-2"
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
          </SectionGrid>
        </TabsContent>
      </Tabs>
    </form>
  );
}

function SectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 xl:grid-cols-2">{children}</div>;
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="surface-panel rounded-[1.7rem] border border-white/50 p-5 md:p-6">
      {children}
    </section>
  );
}

function SubPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/50 bg-white/78 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
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
      <h3 className="font-display text-[1.7rem] leading-tight tracking-[-0.04em] text-foreground">
        {title}
      </h3>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/50 bg-white/78 px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 font-display text-2xl leading-tight text-foreground">{value}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
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
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
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
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
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
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
