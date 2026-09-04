import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the session cookie
  const sessionCookie = request.cookies.get("baloviet_session");
  const isAuthenticated = !!sessionCookie?.value;

  // 1. Protect /tai-khoan/* routes
  if (pathname.startsWith("/tai-khoan")) {
    if (!isAuthenticated) {
      const url = new URL("/dang-nhap", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 2. Protect /admin/* routes
  // Note: True role validation will happen in the layout/page via getSession()
  // as Edge middleware cannot easily query the Neon DB directly.
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const url = new URL("/dang-nhap", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3. Redirect authenticated users away from auth pages
  if (pathname === "/dang-nhap" || pathname === "/dang-ky") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/tai-khoan", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/tai-khoan/:path*",
    "/admin/:path*",
    "/dang-nhap",
    "/dang-ky",
  ],
};
