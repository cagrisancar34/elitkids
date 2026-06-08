import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Dört Mevsim Doğada",
    template: "%s | Dört Mevsim Doğada",
  },
  description:
    "Çocuklu aileler için doğa, spor ve sanat odaklı seyahat, kamp ve atölye programları.",
  openGraph: {
    description:
      "Çocuklu aileler için doğa, spor ve sanat odaklı seyahat, kamp ve atölye programları.",
    locale: "tr_TR",
    siteName: "Dört Mevsim Doğada",
    title: "Dört Mevsim Doğada",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
