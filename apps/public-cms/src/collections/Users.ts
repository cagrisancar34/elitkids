import type { CollectionConfig } from "payload";
import { isAdmin } from "../lib/adminAccess.ts";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    plural: "Yöneticiler",
    singular: "Yönetici",
  },
  admin: {
    defaultColumns: ["name", "email", "role", "updatedAt"],
    group: "Sistem",
    useAsTitle: "email",
  },
  access: {
    create: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
    read: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
  },
  auth: {
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  fields: [
    {
      name: "name",
      label: "Ad Soyad",
      type: "text",
      required: true,
    },
    {
      name: "role",
      label: "Rol",
      type: "select",
      defaultValue: "editor",
      required: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editör", value: "editor" },
        { label: "Form Takip", value: "form-tracker" },
      ],
    },
  ],
};
