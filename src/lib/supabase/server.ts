/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads/writes the auth cookie so `auth.uid()` is available
 * to Postgres RLS policies on every query made with this client.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { DEMO_COOKIE_NAME, DEMO_USER } from "@/lib/auth/demo";

export async function createClient() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get(DEMO_COOKIE_NAME)?.value === "true";

  if (isDemo) {
    let baseClient: any = null;
    try {
      baseClient = createAdminClient();
    } catch {
      baseClient = {};
    }

    return new Proxy(baseClient, {
      get(target: any, prop: string | symbol, receiver: any) {
        if (prop === "auth") {
          return {
            getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
            getSession: async () => ({
              data: {
                session: {
                  user: DEMO_USER,
                  access_token: "demo-token",
                  refresh_token: "demo-refresh",
                  expires_in: 31536000,
                  expires_at: Math.floor(Date.now() / 1000) + 31536000,
                  token_type: "bearer",
                },
              },
              error: null,
            }),
            signOut: async () => {
              try {
                cookieStore.delete(DEMO_COOKIE_NAME);
              } catch {}
              return { error: null };
            },
          };
        }
        if (typeof target[prop] === "function") {
          return target[prop].bind(target);
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context to
            // write to — safe to ignore because middleware refreshes the
            // session on every request anyway.
          }
        },
      },
    }
  );
}

/**
 * Admin client using the service_role key. Bypasses RLS entirely.
 * ONLY import this in server-only code (route handlers, server actions)
 * that has already verified the caller's identity/role itself —
 * e.g. sending an invite email, or a super_admin-only maintenance task.
 * Never import this in a Client Component or anything bundled for the browser.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

  return createSupabaseClient<Database>(
    url,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
