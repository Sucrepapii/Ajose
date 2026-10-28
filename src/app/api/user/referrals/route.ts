import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getReferralSummary } from "@/utils/referralTiers";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/referrals
 * Returns user's referral tier, active count, referral code/link, and referred friends checklist
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const summary = await getReferralSummary(adminClient, user.id);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error("Referrals GET API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load referral summary" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/referrals
 * Allows linking a referral code to an existing account
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const adminClient = createAdminClient();

    // Find referrer by referral_code
    const { data: referrer } = await adminClient
      .from("users")
      .select("id, first_name")
      .ilike("referral_code", cleanCode)
      .maybeSingle();

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code." }, { status: 404 });
    }

    if (referrer.id === user.id) {
      return NextResponse.json({ error: "You cannot refer yourself." }, { status: 400 });
    }

    // Link in users table
    await adminClient
      .from("users")
      .update({ referred_by: referrer.id })
      .eq("id", user.id);

    // Also attempt insert into referrals table
    try {
      await adminClient.from("referrals").upsert({
        referrer_id: referrer.id,
        referred_user_id: user.id,
        referral_code: cleanCode,
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Referral code applied! You were referred by ${referrer.first_name || "a member"}.`,
    });
  } catch (error: any) {
    console.error("Referrals POST API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to apply referral code" },
      { status: 500 }
    );
  }
}
