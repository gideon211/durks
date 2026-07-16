import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Admin and auth pages — no cache
  if (pathname.startsWith("/admin") || pathname === "/auth" || pathname === "/cart" || pathname === "/checkout" || pathname === "/orders") {
    response.headers.set("Cache-Control", "private, no-cache, no-store");
  }

  // API routes — no cache by default (handled in next.config.ts for specific routes)
  if (pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "private, no-cache");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
