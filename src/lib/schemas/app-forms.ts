import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(3, "Ogrenci adi en az 3 karakter olmali."),
  birthDate: z.string().min(1, "Dogum tarihi secilmeli."),
  gender: z.enum(["female", "male"], { message: "Cinsiyet secilmeli." }),
  programId: z.string().uuid("Bir program secilmeli."),
  sessionSeriesId: z.string().uuid("Bir grup / seans serisi secilmeli."),
  startsOn: z.string().min(1, "Kayit tarihi secilmeli."),
  parentEmail: z
    .string()
    .email("Veli e-postasi gecerli olmali.")
    .or(z.literal(""))
    .transform((value) => value.trim()),
  parentWhatsapp: z
    .string()
    .min(10, "Veli WhatsApp numarasi en az 10 karakter olmali.")
    .or(z.literal(""))
    .transform((value) => value.trim()),
});

export const updateStudentSchema = z.object({
  studentId: z.string().uuid("Ogrenci secilmeli."),
  fullName: z.string().min(3, "Ogrenci adi en az 3 karakter olmali."),
  birthDate: z.string().min(1, "Dogum tarihi secilmeli."),
  programId: z.string().uuid("Bir program secilmeli."),
  sessionSeriesId: z.string().uuid("Bir grup / seans serisi secilmeli."),
  gender: z.enum(["female", "male", "other"]),
});

export const deactivateStudentSchema = z.object({
  studentId: z.string().uuid("Ogrenci secilmeli."),
});

export const grantStudentLessonsSchema = z.object({
  studentId: z.string().uuid("Ogrenci secilmeli."),
  lessonCount: z.coerce.number().int().min(1, "En az 1 hak verilmeli.").max(16, "Tek seferde en fazla 16 hak verilebilir."),
});

export const rebuildStudentLessonsSchema = z.object({
  studentId: z.string().uuid("Ogrenci secilmeli."),
  startsOn: z.string().min(1, "Yeni paket baslangic tarihi secilmeli."),
});

export const saveStudentDetailSchema = z.object({
  studentId: z.string().uuid("Ogrenci secilmeli."),
});

export const createDetailQuestionSchema = z.object({
  label: z.string().min(3, "Soru etiketi en az 3 karakter olmali."),
  fieldKey: z
    .string()
    .min(2, "Alan anahtari en az 2 karakter olmali.")
    .regex(/^[a-z0-9_]+$/, "Alan anahtari yalnizca kucuk harf, rakam ve alt cizgi icermeli."),
  inputType: z.enum(["text", "textarea", "number", "select"]),
  helperText: z.string().trim().optional().default(""),
  placeholder: z.string().trim().optional().default(""),
  optionsText: z.string().trim().optional().default(""),
  required: z.enum(["yes", "no"]),
  sortOrder: z.coerce.number().int().min(1).max(999),
});

export const updateDetailQuestionSchema = z.object({
  questionId: z.string().uuid("Soru secilmeli."),
  label: z.string().min(3, "Soru etiketi en az 3 karakter olmali."),
  fieldKey: z
    .string()
    .min(2, "Alan anahtari en az 2 karakter olmali.")
    .regex(/^[a-z0-9_]+$/, "Alan anahtari yalnizca kucuk harf, rakam ve alt cizgi icermeli."),
  inputType: z.enum(["text", "textarea", "number", "select"]),
  helperText: z.string().trim().optional().default(""),
  placeholder: z.string().trim().optional().default(""),
  optionsText: z.string().trim().optional().default(""),
  required: z.enum(["yes", "no"]),
  sortOrder: z.coerce.number().int().min(1).max(999),
});

export const toggleDetailQuestionStatusSchema = z.object({
  questionId: z.string().uuid("Soru secilmeli."),
  nextState: z.enum(["active", "inactive"]),
});

export const deleteDetailQuestionSchema = z.object({
  questionId: z.string().uuid("Soru secilmeli."),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(4, "Baslik en az 4 karakter olmali."),
  body: z.string().min(10, "Duyuru metni en az 10 karakter olmali."),
  audienceRole: z.enum(["all", "manager", "coach", "parent"]),
});

export const createSupportThreadSchema = z.object({
  subject: z.string().min(4, "Konu en az 4 karakter olmali."),
  body: z.string().min(10, "Aciklama en az 10 karakter olmali."),
});

export const replySupportThreadSchema = z.object({
  threadId: z.string().uuid("Gecerli bir talep secilmeli."),
  body: z.string().min(4, "Yanit en az 4 karakter olmali."),
});

export const updateSupportThreadStatusSchema = z.object({
  threadId: z.string().uuid("Gecerli bir talep secilmeli."),
  status: z.enum(["open", "waiting_parent", "resolved"]),
});

export const createManualPaymentSchema = z.object({
  chargeId: z.string().uuid("Gecerli bir tahakkuk secilmeli."),
  amount: z.coerce.number().positive("Odeme tutari sifirdan buyuk olmali."),
  paymentMethod: z.enum(["cash", "transfer", "card", "manual"], {
    message: "Odeme yontemi secilmeli.",
  }),
  paymentDate: z.string().min(1, "Odeme tarihi secilmeli."),
  referenceNo: z.string().trim().nullable().optional().transform((value) => value ?? ""),
  note: z.string().trim().nullable().optional().transform((value) => value ?? ""),
});

export const createPaymentSupportSchema = z.object({
  chargeId: z.string().uuid("Gecerli bir tahakkuk secilmeli."),
  body: z.string().min(10, "Dekont veya aciklama en az 10 karakter olmali."),
});

export const createLeadSubmissionSchema = z.object({
  fullName: z.string().min(3, "Ad soyad en az 3 karakter olmali."),
  email: z.string().email("Gecerli bir e-posta girilmeli."),
  phone: z.string().min(10, "Telefon numarasi eksik."),
  branchInterest: z.string().trim().optional().default(""),
  message: z.string().trim().optional().default(""),
  source: z
    .enum(["organic_home", "organic_seo_page", "gbp", "whatsapp", "phone"])
    .optional()
    .default("organic_home"),
});

export const createPreRegistrationSchema = z.object({
  studentTcIdentityNo: z
    .string()
    .trim()
    .regex(/^\d{11}$|^$/, "TC Kimlik No 11 haneli olmali veya bos birakilmali.")
    .default(""),
  studentFullName: z.string().min(3, "Ogrenci adi en az 3 karakter olmali."),
  studentBirthDate: z.string().min(1, "Dogum tarihi secilmeli."),
  studentGender: z.enum(["female", "male"], { message: "Ogrenci cinsiyeti secilmeli." }),
  studentPhotoUrl: z.string().url("Gecerli bir fotograf baglantisi bekleniyor.").or(z.literal("")),
  studentPhotoPath: z.string().trim().optional().default(""),
  note: z.string().trim().optional().default(""),
  branchId: z.string().uuid("Bir sube secilmeli.").or(z.literal("")).optional().default(""),
  seasonId: z.string().uuid("Bir sezon secilmeli.").or(z.literal("")).optional().default(""),
  programId: z.string().uuid("Bir program secilmeli.").or(z.literal("")).optional().default(""),
  motherName: z.string().trim().optional().default(""),
  motherPhone: z.string().trim().optional().default(""),
  motherOccupation: z.string().trim().optional().default(""),
  fatherName: z.string().trim().optional().default(""),
  fatherPhone: z.string().trim().optional().default(""),
  fatherOccupation: z.string().trim().optional().default(""),
  parentEmail: z.string().email("Gecerli bir veli e-postasi girilmeli."),
  parentWhatsapp: z.string().min(10, "WhatsApp veya telefon numarasi girilmeli."),
  address: z.string().min(8, "Ikametgah adresi eksik."),
  emergencyContact: z.string().min(3, "Acil durumda aranacak kisi girilmeli."),
  customAnswers: z.record(z.string(), z.string()).optional().default({}),
  kvkkAccepted: z.boolean().refine((value) => value === true, {
    message: "KVKK metni kabul edilmeli.",
  }),
  parentPermissionAccepted: z.boolean().refine((value) => value === true, {
    message: "Veli izin belgesi kabul edilmeli.",
  }),
});

export const updatePreRegistrationStatusSchema = z.object({
  preRegistrationId: z.string().uuid("Basvuru secilmeli."),
  status: z.enum([
    "reviewing",
    "contacted",
    "documents_pending",
    "trial_scheduled",
    "ready_to_activate",
    "approved",
    "lost",
    "rejected",
    "archived",
  ]),
  contextNote: z.string().trim().optional().default(""),
});

export const createPreRegistrationNoteSchema = z.object({
  preRegistrationId: z.string().uuid("Basvuru secilmeli."),
  body: z.string().min(4, "Not en az 4 karakter olmali."),
});

export const activatePreRegistrationSchema = z.object({
  preRegistrationId: z.string().uuid("Basvuru secilmeli."),
  branchId: z.string().uuid("Bir sube secilmeli."),
  seasonId: z.string().uuid("Bir sezon secilmeli."),
  programId: z.string().uuid("Bir program secilmeli."),
  sessionSeriesId: z.string().uuid("Bir grup / seans serisi secilmeli."),
  startsOn: z.string().min(1, "Baslangic tarihi secilmeli."),
  createInitialCharge: z.enum(["yes", "no"]),
});

export const updatePreRegistrationSettingsSchema = z.object({
  formEnabled: z.enum(["enabled", "disabled"]),
  formEyebrow: z.string().min(3, "Form etiketi en az 3 karakter olmali."),
  formTitle: z.string().min(8, "Form basligi en az 8 karakter olmali."),
  formDescription: z.string().min(20, "Form aciklamasi en az 20 karakter olmali."),
  formLogoUrl: z.string().trim().url("Form logosu icin gecerli bir baglanti bekleniyor.").or(z.literal("")),
  formLogoPath: z.string().trim().optional().default(""),
  kvkkTitle: z.string().min(3, "KVKK basligi en az 3 karakter olmali."),
  kvkkBody: z.string().min(20, "KVKK metni en az 20 karakter olmali."),
  kvkkCheckboxLabel: z.string().min(5, "KVKK checkbox metni eksik."),
  parentPermissionTitle: z.string().min(3, "Veli izin basligi en az 3 karakter olmali."),
  parentPermissionBody: z.string().min(20, "Veli izin metni en az 20 karakter olmali."),
  parentPermissionCheckboxLabel: z.string().min(5, "Veli izin checkbox metni eksik."),
  successMessage: z.string().min(8, "Basari mesaji en az 8 karakter olmali."),
  helperNote: z.string().min(8, "Bilgilendirme notu en az 8 karakter olmali."),
});

export const createPreRegistrationFieldSchema = z.object({
  label: z.string().min(3, "Alan etiketi en az 3 karakter olmali."),
  fieldKey: z
    .string()
    .min(2, "Alan anahtari en az 2 karakter olmali.")
    .regex(/^[a-zA-Z0-9_]+$/, "Alan anahtari yalnizca harf, rakam ve alt cizgi icermeli."),
  inputType: z.enum(["text", "textarea", "date", "select", "email", "phone", "file"]),
  helperText: z.string().trim().optional().default(""),
  placeholder: z.string().trim().optional().default(""),
  optionsText: z.string().trim().optional().default(""),
  required: z.enum(["yes", "no"]),
  active: z.enum(["yes", "no"]).optional().default("yes"),
  sortOrder: z.coerce.number().int().min(1).max(999),
  section: z.enum(["student", "parent", "application"]),
});

export const updatePreRegistrationFieldSchema = z.object({
  fieldId: z.string().uuid("Alan secilmeli."),
  label: z.string().min(3, "Alan etiketi en az 3 karakter olmali."),
  helperText: z.string().trim().optional().default(""),
  placeholder: z.string().trim().optional().default(""),
  optionsText: z.string().trim().optional().default(""),
  required: z.enum(["yes", "no"]),
  active: z.enum(["yes", "no"]).optional().default("yes"),
  sortOrder: z.coerce.number().int().min(1).max(999),
  section: z.enum(["student", "parent", "application"]),
});

export const togglePreRegistrationFieldStatusSchema = z.object({
  fieldId: z.string().uuid("Alan secilmeli."),
  nextState: z.enum(["active", "inactive"]),
});

export const deletePreRegistrationFieldSchema = z.object({
  fieldId: z.string().uuid("Alan secilmeli."),
});

export const reorderPreRegistrationFieldsSchema = z.object({
  layout: z
    .string()
    .min(2, "Alan siralama verisi eksik.")
    .transform((value, ctx) => {
      try {
        const parsed = JSON.parse(value) as unknown;
        return z
          .array(
            z.object({
              id: z.string().uuid("Alan secimi gecersiz."),
              section: z.enum(["student", "parent", "application"]),
              sortOrder: z.number().int().min(1).max(999),
            }),
          )
          .min(1, "En az bir alan bulunmali.")
          .parse(parsed);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Alan siralama verisi okunamadi.",
        });

        return z.NEVER;
      }
    }),
});

export const createSessionSchema = z.object({
  title: z.string().min(4, "Seans basligi en az 4 karakter olmali."),
  programId: z.string().uuid("Program secilmeli."),
  coachId: z.string().uuid("Koc secilmeli."),
  startsAt: z.string().min(1, "Baslangic zamani secilmeli."),
  endsAt: z.string().min(1, "Bitis zamani secilmeli."),
  location: z.string().min(2, "Alan bilgisi girilmeli."),
});

export const updateSessionSchema = z.object({
  sessionId: z.string().uuid("Seans secilmeli."),
  title: z.string().min(4, "Seans basligi en az 4 karakter olmali."),
  programId: z.string().uuid("Program secilmeli."),
  coachId: z.string().uuid("Koc secilmeli."),
  startsAt: z.string().min(1, "Baslangic zamani secilmeli."),
  endsAt: z.string().min(1, "Bitis zamani secilmeli."),
  location: z.string().min(2, "Alan bilgisi girilmeli."),
});

export const cancelSessionSchema = z.object({
  sessionId: z.string().uuid("Seans secilmeli."),
});

export const createProgramSchema = z.object({
  title: z.string().min(4, "Program basligi en az 4 karakter olmali."),
  programTypeId: z.string().uuid("Program tipi secilmeli."),
  seasonId: z.string().uuid("Sezon secilmeli."),
  categoryId: z.string().uuid("Kategori secilmeli."),
  branchId: z.string().uuid("Sube secilmeli."),
  sportsBranchId: z.string().uuid("Brans secilmeli."),
  coachProfileId: z.string().uuid("Egitmen secilmeli."),
  areaId: z.string().uuid("Alan / Pist secilmeli."),
  ageBand: z.string().min(3, "Yas bandi girilmeli."),
  capacity: z.coerce.number().int().positive("Kontenjan sifirdan buyuk olmali."),
  monthlyPrice: z.coerce.number().positive("Aylik ucret sifirdan buyuk olmali."),
  status: z.enum(["active", "draft", "paused"]),
  notes: z.string().trim().optional().default(""),
  monthlyLessonQuota: z.coerce.number().int().min(1).max(31).default(8),
});

export const updateProgramSchema = z.object({
  programId: z.string().uuid("Program secilmeli."),
  title: z.string().min(4, "Program basligi en az 4 karakter olmali."),
  programTypeId: z.string().uuid("Program tipi secilmeli."),
  seasonId: z.string().uuid("Sezon secilmeli."),
  categoryId: z.string().uuid("Kategori secilmeli."),
  branchId: z.string().uuid("Sube secilmeli."),
  sportsBranchId: z.string().uuid("Brans secilmeli."),
  coachProfileId: z.string().uuid("Egitmen secilmeli."),
  areaId: z.string().uuid("Alan / Pist secilmeli."),
  ageBand: z.string().min(3, "Yas bandi girilmeli."),
  capacity: z.coerce.number().int().positive("Kontenjan sifirdan buyuk olmali."),
  monthlyPrice: z.coerce.number().positive("Aylik ucret sifirdan buyuk olmali."),
  status: z.enum(["active", "draft", "paused"]),
  notes: z.string().trim().optional().default(""),
  monthlyLessonQuota: z.coerce.number().int().min(1).max(31).default(8),
});

export const archiveProgramSchema = z.object({
  programId: z.string().uuid("Program secilmeli."),
});

export const createSessionSeriesSchema = z
  .object({
    title: z.string().min(4, "Seans serisi basligi en az 4 karakter olmali."),
    programId: z.string().uuid("Program secilmeli."),
    coachId: z.string().uuid("Egitmen secilmeli."),
    areaId: z.string().uuid("Alan / Pist secilmeli."),
    startsOn: z.string().min(1, "Baslangic tarihi secilmeli."),
    endsOn: z.string().min(1, "Bitis tarihi secilmeli."),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Baslangic saati secilmeli."),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Bitis saati secilmeli."),
    weekdays: z.array(z.coerce.number().int().min(1).max(7)).min(1, "En az bir tekrar gunu secilmeli."),
    notes: z.string().trim().optional().default(""),
  })
  .refine((value) => value.startsOn <= value.endsOn, {
    message: "Bitis tarihi baslangic tarihinden once olamaz.",
    path: ["endsOn"],
  });

export const updateSessionSeriesSchema = z
  .object({
    sessionId: z.string().uuid("Seans secilmeli."),
    scope: z.enum(["single", "following", "series"]),
    title: z.string().min(4, "Seans basligi en az 4 karakter olmali."),
    programId: z.string().uuid("Program secilmeli."),
    coachId: z.string().uuid("Egitmen secilmeli."),
    areaId: z.string().uuid("Alan / Pist secilmeli."),
    startsAt: z.string().min(1, "Baslangic zamani secilmeli."),
    endsAt: z.string().min(1, "Bitis zamani secilmeli."),
    notes: z.string().trim().optional().default(""),
  });

export const cancelSessionSeriesSchema = z.object({
  sessionId: z.string().uuid("Seans secilmeli."),
  scope: z.enum(["single", "following", "series"]),
});

export const saveAttendanceModalSchema = z.object({
  sessionId: z.string().uuid("Seans secilmeli."),
});

export const createCatalogItemSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmali."),
  slug: z
    .string()
    .min(2, "Slug en az 2 karakter olmali.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  branchId: z.string().uuid().optional(),
});

export const createManagedUserSchema = z.object({
  fullName: z.string().min(3, "Ad soyad en az 3 karakter olmali."),
  email: z.string().email("Gecerli bir e-posta girilmeli."),
  password: z.string().min(8, "Gecici sifre en az 8 karakter olmali."),
  phone: z.string().trim().optional().default(""),
  whatsappOptIn: z.enum(["yes", "no"]).default("no"),
  role: z.enum(["admin", "manager", "coach", "parent"]),
});

export const updateUserRoleSchema = z.object({
  profileId: z.string().uuid("Kullanici secilmeli."),
  role: z.enum(["admin", "manager", "coach", "parent"]),
});

export const updateOrganizationSettingsSchema = z.object({
  name: z.string().min(3, "Kurum adi en az 3 karakter olmali."),
  slug: z
    .string()
    .min(3, "Slug en az 3 karakter olmali.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  locale: z.string().min(2, "Locale bilgisi girilmeli."),
  timezone: z.string().min(3, "Timezone bilgisi girilmeli."),
});

export const toggleNotificationReadSchema = z.object({
  notificationId: z.string().uuid("Bildirim secilmeli."),
  nextState: z.enum(["read", "unread"]),
});

export const createBranchSchema = z.object({
  name: z.string().min(3, "Sube adi en az 3 karakter olmali."),
  slug: z
    .string()
    .min(3, "Sube slug en az 3 karakter olmali.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  location: z.string().min(3, "Lokasyon bilgisi girilmeli."),
});

export const createSeasonSchema = z
  .object({
    title: z.string().min(3, "Sezon adi en az 3 karakter olmali."),
    startsOn: z.string().min(1, "Baslangic tarihi secilmeli."),
    endsOn: z.string().min(1, "Bitis tarihi secilmeli."),
    makeActive: z.enum(["yes", "no"]),
    makeDefault: z.enum(["yes", "no"]),
  })
  .refine((value) => value.startsOn <= value.endsOn, {
    message: "Bitis tarihi baslangic tarihinden once olamaz.",
    path: ["endsOn"],
  });

export const markAllNotificationsReadSchema = z.object({
  scope: z.literal("all"),
});

export const updateBranchSchema = z.object({
  branchId: z.string().uuid("Sube secilmeli."),
  name: z.string().min(3, "Sube adi en az 3 karakter olmali."),
  slug: z
    .string()
    .min(3, "Sube slug en az 3 karakter olmali.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  location: z.string().min(3, "Lokasyon bilgisi girilmeli."),
});

export const toggleBranchStatusSchema = z.object({
  branchId: z.string().uuid("Sube secilmeli."),
  nextState: z.enum(["active", "inactive"]),
});

export const toggleBranchArchiveSchema = z.object({
  branchId: z.string().uuid("Sube secilmeli."),
  nextState: z.enum(["archive", "restore"]),
});

export const updateSeasonSchema = z
  .object({
    seasonId: z.string().uuid("Sezon secilmeli."),
    title: z.string().min(3, "Sezon adi en az 3 karakter olmali."),
    startsOn: z.string().min(1, "Baslangic tarihi secilmeli."),
    endsOn: z.string().min(1, "Bitis tarihi secilmeli."),
    makeActive: z.enum(["yes", "no"]),
    makeDefault: z.enum(["yes", "no"]),
  })
  .refine((value) => value.startsOn <= value.endsOn, {
    message: "Bitis tarihi baslangic tarihinden once olamaz.",
    path: ["endsOn"],
  });

export const toggleSeasonStatusSchema = z.object({
  seasonId: z.string().uuid("Sezon secilmeli."),
  nextState: z.enum(["active", "inactive"]),
});

export const toggleSeasonDefaultSchema = z.object({
  seasonId: z.string().uuid("Sezon secilmeli."),
  nextState: z.enum(["default", "clear"]),
});

export const updateLandingContentSchema = z.object({
  content: z.string().min(2, "Landing content verisi eksik."),
});

export const updateSeoPageContentSchema = z.object({
  slug: z
    .string()
    .min(2, "Sayfa slug bilgisi eksik.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  content: z.string().min(2, "SEO sayfa verisi eksik."),
});

export const createPublicPageSchema = z.object({
  title: z.string().min(3, "Sayfa basligi en az 3 karakter olmali."),
  slug: z
    .string()
    .min(2, "Slug bilgisi eksik.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  template: z.enum(["content", "service", "guide", "campaign"]),
});

export const updatePublicPageSchema = z.object({
  kind: z.enum(["seo", "custom"]),
  slug: z
    .string()
    .min(2, "Sayfa slug bilgisi eksik.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  content: z.string().min(2, "Sayfa verisi eksik."),
});

export const mutatePublicPageSchema = z.object({
  kind: z.enum(["gallery", "seo", "custom"]),
  slug: z
    .string()
    .trim()
    .default(""),
  intent: z.enum(["publish", "unpublish", "archive", "delete"]),
});

export const duplicatePublicPageSchema = z.object({
  kind: z.enum(["seo", "custom"]),
  sourceSlug: z
    .string()
    .min(2, "Kaynak slug eksik.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  targetSlug: z
    .string()
    .min(2, "Yeni slug eksik.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnizca kucuk harf, rakam ve tire icermeli."),
  title: z.string().min(3, "Yeni baslik en az 3 karakter olmali."),
});

export const updateWhatsAppTemplateSchema = z.object({
  templateId: z.string().uuid("Template secilmeli."),
  metaTemplateName: z.string().trim().default(""),
  enabled: z.enum(["yes", "no"]),
});

export const updateMessageTopicSchema = z.object({
  topicId: z.string().uuid("Mesaj konusu secilmeli."),
  title: z.string().min(3, "Baslik en az 3 karakter olmali."),
  description: z.string().min(6, "Kisa aciklama en az 6 karakter olmali."),
  channel: z.enum(["whatsapp", "panel", "both"]),
  bodyTemplate: z.string().min(8, "Mesaj metni en az 8 karakter olmali."),
  active: z.enum(["yes", "no"]),
});

export const sendWhatsAppTestSchema = z.object({
  phone: z.string().min(10, "Test numarasi eksik."),
  eventKey: z.enum([
    "registration_completed",
    "attendance_absent_manual",
    "payment_reminder_manual",
    "report_card_updated",
    "bulk_broadcast",
  ]),
  message: z.string().trim().optional().default(""),
});

export const createWhatsAppCampaignSchema = z.object({
  title: z.string().min(3, "Kampanya basligi en az 3 karakter olmali."),
  topicKey: z.enum([
    "registration_completed",
    "pre_registration_activated",
    "student_created_manual",
    "attendance_absent_manual",
    "payment_reminder_manual",
    "report_card_updated",
    "bulk_broadcast",
  ]),
  audienceType: z.enum([
    "all_parents",
    "all_users",
    "debt_parents",
    "program_parents",
    "branch_parents",
    "session_series_members",
    "specific_students",
    "all_staff",
    "coaches",
    "managers",
  ]),
  programId: z.string().trim().optional().default(""),
  branchId: z.string().trim().optional().default(""),
  sessionSeriesId: z.string().trim().optional().default(""),
  sendMode: z.enum(["meta", "web"]),
  managerNote: z.string().trim().optional().default(""),
  message: z.string().min(6, "Mesaj en az 6 karakter olmali."),
});

export const sendPaymentReminderSchema = z.object({
  chargeId: z.string().uuid("Tahakkuk secilmeli."),
});

export const sendBulkPaymentReminderSchema = z.object({
  scope: z.enum(["overdue"]),
});

export const sendAttendanceWhatsAppSchema = z.object({
  sessionId: z.string().uuid("Seans secilmeli."),
  studentId: z.string().uuid("Ogrenci secilmeli."),
});
