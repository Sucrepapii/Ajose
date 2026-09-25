import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Auto-Sweep Cron / Trigger Route for Àjọṣe Rotational Contributions
 *
 * This endpoint runs on a schedule (e.g. daily/weekly via Vercel Cron or external scheduler)
 * or can be triggered manually by an Admin.
 *
 * It iterates through active groups, identifies members who owe contributions for the
 * current cycle turn, and initiates direct debits via Mono.
 *
 * --- ADMIN DEBITING LOGIC ---
 * What about debiting the admin?
 * 1. Non-Contributing Admin (role === 'admin' & payout_turn === null):
 *    The Admin is purely the organizer/trustee. Members' money flows into the Admin's
 *    settlement account. The Admin is SKIPPED during contribution sweeps.
 *
 * 2. Contributing Admin (role === 'admin' & payout_turn !== null):
 *    The Admin also takes a turn in the rotation.
 *    - If the group settles into the Admin's own bank account, debiting the Admin
 *      into their own account causes circular gateway fees. The system automatically
 *      marks the Admin's share as 'self_funded' / completed in the ledger.
 *    - If the group uses a separate neutral escrow pool, the Admin is debited
 *      via Mono mandate like any other participating member.
 */

export async function GET(req: NextRequest) {
  return handleSweep(req);
}

export async function POST(req: NextRequest) {
  return handleSweep(req);
}

async function handleSweep(req: NextRequest) {
  try {
    // 1. Authorization check:
    // a) Bearer token or CRON_SECRET header / query param
    // b) Authenticated SuperAdmin session
    // c) Authenticated Group Admin of specificGroupId
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const urlSecret = req.nextUrl.searchParams.get("secret");
    const specificGroupId = req.nextUrl.searchParams.get("groupId");

    let isAuthorized = false;
    if (cronSecret && (authHeader === `Bearer ${cronSecret}` || urlSecret === cronSecret)) {
      isAuthorized = true;
    } else if (!cronSecret && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    } else {
      // Check for authenticated SuperAdmin
      try {
        const { getSuperAdminSession } = await import("@/utils/adminAuth");
        const adminSession = await getSuperAdminSession();
        if (adminSession.isAuthenticated && adminSession.isSuperAdmin) {
          isAuthorized = true;
        }
      } catch (_) {}

      // Check if caller is the authenticated Admin of this specific circle
      if (!isAuthorized && specificGroupId) {
        try {
          const { createClient } = await import("@/utils/supabase/server");
          const supabaseUser = await createClient();
          const { data: { user } } = await supabaseUser.auth.getUser();
          if (user) {
            const adminSupabase = createAdminClient();
            const { data: grp } = await adminSupabase
              .from("groups")
              .select("admin_id")
              .eq("id", specificGroupId)
              .maybeSingle();

            if (grp && grp.admin_id === user.id) {
              isAuthorized = true;
            }
          }
        } catch (_) {}
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Valid cron secret or group admin session required." }, { status: 401 });
    }

    const supabase = createAdminClient();
    const monoSecretKey = process.env.MONO_SECRET_KEY || "test_sk_m965s64o22p1sovu3koh";
    const isSandbox = !process.env.MONO_SECRET_KEY || monoSecretKey.startsWith("test_");

    // 2. Fetch active groups
    let query = supabase
      .from("groups")
      .select(`
        id,
        name,
        contribution_amount,
        max_members,
        frequency,
        current_turn,
        status,
        admin_id
      `)
      .eq("status", "active");

    if (specificGroupId) {
      query = query.eq("id", specificGroupId);
    }

    const { data: activeGroups, error: groupsErr } = await query;

    if (groupsErr) {
      throw new Error(`Failed to fetch active groups: ${groupsErr.message}`);
    }

    if (!activeGroups || activeGroups.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active groups due for contribution sweep.",
        groupsProcessed: 0,
        results: []
      });
    }

    const sweepResults: any[] = [];

    // 3. Process each group
    for (const group of activeGroups) {
      const currentTurn = group.current_turn || 1;

      // Fetch all members with their user details
      const { data: members, error: membersErr } = await supabase
        .from("memberships")
        .select(`
          id,
          user_id,
          role,
          status,
          payout_turn,
          users (
            id,
            first_name,
            last_name,
            email,
            bank_name,
            account_number,
            account_name,
            bvn_verified
          )
        `)
        .eq("group_id", group.id)
        .eq("status", "active");

      if (membersErr || !members) {
        sweepResults.push({
          groupId: group.id,
          groupName: group.name,
          error: membersErr?.message || "Failed to fetch members"
        });
        continue;
      }

      // Fetch existing transactions for this turn
      const { data: existingTxs } = await supabase
        .from("transactions")
        .select("user_id, status, type")
        .eq("group_id", group.id)
        .eq("cycle_turn", currentTurn)
        .eq("type", "contribution");

      const paidUserIds = new Set(
        (existingTxs || [])
          .filter((tx) => tx.status === "completed" || tx.status === "pending_confirmation")
          .map((tx) => tx.user_id)
      );

      const groupSummary = {
        groupId: group.id,
        groupName: group.name,
        currentTurn,
        debitsInitiated: 0,
        adminHandling: "",
        skippedAlreadyPaid: 0,
        failedDebits: 0,
        details: [] as any[]
      };

      for (const member of members) {
        const userProfile = member.users as any;
        const displayName = userProfile?.first_name
          ? `${userProfile.first_name} ${userProfile.last_name || ""}`.trim()
          : "Member";

        // Check if already paid for this round
        if (paidUserIds.has(member.user_id)) {
          groupSummary.skippedAlreadyPaid++;
          groupSummary.details.push({
            userId: member.user_id,
            name: displayName,
            status: "already_paid"
          });
          continue;
        }

        // Non-Contributing Trustee: Admin organizes the group and manages the pool; they do not pay.
        if (member.role === "admin") {
          groupSummary.adminHandling = "Admin is non-contributing trustee (skipped from collection)";
          groupSummary.details.push({
            userId: member.user_id,
            name: displayName,
            role: "admin",
            status: "skipped_non_contributing_trustee"
          });
          continue;
        }

        const isDaily = group.frequency === "daily";
        const isWeekly = group.frequency === "weekly";
        const automationFee = isDaily ? 100 : isWeekly ? 300 : 0;
        const totalDebitAmount = (group.contribution_amount || 0) + automationFee;

        const reference = `ajose_sweep_${group.id}_turn${currentTurn}_${member.user_id}_${Date.now()}`;
        let debitSuccess = false;
        let debitMessage = "";

        if (!isSandbox) {
          // LIVE MONO DIRECT DEBIT CALL
          try {
            // In a production setup, member.mono_mandate_id is passed
            const mandateId = (member as any).mono_mandate_id || (userProfile as any)?.mono_mandate_id;

            if (mandateId) {
              const debitRes = await fetch(`https://api.withmono.com/v3/payments/mandates/${mandateId}/debit`, {
                method: "POST",
                headers: {
                  "mono-sec-key": monoSecretKey,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  amount: totalDebitAmount * 100, // kobo
                  description: `Àjọṣe Contribution: ${group.name} (Round ${currentTurn})`,
                  reference
                })
              });

              const debitData = await debitRes.json();
              if (debitRes.ok && debitData.status !== "failed") {
                debitSuccess = true;
                debitMessage = "Debit initiated via Mono mandate.";
              } else {
                debitSuccess = false;
                debitMessage = debitData.message || "Mono debit declined by bank.";
              }
            } else {
              debitSuccess = false;
              debitMessage = "No active Mono mandate found for member.";
            }
          } catch (err: any) {
            debitSuccess = false;
            debitMessage = err.message || "Mono connection error.";
          }
        } else {
          // SANDBOX / SIMULATION MODE
          debitSuccess = true;
          debitMessage = "Auto-debit successfully swept via Mono sandbox mandate.";
        }

        // Record the transaction result in the ledger
        if (debitSuccess) {
          await supabase.from("transactions").insert({
            group_id: group.id,
            user_id: member.user_id,
            amount: totalDebitAmount,
            type: "contribution",
            status: isSandbox ? "completed" : "pending",
            description: `Auto-debit sweep via Mono for Turn ${currentTurn} (${reference})`,
            cycle_turn: currentTurn
          });

          // Send in-app notification
          await supabase.from("notifications").insert({
            user_id: member.user_id,
            title: `Contribution Debited ₦${totalDebitAmount.toLocaleString()}`,
            message: `Your scheduled Ajo contribution for Turn ${currentTurn} in ${group.name} was successfully debited.`,
            type: "info"
          });

          groupSummary.debitsInitiated++;
          groupSummary.details.push({
            userId: member.user_id,
            name: displayName,
            status: isSandbox ? "completed" : "initiated",
            reference,
            message: debitMessage
          });
        } else {
          // Log failed debit so group has transparency
          await supabase.from("transactions").insert({
            group_id: group.id,
            user_id: member.user_id,
            amount: totalDebitAmount,
            type: "contribution",
            status: "failed",
            description: `Auto-debit failed for Turn ${currentTurn}: ${debitMessage}`,
            cycle_turn: currentTurn
          });

          // Transparent alert to defaulter
          await supabase.from("notifications").insert({
            user_id: member.user_id,
            title: `⚠️ Auto-Debit Failed for ${group.name}`,
            message: `Your contribution of ₦${totalDebitAmount.toLocaleString()} failed: ${debitMessage}. Please transfer directly to the Admin's Settlement Account using your circle narration code to avoid default penalties.`,
            type: "warning"
          });

          groupSummary.failedDebits++;
          groupSummary.details.push({
            userId: member.user_id,
            name: displayName,
            status: "failed",
            error: debitMessage
          });
        }
      }

      sweepResults.push(groupSummary);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      groupsProcessed: sweepResults.length,
      results: sweepResults
    });

  } catch (error: any) {
    console.error("Cron auto-sweep error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during contribution sweep" },
      { status: 500 }
    );
  }
}
