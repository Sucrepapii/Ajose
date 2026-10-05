import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    // 0. Authenticate session
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. You must be logged in to join." }, { status: 401 });
    }

    const { groupId: rawCode } = await req.json();
    const userId = user.id;

    if (!rawCode) {
      return NextResponse.json(
        { error: "groupId is required" },
        { status: 400 }
      );
    }

    // 1. Sanitize & extract code from URLs or raw input
    let cleanCode = String(rawCode).trim();
    if (cleanCode.includes("/invite/")) {
      const parts = cleanCode.split("/invite/");
      cleanCode = parts[1].split("?")[0].split("/")[0].trim();
    }
    cleanCode = cleanCode.replace(/^#/, "").trim();

    const adminClient = createAdminClient();
    const queryClient = adminClient;

    // 2. Resolve Group
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let targetGroup: any = null;

    if (uuidRegex.test(cleanCode)) {
      const { data: directMatch } = await queryClient
        .from("groups")
        .select("id, name, contribution_amount, frequency, max_members, status, min_credit_score")
        .eq("id", cleanCode)
        .maybeSingle();

      if (directMatch) {
        targetGroup = directMatch;
      }
    }

    if (!targetGroup) {
      return NextResponse.json(
        { error: `Group invite code "${cleanCode}" could not be found.` },
        { status: 404 }
      );
    }

    const resolvedGroupId = targetGroup.id;

    // 3. Check if user is already a member
    const { data: existingMembership } = await queryClient
      .from("memberships")
      .select("id, payout_turn, role, status")
      .eq("group_id", resolvedGroupId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        message: "User is already an active member of this group",
        group: targetGroup,
        groupId: resolvedGroupId,
        payoutTurn: existingMembership.payout_turn
      });
    }

    // 4. Calculate next payout turn
    const { count } = await queryClient
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("group_id", resolvedGroupId)
      .neq("role", "admin");

    const nextTurn = (count || 0) + 1;

    // 5. Insert Membership Record
    const membershipPayload = {
      group_id: resolvedGroupId,
      user_id: userId,
      role: "member",
      status: "active",
      payout_turn: nextTurn
    };

    const { error: primaryErr } = await adminClient
      .from("memberships")
      .insert(membershipPayload);

    if (primaryErr) {
      console.error("Membership creation error:", primaryErr);
      throw primaryErr;
    }

    // 6. Send in-app notification to member (fail-safe)
    try {
      await adminClient.from("notifications").insert({
        user_id: userId,
        title: `Joined ${targetGroup.name}`,
        message: `You have successfully joined ${targetGroup.name} at turn position #${nextTurn}.`,
        type: "system",
        is_read: false
      });
    } catch (notifErr) {
      console.warn("Could not insert join notification:", notifErr);
    }

    // 7. Dispatch Welcome & Onboarding Email via Resend
    try {
      const { data: memberUser } = await adminClient
        .from("users")
        .select("email, first_name, last_name, nickname")
        .eq("id", userId)
        .maybeSingle();

      if (memberUser?.email) {
        const userName = memberUser.first_name || memberUser.nickname || "Member";
        const { sendEmail } = await import("@/utils/resend");
        const { getWelcomeEmailTemplate } = await import("@/utils/emailTemplates");
        await sendEmail({
          to: memberUser.email,
          subject: `Welcome to ${targetGroup.name || "Àjọṣe Ajo Circle"}! 🎉`,
          html: getWelcomeEmailTemplate({
            userName,
            groupName: targetGroup.name || "Àjọṣe Ajo Circle",
          }),
        });
      }
    } catch (emailErr) {
      console.warn("Could not dispatch welcome email on join:", emailErr);
    }

    return NextResponse.json({
      success: true,
      alreadyMember: false,
      message: `Successfully joined ${targetGroup.name} at turn #${nextTurn}`,
      group: targetGroup,
      groupId: resolvedGroupId,
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
