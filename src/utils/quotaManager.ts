/**
 * Usage Quota Management Engine
 * 
 * Enforces strict per-day/per-hour ceilings on expensive operations:
 * - BVN lookups (Mono paid API)
 * - Transactional emails (Resend API)
 * - Mandate initiations (Mono payment gateway)
 * - Circle creations
 * - Public lead submissions
 */

import { NextResponse } from "next/server";

export type QuotaAction =
  | "BVN_LOOKUP"
  | "TRANSACTIONAL_EMAIL"
  | "MANDATE_INITIATION"
  | "GROUP_CREATION"
  | "PUBLIC_LEAD_SUBMISSION"
  | "UNDERWRITING_CHECK";

export interface QuotaDefinition {
  limit: number;             // Maximum allowed operations in window
  windowSeconds: number;     // Window duration in seconds (e.g. 86400 for 24h)
  description: string;
}

export const QUOTA_DEFINITIONS: Record<QuotaAction, QuotaDefinition> = {
  BVN_LOOKUP: {
    limit: 5,
    windowSeconds: 86400, // 24 hours
    description: "Daily identity & BVN verification quota",
  },
  TRANSACTIONAL_EMAIL: {
    limit: 15,
    windowSeconds: 86400, // 24 hours per recipient
    description: "Daily transactional email dispatch quota",
  },
  MANDATE_INITIATION: {
    limit: 5,
    windowSeconds: 86400, // 24 hours per user/circle
    description: "Daily direct debit mandate generation quota",
  },
  GROUP_CREATION: {
    limit: 10,
    windowSeconds: 86400, // 24 hours per admin
    description: "Daily circle creation quota",
  },
  PUBLIC_LEAD_SUBMISSION: {
    limit: 5,
    windowSeconds: 86400, // 24 hours per IP
    description: "Daily public newsletter/waitlist submission quota",
  },
  UNDERWRITING_CHECK: {
    limit: 10,
    windowSeconds: 86400, // 24 hours per user
    description: "Daily underwriting scoring quota",
  },
};

interface QuotaRecord {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

const quotaStore = new Map<string, QuotaRecord>();

// Periodic cleanup of expired quota records
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of quotaStore.entries()) {
      if (now > record.resetAt) {
        quotaStore.delete(key);
      }
    }
  }, 300_000).unref?.();
}

export interface QuotaCheckResult {
  allowed: boolean;
  action: QuotaAction;
  identifier: string;
  count: number;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Checks quota without incrementing
 */
export function checkQuota(action: QuotaAction, identifier: string): QuotaCheckResult {
  const def = QUOTA_DEFINITIONS[action];
  const key = `quota:${action}:${identifier}`;
  const now = Date.now();

  const record = quotaStore.get(key);

  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      action,
      identifier,
      count: 0,
      limit: def.limit,
      remaining: def.limit,
      resetInSeconds: def.windowSeconds,
    };
  }

  const remaining = Math.max(0, def.limit - record.count);
  const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    allowed: record.count < def.limit,
    action,
    identifier,
    count: record.count,
    limit: def.limit,
    remaining,
    resetInSeconds,
  };
}

/**
 * Increments and checks quota in an atomic call
 */
export function consumeQuota(action: QuotaAction, identifier: string): QuotaCheckResult {
  const def = QUOTA_DEFINITIONS[action];
  const key = `quota:${action}:${identifier}`;
  const now = Date.now();

  let record = quotaStore.get(key);

  if (!record || now > record.resetAt) {
    record = {
      count: 1,
      resetAt: now + def.windowSeconds * 1000,
    };
    quotaStore.set(key, record);

    return {
      allowed: true,
      action,
      identifier,
      count: 1,
      limit: def.limit,
      remaining: def.limit - 1,
      resetInSeconds: def.windowSeconds,
    };
  }

  if (record.count >= def.limit) {
    const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      action,
      identifier,
      count: record.count,
      limit: def.limit,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, def.limit - record.count);
  const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    allowed: true,
    action,
    identifier,
    count: record.count,
    limit: def.limit,
    remaining,
    resetInSeconds,
  };
}

/**
 * Returns a standardized 429 response when a feature quota is exhausted
 */
export function createQuotaExceededResponse(result: QuotaCheckResult): NextResponse {
  const def = QUOTA_DEFINITIONS[result.action];
  const hours = Math.ceil(result.resetInSeconds / 3600);

  return NextResponse.json(
    {
      error: `Daily usage quota exceeded for ${def.description}. Maximum limit is ${result.limit} per 24 hours.`,
      code: "USAGE_QUOTA_EXCEEDED",
      action: result.action,
      limit: result.limit,
      remaining: 0,
      resetInSeconds: result.resetInSeconds,
      retryAfterHours: hours,
    },
    {
      status: 429,
      headers: {
        "Retry-After": result.resetInSeconds.toString(),
        "X-Quota-Limit": result.limit.toString(),
        "X-Quota-Remaining": "0",
        "X-Quota-Reset": result.resetInSeconds.toString(),
      },
    }
  );
}
