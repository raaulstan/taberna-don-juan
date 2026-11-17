export const staffRoles = ["owner", "manager", "waiter", "kitchen", "employee"] as const;
export type StaffRole = (typeof staffRoles)[number];

export function isStaffRole(value: unknown): value is StaffRole {
  return staffRoles.some((role) => role === value);
}

export const roleLabels: Record<StaffRole, string> = { owner: "Propietario", manager: "Encargado", waiter: "Camarero", kitchen: "Cocina", employee: "Empleado (legado)" };
export type Permission = "catalog" | "content" | "staff" | "audit";

export function hasPermission(role: StaffRole, permission: Permission) {
  return role === "owner" || (role === "manager" && (permission === "catalog" || permission === "content"));
}
