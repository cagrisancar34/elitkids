"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { GA_ID, pageview } from "@/lib/analytics";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!GA_ID || !pathname || !isReady) {
      return;
    }

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    pageview(url);
  }, [isReady, pathname, searchParams]);

  if (!GA_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />
      <Script id="ga4-base" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
