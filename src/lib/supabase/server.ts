/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads/writes the auth cookie so `auth.uid()` is available
 * to Postgres RLS policies on every query made with this client.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const DEFAULT_SUPABASE_URL = "https://sadnddnbsihvhfthelcb.supabase.co";
const DEFAULT_SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZG5kZG5ic2lodmhmdGhlbGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDMzNjQsImV4cCI6MjEwMzY3OTM2NH0.zZwzCLPtHiFZbcOmne_qQUFwxjP1wE6R2a7SyAua7_c";
const DEFAULT_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZG5kZG5ic2lodmhmdGhlbGNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwMzM2NCwiZXhwIjoyMTAzNjc5MzY0fQ.zSTS9RgOYbb_c2rb-y8MdjCGcKmkOE6uNqRZ7cE609U";

async function createRealServerClient(cookieStore: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON;

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {
                cookieStore.set({ name, value, ...options });
              }
            });
          } catch {
            // Server Component context
          }
        },
      },
    }
  );
}

export async function createClient(_options?: { bypassDemo?: boolean }) {
  const cookieStore = await cookies();
  return createRealServerClient(cookieStore);
}

/**
 * Admin client using the service_role key. Bypasses RLS entirely.
 * ONLY import this in server-only code (route handlers, server actions)
 * that has already verified the caller's identity/role itself —
 * e.g. sending an invite email, or a super_admin-only maintenance task.
 * Never import this in a Client Component or anything bundled for the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SERVICE_ROLE;

  return createSupabaseClient<Database>(
    url,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

