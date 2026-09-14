import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { groupId, userId, groupName } = await req.json();

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "groupId and userId are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Ensure Group exists in DB
    const { data: existingGroup } = await supabase
      .from("groups")
      .select("id")
      .eq("id", groupId)
      .maybeSingle();

    if (!existingGroup) {
      await supabase.from("groups").upsert({
        id: groupId,
        name: groupName || "Ajose Contribution Circle",
        contribution_amount: 50000,
        frequency: "monthly",
        max_members: 10,
        description: "Rotational contribution group on Ajose."
      }, { onConflict: "id", ignoreDuplicates: true });
    }

    // 2. Check if user is already a member
    const { data: existingMembership } = await supabase
      .from("memberships")
      .select("id, payout_turn")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        message: "User is already an active member of this group",
        groupId,
        payoutTurn: existingMembership.payout_turn
      });
    }

    // 3. Calculate next payout turn
    const { count } = await supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .neq("role", "admin");

    const nextTurn = (count || 0) + 1;

    // 4. Insert Membership Record
    const { error: membershipErr } = await supabase
      .from("memberships")
      .insert({
        group_id: groupId,
        user_id: userId,
        role: "member",
        status: "active",
        payout_turn: nextTurn
      });

    if (membershipErr) {
      console.error("Membership creation error:", membershipErr);
      throw membershipErr;
    }

    return NextResponse.json({
      success: true,
      alreadyMember: false,
      message: "Successfully added to group membership roster",
      groupId,
      payoutTurn: nextTurn
    });

  } catch (error: any) {
    console.error("Group join API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to join group" },
      { status: 500 }
    );
  }
}
