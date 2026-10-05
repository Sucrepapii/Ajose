import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSuperAdminSession } from "@/utils/adminAuth";

export async function POST(req: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session.isAuthenticated || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify current password by attempting to sign in again
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword.trim()
    });

    if (signInErr) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    // Update password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword.trim()
    });

    if (updateErr) {
      return NextResponse.json(
        { success: false, message: updateErr.message || "Failed to update password." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!",
      redirect: "/admin",
      admin: {
        id: session.user.id,
        email: session.user.email,
        role: session.role
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
