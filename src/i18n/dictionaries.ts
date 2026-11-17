import "server-only";

import type { Locale } from "./config";
import type messages from "../../messages/es.json";

export const dictionaries = {
  es: () => import("../../messages/es.json").then((module) => module.default),
  en: () => import("../../messages/en.json").then((module) => module.default),
  fr: () => import("../../messages/fr.json").then((module) => module.default),
  ro: () => import("../../messages/ro.json").then((module) => module.default),
  it: () => import("../../messages/it.json").then((module) => module.default),
  de: () => import("../../messages/de.json").then((module) => module.default),
} satisfies Record<Locale, () => Promise<typeof messages>>;
