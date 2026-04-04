import type { Route } from "next";

import type { AppRole, RoleNavItem } from "@/lib/types";

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
      href: "/admin/landing",
      label: "Landing Page",
      description: "Anasayfa icerigi, vitrin akisi ve CTA alanlari",
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
      href: "/manager/finance",
      label: "Finans",
      description: "Ucretler, tahakkuk, tahsilat ve borc",
    },
    {
      href: "/manager/announcements",
      label: "Duyuru ve Bildirim",
      description: "Hedef kitle, yayin ve aksiyon akisi",
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
  ],
};
