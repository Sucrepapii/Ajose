import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getReferralSummary } from "@/utils/referralTiers";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/referrals
 * Returns user's referral tier, active count, referral code/link, and referred friends checklist
 */
export async function GET(_req: NextRequest) {
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
    const { data: referrer, error: referrerErr } = await adminClient
      .from("users")
      .select("id, first_name")
      .ilike("referral_code", cleanCode)
      .maybeSingle();

    if (referrerErr) {
      if (referrerErr.code === "42703") {
        return NextResponse.json(
          { error: "Referral system database migration is pending in Supabase. Please run the SQL migration." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: referrerErr.message }, { status: 500 });
    }

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code." }, { status: 404 });
    }

    if (referrer.id === user.id) {
      return NextResponse.json({ error: "You cannot refer yourself." }, { status: 400 });
    }

    // Link in users table
    const { error: linkErr } = await adminClient
      .from("users")
      .update({ referred_by: referrer.id })
      .eq("id", user.id);

    if (linkErr) {
      if (linkErr.code === "42703") {
        return NextResponse.json(
          { error: "Referral system database migration is pending in Supabase. Please run the SQL migration." },
          { status: 503 }
        );
      }
    }

    // Also attempt insert into referrals table
    try {
      await adminClient.from("referrals").upsert({
        referrer_id: referrer.id,
        referred_user_id: user.id,
        referral_code: cleanCode,
      });
    } catch {}

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

/**
 * PATCH /api/user/referrals
 * Allows a user to customize their referral code to their name or handle
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "A referral code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");

    if (cleanCode.length < 3 || cleanCode.length > 25) {
      return NextResponse.json(
        { error: "Referral code must be between 3 and 25 letters or numbers." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check if another user already has this code
    const { data: existing, error: checkErr } = await adminClient
      .from("users")
      .select("id, first_name")
      .ilike("referral_code", cleanCode)
      .maybeSingle();

    if (checkErr && checkErr.code === "42703") {
      return NextResponse.json(
        { error: "The referral system database migration has not been applied to Supabase yet. Please execute the SQL migration in your Supabase dashboard." },
        { status: 503 }
      );
    }

    if (existing && existing.id !== user.id) {
      return NextResponse.json(
        { error: `The code "${cleanCode}" is already taken by another member. Try another variation!` },
        { status: 409 }
      );
    }

    // Update users table
    const { error: updateErr } = await adminClient
      .from("users")
      .update({ referral_code: cleanCode })
      .eq("id", user.id);

    if (updateErr) {
      if (updateErr.code === "42703") {
        return NextResponse.json(
          { error: "The referral system database migration has not been applied to Supabase yet. Please execute the SQL migration in your Supabase dashboard." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: updateErr.message || "Failed to update referral code" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ajose.ng";
    const newLink = `${baseUrl}/signup?ref=${encodeURIComponent(cleanCode)}`;

    return NextResponse.json({
      success: true,
      message: `Your referral code has been updated to "${cleanCode}"!`,
      referralCode: cleanCode,
      referralLink: newLink,
    });
  } catch (error: any) {
    console.error("Referrals PATCH API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to customize referral code" },
      { status: 500 }
    );
  }
}

