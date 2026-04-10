import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(3, "Ogrenci adi en az 3 karakter olmali."),
  birthDate: z.string().min(1, "Dogum tarihi secilmeli."),
  programId: z.string().uuid("Bir program secilmeli."),
  parentEmail: z
    .string()
    .email("Veli e-postasi gecerli olmali.")
    .or(z.literal(""))
    .transform((value) => value.trim()),
});

export const updateStudentSchema = z.object({
  studentId: z.string().uuid("Ogrenci secilmeli."),
  fullName: z.string().min(3, "Ogrenci adi en az 3 karakter olmali."),
  birthDate: z.string().min(1, "Dogum tarihi secilmeli."),
  programId: z.string().uuid("Bir program secilmeli."),
  gender: z.enum(["female", "male", "other"]),
});

export const deactivateStudentSchema = z.object({
  studentId: z.string().uuid("Ogrenci secilmeli."),
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

export const createManualPaymentSchema = z.object({
  chargeId: z.string().uuid("Gecerli bir tahakkuk secilmeli."),
  amount: z.coerce.number().positive("Odeme tutari sifirdan buyuk olmali."),
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
});

export const createPreRegistrationSchema = z.object({
  studentTcIdentityNo: z
    .string()
    .trim()
    .regex(/^\d{11}$|^$/, "TC Kimlik No 11 haneli olmali veya bos birakilmali.")
    .default(""),
  studentFullName: z.string().min(3, "Ogrenci adi en az 3 karakter olmali."),
  studentBirthDate: z.string().min(1, "Dogum tarihi secilmeli."),
  studentPhotoUrl: z.string().url("Gecerli bir fotograf baglantisi bekleniyor.").or(z.literal("")),
  studentPhotoPath: z.string().trim().optional().default(""),
  note: z.string().trim().optional().default(""),
  branchId: z.string().uuid("Bir sube secilmeli."),
  seasonId: z.string().uuid("Bir sezon secilmeli."),
  programId: z.string().uuid("Bir program secilmeli."),
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
  kvkkAccepted: z.boolean().refine((value) => value === true, {
    message: "KVKK metni kabul edilmeli.",
  }),
  parentPermissionAccepted: z.boolean().refine((value) => value === true, {
    message: "Veli izin belgesi kabul edilmeli.",
  }),
});

export const updatePreRegistrationStatusSchema = z.object({
  preRegistrationId: z.string().uuid("Basvuru secilmeli."),
  status: z.enum(["reviewing", "contacted", "approved", "rejected", "archived"]),
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
  startsOn: z.string().min(1, "Baslangic tarihi secilmeli."),
  createInitialCharge: z.enum(["yes", "no"]),
});

export const updatePreRegistrationSettingsSchema = z.object({
  formEnabled: z.enum(["enabled", "disabled"]),
  kvkkTitle: z.string().min(3, "KVKK basligi en az 3 karakter olmali."),
  kvkkBody: z.string().min(20, "KVKK metni en az 20 karakter olmali."),
  kvkkCheckboxLabel: z.string().min(5, "KVKK checkbox metni eksik."),
  parentPermissionTitle: z.string().min(3, "Veli izin basligi en az 3 karakter olmali."),
  parentPermissionBody: z.string().min(20, "Veli izin metni en az 20 karakter olmali."),
  parentPermissionCheckboxLabel: z.string().min(5, "Veli izin checkbox metni eksik."),
  successMessage: z.string().min(8, "Basari mesaji en az 8 karakter olmali."),
  helperNote: z.string().min(8, "Bilgilendirme notu en az 8 karakter olmali."),
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
