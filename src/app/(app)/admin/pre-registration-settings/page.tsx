import { AdminPreRegistrationSettingsForm } from "@/components/admin-pre-registration-settings-form";
import { AdminPreRegistrationFieldsEditor } from "@/components/admin-pre-registration-fields-editor";
import { AppShell } from "@/components/app-shell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { defaultPreRegistrationFields } from "@/lib/pre-registration";
import { getAdminPreRegistrationSettings } from "@/lib/pre-registration-server";
import { ShieldCheck, ToggleLeft, Scale, Scale3D, FileText, ImagePlus, ScrollText } from "lucide-react";

export default async function AdminPreRegistrationSettingsPage() {
  const { settings, fields = defaultPreRegistrationFields, error } = await getAdminPreRegistrationSettings();

  return (
    <AppShell
      role="admin"
      eyebrow="On Kayit Konfigurasyonu"
      title="Form & Yasal Metin Yonetimi"
      primaryAction={{ href: "/admin/pre-registration-settings", label: "Ayar sayfasini yenile" }}
      contextCard={{
        eyebrow: "On Kayit Modali",
        title: settings.formEnabled ? "Form Aktif Edildi" : "Form Pasif",
        badge: "Public Form",
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
            <div className="text-[10px] uppercase tracking-widest font-bold text-blue-600">Form Basligi</div>
          </div>
          <div className="text-3xl font-black text-blue-950 flex items-end gap-2">
            {settings.formTitle.length} <span className="text-sm font-semibold text-blue-400/80 mb-1">karakter</span>
          </div>
        </div>

        <div className="bg-violet-50 rounded-[2rem] p-6 shadow-sm border border-violet-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-violet-100 p-2.5 rounded-xl"><ImagePlus className="w-5 h-5 text-violet-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-violet-600">Form Logosu</div>
          </div>
          <div className="text-3xl font-black text-violet-950 flex items-end gap-2">
            {settings.formLogoUrl ? "Yuklu" : "Bos"} <span className="text-sm font-semibold text-violet-400/80 mb-1">durum</span>
          </div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><FileText className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Yasal Metin Hacmi</div>
          </div>
          <div className="text-3xl font-black text-amber-950 flex items-end gap-2">
            {settings.kvkkBody.length + settings.parentPermissionBody.length} <span className="text-sm font-semibold text-amber-400/80 mb-1">karakter</span>
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
               Public Form Kontrolleri
             </h2>
           </div>
           
           {error && (
             <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-bold">
               {error}
             </div>
           )}

           <div className="grid gap-5 md:grid-cols-2">
             <Dialog>
               <DialogTrigger asChild>
                 <button className="group rounded-[2.2rem] border border-slate-200 bg-slate-50/80 p-6 text-left transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_40px_-22px_rgba(12,87,220,0.28)]">
                   <div className="mb-5 flex items-start justify-between gap-4">
                     <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                       <ImagePlus className="h-6 w-6" />
                     </div>
                     <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                       Modal Editor
                     </span>
                   </div>
                   <div className="text-2xl font-black tracking-tight text-slate-900">Hemen Kayit Formu</div>
                   <p className="mt-3 text-sm leading-7 text-slate-500">
                     Formun logosunu, ust etiketini, basligini, aciklamasini ve yardimci notunu tek modal icinde yonet.
                   </p>
                   <div className="mt-5 inline-flex items-center text-sm font-semibold text-sky-700">
                     Form editorunu ac
                   </div>
                 </button>
               </DialogTrigger>
               <DialogContent className="w-[min(94vw,1100px)] max-w-[1100px] overflow-hidden p-0">
                 <div className="flex max-h-[88vh] flex-col">
                   <DialogHeader className="border-b border-slate-200 px-6 py-5 md:px-8">
                     <DialogTitle>Hemen Kayit Formu</DialogTitle>
                     <DialogDescription>
                       Public sitede acilan hemen kayit modalinin ust alanlari ve gorunum detaylari.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="overflow-y-auto px-6 py-6 md:px-8 md:py-8">
                     <div className="grid gap-8">
                       <AdminPreRegistrationSettingsForm settings={settings} mode="appearance" />
                       <div className="border-t border-slate-200 pt-8">
                         <AdminPreRegistrationFieldsEditor
                           key={fields.map((field) => `${field.id}:${field.section}:${field.sortOrder}:${field.active}`).join("|")}
                           fields={fields}
                         />
                       </div>
                     </div>
                   </div>
                 </div>
               </DialogContent>
             </Dialog>

             <Dialog>
               <DialogTrigger asChild>
                 <button className="group rounded-[2.2rem] border border-slate-200 bg-slate-50/80 p-6 text-left transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_40px_-22px_rgba(217,119,6,0.25)]">
                   <div className="mb-5 flex items-start justify-between gap-4">
                     <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                       <ScrollText className="h-6 w-6" />
                     </div>
                     <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                       Modal Editor
                     </span>
                   </div>
                   <div className="text-2xl font-black tracking-tight text-slate-900">Yasal Form Baslik ve Icerikleri</div>
                   <p className="mt-3 text-sm leading-7 text-slate-500">
                     KVKK ve veli izin metinlerini, checkbox etiketlerini ve acilan yasal panel basliklarini yonet.
                   </p>
                   <div className="mt-5 inline-flex items-center text-sm font-semibold text-amber-700">
                     Yasal editoru ac
                   </div>
                 </button>
               </DialogTrigger>
               <DialogContent className="w-[min(94vw,960px)] max-w-[960px] overflow-hidden p-0">
                 <div className="flex max-h-[88vh] flex-col">
                   <DialogHeader className="border-b border-slate-200 px-6 py-5 md:px-8">
                     <DialogTitle>Yasal Form Baslik ve Icerikleri</DialogTitle>
                     <DialogDescription>
                       Public modalde acilan KVKK ve veli izin alanlarinin tam metin yonetimi.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="overflow-y-auto px-6 py-6 md:px-8 md:py-8">
                     <AdminPreRegistrationSettingsForm settings={settings} mode="legal" />
                   </div>
                 </div>
               </DialogContent>
             </Dialog>
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
               <p>Landing icindeki hemen kayit modali dogrudan buradaki ayarlardan beslenir.</p>
               <p>Form ve yasal metin editorleri ayri modal olarak calisir; ekip hangi alani guncelliyorsa yalniz onu acar.</p>
               <p>Yalnizca admin bu alani guncelleyebilir. Degisiklikler public modale aninda yansir.</p>
             </div>

             <div className="relative z-10 mt-8 rounded-[1.8rem] border border-white/10 bg-white/5 p-4">
               <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200/80">Logo Durumu</div>
               <div className="mt-3 text-lg font-semibold text-white">
                 {settings.formLogoUrl ? "Form logosu yuklu" : "Form logosu bekleniyor"}
               </div>
               <div className="mt-2 text-sm text-indigo-100/70">
                 Logo yuklediginde public modalin baslik alaninin ustunde gorunur.
               </div>
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
