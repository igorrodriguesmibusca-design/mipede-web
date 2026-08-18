import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/lib/routes";
import { allowVisualDemo, SESSION_COOKIE_NAMES } from "@/server/config";

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = routes.auth.login;
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = hasSession(request);
  const demo = allowVisualDemo();

  if (pathname.startsWith("/plataforma")) {
    if (!session) return redirectToLogin(request);
    return NextResponse.next();
  }

  if (pathname.startsWith("/onboarding")) {
    if (!session && !demo) return redirectToLogin(request);
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/gestor")) {
    if (session || demo) return NextResponse.next();
    return redirectToLogin(request);
  }

  if (pathname === "/preview" || pathname.startsWith("/preview/")) {
    if (session || demo) return NextResponse.next();
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/gestor/:path*",
    "/plataforma/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/preview",
    "/preview/:path*",
  ],
};
