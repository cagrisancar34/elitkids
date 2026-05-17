import { AttendanceModal } from "@/components/attendance-modal";
import { AppShell } from "@/components/app-shell";
import { getManagerAttendanceBoards } from "@/lib/dashboard/manager-data";
import { Users, ClipboardCheck, UserMinus, BadgeInfo, Radar } from "lucide-react";

export default async function ManagerAttendancePage() {
  const sessions = await getManagerAttendanceBoards();
  const totalStudents = sessions.reduce((sum, session) => sum + session.students.length, 0);
  const absentCount = sessions.reduce(
    (sum, session) => sum + session.students.filter((student) => student.status === "absent").length,
    0,
  );
  const excusedCount = sessions.reduce(
    (sum, session) => sum + session.students.filter((student) => student.status === "excused").length,
    0,
  );

  return (
    <AppShell
      role="manager"
      eyebrow="Denetim Merkezi"
      title="Yoklama Takibi"
      primaryAction={{ href: "/manager/sessions", label: "Takvime Geç" }}
      contextCard={{
        eyebrow: "Sinyal Hattı",
        title: `${sessions.length} Aktif Seans İzleniyor`,
        badge: `${absentCount} Gelmeyen`,
      }}
    >
      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-sky-50 rounded-[2rem] p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-sky-100 p-2.5 rounded-xl"><ClipboardCheck className="w-5 h-5 text-sky-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-sky-600">MEVCUT</div>
          </div>
          <div className="text-4xl font-black text-sky-950">{sessions.length}</div>
          <div className="text-sm font-medium text-sky-600/70 mt-2">Açık Seans Bloğu</div>
        </div>

        <div className="bg-blue-50 rounded-[2rem] p-6 shadow-sm border border-blue-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-100 p-2.5 rounded-xl"><Users className="w-5 h-5 text-blue-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-blue-600">ROSTER</div>
          </div>
          <div className="text-4xl font-black text-blue-950">{totalStudents}</div>
          <div className="text-sm font-medium text-blue-600/70 mt-2">Toplam Kayıtlı Öğrenci</div>
        </div>

        <div className="bg-rose-50 rounded-[2rem] p-6 shadow-sm border border-rose-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-rose-100 p-2.5 rounded-xl"><UserMinus className="w-5 h-5 text-rose-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600">RİSK</div>
          </div>
          <div className="text-4xl font-black text-rose-950">{absentCount}</div>
          <div className="text-sm font-medium text-rose-600/70 mt-2">Gelmeyen Öğrenci</div>
        </div>

        <div className="bg-amber-50 rounded-[2rem] p-6 shadow-sm border border-amber-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 p-2.5 rounded-xl"><BadgeInfo className="w-5 h-5 text-amber-600" /></div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600">MAZERET</div>
          </div>
          <div className="text-4xl font-black text-amber-950">{excusedCount}</div>
          <div className="text-sm font-medium text-amber-600/70 mt-2">İzinli Kayıt</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* SIDE COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="bg-white/10 p-2.5 rounded-[1.25rem] backdrop-blur-md">
                 <Radar className="w-5 h-5 text-sky-400" />
               </div>
               <h2 className="text-xl font-black tracking-tight">Operasyon Notu</h2>
             </div>
             
	             <p className="text-base leading-relaxed text-slate-300 font-medium relative z-10">
	               Yoklama artık uzun form listesi değil, seans bazlı <strong>Hızlı Modal</strong> akışına dönüştü. <span className="font-semibold text-white">Yoklama Al</span> butonları ile sahaya hükmedin.
	             </p>
          </div>
        </div>

        {/* MAIN COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.sessionId} className="rounded-[2.5rem] bg-white border border-slate-100 p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{session.slot}</span>
                       <span className="text-sm font-semibold text-slate-500">{session.location}</span>
                       <span className="text-sm font-semibold text-slate-400">· {session.roster}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 pb-2 md:pb-0 border-b md:border-0 border-slate-50 relative shrink-0">
                    <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-300" />
                      <strong className="text-slate-700">{session.students.length}</strong> Öğrenci
                    </div>
                    <AttendanceModal sessionId={session.sessionId} sessionTitle={session.title} students={session.students} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center">
              <ClipboardCheck className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Aktif Yoklama Listesi Yok</h3>
              <p className="text-sm text-slate-500 font-medium">Şu anda yoklama alınabilecek açık bir seans bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
