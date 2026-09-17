import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAdminCredentials, updateAdminPassword } from "@/utils/adminStore";
import { ADMIN_SESSION_COOKIE } from "@/utils/adminAuth";

export async function POST(req: Request) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, current password, and new permanent password are required." },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Verify current (temporary) password
    const admin = await validateAdminCredentials(email.trim(), currentPassword.trim());
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Current temporary password is incorrect or expired." },
        { status: 401 }
      );
    }

    // Update permanent password and clear temporary status
    const updatedAdmin = await updateAdminPassword(email.trim(), newPassword.trim());

    // Issue updated session cookie
    const sessionPayload = {
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      fullName: updatedAdmin.fullName,
      role: updatedAdmin.role,
      isSuperAdmin: updatedAdmin.isSuperAdmin,
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
      message: "Permanent password updated successfully! Redirecting to command center...",
      redirect: "/admin",
      admin: {
        id: updatedAdmin.id,
        fullName: updatedAdmin.fullName,
        email: updatedAdmin.email,
        role: updatedAdmin.role
      }
    });

  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update password." },
      { status: 500 }
    );
  }
}
