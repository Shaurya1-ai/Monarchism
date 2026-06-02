import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PAGES = [
  "/",
  "/login",
  "/signup",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

const AUTH_API_PUBLIC = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/verify",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

const PROTECTED_PAGES = [
  "/dashboard",
  "/quests",
  "/achievements",
  "/inventory",
  "/dungeons",
  "/shadows",
  "/leaderboards",
  "/guild",
  "/profile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  const hasAccess = request.cookies.has("monarch_access");
  const isProtectedPage = PROTECTED_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isProtectedApi =
    pathname.startsWith("/api") &&
    !AUTH_API_PUBLIC.some((p) => pathname.startsWith(p)) &&
    pathname !== "/api/csrf" &&
    pathname !== "/api/leaderboards";

  if ((isProtectedPage || isProtectedApi) && !hasAccess) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasAccess && PUBLIC_PAGES.includes(pathname) && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
