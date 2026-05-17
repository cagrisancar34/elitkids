import Link from "next/link";
import { ArrowUpRight, MessageCircleWarning, PhoneCall, TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BillingChargeActions } from "@/components/billing-charge-actions";
import { getManagerBillingDashboardData } from "@/lib/billing";
import { formatTry } from "@/lib/finance";

function getOverdueDayCount(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  const diff = Math.floor((startOfToday.getTime() - parsed.getTime()) / 86_400_000);
  return Math.max(diff, 0);
}

export default async function ManagerDebtsPage() {
  const { overdueCharges } = await getManagerBillingDashboardData();
  const trackedCharges = [...overdueCharges].sort((left, right) => {
    const delayGap = getOverdueDayCount(right.dueDate) - getOverdueDayCount(left.dueDate);

    if (delayGap !== 0) {
      return delayGap;
    }

    return right.remainingAmountValue - left.remainingAmountValue;
  });

  const averageDelayDays = trackedCharges.length
    ? Math.round(
        trackedCharges.reduce((sum, charge) => sum + getOverdueDayCount(charge.dueDate), 0) /
          trackedCharges.length,
      )
    : 0;
  const maxDelayDays = trackedCharges.reduce(
    (max, charge) => Math.max(max, getOverdueDayCount(charge.dueDate)),
    0,
  );
  const overdueBalance = trackedCharges.reduce(
    (sum, charge) => sum + charge.remainingAmountValue,
    0,
  );

  return (
    <AppShell
      role="manager"
      eyebrow="Gecikmis Tahakkuk Takibi"
      title="Borc Takibi"
      primaryAction={{ href: "/manager/payments", label: "Tahsilat merkezine don" }}
      contextCard={{
        eyebrow: "Gecikmis bakiye",
        title: formatTry(overdueBalance),
        badge: `${trackedCharges.length} gecikmis kayit`,
      }}
    >
      <div className="grid grid-cols-1 gap-6 pb-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Toplam gecikmis</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{formatTry(overdueBalance)}</div>
              <div className="mt-2 text-sm text-slate-500">Bugun takip edilmesi gereken toplam bakiye</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Gecikmis ogrenci</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{trackedCharges.length}</div>
              <div className="mt-2 text-sm text-slate-500">Odeme yapilmadi durumuna dusen kayit</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Ortalama gecikme</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{averageDelayDays} gun</div>
              <div className="mt-2 text-sm text-slate-500">Takipteki tahakkuklarin ortalama bekleme suresi</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">En uzun gecikme</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{maxDelayDays} gun</div>
              <div className="mt-2 text-sm text-slate-500">Bugun once aranmasi gereken tahakkuklar</div>
            </div>
          </div>

          <section className="rounded-[2.6rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600">Gecikmis tahakkuklar</div>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Oncelikli tahsilat listesi</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Yalniz odeme yapilmadi durumuna dusen kayitlar burada tutulur. WhatsApp, tahsilat ve detay aksiyonlarini dogrudan satirdan yonetin.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                <TriangleAlert className="h-4 w-4" />
                {trackedCharges.length} kritik tahakkuk
              </div>
            </div>

            {trackedCharges.length ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[980px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Ogrenci</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Veli / WhatsApp</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Program / grup</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Son tarih</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Gecikme</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Kalan</th>
                      <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Islemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackedCharges.map((charge) => (
                      <tr key={charge.id} className="border-b border-slate-100 align-top last:border-b-0">
                        <td className="px-4 py-5">
                          <div className="font-bold text-slate-900">{charge.studentName}</div>
                          <div className="mt-1 text-sm text-slate-500">{charge.billingPeriodLabel}</div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="font-semibold text-slate-800">{charge.parentName}</div>
                          <div className="mt-1 text-sm text-slate-500">{charge.parentWhatsapp || "WhatsApp yok"}</div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="font-semibold text-slate-800">{charge.programName}</div>
                          <div className="mt-1 text-sm text-slate-500">{charge.sessionSeriesLabel}</div>
                        </td>
                        <td className="px-4 py-5 text-sm text-slate-600">{charge.dueDateLabel}</td>
                        <td className="px-4 py-5">
                          <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-black text-rose-600">
                            {getOverdueDayCount(charge.dueDate)} gun
                          </span>
                        </td>
                        <td className="px-4 py-5 text-sm font-black text-slate-950">{charge.remainingAmountLabel}</td>
                        <td className="px-4 py-5 text-right">
                          <BillingChargeActions charge={charge} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm leading-6 text-slate-500">
                Gecikmis tahakkuk bulunmuyor. Odeme yapilmadi statulu kayitlar oldugunda bu ekran oncelikli tahsilat panosuna doner.
              </div>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="rounded-[2.4rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">Bugun aranacak veliler</div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Takip arama listesi</h2>
            {trackedCharges.length ? (
              <div className="mt-6 space-y-3">
                {trackedCharges.slice(0, 4).map((charge) => (
                  <div key={charge.id} className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900">{charge.parentName}</div>
                        <div className="mt-1 text-sm text-slate-500">{charge.studentName}</div>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-rose-600 shadow-sm">
                        {getOverdueDayCount(charge.dueDate)} gun
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">{charge.parentWhatsapp || "Telefon bulunmuyor"}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{charge.remainingAmountLabel} / {charge.programName}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm leading-6 text-slate-500">
                Bugun aranacak gecikmis veli listesi bulunmuyor.
              </div>
            )}
          </div>

          <div className="rounded-[2.4rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-[1rem] bg-rose-50 p-3 text-rose-600">
                <MessageCircleWarning className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">En yuksek gecikmeler</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">Bugun onceliklendirilecek tahakkuklar</div>
              </div>
            </div>

            {trackedCharges.length ? (
              <div className="mt-5 space-y-3">
                {trackedCharges.slice(0, 3).map((charge) => (
                  <div key={charge.id} className="rounded-[1.3rem] border border-slate-100 bg-slate-50/70 p-4">
                    <div className="font-bold text-slate-900">{charge.studentName}</div>
                    <div className="mt-1 text-sm text-slate-500">{charge.dueDateLabel} · {charge.remainingAmountLabel}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[1.3rem] border border-dashed border-slate-200 bg-slate-50/60 p-5 text-sm text-slate-500">
                Gecikmis odeme riski simdilik temiz gorunuyor.
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Hizli gecis</div>
            <div className="mt-4 space-y-3">
              <Link
                href="/manager/payments"
                className="flex items-center justify-between rounded-[1.2rem] bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                Tahsilat ekranini ac
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/manager/students"
                className="flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Ogrencileri gor
              </Link>
              <Link
                href="/manager/communication"
                className="flex items-center justify-center gap-2 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <PhoneCall className="h-4 w-4" />
                Mesaj merkezine git
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
