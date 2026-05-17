"use client";

import { ExternalLink, MessageCircle, ReceiptText } from "lucide-react";

import { ManualPaymentForm } from "@/components/manual-payment-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BillingChargeRecord, ChargeOption } from "@/lib/types";

function toChargeOption(charge: BillingChargeRecord): ChargeOption {
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

export function BillingChargeActions({ charge }: { charge: BillingChargeRecord }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        asChild
        disabled={!charge.webWhatsAppHref}
        className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      >
        <a
          href={charge.webWhatsAppHref ?? "#"}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!charge.webWhatsAppHref}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" size="sm" className="rounded-full">
            Odeme Al
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{charge.studentName} icin odeme al</DialogTitle>
            <DialogDescription>
              {charge.billingPeriodLabel} donemi icin kalan {charge.remainingAmountLabel} tutarli tahakkuga yeni odeme satiri ekleyin.
            </DialogDescription>
          </DialogHeader>
          <ManualPaymentForm
            charges={[toChargeOption(charge)]}
            defaultChargeId={charge.id}
            heading="Tahsilat"
            description="Taksitli veya tek seferlik odemeleri ayni aylik tahakkuk altinda tarih bazli takip edin."
          />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline" className="rounded-full">
            <ReceiptText className="h-4 w-4" />
            Odeme Detayi
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{charge.studentName} odeme detayi</DialogTitle>
            <DialogDescription>
              Program, grup ve tarih tarih odeme gecmisi ayni pencerede gorunur.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Program</div>
                <div className="mt-2 text-base font-bold text-slate-900">{charge.programName}</div>
                <div className="mt-1 text-sm text-slate-500">{charge.sessionSeriesLabel}</div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Donem</div>
                <div className="mt-2 text-base font-bold text-slate-900">{charge.billingPeriodLabel}</div>
                <div className="mt-1 text-sm text-slate-500">Son gun: {charge.dueDateLabel}</div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Durum</div>
                <div className="mt-2 text-base font-bold text-slate-900">{charge.statusLabel}</div>
                <div className="mt-1 text-sm text-slate-500">Kalan {charge.remainingAmountLabel}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Toplam borc</div>
                <div className="mt-3 text-2xl font-black text-slate-900">{charge.totalAmountLabel}</div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Toplam odenen</div>
                <div className="mt-3 text-2xl font-black text-emerald-600">{charge.paidAmountLabel}</div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Kalan</div>
                <div className="mt-3 text-2xl font-black text-rose-600">{charge.remainingAmountLabel}</div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Odeme gecmisi</div>
                  <h4 className="mt-2 text-lg font-black text-slate-900">Tarih tarih odeme satirlari</h4>
                </div>
                {charge.webWhatsAppHref ? (
                  <a
                    href={charge.webWhatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Hatirlatma ac
                  </a>
                ) : null}
              </div>

              {charge.history.length ? (
                <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/70">
                      <tr>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Tarih</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Yontem</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Referans</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Not</th>
                        <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charge.history.map((payment) => (
                        <tr key={payment.id} className="border-t border-slate-100">
                          <td className="px-4 py-4 text-sm font-semibold text-slate-900">{payment.paidAtLabel}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{payment.paymentMethodLabel}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{payment.referenceNo || "-"}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{payment.note || "-"}</td>
                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">{payment.amountLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm text-slate-500">
                  Bu tahakkuk icin henuz odeme kaydi girilmedi.
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-5">
              <div className="border-b border-slate-100 pb-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Operasyon izi</div>
                <h4 className="mt-2 text-lg font-black text-slate-900">Tahakkuk aksiyon zaman cizgisi</h4>
              </div>

              {charge.auditTrail?.length ? (
                <div className="mt-4 space-y-3">
                  {charge.auditTrail.map((entry) => (
                    <div key={`${entry.event}-${entry.createdAtValue}`} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900">{entry.event}</div>
                          <div className="mt-1 text-sm text-slate-500">{entry.actor}</div>
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{entry.createdAt}</div>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-slate-500">{entry.detail ?? "Finans operasyonu kaydedildi."}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm text-slate-500">
                  Bu tahakkuk icin henuz operasyon izi olusmadi.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
