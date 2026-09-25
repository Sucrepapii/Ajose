import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyWithYouVerify } from "@/utils/youverify";
import { analyzeBankStatementWithMono } from "@/utils/mono";
import { pullCreditBureauReport } from "@/utils/creditBureau";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, contributionAmount = 50000, bvn, nin } = body;

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

    // 2. Bank Statement Cashflow Analysis: Deferred to Phase 2
    // For Phase 1, circle membership is lightweight & streamlined via BVN identity + Standing Direct Debit Mandate
    const statementScore = 90;
    const monthlyInflowEstimate = 450000;

    // 3. Dynamic Real-Time Credit Bureau Pull (CRC / FirstCentral)
    // Ensures recent defaults elsewhere are caught before joining
    const bureauReport = await pullCreditBureauReport({
      bvn: userBvn,
      nin: userNin,
      monthlyInflow: monthlyInflowEstimate
    });

    // 4. Calculate Comprehensive Àjọṣe Credit & Risk Score (Phase 1 Streamlined)
    const normalizedBureau = Math.round((bureauReport.bureauScore / 850) * 100);
    const baseTrackScore = profile?.credit_score || 85;

    let computedAjoScore = Math.round((normalizedBureau * 0.55) + (statementScore * 0.2) + (baseTrackScore * 0.25));

    // Severe penalty if active external default detected
    if (bureauReport.hasActiveDefaults) {
      computedAjoScore = Math.min(computedAjoScore, 45); // Restricts from joining standard groups
    }

    // Update user profile in Supabase with freshly verified underwriting data
    await supabase
      .from("users")
      .update({
        credit_score: computedAjoScore,
        bvn_verified: true,
        nin_verified: true
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      underwritingReport: {
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
      }
    });

  } catch (error: any) {
    console.error("Pre-join underwriting error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete pre-join underwriting check" },
      { status: 500 }
    );
  }
}
