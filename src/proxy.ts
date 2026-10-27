import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { 
  evaluateRequestRateLimit, 
  createRateLimitResponse, 
  createRateLimitHeaders 
} from "@/utils/rateLimit";

/**
 * Global Next.js 16 Middleware Proxy
 * 
 * Enforces rate limiting, burst throttling, and security boundaries
 * on every single incoming request before route handlers are invoked.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Skip static assets, fonts, and images
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") // file extensions like .ico, .png, .svg
  ) {
    return NextResponse.next();
  }

  // 2. Global Rate Limiting & Burst Throttling Evaluation
  const rateLimitResult = evaluateRequestRateLimit(request);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  // 3. Proceed to session management & authentication
  const response = await updateSession(request);

  // 4. Attach standard rate-limit diagnostic headers to response
  const headers = createRateLimitHeaders(rateLimitResult);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image formats (.svg, .png, .jpg, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
