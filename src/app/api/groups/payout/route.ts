import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { initiatePayoutWithMono, getBankCode } from "@/utils/mono";

export async function POST(req: Request) {
  try {
    const { groupId, currentTurn } = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    // 1. Authenticate user
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Fetch group
    const { data: group, error: groupErr } = await supabaseAdmin
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupErr || !group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // 3. Verify Admin authority
    const { data: adminMembership } = await supabaseAdmin
      .from("memberships")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = adminMembership?.role === "admin" || group.admin_id === user.id;
    if (!isAdmin) {
      return NextResponse.json({ error: "Only the group Admin trustee can disburse payouts." }, { status: 403 });
    }

    // 4. Determine the actual next unpaid turn based on recorded transactions
    const { data: groupMembers } = await supabaseAdmin
      .from("memberships")
      .select("id, payout_turn")
      .eq("group_id", groupId);

    const memberIds = (groupMembers || []).map((m: any) => m.id);
    const { data: existingPayouts } = memberIds.length > 0
      ? await supabaseAdmin
          .from("transactions")
          .select("cycle_turn")
          .in("membership_id", memberIds)
          .eq("type", "payout")
          .eq("status", "successful")
      : { data: [] };

    const paidTurns = new Set((existingPayouts || []).map((t: any) => t.cycle_turn));
    const highestPaidTurn = paidTurns.size > 0 ? Math.max(...Array.from(paidTurns)) : 0;

    // The turn to disburse MUST be the next unpaid turn
    const turn = currentTurn && currentTurn > highestPaidTurn 
      ? currentTurn 
      : (highestPaidTurn + 1);

    // 5. Find the turn collector
    const { data: receivingMembership } = await supabaseAdmin
      .from("memberships")
      .select("*, users(*)")
      .eq("group_id", groupId)
      .eq("payout_turn", turn)
      .maybeSingle();

    if (!receivingMembership || !receivingMembership.users) {
      return NextResponse.json({ error: `No registered member found assigned to Turn ${turn}.` }, { status: 404 });
    }

    const receiverUser = receivingMembership.users;
    const receiverName = `${receiverUser.first_name || ""} ${receiverUser.last_name || ""}`.trim() || receiverUser.nickname || `Member #${turn}`;

    // 5. Calculate payout amounts (Standard Plan: 2% platform fee capped at ₦15,000 max)
    const totalPool = (group.contribution_amount || 50000) * (group.max_members || 1);
    const adminCommissionPct = group.admin_commission_pct || 0;
    const adminFee = Math.round((adminCommissionPct / 100) * totalPool);
    const platformFee = Math.min(15000, Math.round((2 / 100) * totalPool));
    const netPayoutAmount = Math.max(0, totalPool - adminFee - platformFee);

    if (!receiverUser.account_number) {
      return NextResponse.json({ 
        error: `Turn recipient (${receiverName}) has not connected a verified bank account. Payout cannot be disbursed until they link their account.` 
      }, { status: 400 });
    }

    // 6. Execute disbursement via Mono Payout API
    const payoutRef = `ajose_payout_${groupId}_turn${turn}_${receiverUser.id}_${Date.now()}`;
    const monoResult = await initiatePayoutWithMono({
      recipientAccountNumber: receiverUser.account_number,
      recipientBankCode: getBankCode(receiverUser.bank_name),
      amount: netPayoutAmount,
      narration: `Àjọṣe Turn ${turn} Payout (${group.name})`,
      reference: payoutRef
    });

    if (!monoResult.success) {
      return NextResponse.json({ error: `Mono Payout failed: ${monoResult.message}` }, { status: 502 });
    }

    // 7. Advance group turn in DB if column exists
    const nextTurn = turn + 1;
    const isCompleted = nextTurn > (group.max_members || 1);
    try {
      await supabaseAdmin
        .from("groups")
        .update({
          current_turn: nextTurn,
          ...(isCompleted ? { status: "completed" } : {})
        })
        .eq("id", groupId);
    } catch (_) {}

    // 8. Delete prior failed transactions for this turn
    try {
      await supabaseAdmin
        .from("transactions")
        .delete()
        .eq("membership_id", receivingMembership.id)
        .eq("cycle_turn", turn)
        .eq("status", "failed");
    } catch (_) {}

    // 9. Record Payout transaction in ledger (valid schema: membership_id, amount, type, status, cycle_turn)
    const { error: txInsertErr } = await supabaseAdmin.from("transactions").insert({
      membership_id: receivingMembership.id,
      amount: netPayoutAmount,
      type: "payout",
      status: "successful",
      cycle_turn: turn
    });

    if (txInsertErr) {
      console.warn("Could not insert payout transaction:", txInsertErr);
    }

    // 10. Notify receiving member (in-app)
    await supabaseAdmin.from("notifications").insert({
      user_id: receiverUser.id,
      title: `🎉 Payout Received! ₦${netPayoutAmount.toLocaleString()}`,
      message: `Your rotational payout for Turn ${turn} in ${group.name} was successfully disbursed to your bank account via Mono Payout.`,
      type: "success"
    });

    // 11. Dispatch Payout Notification Email via Resend
    if (receiverUser?.email) {
      try {
        const { sendEmail } = await import("@/utils/resend");
        const { getPayoutReceivedEmailTemplate } = await import("@/utils/emailTemplates");
        await sendEmail({
          to: receiverUser.email,
          subject: `Payout Received! ₦${netPayoutAmount.toLocaleString()} - ${group.name}`,
          html: getPayoutReceivedEmailTemplate({
            userName: receiverName,
            groupName: group.name,
            amount: netPayoutAmount,
            turnNumber: turn,
          }),
        });
      } catch (emailErr) {
        console.warn("Could not dispatch payout notification email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Turn ${turn} payout of ₦${netPayoutAmount.toLocaleString()} successfully disbursed via Mono to ${receiverName}!`,
      netPayoutAmount,
      nextTurn,
      reference: monoResult.reference,
      source: monoResult.source
    });

  } catch (err: any) {
    console.error("Payout route exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to process payout." }, { status: 500 });
  }
}
