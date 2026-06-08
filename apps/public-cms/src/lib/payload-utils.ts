import "server-only";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export function resolveMediaUrl(
  value: unknown,
  externalValue?: string | null,
  fallback = "",
) {
  if (isRecord(value) && typeof value.url === "string" && value.url.trim().length > 0) {
    return value.url;
  }

  return getText(externalValue, fallback);
}

export function resolveRelationText(
  value: unknown,
  keys: string[],
  fallback = "",
) {
  if (isRecord(value)) {
    for (const key of keys) {
      const candidate = value[key];
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate;
      }
    }
  }

  return fallback;
}
