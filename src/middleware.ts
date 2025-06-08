import { type NextRequest, NextResponse } from 'next/server';

/**
 * Middleware function.
 * This file is made valid to prevent build errors if Next.js picks it up.
 * Next.js prioritizes src/middleware.ts over a root middleware.ts if both exist.
 */
export function middleware(request: NextRequest) {
  // Perform no operations, just pass the request through.
  // You can add console.log here for debugging if needed:
  // console.log('[src/middleware.ts] Request path:', request.nextUrl.pathname);
  return NextResponse.next();
}

/**
 * Middleware configuration.
 * An empty matcher means this middleware will not run on any path by default.
 */
export const config = {
  matcher: [
    /*
     * To activate this middleware for specific paths, add them here.
     * Example: '/dashboard/:path*'
     * For now, keeping it empty to avoid unintended behavior.
     */
  ],
};
