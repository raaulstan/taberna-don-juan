import { z } from "zod";

export const loginSchema = z.object({ email: z.email("Introduce un correo válido.").trim().max(254), password: z.string().min(1, "Introduce la contraseña.").max(256) }).strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const passwordSchema = z.object({ current: z.string().min(1).max(256), password: z.string().min(12, "Utiliza al menos 12 caracteres.").max(128), confirm: z.string().min(1).max(128) }).strict().refine((value) => value.password === value.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden." }).refine((value) => value.current !== value.password, { path: ["password"], message: "Elige una contraseña diferente de la actual." });
export type PasswordInput = z.infer<typeof passwordSchema>;
