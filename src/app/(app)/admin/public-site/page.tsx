import { AppShell } from "@/components/app-shell";
import { AdminPublicSiteCms } from "@/components/admin-public-site-cms";
import { listPublicPageInventoryFromStorage } from "@/lib/public-site-server";

type AdminPublicSitePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPublicSitePage({ searchParams }: AdminPublicSitePageProps) {
  const params = (await searchParams) ?? {};
  const requestedPage =
    typeof params.page === "string"
      ? params.page
      : typeof params.scope === "string" && params.scope === "seo"
        ? "seo:silivri-spor-okulu"
        : "home";

  const result = await listPublicPageInventoryFromStorage();
  const cmsKey = [
    requestedPage,
    result.pages.map((page) => `${page.id}:${page.updatedAt ?? "none"}:${page.status}`).join("|"),
  ].join("::");

  return (
    <AppShell
      role="admin"
      eyebrow="Public Vitrin"
      title="Public Site CMS"
      primaryAction={{ href: "/admin/public-site", label: "CMS Merkezini Yenile" }}
      contextCard={{
        eyebrow: "Yayin Omurgasi",
        title: `${result.pages.filter((page) => page.published).length} public sayfa yayinda`,
        badge: result.error ? "Depolama Uyarisi" : "Admin Kontrolu",
      }}
    >
      <div className="grid gap-8 pb-12">
        <div className="rounded-[3rem] bg-white border border-slate-100 p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <AdminPublicSiteCms
            key={cmsKey}
            pages={result.pages}
            storageError={result.error}
            initialPageId={requestedPage}
          />
        </div>
      </div>
    </AppShell>
  );
}
