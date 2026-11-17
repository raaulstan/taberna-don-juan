"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/features/auth/actions/session";
import { loginSchema, type LoginInput } from "@/features/auth/validation/login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHydrated, useOnline } from "./runtime";

export function LoginForm() {
  const online = useOnline();
  const hydrated = useHydrated();
  const [error, setError] = useState("");
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  return <form onSubmit={form.handleSubmit(async (values) => {
    setError("");
    try { const result = await login(values); if (result.ok) window.location.replace("/admin"); else setError(result.message); }
    catch { setError("No se ha podido conectar. Inténtalo de nuevo."); }
  })} className="mt-8 space-y-5">
    <fieldset disabled={!hydrated || !online || form.formState.isSubmitting} className="space-y-5">
      <div><label htmlFor="login-email" className="mb-2 block text-sm font-semibold">Correo del equipo</label><Input id="login-email" type="email" autoComplete="username" aria-invalid={Boolean(form.formState.errors.email)} aria-describedby={form.formState.errors.email ? "login-email-error" : undefined} {...form.register("email")} />{form.formState.errors.email && <p id="login-email-error" role="alert" className="mt-2 text-sm text-destructive">{form.formState.errors.email.message}</p>}</div>
      <div><label htmlFor="login-password" className="mb-2 block text-sm font-semibold">Contraseña</label><Input id="login-password" type="password" autoComplete="current-password" aria-invalid={Boolean(form.formState.errors.password)} aria-describedby={form.formState.errors.password ? "login-password-error" : undefined} {...form.register("password")} />{form.formState.errors.password && <p id="login-password-error" role="alert" className="mt-2 text-sm text-destructive">{form.formState.errors.password.message}</p>}</div>
      <Button type="submit" className="w-full">{form.formState.isSubmitting ? "Verificando…" : "Entrar al panel"}</Button>
    </fieldset>
    {!online && <p role="alert" className="text-sm text-destructive">Necesitas conexión para iniciar sesión.</p>}
    {error && <p role="alert" className="rounded-sm border border-destructive p-4 text-sm">{error}</p>}
    <p className="text-xs leading-relaxed text-muted-foreground">Solo cuentas de Supabase Auth con un rol activo del restaurante. Para recuperar el acceso, contacta con el propietario.</p>
  </form>;
}
