import type { AdminViewServerProps } from "payload";
import Link from "next/link";

import { getPublicInventory } from "@/lib/publicInventory";

const statusLabels = {
  draft: "Taslak",
  published: "Yayında",
  "published-with-draft": "Yayında + taslak",
  review: "İncelemede",
};

export async function AdminDashboard(props: AdminViewServerProps) {
  const payload = props.initPageResult.req.payload;
  const user = props.initPageResult.req.user;
  if (user?.role === "form-tracker") {
    const recentApplications = await payload.find({ collection: "applications", limit: 10, sort: "-createdAt" });
    return (
      <main className="dmd-dashboard">
        <header className="dmd-dashboard__header">
          <div><p>Events Yönetimi</p><h1>Başvuru takip merkezi</h1><span>Yeni talepleri görüntüleyin, görüşme durumunu ve ekip notlarını güncelleyin.</span></div>
        </header>
        <section className="dmd-dashboard__section">
          <div className="dmd-dashboard__section-heading"><div><p>Son talepler</p><h2>Başvurular</h2></div><Link href="/admin2/collections/applications">Tümünü gör</Link></div>
          <div className="dmd-applications">
            {recentApplications.docs.map((application) => (
              <Link key={application.id} href={`/admin2/collections/applications/${application.id}`} className="dmd-application">
                <span><strong>{application.fullName}</strong><small>{application.programTitle || "Genel bilgi talebi"}</small></span>
                <em>{application.status === "new" ? "Yeni" : "Takipte"}</em>
              </Link>
            ))}
          </div>
        </section>
      </main>
    );
  }
  const [inventory, newApplications, recentApplications] = await Promise.all([
    getPublicInventory(payload),
    payload.count({ collection: "applications", where: { status: { equals: "new" } } }),
    payload.find({ collection: "applications", limit: 5, sort: "-createdAt" }),
  ]);

  const metrics = [
    { label: "Yayındaki public URL", value: inventory.filter((item) => item.status === "published").length },
    { label: "İnceleme bekleyen", value: inventory.filter((item) => item.status === "review").length },
    { label: "Kritik eksiği bulunan", value: inventory.filter((item) => item.criticalCount > 0).length },
    { label: "Yeni başvuru", value: newApplications.totalDocs },
  ];
  const queue = inventory
    .filter((item) => item.status === "review" || item.criticalCount > 0)
    .sort((a, b) => b.criticalCount - a.criticalCount)
    .slice(0, 7);

  return (
    <main className="dmd-dashboard">
      <header className="dmd-dashboard__header">
        <div>
          <p>Events Yönetimi</p>
          <h1>Merhaba, {user?.name || "yönetici"}</h1>
          <span>Etkinlik operasyonunu, public site yayın akışını ve başvuruları tek çalışma alanından yönetin.</span>
        </div>
        <div className="dmd-dashboard__header-actions">
          <Link href="/admin2/public-site">Public Site CMS</Link>
          <a href="/" target="_blank" rel="noreferrer">Canlı siteyi aç</a>
        </div>
      </header>

      <section className="dmd-dashboard__metrics" aria-label="Yayın göstergeleri">
        {metrics.map((metric) => (
          <div key={metric.label} className="dmd-metric">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      <section className="dmd-dashboard__section dmd-dashboard__section--queue">
        <div className="dmd-dashboard__section-heading">
          <div><p>Öncelikli işler</p><h2>Yayın kuyruğu</h2></div>
          <Link href="/admin2/public-site">Tüm public site envanteri</Link>
        </div>
        <div className="dmd-operations-table">
          <div className="dmd-operations-row dmd-operations-row--head"><span>İçerik</span><span>Durum</span><span>Hazırlık</span><span></span></div>
          {queue.length ? queue.map((item) => (
            <div className="dmd-operations-row" key={item.editHref}>
              <span><strong>{item.title}</strong><small>{item.path}</small></span>
              <em>{statusLabels[item.status]}</em>
              <span>{item.criticalCount ? `${item.criticalCount} kritik eksik` : `%${item.readiness} hazır`}</span>
              <Link href={item.editHref}>Düzenle</Link>
            </div>
          )) : <div className="dmd-dashboard__empty">Yayın kuyruğunda bekleyen içerik bulunmuyor.</div>}
        </div>
      </section>

      <div className="dmd-dashboard__columns">
        <section className="dmd-dashboard__section">
          <div className="dmd-dashboard__section-heading"><div><p>Son hareketler</p><h2>Güncellenen public içerikler</h2></div></div>
          <div className="dmd-operations-table">
            {inventory.slice(0, 6).map((item) => (
              <div className="dmd-operations-row dmd-operations-row--compact" key={item.editHref}>
                <span><strong>{item.title}</strong><small>{item.path}</small></span>
                <em>{statusLabels[item.status]}</em>
                <Link href={item.editHref}>Aç</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="dmd-dashboard__section">
          <div className="dmd-dashboard__section-heading">
            <div><p>Operasyon</p><h2>Yeni başvurular</h2></div>
            <Link href="/admin2/collections/applications">Tümünü gör</Link>
          </div>
          <div className="dmd-applications">
            {recentApplications.docs.length ? recentApplications.docs.map((application) => (
              <Link key={application.id} href={`/admin2/collections/applications/${application.id}`} className="dmd-application">
                <span><strong>{application.fullName}</strong><small>{application.programTitle || "Genel bilgi talebi"}</small></span>
                <em>{application.status === "new" ? "Yeni" : "Takipte"}</em>
              </Link>
            )) : <div className="dmd-dashboard__empty">Henüz başvuru bulunmuyor.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
