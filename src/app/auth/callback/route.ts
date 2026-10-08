import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard/teacher";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;

      try {
        const adminDb = createAdminClient();
        const { data: profile } = await adminDb
          .from("users")
          .select("role, preferred_theme")
          .eq("id", user.id)
          .maybeSingle();

        // Check if user has explicitly completed onboarding
        const isOnboarded = Boolean(user.user_metadata?.onboarded);

        if (isOnboarded && profile?.role) {
          const targetDashboard = profile.role === "institution_admin" ? "/dashboard/institution" : "/dashboard/teacher";
          const response = NextResponse.redirect(`${origin}${targetDashboard}`);
          response.cookies.delete("fitna_demo");
          return response;
        }

        // New or non-onboarded user! Send to onboarding to select role & market
        const response = NextResponse.redirect(`${origin}/onboarding`);
        response.cookies.delete("fitna_demo");
        return response;
      } catch (profileErr) {
        console.error("Profile check error during OAuth callback:", profileErr);
        const response = NextResponse.redirect(`${origin}/onboarding`);
        response.cookies.delete("fitna_demo");
        return response;
      }
    }

    if (error) {
      console.error("exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Failed to sign in with Google")}`);
}
