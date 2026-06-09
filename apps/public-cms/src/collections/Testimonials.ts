import type { CollectionConfig } from "payload";
import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: {
    plural: "Veli Yorumları",
    singular: "Veli Yorumu",
  },
  admin: {
    hidden: hideFromFormTracker,
    defaultColumns: ["title", "parentName", "programName", "isFeatured"],
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
      label: "Yorum başlığı",
      type: "text",
      required: true,
    },
    {
      name: "body",
      label: "Yorum",
      type: "textarea",
      required: true,
    },
    {
      name: "parentName",
      label: "Veli adı",
      type: "text",
      required: true,
    },
    {
      name: "childInfo",
      label: "Çocuk bilgisi",
      type: "text",
    },
    {
      name: "programName",
      label: "Program",
      type: "text",
    },
    {
      name: "isFeatured",
      label: "Öne çıkar",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
