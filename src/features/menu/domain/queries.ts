import { localeFormats, type Locale } from "@/i18n/config";
import type { LocalizedText, MenuCatalog, MenuProduct } from "./catalog";

export function localize(text: LocalizedText | null, locale: Locale) {
  return text ? text[locale] ?? text.es : "";
}

export function textLanguage(text: LocalizedText | null, locale: Locale): Locale {
  return text?.[locale] ? locale : "es";
}

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function filterProducts(catalog: MenuCatalog, query: string, categoryId: string, locale: Locale): MenuProduct[] {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const categoryExists = catalog.categories.some((category) => category.id === categoryId);
  const ids = new Set([categoryId, ...catalog.categories.filter((category) => category.parentId === categoryId).map((category) => category.id)]);
  return catalog.products.filter((product) => {
    if (categoryExists && !ids.has(product.categoryId)) return false;
    const haystack = normalizeSearch(`${localize(product.name, locale)} ${localize(product.description, locale)} ${product.name.es} ${product.description?.es ?? ""}`);
    return tokens.every((token) => haystack.includes(token));
  });
}

export function formatPrice(cents: number, locale: Locale) {
  return new Intl.NumberFormat(localeFormats[locale], { style: "currency", currency: "EUR" }).format(cents / 100);
}
