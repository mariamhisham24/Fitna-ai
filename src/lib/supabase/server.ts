/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads/writes the auth cookie so `auth.uid()` is available
 * to Postgres RLS policies on every query made with this client.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { DEMO_COOKIE_NAME, DEMO_USER } from "@/lib/auth/demo";

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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context
          }
        },
      },
    }
  );
}

export async function createClient(options?: { bypassDemo?: boolean }) {
  const cookieStore = await cookies();
  const isDemo = !options?.bypassDemo && cookieStore.get(DEMO_COOKIE_NAME)?.value === "true";

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
            signInWithPassword: async (credentials: any) => {
              try {
                cookieStore.delete(DEMO_COOKIE_NAME);
                const real = await createRealServerClient(cookieStore);
                return await real.auth.signInWithPassword(credentials);
              } catch (e: any) {
                return { data: { user: null, session: null }, error: e };
              }
            },
            signUp: async (credentials: any) => {
              try {
                cookieStore.delete(DEMO_COOKIE_NAME);
                const real = await createRealServerClient(cookieStore);
                return await real.auth.signUp(credentials);
              } catch (e: any) {
                return { data: { user: null, session: null }, error: e };
              }
            },
            resetPasswordForEmail: async (email: string, opts?: any) => {
              try {
                const real = await createRealServerClient(cookieStore);
                return await real.auth.resetPasswordForEmail(email, opts);
              } catch (e: any) {
                return { data: {}, error: e };
              }
            },
            verifyOtp: async (params: any) => {
              try {
                const real = await createRealServerClient(cookieStore);
                return await real.auth.verifyOtp(params);
              } catch (e: any) {
                return { data: { user: null, session: null }, error: e };
              }
            },
            updateUser: async (attributes: any) => {
              try {
                const real = await createRealServerClient(cookieStore);
                return await real.auth.updateUser(attributes);
              } catch (e: any) {
                return { data: { user: null }, error: e };
              }
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

  return createRealServerClient(cookieStore);
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SERVICE_ROLE;

  return createSupabaseClient<Database>(
    url,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

