import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { 
  checkAccountLockout, 
  recordFailedLoginAttempt, 
  clearFailedLoginAttempts 
} from "@/utils/security/accountLockout";
import { evaluateRequestRateLimit, createRateLimitResponse } from "@/utils/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Member Authentication Endpoint with Defense-in-Depth Account Lockout
 * 
 * Features:
 * 1. Sliding window rate limiting (AUTH tier)
 * 2. Progressive account lockout (max 5 consecutive failures = 15m lockout)
 * 3. Graceful remaining-attempts countdown alerts
 * 4. Automatic reset upon successful password authentication
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (Auth Tier)
    const rateCheck = evaluateRequestRateLimit(req, "AUTH");
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck);
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 2. Account Lockout Pre-flight Check
    const lockoutStatus = await checkAccountLockout(cleanEmail);
    if (lockoutStatus.isLocked) {
      return NextResponse.json(
        {
          error: `This account is temporarily locked due to multiple failed login attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes or use Forgot Password to reset your credentials.`,
          locked: true,
          remainingMinutes: lockoutStatus.remainingMinutes
        },
        { status: 423 } // HTTP 423 Locked
      );
    }

    // 3. Attempt authentication via Supabase Server Client
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password)
    });

    if (error || !data.user) {
      // 4. Record Failed Attempt
      const failResult = await recordFailedLoginAttempt(cleanEmail);

      let userFacingMessage = "Invalid email or password. Please verify your credentials.";
      if (failResult.isLocked) {
        userFacingMessage = `Account temporarily locked for 15 minutes due to multiple failed attempts. Please reset your password or try again later.`;
      } else if (failResult.remainingAttempts === 1) {
        userFacingMessage = "Invalid password. 1 attempt remaining before temporary account lockout.";
      } else if (failResult.remainingAttempts <= 3) {
        userFacingMessage = `Invalid password. ${failResult.remainingAttempts} attempts remaining before account lockout.`;
      }

      return NextResponse.json(
        {
          error: userFacingMessage,
          locked: failResult.isLocked,
          remainingMinutes: failResult.remainingMinutes,
          remainingAttempts: failResult.remainingAttempts
        },
        { status: failResult.isLocked ? 423 : 401 }
      );
    }

    // 5. Successful Login -> Clear any failed attempt counters
    await clearFailedLoginAttempts(cleanEmail);

    // 6. Check for compliance suspension / bans
    const isSuspended = Boolean(
      (data.user.banned_until && new Date(data.user.banned_until) > new Date()) ||
      data.user.user_metadata?.is_suspended
    );

    if (isSuspended) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Your account has been suspended by compliance administration. Please contact support@ajose.ng for review." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata
      }
    });

  } catch (err: any) {
    console.error("Auth login API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process login request." },
      { status: 500 }
    );
  }
}
