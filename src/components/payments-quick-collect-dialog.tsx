"use client";

import { CreditCard, PlusCircle } from "lucide-react";

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
import type { ChargeOption } from "@/lib/types";

type PaymentsQuickCollectDialogProps = {
  charges: ChargeOption[];
};

export function PaymentsQuickCollectDialog({ charges }: PaymentsQuickCollectDialogProps) {
  const disabled = charges.length === 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          disabled={disabled}
          className="h-11 rounded-full px-5 shadow-[0_14px_28px_rgba(20,86,215,0.2)]"
        >
          <CreditCard className="h-4 w-4" />
          Odeme Al
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hizli tahsilat</DialogTitle>
          <DialogDescription>
            Acik tahakkuklardan birini secin, odeme tarihini girin ve taksitli ya da tek seferlik tahsilati ayni kayit altinda isleyin.
          </DialogDescription>
        </DialogHeader>

        {disabled ? (
          <div className="rounded-[1.7rem] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-sm leading-6 text-slate-500">
            Su anda odeme alinabilecek acik tahakkuk bulunmuyor. Yeni tahakkuk olustugunda bu alandan hizli tahsilat baslatabilirsiniz.
          </div>
        ) : (
          <ManualPaymentForm
            charges={charges}
            heading="Genel tahsilat modali"
            description="Ogrenci / tahakkuk secin, odeme tarihini zorunlu girin ve kalan bakiyeyi tek ekrandan guncelleyin."
          />
        )}

        <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50/70 p-4 text-sm leading-6 text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <PlusCircle className="h-4 w-4 text-sky-600" />
            Bu modal ne icin?
          </div>
          <p className="mt-2">
            Bu ust aksiyon, listeden satir secmeden hizli tahsilat baslatmak icindir. Odeme Detayi ve satir bazli WhatsApp hatirlatma aksiyonlari liste icinde calismaya devam eder.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
