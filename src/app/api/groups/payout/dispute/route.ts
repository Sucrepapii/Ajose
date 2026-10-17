import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { groupId, turn, transactionId, reason } = await req.json();

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
    const { data: group } = await supabaseAdmin
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (!group) {
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

    if (recipientMembership.user_id !== user.id) {
      return NextResponse.json({ 
        error: "Forbidden. Only the designated recipient can file a payout dispute." 
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

    const { data: pendingTx } = await query.maybeSingle();

    if (!pendingTx) {
      return NextResponse.json({ 
        error: `No pending payout transaction found for Turn ${turn}.` 
      }, { status: 404 });
    }

    // 1. Mark transaction as failed due to dispute
    await supabaseAdmin
      .from("transactions")
      .update({ status: "failed" })
      .eq("id", pendingTx.id);

    const recipientUser = recipientMembership.users;
    const receiverName = `${recipientUser?.first_name || ""} ${recipientUser?.last_name || ""}`.trim() || recipientUser?.nickname || `Member #${turn}`;
    const disputeReason = reason || "Funds not received in recipient bank account.";

    // 2. High-Priority Alert to Admin
    await supabaseAdmin.from("notifications").insert({
      user_id: group.admin_id,
      title: `🚨 PAYOUT DISPUTED: Funds Not Received (Turn ${turn})`,
      message: `${receiverName} flagged that they did NOT receive the ₦${Number(pendingTx.amount).toLocaleString()} payout marked for Turn ${turn}. Reason: "${disputeReason}". Admin must provide bank transfer proof or retry payment.`,
      type: "warning"
    });

    // 3. In-App Notification to Recipient
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: `⚠️ Dispute Logged for Turn ${turn}`,
      message: `Your dispute regarding Turn ${turn} payout has been recorded. Admin and platform safety teams have been notified.`,
      type: "warning"
    });

    // 4. Dispatch Email Alert to Admin via Resend
    try {
      const { data: adminUser } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", group.admin_id)
        .single();

      if (adminUser?.email) {
        const { sendEmail } = await import("@/utils/resend");
        await sendEmail({
          to: adminUser.email,
          subject: `🚨 PAYOUT DISPUTED: ${receiverName} reports funds not received (Turn ${turn}) - ${group.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 2px solid #ef4444; border-radius: 16px;">
              <h2 style="color: #991b1b;">⚠️ Action Required: Payout Dispute Raised</h2>
              <p style="color: #374151; font-size: 14px;"><strong>${receiverName}</strong> reported they did NOT receive the <strong>₦${Number(pendingTx.amount).toLocaleString()}</strong> payout marked for Turn ${turn} in ${group.name}.</p>
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 14px; border-radius: 10px; margin: 16px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 13px;"><strong>Reported Reason:</strong> ${disputeReason}</p>
              </div>
              <p style="color: #4b5563; font-size: 13px;">Please verify your bank debit transaction statement or reach out to ${receiverName} directly to resolve.</p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.warn("Could not send admin dispute email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Dispute submitted. Admin and platform safety have been alerted."
    });

  } catch (err: any) {
    console.error("Dispute payout exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to record dispute." }, { status: 500 });
  }
}
