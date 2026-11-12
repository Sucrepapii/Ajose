/**
 * Progressive Account Lockout Security Guard with Exponential Backoff
 * 
 * Protects member and admin authentication endpoints against:
 * 1. Brute-force password guessing
 * 2. Automated credential-stuffing bot attacks
 * 3. Distributed dictionary attacks
 * 
 * Rules:
 * - 5 failed attempts per trial cycle.
 * - Lockout duration doubles on each subsequent lockout cycle:
 *   * 1st Lockout: 15 minutes
 *   * 2nd Lockout: 30 minutes
 *   * 3rd Lockout: 60 minutes (1 hour)
 *   * 4th Lockout: 120 minutes (2 hours)
 *   * Max cap: 24 hours (1,440 minutes)
 * - Auto-resets counter and multiplier back to 0 upon successful login.
 */

export interface LockoutRecord {
  failedAttempts: number;
  lastAttemptAt: number;
  lockedUntil: number | null;
  lockoutCount: number; // Tracks number of times this account has been locked
}

const MAX_FAILED_ATTEMPTS = 5;
const BASE_LOCKOUT_MINUTES = 15;
const MAX_LOCKOUT_MINUTES = 24 * 60; // 24-hour maximum ceiling (1,440 minutes)
const ATTEMPT_WINDOW_MS = 30 * 60 * 1000; // 30-minute sliding window

// In-memory fast cache for active lockout tracking (0ms local latency)
const lockoutStore = new Map<string, LockoutRecord>();

// Periodic in-memory cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of lockoutStore.entries()) {
      const isLockExpired = record.lockedUntil ? now > record.lockedUntil : true;
      const isWindowExpired = now - record.lastAttemptAt > ATTEMPT_WINDOW_MS;
      if (isLockExpired && isWindowExpired && record.lockoutCount === 0) {
        lockoutStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

function normalizeKey(identifier: string): string {
  return identifier.trim().toLowerCase();
}

/**
 * Calculates exponential lockout duration in minutes:
 * 1st -> 15m, 2nd -> 30m, 3rd -> 60m, 4th -> 120m...
 */
function calculateLockoutMinutes(lockoutCount: number): number {
  const multiplier = Math.pow(2, Math.max(0, lockoutCount - 1));
  const calculated = BASE_LOCKOUT_MINUTES * multiplier;
  return Math.min(MAX_LOCKOUT_MINUTES, calculated);
}

/**
 * Checks if an account is currently locked out.
 */
export async function checkAccountLockout(identifier: string): Promise<{
  isLocked: boolean;
  remainingMinutes: number;
  remainingAttempts: number;
  failedAttempts: number;
  lockoutCount: number;
}> {
  const key = normalizeKey(identifier);
  const now = Date.now();
  const record = lockoutStore.get(key);

  if (!record) {
    return {
      isLocked: false,
      remainingMinutes: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      failedAttempts: 0,
      lockoutCount: 0
    };
  }

  // Check if active lockout has expired
  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingMs = record.lockedUntil - now;
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return {
        isLocked: true,
        remainingMinutes,
        remainingAttempts: 0,
        failedAttempts: record.failedAttempts,
        lockoutCount: record.lockoutCount
      };
    } else {
      // Lock has expired; reset attempts for next trial cycle, but preserve lockoutCount
      record.lockedUntil = null;
      record.failedAttempts = 0;
    }
  }

  // Check if attempt window has expired (user has been idle without failing)
  if (now - record.lastAttemptAt > ATTEMPT_WINDOW_MS && !record.lockedUntil) {
    record.failedAttempts = 0;
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts);

  return {
    isLocked: false,
    remainingMinutes: 0,
    remainingAttempts,
    failedAttempts: record.failedAttempts,
    lockoutCount: record.lockoutCount
  };
}

/**
 * Records a failed login attempt.
 * When reaching 5 failed trials, doubles the lockout duration each subsequent cycle.
 */
export async function recordFailedLoginAttempt(identifier: string): Promise<{
  isLocked: boolean;
  remainingMinutes: number;
  remainingAttempts: number;
  failedAttempts: number;
  lockoutCount: number;
  message: string;
}> {
  const key = normalizeKey(identifier);
  const now = Date.now();
  const record = lockoutStore.get(key) || {
    failedAttempts: 0,
    lastAttemptAt: now,
    lockedUntil: null,
    lockoutCount: 0
  };

  // If outside window and not locked, reset attempt counter
  if (now - record.lastAttemptAt > ATTEMPT_WINDOW_MS && !record.lockedUntil) {
    record.failedAttempts = 0;
  }

  record.failedAttempts += 1;
  record.lastAttemptAt = now;

  let isLocked = false;
  let remainingMinutes = 0;
  let message = "";

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    // Escalate lockout count and double duration
    record.lockoutCount = (record.lockoutCount || 0) + 1;
    const durationMinutes = calculateLockoutMinutes(record.lockoutCount);
    const lockoutDurationMs = durationMinutes * 60 * 1000;

    record.lockedUntil = now + lockoutDurationMs;
    isLocked = true;
    remainingMinutes = durationMinutes;

    const timeLabel = durationMinutes >= 60 
      ? `${Math.round(durationMinutes / 60)} hour(s)`
      : `${durationMinutes} minutes`;

    message = record.lockoutCount === 1
      ? `Account temporarily locked due to ${MAX_FAILED_ATTEMPTS} failed attempts. Please try again in ${timeLabel} or reset your password.`
      : `Account locked again due to repeated failed attempts. Lockout doubled to ${timeLabel}. Please reset your password.`;
  } else {
    const remainingAttempts = MAX_FAILED_ATTEMPTS - record.failedAttempts;
    if (remainingAttempts === 1) {
      message = "Invalid password. 1 attempt remaining before temporary account lockout.";
    } else {
      message = `Invalid password. ${remainingAttempts} attempts remaining.`;
    }
  }

  lockoutStore.set(key, record);

  return {
    isLocked,
    remainingMinutes,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts),
    failedAttempts: record.failedAttempts,
    lockoutCount: record.lockoutCount,
    message
  };
}

/**
 * Clears failed attempts and resets exponential multiplier upon successful authentication.
 */
export async function clearFailedLoginAttempts(identifier: string): Promise<void> {
  const key = normalizeKey(identifier);
  lockoutStore.delete(key);
}
