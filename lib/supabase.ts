import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "./env";

let client: SupabaseClient | null = null;

/**
 * Service-role Supabase client for server-side use only. It bypasses Row Level
 * Security, so it must never be imported into a client component. All writes
 * (creating pending entries, marking paid, incrementing clicks) go through it.
 */
export function createServiceClient(): SupabaseClient {
  if (client) return client;
  client = createClient(
    serverEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return client;
}
