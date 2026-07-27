import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/contractor": ["CONTRACTOR"],
  "/customer": ["CUSTOMER", "ADMIN"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseResponse = await updateSession(request);

  const matchedPrefix = Object.keys(protectedPrefixes).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!matchedPrefix) {
    return supabaseResponse;
  }

  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/contractor/:path*",
    "/customer/:path*",
    "/login",
    "/register",
  ],
};
