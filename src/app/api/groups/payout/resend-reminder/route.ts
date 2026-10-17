import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { groupId, turn, recipientUserId } = await req.json();

    if (!groupId || !turn || !recipientUserId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // Verify caller is group admin
    const { data: group } = await supabaseAdmin
      .from("groups")
      .select("admin_id, name")
      .eq("id", groupId)
      .single();

    if (!group || group.admin_id !== user.id) {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    // Insert reminder notification
    await supabaseAdmin.from("notifications").insert({
      user_id: recipientUserId,
      title: `🔔 Reminder: Confirm Turn ${turn} Payout`,
      message: `Admin is awaiting your confirmation for Turn ${turn} payout in ${group.name}. Please check your bank account and click 'Confirm Receipt'.`,
      type: "warning"
    });

    return NextResponse.json({
      success: true,
      message: "Push notification reminder sent to member!"
    });

  } catch (err: any) {
    console.error("Resend reminder exception:", err);
    return NextResponse.json({ error: err?.message || "Failed to resend reminder." }, { status: 500 });
  }
}
