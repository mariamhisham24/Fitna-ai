import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Route guard implementing spec section 2.1, rule 1:
 * "Middleware/Guard on routing level: every page/route must verify the
 * current user's role before rendering anything. If the role doesn't
 * match → immediate redirect to a 403 page or the user's correct dashboard."
 *
 * This runs on every request, BEFORE any page component renders — so a
 * teacher manually typing /dashboard/institution in the URL bar is
 * bounced server-side, not just hidden by a client-side `if`.
 *
 * NOTE: this is a defense layer, not the only one. The real guarantee
 * is the Postgres RLS policies in supabase/schema.sql — even if this
 * middleware had a bug, the database itself would still refuse to
 * return another institution's rows.
 */

const TEACHER_ONLY_PREFIXES = ["/dashboard/teacher", "/session", "/history", "/growth"];
const ADMIN_ONLY_PREFIXES = ["/dashboard/institution"];
const PUBLIC_PREFIXES = ["/login", "/reset-password", "/auth", "/report/share", "/_next", "/api", "/manus-storage", "/demo"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDemo = request.cookies.get("fitna_demo")?.value === "true";

  let response = NextResponse.next({ request });

  // 1. If in Demo Mode, allow all teacher and general routes, only block institution admin
  if (isDemo) {
    const wantsAdminArea = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    if (wantsAdminArea) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // 2. Fast path for public routes — do NOT block on remote Supabase Auth network call
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === "/";
  if (isPublic) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const authRes = await Promise.race([
      supabase.auth.getUser(),
      new Promise<any>((resolve) => setTimeout(() => resolve({ data: { user: null } }), 2000)),
    ]);
    user = authRes.data?.user ?? null;
  } catch {
    // Supabase auth network timeout fallback
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Look up the caller's role. RLS on `users` allows a row to read
  // itself, so this respects the same isolation as everywhere else.
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  const wantsTeacherArea = TEACHER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const wantsAdminArea = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  if (wantsTeacherArea && role !== "teacher") {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  if (wantsAdminArea && role !== "institution_admin" && role !== "super_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|models/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|gltf|bin)$).*)",
  ],
};
