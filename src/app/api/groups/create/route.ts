import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const {
      name,
      contributionAmount,
      maxMembers,
      frequency,
      adminCommission,
      minCreditScore,
      adminBankName,
      adminAccountNumber,
      adminAccountName
    } = await req.json();

    if (!name || !contributionAmount || !maxMembers) {
      return NextResponse.json(
        { error: "Group name, contribution amount, and total members are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Persist Admin's settlement bank account details on profile if provided
    if (adminBankName || adminAccountNumber) {
      try {
        await supabaseAdmin
          .from("users")
          .update({
            bank_name: adminBankName?.trim() || "",
            account_number: adminAccountNumber?.trim() || "",
            account_name: adminAccountName?.trim() || ""
          })
          .eq("id", user.id);
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

    const fullPayload = {
      id: groupId,
      name: name.trim(),
      contribution_amount: parsedContrib,
      max_members: parsedMembers,
      frequency: frequency || "monthly",
      admin_commission_pct: parsedCommission,
      min_credit_score: parsedMinScore,
      status: "pending",
      admin_id: user.id,
      created_by: user.id,
      description: `Rotational contribution group managed on Ajose (${name.trim()}).`
    };

    // Attempt insert with full payload
    let insertedGroup: any = null;
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("groups")
      .insert(fullPayload)
      .select()
      .maybeSingle();

    if (insertError) {
      console.warn("Full payload insert failed, falling back to standard schema payload:", insertError);
      
      // Fallback: minimal standard schema payload in case optional columns don't exist
      const minimalPayload = {
        id: groupId,
        name: name.trim(),
        contribution_amount: parsedContrib,
        max_members: parsedMembers,
        frequency: frequency || "monthly",
        status: "pending",
        description: `Rotational contribution group managed on Ajose (${name.trim()}).`
      };

      const { data: minData, error: minError } = await supabaseAdmin
        .from("groups")
        .insert(minimalPayload)
        .select()
        .maybeSingle();

      if (minError) {
        console.error("Minimal payload group insert error:", minError);
        throw new Error(minError.message || "Failed to create group record in database.");
      }
      insertedGroup = minData || minimalPayload;
    } else {
      insertedGroup = insertData || fullPayload;
    }

    // 3. Create Admin membership record
    const { error: memberError } = await supabaseAdmin
      .from("memberships")
      .upsert({
        group_id: groupId,
        user_id: user.id,
        role: "admin",
        status: "active",
        payout_turn: null
      }, { onConflict: "group_id, user_id" });

    if (memberError) {
      console.error("Admin membership insertion error:", memberError);
    }

    return NextResponse.json({
      success: true,
      group: insertedGroup,
      groupId: groupId
    });

  } catch (error: any) {
    console.error("Group creation API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create group" },
      { status: 500 }
    );
  }
}
