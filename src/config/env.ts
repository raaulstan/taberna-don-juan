import { z } from "zod";

export const supabaseConfigSchema = z.object({
  url: z.url().refine((value) => { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash && (process.env.NODE_ENV !== "production" || url.protocol === "https:"); }, {
    message: "Supabase requiere una URL HTTP(S).",
  }),
  publishableKey: z.string().regex(/^sb_publishable_[A-Za-z0-9_-]+$/, {
    message: "Usa una publishable key de Supabase, nunca una clave secreta o service_role.",
  }),
});

export function getSupabaseConfig() {
  // Accesos explícitos: Next sustituye estas variables públicas en el bundle cliente.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url && !publishableKey) return null;

  const result = supabaseConfigSchema.safeParse({ url, publishableKey });
  if (!result.success) {
    throw new Error("Configuración de Supabase incompleta o inválida. Revisa .env.example.");
  }
  return result.data;
}
