import { AdminLandingEditor } from "@/components/admin-landing-editor";
import { AppShell } from "@/components/app-shell";
import { getLandingContentFromStorage } from "@/lib/landing-content-server";
import { MonitorPlay, LayoutTemplate } from "lucide-react";

export default async function AdminLandingPage() {
  const result = await getLandingContentFromStorage();

  return (
    <AppShell
      role="admin"
      eyebrow="Vitrin Yönetimi"
      title="Landing Page CMS"
      primaryAction={{ href: "/admin/landing", label: "Vitrini Düzenle" }}
      contextCard={{
        eyebrow: "Sistem Durumu",
        title: result.updatedAt ? "Canlı veri devrede" : "Fallback içerik aktif",
        badge: result.error ? "Depolama Uyarısı" : "CMS Hazır",
      }}
    >
      <div className="grid grid-cols-1 gap-8 pb-12">
        <div className="rounded-[3rem] bg-white border border-slate-100 p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
             <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
               <div className="bg-fuchsia-50 p-3 rounded-2xl shadow-sm border border-fuchsia-100">
                 <LayoutTemplate className="w-6 h-6 text-fuchsia-600" />
               </div>
               Landing CMS Editörü Düğümü
             </h2>
           </div>
           
           <div className="[&_.bg-background]:bg-slate-50 [&_.border-border]:border-slate-200 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-md">
             <AdminLandingEditor
               initialContent={result.content}
               updatedAt={result.updatedAt}
               storageError={result.error}
             />
           </div>
        </div>
      </div>
    </AppShell>
  );
}
