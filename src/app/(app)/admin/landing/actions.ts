"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAuthContext } from "@/lib/auth";
import {
  defaultLandingContent,
  mergeLandingContent,
  type LandingContent,
} from "@/lib/landing-content";
import { saveLandingContentToStorage } from "@/lib/landing-content-server";
import { updateLandingContentSchema } from "@/lib/schemas/app-forms";

export type LandingEditorActionState = {
  error: string | null;
  success: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function updateLandingContentAction(
  _previousState: LandingEditorActionState,
  formData: FormData,
): Promise<LandingEditorActionState> {
  const auth = await getCurrentAuthContext();

  if (!auth || auth.role !== "admin" || !auth.userId) {
    return {
      error: "Bu islem yalnizca admin tarafindan yapilabilir.",
      success: null,
    };
  }

  const parsed = updateLandingContentSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Landing content formu gecersiz.",
      success: null,
    };
  }

  let nextContent: LandingContent;

  try {
    const raw = JSON.parse(parsed.data.content) as unknown;

    nextContent = mergeLandingContent(
      defaultLandingContent,
      isRecord(raw) ? (raw as Partial<LandingContent>) : null,
    );
  } catch {
    return {
      error: "Landing content JSON verisi okunamadi.",
      success: null,
    };
  }

  const result = await saveLandingContentToStorage(nextContent, auth.userId);

  if (result.error) {
    return {
      error: result.error,
      success: null,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/landing");

  return {
    error: null,
    success: "Landing page icerigi guncellendi.",
  };
}
