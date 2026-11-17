import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabaseConfig, supabaseConfigSchema } from "@/config/env";
import { parseSiteUrl } from "@/config/site";

afterEach(() => vi.unstubAllEnvs());

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

describe("configuración de Supabase", () => {
  it("permite arrancar sin integración y detecta configuración parcial", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(getSupabaseConfig()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    expect(() => getSupabaseConfig()).toThrow("incompleta");
  });

  it.each(["sb_secret_not-a-real-key", "service_role", "eyJhbGciOiJIUzI1NiJ9"])(
    "impide utilizar claves no públicas: %s", (key) => {
      expect(supabaseConfigSchema.safeParse({ url: "https://example.supabase.co", publishableKey: key }).success).toBe(false);
    },
  );
});
