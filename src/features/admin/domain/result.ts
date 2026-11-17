export type ActionResult = { ok: boolean; message: string; id?: string; path?: string };

export function actionFailure(code?: string, message?: string): ActionResult {
  if (code === "40001" || code === "23505") return { ok: false, message: "El registro ha cambiado o ya existe. Recarga antes de volver a guardar." };
  if (code === "23503" || code === "23001") return { ok: false, message: "No se puede eliminar: hay otros registros que lo utilizan." };
  if (code === "42501") return { ok: false, message: "No tienes permisos para realizar esta operación." };
  if (code === "23514" || code === "22008" || code === "22P02") return { ok: false, message: "Los datos no cumplen las restricciones. Revisa campos, fechas y categoría." };
  if (message === "last_owner") return { ok: false, message: "Debe quedar al menos un propietario activo." };
  if (message === "auth_user_missing") return { ok: false, message: "Primero invita o crea esta cuenta en Supabase Auth." };
  if (message === "write_rate_limit") return { ok: false, message: "Has alcanzado el límite de cambios por minuto. Espera antes de continuar." };
  return { ok: false, message: "No se ha podido completar la operación. Revisa la conexión y la configuración de las migraciones." };
}
