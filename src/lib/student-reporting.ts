import type { DetailAnswerRecord, DetailQuestionInputType, DetailQuestionRecord } from "@/lib/types";

export const defaultStudentDetailQuestions: DetailQuestionRecord[] = [
  {
    id: "default-category",
    fieldKey: "category",
    label: "Kategori",
    inputType: "text",
    helperText: "Sporcunun aktif kategori bilgisini gir.",
    placeholder: "Hokey A",
    options: [],
    required: true,
    active: true,
    sortOrder: 10,
    source: "default",
  },
  {
    id: "default-club-name",
    fieldKey: "club_name",
    label: "Kulup",
    inputType: "text",
    helperText: "Kulup veya kurum adini gir.",
    placeholder: "Zeytinburnu Buz Spor Kulubu",
    options: [],
    required: true,
    active: true,
    sortOrder: 20,
    source: "default",
  },
  {
    id: "default-technical-score",
    fieldKey: "technical_score",
    label: "Teknik puan",
    inputType: "number",
    helperText: "1 ile 10 arasinda teknik degerlendirme puani.",
    placeholder: "8",
    options: [],
    required: true,
    active: true,
    sortOrder: 30,
    source: "default",
  },
  {
    id: "default-discipline-score",
    fieldKey: "discipline_score",
    label: "Disiplin puan",
    inputType: "number",
    helperText: "1 ile 10 arasinda disiplin puani.",
    placeholder: "8",
    options: [],
    required: true,
    active: true,
    sortOrder: 40,
    source: "default",
  },
  {
    id: "default-participation-score",
    fieldKey: "participation_score",
    label: "Katilim puan",
    inputType: "number",
    helperText: "1 ile 10 arasinda derse katilim puani.",
    placeholder: "8",
    options: [],
    required: true,
    active: true,
    sortOrder: 50,
    source: "default",
  },
  {
    id: "default-strengths",
    fieldKey: "strengths",
    label: "Guclu yonler",
    inputType: "textarea",
    helperText: "Sporcunun one cikan yonlerini yaz.",
    placeholder: "Denge, hizli algi, kuvvetli baslangic...",
    options: [],
    required: true,
    active: true,
    sortOrder: 60,
    source: "default",
  },
  {
    id: "default-improvement-areas",
    fieldKey: "improvement_areas",
    label: "Gelisim alanlari",
    inputType: "textarea",
    helperText: "Takip edilmesi gereken gelisim alanlarini yaz.",
    placeholder: "Donus tekniği, kondisyon, devam...",
    options: [],
    required: true,
    active: true,
    sortOrder: 70,
    source: "default",
  },
  {
    id: "default-coach-notes",
    fieldKey: "coach_notes",
    label: "Koc notu",
    inputType: "textarea",
    helperText: "Velinin veya yoneticinin de gorecegi kisa aciklama.",
    placeholder: "Bu ay motivasyonu yuksek, bireysel calismasi artirilmali...",
    options: [],
    required: true,
    active: true,
    sortOrder: 80,
    source: "default",
  },
];

function slugifyKey(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

export function normalizeQuestionFieldKey(value: string) {
  return slugifyKey(value) || "soru";
}

export function parseQuestionOptions(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [] as string[];
}

export function getQuestionValueName(fieldKey: string) {
  return `question:${fieldKey}`;
}

export function getQuestionInputTypeLabel(inputType: DetailQuestionInputType) {
  if (inputType === "textarea") {
    return "Uzun metin";
  }

  if (inputType === "number") {
    return "Sayisal puan";
  }

  if (inputType === "select") {
    return "Secimli liste";
  }

  return "Kisa metin";
}

export function buildLegacyDetailPayload(entries: DetailAnswerRecord[]) {
  const map = new Map(entries.map((entry) => [entry.fieldKey, entry.value]));

  const toNumber = (value: string | undefined) => {
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    category: map.get("category") ?? null,
    clubName: map.get("club_name") ?? null,
    technicalScore: toNumber(map.get("technical_score")),
    disciplineScore: toNumber(map.get("discipline_score")),
    participationScore: toNumber(map.get("participation_score")),
    strengths: map.get("strengths") ?? "",
    improvementAreas: map.get("improvement_areas") ?? "",
    coachNotes: map.get("coach_notes") ?? "",
  };
}

export function buildReportSummary(studentName: string, entries: DetailAnswerRecord[]) {
  const numericEntries = entries
    .filter((entry) => entry.inputType === "number")
    .map((entry) => Number(entry.value))
    .filter((value) => Number.isFinite(value));

  const averageScore = numericEntries.length
    ? Math.round(numericEntries.reduce((sum, value) => sum + value, 0) / numericEntries.length)
    : null;

  const headlineNotes = entries
    .filter((entry) => entry.inputType !== "number" && entry.value.trim().length > 0)
    .slice(0, 2)
    .map((entry) => `${entry.label}: ${entry.value}`);

  const intro = averageScore
    ? `${studentName} icin guncel karne olusturuldu. Ortalama gelisim puani ${averageScore}/10.`
    : `${studentName} icin guncel karne olusturuldu.`;

  const notes = headlineNotes.length ? ` One cikan notlar: ${headlineNotes.join(" | ")}.` : "";

  return `${intro}${notes}`.trim();
}

export function getFallbackEntriesFromLegacy(input: {
  category?: string | null;
  clubName?: string | null;
  technicalScore?: number | null;
  disciplineScore?: number | null;
  participationScore?: number | null;
  strengths?: string | null;
  improvementAreas?: string | null;
  coachNotes?: string | null;
}) {
  const values = new Map<string, string>([
    ["category", input.category ?? ""],
    ["club_name", input.clubName ?? ""],
    ["technical_score", input.technicalScore != null ? String(input.technicalScore) : ""],
    ["discipline_score", input.disciplineScore != null ? String(input.disciplineScore) : ""],
    ["participation_score", input.participationScore != null ? String(input.participationScore) : ""],
    ["strengths", input.strengths ?? ""],
    ["improvement_areas", input.improvementAreas ?? ""],
    ["coach_notes", input.coachNotes ?? ""],
  ]);

  return defaultStudentDetailQuestions
    .map((question) => {
      const value = values.get(question.fieldKey) ?? "";

      if (!value) {
        return null;
      }

      return {
        questionId: question.id,
        fieldKey: question.fieldKey,
        label: question.label,
        inputType: question.inputType,
        value,
        sortOrder: question.sortOrder,
      } satisfies DetailAnswerRecord;
    })
    .filter((entry): entry is DetailAnswerRecord => entry !== null);
}
