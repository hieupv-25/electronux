import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  // Protected route patterns
  const protectedRoutes = ["/account", "/checkout", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    // Redirect to home page with authRequired flag
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("authRequired", "true");
    redirectUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes — check role (preparation for future)
  if (pathname.startsWith("/admin") && token) {
    if (token.role !== "admin") {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("adminForbidden", "true");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check custom session expiry
  if (token?.expiresAt && Date.now() > (token.expiresAt as number)) {
    // Session expired, clear it
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match protected routes, skip static files and API routes
    "/account/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};
