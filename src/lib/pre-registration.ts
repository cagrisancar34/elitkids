import type { PreRegistrationSettings } from "@/lib/types";

export const defaultPreRegistrationSettings: PreRegistrationSettings = {
  formEnabled: true,
  kvkkTitle: "KVKK Aydinlatma Metni",
  kvkkBody:
    "Kisisel verileriniz, basvurunuzu degerlendirmek, sizinle iletisime gecmek ve uygun spor programina yonlendirme yapmak amaciyla islenir. Verileriniz ilgili mevzuata uygun sekilde saklanir ve yetkisiz ucuncu kisilerle paylasilmaz.",
  kvkkCheckboxLabel: "KVKK aydinlatma metnini okudum ve kabul ediyorum.",
  parentPermissionTitle: "Veli Izin Belgesi",
  parentPermissionBody:
    "Velisi oldugum ogrenci adina on kayit basvurusu yapilmasina, verilen bilgilerin dogruluguna ve kurum tarafindan degerlendirilmesine onay veriyorum.",
  parentPermissionCheckboxLabel: "Veli izin belgesini okudum ve kabul ediyorum.",
  successMessage:
    "On kaydiniz alindi. Ekibimiz en kisa surede sizinle iletisime gececek.",
  helperNote:
    "IP adresiniz ve tarayici / cihaz bilgileriniz guvenlik ve basvuru dogrulama amaciyla kaydedilir.",
};

export function mergePreRegistrationSettings(
  base: PreRegistrationSettings,
  incoming: Partial<PreRegistrationSettings> | null | undefined,
) {
  if (!incoming) {
    return base;
  }

  return {
    ...base,
    ...incoming,
  };
}
