import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId is required" },
        { status: 400 }
      );
    }

    // 1. Authenticate user
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 2. Fetch group
    const { data: group, error: groupErr } = await supabaseAdmin
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupErr || !group) {
      return NextResponse.json(
        { error: "Group not found." },
        { status: 404 }
      );
    }

    // 3. Verify user is group admin
    const { data: adminMembership } = await supabaseAdmin
      .from("memberships")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    const isGroupAdmin = adminMembership?.role === "admin" || group.admin_id === user.id;

    if (!isGroupAdmin) {
      return NextResponse.json(
        { error: "Only the group Admin trustee can start the cycle." },
        { status: 403 }
      );
    }

    // 4. Verify group is pending
    if (group.status === "active") {
      return NextResponse.json(
        { error: "Ajo cycle is already active." },
        { status: 400 }
      );
    }

    // 5. Verify member completeness (must have >= max_members contributing members)
    const { count: contributingCount, error: countErr } = await supabaseAdmin
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .neq("role", "admin")
      .eq("status", "active");

    if (countErr) {
      console.error("Error checking member count:", countErr);
      return NextResponse.json(
        { error: "Failed to verify membership count." },
        { status: 500 }
      );
    }

    const currentCount = contributingCount || 0;
    const maxMembers = group.max_members || 0;

    if (currentCount < maxMembers) {
      const remaining = maxMembers - currentCount;
      return NextResponse.json(
        {
          error: `Cannot start cycle: ${remaining} more member slot${
            remaining > 1 ? "s" : ""
          } must be filled (currently ${currentCount}/${maxMembers}).`,
          currentCount,
          maxMembers,
          remaining
        },
        { status: 400 }
      );
    }

    // 6. Start cycle: set status to active and initialize current_turn to 1
    const { error: updateErr } = await supabaseAdmin
      .from("groups")
      .update({
        status: "active",
        current_turn: 1
      })
      .eq("id", groupId);

    if (updateErr) {
      console.error("Error activating group cycle:", updateErr);
      return NextResponse.json(
        { error: "Failed to activate cycle in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Ajo cycle for '${group.name}' has been successfully launched!`,
      groupId,
      status: "active",
      currentTurn: 1
    });

  } catch (err: any) {
    console.error("Start cycle route exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error starting cycle." },
      { status: 500 }
    );
  }
}
