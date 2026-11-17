"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/config/env";
import type { Database } from "@/types/database";

export function createBrowserSupabaseClient() {
  // El panel autentica mediante Server Actions y cookies HttpOnly. Este cliente
  // no lee esa sesión: úsalo solo para operaciones públicas permitidas por RLS.
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase no está configurado.");
  return createBrowserClient<Database>(config.url, config.publishableKey);
}
