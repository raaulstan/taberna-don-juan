import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { site } from "@/config/site";
import { siteIcons } from "@/config/icons";
import { editorialFont, interfaceFont } from "@/config/fonts";
import { isLocale, locales } from "@/i18n/config";

import "../../globals.css";
import "../../public-design.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  manifest: "/manifest.webmanifest",
  icons: siteIcons,
  ...(process.env.VERCEL_ENV === "preview" ? { robots: { index: false, follow: false } } : {}),
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#3B2115" };

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className={`public-site flex min-h-dvh flex-col ${editorialFont.variable} ${interfaceFont.variable}`}>
        <PublicHeader locale={locale} />
        <main id="contenido" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <PublicFooter locale={locale} />
      </body>
    </html>
  );
}
