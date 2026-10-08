"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function completeOnboardingAction(role: "teacher" | "institution_admin", market: "eg" | "sa") {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (userErr || !user) {
      return { error: "Unnauthorized" };
    }

    const adminDb = createAdminClient();
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";

    // Upsert user record with chosen role and preferred theme
    const { error: dbErr } = await adminDb.from("users").upsert({
      id: user.id,
      email: user.email || "",
      full_name: fullName,
      role:
        role === "institution_admin" ? "institution_admin" : "teacher",
      preferred_theme: "system",
    }, { onConflict: "id" });

    if (dbErr) {
      console.error("upsert profile error:", dbErr);
    }

    // Update auth user metadata as well
    await supabase.auth.updateUser({
      data: {
        role,
        market,
      },
    });

    const target = role === "institution_admin" ? "/dashboard/institution" : "/dashboard/teacher?tour=1";
    return { success: true, redirectTo: target };
  } catch (err: any) {
    console.error("completeOnboardingAction error:", err);
    return { error: err?.message || "Failed to complete onboarding" };
  }
}
