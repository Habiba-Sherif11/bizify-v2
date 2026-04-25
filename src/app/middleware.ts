import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/entrepreneur",
  "/manufacturer",
  "/mentor",
  "/supplier",
  "/admin",
];

const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // If user is logged in and trying to access public auth pages, redirect to home
  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If route is protected and no token, redirect to login
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|assets).*)"],
};