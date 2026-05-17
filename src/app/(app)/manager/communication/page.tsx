import { AppShell } from "@/components/app-shell";
import { AnnouncementComposer } from "@/components/announcement-composer";
import { AnnouncementsPanel } from "@/components/announcements-panel";
import { ManagerCommunicationAsyncSections } from "@/components/manager-communication-async-sections";
import { ManagerSupportThreadsPanel } from "@/components/manager-support-threads-panel";
import { NotificationQueuePanel } from "@/components/notification-queue-panel";
import {
  getAnnouncementsData,
  getNotificationData,
  getSupportThreadsData,
} from "@/lib/dashboard/manager-data";
import type { SupportThreadStatusKey } from "@/lib/types";
import { Megaphone, BellRing, MessageSquare, AlertCircle, PlusCircle, HeadphonesIcon } from "lucide-react";

export default async function ManagerCommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ supportStatus?: string; supportThread?: string }>;
}) {
  const params = await searchParams;
  const [
    announcements,
    notifications,
    supportThreads,
  ] = await Promise.all([
    getAnnouncementsData(),
    getNotificationData(),
    getSupportThreadsData(),
  ]);
  const queuedNotifications = notifications.filter((item) =>
    item.status.toLocaleLowerCase("tr-TR").includes("hazir"),
  );
  const openThreads = supportThreads.filter((thread) =>
    thread.status.toLocaleLowerCase("tr-TR").includes("bekli"),
  );
  const initialSupportStatus =
    params.supportStatus === "open" || params.supportStatus === "waiting_parent" || params.supportStatus === "resolved"
      ? (params.supportStatus as SupportThreadStatusKey)
      : "all";

  return (
    <AppShell
      role="manager"
      eyebrow="Mesajlaşma & Destek"
      title="İletişim Merkezi"
      primaryAction={{ href: "#", label: "Yeni Duyuru Çık" }}
      contextCard={{
        eyebrow: "Sinyal Odası",
        title: `${announcements.length} Aktif Yayın`,
        badge: `${openThreads.length} Bekleyen Destek`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-sky-100 p-2.5 rounded-xl"><Megaphone className="w-5 h-5 text-sky-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-sky-600">DUYURU</div>
          </div>
          <div className="text-4xl font-black text-sky-950">{announcements.length}</div>
          <div className="text-sm font-medium text-sky-600/70 mt-2">Aktif Yayın Panosu</div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><BellRing className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">KUYRUK</div>
          </div>
          <div className="text-4xl font-black text-amber-950">{queuedNotifications.length}</div>
          <div className="text-sm font-medium text-amber-600/70 mt-2">Bekleyen Bildirim</div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100 p-2.5 rounded-xl"><MessageSquare className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">DESTEK</div>
          </div>
          <div className="text-4xl font-black text-violet-950">{supportThreads.length}</div>
          <div className="text-sm font-medium text-violet-600/70 mt-2">Toplam Thread</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100 p-2.5 rounded-xl"><AlertCircle className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">ACİL KOD</div>
          </div>
          <div className="text-4xl font-black text-rose-950">{openThreads.length}</div>
          <div className="text-sm font-medium text-rose-600/70 mt-2">Yanıt Bekleyen Talep</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><Megaphone className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kurum Duyuruları</h2>
            </div>
            
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
              <AnnouncementsPanel announcements={announcements} />
            </div>
          </div>

          <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
               <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><BellRing className="w-6 h-6 text-slate-500" /></div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kuyruktaki Bildirimler</h2>
            </div>
            
            <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-slate-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
              <NotificationQueuePanel notifications={notifications} />
            </div>
          </div>

          <ManagerCommunicationAsyncSections />
        </div>

        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem] backdrop-blur-md">
                 <PlusCircle className="w-5 h-5 text-sky-400" />
               </div>
               <h2 className="text-xl font-black tracking-tight">Yeni Duyuru Yayını</h2>
             </div>
             
             <p className="text-sm leading-relaxed text-slate-300 font-medium relative z-10 mb-8">
               Kurum geneline, koça veya veli kitlesine hedefli acil mesaj veya planlı duyuru gönder.
             </p>

             <div className="relative z-10 w-full p-4 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md [&_.rounded-md]:rounded-xl [&_.border-input]:border-slate-700/50 [&_.text-foreground]:text-slate-200">
                <AnnouncementComposer />
             </div>
          </div>

          <div className="rounded-[3rem] bg-white border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                 <HeadphonesIcon className="w-6 h-6 text-slate-600" />
               </div>
               <h3 className="text-lg font-black text-slate-800">Bekleyen Destek Talepleri</h3>
             </div>
             
             <div className="space-y-3">
                <ManagerSupportThreadsPanel
                  threads={supportThreads}
                  initialStatusFilter={initialSupportStatus}
                  focusThreadId={params.supportThread ?? null}
                />
             </div>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
