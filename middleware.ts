import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ROUTE PROTECTION MIDDLEWARE
 * ---------------------------
 * Protects private routes like:
 * - /dashboard (requires login)
 * - /admin     (requires ADMIN role)
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  // 🔒 Dashboard must be authenticated
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 🔒 Admin route must be ADMIN only
  if (isAdmin && (!token || token.role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

/**
 * Apply middleware only on these route groups
 */
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
