import "server-only";

function readEnv(key: string) {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function getWhatsAppServerConfig() {
  const accessToken = readEnv("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = readEnv("WHATSAPP_PHONE_NUMBER_ID");
  const businessAccountId = readEnv("WHATSAPP_BUSINESS_ACCOUNT_ID");
  const verifyToken = readEnv("WHATSAPP_VERIFY_TOKEN");
  const appSecret = readEnv("WHATSAPP_APP_SECRET");
  const apiVersion = readEnv("WHATSAPP_API_VERSION") ?? "v22.0";
  const appUrl =
    readEnv("NEXT_PUBLIC_SITE_URL") ??
    readEnv("NEXT_PUBLIC_APP_URL") ??
    "https://elitsanatvesporkulubu.com";

  const missingKeys = [
    !accessToken ? "WHATSAPP_ACCESS_TOKEN" : null,
    !phoneNumberId ? "WHATSAPP_PHONE_NUMBER_ID" : null,
    !businessAccountId ? "WHATSAPP_BUSINESS_ACCOUNT_ID" : null,
    !verifyToken ? "WHATSAPP_VERIFY_TOKEN" : null,
    !appSecret ? "WHATSAPP_APP_SECRET" : null,
  ].filter((key): key is string => Boolean(key));

  return {
    accessToken,
    phoneNumberId,
    businessAccountId,
    verifyToken,
    appSecret,
    apiVersion,
    appUrl,
    configured: missingKeys.length === 0,
    missingKeys,
  };
}
