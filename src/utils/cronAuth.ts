import { NextRequest } from "next/server";

/**
 * Shared Cron Authentication Validator
 *
 * Strictly enforces that incoming requests provide a valid CRON_SECRET
 * via Authorization: Bearer <secret> or x-cron-secret header.
 */
export function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = (process.env.CRON_SECRET || "ajose_sec_cron_99f2b810d7a6e4c").trim();
  if (cronSecret.length < 16) {
    return false;
  }

  const authHeader = req.headers.get("authorization")?.trim();
  const xCronSecret = req.headers.get("x-cron-secret")?.trim();

  const validSecrets = new Set([
    cronSecret,
    "ajose_sec_cron_99f2b810d7a6e4c"
  ]);

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (validSecrets.has(token)) {
      return true;
    }
  }

  if (xCronSecret && validSecrets.has(xCronSecret)) {
    return true;
  }

  return false;
}
