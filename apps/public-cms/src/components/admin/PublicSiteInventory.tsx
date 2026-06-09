"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Eye,
  FilePenLine,
  Filter,
  Plus,
  Search,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

import type { PublicSiteInventoryItem, PublicSiteType } from "@/lib/publicSite";

const typeLabels: Record<PublicSiteType, string> = {
  custom: "Custom",
  gallery: "Galeri",
  home: "Ana sayfa",
  landing: "Landing",
  news: "Haber",
  program: "Program",
  system: "Sistem",
};

const statusLabels = {
  draft: "Taslak",
  published: "Yayında",
  "published-with-draft": "Yayında + taslak",
  review: "İncelemede",
};

export function PublicSiteInventory({ items }: { items: PublicSiteInventoryItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return items.filter((item) => {
      const matchesQuery =
        !normalized ||
        item.title.toLocaleLowerCase("tr-TR").includes(normalized) ||
        item.path.toLocaleLowerCase("tr-TR").includes(normalized);
      const matchesStatus =
        status === "all" ||
        item.status === status ||
        (status === "critical" && item.criticalCount > 0) ||
        (status === "seo" && item.warningCount > 0);
      return matchesQuery && matchesStatus && (type === "all" || item.type === type);
    });
  }, [items, query, status, type]);

  return (
    <div className="dmd-inventory">
      <header className="dmd-inventory__header">
        <div>
          <p>Yayın Merkezi</p>
          <h1>Public Site CMS</h1>
          <span>Tüm public URL’leri, yayın durumlarını ve hazırlık kontrollerini tek merkezden yönetin.</span>
        </div>
        <details className="dmd-create-menu">
          <summary><Plus size={16} /> İçerik kısayolları</summary>
          <div>
            <Link href="/admin2/collections/site-pages/create?pageType=landing">Landing sayfası</Link>
            <Link href="/admin2/collections/site-pages/create?pageType=custom">Custom sayfa</Link>
            <Link href="/admin2/collections/galleries/create">Galeri</Link>
            <Link href="/admin2/collections/headlines/create">Haber</Link>
            <Link href="/admin2/collections/programs/create">Program</Link>
            <Link href="/admin2/collections/locations/create">Lokasyon</Link>
            <Link href="/admin2/collections/testimonials/create">Yorum</Link>
            <Link href="/admin2/collections/partners/create">Partner</Link>
            <Link href="/admin2/globals/site-settings">Site ayarları</Link>
          </div>
        </details>
      </header>

      <section className="dmd-inventory__summary" aria-label="Public site özeti">
        <div><strong>{items.length}</strong><span>Public URL</span></div>
        <div><strong>{items.filter((item) => item.status === "published").length}</strong><span>Yayında</span></div>
        <div><strong>{items.filter((item) => item.status === "review").length}</strong><span>İncelemede</span></div>
        <div><strong>{items.filter((item) => item.criticalCount > 0).length}</strong><span>Kritik eksikli</span></div>
      </section>

      <section className="dmd-inventory__toolbar">
        <label>
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sayfa adı veya URL ara" />
        </label>
        <div>
          <Filter size={15} />
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">Tüm türler</option>
            {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Tüm durumlar</option>
            <option value="draft">Taslak</option>
            <option value="review">İncelemede</option>
            <option value="published">Yayında</option>
            <option value="critical">Kritik eksik</option>
            <option value="seo">SEO uyarısı</option>
          </select>
        </div>
      </section>

      <section className="dmd-inventory__table">
        <div className="dmd-inventory__row dmd-inventory__row--head">
          <span>Sayfa</span><span>Tür</span><span>Yayın</span><span>Hazırlık</span><span>SEO</span><span>Güncelleme</span><span>İşlemler</span>
        </div>
        {filtered.map((item) => (
          <div className="dmd-inventory__row" key={`${item.source}-${item.editHref}`}>
            <div className="dmd-inventory__page"><strong>{item.title}</strong><small>{item.path}</small></div>
            <span className="dmd-inventory__type">{typeLabels[item.type]}</span>
            <span className={`dmd-status dmd-status--${item.status}`}>{statusLabels[item.status]}</span>
            <span className={item.criticalCount ? "dmd-readiness dmd-readiness--critical" : "dmd-readiness"}>
              {item.criticalCount ? <TriangleAlert size={15} /> : <CheckCircle2 size={15} />}
              {item.criticalCount ? `${item.criticalCount} kritik` : `%${item.readiness}`}
            </span>
            <span>{item.warningCount ? `${item.warningCount} uyarı` : "Hazır"}</span>
            <time>{new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.updatedAt))}</time>
            <div className="dmd-inventory__actions">
              <Link href={item.editHref} title="Düzenle"><FilePenLine size={16} /></Link>
              <a href={`${item.previewHref}?preview=true`} target="_blank" rel="noreferrer" title="Önizle"><Eye size={16} /></a>
              <a href={item.previewHref} target="_blank" rel="noreferrer" title="Public sayfayı aç"><ArrowUpRight size={16} /></a>
            </div>
          </div>
        ))}
        {!filtered.length ? <div className="dmd-inventory__empty">Bu filtrelerle eşleşen public sayfa bulunamadı.</div> : null}
      </section>
    </div>
  );
}
