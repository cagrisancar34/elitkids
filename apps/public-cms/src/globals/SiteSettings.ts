import type { GlobalConfig } from "payload";

import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Ayarları",
  admin: {
    description: "Site genelinde kullanılan marka, iletişim ve footer bilgilerini yönetin.",
    group: "Sistem",
    hidden: hideFromFormTracker,
  },
  access: {
    read: () => true,
    update: ({ req }) => canManageContent(req.user),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Footer",
          description: "Tüm public sayfaların altında gösterilen kurumsal metinler.",
          fields: [
            {
              name: "footerBrand",
              label: "Marka etiketi",
              type: "text",
              defaultValue: "Dört Mevsim Doğada",
              required: true,
            },
            {
              name: "footerHeadline",
              label: "Footer ana metni",
              type: "textarea",
              defaultValue: "Çocuklu aileler için güvenli, canlı ve doğaya yakın programlar.",
              required: true,
            },
            {
              name: "copyrightText",
              label: "En alt bilgi metni",
              type: "text",
              defaultValue: "Tüm hakları saklıdır. Bu demo satış ve ödeme akışı içermez.",
              required: true,
            },
          ],
        },
        {
          label: "İletişim",
          description: "Footer, iletişim alanları ve WhatsApp butonunda kullanılan bilgiler.",
          fields: [
            {
              name: "address",
              label: "Adres",
              type: "textarea",
              defaultValue: "Erenköy Mah. Çamlıköşk Sk. No:3A Kadıköy/İstanbul",
              required: true,
            },
            {
              type: "row",
              fields: [
                {
                  name: "phone",
                  label: "Telefon",
                  type: "text",
                  defaultValue: "+90 555 111 22 33",
                  required: true,
                },
                {
                  name: "whatsappNumber",
                  label: "WhatsApp numarası",
                  type: "text",
                  admin: {
                    description: "Ülke koduyla, boşluksuz yazın. Örnek: 905551112233",
                  },
                  defaultValue: "905551112233",
                  required: true,
                },
              ],
            },
            {
              name: "email",
              label: "E-posta",
              type: "email",
              defaultValue: "merhaba@dortmevsimdogada.com",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
