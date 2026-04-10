import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceContentLayout, WorkspaceHighlight, WorkspaceMainColumn, WorkspacePanel, WorkspaceSideColumn } from "@/components/operations-workspace";
import { ParentSupportPanel } from "@/components/parent-support-panel";
import { SupportComposeSheet } from "@/components/support-compose-sheet";
import { getSupportThreadsData } from "@/lib/dashboard-data";

export default async function ParentSupportPage() {
  const threads = await getSupportThreadsData();

  return (
    <DashboardPage
      role="parent"
      eyebrow="Mesaj ve talepler"
      title="Destek merkezi"
      description="Kayit yenileme, dekont teyidi ve operasyonel destek talepleri ayni sade mesajlasma yapisinda toplanir."
      primaryAction={{ href: "/parent/support", label: "Yeni talep" }}
      contextCard={{
        eyebrow: "Destek akisi",
        title: `${threads.length} acik talep`,
        description: "Talep acmak, mesaj yazmak ve durum takip etmek tek yerde kalir.",
        badge: "Mesaj merkezi",
      }}
    >
      <WorkspaceContentLayout>
        <WorkspaceMainColumn>
          <WorkspacePanel title="Acik talepler" description="Son guncellenen destek dizileri." contentClassName="pt-0">
            <ParentSupportPanel threads={threads} />
          </WorkspacePanel>
        </WorkspaceMainColumn>
        <WorkspaceSideColumn>
          <WorkspaceHighlight
            eyebrow="Destek akisi"
            title="Talep acmak, mesaj yazmak ve durum takip etmek tek yerde kalir."
            description="Veli tarafinda destek yuzeyi daha yumusak ama yine Stitch'teki editorial blok duzenini tasiyor."
            badge="Sheet akis"
          />
          <WorkspacePanel
            title="Yeni talep ac"
            description="Yeni talebi sheet icinde acip ekran akisini bozmadan gonderebilirsin."
            contentClassName="grid gap-4"
          >
            <SupportComposeSheet />
          </WorkspacePanel>
        </WorkspaceSideColumn>
      </WorkspaceContentLayout>
    </DashboardPage>
  );
}
