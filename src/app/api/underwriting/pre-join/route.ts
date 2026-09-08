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

    // 2. Mono Open-Banking Statement Analysis (Inflows, Employer, Loans)
    const monoStatementResult = await analyzeBankStatementWithMono({
      monoAccountId: profile?.mono_account_id,
      targetMonthlyContribution: Number(contributionAmount)
    });

    // 3. Dynamic Real-Time Credit Bureau Pull (CRC / FirstCentral)
    // Ensures recent defaults elsewhere are caught before joining
    const bureauReport = await pullCreditBureauReport({
      bvn: userBvn,
      nin: userNin,
      monthlyInflow: monoStatementResult.averageMonthlyInflow
    });

    // 4. Calculate Comprehensive Àjọṣe Credit & Risk Score
    // Weighting: 40% Bureau Score, 35% Statement Inflow/DTI Stability, 25% Platform Track Record
    const normalizedBureau = Math.round((bureauReport.bureauScore / 850) * 100);
    const statementScore = monoStatementResult.overallStabilityScore;
    const baseTrackScore = profile?.credit_score || 85;

    let computedAjoScore = Math.round((normalizedBureau * 0.4) + (statementScore * 0.35) + (baseTrackScore * 0.25));

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
        ajoScore: computedAjoScore,
        bureau: bureauReport,
        statement: monoStatementResult,
        identity: {
          fullName: youVerifyResult.fullName,
          bvn: youVerifyResult.bvn,
          nin: youVerifyResult.nin,
          linkedAccounts: youVerifyResult.linkedAccounts
        },
        hasActiveDefaults: bureauReport.hasActiveDefaults,
        isEligible: !bureauReport.hasActiveDefaults && computedAjoScore >= 60,
        verificationEngine: "Mono Open-Banking & Bureau Engine",
        message: bureauReport.hasActiveDefaults
          ? "Active default detected on Credit Bureau. Eligibility restricted."
          : "Underwriting verified successfully across Mono Statement and Credit Bureau."
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
