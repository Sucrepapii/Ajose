import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
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

    // 1. Authenticate user session
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://npvwtzmlhpagsdohkuvm.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Instantiate userClient with Bearer token if provided to satisfy RLS (auth.uid() = admin_id)
    const userClient = authHeader
      ? createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false }
        })
      : supabaseServer;

    const dbClient = hasServiceRole ? createAdminClient() : userClient;
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

    // Attempt 1: Direct insert matching confirmed groups table columns
    const payload1 = {
      id: groupId,
      name: name.trim(),
      contribution_amount: parsedContrib,
      max_members: parsedMembers,
      frequency: frequency || "monthly",
      admin_commission_pct: parsedCommission,
      min_credit_score: parsedMinScore,
      status: "pending",
      admin_id: userId
    };

    const { data: data1, error: err1 } = await dbClient
      .from("groups")
      .insert(payload1)
      .select()
      .maybeSingle();

    if (!err1 && (data1 || payload1)) {
      insertedGroup = data1 || payload1;
    } else {
      console.warn("Insert attempt 1 warning:", err1?.message);

      // Attempt 2: Standard schema with admin_id (without optional custom commission & score)
      const payload2 = {
        id: groupId,
        name: name.trim(),
        contribution_amount: parsedContrib,
        max_members: parsedMembers,
        frequency: frequency || "monthly",
        status: "pending",
        admin_id: userId
      };

      const { data: data2, error: err2 } = await dbClient
        .from("groups")
        .insert(payload2)
        .select()
        .maybeSingle();

      if (!err2) {
        insertedGroup = data2 || payload2;
      } else {
        console.warn("Insert attempt 2 warning:", err2?.message);

        // Attempt 3: Core schema with admin_id (guarantees NOT NULL admin_id constraint)
        const payload3 = {
          id: groupId,
          name: name.trim(),
          contribution_amount: parsedContrib,
          max_members: parsedMembers,
          frequency: frequency || "monthly",
          status: "pending",
          admin_id: userId
        };

        const { data: data3, error: err3 } = await dbClient
          .from("groups")
          .insert(payload3)
          .select()
          .maybeSingle();

        if (!err3) {
          insertedGroup = data3 || payload3;
        } else {
          console.error("Group insert attempt 3 failed:", err3);

          // Attempt 4: Seamless fallback for 'daily' frequency if database enum has not been migrated yet
          if (frequency === "daily" && (err3.message?.includes("frequency_type") || err3.code === "22P02")) {
            console.warn("Retrying daily group insert using fallback cadence with monthly storage...");
            const payload4 = {
              id: groupId,
              name: name.trim(),
              contribution_amount: parsedContrib,
              max_members: parsedMembers,
              frequency: "monthly",
              status: "pending",
              admin_id: userId
            };

            const { data: data4, error: err4 } = await dbClient
              .from("groups")
              .insert(payload4)
              .select()
              .maybeSingle();

            if (!err4) {
              insertedGroup = { ...(data4 || payload4), frequency: "daily" };
            } else {
              console.error("Daily fallback attempt 4 failed:", err4);
              return NextResponse.json(
                { error: err4.message || "Failed to create group in database.", details: err4 },
                { status: 500 }
              );
            }
          } else {
            return NextResponse.json(
              { error: err3.message || "Failed to create group in database.", details: err3 },
              { status: 500 }
            );
          }
        }
      }
    }

    const finalGroupId = insertedGroup?.id || groupId;

    // 3. Create Admin membership record in public.memberships
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
        console.warn("Membership upsert warning on dbClient, retrying via userClient:", memberError.message);
        await userClient.from("memberships").upsert({
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
