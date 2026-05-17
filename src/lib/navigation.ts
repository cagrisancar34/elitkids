import type { Route } from "next";

import type { AppRole, NavSectionId, RoleNavItem, RoleNavSection } from "@/lib/types";

export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Yonetici",
  coach: "Koc",
  parent: "Veli",
};

export const roleHomeRoutes: Record<AppRole, Route> = {
  admin: "/admin",
  manager: "/manager",
  coach: "/coach",
  parent: "/parent",
};

export const navigationByRole: Record<AppRole, RoleNavItem[]> = {
  admin: [
    {
      href: "/admin",
      label: "Sistem Gorunumu",
      description: "Roller, yetkiler ve saglik kontrolleri",
    },
    {
      href: "/admin/users",
      label: "Kullanici ve Roller",
      description: "Davetler, erisim ve sorumluluk dagilimi",
    },
    {
      href: "/admin/settings",
      label: "Sistem Ayarlari",
      description: "Kurum, entegrasyon ve guvenlik tercihleri",
    },
    {
      href: "/admin/public-site",
      label: "Public Site CMS",
      description: "Anasayfa, galeri, SEO ve ozel public sayfalari tek merkezden yonet",
    },
    {
      href: "/admin/pre-registration-settings",
      label: "On Kayit Ayarlari",
      description: "KVKK, veli izin metni ve public basvuru akisini yonet",
    },
    {
      href: "/admin/detail-templates",
      label: "Detay Sorulari",
      description: "Koc formlarini ve karne alanlarini yonet",
    },
    {
      href: "/admin/program-resources",
      label: "Program Kaynaklari",
      description: "Tip, kategori, brans ve alan sozlugunu yonet",
    },
    {
      href: "/admin/security",
      label: "Guvenlik ve Audit",
      description: "Audit log, lead akisleri ve sistem kayitlari",
    },
    {
      href: "/manager",
      label: "Yonetici / Genel Bakis",
      description: "Acil durumda operasyon merkezine dogrudan giris",
    },
    {
      href: "/manager/students",
      label: "Yonetici / Ogrenciler",
      description: "Kayit, roster ve veli baglantilarina mudahale",
    },
    {
      href: "/manager/pre-registrations",
      label: "Yonetici / On Kayitlar",
      description: "Landing basvurularini incele ve aktif kayda donustur",
    },
    {
      href: "/manager/programs",
      label: "Yonetici / Programlar",
      description: "Brans, kontenjan ve fiyat yapisini denetle",
    },
    {
      href: "/manager/sessions",
      label: "Yonetici / Seanslar",
      description: "Takvim, alan ve koc atamalarini ac",
    },
    {
      href: "/manager/attendance",
      label: "Yonetici / Yoklama",
      description: "Katilim ve devamsizlik sinyallerini izle",
    },
    {
      href: "/manager/fees",
      label: "Yonetici / Ucretler",
      description: "Paket, fiyat seviyesi ve aktif kural dagilimini ac",
    },
    {
      href: "/manager/debts",
      label: "Yonetici / Borc Takibi",
      description: "Acik bakiye, risk ve takip aksiyonlarini yonet",
    },
    {
      href: "/manager/payments",
      label: "Yonetici / Odemeler",
      description: "Tahsilat merkezini ve manuel odeme akislarini ac",
    },
    {
      href: "/manager/communication",
      label: "Yonetici / Iletisim",
      description: "Duyuru, bildirim ve destek kuyruguna mudahale et",
    },
    {
      href: "/manager/reports",
      label: "Yonetici / Raporlar",
      description: "Operasyon, karne ve lead ozetlerini ayni yerde gor",
    },
    {
      href: "/coach",
      label: "Koc / Bugun",
      description: "Saha akisina ve gunluk seans ritmine bak",
    },
    {
      href: "/coach/sessions",
      label: "Koc / Seans Akisi",
      description: "Yoklama ve not akisini acil durumda devral",
    },
    {
      href: "/coach/students",
      label: "Koc / Ogrenciler",
      description: "Roster ve saha bazli ogrenci listesini gor",
    },
    {
      href: "/parent",
      label: "Veli / Panel",
      description: "Veli deneyimini ve bildirim akislarini incele",
    },
    {
      href: "/parent/schedule",
      label: "Veli / Takvim",
      description: "Ders planini veli perspektifinden gor",
    },
    {
      href: "/parent/payments",
      label: "Veli / Odemeler",
      description: "Borclar ve finans gorunumune acil mudahale",
    },
    {
      href: "/parent/support",
      label: "Veli / Destek",
      description: "Acik talepler ve mesajlasma akislarini incele",
    },
  ],
  manager: [
    {
      href: "/manager",
      label: "Genel Bakis",
      description: "Operasyon, finans ve gunluk karar yuzeyi",
    },
    {
      href: "/manager/students",
      label: "Ogrenciler",
      description: "Kayit, devam ve veli baglantilari",
    },
    {
      href: "/manager/pre-registrations",
      label: "On Kayitlar",
      description: "Landing basvurularini incele ve aktivasyona hazirla",
    },
    {
      href: "/manager/programs",
      label: "Programlar",
      description: "Brans, yas grubu ve kontenjan yonetimi",
    },
    {
      href: "/manager/sessions",
      label: "Seanslar",
      description: "Takvim, koc atama ve doluluk takibi",
    },
    {
      href: "/manager/attendance",
      label: "Yoklama",
      description: "Seans bazli yoklama ve katilim durumu",
    },
    {
      href: "/manager/fees",
      label: "Ucretler",
      description: "Paket, fiyat seviyesi ve aktif kural dagilimi",
    },
    {
      href: "/manager/debts",
      label: "Borc Takibi",
      description: "Acik bakiye, takip ve risk oncelikleri",
    },
    {
      href: "/manager/payments",
      label: "Odemeler",
      description: "Tahsilat merkezi ve manuel odeme akisi",
    },
    {
      href: "/manager/communication",
      label: "Iletisim",
      description: "Duyuru, bildirim ve destek operasyonu",
    },
    {
      href: "/manager/reports",
      label: "Raporlar",
      description: "Operasyon, karne ve lead ozetleri",
    },
  ],
  coach: [
    {
      href: "/coach",
      label: "Bugun",
      description: "Gunun seanslari ve hazirlik durumu",
    },
    {
      href: "/coach/sessions",
      label: "Seans Akisi",
      description: "Yoklama, notlar ve saha operasyonu",
    },
    {
      href: "/coach/students",
      label: "Ogrenci Listeleri",
      description: "Bagli roster ve gelisim sinyalleri",
    },
  ],
  parent: [
    {
      href: "/parent",
      label: "Aile Paneli",
      description: "Program, borc ve anlik durum",
    },
    {
      href: "/parent/schedule",
      label: "Takvim",
      description: "Yaklasan dersler ve devam takibi",
    },
    {
      href: "/parent/payments",
      label: "Odemeler",
      description: "Tahakkuklar, tahsilatlar ve borc ozeti",
    },
    {
      href: "/parent/support",
      label: "Destek",
      description: "Talepler, yenileme ve mesajlasma",
    },
    {
      href: "/parent/report-cards",
      label: "Karne",
      description: "Kaydedilen gelisim karnelerini goruntule",
    },
  ],
};

const navSectionLabels: Record<NavSectionId, { label: string; description: string }> = {
  admin: {
    label: "Admin",
    description: "Sistem, sayfa yonetimi ve guvenlik yuzeyi",
  },
  manager: {
    label: "Yonetici",
    description: "Kayit, finans ve operasyon akisi",
  },
  coach: {
    label: "Koc",
    description: "Saha, seans ve yoklama merkezi",
  },
  parent: {
    label: "Veli",
    description: "Takvim, odeme ve destek takibi",
  },
};

export const navigationSectionsByRole: Record<AppRole, RoleNavSection[]> = {
  admin: [
    {
      id: "admin",
      ...navSectionLabels.admin,
      items: navigationByRole.admin.filter((item) => item.href.startsWith("/admin")),
    },
    {
      id: "manager",
      ...navSectionLabels.manager,
      items: navigationByRole.admin.filter((item) => item.href.startsWith("/manager")),
    },
    {
      id: "coach",
      ...navSectionLabels.coach,
      items: navigationByRole.admin.filter((item) => item.href.startsWith("/coach")),
    },
    {
      id: "parent",
      ...navSectionLabels.parent,
      items: navigationByRole.admin.filter((item) => item.href.startsWith("/parent")),
    },
  ],
  manager: [
    {
      id: "manager",
      ...navSectionLabels.manager,
      items: navigationByRole.manager,
    },
  ],
  coach: [
    {
      id: "coach",
      ...navSectionLabels.coach,
      items: navigationByRole.coach,
    },
  ],
  parent: [
    {
      id: "parent",
      ...navSectionLabels.parent,
      items: navigationByRole.parent,
    },
  ],
};
