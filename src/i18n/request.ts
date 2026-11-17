import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isLocale } from "./config";
import { dictionaries } from "./dictionaries";
import { getPublishedSite } from "@/services/public/content";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;
  const [messages, content] = await Promise.all([dictionaries[locale](), getPublishedSite()]);
  if (!content || (locale !== "es" && locale !== "en")) return { locale, messages };
  const overrides = Object.fromEntries(Object.entries(content.texts).flatMap(([key, value]) => value[locale] ? [[key, value[locale]]] : []));
  return { locale, messages: { ...messages, Home: { ...messages.Home, ...overrides } } };
});
