"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { ExternalLink, ImagePlus, LoaderCircle, RefreshCw, Upload } from "lucide-react";

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

  function updateCta(field: keyof LandingContent["cta"], value: string) {
    updateRoot("cta", {
      ...content.cta,
      [field]: value,
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
            <StatTile label="Kontrol edilen alan" value="8 ana section" />
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

      <Tabs defaultValue="brand" className="grid gap-5">
        <TabsList className="w-full justify-start bg-[#0d182d]">
          <TabsTrigger value="brand">Marka</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="system">4G Sistem</TabsTrigger>
          <TabsTrigger value="programs">Programlar</TabsTrigger>
          <TabsTrigger value="coaches">Egitmenler</TabsTrigger>
          <TabsTrigger value="why-us">Why Us</TabsTrigger>
          <TabsTrigger value="faq">SSS</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="brand">
          <SectionGrid>
            <Panel>
              <SectionHeading
                title="Marka ve navbar"
                description="Logo, marka metinleri, menu akisi ve sag ust CTA bu section icinde."
              />
              <FieldGrid>
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
                />
                <TextField
                  label="Telefon"
                  value={content.siteSettings.contactPhone}
                  onChange={(value) => updateSiteSettings("contactPhone", value)}
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
                  className="md:col-span-2"
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
              description="Contact section basligi, aciklamasi ve form etiketleri."
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
                label="Buton etiketi"
                value={content.cta.submitLabel}
                onChange={(value) => updateCta("submitLabel", value)}
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
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-sm leading-6 text-slate-400">{description}</div>
      </div>
      <div className="mt-4">{children}</div>
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
    <div className={className}>
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
    <div className={className}>
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
    <div className={className}>
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
    <div className={className}>
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

        <div className="mt-4 grid gap-4 lg:grid-cols-[120px_1fr]">
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
