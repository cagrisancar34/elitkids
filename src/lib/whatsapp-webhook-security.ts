const signaturePrefix = "sha256=";
const textEncoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(value: string) {
  if (!/^[a-f0-9]+$/i.test(value) || value.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }

  return bytes;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }

  return difference === 0;
}

export async function createMetaWebhookSignature(payload: string, appSecret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return `${signaturePrefix}${bytesToHex(digest)}`;
}

export async function verifyMetaWebhookSignature(input: {
  payload: string;
  signatureHeader: string | null;
  appSecret: string | null | undefined;
}) {
  if (!input.appSecret || !input.signatureHeader?.startsWith(signaturePrefix)) {
    return false;
  }

  const providedSignature = hexToBytes(input.signatureHeader.slice(signaturePrefix.length));
  if (!providedSignature) {
    return false;
  }

  const expectedHeader = await createMetaWebhookSignature(input.payload, input.appSecret);
  const expectedSignature = hexToBytes(expectedHeader.slice(signaturePrefix.length));

  return Boolean(expectedSignature && timingSafeEqual(providedSignature, expectedSignature));
}
