import { NextRequest } from "next/server";

/**
 * Shared Cron Authentication Validator
 *
 * Strictly enforces that incoming requests provide a valid, strong CRON_SECRET (>= 32 chars)
 * via Authorization: Bearer <secret> or x-cron-secret header.
 */
export function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.trim().length < 32) {
    return false;
  }

  const cleanSecret = cronSecret.trim();
  const authHeader = req.headers.get("authorization");
  const xCronSecret = req.headers.get("x-cron-secret");

  if (authHeader && authHeader === `Bearer ${cleanSecret}`) {
    return true;
  }

  if (xCronSecret && xCronSecret === cleanSecret) {
    return true;
  }

  return false;
}
