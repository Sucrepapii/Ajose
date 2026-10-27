import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { consumeQuota, createQuotaExceededResponse } from "@/utils/quotaManager";
import { whitelistAndValidate, GROUP_CREATE_FIELDS } from "@/utils/security/schemaGuard";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const rawBody = await req.json().catch(() => ({}));

    // 1. Mass Assignment Protection: Validate and strictly whitelist input fields
    const validation = whitelistAndValidate<any>(rawBody, GROUP_CREATE_FIELDS);
    if (!validation.isValid) {
      return validation.errorResponse!;
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
      adminAccountName,
    } = validation.sanitized;

    // 2. IDOR Protection: Authenticate caller and strictly bind group ownership to serverUser.id
    const supabaseServer = await createClient();
    const { data: { user: serverUser } } = await supabaseServer.auth.getUser();

    if (!serverUser || !serverUser.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to create a group." },
        { status: 401 }
      );
    }

    const userId = serverUser.id;
    const userEmail = serverUser.email;

    // 3. Cost & Anti-Abuse Control: Enforce daily group creation quota (max 10 per day)
    const quota = consumeQuota("GROUP_CREATION", userId);
    if (!quota.allowed) {
      return createQuotaExceededResponse(quota);
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
            bank_name: adminBankName || undefined,
            account_number: adminAccountNumber || undefined,
            account_name: adminAccountName || undefined,
          })
          .eq("id", userId);
      } catch (bankErr) {
        console.warn("Could not auto-save admin bank details to profile:", bankErr);
      }
    }

    // 4. Create Group Record with guaranteed owner binding (admin_id strictly = userId)
    const groupPayload = {
      name,
      contribution_amount: Number(contributionAmount),
      max_members: Number(maxMembers),
      frequency: frequency || "monthly",
      admin_id: userId,
      status: "pending",
      admin_commission_pct: adminCommission !== undefined ? Number(adminCommission) : 0,
      min_credit_score: minCreditScore ? Number(minCreditScore) : 0
    };

    let group: any = null;
    let createError: any = null;

    const { data: primaryData, error: primaryErr } = await dbClient
      .from("groups")
      .insert(groupPayload)
      .select()
      .single();

    if (primaryErr) {
      createError = primaryErr;
      if (hasServiceRole && dbClient !== supabaseAdmin) {
        const { data: adminData, error: adminErr } = await supabaseAdmin
          .from("groups")
          .insert(groupPayload)
          .select()
          .single();

        if (!adminErr && adminData) {
          group = adminData;
          createError = null;
        } else {
          createError = adminErr || primaryErr;
        }
      }
    } else {
      group = primaryData;
    }

    if (createError || !group) {
      console.error("Group creation DB error:", createError);
      return NextResponse.json(
        { error: createError?.message || "Failed to create group in database" },
        { status: 500 }
      );
    }

    // 5. Create Admin Membership Record
    const adminMembershipPayload = {
      group_id: group.id,
      user_id: userId,
      role: "admin",
      status: "active",
      payout_turn: null
    };

    let membership: any = null;
    const { data: primaryMem, error: memErr } = await dbClient
      .from("memberships")
      .insert(adminMembershipPayload)
      .select()
      .single();

    if (memErr) {
      const { data: fallbackMem, error: fallbackErr } = await supabaseAdmin
        .from("memberships")
        .insert(adminMembershipPayload)
        .select()
        .single();

      if (fallbackErr) {
        console.error("Admin membership creation error:", fallbackErr);
      } else {
        membership = fallbackMem;
      }
    } else {
      membership = primaryMem;
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      group: {
        ...group,
        admin_email: userEmail
      },
      membership
    });

  } catch (error: any) {
    console.error("Create group API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
