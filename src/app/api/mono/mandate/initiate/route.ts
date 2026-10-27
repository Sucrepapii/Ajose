import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getBankCode } from "@/utils/mono";
import { consumeQuota, createQuotaExceededResponse } from "@/utils/quotaManager";

export const dynamic = "force-dynamic";

/**
 * Initiates a live Mono Direct Debit Mandate (E-Mandate)
 * 
 * Supports both self-initiation by member, and Admin-initiated mandate generation
 * for circle members.
 * Includes cost controls:
 * 1. Checks and reuses existing active unexpired mandate session within 30 minutes
 * 2. Enforces daily usage quotas on mandate generation
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const body = await req.json().catch(() => ({}));
    const { groupId, amount: customAmount, targetUserId } = body;

    let targetUser = user;
    let isInitiatedByAdmin = false;

    // If an Admin is initiating a mandate link on behalf of a group member:
    if (targetUserId && targetUserId !== user.id) {
      if (!groupId) {
        return NextResponse.json({ error: "Group ID required to generate member mandate link." }, { status: 400 });
      }

      const { data: grp } = await adminClient
        .from("groups")
        .select("admin_id")
        .eq("id", groupId)
        .maybeSingle();

      if (!grp || grp.admin_id !== user.id) {
        return NextResponse.json({ error: "Only the Circle Admin can generate mandate links for members." }, { status: 403 });
      }

      const { data: authTarget } = await adminClient.auth.admin.getUserById(targetUserId);
      if (!authTarget?.user) {
        return NextResponse.json({ error: "Target member not found." }, { status: 404 });
      }

      targetUser = authTarget.user;
      isInitiatedByAdmin = true;
    }

    // Cost Control: Check daily mandate generation quota (5/day)
    const quotaResult = consumeQuota("MANDATE_INITIATION", targetUser.id);
    if (!quotaResult.allowed) {
      return createQuotaExceededResponse(quotaResult);
    }

    // Cost Control: Check for existing unexpired mandate created in the last 30 minutes
    const existingMandateId = targetUser.user_metadata?.mono_mandate_id;
    const existingMandateUrl = targetUser.user_metadata?.mono_mandate_url;
    const existingStatus = targetUser.user_metadata?.mono_mandate_status;
    const existingUpdatedAt = targetUser.user_metadata?.mono_mandate_updated_at;

    if (
      existingMandateId &&
      existingMandateUrl &&
      existingStatus === "awaiting_authorization" &&
      existingUpdatedAt
    ) {
      const timeDiff = Date.now() - new Date(existingUpdatedAt).getTime();
      if (timeDiff < 1_800_000) { // 30 minutes
        console.log(`[Mono Cost Control] Reusing existing active mandate link for user ${targetUser.id}`);
        return NextResponse.json({
          success: true,
          mandateId: existingMandateId,
          monoUrl: existingMandateUrl,
          reference: targetUser.user_metadata?.mono_mandate_reference || `ref_cached_${Date.now()}`,
          status: "awaiting_authorization",
          reused: true,
        });
      }
    }

    // Fetch target user profile from database
    const { data: profile, error: profileErr } = await adminClient
      .from("users")
      .select("id, email, phone, first_name, last_name, bank_name, account_number, account_name, bvn_verified")
      .eq("id", targetUser.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    let mandateAmountNaira = customAmount || 200000000;
    let groupName = "Àjọṣe Rotational Circle";

    if (groupId) {
      const { data: group } = await adminClient
        .from("groups")
        .select("name, contribution_amount, frequency, max_members, admin_id")
        .eq("id", groupId)
        .maybeSingle();

      if (group) {
        groupName = group.name;
        const cyclesPerYear = group.frequency === "daily" ? 365 
          : group.frequency === "weekly" ? 52 
          : group.frequency === "biweekly" ? 26 
          : 12;
        const totalRounds = Math.max(group.max_members || 1, cyclesPerYear);
        const isDaily = group.frequency === "daily";
        const isWeekly = group.frequency === "weekly";

        let feePct = 2.0;
        const profileFee = (profile as any)?.user_metadata?.custom_platform_fee_pct ?? (profile as any)?.custom_platform_fee_pct;
        if (typeof profileFee === "number" && profileFee >= 0) {
          feePct = profileFee;
        } else if (group.admin_id) {
          try {
            const { data: adminAuth } = await adminClient.auth.admin.getUserById(group.admin_id);
            const authFee = adminAuth?.user?.user_metadata?.custom_platform_fee_pct;
            if (typeof authFee === "number" && authFee >= 0) {
              feePct = authFee;
            }
          } catch {}
        }

        const automationFee = isDaily ? 100 : isWeekly ? 300 : Math.round(((group.contribution_amount || 400) * feePct) / 100);
        const perTurnDebit = (group.contribution_amount || 400) + automationFee;
        const circleCeiling = perTurnDebit * totalRounds;
        mandateAmountNaira = Math.max(customAmount || 0, circleCeiling, 200000000);
      }
    }

    const monoSecretKey = process.env.MONO_PAYMENTS_SECRET_KEY || process.env.MONO_SECRET_KEY;
    if (!monoSecretKey) {
      return NextResponse.json({ error: "Mono payments secret key is not configured." }, { status: 500 });
    }

    const rawRef = `mnd${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 6)}`;
    const reference = rawRef.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);

    const bankCode = getBankCode(profile.bank_name);
    const customerName = profile.account_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Account Holder";

    const customerEmail = profile.email || targetUser.email || "saver@ajose.ng";
    let customerPhone = profile.phone || (targetUser.user_metadata?.phone as string) || "08012345678";
    if (customerPhone.startsWith("+234")) {
      customerPhone = "0" + customerPhone.slice(4);
    } else if (customerPhone.startsWith("234")) {
      customerPhone = "0" + customerPhone.slice(3);
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://ajose.ng";
    const redirectUrl = `${origin}/dashboard/groups/${groupId || ""}?mandate=success&ref=${reference}`;

    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const isMmoBank = bankCode === "999992" || bankCode === "999991" || !profile.account_number;

    const initiatePayload: any = {
      amount: mandateAmountNaira * 100, // amount in kobo
      type: "recurring-debit",
      method: "mandate",
      mandate_type: "emandate",
      debit_type: "variable",
      description: "Àjọṣe Savings Mandate: Automated Contributions",
      reference,
      redirect_url: redirectUrl,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: "Lagos, Nigeria",
        identity: {
          type: "bvn",
          number: (targetUser.user_metadata?.bvn as string) || "22222222222"
        }
      },
      start_date: startDate,
      end_date: endDate
    };

    if (!isMmoBank && profile.account_number) {
      initiatePayload.account_number = profile.account_number;
      initiatePayload.bank_code = bankCode;
    }

    const monoRes = await fetch("https://api.withmono.com/v2/payments/initiate", {
      method: "POST",
      headers: {
        "mono-sec-key": monoSecretKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(initiatePayload)
    });

    const monoData = await monoRes.json();

    if (!monoRes.ok || monoData.status !== "successful") {
      console.error("[Mono Mandate Initiate Error]:", monoData);
      const errMsg = monoData.message || (monoData.data?.[0]?.message) || "Failed to initiate mandate with Mono.";
      return NextResponse.json({ error: errMsg }, { status: monoRes.status === 200 ? 400 : monoRes.status });
    }

    const mandateId = monoData.data?.mandate_id;
    const monoUrl = monoData.data?.mono_url;

    // Persist mandate metadata in Supabase Auth user_metadata
    await adminClient.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        mono_mandate_id: mandateId,
        mono_mandate_status: "awaiting_authorization",
        mono_mandate_reference: reference,
        mono_mandate_url: monoUrl,
        mono_mandate_updated_at: new Date().toISOString()
      }
    });

    // If initiated by Admin, send notification to member
    if (isInitiatedByAdmin) {
      await adminClient.from("notifications").insert({
        user_id: targetUser.id,
        title: `⚡ Action Required: Authorize Mandate for ${groupName}`,
        message: `Your Circle Admin has prepared your automated direct debit mandate (₦${mandateAmountNaira.toLocaleString()}). Please click to authorize it with your bank.`,
        type: "warning"
      });
    }

    return NextResponse.json({
      success: true,
      mandateId,
      monoUrl,
      reference,
      status: "awaiting_authorization"
    });

  } catch (err: any) {
    console.error("[Mono Mandate Initiate Exception]:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
