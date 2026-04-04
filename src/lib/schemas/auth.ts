import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email("Gecerli bir e-posta adresi gir."),
  password: z.string().min(8, "Sifre en az 8 karakter olmali."),
});

export type CredentialsSchema = z.infer<typeof credentialsSchema>;
