"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@/features/auth/actions/session";
import { passwordSchema, type PasswordInput } from "@/features/auth/validation/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminFeedback, useReadyForMutation } from "./runtime";

export function PasswordForm() {
  const ready = useReadyForMutation();
  const { notify } = useAdminFeedback();
  const form = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema), defaultValues: { current: "", password: "", confirm: "" } });
  return <form onSubmit={form.handleSubmit(async (values) => { try { const result = await changePassword(values); notify(result); if (result.ok) form.reset(); } catch { notify({ ok: false, message: "No se ha podido cambiar la contraseña." }); } })} className="max-w-xl rounded-sm border border-border bg-card p-6"><fieldset disabled={!ready || form.formState.isSubmitting} className="space-y-5">
    {([{ key: "current", label: "Contraseña actual", autoComplete: "current-password" }, { key: "password", label: "Nueva contraseña", autoComplete: "new-password" }, { key: "confirm", label: "Repite la nueva contraseña", autoComplete: "new-password" }] as const).map((field) => <div key={field.key}><label htmlFor={`account-${field.key}`} className="mb-2 block text-sm font-semibold">{field.label}</label><Input id={`account-${field.key}`} type="password" autoComplete={field.autoComplete} aria-invalid={Boolean(form.formState.errors[field.key])} aria-describedby={form.formState.errors[field.key] ? `error-${field.key}` : undefined} {...form.register(field.key)} />{form.formState.errors[field.key] && <p role="alert" id={`error-${field.key}`} className="mt-2 text-xs text-destructive">{form.formState.errors[field.key]?.message}</p>}</div>)}
    <p className="text-xs leading-relaxed text-muted-foreground">Mínimo 12 caracteres. Se verifica tu contraseña actual y se actualiza exclusivamente tu cuenta en Auth; no se guarda en las tablas de gestión.</p><Button type="submit">{form.formState.isSubmitting ? "Actualizando…" : "Cambiar contraseña"}</Button>
  </fieldset></form>;
}
