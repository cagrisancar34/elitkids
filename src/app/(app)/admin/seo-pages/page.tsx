import { AdminSeoPagesEditor } from "@/components/admin-seo-pages-editor";
import { AppShell } from "@/components/app-shell";
import { getSeoPagesFromStorage } from "@/lib/seo-pages-server";
import { FileDown, Globe, PencilRuler, Search, AlignLeft, Info } from "lucide-react";

export default async function AdminSeoPagesPage() {
  const result = await getSeoPagesFromStorage();
  const publishedCount = result.pages.filter((page) => page.content.published).length;

  return (
    <AppShell
      role="admin"
      eyebrow="Sayfa Yönetimi"
      title="SEO Sayfaları"
      primaryAction={{ href: "/admin/seo-pages", label: "SEO Editörünü Yenile" }}
      contextCard={{
        eyebrow: "Arama Motoru Mimarisi",
        title: `${publishedCount} SEO sayfası endekslemede`,
        badge: "Yayında",
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-50 rounded-[2rem] p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-900 p-2.5 rounded-xl"><FileDown className="w-5 h-5 text-white" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Tüm Kayıtlar</div>
          </div>
          <div className="text-4xl font-black text-slate-800">{result.pages.length}</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><Globe className="w-5 h-5 text-emerald-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">Yayında</div>
          </div>
          <div className="text-4xl font-black text-emerald-950">{publishedCount}</div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><PencilRuler className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Taslak</div>
          </div>
          <div className="text-4xl font-black text-amber-950">{result.pages.length - publishedCount}</div>
        </div>

        <div className="bg-indigo-50 rounded-[2rem] p-6 shadow-sm border border-indigo-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-indigo-100 p-2.5 rounded-xl"><Search className="w-5 h-5 text-indigo-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-600">Lokal Hedef</div>
          </div>
          <div className="text-xl mt-3 font-black text-indigo-950 uppercase tracking-widest">Silivri</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
        {/* MAIN COLUMN */}
        <div className="md:col-span-8 rounded-[3rem] bg-white border border-slate-100 p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
           <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
             <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><AlignLeft className="w-6 h-6 text-slate-500" /></div>
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">SEO Mimarisi & Sayfa İnşası</h2>
           </div>
           
           <div className="[&_.bg-background]:bg-slate-50 [&_.border-border]:border-slate-200 [&_.rounded-xl]:rounded-2xl">
             {/* Render standard AdminSeoPagesEditor transparently to our wrapper */}
             <AdminSeoPagesEditor
               initialPages={result.pages}
               storageError={result.error}
             />
           </div>
        </div>

        {/* SIDE COLUMN */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-indigo-600 to-[#1e1b4b] border border-indigo-500 p-8 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.3)] relative overflow-hidden">
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl mix-blend-overlay pointer-events-none -mr-20 -mt-20"></div>
             
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem] border border-white/20">
                 <Globe className="w-5 h-5 text-indigo-200" />
               </div>
               <h2 className="text-2xl font-black text-white tracking-tight">Lokal SEO Rehberi</h2>
             </div>
             
             <div className="relative z-10 space-y-4">
               {[
                 "Yalnızca yayında olan sayfalar public route ve sitemap içinde açılır.",
                 "Her sayfada benzersiz SEO title ve meta description kullanın.",
                 "Telefon, WhatsApp ve adres bilgisini tutarlı tutun."
               ].map((item, idx) => (
                 <div key={idx} className="bg-white/5 rounded-[1.25rem] p-4 border border-white/10 backdrop-blur-sm flex items-start gap-4">
                    <div className="bg-indigo-400/20 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-black text-indigo-200">{idx + 1}</span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed font-medium">{item}</p>
                 </div>
               ))}
               
               <div className="mt-8 rounded-[1.25rem] bg-emerald-500/10 border border-emerald-500/20 p-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-widest">
                   <Info className="w-4 h-4" />
                   Arama Niyeti Optimizasyonu Aktif
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
