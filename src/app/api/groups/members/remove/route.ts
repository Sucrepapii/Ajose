import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { initiateMonoDirectDebit, initiatePayoutWithMono, getBankCode } from "@/utils/mono";

export async function POST(req: Request) {
  try {
    const { groupId, membershipId, fineAmount: customFine, reason } = await req.json();

    if (!groupId || !membershipId) {
      return NextResponse.json(
        { error: "groupId and membershipId are required" },
        { status: 400 }
      );
    }

    // 1. Authenticate requesting user
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 2. Verify requesting user is the Group Admin
    const { data: group, error: groupErr } = await supabaseAdmin
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupErr || !group) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    const { data: adminMembership } = await supabaseAdmin
      .from("memberships")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = adminMembership?.role === "admin" || group.admin_id === user.id;
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only the group Admin trustee can remove members." },
        { status: 403 }
      );
    }

    // 3. Fetch target membership
    const { data: targetMember, error: memberErr } = await supabaseAdmin
      .from("memberships")
      .select("*, users(*)")
      .eq("id", membershipId)
      .eq("group_id", groupId)
      .single();

    if (memberErr || !targetMember) {
      return NextResponse.json({ error: "Member not found in this group." }, { status: 404 });
    }

    if (targetMember.role === "admin") {
      return NextResponse.json(
        { error: "Cannot remove the Admin trustee of the group." },
        { status: 400 }
      );
    }

    const isCycleActive = group.status === "active";
    const currentTurn = group.current_turn || 1;
    const memberTurn = targetMember.payout_turn || 1;
    const hasAlreadyCollected = memberTurn < currentTurn;

    // SCENARIO 1: Cycle has NOT started (pending) -> Remove cleanly, NO FINE
    if (!isCycleActive) {
      const { error: deleteErr } = await supabaseAdmin
        .from("memberships")
        .delete()
        .eq("id", membershipId);

      if (deleteErr) throw deleteErr;

      // Re-index remaining members payout turns cleanly
      const { data: remainingMembers } = await supabaseAdmin
        .from("memberships")
        .select("id, payout_turn")
        .eq("group_id", groupId)
        .neq("role", "admin")
        .order("payout_turn", { ascending: true });

      if (remainingMembers && remainingMembers.length > 0) {
        for (let i = 0; i < remainingMembers.length; i++) {
          await supabaseAdmin
            .from("memberships")
            .update({ payout_turn: i + 1 })
            .eq("id", remainingMembers[i].id);
        }
      }

      return NextResponse.json({
        success: true,
        isMidCycle: false,
        fineApplied: 0,
        message: `Member removed from roster before cycle launch. No fines or penalties applied.`
      });
    }

    // SCENARIO 2: Cycle is ACTIVE (mid-cycle) -> Levy 15% Fine (10% Admin, 5% Ajose)
    const contribAmount = group.contribution_amount || 50000;
    const adminShare = Math.round(contribAmount * 0.10);
    const platformShare = Math.round(contribAmount * 0.05);
    const defaultTotalFine = adminShare + platformShare; // 15% total

    const fineToApply = typeof customFine === "number" && customFine >= 0 ? customFine : defaultTotalFine;
    const actualAdminShare = Math.round(fineToApply * (10 / 15));
    const actualPlatformShare = fineToApply - actualAdminShare;

    // 1. Execute Mono Direct Debit for the 15% exit fine from the departing member
    let monoDebitResult: any = null;
    if (fineToApply > 0) {
      const debitRef = `ajose_fine_debit_${groupId}_${targetMember.user_id}_${Date.now()}`;
      monoDebitResult = await initiateMonoDirectDebit({
        mandateId: (targetMember.users as any)?.mono_mandate_id,
        amount: fineToApply,
        narration: `Àjọṣe Mid-Cycle 15% Departure Fine (${group.name})`,
        reference: debitRef
      });

      // Record fine penalty transaction in ledger
      await supabaseAdmin.from("transactions").insert({
        group_id: groupId,
        user_id: targetMember.user_id,
        amount: fineToApply,
        type: "penalty",
        status: monoDebitResult.success ? "completed" : "pending",
        description: `Mid-cycle exit fine: 15% (₦${fineToApply.toLocaleString()}) collected via Mono Direct Debit (Ref: ${monoDebitResult.reference})`
      });
    }

    // 2. Execute Mono Payout for the 10% Admin compensation share to the Admin's bank account
    let monoAdminPayoutResult: any = null;
    if (actualAdminShare > 0) {
      const { data: adminUser } = await supabaseAdmin
        .from("users")
        .select("first_name, last_name, bank_name, account_number, account_name")
        .eq("id", group.admin_id || user.id)
        .single();

      const payoutRef = `ajose_fine_admin_payout_${groupId}_${Date.now()}`;
      monoAdminPayoutResult = await initiatePayoutWithMono({
        recipientAccountNumber: adminUser?.account_number || "0123456789",
        recipientBankCode: getBankCode(adminUser?.bank_name),
        amount: actualAdminShare,
        narration: `Àjọṣe Fine: 10% Admin Share (${group.name})`,
        reference: payoutRef
      });

      // Record Admin payout transaction in ledger
      await supabaseAdmin.from("transactions").insert({
        group_id: groupId,
        user_id: group.admin_id || user.id,
        amount: actualAdminShare,
        type: "payout",
        status: monoAdminPayoutResult.success ? "completed" : "pending",
        description: `Admin 10% departure compensation (₦${actualAdminShare.toLocaleString()}) disbursed via Mono Payout (Ref: ${monoAdminPayoutResult.reference})`
      });
    }

    // 3. Record 5% platform share in ledger
    if (actualPlatformShare > 0) {
      await supabaseAdmin.from("transactions").insert({
        group_id: groupId,
        user_id: user.id,
        amount: actualPlatformShare,
        type: "platform_fee",
        status: "completed",
        description: `Àjọṣe 5% platform handling fee (₦${actualPlatformShare.toLocaleString()}) for Turn ${memberTurn} exit`
      });
    }

    // 2. Adjust credit score
    // -50 points if already collected (material default); -25 points if leaving before turn
    const scorePenalty = hasAlreadyCollected ? 50 : 25;
    const currentScore = targetMember.users?.credit_score ?? 80;
    const newScore = Math.max(20, currentScore - scorePenalty);

    await supabaseAdmin
      .from("users")
      .update({ credit_score: newScore })
      .eq("id", targetMember.user_id);

    // 3. Send notification to user with specific wait-turn / payment terms
    const notifMessage = hasAlreadyCollected
      ? `You were removed from '${group.name}' after receiving your payout. A 15% breach fine of ₦${fineToApply.toLocaleString()} (10% to Admin, 5% to Àjọṣe) has been levied and your Mono mandate remains active for scheduled collections.`
      : `You exited '${group.name}' mid-cycle. A 15% departure fine of ₦${fineToApply.toLocaleString()} (10% to Admin, 5% to Àjọṣe) was levied. Per Àjọṣe rules, you must wait until Turn ${memberTurn} to collect your reconciled past contributions minus the fine.`;

    await supabaseAdmin.from("notifications").insert({
      user_id: targetMember.user_id,
      title: "Mid-Cycle Exit Fine Levied (15%)",
      message: notifMessage,
      type: "warning"
    });

    // 4. Delete the membership so the turn slot is opened for an Admin replacement member
    const { error: deleteErr } = await supabaseAdmin
      .from("memberships")
      .delete()
      .eq("id", membershipId);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({
      success: true,
      isMidCycle: true,
      hasAlreadyCollected,
      fineApplied: fineToApply,
      adminShare: actualAdminShare,
      platformShare: actualPlatformShare,
      vacatedTurn: memberTurn,
      mustWaitTurn: !hasAlreadyCollected,
      message: hasAlreadyCollected
        ? `Member removed mid-cycle. 15% fine of ₦${fineToApply.toLocaleString()} levied (10% to Admin, 5% to Àjọṣe). Defaulter owes remaining rounds.`
        : `Member removed mid-cycle. 15% fine of ₦${fineToApply.toLocaleString()} levied (10% to Admin, 5% to Àjọṣe). Member must wait until Turn ${memberTurn} to collect net funds. Turn ${memberTurn} is now open for replacement.`
    });

  } catch (err: any) {
    console.error("Remove member API error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to remove member." },
      { status: 500 }
    );
  }
}
