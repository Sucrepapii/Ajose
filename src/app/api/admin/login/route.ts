import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAdminCredentials } from "@/utils/adminStore";
import { ADMIN_SESSION_COOKIE } from "@/utils/adminAuth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await validateAdminCredentials(email.trim(), password);

    if (!admin) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid administrator credentials or access suspended." 
        },
        { status: 401 }
      );
    }

    // If admin is using a temporary password or requires password change, require permanent password change
    const needsPasswordChange = admin.requiresPasswordChange || (Boolean(admin.temporaryPassword) && !admin.password && admin.email !== "admin@ajose.ng");

    if (needsPasswordChange) {
      return NextResponse.json({
        success: true,
        requiresPasswordChange: true,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        message: "Temporary password verified. Please set your new permanent password to continue."
      });
    }

    // Generate 7-day session token
    const sessionPayload = {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      isSuperAdmin: admin.isSuperAdmin,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    const sessionCookieValue = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, sessionCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return NextResponse.json({
      success: true,
      redirect: "/admin",
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
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
