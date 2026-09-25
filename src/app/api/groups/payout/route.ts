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

    // 5. Calculate payout amounts based on group frequency & admin volume tier:
    // Volume Tier:
    // - Manage > 10 circles: 1.0% platform fee
    // - Manage 6 - 10 circles: 1.5% platform fee
    // - Standard (<= 5 circles): 2.0% platform fee
    // - Weekly & Daily Groups: 0% payout fee! (Flat automation fee was applied per transaction)
    const isWeekly = group.frequency === "weekly";
    const isDaily = group.frequency === "daily";
    const totalPool = (group.contribution_amount || 50000) * (group.max_members || 1);
    const adminCommissionPct = group.admin_commission_pct || 0;
    const adminFee = Math.round((adminCommissionPct / 100) * totalPool);

    let effectiveFeePct = 2.0;
    let volumeDiscountTier = "Standard (2%)";

    if (!isWeekly && !isDaily) {
      // 1. Check for SuperAdmin VIP custom rate override in Admin's auth metadata
      let hasCustomFee = false;
      try {
        const { data: adminAuth } = await supabaseAdmin.auth.admin.getUserById(group.admin_id);
        const customFee = adminAuth?.user?.user_metadata?.custom_platform_fee_pct;
        if (typeof customFee === "number" && customFee >= 0) {
          effectiveFeePct = customFee;
          volumeDiscountTier = `SuperAdmin VIP Custom Rate (${customFee.toFixed(1)}%)`;
          hasCustomFee = true;
        }
      } catch (authErr) {
        console.warn("Could not check admin auth for custom fee override:", authErr);
      }

      // 2. If no custom override, apply automatic volume discount tier based on circle count
      if (!hasCustomFee) {
        const { count: adminGroupCount } = await supabaseAdmin
          .from("groups")
          .select("id", { count: "exact", head: true })
          .eq("admin_id", group.admin_id);

        const totalCircles = adminGroupCount || 1;
        if (totalCircles > 10) {
          effectiveFeePct = 1.0;
          volumeDiscountTier = "Power Organizer (>10 Circles: 1.0%)";
        } else if (totalCircles >= 6) {
          effectiveFeePct = 1.5;
          volumeDiscountTier = "Pro Organizer (6-10 Circles: 1.5%)";
        }
      }
    }

    const platformFee = (isWeekly || isDaily) 
      ? 0 
      : Math.min(10000, Math.round((effectiveFeePct / 100) * totalPool));
    const netPayoutAmount = Math.max(0, totalPool - adminFee - platformFee);

    if (!receiverUser.account_number && method !== "manual_bank_transfer") {
      return NextResponse.json({ 
        error: `Turn recipient (${receiverName}) has not connected a verified bank account. Payout cannot be disbursed until they link their account.` 
      }, { status: 400 });
    }

    // 6. Execute disbursement:
    // - If method === "manual_bank_transfer": Admin transferred directly on chosen day
    // - Otherwise: Execute disbursement via Mono Payout API
    const payoutRef = `ajose_payout_${groupId}_turn${turn}_${receiverUser.id}_${Date.now()}`;
    let monoResult: { success: boolean; message?: string; reference: string; source: string };

    if (method === "manual_bank_transfer") {
      monoResult = {
        success: true,
        reference: `admin_direct_${Date.now()}`,
        source: "admin_manual_transfer",
        message: `Payout of ₦${netPayoutAmount.toLocaleString()} marked as transferred directly by Admin to ${receiverName}.`
      };
    } else {
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

      monoResult = result;
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
