import Link from "next/link";
import { ArrowUpRight, WalletCards } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BillingChargeActions } from "@/components/billing-charge-actions";
import { PaymentsQuickCollectDialog } from "@/components/payments-quick-collect-dialog";
import { getManagerBillingDashboardData } from "@/lib/billing";
import { formatTry } from "@/lib/finance";
import type { ChargeOption } from "@/lib/types";

function toChargeOption(charge: (Awaited<ReturnType<typeof getManagerBillingDashboardData>>)["pendingCharges"][number]): ChargeOption {
  return {
    id: charge.id,
    label: `${charge.studentName} / ${charge.programName} / ${charge.billingPeriodLabel}`,
    amount: charge.remainingAmountLabel,
    status: charge.statusLabel,
    paymentStatus: charge.paymentStatus,
    remainingAmountValue: charge.remainingAmountValue,
    billingPeriodLabel: charge.billingPeriodLabel,
    dueDateLabel: charge.dueDateLabel,
  };
}

export default async function ManagerPaymentsPage() {
  const { pendingCharges, overdueCharges, recentPayments, summary } =
    await getManagerBillingDashboardData();
  const sortedPending = [...pendingCharges].sort(
    (left, right) => right.remainingAmountValue - left.remainingAmountValue,
  );
  const quickChargeOptions = sortedPending.map((charge) => toChargeOption(charge));

  return (
    <AppShell
      role="manager"
      eyebrow="Tahsilat Merkezi"
      title="Odemeler"
      hidePrimaryAction
      headerActionSlot={<PaymentsQuickCollectDialog charges={quickChargeOptions} />}
      contextCard={{
        eyebrow: "Bu ay tahsil edilen",
        title: formatTry(summary.todayCollected),
        badge: `%${summary.collectionRate} tahsilat orani`,
      }}
    >
      <div className="grid grid-cols-1 gap-6 pb-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Bugun tahsilat</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{formatTry(summary.todayCollected)}</div>
              <div className="mt-2 text-sm text-slate-500">{recentPayments.length} toplam odeme satiri</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Bekleyen bakiye</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{formatTry(summary.openBalance)}</div>
              <div className="mt-2 text-sm text-slate-500">{sortedPending.length} ogrencide acik tutar</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Tahsilat orani</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">%{summary.collectionRate}</div>
              <div className="mt-2 text-sm text-slate-500">Bu ay gerceklesen tahsilat performansi</div>
            </div>
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">En yuksek acik</div>
              <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{formatTry(summary.highestOpen)}</div>
              <div className="mt-2 text-sm text-slate-500">Oncelik verilmesi gereken tekil bakiye</div>
            </div>
          </div>

          <section className="rounded-[2.6rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">Tahsilat sirasi</div>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Odeme bekleyen ogrenciler</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Bekleyen tahakkuklari buyukten kucuge gorun; satirdan WhatsApp, tahsilat ve odeme detayina gecin.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <WalletCards className="h-4 w-4 text-slate-500" />
                {sortedPending.length} acik tahakkuk
              </div>
            </div>

            {sortedPending.length ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Ogrenci</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Program / grup</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Son tarih</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Toplam</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Kalan</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Durum</th>
                      <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Islem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPending.map((charge) => (
                      <tr key={charge.id} className="border-b border-slate-100 align-top last:border-b-0">
                        <td className="px-4 py-5">
                          <div className="font-bold text-slate-900">{charge.studentName}</div>
                          <div className="mt-1 text-sm text-slate-500">{charge.billingPeriodLabel}</div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="font-semibold text-slate-800">{charge.programName}</div>
                          <div className="mt-1 text-sm text-slate-500">{charge.sessionSeriesLabel}</div>
                        </td>
                        <td className="px-4 py-5 text-sm text-slate-600">{charge.dueDateLabel}</td>
                        <td className="px-4 py-5 text-sm font-semibold text-slate-800">{charge.totalAmountLabel}</td>
                        <td className="px-4 py-5 text-sm font-black text-slate-950">{charge.remainingAmountLabel}</td>
                        <td className="px-4 py-5">
                          <span
                            className={
                              charge.paymentStatus === "overdue"
                                ? "inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-rose-600"
                                : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-600"
                            }
                          >
                            {charge.statusLabel}
                          </span>
                        </td>
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
                Bu ekranda siraya alinacak acik tahakkuk bulunmuyor. Yine de sag ustteki <span className="font-semibold text-slate-700">Odeme Al</span> butonundan genel tahsilat modalini acabilirsiniz.
              </div>
            )}
          </section>

          <section className="rounded-[2.6rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">Gecmis</div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Son odemeler</h2>
              <p className="mt-2 text-sm text-slate-500">Makbuz, yontem ve kurs bilgisini tarih tarih izleyin.</p>
            </div>

            {recentPayments.length ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Ogrenci</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Kurs</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Tarih</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Yontem</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Referans</th>
                      <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.slice(0, 8).map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">{payment.studentName}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{payment.programName}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{payment.paidAtLabel}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                            {payment.paymentMethodLabel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{payment.referenceNo || "-"}</td>
                        <td className="px-4 py-4 text-right text-sm font-black text-slate-950">{payment.amountLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm leading-6 text-slate-500">
                Henuz odeme gecmisi olusmadi. Ilk tahsilat kaydi girildiginde bu tablo otomatik dolar.
              </div>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="rounded-[2.4rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">Ozet</div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Tahsilat sagligi</h2>
            <div className="mt-6 space-y-3">
              <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4 text-center">
                <div className="text-sm font-bold text-slate-900">Bu ay {formatTry(summary.todayCollected)}</div>
                <div className="mt-1 text-xs text-slate-500">Gerceklesen odeme hacmi</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4 text-center">
                <div className="text-sm font-bold text-slate-900">{sortedPending.length} acik kayit</div>
                <div className="mt-1 text-xs text-slate-500">Onceliklendirilmesi gereken tahsilatlar</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/70 p-4 text-center">
                <div className="text-sm font-bold text-slate-900">%{summary.collectionRate} basari</div>
                <div className="mt-1 text-xs text-slate-500">Ay ici tahsilat orani</div>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-slate-100 bg-slate-50/70 p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Kisayollar</div>
              <div className="mt-4 space-y-3">
                <Link
                  href="/manager/debts"
                  className="flex items-center justify-between rounded-[1.2rem] bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
                >
                  Borc takibini ac
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/manager/students"
                  className="flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Ogrencileri gor
                </Link>
                <Link
                  href="/manager"
                  className="flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Genel bakisa don
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[2.6rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600">Oncelik</div>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Kritik tahsilatlar</h3>
            {sortedPending.length ? (
              <div className="mt-6 space-y-3">
                {(overdueCharges.length ? overdueCharges : sortedPending).slice(0, 4).map((charge) => (
                  <div key={charge.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/60 p-4">
                    <div className="font-bold text-slate-900">{charge.studentName}</div>
                    <div className="mt-1 text-sm text-slate-500">{charge.programName}</div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-500">{charge.dueDateLabel}</span>
                      <span className="font-black text-slate-950">{charge.remainingAmountLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm leading-6 text-slate-500">
                Su anda kritik tahsilat listesine dusecek bir acik kayit yok.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
