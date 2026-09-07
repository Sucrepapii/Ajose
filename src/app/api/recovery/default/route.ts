import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertDefaultToCdlLoan } from "@/utils/recovery";
import { reportMemberDefaultToBureaus } from "@/utils/creditBureau";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      groupId, 
      defaultedMemberId, 
      cycleTurn, 
      amount, 
      daysOverdue = 3, 
      reason = "Automated Direct Debit Failure & Non-Response" 
    } = body;

    if (!groupId || !defaultedMemberId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch defaulting member profile
    const { data: memberProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", defaultedMemberId)
      .single();

    const memberName = memberProfile 
      ? `${memberProfile.first_name || "Member"} ${memberProfile.last_name || ""}`.trim()
      : "Defaulting Member";
    const memberBvn = memberProfile?.bvn || "22284910391";

    // 1. Convert defaulted contribution to Credit Direct Limited (CDL) loan
    // Applies approved 5% flat late fee + 2.5% monthly penal interest
    const cdlLoanRecord = await convertDefaultToCdlLoan({
      memberId: defaultedMemberId,
      memberName,
      bvn: memberBvn,
      groupId,
      defaultedTurn: Number(cycleTurn || 1),
      defaultAmount: Number(amount),
      daysOverdue: Number(daysOverdue)
    });

    // 2. Report default to licensed Credit Bureaus (CRC, FirstCentral, CreditRegistry)
    const bureauReportResult = await reportMemberDefaultToBureaus({
      bvn: memberBvn,
      memberName,
      groupId,
      defaultedAmount: Number(amount),
      daysOverdue: Number(daysOverdue),
      reason
    });

    // 3. Deduct credit score penalty on the defaulting user profile
    const newScore = Math.max(30, (memberProfile?.credit_score || 80) - 50);
    await supabase
      .from("users")
      .update({
        credit_score: newScore,
        auto_sweep_enabled: false
      })
      .eq("id", defaultedMemberId);

    // 4. Record transaction in ledger indicating CDL covered the turn
    await supabase
      .from("transactions")
      .insert({
        group_id: groupId,
        user_id: defaultedMemberId,
        amount: Number(amount),
        type: "contribution",
        status: "completed",
        description: `Turn ${cycleTurn} covered by Credit Direct Limited (CDL Loan: ${cdlLoanRecord.cdlLoanId}) | Recovering @ 5% flat fee + 2.5%/mo penal interest`
      });

    return NextResponse.json({
      success: true,
      cdlLoan: cdlLoanRecord,
      bureauReport: bureauReportResult,
      updatedCreditScore: newScore,
      message: `Default of ₦${amount.toLocaleString()} successfully restructured into Credit Direct Limited (CDL) loan and reported to Credit Bureaus.`
    });

  } catch (error: any) {
    console.error("Default recovery & CDL conversion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process default recovery" },
      { status: 500 }
    );
  }
}
