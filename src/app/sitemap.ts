import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/carta", "/bebidas"].flatMap((path) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, `${site.url}/${locale}${path}`]));
    return locales.map((locale) => ({ url: `${site.url}/${locale}${path}`, alternates: { languages } }));
  });
}
