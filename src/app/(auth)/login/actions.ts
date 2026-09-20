"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export type ActionState = { error: string | null };

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Real sign-in against Supabase Auth. No mock/localStorage flag. */
export async function signInAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!validateEmail(email)) return { error: "البريد الإلكتروني غير صالح" };
  if (password.length < 6) return { error: "كلمة المرور لازم تكون 6 أحرف على الأقل" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "البريد الإلكتروني أو كلمة المرور غلط" };
    }
    return { error: error.message };
  }

  // Route to the right dashboard based on the role stored in public.users.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("role, preferred_theme")
    .eq("id", user!.id)
    .single();

  // Apply the account's saved theme preference on this device
  // immediately (spec §6.2: preference follows the account, not just
  // the browser). Without this, someone who set dark mode on another
  // device wouldn't see it here until they visited Settings again.
  if (profile?.preferred_theme) {
    const cookieStore = await cookies();
    cookieStore.set("theme", profile.preferred_theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  redirect(profile?.role === "institution_admin" ? "/dashboard/institution" : "/dashboard/teacher");
}

/** Real sign-up against Supabase Auth. Role is stored in user metadata
 * and picked up by the `handle_new_auth_user` trigger (see schema.sql)
 * to populate public.users.role server-side. */
export async function signUpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const role = String(formData.get("role") || "teacher");

  if (!validateEmail(email)) return { error: "البريد الإلكتروني غير صالح" };
  if (password.length < 6) return { error: "كلمة المرور لازم تكون 6 أحرف على الأقل" };
  if (!fullName) return { error: "من فضلك اكتب اسمك" };
  if (role !== "teacher" && role !== "institution_admin") {
    return { error: "من فضلك اختر كيف هتستخدم فِطنة" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "الإيميل ده متسجل بالفعل، جرب تسجيل الدخول" };
    }
    return { error: error.message };
  }

  redirect(role === "institution_admin" ? "/dashboard/institution" : "/dashboard/teacher");
}

/** Sends a real password-reset email via Supabase Auth (SMTP configured
 * in the Supabase dashboard, or swap for a Resend-backed custom flow). */
export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  if (!validateEmail(email)) return { error: "البريد الإلكتروني غير صالح" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) return { error: error.message };
  return { error: null };
}

import { DEMO_COOKIE_NAME } from "@/lib/auth/demo";

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE_NAME);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
