import { execFileSync } from "node:child_process";

if (process.env.VERCEL_ENV === "preview" && !process.env.NEXT_PUBLIC_SITE_URL && process.env.VERCEL_URL) process.env.NEXT_PUBLIC_SITE_URL = `https://${process.env.VERCEL_URL}`;
if (process.env.VERCEL_ENV === "production") {
  await import("./check-production.mjs");
  if (process.exitCode) process.exit(process.exitCode);
}
execFileSync(process.execPath, ["scripts/generate-icons.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit" });
