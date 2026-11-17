import type { Metadata } from "next";
import { requireStaff } from "@/features/auth/data/staff";
import { PasswordForm } from "@/features/admin/components/password-form";

export const metadata: Metadata = { title: "Mi cuenta" };
export default async function AccountPage() {
  await requireStaff();
  return <><h1 className="mb-7 font-serif text-4xl">Mi cuenta</h1><PasswordForm /></>;
}
