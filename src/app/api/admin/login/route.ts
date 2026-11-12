import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { 
  checkAccountLockout, 
  recordFailedLoginAttempt, 
  clearFailedLoginAttempts 
} from "@/utils/security/accountLockout";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Account Lockout Pre-flight Check
    const lockoutStatus = await checkAccountLockout(cleanEmail);
    if (lockoutStatus.isLocked) {
      return NextResponse.json(
        {
          success: false,
          locked: true,
          remainingMinutes: lockoutStatus.remainingMinutes,
          message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes.`
        },
        { status: 423 } // HTTP 423 Locked
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error || !data.user) {
      // 2. Record Failed Attempt & Check If Now Locked
      const failResult = await recordFailedLoginAttempt(cleanEmail);

      return NextResponse.json(
        { 
          success: false, 
          locked: failResult.isLocked,
          remainingMinutes: failResult.remainingMinutes,
          remainingAttempts: failResult.remainingAttempts,
          message: failResult.isLocked 
            ? failResult.message 
            : `Invalid administrator credentials. ${failResult.remainingAttempts > 0 ? `${failResult.remainingAttempts} attempt(s) remaining.` : ""}`
        },
        { status: failResult.isLocked ? 423 : 401 }
      );
    }

    // 3. Clear failed attempts upon successful authentication
    await clearFailedLoginAttempts(cleanEmail);

    // Now check if they actually have admin rights
    const { getSuperAdminSession } = await import("@/utils/adminAuth");
    const adminSession = await getSuperAdminSession();

    if (!adminSession.isAuthenticated) {
      // Not an admin, sign them out
      await supabase.auth.signOut();
      return NextResponse.json(
        { 
          success: false, 
          message: "Access denied. You do not have administrator privileges." 
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      redirect: "/admin",
      admin: {
        id: adminSession.user?.id,
        email: adminSession.user?.email,
        role: adminSession.role
      }
    });

  } catch (error: any) {
    console.error("Admin login API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process login." },
      { status: 500 }
    );
  }
}
