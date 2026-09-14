import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { error: "Email, OTP code, and new password are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    // 1. Fetch user by email to verify reset_otp in users table
    const { data: userRecord, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, reset_otp, reset_otp_expires_at")
      .eq("email", cleanEmail)
      .single();

    if (userError || !userRecord) {
      // Search in Supabase Auth users list if user profile row missing
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      const targetUser = authUsers?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

      if (listError || !targetUser) {
        return NextResponse.json(
          { error: "User account not found." },
          { status: 404 }
        );
      }

      // Update password directly for existing auth user
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password }
      );

      if (updateAuthError) throw updateAuthError;

      return NextResponse.json({
        success: true,
        message: "Password reset successfully!",
      });
    }

    // 2. Validate custom Resend OTP code if stored
    if (userRecord.reset_otp && userRecord.reset_otp !== cleanOtp) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please check the 6-digit code sent to your email." },
        { status: 403 }
      );
    }

    if (userRecord.reset_otp_expires_at && new Date(userRecord.reset_otp_expires_at) < new Date()) {
      return NextResponse.json(
        { error: "OTP code has expired. Please request a new password reset code." },
        { status: 403 }
      );
    }

    // 3. Update password in Supabase Auth via Admin Client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userRecord.id,
      { password }
    );

    if (updateError) throw updateError;

    // 4. Clear reset_otp fields
    await supabaseAdmin
      .from("users")
      .update({
        reset_otp: null,
        reset_otp_expires_at: null,
      })
      .eq("id", userRecord.id);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error: any) {
    console.error("Verify Reset OTP API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify OTP code." },
      { status: 500 }
    );
  }
}
