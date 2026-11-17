import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";

const local = new Map<string, { count: number; until: number }>();
const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";

// Redis compartido en producción; memoria solo en desarrollo/pruebas.
async function consume(keys: readonly (readonly [string, number])[], seconds: number) {
  const production = process.env.NODE_ENV === "production";
  const secret = process.env.RATE_LIMIT_SECRET;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (production && (!secret || secret.length < 32 || !url || !token)) throw new Error("rate_configuration");
  for (const [identity, maximum] of keys) {
    const key = `tdj:login:${createHmac("sha256", secret ?? "development-only-rate-salt").update(identity).digest("hex")}`;
    let count: number;
    if (url && token) {
      const parsed = z.url().safeParse(url);
      if (!parsed.success || !url.startsWith("https://")) throw new Error("rate_configuration");
      const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(["EVAL", script, "1", key, String(seconds)]), cache: "no-store", signal: AbortSignal.timeout(5000) });
      const result = z.object({ result: z.number().int() }).safeParse(await response.json());
      if (!response.ok || !result.success) throw new Error("rate_unavailable");
      count = result.data.result;
    } else {
      const now = Date.now();
      if (local.size > 1000) for (const [entry, value] of local) if (value.until < now) local.delete(entry);
      const current = local.get(key);
      const next = current && current.until > now ? { ...current, count: current.count + 1 } : { count: 1, until: now + seconds * 1000 };
      local.set(key, next);
      count = next.count;
    }
    if (count > maximum) throw new Error("rate_exceeded");
  }
}

export async function enforceLoginRateLimit(email: string) {
  const requestHeaders = await headers();
  const ip = process.env.VERCEL === "1" ? requestHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? "unknown" : "local";
  await consume([[`email:${email.trim().toLowerCase()}`, 6], [`ip:${ip}`, 30]], 900);
}

export async function enforceMediaRateLimit(userId: string) {
  await consume([[`media:${userId}`, 10]], 60);
}
