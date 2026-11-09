import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowLeft, 
  Settings, 
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Landmark,
  Clock,
  Sparkles,
  Building2,
  EyeOff,
  Coins
} from "lucide-react";
import { CopyInviteButton } from "@/components/CopyInviteButton";
import { OrganizerShareKitModal } from "@/components/OrganizerShareKitModal";
import { RulesModal } from "@/components/RulesModal";
import { ProcessPayoutClient } from "@/components/ProcessPayoutClient";
import { StartCycleClient } from "@/components/StartCycleClient";
import { MakeContributionClient } from "@/components/MakeContributionClient";
import { FlagMemberClient } from "@/components/FlagMemberClient";
import { SendRemindersClient } from "@/components/SendRemindersClient";
import { TriggerSweepClient } from "@/components/TriggerSweepClient";
import { ConfirmTransferClient } from "@/components/ConfirmTransferClient";
import { AuthorizeGroupMandateClient } from "@/components/AuthorizeGroupMandateClient";
import { PayoutHandshakeClient } from "@/components/PayoutHandshakeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GroupDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const groupId = params.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();

  const { data: group, error: groupError } = await adminClient
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    return (
      <div className="p-8 text-center animate-in fade-in bg-white border border-[#0B3022]/10 rounded-3xl max-w-lg mx-auto mt-10">
        <h1 className="text-2xl font-bold text-[#0B3022] mb-2">Circle Not Found</h1>
        <p className="text-[#0B3022]/65 text-sm mb-6">The circle you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/dashboard/groups" className="inline-flex px-6 py-2.5 rounded-full bg-[#0B3022] text-[#F3EEE3] text-xs font-bold hover:bg-[#124532]">
          Return to My Circles
        </Link>
      </div>
    );
  }

  const { data: members } = await adminClient
    .from('memberships')
    .select(`
      *,
      users (
        id,
        phone,
        first_name,
        last_name,
        nickname,
        credit_score,
        bvn_verified,
        auto_sweep_enabled,
        bank_name,
        account_number,
        account_name
      )
    `)
    .eq('group_id', groupId)
    .order('payout_turn', { ascending: true, nullsFirst: false })
    .order('joined_at', { ascending: true });

  const membersList = members || [];

  const monoSecretKey = process.env.MONO_PAYMENTS_SECRET_KEY || process.env.MONO_SECRET_KEY;
  const memberMandateMap = new Map<string, { mandateId: string | null; mandateStatus: string; mandateUrl: string | null }>();
  await Promise.all(
    membersList.map(async (m) => {
      try {
        const { data: authData } = await adminClient.auth.admin.getUserById(m.user_id);
        const mandateId = authData?.user?.user_metadata?.mono_mandate_id || null;
        let mandateStatus = authData?.user?.user_metadata?.mono_mandate_status || "not_initiated";
        const mandateUrl = authData?.user?.user_metadata?.mono_mandate_url || null;

        if (mandateId && mandateStatus !== "approved" && monoSecretKey) {
          try {
            const monoRes = await fetch(`https://api.withmono.com/v3/payments/mandates/${mandateId}`, {
              headers: {
                "mono-sec-key": monoSecretKey,
                "accept": "application/json"
              },
              next: { revalidate: 30 }
            });
            if (monoRes.ok) {
              const resJson = await monoRes.json();
              const mandate = resJson?.data;
              const isApproved = Boolean(
                mandate?.approved ||
                mandate?.ready_to_debit ||
                mandate?.status === "approved" ||
                mandate?.status === "active"
              );
              if (isApproved) {
                mandateStatus = "approved";
                adminClient.auth.admin.updateUserById(m.user_id, {
                  user_metadata: {
                    ...authData?.user?.user_metadata,
                    mono_mandate_id: mandateId,
                    mono_mandate_status: "approved",
                    mono_mandate_approved: true,
                    mono_mandate_ready_to_debit: true,
                    mono_mandate_approved_at: new Date().toISOString()
                  }
                }).catch(() => {});
              }
            }
          } catch (_) {}
        }

        memberMandateMap.set(m.user_id, {
          mandateId,
          mandateStatus,
          mandateUrl
        });
      } catch (_) {}
    })
  );

  const currentUserMembership = membersList.find(m => m.user_id === user.id);
  const currentUserMandate = memberMandateMap.get(user.id);
  const isContributingMember = currentUserMembership && (currentUserMembership.role !== 'admin' || (currentUserMembership.payout_turn && currentUserMembership.payout_turn > 0));
  const showMemberMandateBanner = isContributingMember && group.status === 'active' && currentUserMandate?.mandateStatus !== 'approved';

  const membershipIds = membersList.map(m => m.id);
  const membershipToUser = new Map(membersList.map(m => [m.id, m.user_id]));

  const { data: groupTransactions } = membershipIds.length > 0
    ? await adminClient
        .from('transactions')
        .select('*')
        .in('membership_id', membershipIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const txList = (groupTransactions || []).map((tx: any) => ({
    ...tx,
    user_id: tx.user_id || membershipToUser.get(tx.membership_id),
  }));

  const paidPayoutTurns = new Set(
    txList
      .filter(tx => tx.type === 'payout' && (tx.status === 'successful' || tx.status === 'completed'))
      .map(tx => tx.cycle_turn)
  );

  const maxPaidTurn = paidPayoutTurns.size > 0 ? Math.max(...Array.from(paidPayoutTurns)) : 0;
  const isCircleCompleted = group.status === 'completed' || maxPaidTurn >= (group.max_members || 1);
  const currentTurn = isCircleCompleted ? maxPaidTurn : (group.current_turn || (maxPaidTurn + 1));

  let isCooldownActive = false;
  let cooldownRemainingHours = 0;

  if (!isCircleCompleted && maxPaidTurn > 0 && currentTurn <= (group.max_members || 1)) {
    const lastPayoutTx = txList
      .filter(tx => tx.type === 'payout' && (tx.status === 'successful' || tx.status === 'completed') && tx.cycle_turn === maxPaidTurn)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (lastPayoutTx?.created_at) {
      const lastPayoutTime = new Date(lastPayoutTx.created_at).getTime();
      const elapsedMs = Date.now() - lastPayoutTime;
      const freq = (group.frequency || 'monthly').toLowerCase();
      let cooldownMs = 23 * 60 * 60 * 1000;
      if (freq === 'weekly') cooldownMs = 6 * 24 * 60 * 60 * 1000;
      else if (freq === 'biweekly' || freq === 'bi-weekly') cooldownMs = 13 * 24 * 60 * 60 * 1000;
      else if (freq === 'monthly') cooldownMs = 27 * 24 * 60 * 60 * 1000;
      else if (freq === 'daily') cooldownMs = 23 * 60 * 60 * 1000;

      if (elapsedMs < cooldownMs) {
        isCooldownActive = true;
        cooldownRemainingHours = Math.ceil((cooldownMs - elapsedMs) / (1000 * 60 * 60));
      }
    }
  }

  const completedContributions = txList
    .filter(tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && (tx.status === 'successful' || tx.status === 'completed'));

  const paidUserIds = new Set(
    completedContributions.map(tx => tx.user_id)
  );

  const lastContributionTimestamp = completedContributions.reduce((latest: number, tx: any) => {
    const txTime = tx.created_at ? new Date(tx.created_at).getTime() : 0;
    return txTime > latest ? txTime : latest;
  }, 0);

  const SETTLEMENT_CLEARANCE_WINDOW_MS = 48 * 60 * 60 * 1000;
  const clearanceTimestamp = lastContributionTimestamp ? lastContributionTimestamp + SETTLEMENT_CLEARANCE_WINDOW_MS : 0;
  const isSettlementCleared = clearanceTimestamp === 0 || Date.now() >= clearanceTimestamp;
  const settlementRemainingHours = clearanceTimestamp > 0 && !isSettlementCleared
    ? Math.max(1, Math.ceil((clearanceTimestamp - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const pendingPayoutTx = txList.find(
    tx => tx.cycle_turn === currentTurn && tx.type === 'payout' && tx.status === 'pending'
  );

  const pendingTransactions = txList.filter(
    tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && (tx.status === 'pending' || tx.status === 'pending_confirmation')
  );

  const failedMemberDebits = txList.filter(
    tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && tx.status === 'failed'
  );
  const failedMemberUserIds = new Set(failedMemberDebits.map(tx => tx.user_id));

  const failedAdminDebit = txList.find(
    tx => tx.status === 'failed' && (tx.type === 'admin_payout_debit' || tx.type === 'payout')
  );

  const adminMembership = membersList.find(m => m.role === 'admin');
  const adminUser = adminMembership?.users;
  const adminIsContributing = Boolean(adminMembership?.payout_turn && adminMembership.payout_turn > 0);

  const contributingMembers = membersList.filter(m => m.role !== 'admin' || (m.payout_turn !== null && m.payout_turn !== undefined && m.payout_turn > 0));
  const totalPool = group.contribution_amount * contributingMembers.length;
  const isAdmin = membersList.some(m => m.user_id === user.id && m.role === 'admin') || group.admin_id === user.id;
  const rawContributors = adminIsContributing ? membersList : contributingMembers;

  const displayContributors = [...rawContributors].sort((a, b) => {
    const turnA = typeof a.payout_turn === 'number' && a.payout_turn > 0 ? a.payout_turn : 999999;
    const turnB = typeof b.payout_turn === 'number' && b.payout_turn > 0 ? b.payout_turn : 999999;
    if (turnA !== turnB) {
      return turnA - turnB;
    }
    return new Date(a.joined_at || 0).getTime() - new Date(b.joined_at || 0).getTime();
  });

  const adminBankName = adminUser?.bank_name || (adminUser?.account_number ? 'Settlement Bank' : 'Pending Admin Setup');
  const adminRawAcct = adminUser?.account_number || '';
  const adminMaskedAccount = adminRawAcct && adminRawAcct.length >= 6 
    ? `${adminRawAcct.substring(0, 3)}****${adminRawAcct.substring(adminRawAcct.length - 3)}`
    : (adminRawAcct || 'Not Connected');
  const adminAccountHolder = adminUser?.account_name || (
    adminUser?.first_name ? `${adminUser.first_name} ${adminUser.last_name || ''}`.trim() : (adminRawAcct ? 'Group Admin' : 'Pending Admin Setup')
  );
  
  const receivingMember = membersList.find(m => m.payout_turn === currentTurn);
  
  let receivingMemberProfileName = 'Pending';
  if (receivingMember?.users) {
    const userProfile = receivingMember.users;
    if (userProfile.nickname) {
      receivingMemberProfileName = userProfile.nickname;
    } else if (userProfile.first_name || userProfile.last_name) {
      receivingMemberProfileName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
    } else if (userProfile.phone) {
      receivingMemberProfileName = userProfile.phone;
    } else {
      receivingMemberProfileName = `User-${String(receivingMember?.user_id || "0000").substring(0, 4)}`;
    }
  }

  const unpaidUserIds = contributingMembers
    .filter(m => !paidUserIds.has(m.user_id) && m.status === 'active')
    .map(m => m.user_id);

  const { count: adminGroupCount } = await adminClient
    .from('groups')
    .select('id', { count: 'exact', head: true })
    .eq('admin_id', group.admin_id);

  let customPlatformFeePct: number | null = null;
  try {
    const { data: adminAuthData } = await adminClient.auth.admin.getUserById(group.admin_id);
    const metaFee = adminAuthData?.user?.user_metadata?.custom_platform_fee_pct;
    if (typeof metaFee === "number" && metaFee >= 0) {
      customPlatformFeePct = metaFee;
    }
  } catch (err) {
    console.warn("Could not check admin auth for custom fee override:", err);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 w-full">
      
      {/* Header with Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link href="/dashboard/groups" className="p-2.5 rounded-full bg-white border border-[#0B3022]/15 text-[#0B3022] hover:border-[#D4A843] transition-colors shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-bold text-[#0B3022] tracking-tight truncate">{group.name}</h1>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold rounded-full shrink-0 ${
                  isCircleCompleted 
                    ? 'bg-[#D4A843] text-[#0B3022]' 
                    : group.status === 'active' 
                      ? 'bg-[#0B3022] text-[#D4A843]' 
                      : 'bg-[#D4A843]/20 text-[#0B3022] border border-[#D4A843]/40'
                }`}>
                  {isCircleCompleted ? 'COMPLETED' : group.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[#0B3022]/65 text-xs font-mono uppercase tracking-wider">Rotational Circle</span>
                <span className="text-[#0B3022]/30 text-sm">•</span>
                <span className="text-[#0B3022]/45 text-xs font-mono truncate max-w-[130px] sm:max-w-[160px]">ID: {groupId}</span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <Link 
              href={`/dashboard/groups/${groupId}/settings`}
              className="flex sm:hidden items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#0B3022]/15 text-[#0B3022] hover:border-[#D4A843] transition-colors font-bold text-xs shrink-0"
              title="Circle Settings"
            >
              <Settings className="h-4 w-4 text-[#D4A843]" />
              <span>Settings</span>
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 justify-end flex-wrap">
          {isAdmin && (
            <OrganizerShareKitModal 
              groupId={groupId}
              groupName={group.name}
              amount={group.contribution_amount}
              frequency={group.frequency}
              maxMembers={group.max_members}
              joinedCount={contributingMembers.length}
              minScore={group.min_credit_score ?? 0}
              adminCommissionPct={group.admin_commission_pct ?? 0}
              buttonLabel="Invite Kit"
              variant="primary"
            />
          )}

          {isAdmin && group.status === 'active' && !isCircleCompleted && (
            <>
              <TriggerSweepClient 
                groupId={groupId}
                groupName={group.name}
                currentTurn={currentTurn}
                pendingCount={unpaidUserIds.length}
                amount={group.contribution_amount}
                frequency={group.frequency}
                customFeePct={customPlatformFeePct}
                pendingMandateCount={contributingMembers.filter(m => memberMandateMap.get(m.user_id)?.mandateStatus !== 'approved').length}
              />
              <SendRemindersClient 
                unpaidUserIds={unpaidUserIds} 
                groupName={group.name} 
                currentTurn={currentTurn}
                amount={group.contribution_amount} 
                groupId={groupId}
              />
            </>
          )}

          {isAdmin && (
            <Link 
              href={`/dashboard/groups/${groupId}/settings`}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#0B3022]/15 text-[#0B3022] hover:border-[#D4A843] transition-colors font-bold text-xs"
              title="Circle Settings"
            >
              <Settings className="h-4 w-4 text-[#D4A843]" />
              <span>Settings</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2-Way Payout Handshake Card */}
      {pendingPayoutTx && (
        <PayoutHandshakeClient 
          groupId={groupId}
          groupName={group.name}
          turn={currentTurn}
          transactionId={pendingPayoutTx.id}
          amount={pendingPayoutTx.amount}
          recipientUserId={receivingMember?.user_id || ''}
          recipientName={receivingMemberProfileName}
          recipientBankName={receivingMember?.users?.bank_name}
          recipientAccountNumber={receivingMember?.users?.account_number}
          currentUserId={user.id}
          isAdmin={isAdmin}
        />
      )}

      {/* Pending Manual Bank Transfers Alert for Admin */}
      {isAdmin && pendingTransactions.length > 0 && (
        <div className="bg-white border border-[#D4A843] rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4A843]/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-[#0B3022]" />
            </div>
            <div>
              <h4 className="font-bold text-[#0B3022] text-sm">
                {pendingTransactions.length} Manual Bank Transfer{pendingTransactions.length > 1 ? 's' : ''} Awaiting Review
              </h4>
              <p className="text-xs text-[#0B3022]/65">
                Members reported bank transfers for Turn {currentTurn}. Mono is ready to match deposits on your bank statement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REQ 7: High-Priority Admin Auto-Debit Disruption Alert */}
      {failedAdminDebit && (
        <div className="bg-red-50 border-2 border-red-400 rounded-3xl p-6 animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                  ADMIN PAYOUT AUTO-DEBIT FAILED
                </span>
                <span className="text-xs font-bold text-red-700">Turn {failedAdminDebit.cycle_turn || currentTurn} Payout Disrupted</span>
              </div>
              <p className="text-sm font-bold text-red-950">
                The automated payout debit from Admin&apos;s tendered account ({adminBankName} - {adminMaskedAccount}) has failed.
              </p>
              <p className="text-xs text-red-800 leading-relaxed">
                {failedAdminDebit.description || "The bank returned an insufficient funds or mandate error. Àjọṣe is not a bank and does not hold user funds. Contributions are held in the Admin settlement account and auto-debited to the collector."} All members are notified transparently. The Admin must fund the account and re-trigger auto-payout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Required: Direct Debit Mandate Banner for Contributing Member */}
      {showMemberMandateBanner && (
        <AuthorizeGroupMandateClient 
          groupId={groupId}
          groupName={group.name}
          contributionAmount={group.contribution_amount}
          frequency={group.frequency}
          customFeePct={customPlatformFeePct}
          userId={user.id}
          initialMandateId={currentUserMandate?.mandateId}
          initialMandateStatus={currentUserMandate?.mandateStatus}
          initialMandateUrl={currentUserMandate?.mandateUrl}
          bankName={currentUserMembership?.users?.bank_name}
          accountNumber={currentUserMembership?.users?.account_number}
        />
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-5">
          <h3 className="text-[#0B3022]/60 text-[11px] font-mono font-bold mb-1.5 uppercase tracking-[0.14em]">Contribution</h3>
          <p className="text-2xl font-bold font-mono text-[#0B3022] flex items-baseline gap-1">
            ₦{group.contribution_amount.toLocaleString()}<span className="text-xs font-sans font-normal text-[#0B3022]/50 capitalize">/{group.frequency}</span>
          </p>
        </div>
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-5">
          <h3 className="text-[#0B3022]/60 text-[11px] font-mono font-bold mb-1.5 uppercase tracking-[0.14em]">Total Pool</h3>
          <p className="text-2xl font-bold font-mono text-[#0B3022]">₦{totalPool.toLocaleString()}</p>
        </div>
        {isCircleCompleted ? (
          <div className="bg-[#0B3022] border border-[#0B3022] rounded-3xl p-5 relative overflow-hidden text-[#F3EEE3]">
            <h3 className="text-[#D4A843] text-[11px] font-mono font-bold mb-1.5 uppercase tracking-[0.14em] relative z-10">Cycle Status</h3>
            <p className="text-xl font-bold text-[#F3EEE3] relative z-10 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#D4A843]" /> Completed
            </p>
            <span className="text-[11px] text-[#F3EEE3]/65 block mt-1 relative z-10">
              All {group.max_members} rotational turns disbursed
            </span>
          </div>
        ) : (
          <div className="bg-[#0B3022] border border-[#0B3022] rounded-3xl p-5 relative overflow-hidden text-[#F3EEE3]">
            <h3 className="text-[#F3EEE3]/65 text-[11px] font-mono font-bold mb-1.5 uppercase tracking-[0.14em] relative z-10">Collecting Next (Turn {currentTurn})</h3>
            <p className="text-xl font-bold text-[#D4A843] truncate relative z-10">{receivingMemberProfileName}</p>
            {isCooldownActive && (
              <span className="text-[11px] font-mono text-[#F3EEE3]/70 block mt-1.5 relative z-10">
                Opens in ~{cooldownRemainingHours}h ({group.frequency} cycle)
              </span>
            )}
          </div>
        )}
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-5">
          <h3 className="text-[#0B3022]/60 text-[11px] font-mono font-bold mb-1.5 uppercase tracking-[0.14em]">Members</h3>
          <p className="text-2xl font-bold font-mono text-[#0B3022]">{contributingMembers.length}/{group.max_members}</p>
        </div>
      </div>

      {/* Start Cycle Banner for Admins if Pending */}
      {group.status === 'pending' && isAdmin && (
        <StartCycleClient 
          groupId={groupId} 
          groupName={group.name}
          currentMembersCount={contributingMembers.length}
          maxMembers={group.max_members}
          contributionAmount={group.contribution_amount}
          frequency={group.frequency}
        />
      )}

      {/* Pending status banner for non-admin members */}
      {group.status === 'pending' && !isAdmin && (
        <div className="bg-white border border-[#0B3022]/15 rounded-3xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            {contributingMembers.length >= group.max_members ? (
              <CheckCircle2 className="h-5 w-5 text-[#0B3022] shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-[#D4A843] shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <p className="text-sm font-bold text-[#0B3022]">
                {contributingMembers.length >= group.max_members 
                  ? "Circle Roster is Complete" 
                  : `Awaiting Members (${contributingMembers.length}/${group.max_members} Joined)`}
              </p>
              <p className="text-xs text-[#0B3022]/65">
                {contributingMembers.length >= group.max_members
                  ? "All member slots are filled! The Circle Trustee is preparing to officially launch Round 1."
                  : `Waiting for ${group.max_members - contributingMembers.length} more member${group.max_members - contributingMembers.length > 1 ? 's' : ''} to join before the trustee launches Round 1.`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-full self-start sm:self-auto shrink-0 bg-[#0B3022] text-[#D4A843]">
            {contributingMembers.length >= group.max_members ? "Ready for Trustee to Start" : `${group.max_members - contributingMembers.length} Slot(s) Open`}
          </span>
        </div>
      )}

      {/* REQ 7: Admin Tendered Settlement Account & Pass-Through Card */}
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#0B3022] flex items-center justify-center shrink-0">
              <Landmark className="h-5 w-5 text-[#D4A843]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[#0B3022] font-bold text-base">Admin Tendered Settlement Account</h3>
                <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
                  failedAdminDebit 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-[#0B3022] text-[#D4A843]'
                }`}>
                  {failedAdminDebit ? 'MANDATE DISRUPTED' : 'AUTO-DEBIT MANDATE ACTIVE'}
                </span>
              </div>
              <p className="text-[#0B3022]/65 text-xs leading-relaxed max-w-2xl">
                Àjọṣe is not a bank. We do not hold pooled money. All contributions flow directly into this tendered account and are auto-debited to each turn&apos;s recipient (100% complete pot, minus only {group.admin_commission_pct}% admin cut if configured). Platform protection fees are handled upfront at auto-debit.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <div>
                  <span className="text-[#0B3022]/50">Bank: </span>
                  <span className="font-bold text-[#0B3022]">{adminBankName}</span>
                </div>
                <div>
                  <span className="text-[#0B3022]/50">Account: </span>
                  <span className="font-mono font-bold text-[#0B3022]">{adminMaskedAccount}</span>
                </div>
                <div>
                  <span className="text-[#0B3022]/50">Holder: </span>
                  <span className="font-bold text-[#0B3022]">{adminAccountHolder}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-3">
            <RulesModal />
          </div>
        </div>
      </div>

      {/* Organizer Commission Earnings Card for Admin */}
      {isAdmin && (group.admin_commission_pct || 0) > 0 && (
        <div className="bg-white border border-[#D4A843]/40 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#D4A843]/20 flex items-center justify-center shrink-0">
              <Coins className="h-5 w-5 text-[#0B3022]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#0B3022] text-sm">
                  Your Organizer Commission: {group.admin_commission_pct}%
                </h4>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0B3022] text-[#D4A843] px-2.5 py-0.5 rounded-full">
                  Admin Compensation
                </span>
              </div>
              <p className="text-xs text-[#0B3022]/70 mt-0.5">
                You earn approximately <strong className="font-mono text-[#0B3022]">₦{Math.round(((group.admin_commission_pct || 0) / 100) * totalPool).toLocaleString()}</strong> upon round payout for organizing and maintaining this circle.
              </p>
            </div>
          </div>
          <OrganizerShareKitModal 
            groupId={groupId} 
            groupName={group.name} 
            amount={group.contribution_amount}
            frequency={group.frequency}
            maxMembers={group.max_members}
            joinedCount={contributingMembers.length}
            minScore={group.min_credit_score ?? 0}
            adminCommissionPct={group.admin_commission_pct ?? 0}
            buttonLabel="Invite More"
            variant="secondary"
          />
        </div>
      )}

      {/* Separate Admin Table Above (If Admin is NOT currently contributing) */}
      {!adminIsContributing && adminMembership && (
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-[#0B3022]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B3022] text-[#F3EEE3]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4A843]/20 border border-[#D4A843]/40 flex items-center justify-center text-[#D4A843] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#F3EEE3]">Circle Organizer &amp; Trustee</h2>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D4A843] text-[#0B3022] px-2.5 py-0.5 rounded-full">
                    Non-Contributing Admin
                  </span>
                </div>
                <p className="text-xs text-[#F3EEE3]/70">
                  Manages circle compliance, settlement mandate, and automated payouts without taking a rotational contribution turn.
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono uppercase tracking-wider bg-[#F3EEE3]/[0.08] border border-[#F3EEE3]/15 px-3 py-1.5 rounded-full text-[#F3EEE3] shrink-0 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
              <span>Settlement Account Active</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3EEE3]/70 text-[#0B3022]/60 text-[11px] font-mono font-bold uppercase tracking-wider border-b border-[#0B3022]/10">
                  <th className="px-6 py-3.5">Organizer</th>
                  <th className="px-6 py-3.5">Role &amp; Settlement</th>
                  <th className="px-6 py-3.5">Verification Status</th>
                  <th className="px-6 py-3.5">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B3022]/10">
                <tr className="hover:bg-[#F3EEE3]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B3022] text-[#D4A843] flex items-center justify-center text-xs font-mono font-bold uppercase">
                        {(adminUser?.first_name || adminUser?.nickname || 'A').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0B3022]">
                          {`${adminUser?.first_name || ''} ${adminUser?.last_name || ''}`.trim() || adminUser?.nickname || 'Circle Admin'}
                        </p>
                        <p className="text-xs text-[#0B3022]/55 font-mono">
                          {adminUser?.phone || 'Verified Organizer'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-[#0B3022] text-[#D4A843] px-2.5 py-0.5 rounded-full inline-block">
                        Admin Trustee
                      </span>
                      {adminBankName && (
                        <p className="text-xs text-[#0B3022]/70 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-[#0B3022]/45" />
                          <span>{adminBankName} {adminRawAcct ? `(•••• ${adminRawAcct.slice(-4)})` : ''}</span>
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {adminUser?.bvn_verified ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#D4A843] bg-[#0B3022] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#D4A843]" /> Verified BVN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022] bg-[#D4A843]/20 border border-[#D4A843]/40 px-2.5 py-1 rounded-full">
                        Pending Verification
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022] bg-[#F3EEE3] border border-[#0B3022]/15 px-2.5 py-1 rounded-full">
                      Organizer (0 Turns)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contributors List Table */}
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[#0B3022]/10 flex items-center justify-between bg-[#F3EEE3]/50">
          <div>
            <h2 className="text-lg font-bold text-[#0B3022]">Contributors Roster ({contributingMembers.length}/{group.max_members})</h2>
            <p className="text-xs text-[#0B3022]/60">
              Savers actively taking a rotational turn in this circle.
            </p>
          </div>
          
          {contributingMembers.length < group.max_members && (
            <CopyInviteButton 
              groupId={groupId} 
              groupName={group.name} 
              amount={group.contribution_amount}
              frequency={group.frequency}
              maxMembers={group.max_members}
              minScore={group.min_credit_score ?? 0}
              adminCommissionPct={group.admin_commission_pct ?? 0}
            />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3EEE3]/70 text-[#0B3022]/60 text-[11px] font-mono font-bold uppercase tracking-wider border-b border-[#0B3022]/10">
                <th className="px-6 py-4">Turn</th>
                <th className="px-6 py-4">Contributor</th>
                <th className="px-6 py-4">Contribution Status</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0B3022]/10">
              {displayContributors.map((m) => {
                const userProfile = m.users;
                
                const realName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || `User-${String(m?.user_id || "0000").substring(0, 4)}`;
                const hasAlias = Boolean(userProfile?.nickname);

                const isSelf = m.user_id === user.id;

                let displayName = realName;
                let showAnonymousBadge = false;
                let adminAliasNote = "";

                if (hasAlias) {
                  if (isAdmin) {
                    displayName = realName;
                    adminAliasNote = userProfile?.nickname || "";
                  } else if (isSelf) {
                    displayName = `${realName} (${userProfile?.nickname})`;
                  } else {
                    displayName = userProfile?.nickname || `Saver #${m.payout_turn}`;
                    showAnonymousBadge = true;
                  }
                }

                const isTurn = !isCircleCompleted && receivingMember?.id === m.id;
                const isPaid = isCircleCompleted || paidUserIds.has(m.user_id);
                const hasFailedDebit = failedMemberUserIds.has(m.user_id);

                return (
                  <tr key={m.id} className={`transition-colors ${m.status === 'defaulted' ? 'bg-red-50' : isTurn ? 'bg-[#F3EEE3]/60' : 'hover:bg-[#F3EEE3]/30'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.payout_turn ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                          isTurn 
                            ? "bg-[#0B3022] text-[#D4A843]" 
                            : "bg-[#F3EEE3] text-[#0B3022] border border-[#0B3022]/10"
                        }`}>
                          <span>Turn {m.payout_turn}</span>
                          {isTurn && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843] animate-pulse" title="Receives Payout Next" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#0B3022]/45 font-mono italic">
                          {m.role === 'admin' ? 'Admin Trustee' : 'Unassigned'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold uppercase ${m.status === 'defaulted' ? 'bg-red-100 text-red-600' : 'bg-[#0B3022] text-[#D4A843]'}`}>
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${m.status === 'defaulted' ? 'text-red-700' : 'text-[#0B3022]'}`}>{displayName}</p>
                            {showAnonymousBadge && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#0B3022] bg-[#F3EEE3] border border-[#0B3022]/15 px-1.5 py-0.5 rounded">
                                <EyeOff className="h-2.5 w-2.5" /> Anonymous
                              </span>
                            )}
                            {adminAliasNote && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#0B3022]/60 bg-[#F3EEE3] px-1.5 py-0.5 rounded">
                                Alias: {adminAliasNote}
                              </span>
                            )}
                          </div>
                          {isTurn && (
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <p className="text-[11px] font-mono uppercase tracking-wider text-[#0B3022] font-bold bg-[#D4A843]/25 border border-[#D4A843]/40 px-2 py-0.5 rounded">
                                Receives Payout Next
                              </p>
                              {m.status === 'defaulted' ? (
                                <span className="text-xs text-red-600 font-bold">Cannot process payout while defaulted</span>
                              ) : unpaidUserIds.length > 0 ? (
                                <span 
                                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#0B3022]/70 bg-[#F3EEE3] border border-[#0B3022]/15 px-2.5 py-1 rounded-full"
                                  title="Turn contributions must be debited from members before payout can be disbursed"
                                >
                                  <Clock className="h-3.5 w-3.5 text-[#D4A843] shrink-0" />
                                  <span>
                                    {paidUserIds.size === 0 
                                      ? "Awaiting Turn Debits" 
                                      : `Awaiting Debits (${paidUserIds.size}/${contributingMembers.length} Paid)`}
                                  </span>
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {!isSettlementCleared && (
                                    <span 
                                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#0B3022] bg-[#D4A843]/25 border border-[#D4A843]/40 px-2.5 py-0.5 rounded-full"
                                      title="Contributions settle via NIBSS within 48 hours"
                                    >
                                      <Clock className="h-3 w-3 text-[#0B3022] animate-pulse" />
                                      <span>Clearing (~{settlementRemainingHours}h)</span>
                                    </span>
                                  )}
                                  <ProcessPayoutClient 
                                    group={group} 
                                    receivingMember={receivingMember} 
                                    isAdmin={isAdmin} 
                                    currentTurn={currentTurn} 
                                    adminGroupCount={adminGroupCount || 1}
                                    customPlatformFeePct={customPlatformFeePct}
                                    isSettlementCleared={isSettlementCleared}
                                    settlementRemainingHours={settlementRemainingHours}
                                    clearanceTime={clearanceTimestamp ? new Date(clearanceTimestamp).toISOString() : null}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const userPendingTx = pendingTransactions.find(tx => tx.user_id === m.user_id);
                        const isPending = Boolean(userPendingTx);
                        const userCompletedTx = txList.find(tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && tx.status === 'completed' && tx.user_id === m.user_id);
                        const isReserveCovered = userCompletedTx?.description?.toLowerCase().includes('reserve pool') || userCompletedTx?.description?.toLowerCase().includes('credit direct') || userCompletedTx?.description?.toLowerCase().includes('cdl');
                        const isManualPaid = userCompletedTx?.description?.toLowerCase().includes('manual') || userCompletedTx?.description?.toLowerCase().includes('mono verified');

                        if (isCircleCompleted) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#D4A843] bg-[#0B3022] px-3 py-1 rounded-full">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#D4A843]" /> Cycle Cleared
                            </span>
                          );
                        }

                        if (m.role === 'admin') {
                          return (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4A843] font-bold bg-[#0B3022] px-2.5 py-1 rounded-full inline-block whitespace-nowrap">
                              <span className="hidden sm:inline">Admin Settlement Mandate</span>
                              <span className="sm:hidden">Admin</span>
                            </span>
                          );
                        }

                        if (isReserveCovered) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022] bg-[#F3EEE3] border border-[#0B3022]/15 px-3 py-1 rounded-full">
                              <ShieldCheck className="h-3.5 w-3.5 text-[#D4A843]" /> Advanced by Reserve Pool
                            </span>
                          );
                        }

                        if (isPaid) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#D4A843] bg-[#0B3022] px-3 py-1 rounded-full">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#D4A843]" /> {isManualPaid ? "Paid (Manual)" : "Paid (Auto-Debit)"}
                            </span>
                          );
                        }

                        if (isPending) {
                          return (
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022] bg-[#D4A843]/25 border border-[#D4A843]/40 px-3 py-1 rounded-full">
                                <Clock className="h-3.5 w-3.5 text-[#0B3022] animate-spin" /> Transfer Awaiting Review
                              </span>
                              {isAdmin && userPendingTx && (
                                <div>
                                  <ConfirmTransferClient 
                                    transaction={userPendingTx}
                                    groupId={groupId}
                                    currentTurn={currentTurn}
                                    memberName={displayName}
                                    adminBankName={adminBankName}
                                  />
                                </div>
                              )}
                              {!isAdmin && m.user_id === user.id && (
                                <div>
                                  <MakeContributionClient 
                                    groupId={groupId} 
                                    userId={user.id} 
                                    amount={group.contribution_amount} 
                                    currentTurn={currentTurn} 
                                    frequency={group.frequency}
                                    customFeePct={customPlatformFeePct}
                                    adminBankDetails={{
                                      bankName: adminBankName,
                                      accountNumber: adminRawAcct,
                                      accountHolder: adminAccountHolder
                                    }}
                                    pendingTransaction={userPendingTx}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (hasFailedDebit) {
                          return (
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-red-700 bg-red-100 border border-red-200 px-3 py-1 rounded-full">
                                <AlertCircle className="h-3.5 w-3.5 text-red-600" /> Auto-Debit Failed
                              </span>
                              {m.user_id === user.id && group.status === 'active' && (
                                <div>
                                  <MakeContributionClient 
                                    groupId={groupId} 
                                    userId={user.id} 
                                    amount={group.contribution_amount} 
                                    currentTurn={currentTurn} 
                                    frequency={group.frequency}
                                    customFeePct={customPlatformFeePct}
                                    adminBankDetails={{
                                      bankName: adminBankName,
                                      accountNumber: adminRawAcct,
                                      accountHolder: adminAccountHolder
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (m.user_id === user.id && group.status === 'active') {
                          return (
                            <MakeContributionClient 
                              groupId={groupId} 
                              userId={user.id} 
                              amount={group.contribution_amount} 
                              currentTurn={currentTurn} 
                              frequency={group.frequency}
                              customFeePct={customPlatformFeePct}
                              adminBankDetails={{
                                bankName: adminBankName,
                                accountNumber: adminRawAcct,
                                accountHolder: adminAccountHolder
                              }}
                            />
                          );
                        }

                        return (
                          <span className="text-[11px] font-mono text-[#0B3022]/50 font-bold uppercase tracking-wider">
                            Pending Sweep
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        {userProfile?.bvn_verified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#D4A843] bg-[#0B3022] px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 text-[#D4A843]" /> Verified BVN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022]/60 bg-[#F3EEE3] border border-[#0B3022]/15 px-2.5 py-0.5 rounded-full">
                            Unverified
                          </span>
                        )}

                        {m.role !== 'admin' && (() => {
                          const memMandate = memberMandateMap.get(m.user_id);
                          if (memMandate?.mandateStatus === 'approved') {
                            return (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022] bg-[#D4A843]/25 border border-[#D4A843]/40 px-2 py-0.5 rounded-full">
                                  <ShieldCheck className="h-3 w-3 text-[#0B3022]" /> Mandate Active
                                </span>
                              </div>
                            );
                          }
                          if (memMandate?.mandateStatus === 'awaiting_authorization') {
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022] bg-[#F3EEE3] border border-[#D4A843] px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3 text-[#D4A843]" /> Mandate Pending
                                </span>
                                {isAdmin && memMandate?.mandateUrl && (
                                  <a
                                    href={memMandate.mandateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-[#0B3022] underline decoration-[#D4A843] font-bold"
                                    title="Open hosted authorization link"
                                  >
                                    Authorize Link ↗
                                  </a>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B3022]/60 bg-[#F3EEE3] border border-[#0B3022]/15 px-2 py-0.5 rounded-full">
                                <AlertCircle className="h-3 w-3 text-[#0B3022]/50" /> Mandate Needed
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {m.status === 'defaulted' ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                            DEFAULTED
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[#0B3022] font-bold uppercase tracking-wider">Active</span>
                        )}

                        {isAdmin && m.role !== 'admin' && (
                          (!isPaid && group.status === 'active' || m.status === 'defaulted') && (
                            <FlagMemberClient 
                              membershipId={m.id} 
                              currentStatus={m.status} 
                              memberName={displayName} 
                              userId={m.user_id}
                            />
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {displayContributors.length === 0 && (
            <div className="p-8 text-center text-[#0B3022]/50 text-sm">
              No contributors have joined this circle yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
