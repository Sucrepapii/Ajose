import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getClientIp } from "@/utils/rateLimit";
import { consumeQuota, createQuotaExceededResponse } from "@/utils/quotaManager";
import { verifyCaptchaToken, createCaptchaErrorResponse } from "@/utils/captcha";

export const dynamic = "force-dynamic";

// Cost Control: 15-minute BVN lookup session cache
// If user restarts within 15 minutes, reuses existing session ID rather than paying Mono again
interface BvnSessionCache {
  sessionId: string;
  methods: any[];
  message: string;
  timestamp: number;
}
const bvnLookupCache = new Map<string, BvnSessionCache>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [bvn, record] of bvnLookupCache.entries()) {
      if (now - record.timestamp > 900_000) { // 15 mins
        bvnLookupCache.delete(bvn);
      }
    }
  }, 120_000).unref?.();
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const { bvn, captchaToken } = body;

    const token = captchaToken || req.headers.get("x-captcha-token");

    // 1. CAPTCHA & Anti-Bot Verification
    const captchaCheck = verifyCaptchaToken(token, clientIp);
    if (!captchaCheck.valid) {
      return createCaptchaErrorResponse(captchaCheck.reason);
    }

    if (!bvn || !/^\d{11}$/.test(bvn)) {
      return NextResponse.json({ error: "BVN must be exactly 11 digits." }, { status: 400 });
    }

    // 2. Usage Quota Check (Max 5 BVN lookups per IP per 24 hours)
    const quotaResult = consumeQuota("BVN_LOOKUP", clientIp);
    if (!quotaResult.allowed) {
      return createQuotaExceededResponse(quotaResult);
    }

    // 3. Cost Control: Database Pre-Flight Verification Check
    // If the BVN is already verified in Àjọṣe users database, skip paid external API call
    const supabase = createAdminClient();
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, bvn_verified, first_name, last_name")
      .eq("bvn", bvn)
      .maybeSingle();

    if (existingUser && existingUser.bvn_verified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "BVN is already verified for this user profile.",
      });
    }

    // 4. Cost Control: 15-minute In-Memory Session Cache
    const cached = bvnLookupCache.get(bvn);
    if (cached && Date.now() - cached.timestamp < 900_000) {
      return NextResponse.json({
        success: true,
        sessionId: cached.sessionId,
        methods: cached.methods,
        message: cached.message,
        cached: true,
      });
    }

    const monoSecretKey = process.env.MONO_LOOKUP_SECRET_KEY || process.env.MONO_SECRET_KEY;
    if (!monoSecretKey) {
      return NextResponse.json({ error: "Mono configuration error." }, { status: 500 });
    }

    // 5. Call Live Mono v2 Identity Lookup API
    const response = await fetch("https://api.withmono.com/v2/lookup/bvn/initiate", {
      method: "POST",
      headers: {
        "mono-sec-key": monoSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bvn, scope: "identity" }),
    });

    const data = await response.json();

    if (response.ok && data.status === "successful") {
      const sessionId = data.data.session_id;
      const methods = data.data.methods;
      const message = data.message;

      // Cache session for 15 minutes to prevent re-billing
      bvnLookupCache.set(bvn, {
        sessionId,
        methods,
        message,
        timestamp: Date.now(),
      });

      return NextResponse.json({
        success: true,
        sessionId,
        methods,
        message,
      });
    }

    return NextResponse.json(
      { error: data.message || "Failed to initiate BVN lookup." },
      { status: response.status === 200 ? 400 : response.status }
    );
  } catch (err: any) {
    console.error("BVN Initiate Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
