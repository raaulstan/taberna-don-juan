import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getSupabaseConfig } from "@/config/env";
import { hasPermission, isStaffRole, type Permission, type StaffRole } from "@/features/auth/domain/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// React.cache deduplica solo durante el render/request; no es una caché compartida.
// Toda futura operación privada debe llamar a este guard en su propio servidor.
export const requireStaff = cache(async (allowedRoles?: readonly StaffRole[]) => {
  if (!getSupabaseConfig()) redirect("/acceso?motivo=configuracion");
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError && (authError.name === "AuthRetryableFetchError" || (authError.status ?? 0) >= 500)) throw new Error("No se ha podido contactar con el servicio de autenticación.");
  if (authError || !user) redirect("/acceso?motivo=sesion");

  const { data: membership, error } = await supabase
    .from("staff_members")
    .select("role, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("No se ha podido verificar el acceso del equipo.");
  if (!membership || !membership.active || !isStaffRole(membership.role)) redirect("/acceso?motivo=permisos");
  if (allowedRoles && !allowedRoles.includes(membership.role)) redirect("/acceso?motivo=permisos");

  return { userId: user.id, role: membership.role };
});

export async function requirePermission(permission: Permission) {
  const staff = await requireStaff();
  if (!hasPermission(staff.role, permission)) redirect("/admin?aviso=permisos");
  return staff;
}
