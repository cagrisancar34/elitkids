import { Siren, Sparkles } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { DashboardPage } from "@/components/dashboard-page";
import {
  WorkspaceContentLayout,
  WorkspaceHighlight,
  WorkspaceKpiCard,
  WorkspaceMainColumn,
  WorkspacePanel,
  WorkspaceSideColumn,
  WorkspaceStatGrid,
} from "@/components/operations-workspace";
import { getAuditLogRows, getLeadSubmissionRows } from "@/lib/dashboard-data";

export default async function AdminSecurityPage() {
  const [auditRows, leadRows] = await Promise.all([
    getAuditLogRows(),
    getLeadSubmissionRows(),
  ]);

  return (
    <DashboardPage
      role="admin"
      eyebrow="Guvenlik ve denetim"
      title="Audit ve sistem kayitlari"
      description="Landing editoru, kullanici yonetimi ve public basvuru akislarinda olusan kritik kayitlar burada toplanir."
      primaryAction={{ href: "/admin/security", label: "Audit kayitlarini ac" }}
      contextCard={{
        eyebrow: "Guvenlik sinyali",
        title: `${auditRows.length} audit · ${leadRows.length} lead`,
        description: "Kritik sistem aksiyonlari ve public basvuru akislari ayni denetim katmaninda toplanir.",
        badge: "Audit aktif",
      }}
    >
      <WorkspaceStatGrid>
        <WorkspaceKpiCard label="Audit kaydi" value={auditRows.length} description="Landing, rol ve ayar degisikliklerinden uretilen olaylar." badge="Audit" />
        <WorkspaceKpiCard label="Yeni basvuru" value={leadRows.length} description="Public kayit CTA formundan gelen lead akisinin toplami." accent="blue" badge="Lead" />
        <WorkspaceKpiCard label="Kritik alan" value={3} description="Denetim, landing ve auth tarafinda korunmus ana kritik alanlar." accent="red" badge="Admin only" />
        <WorkspaceKpiCard label="Sinyal durumu" value="Canli" description="Audit ve lead toplama omurgasi ayni denetim katmaninda aktif." accent="green" badge="Aktif" />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Son audit olaylari"
            description="Landing update, rol degisikligi ve ayar degisiklikleri gibi kritik aksiyonlar kronolojik gorunur."
          >
            <DataTable
              columns={[
                { key: "event", label: "Olay" },
                { key: "actor", label: "Aktor" },
                { key: "scope", label: "Alan" },
                { key: "createdAt", label: "Tarih" },
              ]}
              rows={auditRows}
            />
          </WorkspacePanel>
          <WorkspacePanel
            title="Landing basvurulari"
            description="Public kayit CTA formundan gelen basvurular manager ve admin tarafindan takip edilebilir."
          >
            <DataTable
              columns={[
                { key: "fullName", label: "Ad soyad" },
                { key: "email", label: "E-posta" },
                { key: "phone", label: "Telefon" },
                { key: "status", label: "Durum" },
                { key: "createdAt", label: "Tarih" },
              ]}
              rows={leadRows}
            />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Denetim katmani"
            title="Audit log ve vitrin lead akisi ayni denetim katmaninda."
            description="Bu yuzey, public landing page uzerinden gelen kayit taleplerini ve admin tarafli kritik sistem aksiyonlarini izlemek icin eklendi."
            badge="Admin only"
            className="bg-[linear-gradient(180deg,#0d1628_0%,#13213d_100%)]"
          />
          <WorkspacePanel
            title="Denetim notlari"
            description="Security ve audit alanlari yalnizca admin yazma yetkisine sahip olacak sekilde ayrildi."
            contentClassName="grid gap-4"
          >
            {[
              "Manager rolune system-security yazma yetkisi verilmez.",
              "Public lead formu service-role ile yazilir; ham auth istemcisine birakilmaz.",
              "Landing editoru her kayitta audit izi birakir.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-white/50 bg-[#eef3ff] px-4 py-4 text-sm leading-7 text-foreground"
              >
                <div className="flex items-start gap-3">
                  <Siren className="mt-1 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              </div>
            ))}
            <div className="rounded-[1.25rem] border border-white/8 bg-[#0d1628] px-4 py-4 text-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-200">
                <Sparkles className="h-4 w-4" />
                Yeni audit omurgasi aktif
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Supabase migration 0007 ile audit_logs ve lead_submissions tablolari artik sistemin parcasi.
              </p>
            </div>
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
