import type { CollectionConfig } from "payload";

import { contentBlocks } from "../blocks/ContentBlocks.ts";
import { canManageContent, hideFromFormTracker } from "../lib/adminAccess.ts";
import { createPublishingHook, createRouteRegistryHook, getPublicPath, sharedSeoFields, workflowField } from "../lib/publicSite.ts";

function createSlug(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SitePages: CollectionConfig = {
  slug: "site-pages",
  labels: {
    plural: "İçerik Sayfaları",
    singular: "İçerik Sayfası",
  },
  admin: {
    hidden: hideFromFormTracker,
    components: {
      edit: {
        beforeDocumentControls: [
          {
            path: "/components/admin/DecisionBand#DecisionBand",
            serverProps: { source: "site-pages" },
          },
        ],
      },
    },
    defaultColumns: ["title", "pageType", "slug", "workflowStatus", "updatedAt", "_status"],
    description:
      "Kurumsal, bilgilendirme ve yasal sayfaları bloklarla oluşturun ve menülerde yönetin.",
    group: "İçerik Varlıkları",
    livePreview: {
      url: ({ data }) => `${getPublicPath("site-pages", data)}?preview=true`,
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
    beforeChange: [
      ({ data, originalDoc }) => {
        if (originalDoc?.pageType === "home" || originalDoc?.pageType === "system") {
          data.pageType = originalDoc.pageType;
          data.slug = originalDoc.slug;
          data.systemPath = originalDoc.systemPath;
        }
        return data;
      },
      createRouteRegistryHook("site-pages"),
      createPublishingHook("site-pages"),
    ],
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data.slug) {
          data.slug = createSlug(data.title);
        }

        return data;
      },
    ],
  },
  versions: {
    drafts: true,
  },
  fields: [
    workflowField,
    {
      type: "tabs",
      tabs: [
        {
          label: "Sayfa",
          description: "Sayfanın adresi ve ilk ekranı.",
          fields: [
            {
              name: "pageType",
              label: "Sayfa türü",
              type: "select",
              defaultValue: "custom",
              options: [
                { label: "Ana sayfa", value: "home" },
                { label: "Landing", value: "landing" },
                { label: "Custom sayfa", value: "custom" },
                { label: "Sistem sayfası", value: "system" },
              ],
              required: true,
            },
            {
              name: "title",
              label: "Sayfa adı",
              type: "text",
              required: true,
            },
            {
              name: "slug",
              label: "Sayfa adresi",
              type: "text",
              admin: {
                description: "Boş bırakılırsa sayfa adından otomatik oluşturulur.",
              },
              index: true,
              required: true,
              unique: true,
            },
            {
              name: "systemPath",
              label: "Sabit public adres",
              type: "text",
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.pageType === "home" || siblingData?.pageType === "system",
                description: "Ana sayfa için /, sistem sayfaları için /programlar gibi sabit adres.",
              },
            },
            {
              name: "hero",
              label: "Sayfa kapağı",
              type: "group",
              fields: [
                {
                  name: "style",
                  label: "Kapak görünümü",
                  type: "radio",
                  defaultValue: "simple",
                  options: [
                    { label: "Sade başlık", value: "simple" },
                    { label: "Görsel üzerinde başlık", value: "image" },
                  ],
                  required: true,
                },
                {
                  name: "eyebrow",
                  label: "Üst başlık",
                  type: "text",
                },
                {
                  name: "heading",
                  label: "Büyük başlık",
                  type: "text",
                  required: true,
                },
                {
                  name: "summary",
                  label: "Kısa açıklama",
                  type: "textarea",
                },
                {
                  name: "image",
                  label: "Kapak görseli",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    condition: (_data, siblingData) => siblingData?.style === "image",
                  },
                },
                {
                  name: "externalImage",
                  label: "Harici görsel adresi",
                  type: "text",
                  admin: {
                    condition: (_data, siblingData) => siblingData?.style === "image",
                    description: "Medya seçilmediyse kullanılacak görsel adresi.",
                  },
                },
                {
                  name: "imageAlt",
                  label: "Görsel alternatif metni",
                  type: "text",
                  admin: {
                    condition: (_data, siblingData) => siblingData?.style === "image",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "İçerik Blokları",
          description: "Blok ekleyin, sürükleyerek sıralayın ve sayfanın akışını kurun.",
          fields: [
            {
              name: "layout",
              label: "Sayfa içeriği",
              type: "blocks",
              admin: {
                initCollapsed: true,
              },
              blocks: contentBlocks,
            },
          ],
        },
        {
          label: "Ana Sayfa Modülleri",
          description: "Ana sayfaya özel sabit bölümlerin içeriklerini yönetin.",
          admin: {
            condition: (_data, siblingData) => siblingData?.pageType === "home",
          },
          fields: [
            {
              name: "homeMetrics",
              label: "Metrik şeridi",
              type: "array",
              labels: {
                plural: "Metrik Kartları",
                singular: "Metrik Kartı",
              },
              admin: {
                description:
                  "Ana manşetin altındaki kısa bilgi kartlarını düzenleyin ve sürükleyerek sıralayın.",
                initCollapsed: true,
              },
              defaultValue: [
                { icon: "leaf", label: "Doğa rotaları", value: "Her mevsim açık hava" },
                { icon: "users", label: "Yaş grupları", value: "3-14 yaş arası" },
                { icon: "calendar", label: "Takvim", value: "Sezonluk oturumlar" },
                { icon: "shield", label: "Güven", value: "Öğretmen ekip eşliği" },
              ],
              fields: [
                {
                  name: "icon",
                  label: "Simge",
                  type: "select",
                  defaultValue: "leaf",
                  options: [
                    { label: "Yaprak / Doğa", value: "leaf" },
                    { label: "Kullanıcılar / Yaş grubu", value: "users" },
                    { label: "Takvim", value: "calendar" },
                    { label: "Kalkan / Güven", value: "shield" },
                    { label: "Yıldız / Öne çıkan", value: "sparkles" },
                    { label: "Konum", value: "location" },
                  ],
                  required: true,
                },
                {
                  name: "label",
                  label: "Küçük başlık",
                  type: "text",
                  required: true,
                },
                {
                  name: "value",
                  label: "Vurgulu bilgi",
                  type: "text",
                  required: true,
                },
              ],
              maxRows: 6,
              minRows: 1,
            },
            {
              name: "homeProcess",
              label: "Nasıl çalışır bölümü",
              type: "group",
              fields: [
                {
                  name: "eyebrow",
                  label: "Üst başlık",
                  type: "text",
                  defaultValue: "Nasıl çalışır?",
                },
                {
                  name: "title",
                  label: "Ana başlık",
                  type: "text",
                  defaultValue: "Yönetilebilir, sade ve güven veren başvuru akışı",
                },
                {
                  name: "description",
                  label: "Açıklama",
                  type: "textarea",
                  defaultValue:
                    "Ekip CMS panelinden programları, tarihleri, lokasyonları, yorumları ve başvuruları tek yerden yönetir.",
                },
                {
                  name: "steps",
                  label: "Süreç adımları",
                  type: "array",
                  labels: {
                    plural: "Süreç Adımları",
                    singular: "Süreç Adımı",
                  },
                  defaultValue: [
                    { text: "Program içeriği ve tarih oturumları panelden güncellenir." },
                    { text: "Ziyaretçi filtrelerle uygun rotayı bulur ve detay sayfasında ön başvuru bırakır." },
                    { text: "Başvurular yönetim panelinde durum ve iç notlarla takip edilir." },
                  ],
                  fields: [
                    {
                      name: "text",
                      label: "Adım metni",
                      type: "textarea",
                      required: true,
                    },
                  ],
                  maxRows: 6,
                  minRows: 1,
                },
              ],
            },
            {
              name: "partnerEyebrow",
              label: "Partner alanı üst başlığı",
              type: "text",
              defaultValue: "Katkılarıyla",
            },
          ],
        },
        {
          label: "Menü ve Yayın",
          description: "Sayfanın site menülerinde nerede görüneceğini belirleyin.",
          fields: [
            {
              name: "navigationLabel",
              label: "Menüde görünen ad",
              type: "text",
              admin: {
                description: "Boş bırakılırsa sayfa adı kullanılır.",
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "showInHeader",
                  label: "Üst menüde göster",
                  type: "checkbox",
                  defaultValue: false,
                },
                {
                  name: "headerOrder",
                  label: "Üst menü sırası",
                  type: "number",
                  defaultValue: 10,
                  min: 1,
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "showInFooter",
                  label: "Alt menüde göster",
                  type: "checkbox",
                  defaultValue: false,
                },
                {
                  name: "footerOrder",
                  label: "Alt menü sırası",
                  type: "number",
                  defaultValue: 10,
                  min: 1,
                },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seo",
              label: "Arama motoru ayarları",
              type: "group",
              fields: sharedSeoFields,
            },
          ],
        },
      ],
    },
  ],
};
