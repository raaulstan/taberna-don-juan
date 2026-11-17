import { z } from "zod";

export const transactionalEmailSchema = z.object({
  to: z.email(),
  subject: z.string().trim().min(1).max(200).refine((value) => !/[\r\n]/.test(value), {
    message: "El asunto no puede contener saltos de línea.",
  }),
  text: z.string().trim().min(1).max(50_000),
});

export type TransactionalEmail = z.infer<typeof transactionalEmailSchema>;
