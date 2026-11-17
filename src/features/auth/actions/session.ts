"use server";

import { getSupabaseConfig } from "@/config/env";
import { isStaffRole } from "@/features/auth/domain/roles";
import { loginSchema, passwordSchema } from "@/features/auth/validation/login";
import { requireStaff } from "@/features/auth/data/staff";
import type { ActionResult } from "@/features/admin/domain/result";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceLoginRateLimit } from "@/services/security/login-rate-limit";
import { logOperationalFailure } from "@/services/operational-log";

export async function login(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa el correo y la contraseña." };
  if (!getSupabaseConfig()) return { ok: false, message: "Supabase todavía no está configurado." };
  try {
    await enforceLoginRateLimit(parsed.data.email);
    const client = await createServerSupabaseClient();
    const { error } = await client.auth.signInWithPassword(parsed.data);
    if (error) return { ok: false, message: error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 500 ? "No se ha podido contactar con el servicio de autenticación. Inténtalo de nuevo." : "Credenciales no válidas o acceso no autorizado." };
    const { data: { user }, error: verifyError } = await client.auth.getUser();
    if (verifyError || !user) {
      await client.auth.signOut({ scope: "local" });
      return { ok: false, message: "No se ha podido verificar la sesión." };
    }
    const { data: staff, error: permissionError } = await client.from("staff_members").select("role, active").eq("user_id", user.id).maybeSingle();
    if (permissionError || !staff?.active || !isStaffRole(staff.role)) {
      await client.auth.signOut({ scope: "local" });
      return { ok: false, message: "Credenciales no válidas o acceso no autorizado." };
    }
    return { ok: true, message: "Sesión verificada." };
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown";
    if (code === "rate_exceeded") return { ok: false, message: "Demasiados intentos. Espera 15 minutos antes de volver a intentarlo." };
    if (code.startsWith("rate_")) return { ok: false, message: "El acceso requiere configurar o recuperar el servicio de límites de solicitudes." };
    logOperationalFailure("login_unavailable");
    return { ok: false, message: "No se ha podido iniciar sesión. Inténtalo de nuevo más tarde." };
  }
}

export async function logout(): Promise<ActionResult> {
  try {
    const client = await createServerSupabaseClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) { logOperationalFailure("logout_unavailable"); return { ok: false, message: "No se ha podido cerrar la sesión. Comprueba tu conexión." }; }
    return { ok: true, message: "Sesión cerrada." };
  } catch { logOperationalFailure("logout_unavailable"); return { ok: false, message: "No se ha podido cerrar la sesión." }; }
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa las contraseñas y utiliza al menos 12 caracteres." };
  try {
    const client = await createServerSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user?.email) return { ok: false, message: "No se ha podido verificar la cuenta." };
    await enforceLoginRateLimit(user.email);
    const { error: verifyError } = await client.auth.signInWithPassword({ email: user.email, password: parsed.data.current });
    if (verifyError) return { ok: false, message: "No se ha podido verificar la contraseña actual." };
    const { error: updateError } = await client.auth.updateUser({ password: parsed.data.password });
    return updateError ? { ok: false, message: "No se ha podido actualizar la contraseña. Comprueba la política de Auth y vuelve a intentarlo." } : { ok: true, message: "Contraseña actualizada en Supabase Auth." };
  } catch { return { ok: false, message: "No se ha podido cambiar la contraseña. Comprueba la conexión y los límites de acceso." }; }
}
