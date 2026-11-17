import { afterEach, describe, expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

import { transactionalEmailSchema } from "@/features/notifications/validation/email";
import { sendTransactionalEmail } from "@/services/email/resend";

const message = { to: "recipient@example.com", subject: "Información", text: "Contenido de prueba." };
afterEach(() => vi.unstubAllEnvs());

describe("correo transaccional", () => {
  it("valida destinatario y evita inyección de cabeceras", () => {
    expect(transactionalEmailSchema.safeParse({ ...message, to: "invalid" }).success).toBe(false);
    expect(transactionalEmailSchema.safeParse({ ...message, subject: "Asunto\r\nBcc: x@example.com" }).success).toBe(false);
  });

  it("no simula un envío cuando falta configuración", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("RESEND_FROM_EMAIL", "");
    await expect(sendTransactionalEmail(message)).rejects.toThrow("Configura Resend");
    expect(send).not.toHaveBeenCalled();
  });

  it("propaga el fallo del proveedor sin filtrar su respuesta", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_only");
    vi.stubEnv("RESEND_FROM_EMAIL", "sender@example.com");
    send.mockResolvedValue({ data: null, error: { message: "private provider detail" } });
    await expect(sendTransactionalEmail(message)).rejects.toThrow("No se ha podido enviar");
  });

  it("devuelve el identificador de un envío confirmado por el proveedor", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_only");
    vi.stubEnv("RESEND_FROM_EMAIL", "sender@example.com");
    send.mockResolvedValue({ data: { id: "email-1" }, error: null });
    await expect(sendTransactionalEmail(message)).resolves.toEqual({ id: "email-1" });
    expect(send).toHaveBeenCalledWith({ from: "sender@example.com", ...message });
  });
});
