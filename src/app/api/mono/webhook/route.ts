import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { initiatePayoutWithMono, getBankCode } from "@/utils/mono";

export const dynamic = "force-dynamic";

/**
 * Mono Webhook Listener for Àjọṣe
 *
 * Endpoint: POST /api/mono/webhook
 * Listens for events from Mono Direct Debit engine:
 * - direct_debit.successful / mono.events.direct_debit.success
 * - direct_debit.failed / mono.events.direct_debit.failed
 * - mandate.approved / mandate.revoked
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Webhook verification check (if webhook secret configured)
    const webhookSecret = process.env.MONO_WEBHOOK_SECRET;
    const incomingSignature = req.headers.get("mono-webhook-secret") || req.headers.get("x-mono-signature");

    if (webhookSecret && incomingSignature && incomingSignature !== webhookSecret) {
      console.warn("Mono webhook signature mismatch rejected.");
      return NextResponse.json({ error: "Signature mismatch" }, { status: 401 });
    }

    const event = body.event || body.type;
    const data = body.data || body;

    console.log(`Received Mono Webhook [${event}]:`, data?.reference || data?.id);

    const supabase = createAdminClient();

    // 1. Handle Successful Direct Debit
    if (
      event === "direct_debit.successful" ||
      event === "mono.events.direct_debit.success" ||
      event === "payment.successful"
    ) {
      const reference = data.reference || data.payment_reference;
      const amount = data.amount ? data.amount / 100 : undefined; // convert kobo to naira

      // Find the pending transaction by reference or update latest
      if (reference) {
        // Attempt to update transaction status
        const { data: updatedTx, error: txErr } = await supabase
          .from("transactions")
          .update({
            status: "completed",
            description: `Auto-debit cleared via Mono (Ref: ${reference})`
          })
          .ilike("description", `%${reference}%`)
          .select("group_id, cycle_turn, user_id, amount")
          .maybeSingle();

        if (updatedTx) {
          const { group_id, cycle_turn, user_id } = updatedTx;

          // Check if all members (including admin) for this turn have now cleared
          const { data: group } = await supabase
            .from("groups")
            .select("id, name, contribution_amount, admin_commission_pct, max_members")
            .eq("id", group_id)
            .single();

          const { data: allMembers } = await supabase
            .from("memberships")
            .select("user_id, role, payout_turn")
            .eq("group_id", group_id)
            .eq("status", "active");

          // Contributing members are the members rotating in the pool (excluding the non-contributing admin trustee)
          const contributingMembers = (allMembers || []).filter((m) => m.role !== "admin");

          const { data: turnTxs } = await supabase
            .from("transactions")
            .select("user_id")
            .eq("group_id", group_id)
            .eq("cycle_turn", cycle_turn)
            .eq("type", "contribution")
            .eq("status", "completed");

          const completedUserIds = new Set((turnTxs || []).map((t) => t.user_id));
          const allCleared = contributingMembers.length > 0 && contributingMembers.every((m) => completedUserIds.has(m.user_id));

          if (allCleared && group) {
            const totalPool = group.contribution_amount * contributingMembers.length;
            const beneficiary = allMembers?.find((m) => m.payout_turn === cycle_turn);
            const admin = allMembers?.find((m) => m.role === "admin");

            if (admin) {
              // Fetch Admin's bank details for automated pool transfer
              const { data: adminUser } = await supabase
                .from("users")
                .select("first_name, last_name, email, bank_name, account_number, account_name")
                .eq("id", admin.user_id)
                .single();

              const adminName = adminUser?.first_name 
                ? `${adminUser.first_name} ${adminUser.last_name || ""}`.trim()
                : "Admin";

              const payoutReference = `ajose_pool_${group.id}_turn${cycle_turn}_admin_${Date.now()}`;

              // Trigger Mono Payout API to credit the Admin directly
              const payoutResult = await initiatePayoutWithMono({
                recipientAccountNumber: adminUser?.account_number || "0123456789",
                recipientBankCode: getBankCode(adminUser?.bank_name),
                amount: totalPool,
                narration: `Àjọṣe Pool (Turn ${cycle_turn}) - ${group.name}`,
                reference: payoutReference
              });

              // Record the Payout Transaction in the ledger
              await supabase.from("transactions").insert({
                group_id,
                user_id: admin.user_id,
                amount: totalPool,
                type: "payout",
                status: payoutResult.success ? "completed" : "failed",
                description: `Full Turn ${cycle_turn} pool credited to Admin (${adminName} - ${adminUser?.account_number || "Default"}) - Ref: ${payoutReference}`,
                cycle_turn
              });

              // Advance the group to the next turn
              await supabase
                .from("groups")
                .update({ current_turn: cycle_turn + 1 })
                .eq("id", group_id);

              // Notify the Admin that pool has landed in their account
              await supabase.from("notifications").insert({
                user_id: admin.user_id,
                title: `💰 ₦${totalPool.toLocaleString()} Pool Credited to Your Account!`,
                message: `All member contributions for Turn ${cycle_turn} in ${group.name} are complete. The full pool of ₦${totalPool.toLocaleString()} has been credited to your bank account for payout to the turn collector.`,
                type: "success"
              });

              // Notify the receiving member that contributions are complete and with the Admin
              if (beneficiary) {
                await supabase.from("notifications").insert({
                  user_id: beneficiary.user_id,
                  title: `🎉 Turn ${cycle_turn} Contributions Complete!`,
                  message: `All members in ${group.name} have paid! The total pool of ₦${totalPool.toLocaleString()} has been collected and credited to the Admin account for distribution.`,
                  type: "success"
                });
              }
            }
          }
        }
      }

      return NextResponse.json({ received: true, status: "success_processed" });
    }

    // 2. Handle Failed Direct Debit
    if (
      event === "direct_debit.failed" ||
      event === "mono.events.direct_debit.failed" ||
      event === "payment.failed"
    ) {
      const reference = data.reference;
      const failureReason = data.message || data.reason || "Insufficient funds or bank decline";

      if (reference) {
        await supabase
          .from("transactions")
          .update({
            status: "failed",
            description: `Auto-debit declined by bank: ${failureReason}`
          })
          .ilike("description", `%${reference}%`);
      }

      return NextResponse.json({ received: true, status: "failure_recorded" });
    }

    // Default response for other events (e.g. mandate status changes)
    return NextResponse.json({ received: true, event });

  } catch (error: any) {
    console.error("Mono webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
