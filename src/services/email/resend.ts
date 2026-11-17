import "server-only";

import { Resend } from "resend";
import { z } from "zod";

import { transactionalEmailSchema, type TransactionalEmail } from "@/features/notifications/validation/email";

const configSchema = z.object({ key: z.string().startsWith("re_"), from: z.email() });

// Servicio interno real. No se expone un endpoint de envío abierto al público.
export async function sendTransactionalEmail(input: TransactionalEmail) {
  const message = transactionalEmailSchema.parse(input);
  const config = configSchema.safeParse({
    key: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
  });
  if (!config.success) throw new Error("Configura Resend y un remitente verificado antes de enviar correo.");

  const resend = new Resend(config.data.key);
  const { data, error } = await resend.emails.send({ from: config.data.from, ...message });
  if (error || !data) throw new Error("No se ha podido enviar el correo transaccional.");
  return { id: data.id };
}
