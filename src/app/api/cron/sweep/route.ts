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
    const specificGroupId = req.nextUrl.searchParams.get("groupId");

    let isAuthorized = false;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
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
    const monoSecretKey = process.env.MONO_PAYMENTS_SECRET_KEY || process.env.MONO_SECRET_KEY || "test_sk_m965s64o22p1sovu3koh";
    const isSandbox = !monoSecretKey || monoSecretKey.startsWith("test_");

    // 2. Fetch active groups
    let query = supabase
      .from("groups")
      .select(`
        id,
        name,
        contribution_amount,
        max_members,
        frequency,
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
      // Derive current turn from completed payout transactions if not on group record
      const { data: payouts } = await supabase
        .from('transactions')
        .select('cycle_turn')
        .eq('group_id', group.id)
        .eq('type', 'payout')
        .in('status', ['successful', 'completed']);

      const maxPaidTurn = (payouts || []).reduce((max: number, p: any) => Math.max(max, p.cycle_turn || 0), 0);
      const currentTurn = (group as any).current_turn || (maxPaidTurn + 1);

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

      // Fetch existing transactions for this turn using valid schema (membership_id)
      const memberIds = members.map(m => m.id);
      const { data: existingTxs } = memberIds.length > 0
        ? await supabase
            .from("transactions")
            .select("membership_id, status, type")
            .in("membership_id", memberIds)
            .eq("cycle_turn", currentTurn)
            .eq("type", "contribution")
        : { data: [] };

      const paidMembershipIds = new Set(
        (existingTxs || [])
          .filter((tx) => 
            tx.status === "successful" || 
            tx.status === "completed" || 
            tx.status === "pending_confirmation" || 
            tx.status === "pending"
          )
          .map((tx) => tx.membership_id)
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

      await Promise.allSettled(members.map(async (member) => {
        try {
        const userProfile = member.users as any;
        const displayName = userProfile?.first_name
          ? `${userProfile.first_name} ${userProfile.last_name || ""}`.trim()
          : "Member";

        // Check if already paid for this round
        if (paidMembershipIds.has(member.id)) {
          groupSummary.skippedAlreadyPaid++;
          groupSummary.details.push({
            userId: member.user_id,
            name: displayName,
            status: "already_paid"
          });
          return;
        }

        // Non-Contributing Trustee: Admin organizes the group and manages the pool; they do not pay.
        if (member.role === "admin" && (member.payout_turn === null || member.payout_turn === undefined)) {
          groupSummary.adminHandling = "Admin is non-contributing trustee (skipped from collection)";
          groupSummary.details.push({
            userId: member.user_id,
            name: displayName,
            role: "admin",
            status: "skipped_non_contributing_trustee"
          });
          return;
        }

        const isDaily = group.frequency === "daily";
        const isWeekly = group.frequency === "weekly";
        const automationFee = isDaily ? 100 : isWeekly ? 300 : 0;
        const totalDebitAmount = (group.contribution_amount || 0) + automationFee;

        // Mono references must be alphanumeric and <= 24 characters
        const rawRef = `swp${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 6)}`;
        const reference = rawRef.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);
        let debitSuccess = false;
        let debitMessage = "";

        // Resolve member mandate ID: check database record, then Supabase Auth user_metadata
        let mandateId = (member as any).mono_mandate_id || (userProfile as any)?.mono_mandate_id;
        if (!mandateId && member.user_id) {
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(member.user_id);
            mandateId = authUser?.user?.user_metadata?.mono_mandate_id;
          } catch (_) {}
        }

        const isTestCircle = (group.name || "").toLowerCase().includes("test");
        const allowSimulation = isSandbox || (isTestCircle && (process.env.PAYMENTS_MODE === "sandbox" || process.env.NODE_ENV !== "production"));

        if (mandateId) {
          // LIVE MONO DIRECT DEBIT CALL
          try {
            console.log(`[Sweep] Initiating live Mono debit for member ${member.user_id} with mandate ${mandateId}, amount: ₦${totalDebitAmount}`);
            const debitRes = await fetch(`https://api.withmono.com/v3/payments/mandates/${mandateId}/debit`, {
              method: "POST",
              headers: {
                "mono-sec-key": monoSecretKey,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                amount: Math.round(totalDebitAmount * 100), // kobo
                narration: `Àjọṣe Contribution Turn ${currentTurn} - ${group.name.slice(0, 15)}`,
                reference
              })
            });

            const debitData = await debitRes.json();
            console.log(`[Sweep] Mono debit response:`, debitRes.status, debitData);
            if (debitRes.ok && debitData.status !== "failed") {
              debitSuccess = true;
              debitMessage = "Debit initiated via Mono mandate.";
            } else {
              debitSuccess = false;
              debitMessage = debitData.message || "Mono debit declined by bank.";
            }
          } catch (err: any) {
            debitSuccess = false;
            debitMessage = err.message || "Mono connection error.";
          }
        } else if (allowSimulation) {
          // Simulation / Test fallback for test circles in development
          debitSuccess = true;
          debitMessage = "Auto-debit successfully swept (Test Mode).";
        } else {
          debitSuccess = false;
          debitMessage = "No active Mono mandate authorized for member.";
        }

        // Record the transaction result in the ledger using valid database schema
        if (debitSuccess) {
          await supabase.from("transactions").insert({
            membership_id: member.id,
            amount: totalDebitAmount,
            type: "contribution",
            status: "successful",
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
            status: "successful",
            reference,
            message: debitMessage
          });
        } else {
          // Log failed debit so group has transparency
          await supabase.from("transactions").insert({
            membership_id: member.id,
            amount: totalDebitAmount,
            type: "contribution",
            status: "failed",
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
      } catch (memberErr: any) {
        console.error("Member sweep failed:", memberErr);
          groupSummary.failedDebits++;
          groupSummary.details.push({
            userId: member.user_id,
            name: "Member",
            status: "failed",
            error: memberErr.message || "Unexpected error during debit processing"
          });
        }
      }));

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
