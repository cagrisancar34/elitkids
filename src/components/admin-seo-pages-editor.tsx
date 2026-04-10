"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import {
  updateSeoPageContentAction,
  type SeoPageEditorActionState,
} from "@/app/(app)/admin/seo-pages/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SeoPageStorageRecord, SeoPageType } from "@/lib/seo-pages";
import { cn } from "@/lib/utils";

const initialState: SeoPageEditorActionState = {
  error: null,
  success: null,
};

function clonePage(page: SeoPageStorageRecord) {
  return JSON.parse(JSON.stringify(page)) as SeoPageStorageRecord;
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Varsayilan icerik";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type AdminSeoPagesEditorProps = {
  initialPages: SeoPageStorageRecord[];
  storageError: string | null;
};

export function AdminSeoPagesEditor({
  initialPages,
  storageError,
}: AdminSeoPagesEditorProps) {
  const [state, formAction] = useActionState(updateSeoPageContentAction, initialState);
  const [pages, setPages] = useState(() => initialPages.map(clonePage));
  const [activeSlug, setActiveSlug] = useState("");

  useEffect(() => {
    function handlePageShow() {
      setActiveSlug("");
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const activePage = useMemo(
    () => (activeSlug ? pages.find((page) => page.slug === activeSlug) ?? null : null),
    [activeSlug, pages],
  );

  function updatePage(nextPage: SeoPageStorageRecord) {
    setPages((current) =>
      current.map((page) => (page.slug === nextPage.slug ? nextPage : page)),
    );
  }

  function updateField(field: keyof SeoPageStorageRecord["content"], value: string | boolean) {
    if (!activePage) {
      return;
    }

    updatePage({
      ...activePage,
      content: {
        ...activePage.content,
        [field]: value,
      },
    });
  }

  function updateBullet(index: number, value: string) {
    if (!activePage) {
      return;
    }

    updatePage({
      ...activePage,
      content: {
        ...activePage.content,
        bulletItems: activePage.content.bulletItems.map((item, itemIndex) =>
          itemIndex === index ? value : item,
        ),
      },
    });
  }

  function updateFaq(
    index: number,
    field: "question" | "answer",
    value: string,
  ) {
    if (!activePage) {
      return;
    }

    updatePage({
      ...activePage,
      content: {
        ...activePage.content,
        faqItems: activePage.content.faqItems.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    });
  }

  return (
    <div className="grid gap-6">
      {storageError ? (
        <div className="rounded-[1.2rem] border border-amber-400/25 bg-amber-400/10 px-4 py-4 text-sm leading-6 text-amber-900">
          {storageError}
        </div>
      ) : null}

      <div className="rounded-[1.6rem] border border-white/60 bg-white/80 p-5">
        <div className="flex flex-wrap gap-3">
          {pages.map((page) => {
            const active = activeSlug === page.slug;

            return (
              <button
                key={page.slug}
                type="button"
                onClick={() => setActiveSlug((current) => (current === page.slug ? "" : page.slug))}
                aria-expanded={active}
                className={cn(
                  "inline-flex min-h-12 items-center gap-3 rounded-full border px-4 py-3 text-left transition-all",
                  active
                    ? "border-primary/20 bg-primary/8 shadow-[0_12px_24px_rgba(20,86,215,0.08)]"
                    : "border-white/70 bg-[#f8fbff] hover:bg-white",
                )}
              >
                <span className="font-semibold text-foreground">{page.content.title}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                    page.content.published
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-slate-200 text-slate-600",
                  )}
                >
                  {page.content.published ? "Yayinda" : "Taslak"}
                </span>
              </button>
            );
          })}
        </div>

        {!activePage ? (
          <div className="mt-5 rounded-[1.2rem] border border-dashed border-slate-300 bg-[#f8fbff] px-5 py-6 text-sm leading-7 text-muted-foreground">
            Ustteki sayfa butonlarindan birine tiklayin. Tiklamazsaniz alt alanlar gizli kalir.
          </div>
        ) : (
          <div className="mt-5 rounded-[1.2rem] border border-slate-200 bg-[#f8fbff] px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
                  {activePage.content.title}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  /{activePage.slug}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Son kayit: {formatUpdatedAt(activePage.updatedAt)}
              </div>
            </div>
            <p className="mt-3 max-w-[90ch] text-sm leading-7 text-muted-foreground">
              {activePage.content.metaDescription}
            </p>
          </div>
        )}
      </div>

      {activePage ? (
        <form action={formAction} className="grid gap-6">
          <input type="hidden" name="slug" value={activePage.slug} />
          <input type="hidden" name="content" value={JSON.stringify(activePage.content)} />

          <div className="grid gap-4 rounded-[1.6rem] border border-white/60 bg-white/80 p-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Sayfa basligi
              </label>
              <Input
                value={activePage.content.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Slug
              </label>
              <Input value={activePage.content.slug} readOnly />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Sayfa tipi
              </label>
              <Select
                value={activePage.content.pageType}
                onChange={(event) =>
                  updateField("pageType", event.target.value as SeoPageType)
                }
              >
                <option value="service">Servis</option>
                <option value="brand">Marka</option>
                <option value="contact">Iletisim</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Yayin durumu
              </label>
              <Select
                value={activePage.content.published ? "published" : "draft"}
                onChange={(event) => updateField("published", event.target.value === "published")}
              >
                <option value="published">Yayinda</option>
                <option value="draft">Taslak</option>
              </Select>
            </div>
          </div>

        <div className="grid gap-4 rounded-[1.6rem] border border-white/60 bg-white/80 p-5">
          <div className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
            SEO alanlari
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                SEO title
              </label>
              <Input
                value={activePage.content.seoTitle}
                onChange={(event) => updateField("seoTitle", event.target.value)}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Meta description
              </label>
              <Textarea
                value={activePage.content.metaDescription}
                onChange={(event) => updateField("metaDescription", event.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Canonical path
              </label>
              <Input
                value={activePage.content.canonicalPath}
                onChange={(event) => updateField("canonicalPath", event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.6rem] border border-white/60 bg-white/80 p-5">
          <div className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
            Hero
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Eyebrow
              </label>
              <Input
                value={activePage.content.heroEyebrow}
                onChange={(event) => updateField("heroEyebrow", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Hero basligi
              </label>
              <Textarea
                value={activePage.content.heroTitle}
                onChange={(event) => updateField("heroTitle", event.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Hero aciklamasi
              </label>
              <Textarea
                value={activePage.content.heroDescription}
                onChange={(event) => updateField("heroDescription", event.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.6rem] border border-white/60 bg-white/80 p-5">
          <div className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
            Lokal icerik bloklari
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Giris basligi
              </label>
              <Input
                value={activePage.content.introTitle}
                onChange={(event) => updateField("introTitle", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Giris metni
              </label>
              <Textarea
                value={activePage.content.introBody}
                onChange={(event) => updateField("introBody", event.target.value)}
                rows={5}
              />
            </div>

            {[
              ["sectionOneTitle", "sectionOneBody", "Blok 1"],
              ["sectionTwoTitle", "sectionTwoBody", "Blok 2"],
              ["sectionThreeTitle", "sectionThreeBody", "Blok 3"],
            ].map(([titleField, bodyField, label]) => (
              <div key={label} className="grid gap-4 rounded-[1.2rem] border border-slate-200 p-4">
                <div className="font-medium text-foreground">{label}</div>
                <div className="grid gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Baslik
                  </label>
                  <Input
                    value={activePage.content[titleField as keyof typeof activePage.content] as string}
                    onChange={(event) =>
                      updateField(titleField as keyof typeof activePage.content, event.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Metin
                  </label>
                  <Textarea
                    value={activePage.content[bodyField as keyof typeof activePage.content] as string}
                    onChange={(event) =>
                      updateField(bodyField as keyof typeof activePage.content, event.target.value)
                    }
                    rows={4}
                  />
                </div>
              </div>
            ))}

            <div className="grid gap-4 rounded-[1.2rem] border border-slate-200 p-4">
              <div className="font-medium text-foreground">One cikan maddeler</div>
              {activePage.content.bulletItems.map((item, index) => (
                <div key={`${activePage.slug}-bullet-${index}`} className="grid gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Madde {index + 1}
                  </label>
                  <Input
                    value={item}
                    onChange={(event) => updateBullet(index, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.6rem] border border-white/60 bg-white/80 p-5">
          <div className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
            FAQ
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                FAQ basligi
              </label>
              <Input
                value={activePage.content.faqTitle}
                onChange={(event) => updateField("faqTitle", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                FAQ aciklamasi
              </label>
              <Textarea
                value={activePage.content.faqDescription}
                onChange={(event) => updateField("faqDescription", event.target.value)}
                rows={3}
              />
            </div>
            {activePage.content.faqItems.map((item, index) => (
              <div key={`${activePage.slug}-faq-${index}`} className="grid gap-3 rounded-[1.2rem] border border-slate-200 p-4">
                <div className="font-medium text-foreground">Soru {index + 1}</div>
                <div className="grid gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Soru
                  </label>
                  <Input
                    value={item.question}
                    onChange={(event) => updateFaq(index, "question", event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Cevap
                  </label>
                  <Textarea
                    value={item.answer}
                    onChange={(event) => updateFaq(index, "answer", event.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.6rem] border border-white/60 bg-white/80 p-5 md:grid-cols-2">
          <div className="grid gap-4">
            <div className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
              CTA
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                CTA basligi
              </label>
              <Input
                value={activePage.content.ctaTitle}
                onChange={(event) => updateField("ctaTitle", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                CTA aciklamasi
              </label>
              <Textarea
                value={activePage.content.ctaDescription}
                onChange={(event) => updateField("ctaDescription", event.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Primary label
                </label>
                <Input
                  value={activePage.content.ctaPrimaryLabel}
                  onChange={(event) => updateField("ctaPrimaryLabel", event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Primary href
                </label>
                <Input
                  value={activePage.content.ctaPrimaryHref}
                  onChange={(event) => updateField("ctaPrimaryHref", event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Secondary label
                </label>
                <Input
                  value={activePage.content.ctaSecondaryLabel}
                  onChange={(event) => updateField("ctaSecondaryLabel", event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Secondary href
                </label>
                <Input
                  value={activePage.content.ctaSecondaryHref}
                  onChange={(event) => updateField("ctaSecondaryHref", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
              Lokasyon kutusu
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Lokasyon basligi
              </label>
              <Input
                value={activePage.content.locationTitle}
                onChange={(event) => updateField("locationTitle", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Lokasyon metni
              </label>
              <Textarea
                value={activePage.content.locationBody}
                onChange={(event) => updateField("locationBody", event.target.value)}
                rows={7}
              />
            </div>
          </div>
        </div>

          {state.error ? (
            <div className="rounded-[1.2rem] border border-rose-400/25 bg-rose-400/10 px-4 py-4 text-sm leading-6 text-rose-800">
              {state.error}
            </div>
          ) : null}
          {state.success ? (
            <div className="rounded-[1.2rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-4 text-sm leading-6 text-emerald-800">
              {state.success}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <FormSubmitButton className="min-w-[180px]">SEO sayfasini kaydet</FormSubmitButton>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const resetPage = initialPages.find((page) => page.slug === activePage.slug);

                if (resetPage) {
                  updatePage(clonePage(resetPage));
                }
              }}
            >
              Bu sayfayi sifirla
            </Button>
            <Button type="button" variant="ghost" onClick={() => setActiveSlug("")}>
              Alanlari gizle
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
