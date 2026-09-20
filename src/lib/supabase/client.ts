/**
 * Supabase client for use in Client Components ("use client").
 * Uses the public anon key — safe to expose, RLS policies enforce access.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

const DEFAULT_SUPABASE_URL = "https://sadnddnbsihvhfthelcb.supabase.co";
const DEFAULT_SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZG5kZG5ic2lodmhmdGhlbGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDMzNjQsImV4cCI6MjEwMzY3OTM2NH0.zZwzCLPtHiFZbcOmne_qQUFwxjP1wE6R2a7SyAua7_c";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON
  );
}

