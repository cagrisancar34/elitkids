import type { CollectionConfig } from "payload";
import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";

export const Locations: CollectionConfig = {
  slug: "locations",
  labels: {
    plural: "Lokasyonlar",
    singular: "Lokasyon",
  },
  admin: {
    hidden: hideFromFormTracker,
    defaultColumns: ["title", "city", "country"],
    group: "İçerik Varlıkları",
    useAsTitle: "title",
  },
  access: {
    create: ({ req }) => canManageContent(req.user),
    delete: ({ req }) => canManageContent(req.user),
    read: () => true,
    update: ({ req }) => canManageContent(req.user),
  },
  fields: [
    {
      name: "title",
      label: "Lokasyon adı",
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
      name: "city",
      label: "Şehir / Bölge",
      type: "text",
      required: true,
    },
    {
      name: "country",
      label: "Ülke",
      type: "text",
      defaultValue: "Türkiye",
      required: true,
    },
    {
      name: "summary",
      label: "Kısa açıklama",
      type: "textarea",
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
      name: "mapUrl",
      label: "Harita bağlantısı",
      type: "text",
    },
  ],
};
