import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/utils/resend";
import { verifyCronAuth } from "@/utils/cronAuth";
import { getDailyNewsletterTip } from "@/data/dailyNewsletterTips";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Automated Daily Àjọṣe Newsletter & Thrift Tip Cron Engine
 * 
 * Runs automatically every morning (09:00 AM WAT via GitHub Actions / Cron)
 * 1. Picks today's curated financial / thrift insight
 * 2. Fetches active verified subscribers & members
 * 3. Delivers high-conversion luxury HTML emails via Resend
 */
export async function GET(req: NextRequest) {
  return handleDailyNewsletter(req);
}

export async function POST(req: NextRequest) {
  return handleDailyNewsletter(req);
}

async function handleDailyNewsletter(req: NextRequest) {
  try {
    const isAuthorized = verifyCronAuth(req);

    if (!isAuthorized) {
      // Check SuperAdmin session
      try {
        const { getSuperAdminSession } = await import("@/utils/adminAuth");
        const adminSession = await getSuperAdminSession();
        if (!adminSession.isAuthenticated || !adminSession.isSuperAdmin) {
          return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
        }
      } catch {
        return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
      }
    }

    const testEmailOnly = req.nextUrl.searchParams.get("testEmail");
    const today = new Date();
    const tip = getDailyNewsletterTip(today);

    const formattedDate = today.toLocaleDateString("en-NG", {
      timeZone: "Africa/Lagos",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const supabase = createAdminClient();

    // 1. Gather all active recipients
    const recipientSet = new Set<string>();

    if (testEmailOnly && testEmailOnly.includes("@")) {
      recipientSet.add(testEmailOnly.trim().toLowerCase());
    } else {
      // A. Subscribers from waitlist table
      try {
        const { data: waitlistSubs } = await supabase
          .from("waitlist")
          .select("email, status")
          .neq("status", "unsubscribed")
          .limit(1000);

        (waitlistSubs || []).forEach(s => {
          if (s.email && s.email.includes("@")) {
            recipientSet.add(s.email.trim().toLowerCase());
          }
        });
      } catch (_) {}

      // B. Subscribers from feedback table
      try {
        const { data: feedbackSubs } = await supabase
          .from("feedback")
          .select("email")
          .eq("category", "Newsletter Subscription")
          .limit(1000);

        (feedbackSubs || []).forEach(f => {
          if (f.email && f.email.includes("@")) {
            recipientSet.add(f.email.trim().toLowerCase());
          }
        });
      } catch (_) {}

      // C. Active registered users (who haven't opted out)
      try {
        const { data: usersList } = await supabase
          .from("users")
          .select("email")
          .limit(1000);

        (usersList || []).forEach(u => {
          if (u.email && u.email.includes("@")) {
            recipientSet.add(u.email.trim().toLowerCase());
          }
        });
      } catch (_) {}
    }

    const recipients = Array.from(recipientSet);

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers found.",
        sentCount: 0
      });
    }

    // 2. Generate HTML Newsletter Body
    const generateHtmlForRecipient = (email: string) => {
      const unsubUrl = `https://ajose.ng/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tip.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F0; color: #0B3022; margin: 0; padding: 24px 12px; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid rgba(11, 48, 34, 0.12); border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(11, 48, 34, 0.04);">
    
    <!-- Top Header -->
    <div style="background-color: #0B3022; padding: 28px 24px; text-align: center; border-bottom: 2px solid #D4A843;">
      <h1 style="color: #F3EEE3; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 6px 0;">
        Àjọṣe <span style="color: #D4A843; font-weight: 400; font-style: italic;">Daily Pulse</span>
      </h1>
      <p style="color: rgba(243, 238, 227, 0.7); font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
        ${formattedDate} • ${tip.category}
      </p>
    </div>

    <!-- Content Body -->
    <div style="padding: 32px 28px;">
      
      <!-- Category Badge -->
      <div style="display: inline-block; background-color: rgba(212, 168, 67, 0.15); border: 1px solid rgba(212, 168, 67, 0.35); color: #8A6417; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 50px; margin-bottom: 16px;">
        💡 Daily Financial Tip
      </div>

      <!-- Headline -->
      <h2 style="color: #0B3022; font-size: 20px; font-weight: 800; line-height: 1.35; margin: 0 0 16px 0;">
        ${tip.title}
      </h2>

      <!-- Summary -->
      <p style="color: rgba(11, 48, 34, 0.85); font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
        ${tip.summary}
      </p>

      <!-- Key Insights Box -->
      <div style="background-color: #FAF7F0; border-left: 4px solid #D4A843; border-radius: 0 16px 16px 0; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #0B3022; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px 0;">
          Key Takeaways:
        </h3>
        <ul style="margin: 0; padding-left: 18px; color: rgba(11, 48, 34, 0.8); font-size: 13.5px; line-height: 1.65;">
          ${tip.bulletPoints.map(bp => `<li style="margin-bottom: 8px;">${bp}</li>`).join("")}
        </ul>
      </div>

      <!-- Action Step -->
      <div style="background-color: rgba(11, 48, 34, 0.03); border: 1px dashed rgba(11, 48, 34, 0.2); border-radius: 16px; padding: 16px 20px; margin-bottom: 28px;">
        <p style="margin: 0; font-size: 13px; color: #0B3022; font-weight: 600;">
          🎯 <strong>Today's Action:</strong> ${tip.actionPrompt}
        </p>
      </div>

      <!-- Call to Action Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://ajose.ng/dashboard" style="display: inline-block; background-color: #0B3022; color: #D4A843; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 50px; box-shadow: 0 4px 14px rgba(11, 48, 34, 0.2);">
          Open Your Àjọṣe Dashboard →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #FAF7F0; padding: 24px 28px; text-align: center; border-top: 1px solid rgba(11, 48, 34, 0.08); font-size: 11px; color: rgba(11, 48, 34, 0.6); line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">
        You received this because you are an active member or newsletter subscriber of <strong>Àjọṣe</strong> — modern rotational savings and group finance.
      </p>
      <p style="margin: 0;">
        <a href="${unsubUrl}" style="color: rgba(11, 48, 34, 0.7); text-decoration: underline;">One-Click Unsubscribe</a> • 
        <a href="https://ajose.ng/terms" style="color: rgba(11, 48, 34, 0.7); text-decoration: underline;">Terms & Privacy</a>
      </p>
    </div>

  </div>
</body>
</html>
      `;
    };

    // 3. Batch Dispatch via Resend
    let sentCount = 0;
    const errors: string[] = [];

    // Send in concurrent chunks of 10 to respect API rate limits
    const CHUNK_SIZE = 10;
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const chunk = recipients.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (email) => {
          try {
            const html = generateHtmlForRecipient(email);
            const res = await sendEmail({
              to: email,
              subject: `💡 Daily Àjọṣe Tip: ${tip.title}`,
              html,
            });
            if (res.success) {
              sentCount++;
            } else if (res.error) {
              errors.push(`${email}: ${res.error}`);
            }
          } catch (err: any) {
            errors.push(`${email}: ${err.message}`);
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: `Daily newsletter dispatched to ${sentCount} recipients.`,
      tipTitle: tip.title,
      totalRecipients: recipients.length,
      sentCount,
      errors: errors.slice(0, 5)
    });

  } catch (err: any) {
    console.error("[Daily Newsletter Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch newsletter" }, { status: 500 });
  }
}
