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
      let targetDashboard = next;

      try {
        const adminDb = createAdminClient();
        const { data: profile } = await adminDb
          .from("users")
          .select("role, preferred_theme")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role) {
          targetDashboard = profile.role === "institution_admin" ? "/dashboard/institution" : "/dashboard/teacher";
        } else {
          const metaRole = user.user_metadata?.role || "teacher";
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";

          await adminDb.from("users").insert({
            id: user.id,
            email: user.email || "",
            full_name: fullName,
            role: metaRole,
            preferred_theme: "system",
          }).select().maybeSingle();

          targetDashboard = metaRole === "institution_admin" ? "/dashboard/institution" : "/dashboard/teacher";
        }
      } catch (profileErr) {
        console.error("Profile check/create error during OAuth callback:", profileErr);
      }

      const response = NextResponse.redirect(`${origin}${targetDashboard}`);
      response.cookies.delete("fitna_demo");
      return response;
    }

    if (error) {
      console.error("exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Failed to sign in with Google")}`);
}
