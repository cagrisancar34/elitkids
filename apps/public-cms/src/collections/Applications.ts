import type { CollectionConfig } from "payload";
import { isAdmin } from "../lib/adminAccess.ts";

export const Applications: CollectionConfig = {
  slug: "applications",
  labels: {
    plural: "Başvurular",
    singular: "Başvuru",
  },
  admin: {
    defaultColumns: ["fullName", "phone", "programTitle", "status", "legacySyncStatus", "createdAt"],
    description: "Web sitesi üzerinden gelen bilgi taleplerini ve dönüş durumlarını takip edin.",
    group: "Operasyon",
    useAsTitle: "fullName",
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => isAdmin(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "fullName",
      label: "Ad Soyad",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      label: "Telefon",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "E-posta",
      type: "email",
    },
    {
      name: "childAge",
      label: "Çocuk yaşı",
      type: "text",
    },
    {
      name: "program",
      label: "İlgilenilen program",
      type: "relationship",
      relationTo: "programs",
    },
    {
      name: "programTitle",
      label: "Program adı",
      type: "text",
    },
    {
      name: "message",
      label: "Mesaj",
      type: "textarea",
    },
    {
      name: "kvkkConsent",
      label: "KVKK onayı",
      type: "checkbox",
      required: true,
    },
    {
      name: "status",
      label: "Takip durumu",
      type: "select",
      defaultValue: "new",
      required: true,
      options: [
        { label: "Yeni", value: "new" },
        { label: "Arandı", value: "contacted" },
        { label: "Takipte", value: "follow-up" },
        { label: "Kapandı", value: "closed" },
      ],
    },
    {
      name: "notes",
      label: "İç notlar",
      type: "textarea",
      admin: {
        condition: (_data, _siblingData, { user }) => Boolean(user),
      },
    },
    {
      name: "legacySyncStatus",
      label: "ElitKids aktarımı",
      type: "select",
      defaultValue: "pending",
      required: true,
      options: [
        { label: "Bekliyor", value: "pending" },
        { label: "Aktarıldı", value: "synced" },
        { label: "Aktarım başarısız", value: "failed" },
      ],
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "legacySyncedAt",
      label: "ElitKids aktarım zamanı",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "legacySyncMessage",
      label: "ElitKids aktarım notu",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
  ],
};
