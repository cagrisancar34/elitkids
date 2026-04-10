import { GoogleAnalytics } from "@/components/google-analytics";
import { HomePageClient } from "@/components/home-page-client";
import { getLandingContentFromStorage } from "@/lib/landing-content-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { content } = await getLandingContentFromStorage();

  return (
    <>
      <GoogleAnalytics />
      <HomePageClient initialContent={content} />
    </>
  );
}
