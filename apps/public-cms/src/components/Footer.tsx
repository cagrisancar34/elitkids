import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { getManagedNavigation } from "@/lib/sitePages";
import { getSiteSettings } from "@/lib/siteSettings";
import { toPublicSitePath } from "@/lib/routes";

export async function Footer() {
  const [footerLinks, settings] = await Promise.all([getManagedNavigation("footer"), getSiteSettings()]);

  return (
    <footer className="bg-[#173d33] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-sm uppercase text-white/60">{settings.footerBrand}</p>
          <h2 className="mt-3 max-w-md text-3xl font-semibold">
            {settings.footerHeadline}
          </h2>
        </div>
        <div className="space-y-3 text-sm text-white/76">
          <p className="flex items-start gap-2">
            <MapPin size={17} aria-hidden="true" />
            {settings.address}
          </p>
          <p className="flex items-center gap-2">
            <Phone size={17} aria-hidden="true" />
            {settings.phone}
          </p>
          <p className="flex items-center gap-2">
            <Mail size={17} aria-hidden="true" />
            {settings.email}
          </p>
        </div>
        <div className="grid gap-2 text-sm text-white/76">
          {footerLinks.map((item) => (
            <Link key={item.href} href={toPublicSitePath(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/55">
        {settings.copyrightText}
      </div>
    </footer>
  );
}
