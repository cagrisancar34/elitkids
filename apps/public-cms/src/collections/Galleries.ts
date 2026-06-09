import type { CollectionConfig } from "payload";

import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";
import { createPublishingHook, createRouteRegistryHook, sharedSeoFields, workflowField } from "../lib/publicSite.ts";
import { toPublicSitePath } from "../lib/routes.ts";

export const Galleries: CollectionConfig = {
  slug: "galleries",
  labels: {
    plural: "Galeriler",
    singular: "Galeri",
  },
  admin: {
    hidden: hideFromFormTracker,
    components: {
      edit: {
        beforeDocumentControls: [
          {
            path: "/components/admin/DecisionBand#DecisionBand",
            serverProps: { source: "galleries" },
          },
        ],
      },
    },
    defaultColumns: ["title", "slug", "workflowStatus", "updatedAt", "_status"],
    description: "Bağımsız galeri sayfaları oluşturun ve diğer sayfalarda yeniden kullanın.",
    group: "İçerik Varlıkları",
    livePreview: {
      url: ({ data }) => `${toPublicSitePath(`/galeri/${data.slug || ""}`)}?preview=true`,
    },
    useAsTitle: "title",
  },
  access: {
    create: ({ req }) => canManageContent(req.user),
    delete: ({ req }) => canManageContent(req.user),
    read: () => true,
    update: ({ req }) => canManageContent(req.user),
  },
  hooks: {
    beforeChange: [createRouteRegistryHook("galleries"), createPublishingHook("galleries")],
  },
  versions: {
    drafts: true,
  },
  fields: [
    workflowField,
    { name: "title", label: "Galeri adı", type: "text", required: true },
    { name: "slug", label: "Sayfa adresi", type: "text", index: true, required: true, unique: true },
    { name: "summary", label: "Kısa açıklama", type: "textarea" },
    { name: "cover", label: "Kapak görseli", type: "upload", relationTo: "media" },
    {
      name: "externalCover",
      label: "Harici kapak görseli",
      type: "text",
      admin: { description: "Medya seçilmediyse kullanılacak görsel adresi." },
    },
    {
      name: "images",
      label: "Galeri görselleri",
      type: "array",
      fields: [
        { name: "image", label: "Görsel", type: "upload", relationTo: "media" },
        { name: "externalImage", label: "Harici görsel adresi", type: "text" },
        { name: "alt", label: "Alternatif metin", type: "text", required: true },
        { name: "caption", label: "Açıklama", type: "text" },
      ],
      minRows: 1,
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
