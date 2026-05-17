import { GoogleAnalytics } from "@/components/google-analytics";
import { PublicRouteAnalyticsTracker } from "@/components/public-route-analytics-tracker";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <GoogleAnalytics />
      <PublicRouteAnalyticsTracker />
      {children}
    </>
  );
}
