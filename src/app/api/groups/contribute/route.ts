import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/utils/resend";
import { getContributionReceiptEmailTemplate } from "@/utils/emailTemplates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupId, userId, amount, currentTurn, simulateFailure, method } = body;

    if (!groupId || !userId || !amount) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Locate membership for this user in the circle
    const { data: memberRecord, error: memError } = await supabaseAdmin
      .from("memberships")
      .select("id, user_id, group_id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single();

    if (memError || !memberRecord) {
      return NextResponse.json({ error: "Circle membership not found." }, { status: 404 });
    }

    // 2. Fetch Circle & Admin details
    const { data: group } = await supabaseAdmin
      .from("groups")
      .select("name, admin_id")
      .eq("id", groupId)
      .single();

    // Case A: Simulated Failure
    if (simulateFailure) {
      await supabaseAdmin.from("transactions").insert({
        membership_id: memberRecord.id,
        amount: Number(amount),
        type: "contribution",
        status: "failed",
        cycle_turn: Number(currentTurn)
      });

      // Penalize credit score by 10
      const { data: profile } = await supabaseAdmin
        .from("users")
        .select("credit_score")
        .eq("id", userId)
        .single();

      if (profile) {
        await supabaseAdmin
          .from("users")
          .update({ credit_score: Math.max(0, (profile.credit_score ?? 50) - 10) })
          .eq("id", userId);
      }

      // Notify admin
      if (group?.admin_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: group.admin_id,
          title: "Member Auto-Debit Failed",
          message: `A member's automated debit sweep of ₦${Number(amount).toLocaleString()} failed for Turn ${currentTurn} in ${group.name || "Ajo"}.`,
          type: "error"
        });
      }

      return NextResponse.json({
        success: true,
        failed: true,
        message: "Auto-debit sweep was declined."
      });
    }

    // Case B: Manual Bank Transfer Submission (Pending confirmation)
    if (method === "transfer") {
      const { data: tx, error: txError } = await supabaseAdmin
        .from("transactions")
        .insert({
          membership_id: memberRecord.id,
          amount: Number(amount),
          type: "contribution",
          status: "pending",
          cycle_turn: Number(currentTurn)
        })
        .select()
        .single();

      if (txError) {
        throw new Error(txError.message);
      }

      // Notify admin of manual transfer
      if (group?.admin_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: group.admin_id,
          title: "Manual Transfer Submitted",
          message: `A member reported a manual bank transfer of ₦${Number(amount).toLocaleString()} for Turn ${currentTurn} in ${group.name || "Ajo"}. Review and confirmation ready.`,
          type: "info"
        });
      }

      return NextResponse.json({
        success: true,
        status: "pending",
        transactionId: tx?.id,
        message: "Manual transfer submitted for Admin review."
      });
    }

    // Case C: Successful Auto-Debit / Instant Payment
    const { data: tx, error: txError } = await supabaseAdmin
      .from("transactions")
      .insert({
        membership_id: memberRecord.id,
        amount: Number(amount),
        type: "contribution",
        status: "successful",
        cycle_turn: Number(currentTurn)
      })
      .select()
      .single();

    if (txError) {
      throw new Error(txError.message);
    }

    // Boost credit score by 5
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("credit_score, first_name, last_name, email")
      .eq("id", userId)
      .single();

    if (profile) {
      await supabaseAdmin
        .from("users")
        .update({ credit_score: (profile.credit_score ?? 50) + 5 })
        .eq("id", userId);

      // Send contribution receipt email if email is present
      if (profile.email) {
        try {
          await sendEmail({
            to: profile.email,
            subject: `Contribution Payment Receipt - ₦${Number(amount).toLocaleString()}`,
            html: getContributionReceiptEmailTemplate({
              userName: profile.first_name || "Member",
              groupName: group?.name || "Àjọ Circle",
              amount: Number(amount),
              reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
              date: new Date().toLocaleString(),
            }),
          });
        } catch (emailErr) {
          console.warn("Could not dispatch contribution receipt email:", emailErr);
        }
      }
    }

    // Notify Admin
    if (group?.admin_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: group.admin_id,
        title: "New Contribution Received",
        message: `Auto-debit sweep succeeded: ₦${Number(amount).toLocaleString()} deposited for Turn ${currentTurn} in ${group?.name || "Ajo"}.`,
        type: "success"
      });
    }

    return NextResponse.json({
      success: true,
      status: "successful",
      transactionId: tx?.id,
      message: "Contribution successfully recorded."
    });

  } catch (error: any) {
    console.error("Contribute error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process contribution" },
      { status: 500 }
    );
  }
}
