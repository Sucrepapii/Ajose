import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { clearFailedLoginAttempts } from "@/utils/security/accountLockout";
import { getAuthUserByEmail } from "@/utils/authHelpers";
import { evaluateRequestRateLimit, createRateLimitResponse } from "@/utils/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Account Lockout Clearance Endpoint
 * 
 * Safely clears account lockout state when a user resets their credentials.
 * 
 * Defense-in-depth verification:
 * 1. Checks AUTH tier rate limits.
 * 2. Verifies legitimacy:
 *    a) Either the caller has an active authenticated Supabase session matching the email, OR
 *    b) The Supabase Auth user record has updated_at timestamp within the last 15 minutes
 *       (proving a legitimate recovery OTP verification / password update occurred recently).
 */
export async function POST(req: NextRequest) {
  try {
    const rateCheck = evaluateRequestRateLimit(req, "AUTH");
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck);
    }

    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Check for authenticated session via cookies / headers
    let isAuthorized = false;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email?.toLowerCase() === cleanEmail) {
        isAuthorized = true;
      }
    } catch (_) {}

    // 2. If not session-authorized, check if user was updated recently in Supabase Auth
    if (!isAuthorized) {
      const authUser = await getAuthUserByEmail(cleanEmail);
      if (authUser?.updated_at) {
        const updatedAtMs = new Date(authUser.updated_at).getTime();
        const now = Date.now();
        // Allow if updated within last 15 minutes
        if (now - updatedAtMs < 15 * 60 * 1000) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized lockout clearance. A password reset must be verified first." },
        { status: 403 }
      );
    }

    // 3. Clear failed login attempts and unlock the account
    await clearFailedLoginAttempts(cleanEmail);

    return NextResponse.json({
      success: true,
      message: "Account lockout state cleared successfully."
    });
  } catch (error: any) {
    console.error("Unlock account endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process unlock request." },
      { status: 500 }
    );
  }
}
