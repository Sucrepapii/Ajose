import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getClientIp } from "@/utils/rateLimit";
import { consumeQuota, createQuotaExceededResponse } from "@/utils/quotaManager";
import { verifyCaptchaToken, createCaptchaErrorResponse } from "@/utils/captcha";

export const dynamic = "force-dynamic";

// Cost Control: 8-minute BVN lookup session cache
// Aligns with Mono's 10-minute session TTL to prevent expired session errors
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
      if (now - record.timestamp > 480_000) { // 8 mins
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

    // Check if request is from an authenticated user session
    let authUser: any = null;
    try {
      const supabaseUser = await createClient();
      const { data: { user } } = await supabaseUser.auth.getUser();
      if (user) authUser = user;
    } catch (_) {}

    // 1. CAPTCHA & Anti-Bot Verification (enforced for public unauthenticated requests)
    if (!authUser) {
      const captchaCheck = verifyCaptchaToken(token, clientIp);
      if (!captchaCheck.valid) {
        return createCaptchaErrorResponse(captchaCheck.reason);
      }
    }

    if (!bvn || !/^\d{11}$/.test(bvn)) {
      return NextResponse.json({ error: "BVN must be exactly 11 digits." }, { status: 400 });
    }

    // 2. Usage Quota Check (Max 5 BVN lookups per BVN/User per 24 hours)
    // Keying by user ID or BVN ensures distinct mobile users on shared cellular IPs are NOT blocked
    const quotaKey = authUser?.id ? `user:${authUser.id}` : `bvn:${bvn}`;
    const quotaResult = consumeQuota("BVN_LOOKUP", quotaKey);
    if (!quotaResult.allowed) {
      return createQuotaExceededResponse(quotaResult);
    }

    // 3. Cost Control & Duplicate Check
    const supabase = createAdminClient();
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, bvn_verified, first_name, last_name")
      .eq("bvn", bvn)
      .maybeSingle();

    if (existingUser && existingUser.bvn_verified) {
      if (authUser && existingUser.id === authUser.id) {
        return NextResponse.json({
          success: true,
          alreadyVerified: true,
          message: "BVN is already verified for your account.",
        });
      } else if (!authUser || existingUser.id !== authUser.id) {
        return NextResponse.json({
          error: "This BVN is already registered to another Àjọṣe account. If you believe this is in error, please contact support.",
        }, { status: 400 });
      }
    }

    // 4. Cost Control: 8-minute In-Memory Session Cache
    const cached = bvnLookupCache.get(bvn);
    if (cached && Date.now() - cached.timestamp < 480_000) {
      return NextResponse.json({
        success: true,
        sessionId: cached.sessionId,
        methods: cached.methods,
        message: cached.message,
        cached: true,
      });
    }

    const monoSecretKey =
      process.env.LIVE_MONO_LOOKUP_SECRET_KEY ||
      process.env.LIVE_MONO_SECRET_KEY ||
      process.env.MONO_LOOKUP_SECRET_KEY ||
      process.env.MONO_SECRET_KEY;

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
      const methods = data.data.methods || [];
      const message = data.message || "Session initiated successfully.";

      // Cache session for 8 minutes to prevent re-billing
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
