import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { groupId, turn, transactionId } = await req.json();

    if (!groupId || !turn) {
      return NextResponse.json({ error: "groupId and turn are required" }, { status: 400 });
    }

    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // Fetch group
    const { data: group, error: groupErr } = await supabaseAdmin
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupErr || !group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Verify recipient membership
    const { data: recipientMembership } = await supabaseAdmin
      .from("memberships")
      .select("*, users(*)")
      .eq("group_id", groupId)
      .eq("payout_turn", Number(turn))
      .maybeSingle();

    if (!recipientMembership) {
      return NextResponse.json({ error: `No member assigned to Turn ${turn}.` }, { status: 404 });
    }

    // Auth check: User MUST be the turn recipient (or group admin)
    const isRecipient = recipientMembership.user_id === user.id;
    const isAdmin = group.admin_id === user.id;

    if (!isRecipient && !isAdmin) {
      return NextResponse.json({ 
        error: "Forbidden. Only the designated payout recipient can confirm receipt." 
      }, { status: 403 });
    }

    // Find pending payout transaction
    let query = supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("membership_id", recipientMembership.id)
      .eq("cycle_turn", Number(turn))
      .eq("type", "payout")
      .eq("status", "pending");

    if (transactionId) {
      query = query.eq("id", transactionId);
    }

    const { data: pendingTx, error: txErr } = await query.maybeSingle();

    if (txErr || !pendingTx) {
      return NextResponse.json({ 
        error: `No pending payout transaction found for Turn ${turn}.` 
      }, { status: 404 });
    }

    // 1. Upgrade transaction status to 'successful'
    const { error: updateTxErr } = await supabaseAdmin
      .from("transactions")
      .update({ status: "successful" })
      .eq("id", pendingTx.id);

    if (updateTxErr) {
      throw new Error(updateTxErr.message);
    }

    // 2. Advance group turn
    const nextTurn = Number(turn) + 1;
    const isCompleted = nextTurn > (group.max_members || 1);
    if (isCompleted) {
      await supabaseAdmin
        .from("groups")
        .update({ status: "completed" })
        .eq("id", groupId);
    }

    // 3. Award trust & credit score boost (+10 points)
    const recipientUser = recipientMembership.users;
    const receiverName = `${recipientUser?.first_name || ""} ${recipientUser?.last_name || ""}`.trim() || recipientUser?.nickname || `Member #${turn}`;

    try {
      const currentScore = recipientUser?.credit_score ?? 80;
      await supabaseAdmin
        .from("users")
        .update({ credit_score: Math.min(100, currentScore + 10) })
        .eq("id", recipientMembership.user_id);
    } catch {}

    // 4. Send real-time notifications to Admin, Recipient, and Group
    const notificationsToInsert = [
      // Notification to Admin
      {
        user_id: group.admin_id,
        title: `✅ Payout Confirmed! (Turn ${turn})`,
        message: `${receiverName} confirmed receipt of ₦${Number(pendingTx.amount).toLocaleString()} for Turn ${turn}. Handshake complete! Turn ${nextTurn} is now open.`,
        type: "success"
      },
      // Notification to Recipient
      {
        user_id: recipientMembership.user_id,
        title: "🎉 Handshake Complete!",
        message: `You confirmed receipt of your Turn ${turn} payout of ₦${Number(pendingTx.amount).toLocaleString()}. +10 Trust score awarded!`,
        type: "success"
      }
    ];

    await supabaseAdmin.from("notifications").insert(notificationsToInsert);

    // 5. Send confirmation email to Admin via Resend
    try {
      const { data: adminUser } = await supabaseAdmin
        .from("users")
        .select("email, first_name")
        .eq("id", group.admin_id)
        .single();

      if (adminUser?.email) {
        const { sendEmail } = await import("@/utils/resend");
        await sendEmail({
          to: adminUser.email,
          subject: `✅ Payout Confirmed by ${receiverName} (Turn ${turn}) - ${group.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
              <h2 style="color: #0B3022;">2-Way Handshake Complete! 🎉</h2>
              <p style="color: #374151; font-size: 14px;"><strong>${receiverName}</strong> has verified receipt of their Turn ${turn} payout of <strong>₦${Number(pendingTx.amount).toLocaleString()}</strong> in ${group.name}.</p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; font-size: 13px;"><strong>Turn Status:</strong> Settled & Verified</p>
                <p style="margin: 4px 0 0; color: #166534; font-size: 13px;"><strong>Next Turn:</strong> Turn ${nextTurn} is now open for contributions.</p>
              </div>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.warn("Could not send admin confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Turn ${turn} payout verified! Handshake complete and Turn ${nextTurn} is now active.`,
      nextTurn
    });

  } catch (err: any) {
    console.error("Confirm payout receipt exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to confirm receipt." }, { status: 500 });
  }
}
