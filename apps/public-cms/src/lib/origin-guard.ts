export const CMS_ORIGIN_HEADER = "x-cms-origin-token";

export function hasValidCmsOriginToken(provided: string | null, expected: string | undefined) {
  if (!provided || !expected || provided.length !== expected.length) return false;

  let difference = 0;
  for (let index = 0; index < provided.length; index += 1) {
    difference |= provided.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return difference === 0;
}
