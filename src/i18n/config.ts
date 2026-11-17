export const locales = ["es", "en", "fr", "ro", "it", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  ro: "Română",
  it: "Italiano",
  de: "Deutsch",
};

export const localeFormats: Record<Locale, string> = { es: "es-ES", en: "en-GB", fr: "fr-FR", ro: "ro-RO", it: "it-IT", de: "de-DE" };
