import "server-only";

import type { MenuKind, MenuRepository } from "../domain/catalog";
import { localMenuRepository } from "@/services/menu/local-menu-repository";
import { supabaseMenuRepository } from "@/services/menu/supabase-menu-repository";
import { managedPublicData } from "@/services/public/content";

// Único punto de composición del proveedor. Un futuro adaptador Supabase debe
// implementar MenuRepository y validar el mismo contrato sin cambiar la UI.
export async function getCatalog(kind: MenuKind, repository?: MenuRepository) {
  return (repository ?? (managedPublicData() ? supabaseMenuRepository : localMenuRepository)).getCatalog(kind);
}
