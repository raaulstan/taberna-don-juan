import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
import { enforceLoginRateLimit } from "@/services/security/login-rate-limit";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("límites de acceso", () => {
  it("bloquea producción si falta almacenamiento compartido o sal privada", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_SECRET", "");
    await expect(enforceLoginRateLimit("test@example.test")).rejects.toThrow("rate_configuration");
  });
  it("limita intentos en desarrollo sin almacenar el correo en claro", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    for (let attempt = 0; attempt < 6; attempt++) await enforceLoginRateLimit("limited@example.test");
    await expect(enforceLoginRateLimit("limited@example.test")).rejects.toThrow("rate_exceeded");
  });
  it("utiliza contadores atómicos y claves HMAC en Redis, y falla cerrado", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_SECRET", "x".repeat(32));
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-only-not-a-real-token");
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ result: 1 })));
    vi.stubGlobal("fetch", fetcher);
    await enforceLoginRateLimit("not-public@example.test");
    const body = fetcher.mock.calls[0]?.[1]?.body as string;
    expect(body).toContain("EVAL");
    expect(body).not.toContain("not-public@example.test");
    fetcher.mockResolvedValue(new Response(JSON.stringify({ error: "unavailable" }), { status: 503 }));
    await expect(enforceLoginRateLimit("test@example.test")).rejects.toThrow("rate_unavailable");
  });
});
