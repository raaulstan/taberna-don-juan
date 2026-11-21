import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isLocale } from "./config";
import { dictionaries } from "./dictionaries";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;
  return { locale, messages: await dictionaries[locale]() };
});
