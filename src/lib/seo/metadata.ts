import type { Metadata } from "next";

import { site } from "@/config/site";
import { defaultLocale, locales, localeFormats, type Locale } from "@/i18n/config";

export function localizedMetadata({
  locale,
  title,
  description,
  path = "",
}: {
  locale: Locale;
  title: string;
  description: string;
  path?: "" | "/carta" | "/bebidas";
}): Metadata {
  const url = new URL(`/${locale}${path}`, site.url).toString();
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((language) => [language, `${site.url}/${language}${path}`])),
        "x-default": `${site.url}/${defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url,
      locale: localeFormats[locale].replace("-", "_"),
      alternateLocale: locales.filter((language) => language !== locale).map((language) => localeFormats[language].replace("-", "_")),
    },
    twitter: { card: "summary", title, description },
  };
}
