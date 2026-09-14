import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      contributionAmount,
      maxMembers,
      frequency,
      adminCommission,
      minCreditScore,
      adminBankName,
      adminAccountNumber,
      adminAccountName,
      userId: bodyUserId,
      userEmail: bodyUserEmail
    } = body;

    // 1. Identify User Session
    let activeUser: { id: string; email?: string } | null = null;

    try {
      const supabaseServer = await createClient();
      const { data: { user: serverUser } } = await supabaseServer.auth.getUser();
      if (serverUser) {
        activeUser = { id: serverUser.id, email: serverUser.email };
      }
    } catch (e) {
      console.warn("Could not retrieve server user session from cookies:", e);
    }

    if (!activeUser && bodyUserId) {
      activeUser = { id: bodyUserId, email: bodyUserEmail };
    }

    if (!activeUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to create a group." },
        { status: 401 }
      );
    }

    if (!name || !contributionAmount || !maxMembers) {
      return NextResponse.json(
        { error: "Group name, contribution amount, and total members are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 2. Ensure User record exists in public.users table to prevent FK violations
    try {
      await supabaseAdmin
        .from("users")
        .upsert({
          id: activeUser.id,
          email: activeUser.email || "",
          bank_name: adminBankName?.trim() || "",
          account_number: adminAccountNumber?.trim() || "",
          account_name: adminAccountName?.trim() || ""
        }, { onConflict: "id", ignoreDuplicates: false });
    } catch (userErr) {
      console.warn("User profile sync before group creation warning:", userErr);
    }

    // 3. Prepare Payloads for groups table
    const groupId = crypto.randomUUID();
    const parsedContrib = parseInt(contributionAmount);
    const parsedMembers = parseInt(maxMembers);
    const parsedCommission = parseFloat(adminCommission) || 0;
    const parsedMinScore = parseInt(minCreditScore) || 0;

    let insertedGroup: any = null;

    // Attempt 1: Full payload
    const fullPayload = {
      id: groupId,
      name: name.trim(),
      contribution_amount: parsedContrib,
      max_members: parsedMembers,
      frequency: frequency || "monthly",
      admin_commission_pct: parsedCommission,
      min_credit_score: parsedMinScore,
      status: "pending",
      admin_id: activeUser.id,
      created_by: activeUser.id,
      description: `Rotational contribution group managed on Ajose (${name.trim()}).`
    };

    const { data: data1, error: err1 } = await supabaseAdmin
      .from("groups")
      .insert(fullPayload)
      .select()
      .maybeSingle();

    if (!err1 && (data1 || fullPayload)) {
      insertedGroup = data1 || fullPayload;
    } else {
      console.warn("Attempt 1 full payload insert error:", err1?.message);

      // Attempt 2: Without optional custom commission & score columns
      const payload2 = {
        id: groupId,
        name: name.trim(),
        contribution_amount: parsedContrib,
        max_members: parsedMembers,
        frequency: frequency || "monthly",
        status: "pending",
        created_by: activeUser.id,
        description: `Rotational contribution group managed on Ajose (${name.trim()}).`
      };

      const { data: data2, error: err2 } = await supabaseAdmin
        .from("groups")
        .insert(payload2)
        .select()
        .maybeSingle();

      if (!err2) {
        insertedGroup = data2 || payload2;
      } else {
        console.warn("Attempt 2 insert error:", err2?.message);

        // Attempt 3: Absolute minimal payload
        const payload3 = {
          id: groupId,
          name: name.trim(),
          contribution_amount: parsedContrib,
          max_members: parsedMembers,
          frequency: frequency || "monthly",
          status: "pending"
        };

        const { data: data3, error: err3 } = await supabaseAdmin
          .from("groups")
          .insert(payload3)
          .select()
          .maybeSingle();

        if (err3) {
          console.error("All group insert attempts failed. Final error:", err3);
          return NextResponse.json(
            { error: err3.message || "Failed to create group in database.", details: err3 },
            { status: 500 }
          );
        }
        insertedGroup = data3 || payload3;
      }
    }

    const finalGroupId = insertedGroup?.id || groupId;

    // 4. Create Admin membership record in public.memberships
    try {
      await supabaseAdmin
        .from("memberships")
        .upsert({
          group_id: finalGroupId,
          user_id: activeUser.id,
          role: "admin",
          status: "active",
          payout_turn: null
        }, { onConflict: "group_id, user_id" });
    } catch (memberErr) {
      console.error("Admin membership insertion error:", memberErr);
    }

    return NextResponse.json({
      success: true,
      group: insertedGroup,
      groupId: finalGroupId
    });

  } catch (error: any) {
    console.error("Group creation API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process group creation" },
      { status: 500 }
    );
  }
}
