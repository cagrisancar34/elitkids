"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { LoaderCircle, ShieldCheck, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  PreRegistrationOption,
  PreRegistrationSettings,
} from "@/lib/types";
import { trackButtonClick, trackFormSubmit } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type PublicPayload = {
  settings: PreRegistrationSettings;
  options: {
    branches: PreRegistrationOption[];
    seasons: PreRegistrationOption[];
    programs: PreRegistrationOption[];
  };
};

type PreRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type UploadState = {
  pending: boolean;
  error: string | null;
  url: string;
  path: string;
};

const defaultPayload: PublicPayload = {
  settings: {
    formEnabled: true,
    kvkkTitle: "KVKK Aydinlatma Metni",
    kvkkBody: "",
    kvkkCheckboxLabel: "KVKK aydinlatma metnini okudum ve kabul ediyorum.",
    parentPermissionTitle: "Veli Izin Belgesi",
    parentPermissionBody: "",
    parentPermissionCheckboxLabel: "Veli izin belgesini okudum ve kabul ediyorum.",
    successMessage: "On kaydiniz alindi.",
    helperNote: "IP adresiniz ve cihaz bilgileriniz guvenlik amaciyla kaydedilebilir.",
  },
  options: {
    branches: [],
    seasons: [],
    programs: [],
  },
};

const initialFormState = {
  studentTcIdentityNo: "",
  studentFullName: "",
  studentBirthDate: "",
  note: "",
  motherName: "",
  motherPhone: "",
  motherOccupation: "",
  fatherName: "",
  fatherPhone: "",
  fatherOccupation: "",
  parentEmail: "",
  parentWhatsapp: "",
  address: "",
  emergencyContact: "",
  branchId: "",
  seasonId: "",
  programId: "",
  kvkkAccepted: false,
  parentPermissionAccepted: false,
};

const lightFieldClassName =
  "h-14 rounded-[1rem] border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:bg-white";

const lightTextareaClassName =
  "min-h-28 rounded-[1rem] border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-300 focus-visible:bg-white";

export function PreRegistrationModal({ open, onOpenChange }: PreRegistrationModalProps) {
  const [payload, setPayload] = useState<PublicPayload>(defaultPayload);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [submitState, setSubmitState] = useState<{
    pending: boolean;
    error: string | null;
    success: string | null;
  }>({
    pending: false,
    error: null,
    success: null,
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    pending: false,
    error: null,
    url: "",
    path: "",
  });
  const [openLegalPanel, setOpenLegalPanel] = useState<"kvkk" | "permission" | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadPayload() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/pre-registration-settings", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const nextPayload = (await response.json()) as PublicPayload;

        if (!cancelled) {
          setPayload(nextPayload);
          setFormState((current) => ({
            ...current,
            branchId: current.branchId || nextPayload.options.branches[0]?.id || "",
            seasonId: current.seasonId || nextPayload.options.seasons[0]?.id || "",
            programId: current.programId || nextPayload.options.programs[0]?.id || "",
          }));
        }
      } catch {
        // fallback payload remains
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPayload();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const isFormDisabled = isLoading || !payload.settings.formEnabled;
  const photoPreview = uploadState.url;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadState({
      pending: true,
      error: null,
      url: "",
      path: "",
    });

    const requestFormData = new FormData();
    requestFormData.append("file", file);
    requestFormData.append("field", "student-photo");

    try {
      const response = await fetch("/api/pre-registration-assets", {
        method: "POST",
        body: requestFormData,
      });

      const result = (await response.json().catch(() => null)) as { error?: string; url?: string; path?: string } | null;

      if (!response.ok || !result?.url || !result.path) {
        setUploadState({
          pending: false,
          error: result?.error ?? "Fotograf yuklenemedi.",
          url: "",
          path: "",
        });
        return;
      }

      setUploadState({
        pending: false,
        error: null,
        url: result.url,
        path: result.path,
      });
    } catch {
      setUploadState({
        pending: false,
        error: "Fotograf yuklenirken baglanti hatasi olustu.",
        url: "",
        path: "",
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitState({
      pending: true,
      error: null,
      success: null,
    });

    try {
      const response = await fetch("/api/pre-registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          studentPhotoUrl: uploadState.url,
          studentPhotoPath: uploadState.path,
        }),
      });

      const responsePayload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setSubmitState({
          pending: false,
          error: responsePayload?.error ?? "On kayit gonderilemedi.",
          success: null,
        });
        return;
      }

      setSubmitState({
        pending: false,
        error: null,
        success: payload.settings.successMessage,
      });
      trackFormSubmit("pre_registration");
      setFormState(initialFormState);
      setUploadState({
        pending: false,
        error: null,
        url: "",
        path: "",
      });
    } catch {
      setSubmitState({
        pending: false,
        error: "On kayit gonderilirken baglanti hatasi olustu.",
        success: null,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[100svh] w-screen max-w-none overflow-hidden rounded-none border-0 bg-[#091224] p-0 text-white shadow-none sm:h-auto sm:max-h-[92vh] sm:w-[min(96vw,860px)] sm:max-w-[860px] sm:rounded-[2rem] sm:border sm:border-white/10 sm:shadow-[0_32px_90px_rgba(0,0,0,0.45)]">
        <div className="max-h-[100svh] overflow-y-auto px-4 py-6 sm:max-h-[92vh] sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <DialogHeader className="border-b border-white/8 pb-5 text-left sm:pb-6">
            <div className="inline-flex w-fit rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
              Hemen kayit
            </div>
            <DialogTitle className="mt-4 max-w-[14ch] text-[2rem] font-black leading-[0.94] tracking-[-0.06em] text-white sm:text-[2.35rem]">
              Cocugunuz icin ilk adimi burada atiyoruz.
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-[48ch] text-sm leading-7 text-slate-300 sm:text-[15px]">
              Hemen Kayit Ol butonuna bastiginizda acilan bu modal uzerinden basvurunuzu iletebilirsiniz. Form kesin kayit degildir; once incelenir, sonra uygun programa aktivasyon yapilir.
            </DialogDescription>
            <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-300">
              {payload.settings.helperNote}
            </div>
          </DialogHeader>

          <form className="grid gap-7 pt-6 sm:gap-8 sm:pt-7" onSubmit={handleSubmit}>
              <Section title="Ogrenci Bilgileri">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="TC Kimlik No" helper="Opsiyonel · 11 haneli">
                    <Input
                      value={formState.studentTcIdentityNo}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          studentTcIdentityNo: event.target.value,
                        }))
                      }
                      placeholder="11 haneli TC Kimlik No"
                      className={lightFieldClassName}
                    />
                  </Field>
                  <Field label="Ad Soyad *">
                    <Input
                      value={formState.studentFullName}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          studentFullName: event.target.value,
                        }))
                      }
                      placeholder="Ogrencinin adi ve soyadi"
                      className={lightFieldClassName}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-[0.72fr_1fr]">
                  <Field label="Dogum Tarihi *" helper="2 - 18 yas arasi">
                    <Input
                      type="date"
                      value={formState.studentBirthDate}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          studentBirthDate: event.target.value,
                        }))
                      }
                      className={cn(lightFieldClassName, "[color-scheme:light]")}
                    />
                  </Field>
                  <Field label="Fotograf">
                    <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-white/12 bg-[#12192b] px-5 py-6 text-center sm:min-h-40">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Yuklenen ogrenci fotografi"
                          className="h-20 w-20 rounded-full object-cover shadow-[0_14px_28px_rgba(0,0,0,0.22)]"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-400/20 text-sky-200">
                          {uploadState.pending ? <LoaderCircle className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
                        </div>
                      )}
                      <div className="mt-4 text-base font-semibold text-white">
                        Fotograf yuklemek icin tiklayin
                      </div>
                      <div className="mt-1 text-sm text-slate-400">JPG, PNG, WebP · Max 5MB</div>
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleFileChange} />
                    </label>
                    {uploadState.error ? <p className="mt-2 text-sm text-rose-300">{uploadState.error}</p> : null}
                  </Field>
                </div>

                <Field label="Aciklama">
                  <Textarea
                    value={formState.note}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    placeholder="Varsa belirtmek istediginiz notlar..."
                    className={lightTextareaClassName}
                  />
                </Field>
              </Section>

              <Section title="Veli Bilgileri">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Baba Ad Soyad">
                    <Input
                      value={formState.fatherName}
                      onChange={(event) => setFormState((current) => ({ ...current, fatherName: event.target.value }))}
                      placeholder="Baba ad soyad"
                      className={lightFieldClassName}
                    />
                  </Field>
                  <Field label="Baba Telefon">
                    <Input
                      value={formState.fatherPhone}
                      onChange={(event) => setFormState((current) => ({ ...current, fatherPhone: event.target.value }))}
                      placeholder="05XX XXX XX XX"
                      className={lightFieldClassName}
                    />
                  </Field>
                  <Field label="Baba Meslek">
                    <Input
                      value={formState.fatherOccupation}
                      onChange={(event) => setFormState((current) => ({ ...current, fatherOccupation: event.target.value }))}
                      placeholder="Baba meslek"
                      className={lightFieldClassName}
                    />
                  </Field>
                  <Field label="Anne Ad Soyad">
                    <Input
                      value={formState.motherName}
                      onChange={(event) => setFormState((current) => ({ ...current, motherName: event.target.value }))}
                      placeholder="Anne ad soyad"
                      className={lightFieldClassName}
                    />
                  </Field>
                  <Field label="Anne Telefon">
                    <Input
                      value={formState.motherPhone}
                      onChange={(event) => setFormState((current) => ({ ...current, motherPhone: event.target.value }))}
                      placeholder="05XX XXX XX XX"
                      className={lightFieldClassName}
                    />
                  </Field>
                  <Field label="Anne Meslek">
                    <Input
                      value={formState.motherOccupation}
                      onChange={(event) => setFormState((current) => ({ ...current, motherOccupation: event.target.value }))}
                      placeholder="Anne meslek"
                      className={lightFieldClassName}
                    />
                  </Field>
                  <Field label="E-posta *">
                    <Input
                      type="email"
                      value={formState.parentEmail}
                      onChange={(event) => setFormState((current) => ({ ...current, parentEmail: event.target.value }))}
                      placeholder="veli@eposta.com"
                      className={lightFieldClassName}
                    />
                  </Field>
                  <Field label="WhatsApp / Telefon *">
                    <Input
                      value={formState.parentWhatsapp}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, parentWhatsapp: event.target.value }))
                      }
                      placeholder="05XX XXX XX XX"
                      className={lightFieldClassName}
                    />
                  </Field>
                </div>

                <Field label="Ikametgah Adresi">
                  <Textarea
                    value={formState.address}
                    onChange={(event) => setFormState((current) => ({ ...current, address: event.target.value }))}
                    placeholder="Ikametgah adresi"
                    className={lightTextareaClassName}
                  />
                </Field>

                <Field label="Acil Durumda Aranacak Kisi *">
                  <Input
                    value={formState.emergencyContact}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, emergencyContact: event.target.value }))
                    }
                    placeholder="Acil durumda aranacak kisi"
                    className={lightFieldClassName}
                  />
                </Field>
              </Section>

              <Section title="Basvuru Bilgileri">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Ilgilenilen Sube *">
                    <Select
                      value={formState.branchId}
                      onChange={(event) => setFormState((current) => ({ ...current, branchId: event.target.value }))}
                      className={lightFieldClassName}
                    >
                      <option value="" disabled>Sube sec</option>
                      {payload.options.branches.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Sezon *">
                    <Select
                      value={formState.seasonId}
                      onChange={(event) => setFormState((current) => ({ ...current, seasonId: event.target.value }))}
                      className={lightFieldClassName}
                    >
                      <option value="" disabled>Sezon sec</option>
                      {payload.options.seasons.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Program *">
                    <Select
                      value={formState.programId}
                      onChange={(event) => setFormState((current) => ({ ...current, programId: event.target.value }))}
                      className={lightFieldClassName}
                    >
                      <option value="" disabled>Program sec</option>
                      {payload.options.programs.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </Section>

              <Section title="Yasal Onaylar">
                <div className="grid gap-3">
                  <ConsentCard
                    checked={formState.kvkkAccepted}
                    onChange={(checked) => setFormState((current) => ({ ...current, kvkkAccepted: checked }))}
                    label={payload.settings.kvkkCheckboxLabel}
                    onOpenText={() => setOpenLegalPanel("kvkk")}
                  />
                  <ConsentCard
                    checked={formState.parentPermissionAccepted}
                    onChange={(checked) =>
                      setFormState((current) => ({ ...current, parentPermissionAccepted: checked }))
                    }
                    label={payload.settings.parentPermissionCheckboxLabel}
                    onOpenText={() => setOpenLegalPanel("permission")}
                  />
                </div>

                <div className="rounded-[1rem] border border-amber-400/22 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-100">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{payload.settings.helperNote}</span>
                  </div>
                </div>
              </Section>

              {submitState.error ? <p className="text-sm text-rose-300">{submitState.error}</p> : null}
              {submitState.success ? <p className="text-sm text-emerald-300">{payload.settings.successMessage}</p> : null}

              <Button
                type="submit"
                size="lg"
                disabled={isFormDisabled || submitState.pending}
                className={cn(
                  "h-14 rounded-[1rem] text-base font-bold",
                  !payload.settings.formEnabled && "cursor-not-allowed opacity-60",
                )}
              >
                {submitState.pending ? "Basvurunuz gonderiliyor..." : "Basvuruyu Gonder"}
              </Button>
          </form>
        </div>
      </DialogContent>

        <Dialog open={openLegalPanel !== null} onOpenChange={(next) => !next && setOpenLegalPanel(null)}>
        <DialogContent className="w-[min(92vw,720px)] rounded-[1.6rem] border border-white/10 bg-[#091224] text-white">
          <DialogHeader>
            <DialogTitle>
              {openLegalPanel === "kvkk"
                ? payload.settings.kvkkTitle
                : payload.settings.parentPermissionTitle}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              On kayit formunda isaretlenecek yasal metnin tam okunur surumu.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-[1.2rem] border border-white/8 bg-[#11192c] px-5 py-5 text-sm leading-7 text-slate-200">
            {openLegalPanel === "kvkk"
              ? payload.settings.kvkkBody
              : payload.settings.parentPermissionBody}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5">
      <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-300">{title}</div>
      {children}
    </section>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

function ConsentCard({
  checked,
  onChange,
  label,
  onOpenText,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  onOpenText: () => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-[#11192c] px-4 py-4 text-sm text-slate-200">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent" />
      <span>
        <button
          type="button"
          onClick={() => {
            trackButtonClick("legal_text_open", "pre_registration_modal");
            onOpenText();
          }}
          className="font-semibold text-sky-300 hover:text-sky-200"
        >
          {label}
        </button>
      </span>
    </label>
  );
}
