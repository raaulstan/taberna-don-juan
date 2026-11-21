import "server-only";

import type { Locale } from "@/i18n/config";
import type messages from "../../../messages/es.json";
import { dictionaries } from "@/i18n/dictionaries";

export type MenuLabels = typeof messages.Menu.ui;

export async function getMenuMessages(locale: Locale) {
  return (await dictionaries[locale]()).Menu;
}
