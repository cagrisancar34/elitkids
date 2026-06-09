import type { CollectionConfig } from "payload";
import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";

export const Partners: CollectionConfig = {
  slug: "partners",
  labels: {
    plural: "Partnerler",
    singular: "Partner",
  },
  admin: {
    hidden: hideFromFormTracker,
    defaultColumns: ["title", "order", "url", "isActive"],
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
      label: "Partner adı",
      type: "text",
      required: true,
    },
    {
      name: "logo",
      label: "Logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "url",
      label: "Bağlantı",
      type: "text",
    },
    {
      name: "order",
      label: "Görünme sırası",
      type: "number",
      defaultValue: 10,
      min: 1,
      required: true,
    },
    {
      name: "isActive",
      label: "Aktif",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
