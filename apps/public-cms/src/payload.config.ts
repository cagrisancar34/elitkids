import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  FixedToolbarFeature,
  TextStateFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { tr } from "@payloadcms/translations/languages/tr";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { Applications } from "./collections/Applications.ts";
import { Categories } from "./collections/Categories.ts";
import { Galleries } from "./collections/Galleries.ts";
import { Headlines } from "./collections/Headlines.ts";
import { Locations } from "./collections/Locations.ts";
import { Media } from "./collections/Media.ts";
import { Partners } from "./collections/Partners.ts";
import { Programs } from "./collections/Programs.ts";
import { SitePages } from "./collections/SitePages.ts";
import { Testimonials } from "./collections/Testimonials.ts";
import { Users } from "./collections/Users.ts";
import { HomePage } from "./globals/HomePage.ts";
import { SiteSettings } from "./globals/SiteSettings.ts";
import { ADMIN_BASE_PATH, API_BASE_PATH } from "./lib/routes.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const trustedOrigins = Array.from(
  new Set([
    siteUrl.replace(/\/+$/, ""),
    "https://elitsanatvesporkulubu.com",
    "https://www.elitsanatvesporkulubu.com",
  ]),
);

const hasS3 =
  process.env.S3_ENABLED === "true" &&
  Boolean(process.env.S3_BUCKET) &&
  Boolean(process.env.S3_ACCESS_KEY_ID) &&
  Boolean(process.env.S3_SECRET_ACCESS_KEY);

export default buildConfig({
  admin: {
    components: {
      beforeNavLinks: ["/components/admin/PublicSiteNavLink#PublicSiteNavLink"],
      graphics: {
        Icon: "/components/admin/Brand#AdminIcon",
        Logo: "/components/admin/Brand#AdminLogo",
      },
      views: {
        dashboard: {
          Component: "/components/admin/DashboardRedirectView#DashboardRedirectView",
        },
        events: {
          Component: "/components/admin/EventsView#EventsView",
          path: "/events",
        },
        publicSite: {
          Component: "/components/admin/PublicSiteView#PublicSiteView",
          path: "/public-site",
        },
      },
    },
    dateFormat: "dd MMM yyyy HH:mm",
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: path.resolve(dirname, "app/(payload)/admin2/importMap.js"),
    },
    meta: {
      titleSuffix: "- ElitKids Public CMS",
    },
    livePreview: {
      breakpoints: [
        { height: 900, label: "Masaüstü", name: "desktop", width: 1440 },
        { height: 844, label: "Mobil", name: "mobile", width: 390 },
      ],
    },
    user: Users.slug,
  },
  collections: [
    Headlines,
    Programs,
    Galleries,
    Applications,
    Categories,
    Locations,
    SitePages,
    Testimonials,
    Partners,
    Media,
    Users,
  ],
  cookiePrefix: "dmd_payload",
  cors: trustedOrigins,
  csrf: trustedOrigins,
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ||
        "postgres://postgres:postgres@127.0.0.1:5432/elitkids_public_cms",
      max: 5,
    },
    schemaName: process.env.PAYLOAD_DB_SCHEMA || "public_cms",
  }),
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      TextStateFeature({
        state: {
          renk: {
            "orman-yesili": {
              css: { color: "#214d3f" },
              label: "Orman yeşili",
            },
            "sicak-turuncu": {
              css: { color: "#c96632" },
              label: "Sıcak turuncu",
            },
            "koyu-gri": {
              css: { color: "#292524" },
              label: "Koyu gri",
            },
            mavi: {
              css: { color: "#2563eb" },
              label: "Mavi",
            },
            kirmizi: {
              css: { color: "#dc2626" },
              label: "Kırmızı",
            },
          },
          yaziTipi: {
            modern: {
              css: { "font-family": "Arial, Helvetica, sans-serif" },
              label: "Modern sans",
            },
            editoryal: {
              css: { "font-family": "Georgia, 'Times New Roman', serif" },
              label: "Editoryal serif",
            },
            teknik: {
              css: { "font-family": "'Courier New', monospace" },
              label: "Teknik mono",
            },
          },
        },
      }),
    ],
  }),
  globals: [SiteSettings, HomePage],
  i18n: {
    fallbackLanguage: "tr",
    supportedLanguages: {
      tr,
    },
  },
  plugins: [
    s3Storage({
      bucket: process.env.S3_BUCKET || "local-media",
      clientUploads: false,
      collections: {
        media: {
          generateFileURL: ({ filename, prefix }) => {
            const publicBase = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
            const pathPrefix = prefix ? `${prefix.replace(/^\/+|\/+$/g, "")}/` : "";
            return publicBase
              ? `${publicBase}/${pathPrefix}${encodeURIComponent(filename)}`
              : `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${pathPrefix}${encodeURIComponent(filename)}`;
          },
          prefix: "public-cms",
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "local",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "local",
        },
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        region: process.env.S3_REGION || "auto",
      },
      enabled: hasS3,
    }),
  ],
  routes: {
    admin: ADMIN_BASE_PATH,
    api: API_BASE_PATH,
    graphQL: `${API_BASE_PATH}/graphql`,
    graphQLPlayground: `${API_BASE_PATH}/graphql-playground`,
  },
  serverURL: siteUrl,
  secret: process.env.PAYLOAD_SECRET || "development-only-change-me",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
