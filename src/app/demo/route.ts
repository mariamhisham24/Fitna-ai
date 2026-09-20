import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE_NAME } from "@/lib/auth/demo";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_COOKIE_NAME, "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });
    cookieStore.set("theme", "dark", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  } catch {}

  const redirectUrl = new URL("/dashboard/teacher", request.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(DEMO_COOKIE_NAME, "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
  });
  response.cookies.set("theme", "dark", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}
