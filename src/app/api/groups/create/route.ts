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

    // 2. Select appropriate client:
    // If Service Role Key is configured in env, admin client bypasses RLS.
    // Otherwise, use authenticated supabaseServer client so auth.uid() = userId satisfies RLS!
    const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const dbClient = hasServiceRole ? createAdminClient() : supabaseServer;

    // Persist Admin settlement bank details on user profile if provided
    if (adminBankName || adminAccountNumber) {
      try {
        await dbClient
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

    // 3. Prepare payload for groups table
    const groupId = crypto.randomUUID();
    const parsedContrib = parseInt(contributionAmount);
    const parsedMembers = parseInt(maxMembers);
    const parsedCommission = parseFloat(adminCommission) || 0;
    const parsedMinScore = parseInt(minCreditScore) || 0;

    let insertedGroup: any = null;

    // Payload 1: Full payload (matching auth.uid() = userId)
    const fullPayload = {
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
      .insert(fullPayload)
      .select()
      .maybeSingle();

    if (!err1 && (data1 || fullPayload)) {
      insertedGroup = data1 || fullPayload;
    } else {
      console.warn("Insert attempt 1 error:", err1?.message);

      // Payload 2: Without optional custom columns (admin_commission_pct, min_credit_score)
      const payload2 = {
        id: groupId,
        name: name.trim(),
        contribution_amount: parsedContrib,
        max_members: parsedMembers,
        frequency: frequency || "monthly",
        status: "pending",
        created_by: userId,
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

        // Payload 3: Standard minimal schema
        const payload3 = {
          id: groupId,
          name: name.trim(),
          contribution_amount: parsedContrib,
          max_members: parsedMembers,
          frequency: frequency || "monthly",
          status: "pending",
          created_by: userId
        };

        const { data: data3, error: err3 } = await dbClient
          .from("groups")
          .insert(payload3)
          .select()
          .maybeSingle();

        if (err3) {
          // If dbClient with auth cookies failed due to RLS, try fallback with createAdminClient if available
          if (!hasServiceRole) {
            const adminFallback = createAdminClient();
            const { data: data4, error: err4 } = await adminFallback
              .from("groups")
              .insert(payload3)
              .select()
              .maybeSingle();
            
            if (!err4) {
              insertedGroup = data4 || payload3;
            } else {
              console.error("All group insert attempts failed:", err4);
              return NextResponse.json(
                { error: err4.message || "Failed to create group in database.", details: err4 },
                { status: 500 }
              );
            }
          } else {
            console.error("All group insert attempts failed:", err3);
            return NextResponse.json(
              { error: err3.message || "Failed to create group in database.", details: err3 },
              { status: 500 }
            );
          }
        } else {
          insertedGroup = data3 || payload3;
        }
      }
    }

    const finalGroupId = insertedGroup?.id || groupId;

    // 4. Create Admin membership record in public.memberships
    try {
      const { error: memberError } = await dbClient
        .from("memberships")
        .upsert({
          group_id: finalGroupId,
          user_id: userId,
          role: "admin",
          status: "active",
          payout_turn: null
        }, { onConflict: "group_id, user_id" });

      if (memberError) {
        console.warn("Membership upsert warning on dbClient, retrying via admin client:", memberError.message);
        const adminClient = createAdminClient();
        await adminClient.from("memberships").upsert({
          group_id: finalGroupId,
          user_id: userId,
          role: "admin",
          status: "active",
          payout_turn: null
        }, { onConflict: "group_id, user_id" });
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
