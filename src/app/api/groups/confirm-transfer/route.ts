import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transactionId, action, groupId, currentTurn, memberUserId, amount, memberName } = body;

    if (!transactionId || !action) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    if (action === "confirm") {
      // 1. Update this transaction status to 'successful'
      const { error: updateError } = await supabaseAdmin
        .from("transactions")
        .update({ status: "successful" })
        .eq("id", transactionId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 2. Clear any prior failed debit transaction for this turn and member
      if (groupId && memberUserId) {
        const { data: memberRecord } = await supabaseAdmin
          .from("memberships")
          .select("id")
          .eq("group_id", groupId)
          .eq("user_id", memberUserId)
          .single();

        if (memberRecord) {
          await supabaseAdmin
            .from("transactions")
            .delete()
            .eq("membership_id", memberRecord.id)
            .eq("cycle_turn", Number(currentTurn))
            .eq("status", "failed");
        }
      }

      // 3. Restore credit score penalty (+10)
      if (memberUserId) {
        const { data: profile } = await supabaseAdmin
          .from("users")
          .select("credit_score")
          .eq("id", memberUserId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("users")
            .update({ credit_score: (profile.credit_score ?? 50) + 10 })
            .eq("id", memberUserId);
        }

        // 4. Send in-app notification to member
        await supabaseAdmin.from("notifications").insert({
          user_id: memberUserId,
          title: "Manual Transfer Confirmed!",
          message: `Your manual contribution of ₦${Number(amount || 0).toLocaleString()} for Turn ${currentTurn} was verified and confirmed by the Admin. Credit score penalty restored!`,
          type: "success"
        });
      }

      return NextResponse.json({
        success: true,
        message: `Contribution confirmed for ${memberName || 'member'}! Turn ledger updated.`
      });
    }

    if (action === "reject") {
      // 1. Mark transaction as failed
      const { error: updateError } = await supabaseAdmin
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", transactionId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 2. Notify member
      if (memberUserId) {
        await supabaseAdmin.from("notifications").insert({
          user_id: memberUserId,
          title: "Transfer Not Received",
          message: `The Group Admin could not verify your transfer of ₦${Number(amount || 0).toLocaleString()} for Turn ${currentTurn}. Please verify with your bank and retry.`,
          type: "error"
        });
      }

      return NextResponse.json({
        success: true,
        message: `Transfer marked as unverified/rejected.`
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  } catch (error: any) {
    console.error("Confirm transfer error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process transfer review" },
      { status: 500 }
    );
  }
}
