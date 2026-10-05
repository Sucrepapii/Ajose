import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { groupId, identifier, turnSlot } = await req.json();

    if (!groupId || !identifier) {
      return NextResponse.json(
        { error: "groupId and member phone/email are required." },
        { status: 400 }
      );
    }

    // 1. Authenticate requesting user
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Fetch group
    const { data: group, error: groupErr } = await supabaseAdmin
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupErr || !group) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    // 3. Verify Admin rights
    const { data: adminMembership } = await supabaseAdmin
      .from("memberships")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = adminMembership?.role === "admin" || group.admin_id === user.id;
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only the group Admin trustee can add members directly." },
        { status: 403 }
      );
    }

    // 4. Find target user by phone, email, or nickname (exact matches only to prevent H9 injection)
    const cleanIdentifier = identifier.trim().toLowerCase();
    const isEmail = cleanIdentifier.includes("@");
    
    let targetUser: any = null;

    if (isEmail) {
      const { data: matchedUsers } = await supabaseAdmin
        .from("users")
        .select("id, phone, first_name, last_name, nickname, email")
        .eq("email", cleanIdentifier)
        .limit(1);
      targetUser = matchedUsers?.[0];
    } else {
      // Normalize phone for exact match
      const digits = cleanIdentifier.replace(/\D/g, "");
      const searchPhone = digits.length >= 10 ? digits.slice(-10) : cleanIdentifier;
      
      const { data: matchedUsers } = await supabaseAdmin
        .from("users")
        .select("id, phone, first_name, last_name, nickname, email")
        .or(`phone.eq.${cleanIdentifier},phone.eq.${searchPhone},nickname.eq.${cleanIdentifier}`)
        .limit(1);
      targetUser = matchedUsers?.[0];
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: `No registered user found matching "${identifier}". Please invite them using the group invite link.` },
        { status: 404 }
      );
    }

    // 5. Check if user is already in this group
    const { data: existingMembership } = await supabaseAdmin
      .from("memberships")
      .select("id, role, payout_turn")
      .eq("group_id", groupId)
      .eq("user_id", targetUser.id)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json(
        { error: `This user is already a member of this group (Turn ${existingMembership.payout_turn || "Admin"}).` },
        { status: 400 }
      );
    }

    // 6. Determine payout turn
    let assignedTurn = turnSlot ? parseInt(turnSlot) : null;

    if (!assignedTurn) {
      // Find lowest unfilled turn number up to max_members
      const { data: existingMembers } = await supabaseAdmin
        .from("memberships")
        .select("payout_turn")
        .eq("group_id", groupId)
        .neq("role", "admin");

      const occupiedTurns = new Set(existingMembers?.map(m => m.payout_turn) || []);
      for (let i = 1; i <= group.max_members; i++) {
        if (!occupiedTurns.has(i)) {
          assignedTurn = i;
          break;
        }
      }
    }

    if (!assignedTurn || assignedTurn > group.max_members) {
      return NextResponse.json(
        { error: `Group has reached its maximum limit of ${group.max_members} members.` },
        { status: 400 }
      );
    }

    // 7. Insert membership
    const { error: insertErr } = await supabaseAdmin
      .from("memberships")
      .insert({
        group_id: groupId,
        user_id: targetUser.id,
        role: "member",
        status: "active",
        payout_turn: assignedTurn
      });

    if (insertErr) throw insertErr;

    // 8. Notify user
    await supabaseAdmin.from("notifications").insert({
      user_id: targetUser.id,
      title: `Added to ${group.name}`,
      message: `You were added to '${group.name}' by the Admin as Turn ${assignedTurn}. Contribution amount: ₦${group.contribution_amount.toLocaleString()} (${group.frequency}).`,
      type: "info"
    });

    const targetName = `${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim() || targetUser.nickname || targetUser.phone || "Member";

    // 9. Dispatch Welcome & Onboarding Email via Resend
    try {
      const emailToUse = targetUser.email || (cleanIdentifier.includes("@") ? cleanIdentifier : null);
      if (emailToUse) {
        const { sendEmail } = await import("@/utils/resend");
        const { getWelcomeEmailTemplate } = await import("@/utils/emailTemplates");
        await sendEmail({
          to: emailToUse,
          subject: `Welcome to ${group.name}! 🎉`,
          html: getWelcomeEmailTemplate({
            userName: targetName,
            groupName: group.name,
          }),
        });
      }
    } catch (emailErr) {
      console.warn("Could not dispatch add member welcome email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${targetName} to Turn ${assignedTurn}!`,
      assignedTurn,
      userId: targetUser.id
    });

  } catch (err: any) {
    console.error("Add member API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to add member to group." },
      { status: 500 }
    );
  }
}
