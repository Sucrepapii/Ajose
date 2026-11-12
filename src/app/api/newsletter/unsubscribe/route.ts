import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * One-Click Unsubscribe Handler for Àjọṣe Daily Newsletter
 * Marks subscriber as unsubscribed across database records to ensure full compliance.
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return new NextResponse(renderHtml("Invalid request", "The unsubscribe link appears invalid or expired."), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 400
    });
  }

  try {
    const supabase = createAdminClient();

    // 1. Update waitlist table
    await supabase
      .from("waitlist")
      .update({ status: "unsubscribed" })
      .eq("email", email);

    // 2. Update users table metadata if registered member
    try {
      const { data: userProfile } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (userProfile) {
        await supabase.auth.admin.updateUserById(userProfile.id, {
          user_metadata: { newsletter_unsubscribed: true }
        });
      }
    } catch (_) {}

    return new NextResponse(
      renderHtml("You Have Been Unsubscribed", `We have removed <strong>${email}</strong> from the Àjọṣe Daily Financial Tips & Newsletter. You can resubscribe anytime from the website footer.`),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err: any) {
    return new NextResponse(
      renderHtml("Error Processing Request", "We encountered an issue processing your request. Please contact support@ajose.ng."),
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 500 }
    );
  }
}

function renderHtml(title: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | Àjọṣe</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF7F0; color: #0B3022; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
        .card { background: white; border: 1px solid rgba(11, 48, 34, 0.12); border-radius: 24px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 10px 30px rgba(11, 48, 34, 0.05); }
        .icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(212, 168, 67, 0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px; }
        h1 { font-size: 22px; font-weight: 800; color: #0B3022; margin-bottom: 12px; }
        p { font-size: 14px; line-height: 1.6; color: rgba(11, 48, 34, 0.75); margin-bottom: 24px; }
        a { display: inline-block; background: #0B3022; color: #D4A843; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 50px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">✉️</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="https://ajose.ng">Return to Àjọṣe</a>
      </div>
    </body>
    </html>
  `;
}
