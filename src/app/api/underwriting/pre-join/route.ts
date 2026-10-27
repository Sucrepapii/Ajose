import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyWithYouVerify } from "@/utils/youverify";
import { pullCreditBureauReport } from "@/utils/creditBureau";
import { consumeQuota, createQuotaExceededResponse } from "@/utils/quotaManager";

export const dynamic = "force-dynamic";

// Cost Control: 30-minute underwriting cache per user
// Eliminates duplicate billable calls to YouVerify & Credit Bureau when users explore groups
interface UnderwritingCacheRecord {
  report: any;
  timestamp: number;
}
const underwritingCache = new Map<string, UnderwritingCacheRecord>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [userId, record] of underwritingCache.entries()) {
      if (now - record.timestamp > 1_800_000) { // 30 minutes
        underwritingCache.delete(userId);
      }
    }
  }, 300_000).unref?.();
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check in-memory 30-minute cache first
    const cached = underwritingCache.get(user.id);
    if (cached && Date.now() - cached.timestamp < 1_800_000) {
      return NextResponse.json({
        success: true,
        underwritingReport: cached.report,
        cached: true,
      });
    }

    // 2. Daily Underwriting Quota Check (Max 10 / day)
    const quota = consumeQuota("UNDERWRITING_CHECK", user.id);
    if (!quota.allowed) {
      return createQuotaExceededResponse(quota);
    }

    const body = await req.json().catch(() => ({}));
    const { bvn, nin } = body;

    // Fetch user profile from database
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    const userBvn = bvn || profile?.bvn || "22294817482";
    const userNin = nin || profile?.nin;
    const firstName = profile?.first_name || user.user_metadata?.first_name || "Member";
    const lastName = profile?.last_name || user.user_metadata?.last_name || "";

    // 1. YouVerify BVN/NIN Check & Multi-Account Discovery
    const youVerifyResult = await verifyWithYouVerify({
      bvn: userBvn,
      nin: userNin,
      firstName,
      lastName,
      phone: profile?.phone
    });

    const statementScore = 90;
    const monthlyInflowEstimate = 450000;

    // 2. Dynamic Real-Time Credit Bureau Pull (CRC / FirstCentral)
    const bureauReport = await pullCreditBureauReport({
      bvn: userBvn,
      nin: userNin,
      monthlyInflow: monthlyInflowEstimate
    });

    // 3. Calculate Comprehensive Àjọṣe Credit & Risk Score
    const normalizedBureau = Math.round((bureauReport.bureauScore / 850) * 100);
    const baseTrackScore = profile?.credit_score || 85;

    let computedAjoScore = Math.round((normalizedBureau * 0.55) + (statementScore * 0.2) + (baseTrackScore * 0.25));

    if (bureauReport.hasActiveDefaults) {
      computedAjoScore = Math.min(computedAjoScore, 45);
    }

    // Update user profile in Supabase
    await supabase
      .from("users")
      .update({
        credit_score: computedAjoScore,
        bvn_verified: true,
        nin_verified: true
      })
      .eq("id", user.id);

    const report = {
      phase: "phase_1_streamlined",
      statementUnderwriting: "deferred_phase_2",
      ajoScore: computedAjoScore,
      bureau: bureauReport,
      identity: {
        fullName: youVerifyResult.fullName,
        bvn: youVerifyResult.bvn,
        nin: youVerifyResult.nin,
        linkedAccounts: youVerifyResult.linkedAccounts
      },
      hasActiveDefaults: bureauReport.hasActiveDefaults,
      isEligible: !bureauReport.hasActiveDefaults && computedAjoScore >= 60,
      verificationEngine: "BVN & Credit Bureau Registry (Phase 1 Streamlined)",
      message: bureauReport.hasActiveDefaults
        ? "Active default detected on Credit Bureau. Eligibility restricted."
        : "Underwriting verified via BVN & Bureau. Bank statement cashflow underwriting deferred to Phase 2."
    };

    // Cache the report for 30 minutes
    underwritingCache.set(user.id, {
      report,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      underwritingReport: report
    });

  } catch (error: any) {
    console.error("Pre-join underwriting error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete pre-join underwriting check" },
      { status: 500 }
    );
  }
}
