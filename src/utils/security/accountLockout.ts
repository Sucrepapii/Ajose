/**
 * Progressive Account Lockout Security Guard
 * 
 * Protects member and admin authentication endpoints against:
 * 1. Brute-force password guessing
 * 2. Automated credential-stuffing bot attacks
 * 3. Distributed dictionary attacks
 * 
 * Rules:
 * - Maximum 5 consecutive failed attempts per account/email.
 * - 15-minute lockout period upon reaching threshold.
 * - Auto-resets on successful authentication or when window expires.
 */

import { createAdminClient } from "@/utils/supabase/admin";

export interface LockoutRecord {
  failedAttempts: number;
  lastAttemptAt: number;
  lockedUntil: number | null;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;   // 15-minute sliding window

// In-memory fast cache for active lockout tracking
const lockoutStore = new Map<string, LockoutRecord>();

// Periodic in-memory cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of lockoutStore.entries()) {
      const isLockExpired = record.lockedUntil ? now > record.lockedUntil : true;
      const isWindowExpired = now - record.lastAttemptAt > ATTEMPT_WINDOW_MS;
      if (isLockExpired && isWindowExpired) {
        lockoutStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

function normalizeKey(identifier: string): string {
  return identifier.trim().toLowerCase();
}

/**
 * Checks if an account is currently locked out.
 */
export async function checkAccountLockout(identifier: string): Promise<{
  isLocked: boolean;
  remainingMinutes: number;
  remainingAttempts: number;
  failedAttempts: number;
}> {
  const key = normalizeKey(identifier);
  const now = Date.now();
  let record = lockoutStore.get(key);

  // Fallback check against Supabase user metadata for multi-server consistency
  if (!record) {
    try {
      const supabase = createAdminClient();
      const { data: usersList } = await supabase.auth.admin.listUsers({ perPage: 100 });
      const matchedUser = usersList?.users?.find(u => u.email?.toLowerCase() === key);
      const lockedUntilIso = matchedUser?.user_metadata?.locked_until;
      
      if (lockedUntilIso) {
        const lockedUntilMs = new Date(lockedUntilIso).getTime();
        if (lockedUntilMs > now) {
          record = {
            failedAttempts: MAX_FAILED_ATTEMPTS,
            lastAttemptAt: now,
            lockedUntil: lockedUntilMs
          };
          lockoutStore.set(key, record);
        }
      }
    } catch (_) {}
  }

  if (!record) {
    return {
      isLocked: false,
      remainingMinutes: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      failedAttempts: 0
    };
  }

  // Check if lockout has expired
  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingMs = record.lockedUntil - now;
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return {
        isLocked: true,
        remainingMinutes,
        remainingAttempts: 0,
        failedAttempts: record.failedAttempts
      };
    } else {
      // Lock has expired; clear lock
      record.lockedUntil = null;
      record.failedAttempts = 0;
      lockoutStore.delete(key);
    }
  }

  // Check if attempt window has expired
  if (now - record.lastAttemptAt > ATTEMPT_WINDOW_MS) {
    record.failedAttempts = 0;
    lockoutStore.delete(key);
    return {
      isLocked: false,
      remainingMinutes: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      failedAttempts: 0
    };
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts);

  return {
    isLocked: false,
    remainingMinutes: 0,
    remainingAttempts,
    failedAttempts: record.failedAttempts
  };
}

/**
 * Records a failed login attempt. Locks the account if threshold is reached.
 */
export async function recordFailedLoginAttempt(identifier: string): Promise<{
  isLocked: boolean;
  remainingMinutes: number;
  remainingAttempts: number;
  failedAttempts: number;
  message: string;
}> {
  const key = normalizeKey(identifier);
  const now = Date.now();
  const record = lockoutStore.get(key) || {
    failedAttempts: 0,
    lastAttemptAt: now,
    lockedUntil: null
  };

  // If outside window, reset counter
  if (now - record.lastAttemptAt > ATTEMPT_WINDOW_MS && !record.lockedUntil) {
    record.failedAttempts = 0;
  }

  record.failedAttempts += 1;
  record.lastAttemptAt = now;

  let isLocked = false;
  let remainingMinutes = 0;
  let message = "";

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    isLocked = true;
    remainingMinutes = 15;
    message = `Account temporarily locked due to ${MAX_FAILED_ATTEMPTS} failed attempts. Please try again in 15 minutes or reset your password.`;

    // Persist lockout timestamp to Supabase Auth metadata
    try {
      const supabase = createAdminClient();
      const { data: usersList } = await supabase.auth.admin.listUsers({ perPage: 100 });
      const matchedUser = usersList?.users?.find(u => u.email?.toLowerCase() === key);
      if (matchedUser) {
        await supabase.auth.admin.updateUserById(matchedUser.id, {
          user_metadata: {
            ...matchedUser.user_metadata,
            locked_until: new Date(record.lockedUntil).toISOString(),
            last_lockout_reason: "Excessive failed login attempts"
          }
        });
      }
    } catch (_) {}
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
    message
  };
}

/**
 * Clears failed attempts upon successful authentication.
 */
export async function clearFailedLoginAttempts(identifier: string): Promise<void> {
  const key = normalizeKey(identifier);
  lockoutStore.delete(key);

  // Clear locked_until metadata in Supabase if present
  try {
    const supabase = createAdminClient();
    const { data: usersList } = await supabase.auth.admin.listUsers({ perPage: 100 });
    const matchedUser = usersList?.users?.find(u => u.email?.toLowerCase() === key);
    if (matchedUser?.user_metadata?.locked_until) {
      await supabase.auth.admin.updateUserById(matchedUser.id, {
        user_metadata: {
          ...matchedUser.user_metadata,
          locked_until: null,
          last_lockout_reason: null
        }
      });
    }
  } catch (_) {}
}
