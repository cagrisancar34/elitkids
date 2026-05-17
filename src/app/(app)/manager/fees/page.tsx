import Link from "next/link";
import { Coins, ArrowUpRight, Tags, UsersRound } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { getManagerBillingDashboardData } from "@/lib/billing";
import { getProgramsData } from "@/lib/dashboard/manager-data";
import { formatTry } from "@/lib/finance";

export default async function ManagerFeesPage() {
  const [programs, billing] = await Promise.all([getProgramsData(), getManagerBillingDashboardData()]);
  const currentMonthKey = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date());

  const averagePrice = programs.length
    ? Math.round(programs.reduce((sum, program) => sum + program.monthlyPrice, 0) / programs.length)
    : 0;
  const currentMonthCharges = billing.charges.filter((charge) => {
    const sourceDate = charge.billingPeriod ?? charge.dueDate;

    if (!sourceDate) {
      return false;
    }

    return new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "2-digit",
      timeZone: "Europe/Istanbul",
    }).format(new Date(sourceDate)) === currentMonthKey;
  });
  const currentMonthExpected = currentMonthCharges.reduce((sum, charge) => sum + charge.totalAmountValue, 0);

  const programFinancials = programs.map((program) => {
    const programCharges = currentMonthCharges.filter((charge) => charge.programName === program.title);
    const dueThisMonth = programCharges.reduce((sum, charge) => sum + charge.totalAmountValue, 0);
    const collected = programCharges.reduce((sum, charge) => sum + charge.paidAmountValue, 0);
    const remaining = programCharges.reduce((sum, charge) => sum + charge.remainingAmountValue, 0);

    return {
      ...program,
      dueThisMonth,
      collected,
      remaining,
    };
  });

  return (
    <AppShell
      role="manager"
      eyebrow="Ucret Yapisi"
      title="Ucretler"
      primaryAction={{ href: "/manager/payments", label: "Tahsilat merkezine git" }}
      contextCard={{
        eyebrow: "Aylik paketler",
        title: `${programs.length} aktif fiyat kurali`,
        badge: formatTry(averagePrice),
      }}
    >
      <div className="grid grid-cols-1 gap-8 pb-12 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Aktif fiyat kurali</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{programs.length}</div>
              <div className="mt-2 text-sm text-slate-500">Program bazli aylik paket tanimi</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Ortalama ucret</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{formatTry(averagePrice)}</div>
              <div className="mt-2 text-sm text-slate-500">Aylik sozlesme degeri</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Bu ay beklenen</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{formatTry(currentMonthExpected)}</div>
              <div className="mt-2 text-sm text-slate-500">Aylik tahakkuk hacmi</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Acik bakiye</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{formatTry(billing.summary.openBalance)}</div>
              <div className="mt-2 text-sm text-slate-500">Tahsilat ekraninda izlenen kalan tutar</div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-[2.4rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">Kisayollar</div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Ucret ve tahsilat baglantisi</h2>
          <div className="mt-6 space-y-3">
            <Link
              href="/manager/payments"
              className="flex items-center justify-between rounded-[1.2rem] bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
            >
              Tahsilat merkezini ac
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/manager/debts"
              className="flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Borc takibini gor
            </Link>
            <Link
              href="/manager/programs"
              className="flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Program fiyatlarini duzenle
            </Link>
          </div>
        </div>

        <div className="xl:col-span-8 rounded-[2.6rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">Aylik paketler</div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Aktif ucret kurallari</h2>
              <p className="mt-2 text-sm text-slate-500">Program fiyati, aktif ogrenci sayisi ve bu ayki tahsilat etkisini ayni tabloda gorun.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              <Tags className="h-4 w-4 text-slate-500" />
              {programs.length} fiyat kural
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Program</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Demografi</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Aylik ucret</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Bu ay beklenen</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Kalan</th>
                  <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Durum</th>
                </tr>
              </thead>
              <tbody>
                {programFinancials.map((program) => (
                  <tr key={program.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-5">
                      <div className="font-bold text-slate-900">{program.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{program.sessionSeriesCount} grup / {program.enrolledCount} aktif sporcu</div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-indigo-600">
                        {program.ageBand}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-black text-slate-950">{formatTry(program.monthlyPrice)}</td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-800">{formatTry(program.dueThisMonth)}</td>
                    <td className="px-4 py-5 text-sm font-semibold text-rose-600">{formatTry(program.remaining)}</td>
                    <td className="px-4 py-5 text-right">
                      <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                        Aktif onayli
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-[2.6rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-[1rem] bg-slate-50 p-3 text-slate-700">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Yonetim notu</div>
              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">Ucret yapisi ne icin kullanilir</h3>
            </div>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <p>Bu ekran fiyat kurallarinin yonetsel gorunumudur. Aylik paket, aktif ogrenci sayisi ve tahsilata etkisi burada okunur.</p>
            <p>Tahsilat operasyonu satir bazli `WhatsApp`, `Odeme Al` ve `Odeme Detayi` aksiyonlari ile `Odemeler` ekraninda devam eder.</p>
          </div>

          <div className="mt-6 rounded-[1.8rem] border border-slate-100 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-2 shadow-sm">
                <UsersRound className="h-4 w-4 text-slate-700" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Aktif tahsilat etkisi</div>
                <div className="text-xs text-slate-500">Program fiyatlari aylik tahakkuk uretimine dogrudan kaynak olur.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
