import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ config: vi.fn(), limit: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), user: vi.fn(), membership: vi.fn() }));
vi.mock("@/config/env", () => ({ getSupabaseConfig: mock.config }));
vi.mock("@/services/security/login-rate-limit", () => ({ enforceLoginRateLimit: mock.limit }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: async () => ({ auth: { signInWithPassword: mock.signIn, signOut: mock.signOut, getUser: mock.user }, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mock.membership }) }) }) }) }));
import { login, logout } from "@/features/auth/actions/session";

beforeEach(() => {
  mock.config.mockReturnValue({ url: "https://example.test", publishableKey: "test-only" });
  mock.limit.mockResolvedValue(undefined);
  mock.signIn.mockResolvedValue({ error: null });
  mock.signOut.mockResolvedValue({ error: null });
  mock.user.mockResolvedValue({ data: { user: { id: "test-user" } }, error: null });
  mock.membership.mockResolvedValue({ data: { role: "owner", active: true }, error: null });
});

describe("login real con proveedor simulado únicamente en pruebas", () => {
  it("no autentica entradas inválidas o un entorno sin Supabase", async () => {
    expect((await login({ email: "bad", password: "" })).ok).toBe(false);
    mock.config.mockReturnValue(null);
    expect((await login({ email: "owner@example.test", password: "test-only" })).ok).toBe(false);
    expect(mock.signIn).not.toHaveBeenCalled();
  });
  it("aplica límites antes de enviar credenciales a Auth", async () => {
    mock.limit.mockRejectedValue(new Error("rate_exceeded"));
    expect((await login({ email: "owner@example.test", password: "test-only" })).message).toContain("15 minutos");
    expect(mock.signIn).not.toHaveBeenCalled();
  });
  it("no distingue públicamente una contraseña incorrecta de una cuenta sin permiso", async () => {
    mock.signIn.mockResolvedValueOnce({ error: { message: "invalid password detail" } });
    const badPassword = await login({ email: "owner@example.test", password: "test-only" });
    mock.membership.mockResolvedValueOnce({ data: null, error: null });
    const noRole = await login({ email: "owner@example.test", password: "test-only" });
    expect(noRole.message).toBe(badPassword.message);
    expect(mock.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("rechaza empleados desactivados aunque Auth acepte la contraseña", async () => {
    mock.membership.mockResolvedValue({ data: { role: "owner", active: false }, error: null });
    expect((await login({ email: "owner@example.test", password: "test-only" })).ok).toBe(false);
    expect(mock.signOut).toHaveBeenCalled();
  });
  it("confirma acceso solo después de verificar identidad y membresía", async () => {
    expect((await login({ email: "owner@example.test", password: "test-only" })).ok).toBe(true);
    expect(mock.user).toHaveBeenCalled();
    expect(mock.membership).toHaveBeenCalled();
  });
  it("descarta la sesión si Auth no verifica la identidad después de aceptar credenciales", async () => {
    mock.user.mockResolvedValue({ data: { user: null }, error: { message: "expired session" } });
    expect((await login({ email: "owner@example.test", password: "test-only" })).ok).toBe(false);
    expect(mock.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("cierra solo la sesión local y no inventa un cierre exitoso ante fallo del proveedor", async () => {
    expect((await logout()).ok).toBe(true);
    expect(mock.signOut).toHaveBeenCalledWith({ scope: "local" });
    mock.signOut.mockResolvedValue({ error: { message: "provider offline" } });
    expect((await logout()).ok).toBe(false);
  });
});
