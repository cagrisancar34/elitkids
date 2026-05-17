"use client";

import { useEffect, useState } from "react";
import { AlertCircle, MessageSquare, SendIcon } from "lucide-react";

import { WhatsAppCampaignPanel } from "@/components/whatsapp-campaign-panel";
import type {
  CommunicationTimelineItem,
  ProgramOption,
  SessionSeriesOption,
  StudentOption,
  WhatsAppCampaignOverview,
} from "@/lib/types";

type ManagerCommunicationOverviewPayload = {
  timeline: CommunicationTimelineItem[];
  whatsappOverview: WhatsAppCampaignOverview | null;
  programOptions: ProgramOption[];
  branchOptions: Array<{ id: string; label: string }>;
  sessionSeriesOptions: SessionSeriesOption[];
  studentOptions: StudentOption[];
};

export function ManagerCommunicationAsyncSections() {
  const [payload, setPayload] = useState<ManagerCommunicationOverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/manager/communication/overview", {
          method: "GET",
          cache: "no-store",
        });
        const body = (await response.json().catch(() => null)) as
          | ({ error?: string } & Partial<ManagerCommunicationOverviewPayload>)
          | null;

        if (!response.ok) {
          throw new Error(body?.error ?? "Iletisim detaylari yuklenemedi.");
        }

        if (!active) {
          return;
        }

        setPayload({
          timeline: body?.timeline ?? [],
          whatsappOverview: body?.whatsappOverview ?? null,
          programOptions: body?.programOptions ?? [],
          branchOptions: body?.branchOptions ?? [],
          sessionSeriesOptions: body?.sessionSeriesOptions ?? [],
          studentOptions: body?.studentOptions ?? [],
        });
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Iletisim detaylari yuklenemedi.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="rounded-[3rem] bg-indigo-50 border border-indigo-100 p-4 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-indigo-100/50 px-4 md:px-0">
          <div className="bg-indigo-100 border border-indigo-200 p-2.5 rounded-xl"><SendIcon className="w-6 h-6 text-indigo-600" /></div>
          <h2 className="text-2xl font-black text-indigo-950 tracking-tight">WhatsApp Kampanyaları</h2>
        </div>
        {loading ? (
          <div className="rounded-[2rem] border border-indigo-100 bg-white/70 px-5 py-6 text-sm text-slate-500">
            Kampanya metrikleri ve hedefleme seçenekleri yükleniyor...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
            {error}
          </div>
        ) : payload ? (
          <div className="[&_.bg-background]:bg-transparent [&_.border-border]:border-indigo-100 [&_.rounded-xl]:rounded-[2rem] [&_.shadow-sm]:shadow-none">
            <WhatsAppCampaignPanel
              overview={payload.whatsappOverview}
              programOptions={payload.programOptions}
              branchOptions={payload.branchOptions}
              sessionSeriesOptions={payload.sessionSeriesOptions}
              studentOptions={payload.studentOptions}
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-[3rem] bg-white border border-slate-100 p-4 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 px-4 md:px-0">
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><MessageSquare className="w-6 h-6 text-slate-500" /></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Ogrenci Iletisim Zaman Cizgisi</h2>
        </div>
        {loading ? (
          <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
            Iletisim zaman cizgisi yukleniyor...
          </div>
        ) : error ? (
          <div className="rounded-[1.6rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : payload?.timeline.length ? (
          <div className="grid gap-3">
            {payload.timeline.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-800">{item.studentName} · {item.parentName}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {item.channel} · {item.createdAt}
                    </div>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 border border-slate-200">
                    {item.status}
                  </div>
                </div>
                <div className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
            Henüz öğrenci bazlı iletişim zaman çizgisi oluşmadı.
          </div>
        )}
      </div>

      {!loading && error ? (
        <div className="rounded-[1.6rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>Ağır iletişim detayları ilk render’dan ayrıldı. Şu an yalnız async fetch aşamasında bir hata alındı.</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
