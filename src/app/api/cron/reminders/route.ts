import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendPreDebitReminderEmail } from "@/utils/resend";

export const dynamic = "force-dynamic";

/**
 * 24-Hour Pre-Debit Auto-Debit Reminder Cron Route
 *
 * Runs daily (via cron or on-demand trigger) to alert members 1 day before
 * automated sweep day. Sends high-priority email + in-app notification to
 * ensure accounts are funded and prevent failed mandate penalties.
 */
export async function GET(req: NextRequest) {
  return handlePreDebitReminders(req);
}

export async function POST(req: NextRequest) {
  return handlePreDebitReminders(req);
}

async function handlePreDebitReminders(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const specificGroupId = req.nextUrl.searchParams.get("groupId");
    let isAuthorized = false;

    // 1. Cron Secret Authorization
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

    // Fetch active groups (without nonexistent current_turn column)
    let query = supabase
      .from("groups")
      .select(`
        id,
        name,
        contribution_amount,
        max_members,
        frequency,
        status,
        admin_id,
        admin_commission_pct
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
        message: "No active groups for pre-debit reminders.",
        remindersSent: 0,
        groupsProcessed: 0,
      });
    }

    const results: any[] = [];
    let totalReminded = 0;

    // Calculate tomorrow's formatted date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDueDate = tomorrow.toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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

      // 1. Fetch contributing members with contact info
      const { data: members, error: membersErr } = await supabase
        .from("memberships")
        .select(`
          id,
          user_id,
          role,
          payout_turn,
          status,
          users (
            id,
            email,
            first_name,
            last_name,
            nickname,
            phone,
            auto_sweep_enabled,
            custom_platform_fee_pct
          )
        `)
        .eq("group_id", group.id)
        .eq("status", "active");

      if (membersErr || !members) continue;

      // Fetch group admin custom fee override if configured
      let adminCustomFeePct: number | null = null;
      if (group.admin_id) {
        try {
          const { data: adminUser } = await supabase
            .from("users")
            .select("custom_platform_fee_pct")
            .eq("id", group.admin_id)
            .maybeSingle();
          if (typeof adminUser?.custom_platform_fee_pct === "number" && adminUser.custom_platform_fee_pct >= 0) {
            adminCustomFeePct = adminUser.custom_platform_fee_pct;
          }
        } catch (_) {}
      }

      // 2. Fetch existing completed contributions for this turn
      const memberIds = members.map((m: any) => m.id);
      const { data: paidTxs } = memberIds.length > 0
        ? await supabase
            .from("transactions")
            .select("membership_id")
            .in("membership_id", memberIds)
            .eq("cycle_turn", currentTurn)
            .eq("type", "contribution")
            .in("status", ["successful", "completed"])
        : { data: [] };

      const paidMemberIds = new Set((paidTxs || []).map((t: any) => t.membership_id));

      // Filter members who owe contribution for this turn
      // Note: non-contributing pure admins (payout_turn === null) do not pay
      const unpaidMembers = members.filter((m: any) => {
        if (m.role === "admin" && m.payout_turn === null) return false;
        return !paidMemberIds.has(m.id);
      });

      const groupRemindedMembers: string[] = [];
      const notificationsToInsert: any[] = [];
      const emailPromises: Promise<any>[] = [];

      for (const m of unpaidMembers) {
        const u = m.users as any;
        if (!u) continue;

        const userName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.nickname || "Valued Member";
        const userEmail = u.email;

        const isDaily = group.frequency === "daily";
        const isWeekly = group.frequency === "weekly";

        let feePct = 2.0;
        if (typeof u.custom_platform_fee_pct === "number" && u.custom_platform_fee_pct >= 0) {
          feePct = u.custom_platform_fee_pct;
        } else if (typeof adminCustomFeePct === "number" && adminCustomFeePct >= 0) {
          feePct = adminCustomFeePct;
        }

        const automationFee = isDaily ? 100 : isWeekly ? 300 : Math.round(((group.contribution_amount || 0) * feePct) / 100);
        const totalDebitAmount = (group.contribution_amount || 0) + automationFee;

        // Queue in-app notification for bulk insert
        notificationsToInsert.push({
          user_id: u.id,
          title: `Auto-Debit Tomorrow: ₦${totalDebitAmount.toLocaleString()}`,
          message: `Your scheduled auto-debit of ₦${totalDebitAmount.toLocaleString()} (₦${(group.contribution_amount || 0).toLocaleString()} contribution${automationFee > 0 ? ` + ₦${automationFee} automation charge` : ""}) for "${group.name}" is tomorrow (${formattedDueDate}). Please ensure your account is funded.`,
          type: "warning",
        });

        // Queue email notification for concurrent execution (P5 fix)
        if (userEmail && userEmail.includes("@")) {
          emailPromises.push(
            sendPreDebitReminderEmail({
              to: userEmail,
              userName,
              groupName: group.name,
              amount: totalDebitAmount,
              dueDate: formattedDueDate,
              frequency: group.frequency || "monthly",
            }).catch(err => console.warn(`Failed sending pre-debit email to ${userEmail}:`, err))
          );
        }

        groupRemindedMembers.push(userName);
        totalReminded++;
      }

      if (notificationsToInsert.length > 0) {
        await supabase.from("notifications").insert(notificationsToInsert);
      }
      
      if (emailPromises.length > 0) {
        await Promise.allSettled(emailPromises);
      }

      results.push({
        groupId: group.id,
        groupName: group.name,
        frequency: group.frequency,
        currentTurn,
        remindedCount: groupRemindedMembers.length,
        members: groupRemindedMembers,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed pre-debit reminders for ${activeGroups.length} groups.`,
      groupsProcessed: activeGroups.length,
      totalRemindersSent: totalReminded,
      results,
    });
  } catch (error: any) {
    console.error("Pre-debit reminder cron failed:", error);
    return NextResponse.json({ error: error.message || "Pre-debit reminder execution failed." }, { status: 500 });
  }
}
