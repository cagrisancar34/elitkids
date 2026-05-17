/* eslint-disable @next/next/no-img-element */

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
import { defaultPreRegistrationFields } from "@/lib/pre-registration";
import type {
  PreRegistrationFieldRecord,
  PreRegistrationOption,
  PreRegistrationSettings,
} from "@/lib/types";
import { trackButtonClick, trackFormSubmit } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type PublicPayload = {
  settings: PreRegistrationSettings;
  fields: PreRegistrationFieldRecord[];
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
    formEyebrow: "Hemen Kayit",
    formTitle: "Cocugunuz icin ilk adimi burada atiyoruz.",
    formDescription:
      "Hemen Kayit Ol butonuna bastiginizda acilan bu modal uzerinden basvurunuzu iletebilirsiniz. Form kesin kayit degildir; once incelenir, sonra uygun programa aktivasyon yapilir.",
    formLogoUrl: "",
    formLogoPath: "",
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
  fields: defaultPreRegistrationFields,
};

const initialFormState = {
  studentTcIdentityNo: "",
  studentFullName: "",
  studentBirthDate: "",
  studentGender: "",
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
  customAnswers: {} as Record<string, string>,
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
  const activeFields = payload.fields
    .filter((field) => field.active)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const studentFields = activeFields.filter((field) => field.section === "student");
  const parentFields = activeFields.filter((field) => field.section === "parent");

  function setCoreFieldValue(fieldKey: string, value: string) {
    setFormState((current) => ({ ...current, [fieldKey]: value }));
  }

  function setCustomAnswer(fieldKey: string, value: string) {
    setFormState((current) => ({
      ...current,
      customAnswers: {
        ...current.customAnswers,
        [fieldKey]: value,
      },
    }));
  }

  function getFieldValue(fieldKey: string) {
    if (fieldKey in formState) {
      return String((formState as Record<string, unknown>)[fieldKey] ?? "");
    }

    return formState.customAnswers[fieldKey] ?? "";
  }

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
          customAnswers: formState.customAnswers,
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
      <DialogContent className="h-[100svh] w-screen max-w-none overflow-hidden rounded-none !border-0 !bg-[#091224] !text-white p-0 shadow-none sm:h-auto sm:max-h-[92vh] sm:w-[min(96vw,860px)] sm:max-w-[860px] sm:rounded-[2rem] sm:!border sm:!border-white/10 sm:shadow-[0_32px_90px_rgba(0,0,0,0.45)]">
        <div className="max-h-[100svh] overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(40,120,255,0.18),transparent_38%),linear-gradient(180deg,#091224_0%,#0b1529_100%)] px-4 py-6 sm:max-h-[92vh] sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <DialogHeader className="border-b border-white/8 pb-5 text-left sm:pb-6">
            {payload.settings.formLogoUrl ? (
              <div className="mb-5">
                <img
                  src={payload.settings.formLogoUrl}
                  alt="On kayit form logosu"
                  className="max-h-16 w-auto rounded-2xl object-contain"
                />
              </div>
            ) : null}
            <div className="inline-flex w-fit rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
              {payload.settings.formEyebrow}
            </div>
            <DialogTitle className="mt-4 max-w-[14ch] text-[2rem] font-black leading-[0.94] tracking-[-0.06em] text-white sm:text-[2.35rem]">
              {payload.settings.formTitle}
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-[48ch] text-sm leading-7 text-slate-300 sm:text-[15px]">
              {payload.settings.formDescription}
            </DialogDescription>
            <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-300">
              {payload.settings.helperNote}
            </div>
          </DialogHeader>

          <form className="grid gap-7 pt-6 sm:gap-8 sm:pt-7" onSubmit={handleSubmit}>
              <Section title="Ogrenci Bilgileri">
                <DynamicFieldGrid>
                  {studentFields.map((field) => (
                    <DynamicPreRegistrationField
                      key={field.id}
                      field={field}
                      value={getFieldValue(field.fieldKey)}
                      onValueChange={(value) =>
                        field.fieldKey in formState
                          ? setCoreFieldValue(field.fieldKey, value)
                          : setCustomAnswer(field.fieldKey, value)
                      }
                      payload={payload}
                      photoPreview={photoPreview}
                      uploadState={uploadState}
                      onFileChange={handleFileChange}
                    />
                  ))}
                </DynamicFieldGrid>
              </Section>

              <Section title="Veli Bilgileri">
                <DynamicFieldGrid>
                  {parentFields.map((field) => (
                    <DynamicPreRegistrationField
                      key={field.id}
                      field={field}
                      value={getFieldValue(field.fieldKey)}
                      onValueChange={(value) =>
                        field.fieldKey in formState
                          ? setCoreFieldValue(field.fieldKey, value)
                          : setCustomAnswer(field.fieldKey, value)
                      }
                      payload={payload}
                      photoPreview={photoPreview}
                      uploadState={uploadState}
                      onFileChange={handleFileChange}
                    />
                  ))}
                </DynamicFieldGrid>
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
        <DialogContent className="w-[min(92vw,720px)] rounded-[1.6rem] !border !border-white/10 !bg-[#091224] !text-white [background:linear-gradient(180deg,#0a1324_0%,#101a30_100%)]">
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

function DynamicFieldGrid({
  children,
  application = false,
}: {
  children: ReactNode;
  application?: boolean;
}) {
  return <div className={cn("grid gap-4 md:grid-cols-2", application && "xl:grid-cols-3")}>{children}</div>;
}

function DynamicPreRegistrationField({
  field,
  value,
  onValueChange,
  payload,
  photoPreview,
  uploadState,
  onFileChange,
}: {
  field: PreRegistrationFieldRecord;
  value: string;
  onValueChange: (value: string) => void;
  payload: PublicPayload;
  photoPreview: string;
  uploadState: UploadState;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const label = `${field.label}${field.required ? " *" : ""}`;

  if (field.fieldKey === "studentPhoto" || field.inputType === "file") {
    return (
      <Field label={label} helper={field.helperText}>
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
            {field.placeholder || "Fotograf yuklemek icin tiklayin"}
          </div>
          <div className="mt-1 text-sm text-slate-400">{field.helperText || "JPG, PNG, WebP · Max 5MB"}</div>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onFileChange} />
        </label>
        {uploadState.error ? <p className="mt-2 text-sm text-rose-300">{uploadState.error}</p> : null}
      </Field>
    );
  }

  if (field.fieldKey === "studentGender") {
    return (
      <Field label={label} helper={field.helperText}>
        <Select value={value} onChange={(event) => onValueChange(event.target.value)} className={lightFieldClassName}>
          <option value="" disabled>
            {field.placeholder || "Cinsiyet secin"}
          </option>
          <option value="male">Erkek</option>
          <option value="female">Kadin</option>
        </Select>
      </Field>
    );
  }

  if (field.fieldKey === "branchId" || field.fieldKey === "seasonId" || field.fieldKey === "programId") {
    const options =
      field.fieldKey === "branchId"
        ? payload.options.branches
        : field.fieldKey === "seasonId"
          ? payload.options.seasons
          : payload.options.programs;

    return (
      <Field label={label} helper={field.helperText}>
        <Select value={value} onChange={(event) => onValueChange(event.target.value)} className={lightFieldClassName}>
          <option value="" disabled>
            {field.placeholder || `${field.label} sec`}
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
    );
  }

  if (field.inputType === "select") {
    return (
      <Field label={label} helper={field.helperText}>
        <Select value={value} onChange={(event) => onValueChange(event.target.value)} className={lightFieldClassName}>
          <option value="" disabled>
            {field.placeholder || `${field.label} sec`}
          </option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
    );
  }

  if (field.inputType === "textarea") {
    return (
      <Field label={label} helper={field.helperText}>
        <Textarea
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={field.placeholder}
          className={lightTextareaClassName}
        />
      </Field>
    );
  }

  return (
    <Field label={label} helper={field.helperText}>
      <Input
        type={field.inputType === "email" ? "email" : field.inputType === "date" ? "date" : "text"}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={field.placeholder}
        className={cn(lightFieldClassName, field.inputType === "date" && "[color-scheme:light]")}
      />
    </Field>
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
