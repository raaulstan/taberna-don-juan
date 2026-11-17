import { describe, expect, it } from "vitest";

import es from "../../messages/es.json";
import en from "../../messages/en.json";
import { localizedMetadata } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/structured-data";
import { dictionaries } from "@/i18n/dictionaries";
import { locales } from "@/i18n/config";

describe("SEO e internacionalización", () => {
  it("impide cerrar el script desde un dato estructurado", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("<");
    expect(JSON.parse(serializeJsonLd({ name: "<Taberna>" }))).toEqual({ name: "<Taberna>" });
  });

  it("genera canonical y alternativas para cada idioma", () => {
    const metadata = localizedMetadata({ locale: "en", title: "Title", description: "Description" });
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en");
    expect(metadata.alternates?.languages).toEqual({
      es: "http://localhost:3000/es", en: "http://localhost:3000/en", fr: "http://localhost:3000/fr", ro: "http://localhost:3000/ro", it: "http://localhost:3000/it", de: "http://localhost:3000/de", "x-default": "http://localhost:3000/es",
    });
  });

  it("mantiene las mismas claves de contenido en ambos idiomas", () => {
    function keys(value: object, prefix = ""): string[] {
      return Object.entries(value).flatMap(([key, child]) => typeof child === "object" && child !== null ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`]);
    }
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it("incluye traducciones completas de la interfaz y metadata en los seis idiomas", async () => {
    function keys(value: object, prefix = ""): string[] {
      return Object.entries(value).flatMap(([key, child]) => typeof child === "object" && child !== null ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`]);
    }
    for (const locale of locales) {
      const dictionary = await dictionaries[locale]();
      expect(keys(dictionary).sort()).toEqual(keys(es).sort());
      expect(dictionary.Metadata.description.length).toBeGreaterThan(40);
      if (locale !== "en") expect(dictionary.Navigation.languages).not.toBe(en.Navigation.languages);
      const metadata = localizedMetadata({ locale, path: "/bebidas", title: dictionary.Menu.drinksTitle, description: dictionary.Menu.drinksDescription });
      expect(metadata.alternates?.canonical).toBe(`http://localhost:3000/${locale}/bebidas`);
    }
  });

  it("conserva la ruta de carta en canonical y alternativas de idioma", () => {
    const metadata = localizedMetadata({ locale: "en", path: "/carta", title: "Menu", description: "Description" });
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en/carta");
    expect(metadata.alternates?.languages?.es).toBe("http://localhost:3000/es/carta");
  });
});
