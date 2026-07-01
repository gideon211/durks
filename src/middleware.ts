import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Static public pages — cache at edge for 60s
  if (pathname === "/" || pathname === "/products" || pathname === "/contact" || pathname === "/csr" || pathname === "/training" || pathname === "/bulk-quote") {
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  }

  // Product category pages — cache for 120s
  if (pathname.startsWith("/products/")) {
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  }

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
