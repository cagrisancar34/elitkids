import type { Block } from "payload";

const sectionIntroFields = [
  {
    name: "eyebrow",
    label: "Üst başlık",
    type: "text" as const,
  },
  {
    name: "title",
    label: "Bölüm başlığı",
    type: "text" as const,
  },
  {
    name: "intro",
    label: "Kısa açıklama",
    type: "textarea" as const,
  },
];

export const RichContentBlock: Block = {
  slug: "richContent",
  labels: {
    plural: "Zengin Metin Alanları",
    singular: "Zengin Metin",
  },
  fields: [
    ...sectionIntroFields,
    {
      name: "content",
      label: "Metin içeriği",
      type: "richText",
      required: true,
    },
    {
      name: "width",
      label: "İçerik genişliği",
      type: "radio",
      defaultValue: "narrow",
      options: [
        { label: "Okuma genişliği", value: "narrow" },
        { label: "Geniş", value: "wide" },
      ],
    },
  ],
};

export const MediaTextBlock: Block = {
  slug: "mediaText",
  labels: {
    plural: "Görsel ve Metin Alanları",
    singular: "Görsel + Metin",
  },
  fields: [
    ...sectionIntroFields,
    {
      name: "content",
      label: "Metin içeriği",
      type: "richText",
      required: true,
    },
    {
      name: "image",
      label: "Görsel",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "externalImage",
      label: "Harici görsel adresi",
      type: "text",
      admin: {
        description: "Medya seçilmediyse kullanılacak görsel adresi.",
      },
    },
    {
      name: "imageAlt",
      label: "Görsel alternatif metni",
      type: "text",
      required: true,
    },
    {
      name: "imagePosition",
      label: "Görsel konumu",
      type: "radio",
      defaultValue: "right",
      options: [
        { label: "Solda", value: "left" },
        { label: "Sağda", value: "right" },
      ],
    },
  ],
};

export const FeatureListBlock: Block = {
  slug: "featureList",
  labels: {
    plural: "Özellik Listeleri",
    singular: "Özellik Listesi",
  },
  fields: [
    ...sectionIntroFields,
    {
      name: "columns",
      label: "Sütun sayısı",
      type: "radio",
      defaultValue: "3",
      options: [
        { label: "İki sütun", value: "2" },
        { label: "Üç sütun", value: "3" },
        { label: "Dört sütun", value: "4" },
      ],
    },
    {
      name: "items",
      label: "Özellikler",
      type: "array",
      minRows: 1,
      required: true,
      fields: [
        {
          name: "icon",
          label: "Simge",
          type: "select",
          defaultValue: "leaf",
          options: [
            { label: "Yaprak", value: "leaf" },
            { label: "Güven", value: "shield" },
            { label: "Kalp / İş birliği", value: "heart" },
            { label: "Hareket", value: "bike" },
            { label: "Sanat", value: "brush" },
            { label: "Dağ / Doğa", value: "mountain" },
            { label: "Uçak", value: "plane" },
            { label: "Yıldız", value: "sparkles" },
          ],
        },
        {
          name: "title",
          label: "Başlık",
          type: "text",
          required: true,
        },
        {
          name: "body",
          label: "Açıklama",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
};

export const CallToActionBlock: Block = {
  slug: "callToAction",
  labels: {
    plural: "Çağrı Alanları",
    singular: "Çağrı Alanı",
  },
  fields: [
    {
      name: "eyebrow",
      label: "Üst başlık",
      type: "text",
    },
    {
      name: "title",
      label: "Başlık",
      type: "text",
      required: true,
    },
    {
      name: "body",
      label: "Açıklama",
      type: "textarea",
    },
    {
      name: "buttonLabel",
      label: "Buton metni",
      type: "text",
      required: true,
    },
    {
      name: "buttonUrl",
      label: "Buton bağlantısı",
      type: "text",
      required: true,
    },
    {
      name: "tone",
      label: "Görünüm",
      type: "radio",
      defaultValue: "green",
      options: [
        { label: "Orman yeşili", value: "green" },
        { label: "Açık zemin", value: "light" },
      ],
    },
  ],
};

export const ContactFormBlock: Block = {
  slug: "contactForm",
  labels: {
    plural: "Başvuru Formları",
    singular: "Başvuru Formu",
  },
  fields: [
    {
      name: "eyebrow",
      label: "Üst başlık",
      type: "text",
      defaultValue: "İletişim",
    },
    {
      name: "title",
      label: "Başlık",
      type: "text",
      defaultValue: "Programlar hakkında bilgi alın",
      required: true,
    },
    {
      name: "body",
      label: "Açıklama",
      type: "textarea",
    },
    {
      name: "showContactDetails",
      label: "İletişim bilgilerini göster",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};

export const LocationGridBlock: Block = {
  slug: "locationGrid",
  labels: {
    plural: "Lokasyon Listeleri",
    singular: "Lokasyon Listesi",
  },
  fields: sectionIntroFields,
};

export const ProgramGridBlock: Block = {
  slug: "programGrid",
  labels: {
    plural: "Program Listeleri",
    singular: "Program Listesi",
  },
  fields: [
    ...sectionIntroFields,
    {
      name: "limit",
      label: "Gösterilecek program sayısı",
      type: "number",
      defaultValue: 3,
      max: 12,
      min: 1,
      required: true,
    },
  ],
};

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: {
    plural: "Galeriler",
    singular: "Galeri",
  },
  fields: [
    ...sectionIntroFields,
    {
      name: "gallery",
      label: "Gösterilecek galeri",
      type: "relationship",
      relationTo: "galleries",
      required: true,
    },
    {
      name: "display",
      label: "Görünüm",
      type: "radio",
      defaultValue: "grid",
      options: [
        { label: "Görsel ızgara", value: "grid" },
        { label: "Yatay şerit", value: "strip" },
      ],
    },
  ],
};

export const TestimonialGridBlock: Block = {
  slug: "testimonialGrid",
  labels: {
    plural: "Veli Yorumu Listeleri",
    singular: "Veli Yorumu Listesi",
  },
  fields: [
    ...sectionIntroFields,
    {
      name: "limit",
      label: "Gösterilecek yorum sayısı",
      type: "number",
      defaultValue: 3,
      max: 12,
      min: 1,
      required: true,
    },
  ],
};

export const PartnerGridBlock: Block = {
  slug: "partnerGrid",
  labels: {
    plural: "Partner Listeleri",
    singular: "Partner Listesi",
  },
  fields: sectionIntroFields,
};

export const HeadlineGridBlock: Block = {
  slug: "headlineGrid",
  labels: {
    plural: "Manşet Alanları",
    singular: "Manşet Alanı",
  },
  fields: [
    ...sectionIntroFields,
    {
      name: "limit",
      label: "Gösterilecek manşet sayısı",
      type: "number",
      defaultValue: 8,
      max: 25,
      min: 1,
      required: true,
    },
  ],
};

export const contentBlocks = [
  RichContentBlock,
  MediaTextBlock,
  FeatureListBlock,
  CallToActionBlock,
  ContactFormBlock,
  GalleryBlock,
  LocationGridBlock,
  ProgramGridBlock,
  TestimonialGridBlock,
  PartnerGridBlock,
  HeadlineGridBlock,
];
