import { Compass, MessageCircle } from "lucide-react";
import Link from "next/link";

import { getManagedNavigation } from "@/lib/sitePages";
import { getSiteSettings } from "@/lib/siteSettings";
import { toAdminPath, toPublicSitePath } from "@/lib/routes";

const fixedNavItems = [
  { href: toPublicSitePath("/programlar"), label: "Programlar" },
  { href: toPublicSitePath("/lokasyonlar"), label: "Lokasyonlar" },
];

export async function Header() {
  const [managedNavItems, settings] = await Promise.all([getManagedNavigation("header"), getSiteSettings()]);
  const whatsappNumber = settings.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905551112233";
  const navItems = [
    ...fixedNavItems,
    ...managedNavItems.map((item) => ({ ...item, href: toPublicSitePath(item.href) })),
    ...(process.env.NODE_ENV === "development" ? [{ href: toAdminPath(), label: "Yönetim" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#fbfaf6]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Ana sayfa">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#214d3f] text-white">
            <Compass size={20} aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block text-sm font-semibold uppercase text-[#214d3f]">
              Dört Mevsim
            </span>
            <span className="block text-sm text-stone-600">Doğada</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#214d3f]">
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#d9783d] px-4 text-sm font-semibold text-white transition hover:bg-[#bf6530]"
          href={`https://wa.me/${whatsappNumber}`}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircle size={17} aria-hidden="true" />
          WhatsApp
        </a>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-3 text-sm text-stone-700 lg:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
