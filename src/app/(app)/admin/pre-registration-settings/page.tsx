import { AdminPreRegistrationSettingsForm } from "@/components/admin-pre-registration-settings-form";
import { AppShell } from "@/components/app-shell";
import { getAdminPreRegistrationSettings } from "@/lib/pre-registration-server";
import { ShieldCheck, ToggleLeft, Scale, Scale3D, FileText, FileSignature } from "lucide-react";

export default async function AdminPreRegistrationSettingsPage() {
  const { settings, error } = await getAdminPreRegistrationSettings();

  return (
    <AppShell
      role="admin"
      eyebrow="Ön Kayıt Konfigürasyonu"
      title="Yasal & KVKK Yönetimi"
      primaryAction={{ href: "/admin/pre-registration-settings", label: "Metinleri Yenile" }}
      contextCard={{
        eyebrow: "Yasal Metin Akışı",
        title: settings.formEnabled ? "Form Aktif Edildi" : "Form Pasif",
        badge: "Yasal Metinler",
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-50 rounded-[2rem] p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-2.5 rounded-xl ${settings.formEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}>
              <ToggleLeft className="w-5 h-5 text-white" />
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Public Açık Mı?</div>
          </div>
          <div className="text-3xl font-black text-slate-800">{settings.formEnabled ? "Açık" : "Kapalı"}</div>
        </div>

        <div className="bg-blue-50 rounded-[2rem] p-6 shadow-sm border border-blue-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-100 p-2.5 rounded-xl"><Scale className="w-5 h-5 text-blue-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-blue-600">KVKK Hacmi</div>
          </div>
          <div className="text-3xl font-black text-blue-950 flex items-end gap-2">
            {settings.kvkkBody.length} <span className="text-sm font-semibold text-blue-400/80 mb-1">karakter</span>
          </div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100 p-2.5 rounded-xl"><FileSignature className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">Veli İzin Metni</div>
          </div>
          <div className="text-3xl font-black text-violet-950 flex items-end gap-2">
            {settings.parentPermissionBody.length} <span className="text-sm font-semibold text-violet-400/80 mb-1">karakter</span>
          </div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><FileText className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Bilgilendirme Notu</div>
          </div>
          <div className="text-3xl font-black text-amber-950 flex items-end gap-2">
            {settings.helperNote.length} <span className="text-sm font-semibold text-amber-400/80 mb-1">karakter</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="md:col-span-8 rounded-[3rem] bg-white border border-slate-100 p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
             <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-4">
               <div className="bg-emerald-50 p-3 rounded-2xl shadow-sm border border-emerald-100">
                 <ShieldCheck className="w-6 h-6 text-emerald-600" />
               </div>
               Yasal Form Başlık ve İçerikleri
             </h2>
           </div>
           
           {error && (
             <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-bold">
               {error}
             </div>
           )}
           
           <div className="[&_.bg-background]:bg-slate-50 [&_.border-border]:border-slate-200 [&_.rounded-xl]:rounded-2xl">
             <AdminPreRegistrationSettingsForm settings={settings} />
           </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-b from-[#1e1b4b] to-black border border-indigo-900/50 p-8 shadow-[0_20px_50px_-15px_rgba(49,46,129,0.5)] relative overflow-hidden">
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
             
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem] border border-white/10">
                 <Scale3D className="w-5 h-5 text-indigo-300" />
               </div>
               <h2 className="text-2xl font-black text-white tracking-tight">Merkezi Dağıtım</h2>
             </div>
             
             <div className="relative z-10 space-y-4 text-sm font-medium text-indigo-100/70 leading-relaxed">
               <p>Landing içindeki ön kayıt drawer'ı doğrudan buradaki ayarlardan beslenir.</p>
               <p>Yönetici metni değiştirdiğinde hem KVKK hem veli izni belgesi milisaniyeler içinde tüm ziyaretçiler için yenilenir.</p>
               <p>Yalnızca Sistem Yöneticisi bu metinleri güncelleyebilir. Saha Yöneticileri yalnızca okuma yetkisine sahiptir.</p>
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
