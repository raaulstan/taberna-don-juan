import { describe, expect, it } from "vitest";
import { parseSiteUrl } from "@/config/site";

describe("origen canónico", () => {
  it("permite desarrollo sin entorno y exige un origen en producción", () => {
    expect(parseSiteUrl(undefined, false)).toBe("http://localhost:3000");
    expect(() => parseSiteUrl(undefined, true)).toThrow("NEXT_PUBLIC_SITE_URL");
  });

  it.each(["javascript:alert(1)", "https://example.com/ruta", "https://user:pass@example.com", "https://example.com?x=1"])(
    "rechaza un origen inválido: %s", (url) => expect(() => parseSiteUrl(url, true)).toThrow(),
  );

  it("normaliza la barra final", () => {
    expect(parseSiteUrl("https://example.com/", true)).toBe("https://example.com");
  });
});
