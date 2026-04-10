import Link from "next/link";

import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { AuthEmailActionForm } from "@/components/auth-email-action-form";
import { BrandMark } from "@/components/brand-mark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(2,83,205,0.12),_transparent_24%),linear-gradient(180deg,#f7f9fb_0%,#eef2f5_100%)] px-5 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <BrandMark />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sifre yenile</CardTitle>
            <CardDescription>
              E-posta adresini gir, sana sifreni yenileyecegin baglantiyi gonderelim.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <AuthEmailActionForm
              action={requestPasswordResetAction}
              submitLabel="Yenileme baglantisi gonder"
            />
            <Link href="/login" className="text-sm font-medium text-primary">
              Giris ekranina don
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
