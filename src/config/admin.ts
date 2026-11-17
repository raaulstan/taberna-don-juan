import { parseSiteUrl } from "./site";

export function getAdminOrigin() {
  const value = process.env.NEXT_PUBLIC_ADMIN_URL;
  return value ? parseSiteUrl(value, false) : null;
}

export function getAdminLoginUrl() {
  const origin = getAdminOrigin();
  return origin ? `${origin}/acceso` : "/acceso";
}
