import type { CollectionConfig } from "payload";
import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    plural: "Kategoriler",
    singular: "Kategori",
  },
  admin: {
    hidden: hideFromFormTracker,
    defaultColumns: ["title", "type", "isFeatured"],
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
      label: "Başlık",
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
      name: "type",
      label: "Tür",
      type: "select",
      defaultValue: "travel",
      options: [
        { label: "Seyahat", value: "travel" },
        { label: "Atölye", value: "workshop" },
        { label: "Kamp", value: "camp" },
        { label: "Yurt dışı", value: "international" },
        { label: "Sezonluk koleksiyon", value: "seasonal" },
      ],
      required: true,
    },
    {
      name: "description",
      label: "Kısa açıklama",
      type: "textarea",
    },
    {
      name: "isFeatured",
      label: "Öne çıkar",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};
