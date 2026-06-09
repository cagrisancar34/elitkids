"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";

type Props = {
  programSlug?: string;
  programTitle?: string;
};

export function ApplicationForm({ programSlug, programTitle }: Props) {
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      childAge: String(formData.get("childAge") || ""),
      email: String(formData.get("email") || ""),
      fullName: String(formData.get("fullName") || ""),
      kvkkConsent: formData.get("kvkkConsent") === "on",
      message: String(formData.get("message") || ""),
      phone: String(formData.get("phone") || ""),
      programSlug,
      programTitle,
    };

    try {
      const response = await fetch("/cms-api/basvuru", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || body?.error || "Başvuru gönderilemedi.");
      }

      event.currentTarget.reset();
      setState("success");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Beklenmeyen bir hata oluştu.",
      );
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-5 shadow-xl shadow-stone-950/8">
      <div>
        <p className="text-sm font-semibold uppercase text-[#d9783d]">Ön başvuru</p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-950">
          {programTitle ? `${programTitle} için bilgi alın` : "Programlar için bilgi alın"}
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Ad soyad
          <input
            name="fullName"
            required
            className="h-12 rounded-md border border-stone-200 bg-[#fbfaf6] px-4 outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Telefon
          <input
            name="phone"
            required
            className="h-12 rounded-md border border-stone-200 bg-[#fbfaf6] px-4 outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          E-posta
          <input
            name="email"
            type="email"
            className="h-12 rounded-md border border-stone-200 bg-[#fbfaf6] px-4 outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Çocuk yaşı
          <input
            name="childAge"
            className="h-12 rounded-md border border-stone-200 bg-[#fbfaf6] px-4 outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Mesaj
        <textarea
          name="message"
          rows={4}
          className="rounded-md border border-stone-200 bg-[#fbfaf6] px-4 py-3 outline-none transition focus:border-[#2e7d5f] focus:ring-4 focus:ring-[#2e7d5f]/10"
          placeholder="İlgilendiğiniz tarih, çocuk sayısı veya sorularınız"
        />
      </label>

      <label className="flex gap-3 text-sm leading-6 text-stone-600">
        <input name="kvkkConsent" required type="checkbox" className="mt-1 h-4 w-4 accent-[#2e7d5f]" />
        KVKK aydınlatma metnini okudum, tarafıma dönüş yapılmasını kabul ediyorum.
      </label>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#214d3f] px-5 text-sm font-semibold text-white transition hover:bg-[#173d33] disabled:cursor-not-allowed disabled:opacity-65"
      >
        {state === "success" ? (
          <CheckCircle2 size={18} aria-hidden="true" />
        ) : (
          <Send size={18} aria-hidden="true" />
        )}
        {state === "submitting"
          ? "Gönderiliyor"
          : state === "success"
            ? "Başvuru alındı"
            : "Bilgi almak istiyorum"}
      </button>

      {state === "error" ? <p className="text-sm text-red-700">{error}</p> : null}
      {state === "success" ? (
        <p className="text-sm text-[#2e7d5f]">
          Teşekkürler. Ekip en kısa sürede sizinle iletişime geçecek.
        </p>
      ) : null}
    </form>
  );
}
