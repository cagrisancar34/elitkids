import { DashboardPage } from "@/components/dashboard-page";
import { WorkspaceContentLayout, WorkspaceHighlight, WorkspaceMainColumn, WorkspacePanel, WorkspaceSideColumn } from "@/components/operations-workspace";
import { ParentSupportPanel } from "@/components/parent-support-panel";
import { SupportComposeSheet } from "@/components/support-compose-sheet";
import { getSupportThreadsData } from "@/lib/dashboard/parent-data";

export default async function ParentSupportPage() {
  const threads = await getSupportThreadsData();
  const openThreads = threads.filter((thread) => thread.statusKey !== "resolved").length;
  const waitingParent = threads.filter((thread) => thread.statusKey === "waiting_parent").length;

  return (
    <DashboardPage
      role="parent"
      eyebrow="Veli / Iletisim"
      title="Destek Merkezi"
      description="Talep acmak, durum takip etmek ve yazismayi ayni sakin mesaj yuzeyinde tutar."
      primaryAction={{ href: "/parent/support", label: "Yeni talep" }}
      contextCard={{
        eyebrow: "Destek akisi",
        title: `${openThreads} acik talep`,
        description: `${waitingParent} kayit veli yaniti bekliyor.`,
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
            description="Destek yuzeyi daha yumusak ama ayni urun ailesine ait utility rail hiyerarsisini korur."
            badge="Sheet akis"
          >
            <div className="page-subsection rounded-[1.4rem] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Acik talep
              </div>
              <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-900">
                {openThreads}
              </div>
            </div>
            <div className="page-subsection rounded-[1.4rem] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Veli yaniti bekleyen
              </div>
              <div className="mt-2 font-display text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-900">
                {waitingParent}
              </div>
            </div>
          </WorkspaceHighlight>
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
