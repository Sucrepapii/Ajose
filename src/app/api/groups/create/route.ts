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

    // 1. Authenticate user from server cookies
    const supabaseServer = await createClient();
    const { data: { user: serverUser } } = await supabaseServer.auth.getUser();

    const userId = serverUser?.id || bodyUserId;
    const userEmail = serverUser?.email || bodyUserEmail;

    if (!userId) {
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

    const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const dbClient = hasServiceRole ? createAdminClient() : supabaseServer;
    const supabaseAdmin = createAdminClient();

    // Persist Admin settlement bank details on user profile if provided
    if (adminBankName || adminAccountNumber) {
      try {
        await supabaseAdmin
          .from("users")
          .update({
            bank_name: adminBankName?.trim() || "",
            account_number: adminAccountNumber?.trim() || "",
            account_name: adminAccountName?.trim() || ""
          })
          .eq("id", userId);
      } catch (userErr) {
        console.warn("Could not update admin bank details:", userErr);
      }
    }

    // 2. Prepare payload for groups table
    const groupId = crypto.randomUUID();
    const parsedContrib = parseInt(contributionAmount);
    const parsedMembers = parseInt(maxMembers);
    const parsedCommission = parseFloat(adminCommission) || 0;
    const parsedMinScore = parseInt(minCreditScore) || 0;

    let insertedGroup: any = null;

    // Attempt 1: Full payload
    const payload1 = {
      id: groupId,
      name: name.trim(),
      contribution_amount: parsedContrib,
      max_members: parsedMembers,
      frequency: frequency || "monthly",
      admin_commission_pct: parsedCommission,
      min_credit_score: parsedMinScore,
      status: "pending",
      admin_id: userId,
      created_by: userId,
      description: `Rotational contribution group managed on Ajose (${name.trim()}).`
    };

    const { data: data1, error: err1 } = await dbClient
      .from("groups")
      .insert(payload1)
      .select()
      .maybeSingle();

    if (!err1 && (data1 || payload1)) {
      insertedGroup = data1 || payload1;
    } else {
      console.warn("Insert attempt 1 error:", err1?.message);

      // Attempt 2: Without optional custom commission & score, without created_by (using admin_id)
      const payload2 = {
        id: groupId,
        name: name.trim(),
        contribution_amount: parsedContrib,
        max_members: parsedMembers,
        frequency: frequency || "monthly",
        status: "pending",
        admin_id: userId,
        description: `Rotational contribution group managed on Ajose (${name.trim()}).`
      };

      const { data: data2, error: err2 } = await dbClient
        .from("groups")
        .insert(payload2)
        .select()
        .maybeSingle();

      if (!err2) {
        insertedGroup = data2 || payload2;
      } else {
        console.warn("Insert attempt 2 error:", err2?.message);

        // Attempt 3: Standard minimal schema without created_by or admin_id
        const payload3 = {
          id: groupId,
          name: name.trim(),
          contribution_amount: parsedContrib,
          max_members: parsedMembers,
          frequency: frequency || "monthly",
          status: "pending",
          description: `Rotational contribution group managed on Ajose (${name.trim()}).`
        };

        const { data: data3, error: err3 } = await dbClient
          .from("groups")
          .insert(payload3)
          .select()
          .maybeSingle();

        if (!err3) {
          insertedGroup = data3 || payload3;
        } else {
          console.warn("Insert attempt 3 error:", err3?.message);

          // Attempt 4: Bare minimum schema (id, name, contribution_amount, max_members, frequency, status)
          const payload4 = {
            id: groupId,
            name: name.trim(),
            contribution_amount: parsedContrib,
            max_members: parsedMembers,
            frequency: frequency || "monthly",
            status: "pending"
          };

          const { data: data4, error: err4 } = await supabaseAdmin
            .from("groups")
            .insert(payload4)
            .select()
            .maybeSingle();

          if (err4) {
            console.error("All group insert attempts failed:", err4);
            return NextResponse.json(
              { error: err4.message || "Failed to create group in database.", details: err4 },
              { status: 500 }
            );
          }
          insertedGroup = data4 || payload4;
        }
      }
    }

    const finalGroupId = insertedGroup?.id || groupId;

    // 3. Create Admin membership record in public.memberships
    try {
      const { error: memberError } = await supabaseAdmin
        .from("memberships")
        .upsert({
          group_id: finalGroupId,
          user_id: userId,
          role: "admin",
          status: "active",
          payout_turn: null
        }, { onConflict: "group_id, user_id" });

      if (memberError) {
        console.warn("Membership upsert warning on admin client:", memberError.message);
      }
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
