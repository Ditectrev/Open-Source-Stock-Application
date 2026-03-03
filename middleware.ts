/**
 * Next.js middleware for request/response logging
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "./lib/logger";

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname, search } = request.nextUrl;
  const method = request.method;

  // Log incoming request
  logger.info("Incoming request", {
    method,
    path: pathname,
    query: search,
    userAgent: request.headers.get("user-agent") || "unknown",
  });

  // Continue with the request
  const response = NextResponse.next();

  // Log response time
  const duration = Date.now() - startTime;
  logger.info("Request completed", {
    method,
    path: pathname,
    duration: `${duration}ms`,
    status: response.status,
  });

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
