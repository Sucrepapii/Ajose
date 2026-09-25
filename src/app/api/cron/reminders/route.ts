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
    const urlSecret = req.nextUrl.searchParams.get("secret");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && urlSecret !== cronSecret) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
      }
    }

    const supabase = createAdminClient();
    const specificGroupId = req.nextUrl.searchParams.get("groupId");

    // Fetch active groups
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
      const currentTurn = group.current_turn || 1;

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
            auto_sweep_enabled
          )
        `)
        .eq("group_id", group.id)
        .eq("status", "active");

      if (membersErr || !members) continue;

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

      for (const m of unpaidMembers) {
        const u = m.users as any;
        if (!u) continue;

        const userName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.nickname || "Valued Member";
        const userEmail = u.email;

        // In-app notification
        await supabase.from("notifications").insert({
          user_id: u.id,
          title: `⏰ Auto-Debit Tomorrow: ₦${group.contribution_amount.toLocaleString()}`,
          message: `Your scheduled auto-debit contribution for "${group.name}" is scheduled for tomorrow (${formattedDueDate}). Please ensure your account has sufficient funds.`,
          type: "warning",
        });

        // Email notification (1 day before auto debit)
        if (userEmail && userEmail.includes("@")) {
          try {
            await sendPreDebitReminderEmail({
              to: userEmail,
              userName,
              groupName: group.name,
              amount: group.contribution_amount,
              dueDate: formattedDueDate,
              frequency: group.frequency || "monthly",
            });
          } catch (emailErr) {
            console.warn(`Failed sending pre-debit email to ${userEmail}:`, emailErr);
          }
        }

        groupRemindedMembers.push(userName);
        totalReminded++;
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
