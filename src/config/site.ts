import { z } from "zod";

const originSchema = z.url().transform((value, context) => {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    context.addIssue({ code: "custom", message: "Debe ser un origen HTTP(S) sin ruta ni credenciales." });
    return z.NEVER;
  }
  return url.origin;
});

export function parseSiteUrl(value: string | undefined, production: boolean): string {
  if (!value && production) {
    throw new Error("Configura NEXT_PUBLIC_SITE_URL con el origen real antes de compilar para producción.");
  }
  return originSchema.parse(value ?? "http://localhost:3000");
}

export const site = {
  name: "Taberna Don Juan",
  url: parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.NODE_ENV === "production"),
} as const;
