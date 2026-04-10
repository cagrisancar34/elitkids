import Link from "next/link";

import { completePasswordSetupAction } from "@/app/(auth)/actions";
import { AuthPasswordSetupForm } from "@/components/auth-password-setup-form";
import { BrandMark } from "@/components/brand-mark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;
  const tokenHash = params.token_hash ?? "";
  const type = params.type ?? "invite";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(2,83,205,0.12),_transparent_24%),linear-gradient(180deg,#f7f9fb_0%,#eef2f5_100%)] px-5 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <BrandMark />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Davet kabul et</CardTitle>
            <CardDescription>
              Kurum davetini tamamlamak icin hesap sifreni belirle.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {tokenHash ? (
              <AuthPasswordSetupForm
                action={completePasswordSetupAction}
                tokenHash={tokenHash}
                type={type}
              />
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Davet baglantisi gecersiz veya eksik. E-postandaki baglantiyi tekrar acmayi dene.
              </p>
            )}
            <Link href="/login" className="text-sm font-medium text-primary">
              Giris ekranina don
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
