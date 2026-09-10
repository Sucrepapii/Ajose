import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/resend";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Generate 6-digit OTP code for password recovery
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    // Save OTP to user record using Supabase admin client or fallback update
    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin
        .from("users")
        .update({
          reset_otp: otpCode,
          reset_otp_expires_at: expiresAt,
        })
        .eq("email", email.toLowerCase().trim());
    } catch (dbErr) {
      console.warn("Could not write reset_otp to users table directly:", dbErr);
    }

    // Send Password Recovery Email via Resend API
    const emailResult = await sendEmail({
      to: email.trim(),
      subject: `Your Ajose Password Reset Code: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #FDFBF7; padding: 32px; border-radius: 12px; color: #0B3022; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #0B3022; margin-top: 0;">Ajose Password Recovery</h2>
          <p style="font-size: 16px; color: #374151;">Hello,</p>
          <p style="font-size: 16px; color: #374151;">You requested to reset your password. Use the 6-digit verification code below:</p>
          
          <div style="background-color: #0B3022; color: #C5A059; padding: 18px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; margin: 24px 0;">
            ${otpCode}
          </div>
          
          <p style="font-size: 14px; color: #6B7280;">This code will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Ajose — Turn by turn, no wahala.</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Failed to deliver recovery email via Resend");
    }

    return NextResponse.json({
      success: true,
      message: "Recovery code sent successfully via Resend email service.",
      otpSent: true,
    });
  } catch (error: any) {
    console.error("Resend Recovery Email Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send password recovery email." },
      { status: 500 }
    );
  }
}
