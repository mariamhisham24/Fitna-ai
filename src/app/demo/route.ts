import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE_NAME } from "@/lib/auth/demo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/dashboard/teacher";

  const response = NextResponse.redirect(url, { status: 302 });

  response.cookies.set(DEMO_COOKIE_NAME, "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
  });
  response.cookies.set("theme", "dark", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
  });

  return response;
}

