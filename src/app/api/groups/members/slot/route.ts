import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, groupId, membershipId, newTurn, maxMembers } = body;

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Verify caller is Group Admin or Platform Superadmin
    const { data: group, error: groupErr } = await supabaseAdmin
      .from("groups")
      .select("id, name, admin_id, max_members, status")
      .eq("id", groupId)
      .single();

    if (groupErr || !group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const isGroupAdmin = group.admin_id === user.id;
    // Also check if admin membership
    const { data: callerMembership } = await supabaseAdmin
      .from("memberships")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (!isGroupAdmin && callerMembership?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Only circle admin can update slots." }, { status: 403 });
    }

    // -------------------------------------------------------------
    // ACTION 1: Change / Swap Member Payout Slot
    // -------------------------------------------------------------
    if (action === "change_member_slot") {
      if (!membershipId || newTurn === undefined) {
        return NextResponse.json({ error: "membershipId and newTurn are required" }, { status: 400 });
      }

      const targetTurn = parseInt(newTurn);
      if (isNaN(targetTurn) || targetTurn < 1 || targetTurn > (group.max_members || 50)) {
        return NextResponse.json({ error: `Turn slot must be between 1 and ${group.max_members || 50}.` }, { status: 400 });
      }

      // Fetch target membership
      const { data: targetMem, error: memErr } = await supabaseAdmin
        .from("memberships")
        .select("id, user_id, payout_turn, role")
        .eq("id", membershipId)
        .eq("group_id", groupId)
        .single();

      if (memErr || !targetMem) {
        return NextResponse.json({ error: "Member not found in this circle." }, { status: 404 });
      }

      const oldTurn = targetMem.payout_turn;
      if (oldTurn === targetTurn) {
        return NextResponse.json({ success: true, message: "Slot is already set to this turn." });
      }

      // Check if another member currently occupies this turn
      const { data: conflictingMem } = await supabaseAdmin
        .from("memberships")
        .select("id, user_id, payout_turn")
        .eq("group_id", groupId)
        .eq("payout_turn", targetTurn)
        .single();

      if (conflictingMem) {
        // SWAP the slots between both members
        // 1. Temporarily move conflicting to null to avoid unique conflict
        await supabaseAdmin
          .from("memberships")
          .update({ payout_turn: null })
          .eq("id", conflictingMem.id);

        // 2. Set target member to new turn
        await supabaseAdmin
          .from("memberships")
          .update({ payout_turn: targetTurn })
          .eq("id", targetMem.id);

        // 3. Set conflicting member to target's old turn (or null if target didn't have one)
        await supabaseAdmin
          .from("memberships")
          .update({ payout_turn: oldTurn })
          .eq("id", conflictingMem.id);

        // Notify conflicting member of swap
        if (conflictingMem.user_id) {
          await supabaseAdmin.from("notifications").insert({
            user_id: conflictingMem.user_id,
            title: "Payout Slot Swapped",
            message: `Your payout turn in ${group.name} was moved from Turn ${targetTurn} to ${oldTurn ? `Turn ${oldTurn}` : "an open slot"} by the Circle Admin.`,
            type: "info"
          });
        }
      } else {
        // Open slot: simply assign
        await supabaseAdmin
          .from("memberships")
          .update({ payout_turn: targetTurn })
          .eq("id", targetMem.id);
      }

      // Notify target member
      if (targetMem.user_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: targetMem.user_id,
          title: "Payout Slot Updated",
          message: `Your payout turn in ${group.name} has been updated to Turn ${targetTurn} by the Circle Admin.`,
          type: "info"
        });
      }

      return NextResponse.json({
        success: true,
        message: conflictingMem 
          ? `Swapped slots: Member moved to Turn ${targetTurn}, previous holder moved to ${oldTurn ? `Turn ${oldTurn}` : "open slot"}.`
          : `Member slot updated to Turn ${targetTurn} successfully.`
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: Toggle Admin Contributing Slot
    // -------------------------------------------------------------
    if (action === "toggle_admin_slot") {
      const { data: adminMem } = await supabaseAdmin
        .from("memberships")
        .select("id, payout_turn")
        .eq("group_id", groupId)
        .eq("role", "admin")
        .single();

      if (!adminMem) {
        return NextResponse.json({ error: "Admin membership record not found." }, { status: 404 });
      }

      const assignedTurn = newTurn ? parseInt(newTurn) : null;

      if (assignedTurn !== null) {
        // Check conflict
        const { data: conflictingMem } = await supabaseAdmin
          .from("memberships")
          .select("id, user_id, payout_turn")
          .eq("group_id", groupId)
          .eq("payout_turn", assignedTurn)
          .single();

        if (conflictingMem && conflictingMem.id !== adminMem.id) {
          return NextResponse.json({ 
            error: `Turn ${assignedTurn} is already occupied by another member. Please swap or pick an open turn.` 
          }, { status: 400 });
        }
      }

      await supabaseAdmin
        .from("memberships")
        .update({ payout_turn: assignedTurn })
        .eq("id", adminMem.id);

      return NextResponse.json({
        success: true,
        message: assignedTurn 
          ? `Admin is now an active participant assigned to Turn ${assignedTurn}.`
          : `Admin is set to Non-Contributing Trustee (no payout turn assigned).`
      });
    }

    // -------------------------------------------------------------
    // ACTION 3: Update Circle Capacity (max_members)
    // -------------------------------------------------------------
    if (action === "update_max_members") {
      const capacity = parseInt(maxMembers);
      if (isNaN(capacity) || capacity < 2 || capacity > 100) {
        return NextResponse.json({ error: "Max members capacity must be between 2 and 100." }, { status: 400 });
      }

      // Check current members count
      const { count } = await supabaseAdmin
        .from("memberships")
        .select("id", { count: "exact", head: true })
        .eq("group_id", groupId);

      if (count && capacity < count) {
        return NextResponse.json({ 
          error: `Cannot reduce circle capacity to ${capacity} when ${count} members are currently joined.` 
        }, { status: 400 });
      }

      await supabaseAdmin
        .from("groups")
        .update({ max_members: capacity })
        .eq("id", groupId);

      return NextResponse.json({
        success: true,
        message: `Circle capacity updated to ${capacity} member slots.`
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    console.error("Member slot update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update slot" }, { status: 500 });
  }
}
