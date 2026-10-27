import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getClientIp } from "@/utils/rateLimit";
import { consumeQuota, createQuotaExceededResponse } from "@/utils/quotaManager";
import { verifyCaptchaToken, createCaptchaErrorResponse } from "@/utils/captcha";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const { email, platform = "all", source = "marketing_mobile_showcase", captchaToken } = body;

    const token = captchaToken || req.headers.get("x-captcha-token");

    // 1. CAPTCHA Verification
    const captchaCheck = verifyCaptchaToken(token, clientIp);
    if (!captchaCheck.valid) {
      return createCaptchaErrorResponse(captchaCheck.reason);
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    // 2. Usage Quota Check (Max 5 / day)
    const quota = consumeQuota("PUBLIC_LEAD_SUBMISSION", clientIp);
    if (!quota.allowed) {
      return createQuotaExceededResponse(quota);
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const supabase = createAdminClient();
      await supabase.from("waitlist").insert({
        email: cleanEmail,
        platform,
        source,
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.log(`[Mobile App Waitlist Entry] Email: ${cleanEmail}, Platform: ${platform}, Time: ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: "You have been added to the early beta access list!",
    });
  } catch (error: any) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
