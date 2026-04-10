import { AdminRoleForm } from "@/components/admin-role-form";
import { AdminUserCreateForm } from "@/components/admin-user-create-form";
import { AdminUsersPanel } from "@/components/admin-users-panel";
import { AppShell } from "@/components/app-shell";
import { getAdminUsers } from "@/lib/dashboard-data";
import { getSupabaseServerConfig } from "@/lib/supabase/server-config";
import { ShieldCheck, UserPlus, ShieldAlert, RefreshCw, Users, KeyRound } from "lucide-react";

export default async function AdminUsersPage() {
  const userRows = await getAdminUsers();
  const { isAdminConfigured } = getSupabaseServerConfig();
  
  const userOptions = userRows.map((user) => ({
    id: user.id,
    label: `${user.name} · ${user.role}`,
    role: user.role,
  }));
  
  const roleCounts = userRows.reduce<Record<string, number>>((acc, user) => {
    const key = user.role;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell
      role="admin"
      eyebrow="Kimlik & Erişim"
      title="Kullanıcı & Rol Yönetimi"
      primaryAction={{ href: "/admin/users", label: "Yeni Davet" }}
      contextCard={{
        eyebrow: "Servis Durumu",
        title: `${userRows.length} kullanıcı kayıtlı`,
        badge: isAdminConfigured ? "Yazma Aktif" : "Secret Eksik",
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-50 p-2.5 rounded-xl"><Users className="w-5 h-5 text-slate-400" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Tüm Kimlikler</div>
          </div>
          <div className="text-4xl font-black text-slate-800">{userRows.length}</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-rose-200/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-rose-100 p-2.5 rounded-xl"><KeyRound className="w-5 h-5 text-rose-500" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-500">Kritik / Admin</div>
          </div>
          <div className="text-4xl font-black text-rose-950 relative z-10">{roleCounts.admin ?? 0}</div>
        </div>

        <div className="bg-blue-50 rounded-[2rem] p-6 shadow-sm border border-blue-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-blue-100 p-2.5 rounded-xl"><ShieldCheck className="w-5 h-5 text-blue-500" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-blue-500">Operasyon</div>
          </div>
          <div className="text-4xl font-black text-blue-950 relative z-10">{roleCounts.manager ?? 0}</div>
        </div>

        <div className="bg-emerald-50 rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-200/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-emerald-100 p-2.5 rounded-xl"><Users className="w-5 h-5 text-emerald-500" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">Saha (Koç/Veli)</div>
          </div>
          <div className="text-4xl font-black text-emerald-950 relative z-10">{(roleCounts.coach ?? 0) + (roleCounts.parent ?? 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
        
        {/* MAIN USER PANEL */}
        <div className="md:col-span-8 rounded-[3rem] bg-white border border-slate-100 p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Kullanıcı Rehberi</h2>
          </div>
          {/* AdminUsersPanel wraps our DataTable natively, we leave it as is */}
          <div className="[&_.data-table-container]:shadow-none [&_.data-table-container]:border-0 [&_th]:bg-transparent [&_th]:text-slate-400 [&_th]:uppercase [&_th]:tracking-widest [&_th]:text-xs [&_td]:py-5">
            <AdminUsersPanel users={userRows} />
          </div>
        </div>

        {/* SIDE COLUMN (FORMS) */}
        <div className="md:col-span-4 flex flex-col gap-8">
          
          <div className="rounded-[3rem] bg-gradient-to-b from-slate-900 to-[#020617] border border-slate-800 p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
             
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem]">
                 <UserPlus className="w-5 h-5 text-cyan-300" />
               </div>
               <h2 className="text-2xl font-black text-white tracking-tight">Yeni Davet</h2>
             </div>
             
             <div className="relative z-10 [&_label]:text-slate-400 [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:rounded-2xl [&_input]:py-3 [&_button]:bg-cyan-500 [&_button]:text-slate-900 [&_button]:rounded-2xl [&_button]:font-bold [&_button:hover]:bg-cyan-400">
               <AdminUserCreateForm adminEnabled={isAdminConfigured} />
             </div>
          </div>

          <div className="rounded-[3rem] bg-white border border-slate-200 p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden flex-1">
             <div className="flex items-center gap-3 mb-8">
               <div className="bg-slate-100 p-2.5 rounded-[1.25rem]">
                 <RefreshCw className="w-5 h-5 text-slate-700" />
               </div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Rol Güncelle</h2>
             </div>

             <div className="[&_label]:text-slate-500 [&_select]:bg-slate-50 [&_select]:border-slate-200 [&_select]:rounded-2xl [&_select]:py-3 [&_button]:bg-slate-900 [&_button]:text-white [&_button]:rounded-2xl [&_button]:font-bold [&_button:hover]:bg-slate-800">
               <AdminRoleForm users={userOptions} adminEnabled={isAdminConfigured} />
             </div>
          </div>
          
        </div>

      </div>
    </AppShell>
  );
}
