"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eye,
  FilePlus2,
  Globe,
  LayoutTemplate,
  Link2,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  createPublicPageAction,
  duplicatePublicPageAction,
  mutatePublicPageAction,
  updateGallerySettingsAction,
  updatePublicPageAction,
} from "@/app/(app)/admin/public-site/actions";
import { AdminLandingEditor } from "@/components/admin-landing-editor";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useListPagination } from "@/components/use-list-pagination";
import {
  buildPublicPageChecklist,
  getPublicPageStatusLabel,
  type CustomPublicPageContent,
  type CustomPublicPageTemplate,
  type PublicPageDetail,
  type PublicSiteChecklistItem,
  type PublicPageRecord,
} from "@/lib/public-site";
import type { SeoPageContent } from "@/lib/seo-pages";
import { cn } from "@/lib/utils";

type AdminPublicSiteCmsProps = {
  pages: PublicPageRecord[];
  storageError: string | null;
  initialPageId?: string;
};

type FlashState = {
  tone: "success" | "error";
  message: string;
} | null;

function cloneCustomPage(page: CustomPublicPageContent) {
  return JSON.parse(JSON.stringify(page)) as CustomPublicPageContent;
}

function cloneSeoPage(page: SeoPageContent) {
  return JSON.parse(JSON.stringify(page)) as SeoPageContent;
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

function ensureLength(values: string[], size: number) {
  return Array.from({ length: size }, (_, index) => values[index] ?? "");
}

function buildDuplicateSlug(pages: PublicPageRecord[], sourceSlug: string) {
  const slugs = new Set(pages.map((page) => page.slug));
  const baseSlug = `${sourceSlug}-kopya`;

  if (!slugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (slugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function getChecklistToneSummary(items: Array<{ tone: "ok" | "warn" }>) {
  const warnings = items.filter((item) => item.tone === "warn").length;
  const healthy = items.length - warnings;
  return { warnings, healthy };
}

function SectionEditor({
  sections,
  onChange,
  onAdd,
  onRemove,
}: {
  sections: CustomPublicPageContent["customSections"];
  onChange: (
    index: number,
    field: "eyebrow" | "title" | "body" | "style",
    value: string,
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Section block&apos;lari
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Custom public sayfalarda standart metin bloklarina ek olarak daha zengin sahne alanlari olusturun.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Sparkles className="h-4 w-4" />
          Block ekle
        </Button>
      </div>

      {sections.map((section, index) => (
        <div
          key={section.id}
          className="grid gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Block {index + 1}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
              <Trash2 className="h-4 w-4" />
              Kaldir
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={section.eyebrow ?? ""}
              onChange={(event) => onChange(index, "eyebrow", event.target.value)}
              placeholder="Kucuk ust etiket"
            />
            <Select
              value={section.style}
              onChange={(event) => onChange(index, "style", event.target.value)}
            >
              <option value="plain">Sade</option>
              <option value="highlight">Vurgulu</option>
              <option value="proof">Guven/Proof</option>
            </Select>
          </div>
          <Input
            value={section.title}
            onChange={(event) => onChange(index, "title", event.target.value)}
            placeholder="Block basligi"
          />
          <Textarea
            value={section.body}
            onChange={(event) => onChange(index, "body", event.target.value)}
            rows={4}
            placeholder="Block metni"
          />
        </div>
      ))}
    </div>
  );
}

export function AdminPublicSiteCms({
  pages,
  storageError,
  initialPageId,
}: AdminPublicSiteCmsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState<FlashState>(null);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(initialPageId || "home");
  const [activeDetail, setActiveDetail] = useState<PublicPageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createTemplate, setCreateTemplate] = useState<CustomPublicPageTemplate>("content");
  const [galleryPublished, setGalleryPublished] = useState(false);
  const [galleryIndexable, setGalleryIndexable] = useState(true);
  const [gallerySitemap, setGallerySitemap] = useState(true);
  const [seoDrafts, setSeoDrafts] = useState<Record<string, SeoPageContent>>({});
  const [customDrafts, setCustomDrafts] = useState<Record<string, CustomPublicPageContent>>({});

  const availableRoutes = useMemo(
    () => new Set(pages.map((page) => page.route)),
    [pages],
  );

  const filteredPages = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    if (!query) {
      return pages;
    }

    return pages.filter((page) =>
      `${page.title} ${page.slug} ${page.route} ${page.pageType}`
        .toLocaleLowerCase("tr-TR")
        .includes(query),
    );
  }, [pages, search]);
  const activePageIndex = filteredPages.findIndex((page) => page.id === activeId);
  const paginatedPages = useListPagination({
    items: filteredPages,
    pageSize: 8,
    resetKey: search,
    resetPage: activePageIndex >= 0 ? Math.floor(activePageIndex / 8) + 1 : 1,
  });

  const activeRecord =
    pages.find((page) => page.id === activeId) ?? pages.find((page) => page.id === "home") ?? null;
  const activeSeoDraft =
    activeRecord?.kind === "seo" ? seoDrafts[activeRecord.slug] ?? null : null;
  const activeCustomDraft =
    activeRecord?.kind === "custom" ? customDrafts[activeRecord.slug] ?? null : null;
  const activeLandingContent =
    activeDetail?.kind === "home" || activeDetail?.kind === "gallery" ? activeDetail.content : null;

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      if (!activeRecord) {
        setActiveDetail(null);
        setDetailError(null);
        setDetailLoading(false);
        return;
      }

      setDetailLoading(true);
      setDetailError(null);

      try {
        const response = await fetch(
          `/api/admin/public-site/page?identifier=${encodeURIComponent(activeRecord.id)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );
        const body = (await response.json().catch(() => null)) as
          | { detail?: PublicPageDetail; error?: string }
          | null;

        if (!response.ok || !body?.detail) {
          throw new Error(body?.error ?? "Sayfa detayi yuklenemedi.");
        }

        const detail = body.detail;

        if (!active) {
          return;
        }

        setActiveDetail(detail);

        if (detail.kind === "seo") {
          setSeoDrafts((current) => ({
            ...current,
            [detail.content.slug]: current[detail.content.slug] ?? cloneSeoPage(detail.content),
          }));
        }

        if (detail.kind === "custom") {
          setCustomDrafts((current) => ({
            ...current,
            [detail.content.slug]:
              current[detail.content.slug] ?? cloneCustomPage(detail.content),
          }));
        }

        if (detail.kind === "gallery") {
          setGalleryPublished(detail.content.galleryPage.published);
          setGalleryIndexable(detail.content.galleryPage.indexable);
          setGallerySitemap(detail.content.galleryPage.includeInSitemap);
        }
      } catch (loadError) {
        if (!active) {
          return;
        }
        setActiveDetail(null);
        setDetailError(loadError instanceof Error ? loadError.message : "Sayfa detayi yuklenemedi.");
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [activeRecord]);

  const checklist = useMemo(() => {
    if (!activeRecord) {
      return [];
    }

    if (activeRecord.kind === "seo" && activeSeoDraft) {
      return buildPublicPageChecklist(activeSeoDraft, { availableRoutes });
    }

    if (activeRecord.kind === "custom" && activeCustomDraft) {
      return buildPublicPageChecklist(activeCustomDraft, { availableRoutes });
    }

    if (activeRecord.kind === "gallery") {
      return [
        {
          id: "gallery-published",
          label: galleryPublished ? "Galeri yayinda" : "Galeri taslakta",
          tone: galleryPublished ? "ok" : "warn",
        },
        {
          id: "gallery-index",
          label: galleryIndexable ? "Galeri indexlenebilir" : "Galeri noindex",
          tone: galleryIndexable ? "ok" : "warn",
        },
        {
          id: "gallery-sitemap",
          label: gallerySitemap ? "Galeri sitemap'te" : "Galeri sitemap disi",
          tone: gallerySitemap ? "ok" : "warn",
        },
      ] satisfies PublicSiteChecklistItem[];
    }

    return [
      { id: "home-system", label: "Anasayfa sistem sayfasi", tone: "ok" },
      { id: "home-route", label: "Route sabit ve korumali", tone: "ok" },
      { id: "home-cms", label: "Anasayfa ayni vitrin editoru ile yonetilir", tone: "ok" },
    ] satisfies PublicSiteChecklistItem[];
  }, [activeCustomDraft, activeRecord, activeSeoDraft, availableRoutes, galleryIndexable, galleryPublished, gallerySitemap]);

  const checklistSummary = getChecklistToneSummary(checklist);

  function runAction(task: () => Promise<{ error: string | null; success: string | null }>) {
    startTransition(async () => {
      const result = await task();
      setFlash(
        result.error
          ? { tone: "error", message: result.error }
          : result.success
            ? { tone: "success", message: result.success }
            : null,
      );
      if (!result.error) {
        router.refresh();
      }
    });
  }

  function handleCreatePage() {
    const formData = new FormData();
    formData.set("title", createTitle);
    formData.set("slug", createSlug);
    formData.set("template", createTemplate);

    runAction(async () => {
      const result = await createPublicPageAction(formData);
      if (!result.error) {
        setCreateTitle("");
        setCreateSlug("");
      }
      return result;
    });
  }

  function handleSavePage(kind: "seo" | "custom", slug: string, content: unknown) {
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("slug", slug);
    formData.set("content", JSON.stringify(content));
    runAction(() => updatePublicPageAction(formData));
  }

  function handleMutatePage(
    kind: "gallery" | "seo" | "custom",
    slug: string,
    intent: "publish" | "unpublish" | "archive" | "delete",
  ) {
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("slug", slug);
    formData.set("intent", intent);
    runAction(() => mutatePublicPageAction(formData));
  }

  function handleSaveGallerySettings() {
    const formData = new FormData();
    formData.set("published", galleryPublished ? "yes" : "no");
    formData.set("indexable", galleryIndexable ? "yes" : "no");
    formData.set("includeInSitemap", gallerySitemap ? "yes" : "no");
    runAction(() => updateGallerySettingsAction(formData));
  }

  function handleDuplicatePage(kind: "seo" | "custom", slug: string, title: string) {
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("sourceSlug", slug);
    formData.set("targetSlug", buildDuplicateSlug(pages, slug));
    formData.set("title", `${title} Kopya`);
    runAction(() => duplicatePublicPageAction(formData));
  }

  function updateSeoField(
    slug: string,
    field: keyof SeoPageContent,
    value: SeoPageContent[keyof SeoPageContent],
  ) {
    setSeoDrafts((current) => ({
      ...current,
      [slug]: {
        ...current[slug],
        [field]: value,
      },
    }));
  }

  function updateCustomField(
    slug: string,
    field: keyof CustomPublicPageContent,
    value: CustomPublicPageContent[keyof CustomPublicPageContent],
  ) {
    setCustomDrafts((current) => ({
      ...current,
      [slug]: {
        ...current[slug],
        [field]: value,
      },
    }));
  }

  function updateBullet(kind: "seo" | "custom", slug: string, index: number, value: string) {
    if (kind === "seo") {
      const current = seoDrafts[slug];
      if (!current) return;
      updateSeoField(
        slug,
        "bulletItems",
        ensureLength(current.bulletItems, 4).map((item, itemIndex) =>
          itemIndex === index ? value : item,
        ),
      );
      return;
    }

    const current = customDrafts[slug];
    if (!current) return;
    updateCustomField(
      slug,
      "bulletItems",
      ensureLength(current.bulletItems, 4).map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    );
  }

  function updateFaq(
    kind: "seo" | "custom",
    slug: string,
    index: number,
    field: "question" | "answer",
    value: string,
  ) {
    if (kind === "seo") {
      const current = seoDrafts[slug];
      if (!current) return;
      updateSeoField(
        slug,
        "faqItems",
        current.faqItems.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      );
      return;
    }

    const current = customDrafts[slug];
    if (!current) return;
    updateCustomField(
      slug,
      "faqItems",
      current.faqItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function updateInternalLink(
    kind: "seo" | "custom",
    slug: string,
    index: number,
    field: "label" | "href",
    value: string,
  ) {
    if (kind === "seo") {
      const current = seoDrafts[slug];
      if (!current) return;
      updateSeoField(
        slug,
        "internalLinks",
        (current.internalLinks ?? []).map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      );
      return;
    }

    const current = customDrafts[slug];
    if (!current) return;
    updateCustomField(
      slug,
      "internalLinks",
      (current.internalLinks ?? []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addInternalLink(kind: "seo" | "custom", slug: string) {
    if (kind === "seo") {
      const current = seoDrafts[slug];
      if (!current) return;
      updateSeoField(slug, "internalLinks", [...(current.internalLinks ?? []), { label: "", href: "" }]);
      return;
    }

    const current = customDrafts[slug];
    if (!current) return;
    updateCustomField(slug, "internalLinks", [...(current.internalLinks ?? []), { label: "", href: "" }]);
  }

  function removeInternalLink(kind: "seo" | "custom", slug: string, index: number) {
    if (kind === "seo") {
      const current = seoDrafts[slug];
      if (!current) return;
      updateSeoField(
        slug,
        "internalLinks",
        (current.internalLinks ?? []).filter((_, itemIndex) => itemIndex !== index),
      );
      return;
    }

    const current = customDrafts[slug];
    if (!current) return;
    updateCustomField(
      slug,
      "internalLinks",
      (current.internalLinks ?? []).filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function addCustomSection(slug: string) {
    const current = customDrafts[slug];
    if (!current) return;
    updateCustomField(slug, "customSections", [
      ...(current.customSections ?? []),
      {
        id: `${slug}-blok-${(current.customSections?.length ?? 0) + 1}`,
        eyebrow: "",
        title: "",
        body: "",
        style: "plain",
      },
    ]);
  }

  function updateCustomSection(
    slug: string,
    index: number,
    field: "eyebrow" | "title" | "body" | "style",
    value: string,
  ) {
    const current = customDrafts[slug];
    if (!current) return;
    updateCustomField(
      slug,
      "customSections",
      (current.customSections ?? []).map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    );
  }

  function removeCustomSection(slug: string, index: number) {
    const current = customDrafts[slug];
    if (!current) return;
    updateCustomField(
      slug,
      "customSections",
      (current.customSections ?? []).filter((_, sectionIndex) => sectionIndex !== index),
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="page-surface rounded-[2rem] px-5 py-5">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
            <LayoutTemplate className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Public Site</div>
            <div className="text-xl font-black text-slate-900">Sayfa Envanteri</div>
          </div>
        </div>

        {storageError ? (
          <div className="mt-4 rounded-[1.2rem] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {storageError}
          </div>
        ) : null}

        <div className="mt-5 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Yeni sayfa</div>
          <div className="mt-3 grid gap-3">
            <Input value={createTitle} onChange={(event) => setCreateTitle(event.target.value)} placeholder="Sayfa basligi" />
            <Input value={createSlug} onChange={(event) => setCreateSlug(event.target.value)} placeholder="ornek-route" />
            <Select value={createTemplate} onChange={(event) => setCreateTemplate(event.target.value as CustomPublicPageTemplate)}>
              <option value="content">Icerik</option>
              <option value="service">Hizmet</option>
              <option value="guide">Rehber</option>
              <option value="campaign">Kampanya</option>
            </Select>
            <Button type="button" onClick={handleCreatePage} disabled={isPending || !createTitle || !createSlug}>
              <FilePlus2 className="h-4 w-4" />
              Sayfayi olustur
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-11"
              placeholder="Route, slug veya baslik ara"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {paginatedPages.pageItems.map((page) => {
            const isActive = activeRecord?.id === page.id;
            const mutationKind =
              page.kind === "gallery" || page.kind === "seo" || page.kind === "custom"
                ? page.kind
                : null;
            const duplicateKind =
              page.kind === "seo" || page.kind === "custom" ? page.kind : null;

            return (
              <article
                key={page.id}
                className={cn(
                  "rounded-[1.3rem] border p-4 transition-all",
                  isActive
                    ? "border-primary/25 bg-primary/5 shadow-[0_16px_30px_rgba(20,86,215,0.08)]"
                    : "border-slate-200 bg-white",
                )}
              >
                <button type="button" onClick={() => setActiveId(page.id)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900">{page.title}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {page.route} · {page.pageType}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
                        page.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : page.status === "archived"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-50 text-amber-700",
                      )}
                    >
                      {getPublicPageStatusLabel(page.status)}
                    </span>
                  </div>
                </button>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setActiveId(page.id)}>
                    Duzenle
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={page.previewHref} target="_blank" rel="noreferrer">
                      <Eye className="h-3.5 w-3.5" />
                      Onizle
                    </a>
                  </Button>
                  {mutationKind ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleMutatePage(
                          mutationKind,
                          page.slug,
                          page.published ? "unpublish" : "publish",
                        )
                      }
                      disabled={isPending}
                    >
                      {page.published ? "Taslak" : "Yayina al"}
                    </Button>
                  ) : null}
                  {duplicateKind ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicatePage(duplicateKind, page.slug, page.title)}
                      disabled={isPending}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Kopyala
                    </Button>
                  ) : null}
                  {duplicateKind && page.deletable ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => handleMutatePage(duplicateKind, page.slug, "delete")}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Sil
                    </Button>
                  ) : null}
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  {page.updatedBy ? `${page.updatedBy} · ` : ""}
                  {formatUpdatedAt(page.updatedAt)}
                </div>
              </article>
            );
          })}
          {!filteredPages.length ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Bu arama ile eslesen public sayfa yok.
            </div>
          ) : null}
        </div>
        {filteredPages.length ? (
          <PaginationControls
            className="mt-4"
            itemLabel="sayfa"
            onPageChange={paginatedPages.setPage}
            page={paginatedPages.page}
            pageCount={paginatedPages.pageCount}
            pageSize={paginatedPages.pageSize}
            totalItems={paginatedPages.totalItems}
          />
        ) : null}
      </aside>

      <section className="page-surface rounded-[2rem] px-6 py-6">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Sayfa editoru
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                {activeRecord?.title ?? "Public sayfa secin"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                {activeRecord
                  ? `${activeRecord.route} route'u uzerinden yayinlanan public sayfayi buradan yonetin.`
                  : "Soldaki envanterden bir public sayfa secin."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {flash ? (
                <div
                  className={cn(
                    "rounded-[1.2rem] px-4 py-3 text-sm font-medium",
                    flash.tone === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700",
                  )}
                >
                  {flash.message}
                </div>
              ) : null}
              {activeRecord ? (
                <Button asChild variant="outline">
                  <a href={activeRecord.previewHref} target="_blank" rel="noreferrer">
                    <Eye className="h-4 w-4" />
                    Sayfayi ac
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          {activeRecord ? (
            <div className="mt-6 grid gap-4 rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9ff_100%)] p-5">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                <div className="grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                      {activeRecord.route}
                    </span>
                    <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
                      {getPublicPageStatusLabel(activeRecord.status)}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
                      {activeRecord.pageType}
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-white bg-white/90 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Checklist
                      </div>
                      <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                        {checklistSummary.healthy}/{checklist.length}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">hazir kontrol</div>
                    </div>
                    <div className="rounded-[1.2rem] border border-white bg-white/90 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Uyari
                      </div>
                      <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                        {checklistSummary.warnings}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">duzeltilmesi gereken alan</div>
                    </div>
                    <div className="rounded-[1.2rem] border border-white bg-white/90 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Son guncelleme
                      </div>
                      <div className="mt-2 text-sm font-bold text-slate-900">
                        {formatUpdatedAt(activeRecord.updatedAt)}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {activeRecord.updatedBy ? activeRecord.updatedBy : "Sistem / varsayilan"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        CMS Checklist
                      </div>
                      <div className="text-xl font-black text-slate-900">Yayin kontrolu</div>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "rounded-[1.15rem] border px-4 py-3 text-sm",
                          item.tone === "ok"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-800",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {item.tone === "ok" ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          ) : (
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold">{item.label}</div>
                            {item.detail ? (
                              <div className="mt-1 text-xs leading-6 opacity-80">{item.detail}</div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {activeRecord?.kind === "home" ? (
          <Tabs key="home-editor" defaultValue="content" className="mt-6">
            <TabsList>
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="content">Icerik</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-4">
              <div className="grid gap-4 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm leading-7 text-slate-600">
                  Anasayfa sistem sayfasidir. Hero, guven bloklari, testimonial, galeri rail ve CTA alani ayni landing dokumani icinde yonetilir.
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1.2rem] border border-white bg-white px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Route</div>
                    <div className="mt-2 font-bold text-slate-900">/</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-white bg-white px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Tip</div>
                    <div className="mt-2 font-bold text-slate-900">Sistem / Landing</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-white bg-white px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Yayin</div>
                    <div className="mt-2 font-bold text-slate-900">Her zaman acik</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="content" className="mt-4">
              {detailLoading ? (
                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  Anasayfa editoru yukleniyor...
                </div>
              ) : detailError ? (
                <div className="rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
                  {detailError}
                </div>
              ) : activeLandingContent ? (
                <AdminLandingEditor
                  initialContent={activeLandingContent}
                  updatedAt={activeRecord?.updatedAt ?? null}
                  storageError={storageError}
                  initialTab="brand"
                />
              ) : null}
            </TabsContent>
          </Tabs>
        ) : null}

        {activeRecord?.kind === "gallery" ? (
          <Tabs key="gallery-editor" defaultValue="content" className="mt-6">
            <TabsList>
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="content">Icerik</TabsTrigger>
              <TabsTrigger value="publish">Yayin</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-4">
              <div className="rounded-[1.6rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-800">
                Galeri; tesis, branş ve atmosfer görsellerini toplar. Anasayfadaki medya rail sadece `featured + published` öğeleri kullanır.
              </div>
            </TabsContent>
            <TabsContent value="content" className="mt-4">
              {detailLoading ? (
                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  Galeri editoru yukleniyor...
                </div>
              ) : detailError ? (
                <div className="rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
                  {detailError}
                </div>
              ) : activeLandingContent ? (
                <AdminLandingEditor
                  initialContent={activeLandingContent}
                  updatedAt={activeRecord?.updatedAt ?? null}
                  storageError={storageError}
                  initialTab="gallery"
                />
              ) : null}
            </TabsContent>
            <TabsContent value="publish" className="mt-4">
              <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 md:grid-cols-3">
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <span>Galeri yayinda</span>
                  <input type="checkbox" checked={galleryPublished} onChange={(event) => setGalleryPublished(event.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <span>Indexlenebilir</span>
                  <input type="checkbox" checked={galleryIndexable} onChange={(event) => setGalleryIndexable(event.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <span>Sitemap&apos;te goster</span>
                  <input type="checkbox" checked={gallerySitemap} onChange={(event) => setGallerySitemap(event.target.checked)} />
                </label>
                <div className="md:col-span-3">
                  <Button type="button" onClick={handleSaveGallerySettings} disabled={isPending}>
                    Galeri yayin ayarlarini kaydet
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        {activeRecord?.kind === "seo" && detailLoading ? (
          <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            SEO sayfa editoru yukleniyor...
          </div>
        ) : null}

        {activeRecord?.kind === "seo" && detailError ? (
          <div className="mt-6 rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
            {detailError}
          </div>
        ) : null}

        {activeRecord?.kind === "seo" && activeSeoDraft ? (
          <Tabs key={`seo-${activeRecord.slug}`} defaultValue="general" className="mt-6">
            <TabsList>
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="content">Icerik</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="cta">CTA</TabsTrigger>
              <TabsTrigger value="links">Ic Linkler</TabsTrigger>
              <TabsTrigger value="publish">Yayin</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Baslik</label>
                <Input value={activeSeoDraft.title} onChange={(event) => updateSeoField(activeSeoDraft.slug, "title", event.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Slug</label>
                <Input value={activeSeoDraft.slug} readOnly />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sayfa tipi</label>
                <Select value={activeSeoDraft.pageType} onChange={(event) => updateSeoField(activeSeoDraft.slug, "pageType", event.target.value)}>
                  <option value="service">Service</option>
                  <option value="brand">Brand</option>
                  <option value="contact">Contact</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Canonical</label>
                <Input value={activeSeoDraft.canonicalPath} onChange={(event) => updateSeoField(activeSeoDraft.slug, "canonicalPath", event.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Target location</label>
                <Input value={activeSeoDraft.targetLocation ?? ""} onChange={(event) => updateSeoField(activeSeoDraft.slug, "targetLocation", event.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Target brans</label>
                <Input value={activeSeoDraft.targetBranch ?? ""} onChange={(event) => updateSeoField(activeSeoDraft.slug, "targetBranch", event.target.value)} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Target yas grubu</label>
                <Input value={activeSeoDraft.targetAgeGroup ?? ""} onChange={(event) => updateSeoField(activeSeoDraft.slug, "targetAgeGroup", event.target.value)} />
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-4 grid gap-4">
              <Input value={activeSeoDraft.heroEyebrow} onChange={(event) => updateSeoField(activeSeoDraft.slug, "heroEyebrow", event.target.value)} placeholder="Hero eyebrow" />
              <Textarea value={activeSeoDraft.heroTitle} onChange={(event) => updateSeoField(activeSeoDraft.slug, "heroTitle", event.target.value)} rows={2} placeholder="Hero baslik" />
              <Textarea value={activeSeoDraft.heroDescription} onChange={(event) => updateSeoField(activeSeoDraft.slug, "heroDescription", event.target.value)} rows={4} placeholder="Hero aciklama" />
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["introTitle", "Giris basligi"],
                  ["sectionOneTitle", "Bolum 1 basligi"],
                  ["sectionTwoTitle", "Bolum 2 basligi"],
                  ["sectionThreeTitle", "Bolum 3 basligi"],
                ].map(([field, label]) => (
                  <div key={field} className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
                    <Input value={activeSeoDraft[field as keyof typeof activeSeoDraft] as string} onChange={(event) => updateSeoField(activeSeoDraft.slug, field as keyof SeoPageContent, event.target.value)} />
                  </div>
                ))}
                {[
                  ["introBody", "Giris metni"],
                  ["sectionOneBody", "Bolum 1 metni"],
                  ["sectionTwoBody", "Bolum 2 metni"],
                  ["sectionThreeBody", "Bolum 3 metni"],
                ].map(([field, label]) => (
                  <div key={field} className="grid gap-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
                    <Textarea value={activeSeoDraft[field as keyof typeof activeSeoDraft] as string} onChange={(event) => updateSeoField(activeSeoDraft.slug, field as keyof SeoPageContent, event.target.value)} rows={4} />
                  </div>
                ))}
              </div>
              <div className="grid gap-3">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Madde bloklari</div>
                {ensureLength(activeSeoDraft.bulletItems, 4).map((item, index) => (
                  <Input key={`${activeSeoDraft.slug}-bullet-${index}`} value={item} onChange={(event) => updateBullet("seo", activeSeoDraft.slug, index, event.target.value)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-4 grid gap-4">
              <Input value={activeSeoDraft.seoTitle} onChange={(event) => updateSeoField(activeSeoDraft.slug, "seoTitle", event.target.value)} placeholder="SEO title" />
              <Textarea value={activeSeoDraft.metaDescription} onChange={(event) => updateSeoField(activeSeoDraft.slug, "metaDescription", event.target.value)} rows={3} placeholder="Meta description" />
              <div className="grid gap-2 md:grid-cols-2">
                <Input value={activeSeoDraft.faqTitle} onChange={(event) => updateSeoField(activeSeoDraft.slug, "faqTitle", event.target.value)} placeholder="SSS basligi" />
                <Input value={activeSeoDraft.faqDescription} onChange={(event) => updateSeoField(activeSeoDraft.slug, "faqDescription", event.target.value)} placeholder="SSS aciklamasi" />
              </div>
              {activeSeoDraft.faqItems.map((item, index) => (
                <div key={`${activeSeoDraft.slug}-faq-${index}`} className="grid gap-2 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                  <Input value={item.question} onChange={(event) => updateFaq("seo", activeSeoDraft.slug, index, "question", event.target.value)} placeholder={`Soru ${index + 1}`} />
                  <Textarea value={item.answer} onChange={(event) => updateFaq("seo", activeSeoDraft.slug, index, "answer", event.target.value)} rows={3} placeholder={`Cevap ${index + 1}`} />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="cta" className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["ctaTitle", "CTA basligi"],
                ["ctaPrimaryLabel", "Primary buton"],
                ["ctaPrimaryHref", "Primary href"],
                ["ctaSecondaryLabel", "Secondary buton"],
                ["ctaSecondaryHref", "Secondary href"],
                ["locationTitle", "Lokasyon basligi"],
                ["testimonialAuthor", "Yorum sahibi"],
                ["testimonialRole", "Yorum baglami"],
              ].map(([field, label]) => (
                <div key={field} className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
                  <Input value={(activeSeoDraft[field as keyof typeof activeSeoDraft] as string) ?? ""} onChange={(event) => updateSeoField(activeSeoDraft.slug, field as keyof SeoPageContent, event.target.value)} />
                </div>
              ))}
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">CTA aciklamasi</label>
                <Textarea value={activeSeoDraft.ctaDescription} onChange={(event) => updateSeoField(activeSeoDraft.slug, "ctaDescription", event.target.value)} rows={3} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Lokasyon govdesi</label>
                <Textarea value={activeSeoDraft.locationBody} onChange={(event) => updateSeoField(activeSeoDraft.slug, "locationBody", event.target.value)} rows={3} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Yorum metni</label>
                <Textarea value={activeSeoDraft.testimonialQuote ?? ""} onChange={(event) => updateSeoField(activeSeoDraft.slug, "testimonialQuote", event.target.value)} rows={4} />
              </div>
            </TabsContent>

            <TabsContent value="links" className="mt-4 grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Ic linkler</div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Sistem artik her linki mevcut public route envanteri ile dogruluyor.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => addInternalLink("seo", activeSeoDraft.slug)}>
                  <Link2 className="h-4 w-4" />
                  Link ekle
                </Button>
              </div>
              {(activeSeoDraft.internalLinks ?? []).map((item, index) => (
                <div key={`${activeSeoDraft.slug}-link-${index}`} className="grid gap-2 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]">
                  <Input value={item.label} onChange={(event) => updateInternalLink("seo", activeSeoDraft.slug, index, "label", event.target.value)} placeholder="Link etiketi" />
                  <Input value={item.href} onChange={(event) => updateInternalLink("seo", activeSeoDraft.slug, index, "href", event.target.value)} placeholder="/ornek-sayfa" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeInternalLink("seo", activeSeoDraft.slug, index)}>
                    Kaldir
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="publish" className="mt-4 grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Indexlenebilir</span>
                  <input type="checkbox" checked={activeSeoDraft.indexable !== false} onChange={(event) => updateSeoField(activeSeoDraft.slug, "indexable", event.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Sitemap&apos;te goster</span>
                  <input type="checkbox" checked={activeSeoDraft.includeInSitemap !== false} onChange={(event) => updateSeoField(activeSeoDraft.slug, "includeInSitemap", event.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Yayinda</span>
                  <input type="checkbox" checked={activeSeoDraft.published} onChange={(event) => updateSeoField(activeSeoDraft.slug, "published", event.target.checked)} />
                </label>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <Button type="button" onClick={() => handleSavePage("seo", activeRecord.slug, activeSeoDraft)} disabled={isPending}>
                  <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                  Sayfayi kaydet
                </Button>
                <Button type="button" variant="secondary" onClick={() => handleMutatePage("seo", activeRecord.slug, activeSeoDraft.published ? "unpublish" : "publish")} disabled={isPending}>
                  {activeSeoDraft.published ? "Taslak yap" : "Yayina al"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        {activeRecord?.kind === "custom" && detailLoading ? (
          <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            Custom sayfa editoru yukleniyor...
          </div>
        ) : null}

        {activeRecord?.kind === "custom" && detailError ? (
          <div className="mt-6 rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
            {detailError}
          </div>
        ) : null}

        {activeRecord?.kind === "custom" && activeCustomDraft ? (
          <Tabs key={`custom-${activeRecord.slug}`} defaultValue="general" className="mt-6">
            <TabsList>
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="content">Icerik</TabsTrigger>
              <TabsTrigger value="blocks">Section</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="cta">CTA</TabsTrigger>
              <TabsTrigger value="links">Ic Linkler</TabsTrigger>
              <TabsTrigger value="publish">Yayin</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Baslik</label>
                <Input value={activeCustomDraft.title} onChange={(event) => updateCustomField(activeCustomDraft.slug, "title", event.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Slug</label>
                <Input value={activeCustomDraft.slug} onChange={(event) => updateCustomField(activeCustomDraft.slug, "slug", event.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sablon</label>
                <Select value={activeCustomDraft.template} onChange={(event) => updateCustomField(activeCustomDraft.slug, "template", event.target.value as CustomPublicPageTemplate)}>
                  <option value="content">Icerik</option>
                  <option value="service">Hizmet</option>
                  <option value="guide">Rehber</option>
                  <option value="campaign">Kampanya</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sayfa tipi</label>
                <Select value={activeCustomDraft.pageType} onChange={(event) => updateCustomField(activeCustomDraft.slug, "pageType", event.target.value)}>
                  <option value="service">Service</option>
                  <option value="brand">Brand</option>
                  <option value="contact">Contact</option>
                </Select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Canonical</label>
                <Input value={activeCustomDraft.canonicalPath} onChange={(event) => updateCustomField(activeCustomDraft.slug, "canonicalPath", event.target.value)} />
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-4 grid gap-4">
              <Input value={activeCustomDraft.heroEyebrow} onChange={(event) => updateCustomField(activeCustomDraft.slug, "heroEyebrow", event.target.value)} placeholder="Hero ust etiket" />
              <Textarea value={activeCustomDraft.heroTitle} onChange={(event) => updateCustomField(activeCustomDraft.slug, "heroTitle", event.target.value)} rows={2} placeholder="Hero baslik" />
              <Textarea value={activeCustomDraft.heroDescription} onChange={(event) => updateCustomField(activeCustomDraft.slug, "heroDescription", event.target.value)} rows={4} placeholder="Hero aciklama" />
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["introTitle", "Giris basligi"],
                  ["sectionOneTitle", "Bolum 1 basligi"],
                  ["sectionTwoTitle", "Bolum 2 basligi"],
                  ["sectionThreeTitle", "Bolum 3 basligi"],
                ].map(([field, label]) => (
                  <div key={field} className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
                    <Input value={activeCustomDraft[field as keyof typeof activeCustomDraft] as string} onChange={(event) => updateCustomField(activeCustomDraft.slug, field as keyof CustomPublicPageContent, event.target.value)} />
                  </div>
                ))}
                {[
                  ["introBody", "Giris metni"],
                  ["sectionOneBody", "Bolum 1 metni"],
                  ["sectionTwoBody", "Bolum 2 metni"],
                  ["sectionThreeBody", "Bolum 3 metni"],
                ].map(([field, label]) => (
                  <div key={field} className="grid gap-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
                    <Textarea value={activeCustomDraft[field as keyof typeof activeCustomDraft] as string} onChange={(event) => updateCustomField(activeCustomDraft.slug, field as keyof CustomPublicPageContent, event.target.value)} rows={4} />
                  </div>
                ))}
              </div>
              <div className="grid gap-3">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Madde bloklari</div>
                {ensureLength(activeCustomDraft.bulletItems, 4).map((item, index) => (
                  <Input key={`${activeCustomDraft.slug}-bullet-${index}`} value={item} onChange={(event) => updateBullet("custom", activeCustomDraft.slug, index, event.target.value)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="blocks" className="mt-4">
              <SectionEditor
                sections={activeCustomDraft.customSections ?? []}
                onAdd={() => addCustomSection(activeCustomDraft.slug)}
                onRemove={(index) => removeCustomSection(activeCustomDraft.slug, index)}
                onChange={(index, field, value) => updateCustomSection(activeCustomDraft.slug, index, field, value)}
              />
            </TabsContent>

            <TabsContent value="seo" className="mt-4 grid gap-4">
              <Input value={activeCustomDraft.seoTitle} onChange={(event) => updateCustomField(activeCustomDraft.slug, "seoTitle", event.target.value)} placeholder="SEO title" />
              <Textarea value={activeCustomDraft.metaDescription} onChange={(event) => updateCustomField(activeCustomDraft.slug, "metaDescription", event.target.value)} rows={3} placeholder="Meta description" />
              <div className="grid gap-2 md:grid-cols-2">
                <Input value={activeCustomDraft.faqTitle} onChange={(event) => updateCustomField(activeCustomDraft.slug, "faqTitle", event.target.value)} placeholder="SSS basligi" />
                <Input value={activeCustomDraft.faqDescription} onChange={(event) => updateCustomField(activeCustomDraft.slug, "faqDescription", event.target.value)} placeholder="SSS aciklamasi" />
              </div>
              {activeCustomDraft.faqItems.map((item, index) => (
                <div key={`${activeCustomDraft.slug}-faq-${index}`} className="grid gap-2 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                  <Input value={item.question} onChange={(event) => updateFaq("custom", activeCustomDraft.slug, index, "question", event.target.value)} placeholder={`Soru ${index + 1}`} />
                  <Textarea value={item.answer} onChange={(event) => updateFaq("custom", activeCustomDraft.slug, index, "answer", event.target.value)} rows={3} placeholder={`Cevap ${index + 1}`} />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="cta" className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["ctaTitle", "CTA basligi"],
                ["ctaPrimaryLabel", "Primary buton"],
                ["ctaPrimaryHref", "Primary href"],
                ["ctaSecondaryLabel", "Secondary buton"],
                ["ctaSecondaryHref", "Secondary href"],
                ["locationTitle", "Lokasyon basligi"],
                ["targetLocation", "Target location"],
                ["targetBranch", "Target brans"],
                ["targetAgeGroup", "Target yas grubu"],
                ["testimonialAuthor", "Yorum sahibi"],
                ["testimonialRole", "Yorum baglami"],
              ].map(([field, label]) => (
                <div key={field} className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
                  <Input value={(activeCustomDraft[field as keyof typeof activeCustomDraft] as string) ?? ""} onChange={(event) => updateCustomField(activeCustomDraft.slug, field as keyof CustomPublicPageContent, event.target.value)} />
                </div>
              ))}
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">CTA aciklamasi</label>
                <Textarea value={activeCustomDraft.ctaDescription} onChange={(event) => updateCustomField(activeCustomDraft.slug, "ctaDescription", event.target.value)} rows={3} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Lokasyon govdesi</label>
                <Textarea value={activeCustomDraft.locationBody} onChange={(event) => updateCustomField(activeCustomDraft.slug, "locationBody", event.target.value)} rows={3} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Yorum metni</label>
                <Textarea value={activeCustomDraft.testimonialQuote ?? ""} onChange={(event) => updateCustomField(activeCustomDraft.slug, "testimonialQuote", event.target.value)} rows={4} />
              </div>
            </TabsContent>

            <TabsContent value="links" className="mt-4 grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Ic linkler</div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Yalnizca sistemde var olan route&apos;lara baglanin. Kırık linkler yukaridaki kontrol bandinda aninda gorunur.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => addInternalLink("custom", activeCustomDraft.slug)}>
                  <Link2 className="h-4 w-4" />
                  Link ekle
                </Button>
              </div>
              {(activeCustomDraft.internalLinks ?? []).map((item, index) => (
                <div key={`${activeCustomDraft.slug}-link-${index}`} className="grid gap-2 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]">
                  <Input value={item.label} onChange={(event) => updateInternalLink("custom", activeCustomDraft.slug, index, "label", event.target.value)} placeholder="Link etiketi" />
                  <Input value={item.href} onChange={(event) => updateInternalLink("custom", activeCustomDraft.slug, index, "href", event.target.value)} placeholder="/ornek-sayfa" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeInternalLink("custom", activeCustomDraft.slug, index)}>
                    Kaldir
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="publish" className="mt-4 grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Indexlenebilir</span>
                  <input type="checkbox" checked={activeCustomDraft.indexable} onChange={(event) => updateCustomField(activeCustomDraft.slug, "indexable", event.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Sitemap&apos;te goster</span>
                  <input type="checkbox" checked={activeCustomDraft.includeInSitemap} onChange={(event) => updateCustomField(activeCustomDraft.slug, "includeInSitemap", event.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Yayinda</span>
                  <input type="checkbox" checked={activeCustomDraft.published} onChange={(event) => updateCustomField(activeCustomDraft.slug, "published", event.target.checked)} />
                </label>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                <Button type="button" onClick={() => handleSavePage("custom", activeRecord.slug, activeCustomDraft)} disabled={isPending}>
                  <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                  Sayfayi kaydet
                </Button>
                <Button type="button" variant="secondary" onClick={() => handleMutatePage("custom", activeRecord.slug, activeCustomDraft.published ? "unpublish" : "publish")} disabled={isPending}>
                  {activeCustomDraft.published ? "Taslak yap" : "Yayina al"}
                </Button>
                <Button type="button" variant="ghost" className="text-slate-600" onClick={() => handleMutatePage("custom", activeRecord.slug, "archive")} disabled={isPending}>
                  Arsivle
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        <div className="mt-6 rounded-[1.4rem] bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)] p-5 text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-sky-300" />
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">Tek merkez</div>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/78">
            Landing, galeri, SEO ve yeni custom sayfalar ayni envanter uzerinden yonetilir. Checklist sag sutunda sikismak yerine editorun ustunde karar bandi olarak calisir.
          </p>
        </div>
      </section>
    </div>
  );
}
