"use client";

import { type FormEvent, useState } from "react";

import { Input } from "@/components/ui/input";
import { trackFormSubmit } from "@/lib/analytics";

type SeoLeadFormProps = {
  branchInterest: string;
  source: "organic_seo_page";
};

export function SeoLeadForm({ branchInterest, source }: SeoLeadFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [submitState, setSubmitState] = useState<{
    pending: boolean;
    error: string | null;
    success: string | null;
  }>({
    pending: false,
    error: null,
    success: null,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitState({
      pending: true,
      error: null,
      success: null,
    });

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        branchInterest,
        source,
      }),
    }).catch(() => null);

    const payload = (await response?.json().catch(() => null)) as { error?: string } | null;

    if (!response?.ok) {
      setSubmitState({
        pending: false,
        error: payload?.error ?? "Basvuru gonderilirken bir sorun olustu.",
        success: null,
      });
      return;
    }

    trackFormSubmit("seo_page_lead_cta", { lead_source: source, branch_interest: branchInterest });
    setForm({
      fullName: "",
      email: "",
      phone: "",
    });
    setSubmitState({
      pending: false,
      error: null,
      success: "Bilginiz alindi. Ekibimiz kisa sure icinde size geri donecek.",
    });
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input
        value={form.fullName}
        onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
        placeholder="Ad soyad"
        className="h-11 rounded-[0.95rem] border-white/10 bg-white text-[#0a1427] placeholder:text-slate-400"
      />
      <Input
        type="email"
        value={form.email}
        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        placeholder="Veli e-postasi"
        className="h-11 rounded-[0.95rem] border-white/10 bg-white text-[#0a1427] placeholder:text-slate-400"
      />
      <Input
        value={form.phone}
        onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
        placeholder="Telefon / WhatsApp"
        className="h-11 rounded-[0.95rem] border-white/10 bg-white text-[#0a1427] placeholder:text-slate-400"
      />

      {submitState.error ? (
        <div className="rounded-[0.95rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {submitState.error}
        </div>
      ) : null}

      {submitState.success ? (
        <div className="rounded-[0.95rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {submitState.success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitState.pending}
        className="inline-flex h-11 items-center justify-center rounded-[0.95rem] bg-[#42baf9] px-5 text-sm font-semibold text-[#071223] transition hover:bg-[#79cdfa] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitState.pending ? "Bilginiz gonderiliyor..." : "Bilgi alin"}
      </button>
    </form>
  );
}
