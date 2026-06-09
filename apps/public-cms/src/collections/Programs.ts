import type { CollectionConfig } from "payload";
import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";
import { createPublishingHook, createRouteRegistryHook, sharedSeoFields, workflowField } from "../lib/publicSite.ts";
import { toPublicSitePath } from "../lib/routes.ts";

export const Programs: CollectionConfig = {
  slug: "programs",
  labels: {
    plural: "Programlar",
    singular: "Program",
  },
  admin: {
    hidden: hideFromFormTracker,
    components: {
      edit: {
        beforeDocumentControls: [
          {
            path: "/components/admin/DecisionBand#DecisionBand",
            serverProps: { source: "programs" },
          },
        ],
      },
    },
    defaultColumns: ["title", "availabilityStatus", "workflowStatus", "audience", "updatedAt", "_status"],
    description: "Sitede yayınlanan seyahat, kamp ve atölye programlarını yönetin.",
    group: "İçerik Varlıkları",
    livePreview: {
      url: ({ data }) => `${toPublicSitePath(`/programlar/${data.slug || ""}`)}?preview=true`,
    },
    useAsTitle: "title",
  },
  access: {
    create: ({ req }) => canManageContent(req.user),
    delete: ({ req }) => canManageContent(req.user),
    read: () => true,
    update: ({ req }) => canManageContent(req.user),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [createRouteRegistryHook("programs"), createPublishingHook("programs")],
  },
  fields: [
    workflowField,
    {
      name: "title",
      label: "Program başlığı",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "availabilityStatus",
      label: "Durum",
      type: "select",
      defaultValue: "open",
      required: true,
      options: [
        { label: "Başvuru açık", value: "open" },
        { label: "Yakında", value: "soon" },
        { label: "Kontenjan doldu", value: "full" },
        { label: "Taslak", value: "draft" },
      ],
    },
    {
      name: "summary",
      label: "Kısa özet",
      type: "textarea",
      required: true,
    },
    {
      name: "category",
      label: "Kategori",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "location",
      label: "Lokasyon",
      type: "relationship",
      relationTo: "locations",
    },
    {
      name: "region",
      label: "Bölge türü",
      type: "select",
      defaultValue: "domestic",
      required: true,
      options: [
        { label: "Yurt içi", value: "domestic" },
        { label: "Yurt dışı", value: "international" },
      ],
    },
    {
      name: "audience",
      label: "Yaş grubu",
      type: "text",
      required: true,
    },
    {
      name: "season",
      label: "Sezon",
      type: "text",
    },
    {
      name: "featured",
      label: "Öne çıkar",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "price",
      label: "Fiyat bilgisi",
      type: "group",
      fields: [
        {
          name: "showPrice",
          label: "Fiyatı göster",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "label",
          label: "Fiyat etiketi",
          type: "text",
          defaultValue: "Bilgi almak için iletişime geçin",
        },
        {
          name: "amount",
          label: "Başlangıç fiyatı",
          type: "number",
          min: 0,
        },
      ],
    },
    {
      name: "dates",
      label: "Tarih oturumları",
      type: "array",
      fields: [
        {
          name: "label",
          label: "Tarih etiketi",
          type: "text",
          required: true,
        },
        {
          name: "capacityStatus",
          label: "Kontenjan",
          type: "select",
          defaultValue: "available",
          options: [
            { label: "Uygun", value: "available" },
            { label: "Az kaldı", value: "limited" },
            { label: "Doldu", value: "full" },
          ],
        },
      ],
    },
    {
      name: "cover",
      label: "Kapak görseli",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "externalCover",
      label: "Harici kapak görseli",
      type: "text",
      admin: {
        description: "Medya seçilmediyse kullanılacak görsel adresi.",
      },
    },
    {
      name: "coverAlt",
      label: "Kapak görseli alternatif metni",
      type: "text",
      required: true,
    },
    {
      name: "gallery",
      label: "Galeri",
      type: "array",
      fields: [
        {
          name: "image",
          label: "Görsel",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
    {
      name: "details",
      label: "Detay blokları",
      type: "array",
      fields: [
        {
          name: "heading",
          label: "Başlık",
          type: "text",
          required: true,
        },
        {
          name: "body",
          label: "İçerik",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      name: "included",
      label: "Ücrete dahil olanlar",
      type: "array",
      fields: [
        {
          name: "item",
          label: "Madde",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "excluded",
      label: "Hariç olanlar",
      type: "array",
      fields: [
        {
          name: "item",
          label: "Madde",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "faq",
      label: "SSS",
      type: "array",
      fields: [
        {
          name: "question",
          label: "Soru",
          type: "text",
          required: true,
        },
        {
          name: "answer",
          label: "Yanıt",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      name: "seo",
      label: "SEO",
      type: "group",
      fields: sharedSeoFields,
    },
  ],
};
