import Link from "next/link";

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
import { Button } from "@/components/ui/button";
import {
  getChargeData,
  getLeadSubmissionRows,
  getManagerMetrics,
  getManagerStudents,
  getParentReportCards,
  getSessionsData,
} from "@/lib/dashboard-data";

function parseTry(value: string) {
  return Number(value.replace(/[^\d]/g, "") || 0);
}

export default async function ManagerReportsPage() {
  const [metrics, students, sessions, charges, leadRows, reportCards] = await Promise.all([
    getManagerMetrics(),
    getManagerStudents(),
    getSessionsData(),
    getChargeData(),
    getLeadSubmissionRows(),
    getParentReportCards(),
  ]);
  const openAmount = charges
    .filter((charge) => !charge.status.toLocaleLowerCase("tr-TR").includes("odendi"))
    .reduce((sum, charge) => sum + parseTry(charge.amount), 0);
  const attendanceValues = students
    .map((student) => Number(student.attendance.replace("%", "")))
    .filter((value) => !Number.isNaN(value));
  const averageAttendance = attendanceValues.length
    ? Math.round(attendanceValues.reduce((sum, value) => sum + value, 0) / attendanceValues.length)
    : 0;

  return (
    <DashboardPage
      role="manager"
      eyebrow="Operasyon raporlari"
      title="Raporlar"
      description="Kayit, seans, tahsilat, lead ve karne ciktilarini tek bir ozet workspace icinde toplayan karar yuzeyi."
      primaryAction={{ href: "/manager/reports", label: "Raporlari yenile" }}
      contextCard={{
        eyebrow: "Yonetim ozeti",
        title: `${students.length} ogrenci · ${sessions.length} seans`,
        description: "Bakiye, devam, lead ve karne verisini ayni panel ailesinde okuyup haftalik kararlarini hizlandir.",
        badge: `${reportCards.length} karne`,
      }}
    >
      <WorkspaceStatGrid>
        {metrics.map((metric) => (
          <WorkspaceKpiCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.delta}
            badge="Canli"
          />
        ))}
        <WorkspaceKpiCard
          label="Ort. devam"
          value={`%${averageAttendance}`}
          description="Kayitli ogrencilerden olusan ortalama devam orani."
          accent="green"
          badge="Performans"
        />
      </WorkspaceStatGrid>

      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel
            title="Operasyon ozeti"
            description="Kayit, acik bakiye, lead ve karne ciktilari ust yonetim icin ayni tabloda toplanir."
            contentClassName="pt-0"
          >
            <DataTable
              columns={[
                { key: "signal", label: "Sinyal" },
                { key: "value", label: "Deger" },
                { key: "meta", label: "Aciklama" },
                { key: "status", label: "Durum" },
              ]}
              rows={[
                {
                  signal: "Aktif ogrenci",
                  value: String(students.length),
                  meta: "Kayitli ogrenci havuzu",
                  status: "Aktif",
                },
                {
                  signal: "Planli seans",
                  value: String(sessions.length),
                  meta: "Takvimde gorunen acik seanslar",
                  status: "Aktif",
                },
                {
                  signal: "Acik bakiye",
                  value: `₺${openAmount.toLocaleString("tr-TR")}`,
                  meta: "Tahsil bekleyen toplam hacim",
                  status: openAmount > 0 ? "Takip" : "Odendi",
                },
                {
                  signal: "Lead havuzu",
                  value: String(leadRows.length),
                  meta: "Landing ve kayit akisindan gelen adaylar",
                  status: leadRows.length ? "Aktif" : "Planlandi",
                },
                {
                  signal: "Karne cikisi",
                  value: String(reportCards.length),
                  meta: "Kayitli detay verisi ile olusan karneler",
                  status: reportCards.length ? "Aktif" : "Planlandi",
                },
              ]}
            />
          </WorkspacePanel>

          <WorkspacePanel
            title="Son karne ciktilari"
            description="Detay kaydi tamamlanan ogrenciler icin olusan guncel karne ozetleri."
            contentClassName="pt-0"
          >
            <DataTable
              columns={[
                { key: "student", label: "Ogrenci" },
                { key: "summary", label: "Karne ozeti" },
                { key: "generatedAt", label: "Tarih" },
                { key: "status", label: "Durum" },
              ]}
              rows={reportCards.slice(0, 8).map((card) => ({
                student: card.studentName,
                summary: card.summary,
                generatedAt: card.generatedAt,
                status: "Aktif",
              }))}
            />
          </WorkspacePanel>
        </WorkspaceMainColumn>

        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Haftalik okuma"
            title="Kayit, lead, tahsilat ve karne ayni rapor ritminde."
            description="Raporlar artik ayri bir modül; operasyon overview’i ile karistirmadan yonetsel okumayi kolaylastiriyor."
            badge="Rapor merkezi"
          />
          <WorkspacePanel
            title="Lead akisi"
            description="Landing tarafindan gelen kayit talepleri ve durumlari."
            contentClassName="grid gap-3"
          >
            {leadRows.length ? (
              leadRows.slice(0, 4).map((lead) => (
                <div key={`${lead.email}-${lead.createdAt}`} className="surface-muted rounded-[1.2rem] p-4">
                  <div className="font-medium text-foreground">{lead.fullName}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{lead.email}</div>
                  <div className="mt-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                    {lead.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-muted rounded-[1.2rem] p-4 text-sm text-muted-foreground">
                Henüz lead kaydi yok.
              </div>
            )}
          </WorkspacePanel>
          <WorkspacePanel
            title="Hizli aksiyon"
            description="Raporlardan cikardigin aksiyonlari dogrudan ogrenci veya odeme modullerine tasiyabilirsin."
          >
            <div className="grid gap-3">
              <Button asChild className="w-full">
                <Link href="/manager/students">Ogrenci listesine git</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/manager/payments">Odeme merkezine git</Link>
              </Button>
            </div>
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
