import "server-only";

import { getPublicCmsPayload } from "./payload-client";
import { isRecord } from "./payload-utils";

const fallbackSiteSettings = {
  address: "Erenköy Mah. Çamlıköşk Sk. No:3A Kadıköy/İstanbul",
  copyrightText: "Tüm hakları saklıdır. Bu demo satış ve ödeme akışı içermez.",
  email: "merhaba@dortmevsimdogada.com",
  footerBrand: "Dört Mevsim Doğada",
  footerHeadline: "Çocuklu aileler için güvenli, canlı ve doğaya yakın programlar.",
  phone: "+90 555 111 22 33",
  whatsappNumber: "905551112233",
};

export async function getSiteSettings() {
  try {
    const payload = await getPublicCmsPayload();
    const settings = await payload.findGlobal({ slug: "site-settings" });

    if (!isRecord(settings)) {
      return fallbackSiteSettings;
    }

    return {
      address: typeof settings.address === "string" && settings.address.trim() ? settings.address : fallbackSiteSettings.address,
      copyrightText:
        typeof settings.copyrightText === "string" && settings.copyrightText.trim()
          ? settings.copyrightText
          : fallbackSiteSettings.copyrightText,
      email: typeof settings.email === "string" && settings.email.trim() ? settings.email : fallbackSiteSettings.email,
      footerBrand:
        typeof settings.footerBrand === "string" && settings.footerBrand.trim()
          ? settings.footerBrand
          : fallbackSiteSettings.footerBrand,
      footerHeadline:
        typeof settings.footerHeadline === "string" && settings.footerHeadline.trim()
          ? settings.footerHeadline
          : fallbackSiteSettings.footerHeadline,
      phone: typeof settings.phone === "string" && settings.phone.trim() ? settings.phone : fallbackSiteSettings.phone,
      whatsappNumber:
        typeof settings.whatsappNumber === "string" && settings.whatsappNumber.trim()
          ? settings.whatsappNumber
          : fallbackSiteSettings.whatsappNumber,
    };
  } catch {
    return fallbackSiteSettings;
  }
}
