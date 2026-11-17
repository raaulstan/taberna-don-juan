import "server-only";
import { randomUUID } from "node:crypto";

export function logOperationalFailure(event: "admin_write_failed" | "login_unavailable" | "logout_unavailable" | "password_update_failed", code?: string) {
  console.error(JSON.stringify({ event, code: code && /^[A-Za-z0-9_]{1,24}$/.test(code) ? code : "unknown", reference: randomUUID(), time: new Date().toISOString() }));
}
