import type { GlobalConfig } from "payload";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Ana Sayfa Ayarları",
  admin: {
    description:
      "Ana sayfanın ilk ekranındaki görseli, metinleri ve yönlendirme butonlarını yönetin.",
    group: false,
    hidden: true,
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "İçerik",
          description: "Ziyaretçinin ana sayfayı açtığında ilk göreceği metinler.",
          fields: [
            {
              name: "eyebrow",
              label: "Üst başlık",
              type: "text",
              defaultValue: "Doğa, spor ve sanat odaklı aile programları",
              required: true,
            },
            {
              name: "title",
              label: "Ana başlık",
              type: "text",
              defaultValue: "Dört Mevsim Doğada",
              required: true,
            },
            {
              name: "description",
              label: "Açıklama",
              type: "textarea",
              admin: {
                description: "İki veya üç satırı geçmeyen kısa bir tanıtım metni kullanın.",
                rows: 4,
              },
              defaultValue:
                "Çocukların merakını, ailelerin güven ihtiyacını ve doğanın iyi gelen ritmini aynı programda buluşturan modern etkinlik platformu.",
              required: true,
            },
          ],
        },
        {
          label: "Görsel",
          description: "İlk ekranın tam genişlikte arka plan görseli ve okunabilirlik ayarları.",
          fields: [
            {
              name: "backgroundImage",
              label: "Arka plan görseli",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Yatay, yüksek çözünürlüklü ve metnin geleceği sol tarafı sakin bir görsel seçin.",
              },
            },
            {
              name: "backgroundAlt",
              label: "Görsel alternatif metni",
              type: "text",
              defaultValue: "Doğada aileler için keşif rotası",
              required: true,
            },
            {
              name: "overlayStrength",
              label: "Görsel karartma seviyesi",
              type: "radio",
              defaultValue: "medium",
              options: [
                { label: "Hafif", value: "light" },
                { label: "Dengeli", value: "medium" },
                { label: "Güçlü", value: "dark" },
              ],
              required: true,
            },
          ],
        },
        {
          label: "Butonlar",
          description: "Ana ekrandaki birincil ve ikincil yönlendirmeleri yönetin.",
          fields: [
            {
              name: "primaryButton",
              label: "Birincil buton",
              type: "group",
              fields: [
                {
                  name: "enabled",
                  label: "Butonu göster",
                  type: "checkbox",
                  defaultValue: true,
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "label",
                      label: "Buton metni",
                      type: "text",
                      defaultValue: "Programları keşfet",
                      required: true,
                    },
                    {
                      name: "url",
                      label: "Yönlendirme adresi",
                      type: "text",
                      defaultValue: "/programlar",
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: "secondaryButton",
              label: "İkincil buton",
              type: "group",
              fields: [
                {
                  name: "enabled",
                  label: "Butonu göster",
                  type: "checkbox",
                  defaultValue: true,
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "label",
                      label: "Buton metni",
                      type: "text",
                      defaultValue: "Bilgi al",
                      required: true,
                    },
                    {
                      name: "url",
                      label: "Yönlendirme adresi",
                      type: "text",
                      defaultValue: "/iletisim",
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
