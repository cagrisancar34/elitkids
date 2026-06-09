import type { CollectionConfig } from "payload";
import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    plural: "Medya Kütüphanesi",
    singular: "Medya",
  },
  admin: {
    hidden: hideFromFormTracker,
    group: "İçerik Varlıkları",
    useAsTitle: "alt",
  },
  access: {
    create: ({ req }) => canManageContent(req.user),
    delete: ({ req }) => canManageContent(req.user),
    read: () => true,
    update: ({ req }) => canManageContent(req.user),
  },
  fields: [
    {
      name: "alt",
      label: "Alternatif metin",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      label: "Görsel açıklaması",
      type: "text",
    },
  ],
  upload: {
    focalPoint: false,
    mimeTypes: ["image/*"],
  },
};
