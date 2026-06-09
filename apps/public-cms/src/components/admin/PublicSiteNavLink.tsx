"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@payloadcms/ui";

import { toAdminPath } from "@/lib/routes";

export function PublicSiteNavLink() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (user?.role === "form-tracker") return null;

  const links = [
    { href: toAdminPath("/public-site"), label: "Public Site CMS" },
    { href: toAdminPath("/events"), label: "Events Yönetimi" },
  ];

  return (
    <div className="dmd-public-site-link">
      <span>Yayın Merkezi</span>
      <div className="dmd-public-site-link__links">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <Link key={link.href} href={link.href} className={isActive ? "is-active" : undefined}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
