import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { initiatePayoutWithMono, getBankCode } from "@/utils/mono";

export async function POST(req: Request) {
  try {
    const { groupId, currentTurn, method } = await req.json();

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
          .select("cycle_turn, status")
          .in("membership_id", memberIds)
          .eq("type", "payout")
      : { data: [] };

    const paidTurns = new Set(
      (existingPayouts || [])
        .filter((t: any) => t.status === "successful")
        .map((t: any) => t.cycle_turn)
    );
    const highestPaidTurn = paidTurns.size > 0 ? Math.max(...Array.from(paidTurns)) : 0;

    // The turn to disburse MUST be the next unpaid turn
    const turn = currentTurn && currentTurn > highestPaidTurn 
      ? currentTurn 
      : (highestPaidTurn + 1);

    // Check if there is already a pending handshake payout for this turn
    const existingPending = (existingPayouts || []).find(
      (t: any) => t.cycle_turn === turn && t.status === "pending"
    );
    if (existingPending) {
      return NextResponse.json({
        error: `Turn ${turn} payout is already marked as transferred and is awaiting member confirmation handshake.`
      }, { status: 400 });
    }

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

    // 5b. Verify that all contributing members have been debited / paid before allowing disbursement
    const { data: activeContributingMembers } = await supabaseAdmin
      .from("memberships")
      .select("id, user_id, role, payout_turn, status")
      .eq("group_id", groupId)
      .eq("status", "active")
      .not("payout_turn", "is", null);

    const contributingMemberIds = (activeContributingMembers || []).map((m: any) => m.id);

    const { data: turnContributions, error: contribErr } = contributingMemberIds.length > 0
      ? await supabaseAdmin
          .from("transactions")
          .select("membership_id, status")
          .in("membership_id", contributingMemberIds)
          .eq("cycle_turn", turn)
          .eq("type", "contribution")
          .eq("status", "successful")
      : { data: [], error: null };

    if (contribErr) {
      console.warn("Notice checking turn contributions:", contribErr);
    }

    const paidMembershipIds = new Set((turnContributions || []).map((t: any) => t.membership_id));

    const unpaidContributors = (activeContributingMembers || []).filter(
      (m: any) => !paidMembershipIds.has(m.id)
    );

    if (unpaidContributors.length > 0) {
      return NextResponse.json({
        error: `Cannot disburse Turn ${turn} payout yet. ${unpaidContributors.length} contributing member(s) have not been debited for this turn.`
      }, { status: 400 });
    }

    // 6. Calculate payout amounts based on group frequency & admin volume tier:
    // Platform fee is ₦0 across all frequencies at payout time because platform charges 
    // are collected incrementally during auto-debit (Daily: ₦100, Weekly: ₦300, Monthly: 2% / custom rate),
    // ensuring the turn collector receives 100% of their savings pot complete!
    const totalPool = (group.contribution_amount || 50000) * (group.max_members || 1);
    const adminCommissionPct = group.admin_commission_pct || 0;
    const adminFee = Math.round((adminCommissionPct / 100) * totalPool);
    const platformFee = 0;
    const netPayoutAmount = Math.max(0, totalPool - adminFee - platformFee);

    if (!receiverUser.account_number && method !== "manual_bank_transfer") {
      return NextResponse.json({ 
        error: `Turn recipient (${receiverName}) has not connected a verified bank account. Payout cannot be disbursed until they link their account.` 
      }, { status: 400 });
    }

    // 7. Execute disbursement:
    // CASE A: MANUAL BANK TRANSFER (2-Way Handshake Mode)
    // If the Admin transfers directly from their bank app, the payout transaction is set to 'pending'
    // and requires the recipient's explicit confirmation handshake before the turn advances!
    if (method === "manual_bank_transfer") {
      // Clear prior failed transactions for this turn
      try {
        await supabaseAdmin
          .from("transactions")
          .delete()
          .eq("membership_id", receivingMembership.id)
          .eq("cycle_turn", turn)
          .eq("status", "failed");
      } catch {}

      // Insert pending payout transaction (2-way handshake)
      const { data: newTx, error: txInsertErr } = await supabaseAdmin.from("transactions").insert({
        membership_id: receivingMembership.id,
        amount: netPayoutAmount,
        type: "payout",
        status: "pending",
        cycle_turn: turn
      }).select().single();

      if (txInsertErr) {
        console.warn("Could not insert pending payout transaction:", txInsertErr);
      }

      // Send real-time in-app & push notification to the receiving member
      await supabaseAdmin.from("notifications").insert({
        user_id: receiverUser.id,
        title: `🔔 Action Required: Confirm Turn ${turn} Payout`,
        message: `Admin marked ₦${netPayoutAmount.toLocaleString()} as transferred to your bank account (${receiverUser.bank_name || 'Bank'} • ${receiverUser.account_number || ''}). Please check your bank and confirm receipt in your dashboard.`,
        type: "warning"
      });

      // Dispatch notification email via Resend
      if (receiverUser?.email) {
        try {
          const { sendEmail } = await import("@/utils/resend");
          const { getPayoutReceivedEmailTemplate } = await import("@/utils/emailTemplates");
          await sendEmail({
            to: receiverUser.email,
            subject: `Action Required: Confirm Turn ${turn} Payout (₦${netPayoutAmount.toLocaleString()}) - ${group.name}`,
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
        requiresConfirmation: true,
        message: `Turn ${turn} payout of ₦${netPayoutAmount.toLocaleString()} marked as transferred! Recipient (${receiverName}) has been sent an instant push alert to confirm receipt.`,
        netPayoutAmount,
        transactionId: newTx?.id,
        turn,
        source: "admin_manual_transfer"
      });
    }

    // CASE B: AUTONOMOUS MONO DISBURSE (Code-as-Law Mode)
    // Automated via Mono Disburse API with verified interbank NIP settlement
    const payoutRef = `ajose_payout_${groupId}_turn${turn}_${receiverUser.id}_${Date.now()}`;
    const result = await initiatePayoutWithMono({
      recipientAccountNumber: receiverUser.account_number,
      recipientBankCode: getBankCode(receiverUser.bank_name),
      amount: netPayoutAmount,
      narration: `Àjọṣe Turn ${turn} Payout (${group.name})`,
      reference: payoutRef
    });

    if (!result.success) {
      return NextResponse.json({ error: `Mono Payout failed: ${result.message}` }, { status: 502 });
    }

    // Advance group turn in DB
    const nextTurn = turn + 1;
    const isCompleted = nextTurn > (group.max_members || 1);
    if (isCompleted) {
      await supabaseAdmin
        .from("groups")
        .update({ status: "completed" })
        .eq("id", groupId);
    }

    // Delete prior failed transactions for this turn
    try {
      await supabaseAdmin
        .from("transactions")
        .delete()
        .eq("membership_id", receivingMembership.id)
        .eq("cycle_turn", turn)
        .eq("status", "failed");
    } catch {}

    // Record Payout transaction in ledger as successful
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

    // Notify receiving member (in-app & push)
    await supabaseAdmin.from("notifications").insert({
      user_id: receiverUser.id,
      title: `🎉 Payout Received! ₦${netPayoutAmount.toLocaleString()}`,
      message: `Your rotational payout for Turn ${turn} in ${group.name} was successfully disbursed to your bank account via Mono Payout.`,
      type: "success"
    });

    // Dispatch Payout Notification Email via Resend
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
      reference: result.reference,
      source: result.source
    });

  } catch (err: any) {
    console.error("Payout route exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to process payout." }, { status: 500 });
  }
}
