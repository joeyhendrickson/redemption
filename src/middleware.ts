import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/config";

const protectedPrefixes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/contractor": ["CONTRACTOR"],
  "/customer": ["CUSTOMER", "ADMIN"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const supabaseResponse = await updateSession(request);

    const matchedPrefix = Object.keys(protectedPrefixes).find((prefix) =>
      pathname.startsWith(prefix),
    );

    if (!matchedPrefix) {
      return supabaseResponse;
    }

    if (!isSupabaseConfigured()) {
      return supabaseResponse;
    }

    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[middleware] Invocation failed", error);
    return NextResponse.next({ request });
  }
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
