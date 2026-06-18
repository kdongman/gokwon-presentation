import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import AppShell from "@/components/AppShell";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import LanguageSwitcherBar from "@/components/LanguageSwitcherBar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  applicationName: "GoKwon",
  title: {
    default: "GoKwon",
    template: "%s | GoKwon",
  },
  description:
    "Personal concierge and delivery assistance for travelers in Korea.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GoKwon",
  url: "https://example.com",
  logo: "https://example.com/icon.png",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LanguageSwitcherBar />
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
