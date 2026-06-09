export const ADMIN_BASE_PATH = "/admin2";
export const API_BASE_PATH = "/cms-api";
export const PUBLIC_SITE_BASE_PATH = "/site";

const PASSTHROUGH_PREFIXES = [
  ADMIN_BASE_PATH,
  API_BASE_PATH,
  PUBLIC_SITE_BASE_PATH,
  "/admin",
  "/anasayfa2",
  "/_next",
];

export function toPublicSitePath(value?: null | string) {
  if (!value) return "/";
  if (
    value === "/" ||
    value.startsWith("#") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    PASSTHROUGH_PREFIXES.some((prefix) => value === prefix || value.startsWith(`${prefix}/`))
  ) {
    return value;
  }

  return `${PUBLIC_SITE_BASE_PATH}${value.startsWith("/") ? value : `/${value}`}`;
}

export function toAdminPath(value = "") {
  const suffix = value.startsWith("/") ? value : `/${value}`;
  return value ? `${ADMIN_BASE_PATH}${suffix}` : ADMIN_BASE_PATH;
}
