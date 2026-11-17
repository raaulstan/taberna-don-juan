import type { Metadata } from "next";
import { listStaff } from "@/features/admin/data/records";
import { StaffForm } from "@/features/admin/components/forms";
import { roleLabels } from "@/features/auth/domain/roles";

export const metadata: Metadata = { title: "Equipo y accesos" };
export default async function EmployeesPage() {
  const staff = await listStaff();
  return <><h1 className="font-serif text-4xl">Equipo y accesos</h1><p className="my-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">Solo propietarios. Las cuentas se invitan o crean en Supabase Auth; aquí se asigna su acceso. No se guardan contraseñas. Los cambios se auditan y no se puede desactivar al último propietario activo.</p>
    <section aria-labelledby="add-staff"><h2 id="add-staff" className="mb-4 font-serif text-2xl">Asignar acceso a una cuenta existente</h2><StaffForm initial={{ email: "", display_name: "", role: "waiter", active: true }} /></section>
    <h2 className="mt-10 mb-5 font-serif text-2xl">Miembros del equipo · {staff.length}</h2><ul className="space-y-6">{staff.map((person) => <li key={person.user_id}><p className="mb-3 text-sm font-semibold">{person.display_name || person.email} · {roleLabels[person.role]} · {person.active ? "Activo" : "Desactivado"}</p>{person.role === "employee" && <p className="mb-3 text-xs text-muted-foreground">Rol legado sin gestión. Al guardar se asignará el rol que elijas.</p>}<StaffForm initial={{ email: person.email, display_name: person.display_name, role: person.role === "employee" ? "waiter" : person.role, active: person.active }} /></li>)}</ul>
  </>;
}
