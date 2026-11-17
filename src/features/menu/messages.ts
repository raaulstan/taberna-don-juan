import "server-only";

import type { Locale } from "@/i18n/config";
import type messages from "../../../messages/es.json";
import { managedPublicData } from "@/services/public/content";
import { dictionaries } from "@/i18n/dictionaries";

export type MenuLabels = typeof messages.Menu.ui;

export async function getMenuMessages(locale: Locale) {
  const menu = (await dictionaries[locale]()).Menu;
  if (!managedPublicData()) return menu;
  return { ...menu, sourceNote: menu.managedSourceNote, missingNote: menu.managedMissingNote, ui: { ...menu.ui, sourceLanguage: menu.managedSourceLanguage, allergenSource: menu.managedAllergenSource } };
}
