import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/utils/resend";
import { getClientIp } from "@/utils/rateLimit";
import { consumeQuota, createQuotaExceededResponse } from "@/utils/quotaManager";
import { verifyCaptchaToken, createCaptchaErrorResponse } from "@/utils/captcha";

export const dynamic = "force-dynamic";

/**
 * POST /api/newsletter/subscribe
 * Collects email subscriptions for Àjọṣe launch news & financial guides
 * Protected by: Rate Limiting, Request Throttling, Usage Quotas, and Cryptographic CAPTCHA
 */
export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const { email, consent = true, captchaToken } = body;

    const token = captchaToken || req.headers.get("x-captcha-token");

    // 1. CAPTCHA Verification
    const captchaCheck = verifyCaptchaToken(token, clientIp);
    if (!captchaCheck.valid) {
      return createCaptchaErrorResponse(captchaCheck.reason);
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Please agree to receive launch updates to continue." },
        { status: 400 }
      );
    }

    // 2. Usage Quota Check (Max 5 submissions per IP per 24 hours)
    const quotaCheck = consumeQuota("PUBLIC_LEAD_SUBMISSION", clientIp);
    if (!quotaCheck.allowed) {
      return createQuotaExceededResponse(quotaCheck);
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Persist subscription in Supabase
    const supabase = createAdminClient();
    try {
      await supabase.from("feedback").insert({
        email: cleanEmail,
        name: "Newsletter Subscriber",
        category: "Newsletter Subscription",
        message: "Subscribed to Àjọṣe launch news, circle automation updates, and thrift strategies.",
        source_url: "Footer Subscription Widget",
        rating: 5,
        is_featured: false,
      });
    } catch (dbErr) {
      console.warn("Could not save to feedback table:", dbErr);
    }

    try {
      await supabase.from("waitlist").insert({
        email: cleanEmail,
        platform: "web",
        source: "footer_newsletter_subscription",
      });
    } catch (_) {}

    const formattedDate = new Date().toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // 4. Notify Samuel (Platform Admin) via Resend
    try {
      await sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || "ajoseapp@gmail.com",
        subject: `📬 New Àjọṣe Newsletter Subscriber: ${cleanEmail}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FDFBF7; padding: 32px 20px; color: #0B3022;">
            <div style="max-width: 540px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
              <div style="background: #0B3022; padding: 24px; text-align: center; border-bottom: 2px solid #C5A059;">
                <h2 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 800;">New Subscriber Added! 🎉</h2>
                <p style="color: #C5A059; margin: 6px 0 0 0; font-size: 13px; font-weight: 600;">Àjọṣe Newsletter &amp; Launch News</p>
              </div>
              <div style="padding: 24px; font-size: 14px; line-height: 1.6; color: #1F2937;">
                <p style="margin: 0 0 12px 0;">A new user has opted in to receive Àjọṣe launch news and updates:</p>
                <div style="background: #F4F1EA; border-left: 4px solid #C5A059; padding: 12px 16px; border-radius: 6px; font-family: monospace; font-size: 15px; font-weight: bold; color: #0B3022; margin-bottom: 16px;">
                  ${cleanEmail}
                </div>
                <p style="font-size: 12px; color: #6B7280; margin: 0;"><strong>Date:</strong> ${formattedDate} (WAT)</p>
                <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0 0;"><strong>Source:</strong> Footer Subscription Widget</p>
              </div>
              <div style="background: #FAF8F5; padding: 14px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF;">
                Àjọṣe Automated Lead Capture Engine
              </div>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.warn("Admin notification email skipped:", e);
    }

    // 5. Send Welcome Confirmation to subscriber
    try {
      await sendEmail({
        to: cleanEmail,
        subject: "Welcome to Àjọṣe — Turn by turn, no wahala. 🌿",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FDFBF7; padding: 32px 20px; color: #0B3022;">
            <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              <div style="background: #0B3022; padding: 32px 24px; text-align: center; border-bottom: 3px solid #C5A059;">
                <div style="font-size: 32px; font-weight: 800; color: #FFFFFF; font-family: serif; letter-spacing: -0.5px;">
                  Àjọ<span style="color: #C5A059;">ṣe</span>
                </div>
                <p style="color: #A7F3D0; font-size: 13px; margin: 8px 0 0 0; font-style: italic;">&ldquo;Turn by turn, no wahala.&rdquo;</p>
              </div>
              <div style="padding: 32px 28px; font-size: 15px; line-height: 1.6; color: #374151;">
                <h3 style="color: #0B3022; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">You're in the inner circle! 🎉</h3>
                <p style="margin: 0 0 16px 0;">
                  Thank you for subscribing to Àjọṣe. We are building the most trusted digital rotational thrift platform in Africa — combining cultural solidarity with automated direct debit sweeps and instant NIBSS settlement.
                </p>
                <div style="background: #F4F1EA; border-radius: 12px; padding: 18px; margin: 24px 0;">
                  <p style="margin: 0 0 8px 0; font-weight: 700; color: #0B3022; font-size: 14px;">Here is what you will receive:</p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4B5563;">
                    <li style="margin-bottom: 6px;">Early beta access to new mobile app releases</li>
                    <li style="margin-bottom: 6px;">Organizers' playbooks on managing default-proof circles</li>
                    <li style="margin-bottom: 6px;">Exclusive launch promotions &amp; volume tier fee waivers</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 28px 0 12px 0;">
                  <a href="https://ajose.ng" style="display: inline-block; background-color: #0B3022; color: #E2C285; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                    Explore Àjọṣe Platform &rarr;
                  </a>
                </div>
              </div>
              <div style="background: #FAF8F5; padding: 18px 24px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
                <p style="margin: 0 0 6px 0;">© ${new Date().getFullYear()} Àjọṣe Technologies Ltd. All rights reserved.</p>
                <p style="margin: 0;">You received this because you subscribed at <a href="https://ajose.ng" style="color: #0B3022; text-decoration: underline;">ajose.ng</a>. You can unsubscribe at any time.</p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.warn("Subscriber confirmation email skipped:", e);
    }

    return NextResponse.json({
      success: true,
      message: "🎉 You have been successfully subscribed to Àjọṣe updates!",
    });
  } catch (err: any) {
    console.error("Newsletter subscription error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
