"use client";

import { BranchCreateForm } from "@/components/branch-create-form";
import { BranchSettingsPanel } from "@/components/branch-settings-panel";
import { OrganizationSettingsForm } from "@/components/organization-settings-form";
import { SeasonCreateForm } from "@/components/season-create-form";
import { SeasonSettingsPanel } from "@/components/season-settings-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BranchSetting, OrganizationSettings, SeasonSetting } from "@/lib/types";

export function AdminSettingsTabs({
  organization,
  branches,
  seasons,
}: {
  organization: OrganizationSettings | null;
  branches: BranchSetting[];
  seasons: SeasonSetting[];
}) {
  return (
    <Tabs defaultValue="organization">
      <TabsList>
        <TabsTrigger value="organization">Kurum</TabsTrigger>
        <TabsTrigger value="branches">Subeler</TabsTrigger>
        <TabsTrigger value="seasons">Sezonlar</TabsTrigger>
        <TabsTrigger value="security">Guvenlik</TabsTrigger>
      </TabsList>

      <TabsContent value="organization">
        <Card>
          <CardHeader>
            <CardTitle>Kurum ayarlari</CardTitle>
            <CardDescription>Marka kimligi ve locale tercihleri artik gercek organization kaydina yazilir.</CardDescription>
          </CardHeader>
          <CardContent>
            {organization ? (
              <OrganizationSettingsForm organization={organization} />
            ) : (
              <div className="rounded-[1.25rem] bg-accent p-4 text-sm leading-6 text-muted-foreground">
                Organization kaydi okunamadi. Admin profilinin kurum baglantisini kontrol et.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="branches">
        <Card>
          <CardHeader>
            <CardTitle>Sube ayarlari</CardTitle>
            <CardDescription>Saha ve operasyon lokasyonlari artik settings panelinden olusturulur.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <BranchCreateForm />
            {branches.length ? (
              <BranchSettingsPanel branches={branches} />
            ) : (
              <div className="rounded-[1.25rem] bg-accent p-4 text-sm leading-6 text-muted-foreground">
                Henuz sube kaydi yok. Canli tablolar icin 0003_settings_expansion.sql ve 0004_settings_archive_default.sql migration dosyalarini calistir.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seasons">
        <Card>
          <CardHeader>
            <CardTitle>Sezon ayarlari</CardTitle>
            <CardDescription>Aktif donem ve planli sezonlar admin tarafinda tek panelden yonetilir.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SeasonCreateForm />
            {seasons.length ? (
              <SeasonSettingsPanel seasons={seasons} />
            ) : (
              <div className="rounded-[1.25rem] bg-accent p-4 text-sm leading-6 text-muted-foreground">
                Henuz sezon kaydi yok. Canli tablolar icin 0003_settings_expansion.sql ve 0004_settings_archive_default.sql migration dosyalarini calistir.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Guvenlik ve audit</CardTitle>
            <CardDescription>Admin rolu kritik alanlarda tam yazar, yonetici rolu kasitli olarak sinirli kalir.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.25rem] bg-accent p-4 text-sm leading-6 text-muted-foreground">
              Kullanici ve rol yonetimi yalnizca admin panelinde calisir. RLS politikalarinda da sistem ayarlari admin ile sinirlandirildi.
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
