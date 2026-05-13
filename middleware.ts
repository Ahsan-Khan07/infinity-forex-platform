import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * FINTECH-GRADE ROUTE SECURITY MIDDLEWARE
 * ---------------------------------------
 * Handles:
 * - Authentication guard
 * - Role-based access control
 * - MFA enforcement (admin forced setup)
 * - Secure routing protection
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get JWT session
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isApi = pathname.startsWith("/api");

  /**
   * 1. Allow public routes
   */
  if (isAuthPage || pathname === "/" || isApi) {
    return NextResponse.next();
  }

  /**
   * 2. Require authentication for dashboard/admin
   */
  if ((isDashboard || isAdmin) && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  /**
   * 3. ROLE SECURITY (ADMIN ONLY AREA)
   */
  if (isAdmin && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  /**
   * 4. MFA ENFORCEMENT (FINTECH SECURITY RULE)
   *
   * Admin must complete MFA setup before accessing dashboard
   */
  if (
    isDashboard &&
    token?.role === "ADMIN" &&
    token?.mfaSetupRequired === true
  ) {
    const isMfaPage = pathname.startsWith("/dashboard/security/mfa");

    // allow ONLY MFA setup page
    if (!isMfaPage) {
      return NextResponse.redirect(
        new URL("/dashboard/security/mfa", req.url)
      );
    }
  }

  /**
   * 5. NORMAL FLOW
   */
  return NextResponse.next();
}

/**
 * Apply middleware only where needed
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
