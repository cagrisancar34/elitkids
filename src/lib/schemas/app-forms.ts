import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(3, "Ogrenci adi en az 3 karakter olmali."),
  birthDate: z.string().min(1, "Dogum tarihi secilmeli."),
  programTitle: z.string().min(1, "Bir program secilmeli."),
  parentEmail: z
    .string()
    .email("Veli e-postasi gecerli olmali.")
    .or(z.literal(""))
    .transform((value) => value.trim()),
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

export const createSessionSchema = z.object({
  title: z.string().min(4, "Seans basligi en az 4 karakter olmali."),
  programId: z.string().uuid("Program secilmeli."),
  coachId: z.string().uuid("Koc secilmeli."),
  startsAt: z.string().min(1, "Baslangic zamani secilmeli."),
  endsAt: z.string().min(1, "Bitis zamani secilmeli."),
  location: z.string().min(2, "Alan bilgisi girilmeli."),
});

export const createProgramSchema = z.object({
  title: z.string().min(4, "Program basligi en az 4 karakter olmali."),
  ageBand: z.string().min(3, "Yas bandi girilmeli."),
  capacity: z.coerce.number().int().positive("Kontenjan sifirdan buyuk olmali."),
  monthlyPrice: z.coerce.number().positive("Aylik ucret sifirdan buyuk olmali."),
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
