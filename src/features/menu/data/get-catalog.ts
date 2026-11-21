import "server-only";

import type { LocalizedText, MenuCatalog, MenuKind, MenuRepository } from "../domain/catalog";
import type { Locale } from "@/i18n/config";
import { localMenuRepository } from "@/services/menu/local-menu-repository";

// La carta se obtiene exclusivamente de los archivos locales del proyecto.
export async function getCatalog(kind: MenuKind, repository?: MenuRepository) {
  return (repository ?? localMenuRepository).getCatalog(kind);
}

// El navegador recibe solo el idioma solicitado y el original para buscar por
// cualquiera de los dos; los otros diccionarios permanecen en el servidor.
export async function getLocalizedCatalog(kind: MenuKind, locale: Locale): Promise<MenuCatalog> {
  const catalog = await getCatalog(kind);
  const text = (value: LocalizedText): LocalizedText => ({ es: value.es, ...(locale !== "es" && value[locale] ? { [locale]: value[locale] } : {}) });
  return {
    ...catalog,
    categories: catalog.categories.map((category) => ({ ...category, label: text(category.label) })),
    products: catalog.products.map((product) => ({
      ...product,
      name: text(product.name),
      description: product.description ? text(product.description) : null,
      image: product.image ? { ...product.image, alt: text(product.image.alt) } : null,
      ingredients: product.ingredients?.map(text) ?? null,
      additionalInformation: product.additionalInformation ? text(product.additionalInformation) : null,
    })),
  };
}
