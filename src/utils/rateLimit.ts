/**
 * In-Memory Multi-Tier Sliding Window Rate Limiter & Request Throttling Engine
 * 
 * Provides defense-in-depth against:
 * 1. Rapid burst attacks (sub-second throttling / pacing)
 * 2. Endpoint exhaustion (sliding window per-tier limits)
 * 3. Denial of Wallet attacks on expensive third-party APIs
 */

import { NextRequest, NextResponse } from "next/server";

export type RateLimitTier = 
  | "AUTH"
  | "EXPENSIVE_API"
  | "PUBLIC_SUBMISSION"
  | "STATE_MUTATION"
  | "ADMIN"
  | "GLOBAL_API"
  | "GLOBAL_PAGE";

export interface TierConfig {
  limit: number;             // Max requests allowed in window
  windowMs: number;          // Window duration in ms
  maxBurstPerSecond: number; // Max requests allowed within 1 second
}

export const RATE_LIMIT_TIERS: Record<RateLimitTier, TierConfig> = {
  // Sensitive auth endpoints (login, pin, otp verification)
  AUTH: {
    limit: 10,
    windowMs: 60_000,
    maxBurstPerSecond: 3,
  },
  // High-cost third-party APIs (Mono BVN lookup, statement analysis, credit bureau)
  EXPENSIVE_API: {
    limit: 10,
    windowMs: 60_000,
    maxBurstPerSecond: 2,
  },
  // Public submissions susceptible to bot spam (newsletter, feedback, waitlist)
  PUBLIC_SUBMISSION: {
    limit: 5,
    windowMs: 60_000,
    maxBurstPerSecond: 2,
  },
  // Core financial state mutations (group creation, joins, payouts, contributions)
  STATE_MUTATION: {
    limit: 30,
    windowMs: 60_000,
    maxBurstPerSecond: 5,
  },
  // Admin management endpoints
  ADMIN: {
    limit: 60,
    windowMs: 60_000,
    maxBurstPerSecond: 10,
  },
  // All other API routes
  GLOBAL_API: {
    limit: 120,
    windowMs: 60_000,
    maxBurstPerSecond: 15,
  },
  // Page navigations / static HTML requests
  GLOBAL_PAGE: {
    limit: 300,
    windowMs: 60_000,
    maxBurstPerSecond: 25,
  },
};

interface ClientHistory {
  timestamps: number[];
  burstTimestamps: number[];
}

const rateLimitStore = new Map<string, ClientHistory>();

// Periodic cleanup of stale client records (every 2 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60_000);
      record.burstTimestamps = record.burstTimestamps.filter((ts) => now - ts < 1_000);
      if (record.timestamps.length === 0 && record.burstTimestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 120_000).unref?.();
}

/**
 * Extracts the real client IP address from request headers
 */
export function getClientIp(request: Request | NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Maps request pathname to the corresponding protection tier
 */
export function resolveRateLimitTier(pathname: string): RateLimitTier {
  if (
    pathname.startsWith("/api/auth") || 
    pathname.startsWith("/api/admin/login") || 
    pathname === "/api/user/pin"
  ) {
    return "AUTH";
  }
  if (
    pathname.startsWith("/api/mono/") ||
    pathname.startsWith("/api/underwriting/") ||
    pathname.startsWith("/api/recovery/")
  ) {
    return "EXPENSIVE_API";
  }
  if (
    pathname === "/api/newsletter/subscribe" ||
    pathname === "/api/feedback" ||
    pathname === "/api/waitlist"
  ) {
    return "PUBLIC_SUBMISSION";
  }
  if (
    pathname.startsWith("/api/groups/create") ||
    pathname.startsWith("/api/groups/join") ||
    pathname.startsWith("/api/groups/start") ||
    pathname.startsWith("/api/groups/contribute") ||
    pathname.startsWith("/api/groups/payout") ||
    pathname.startsWith("/api/groups/confirm-transfer")
  ) {
    return "STATE_MUTATION";
  }
  if (pathname.startsWith("/api/admin/")) {
    return "ADMIN";
  }
  if (pathname.startsWith("/api/")) {
    return "GLOBAL_API";
  }
  return "GLOBAL_PAGE";
}

export interface RateLimitResult {
  allowed: boolean;
  isThrottled: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  tier: RateLimitTier;
  clientIp: string;
}

/**
 * Evaluates both burst throttling and sliding window rate limits for an incoming request
 */
export function evaluateRequestRateLimit(
  request: NextRequest,
  customTier?: RateLimitTier
): RateLimitResult {
  const clientIp = getClientIp(request);
  const tier = customTier || resolveRateLimitTier(request.nextUrl.pathname);
  const config = RATE_LIMIT_TIERS[tier];
  const now = Date.now();

  const storeKey = `${tier}:${clientIp}`;
  let record = rateLimitStore.get(storeKey);
  if (!record) {
    record = { timestamps: [], burstTimestamps: [] };
    rateLimitStore.set(storeKey, record);
  }

  // 1. Evaluate Sub-Second Burst Throttling (Pacing Guard)
  record.burstTimestamps = record.burstTimestamps.filter((ts) => now - ts < 1000);
  if (record.burstTimestamps.length >= config.maxBurstPerSecond) {
    return {
      allowed: false,
      isThrottled: true,
      limit: config.limit,
      remaining: 0,
      resetSeconds: 1,
      tier,
      clientIp,
    };
  }

  // 2. Evaluate Sliding Window Rate Limit
  record.timestamps = record.timestamps.filter((ts) => now - ts < config.windowMs);
  if (record.timestamps.length >= config.limit) {
    const oldest = record.timestamps[0] || now;
    const resetMs = Math.max(1000, config.windowMs - (now - oldest));
    const resetSeconds = Math.ceil(resetMs / 1000);

    return {
      allowed: false,
      isThrottled: false,
      limit: config.limit,
      remaining: 0,
      resetSeconds,
      tier,
      clientIp,
    };
  }

  // Record hit in both burst and window stores
  record.burstTimestamps.push(now);
  record.timestamps.push(now);

  const remaining = Math.max(0, config.limit - record.timestamps.length);
  const resetSeconds = Math.ceil(config.windowMs / 1000);

  return {
    allowed: true,
    isThrottled: false,
    limit: config.limit,
    remaining,
    resetSeconds,
    tier,
    clientIp,
  };
}

/**
 * Generates RFC 6585 standard headers for rate-limited responses
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetSeconds.toString(),
    "X-RateLimit-Tier": result.tier,
  };

  if (!result.allowed) {
    headers["Retry-After"] = result.resetSeconds.toString();
    if (result.isThrottled) {
      headers["X-Throttled"] = "true";
    }
  }

  return headers;
}

/**
 * Returns a standardized 429 Too Many Requests response
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const message = result.isThrottled
    ? `Request rate throttled. Too many rapid requests in a burst. Please wait ${result.resetSeconds}s.`
    : `Rate limit exceeded for ${result.tier}. Max ${result.limit} requests per minute. Retry in ${result.resetSeconds}s.`;

  return NextResponse.json(
    {
      error: message,
      code: result.isThrottled ? "BURST_THROTTLED" : "RATE_LIMIT_EXCEEDED",
      tier: result.tier,
      retryAfter: result.resetSeconds,
      limit: result.limit,
    },
    {
      status: 429,
      headers: createRateLimitHeaders(result),
    }
  );
}

/**
 * Legacy compatibility export for direct route callers
 */
export function checkRateLimit(
  identifier: string,
  options: { limit: number; windowMs: number } = { limit: 60, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const { limit, windowMs } = options;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [], burstTimestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0] || now;
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  };
}
