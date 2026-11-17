import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/config/env", () => ({ getSupabaseConfig: mocks.config }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  }),
}));

import { requireStaff } from "@/features/auth/data/staff";

beforeEach(() => {
  mocks.config.mockReturnValue({ url: "https://example.supabase.co", publishableKey: "test-only" });
  mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  mocks.maybeSingle.mockResolvedValue({ data: { role: "employee", active: true }, error: null });
  mocks.from.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }) });
});

describe("autorización del equipo", () => {
  it("redirige al diagnóstico si falta Supabase", async () => {
    mocks.config.mockReturnValue(null);
    await expect(requireStaff()).rejects.toThrow("motivo=configuracion");
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it("no consulta membresías sin una identidad verificada", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error("invalid token") });
    await expect(requireStaff()).rejects.toThrow("motivo=sesion");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each([null, { role: "admin" }])("deniega una membresía inexistente o desconocida", async (data) => {
    mocks.maybeSingle.mockResolvedValue({ data, error: null });
    await expect(requireStaff()).rejects.toThrow("motivo=permisos");
  });

  it("falla cerrado si PostgreSQL no puede verificar permisos", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { role: "owner" }, error: new Error("database offline") });
    await expect(requireStaff()).rejects.toThrow("verificar el acceso");
  });

  it("no permite operaciones de propietario a empleados", async () => {
    await expect(requireStaff(["owner"])).rejects.toThrow("motivo=permisos");
  });

  it("devuelve únicamente el contexto autorizado", async () => {
    await expect(requireStaff()).resolves.toEqual({ userId: "user-1", role: "employee" });
    mocks.maybeSingle.mockResolvedValue({ data: { role: "owner", active: true }, error: null });
    await expect(requireStaff(["owner"])).resolves.toEqual({ userId: "user-1", role: "owner" });
  });

  it("deniega sesiones válidas cuyo acceso ha sido desactivado", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { role: "owner", active: false }, error: null });
    await expect(requireStaff()).rejects.toThrow("motivo=permisos");
  });
});
