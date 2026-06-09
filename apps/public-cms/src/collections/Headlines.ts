import type { CollectionConfig } from "payload";
import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";
import { createPublishingHook, createRouteRegistryHook, sharedSeoFields, workflowField } from "../lib/publicSite.ts";
import { toPublicSitePath } from "../lib/routes.ts";

function createSlug(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Headlines: CollectionConfig = {
  slug: "headlines",
  labels: {
    plural: "Ana Manşetler",
    singular: "Ana Manşet",
  },
  admin: {
    hidden: hideFromFormTracker,
    components: {
      edit: {
        beforeDocumentControls: [
          {
            path: "/components/admin/DecisionBand#DecisionBand",
            serverProps: { source: "headlines" },
          },
        ],
      },
    },
    defaultColumns: ["title", "workflowStatus", "publishedAt", "isActive", "order", "_status"],
    description:
      "Ana sayfa manşetlerini ve ziyaretçinin okuyacağı haber detaylarını yönetin.",
    group: "İçerik Varlıkları",
    livePreview: {
      url: ({ data }) => `${toPublicSitePath(`/haberler/${data.slug || ""}`)}?preview=true`,
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
    beforeChange: [createRouteRegistryHook("headlines"), createPublishingHook("headlines")],
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data.slug) {
          data.slug = createSlug(data.title);
        }

        return data;
      },
    ],
  },
  fields: [
    workflowField,
    {
      name: "title",
      label: "Manşet başlığı",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "Haber bağlantısı",
      type: "text",
      admin: {
        description:
          "Boş bırakılırsa başlıktan otomatik oluşturulur. Örnek: bahar-donemi-kayitlari",
        position: "sidebar",
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "publishedAt",
      label: "Yayın tarihi",
      type: "date",
      admin: {
        date: {
          displayFormat: "dd MMM yyyy HH:mm",
          pickerAppearance: "dayAndTime",
        },
        position: "sidebar",
      },
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: "kicker",
      label: "Üst başlık",
      type: "text",
      defaultValue: "Öne çıkan",
    },
    {
      name: "summary",
      label: "Kısa açıklama",
      type: "textarea",
    },
    {
      name: "content",
      label: "Haber içeriği",
      type: "richText",
      admin: {
        description:
          "Metni seçerek kalınlık, renk, yazı tipi, bağlantı ve hizalama uygulayabilirsiniz.",
      },
      required: true,
    },
    {
      name: "image",
      label: "Manşet görseli",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "externalImage",
      label: "Harici manşet görseli",
      type: "text",
      admin: {
        description: "Medya seçilmediyse kullanılacak görsel adresi.",
      },
    },
    {
      name: "imageAlt",
      label: "Manşet görseli alternatif metni",
      type: "text",
      required: true,
    },
    {
      name: "linkType",
      label: "Detay sayfasındaki çağrı bağlantısı",
      type: "radio",
      defaultValue: "program",
      options: [
        { label: "Programa bağla", value: "program" },
        { label: "Özel bağlantı", value: "custom" },
        { label: "Bağlantı yok", value: "none" },
      ],
      required: true,
    },
    {
      name: "program",
      label: "Bağlı program",
      type: "relationship",
      relationTo: "programs",
      admin: {
        condition: (_data, siblingData) => siblingData?.linkType === "program",
      },
    },
    {
      name: "customUrl",
      label: "Özel bağlantı adresi",
      type: "text",
      admin: {
        condition: (_data, siblingData) => siblingData?.linkType === "custom",
      },
    },
    {
      name: "buttonLabel",
      label: "Detay sayfası buton metni",
      type: "text",
      defaultValue: "Detayları incele",
    },
    {
      name: "isActive",
      label: "Ana sayfada göster",
      type: "checkbox",
      defaultValue: true,
      required: true,
    },
    {
      name: "order",
      label: "Sıralama",
      type: "number",
      defaultValue: 1,
      min: 1,
      required: true,
    },
    {
      name: "seo",
      label: "SEO",
      type: "group",
      fields: sharedSeoFields,
    },
  ],
};
