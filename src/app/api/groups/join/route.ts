import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const { 
      groupId: rawCode, 
      userId, 
      groupName, 
      contributionAmount, 
      frequency, 
      maxMembers, 
      minCreditScore 
    } = await req.json();

    if (!rawCode || !userId) {
      return NextResponse.json(
        { error: "groupId and userId are required" },
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://npvwtzmlhpagsdohkuvm.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Create userClient with Bearer token if provided, otherwise fallback to server cookies
    const supabaseServer = await createClient();
    const userClient = authHeader
      ? createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false }
        })
      : supabaseServer;

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

    // If not found by direct UUID, search by short code prefix or circle name
    if (!targetGroup) {
      const { data: allGroups } = await queryClient
        .from("groups")
        .select("id, name, contribution_amount, frequency, max_members, status, min_credit_score");

      const normalizedInput = cleanCode.toLowerCase().replace(/-/g, "");

      targetGroup = (allGroups || []).find((g: any) => {
        const idLower = g.id.toLowerCase();
        const idNoHyphens = idLower.replace(/-/g, "");
        const nameLower = (g.name || "").toLowerCase().trim();

        return (
          idLower.startsWith(cleanCode.toLowerCase()) ||
          idNoHyphens.startsWith(normalizedInput) ||
          nameLower === cleanCode.toLowerCase().trim()
        );
      });
    }

    // If still not found and a full UUID was provided with metadata, fallback to creating it
    if (!targetGroup && uuidRegex.test(cleanCode)) {
      const fallbackPayload = {
        id: cleanCode,
        name: groupName || "Ajose Contribution Circle",
        contribution_amount: contributionAmount ? Number(contributionAmount) : 50000,
        frequency: frequency || "monthly",
        max_members: maxMembers ? Number(maxMembers) : 10,
        min_credit_score: minCreditScore ? Number(minCreditScore) : 0,
        status: "pending",
        admin_id: userId
      };

      const { data: createdGroup, error: createErr } = await (hasServiceRole ? adminClient : userClient)
        .from("groups")
        .upsert(fallbackPayload, { onConflict: "id", ignoreDuplicates: true })
        .select()
        .maybeSingle();

      if (!createErr && (createdGroup || fallbackPayload)) {
        targetGroup = createdGroup || fallbackPayload;
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

    // 5. Insert Membership Record - with resilient dual-attempt fallback
    let membershipErr: any = null;
    const membershipPayload = {
      group_id: resolvedGroupId,
      user_id: userId,
      role: "member",
      status: "active",
      payout_turn: nextTurn
    };

    // Primary attempt with adminClient (bypasses RLS)
    const { error: primaryErr } = await adminClient
      .from("memberships")
      .insert(membershipPayload);

    if (primaryErr) {
      console.warn("adminClient membership insertion error, trying userClient fallback:", primaryErr.message);
      // Secondary attempt with userClient
      const { error: fallbackErr } = await userClient
        .from("memberships")
        .insert(membershipPayload);

      if (fallbackErr) {
        membershipErr = fallbackErr;
      }
    }

    if (membershipErr) {
      console.error("Membership creation error:", membershipErr);
      throw membershipErr;
    }

    // 6. Send in-app notification to member (fail-safe)
    try {
      const notifClient = hasServiceRole ? adminClient : userClient;
      await notifClient.from("notifications").insert({
        user_id: userId,
        title: `Joined ${targetGroup.name}`,
        message: `You have successfully joined ${targetGroup.name} at turn position #${nextTurn}.`,
        type: "system",
        is_read: false
      });
    } catch (notifErr) {
      console.warn("Could not insert join notification:", notifErr);
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
