import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/forgot-password"];

// Static assets and bridge API routes to skip session refresh.
// Only skip /api/tally/ (API key auth) and /api/auth/ (handles own auth).
// Browser-facing API routes like /api/wip use cookie-based session auth
// and need middleware session refresh.
const skipPaths = ["/_next", "/api/tally/", "/api/auth/", "/favicon.ico", "/fonts"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and API routes
  if (skipPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    // If authenticated user tries to access login page, redirect to dashboard
    if (pathname === "/login") {
      const { user, supabaseResponse } = await updateSession(request);
      if (user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }
    return NextResponse.next();
  }

  // Protected routes — check Supabase session
  const { user, supabaseResponse } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
