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
  Zap,
  RefreshCw,
  Users,
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

  // Fetch the group details using adminClient to ensure complete data
  const { data: group, error: groupError } = await adminClient
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    return (
      <div className="p-8 text-center animate-in fade-in">
        <h1 className="text-2xl font-bold text-white mb-4">Group Not Found</h1>
        <p className="text-zinc-400 mb-8">The group you're looking for doesn't exist or you don't have access.</p>
        <Link href="/dashboard/groups" className="text-emerald-400 hover:underline">
          Return to My Groups
        </Link>
      </div>
    );
  }

  // Fetch the members of the group with user details including bank credentials for pass-through transparency
  const { data: members, error: membersError } = await adminClient
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

  // Fetch mandate metadata for all members with live Mono auto-sync fallback
  const monoSecretKey = process.env.MONO_PAYMENTS_SECRET_KEY || process.env.MONO_SECRET_KEY;
  const memberMandateMap = new Map<string, { mandateId: string | null; mandateStatus: string; mandateUrl: string | null }>();
  await Promise.all(
    membersList.map(async (m) => {
      try {
        const { data: authData } = await adminClient.auth.admin.getUserById(m.user_id);
        let mandateId = authData?.user?.user_metadata?.mono_mandate_id || null;
        let mandateStatus = authData?.user?.user_metadata?.mono_mandate_status || "not_initiated";
        let mandateUrl = authData?.user?.user_metadata?.mono_mandate_url || null;

        // Auto-heal / Live Check: if mandate exists but not marked approved in metadata, verify with Mono live API
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
                // Background sync into Supabase Auth user_metadata
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

  // Map memberships to user IDs
  const membershipIds = membersList.map(m => m.id);
  const membershipToUser = new Map(membersList.map(m => [m.id, m.user_id]));

  // Fetch group transactions using membership_id foreign keys
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

  // Completed payouts for this group
  const paidPayoutTurns = new Set(
    txList
      .filter(tx => tx.type === 'payout' && (tx.status === 'successful' || tx.status === 'completed'))
      .map(tx => tx.cycle_turn)
  );

  // Derive current turn from completed payout transactions or group.current_turn
  const maxPaidTurn = paidPayoutTurns.size > 0 ? Math.max(...Array.from(paidPayoutTurns)) : 0;
  const currentTurn = group.current_turn || (maxPaidTurn + 1);

  // Completed contributions for this turn
  const paidUserIds = new Set(
    txList
      .filter(tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && (tx.status === 'successful' || tx.status === 'completed'))
      .map(tx => tx.user_id)
  );

  // Pending manual bank transfers awaiting admin confirmation
  const pendingTransactions = txList.filter(
    tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && (tx.status === 'pending' || tx.status === 'pending_confirmation')
  );
  const pendingUserIds = new Set(pendingTransactions.map(tx => tx.user_id));

  // Failed member auto-debits for this turn
  const failedMemberDebits = txList.filter(
    tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && tx.status === 'failed'
  );
  const failedMemberUserIds = new Set(failedMemberDebits.map(tx => tx.user_id));

  // Check if Admin payout auto-debit failed (Req 7)
  const failedAdminDebit = txList.find(
    tx => tx.status === 'failed' && (tx.type === 'admin_payout_debit' || tx.type === 'payout')
  );

  // Admin Profile & Settlement Bank Account Details
  const adminMembership = membersList.find(m => m.role === 'admin');
  const adminUser = adminMembership?.users;
  const adminIsContributing = Boolean(adminMembership?.payout_turn && adminMembership.payout_turn > 0);

  // The admin manages the group as a trustee; contributing members receive rotational turns
  const contributingMembers = membersList.filter(m => m.role !== 'admin' || (m.payout_turn !== null && m.payout_turn !== undefined && m.payout_turn > 0));
  const totalPool = group.contribution_amount * contributingMembers.length;
  const isAdmin = membersList.some(m => m.user_id === user.id && m.role === 'admin') || group.admin_id === user.id;
  const rawContributors = adminIsContributing ? membersList : contributingMembers;
  // Contributors ordered strictly by rotational turn (Turn 1, Turn 2, Turn 3...), unassigned at end
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
  
  // Turn beneficiary
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


  // Users who haven't paid yet
  const unpaidUserIds = contributingMembers
    .filter(m => !paidUserIds.has(m.user_id) && m.status === 'active')
    .map(m => m.user_id);

  // Admin active circles count for volume fee tier calculations
  const { count: adminGroupCount } = await adminClient
    .from('groups')
    .select('id', { count: 'exact', head: true })
    .eq('admin_id', group.admin_id);

  // Check for SuperAdmin VIP custom rate override on the group admin
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      
      {/* Header with Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link href="/dashboard/groups" className="p-2 rounded-xl bg-white border border-gray-200 text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-gray-50 transition-colors shadow-sm shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0B3022] truncate">{group.name}</h1>
                <span className={`px-2 py-0.5 text-xs font-bold rounded shrink-0 ${group.status === 'active' ? 'bg-green-500/10 text-green-700 border border-green-500/20' : 'bg-[#C5A059]/10 text-[#0B3022] border border-[#C5A059]/20'}`}>
                  {group.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[#1F2937]/70 text-xs sm:text-sm font-medium">Rotational Ajo</span>
                <span className="text-gray-300 text-sm">•</span>
                <span className="text-[#1F2937]/50 text-xs sm:text-sm font-mono truncate max-w-[130px] sm:max-w-[150px]">ID: {groupId}</span>
              </div>
            </div>
          </div>

          {/* Group Settings Button for mobile screens (Admin Only) */}
          {isAdmin && (
            <Link 
              href={`/dashboard/groups/${groupId}/settings`}
              className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-[#0B3022] hover:bg-gray-50 transition-colors shadow-sm font-semibold text-xs shrink-0"
              title="Group Settings"
            >
              <Settings className="h-4 w-4 text-[#C5A059]" />
              <span>Settings</span>
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 justify-end flex-wrap">
          {/* Organizer Invite & Share Kit for Admin */}
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

          {isAdmin && group.status === 'active' && (
            <>
              <TriggerSweepClient 
                groupId={groupId}
                groupName={group.name}
                currentTurn={currentTurn}
                pendingCount={unpaidUserIds.length}
                amount={group.contribution_amount}
                frequency={group.frequency}
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
          {/* Group Settings Button for tablet and desktop screens (Admin Only) */}
          {isAdmin && (
            <Link 
              href={`/dashboard/groups/${groupId}/settings`}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-[#0B3022] hover:bg-gray-50 transition-colors shadow-sm font-semibold text-sm"
              title="Group Settings"
            >
              <Settings className="h-4 w-4 text-[#C5A059]" />
              <span>Settings</span>
            </Link>
          )}
        </div>
      </div>


      {/* Pending Manual Bank Transfers Alert for Admin */}
      {isAdmin && pendingTransactions.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-[#0B3022] text-sm">
                {pendingTransactions.length} Manual Bank Transfer{pendingTransactions.length > 1 ? 's' : ''} Awaiting Review
              </h4>
              <p className="text-xs text-amber-800">
                Members reported bank transfers for Turn {currentTurn}. Mono is ready to match deposits on your bank statement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REQ 7: High-Priority Admin Auto-Debit Disruption Alert (Visible to ALL Members) */}
      {failedAdminDebit && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 shadow-sm animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                  ⚠️ ADMIN PAYOUT AUTO-DEBIT FAILED
                </span>
                <span className="text-xs font-bold text-red-700">Turn {failedAdminDebit.cycle_turn || currentTurn} Payout Disrupted</span>
              </div>
              <p className="text-sm font-bold text-red-950">
                The automated payout debit from Admin's tendered account ({adminBankName} - {adminMaskedAccount}) has failed.
              </p>
              <p className="text-xs text-red-800 leading-relaxed font-medium">
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
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:border-[#C5A059]/30 transition-colors group">
          <h3 className="text-[#1F2937]/60 text-sm font-bold mb-1 uppercase tracking-wider group-hover:text-[#C5A059] transition-colors">Contribution</h3>
          <p className="text-2xl font-bold text-[#0B3022] flex items-baseline gap-1">
            ₦{group.contribution_amount.toLocaleString()}<span className="text-sm font-bold text-[#1F2937]/40 capitalize">/{group.frequency}</span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:border-[#C5A059]/30 transition-colors group">
          <h3 className="text-[#1F2937]/60 text-sm font-bold mb-1 uppercase tracking-wider group-hover:text-[#C5A059] transition-colors">Total Pool</h3>
          <p className="text-2xl font-bold text-[#0B3022]">₦{totalPool.toLocaleString()}</p>
        </div>
        <div className="bg-[#0B3022] border border-[#0B3022]/10 shadow-md rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#C5A059]/10 rounded-full blur-2xl"></div>
          <h3 className="text-white/60 text-sm font-bold mb-1 uppercase tracking-wider relative z-10">Collecting Next (Turn {currentTurn})</h3>
          <p className="text-xl font-bold text-white truncate relative z-10">{receivingMemberProfileName}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:border-[#C5A059]/30 transition-colors group">
          <h3 className="text-[#1F2937]/60 text-sm font-bold mb-1 uppercase tracking-wider group-hover:text-[#C5A059] transition-colors">Members</h3>
          <p className="text-2xl font-bold text-[#0B3022]">{contributingMembers.length}/{group.max_members}</p>
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
        <div className={`border rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
          contributingMembers.length >= group.max_members
            ? "bg-emerald-50/70 border-emerald-200"
            : "bg-amber-50/60 border-amber-200"
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            {contributingMembers.length >= group.max_members ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <p className="text-sm font-bold text-[#0B3022]">
                {contributingMembers.length >= group.max_members 
                  ? "Circle Roster is Complete" 
                  : `Awaiting Members (${contributingMembers.length}/${group.max_members} Joined)`}
              </p>
              <p className="text-xs text-[#1F2937]/70 font-medium">
                {contributingMembers.length >= group.max_members
                  ? "All member slots are filled! The Circle Trustee is preparing to officially launch Round 1."
                  : `Waiting for ${group.max_members - contributingMembers.length} more member${group.max_members - contributingMembers.length > 1 ? 's' : ''} to join before the trustee launches Round 1.`}
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto shrink-0 ${
            contributingMembers.length >= group.max_members
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-amber-100 text-amber-800 border border-amber-300"
          }`}>
            {contributingMembers.length >= group.max_members ? "Ready for Trustee to Start" : `${group.max_members - contributingMembers.length} Slot(s) Open`}
          </span>
        </div>
      )}

      {/* REQ 7: Admin Tendered Settlement Account & Pass-Through Card (Visible to ALL members) */}
      <div className="bg-white border border-emerald-500/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Landmark className="h-6 w-6 text-emerald-700" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[#0B3022] font-bold text-base">Admin Tendered Settlement Account</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  failedAdminDebit 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {failedAdminDebit ? 'MANDATE DISRUPTED' : 'AUTO-DEBIT MANDATE ACTIVE'}
                </span>
              </div>
              <p className="text-[#1F2937]/70 text-xs leading-relaxed font-medium max-w-2xl">
                Àjọṣe is not a bank. We do not hold pooled money. All contributions flow directly into this tendered account and are auto-debited to each turn's recipient (minus {group.admin_commission_pct}% admin cut and 2% platform fee capped at ₦10,000).
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Bank: </span>
                  <span className="font-bold text-[#0B3022]">{adminBankName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Account: </span>
                  <span className="font-mono font-bold text-[#0B3022]">{adminMaskedAccount}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Holder: </span>
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
        <div className="bg-gradient-to-r from-amber-50 to-[#FDFBF7] border border-amber-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center shrink-0">
              <Coins className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#0B3022] text-sm">
                  Your Organizer Commission: {group.admin_commission_pct}%
                </h4>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full">
                  Admin Compensation
                </span>
              </div>
              <p className="text-xs text-[#1F2937]/75 mt-0.5">
                You earn approximately <strong>₦{Math.round(((group.admin_commission_pct || 0) / 100) * totalPool).toLocaleString()}</strong> upon round payout for organizing and maintaining this circle.
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
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-950 to-[#0B3022] text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Circle Organizer &amp; Trustee</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C5A059] text-[#0B3022] px-2 py-0.5 rounded-full">
                    Non-Contributing Admin
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 font-medium">
                  Manages circle compliance, settlement mandate, and automated payouts without taking a rotational contribution turn.
                </p>
              </div>
            </div>

            <div className="text-xs bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg text-emerald-100 shrink-0 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Settlement Account Active</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[#1F2937]/50 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-3.5">Organizer</th>
                  <th className="px-6 py-3.5">Role &amp; Settlement</th>
                  <th className="px-6 py-3.5">Verification Status</th>
                  <th className="px-6 py-3.5">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B3022]/10 text-[#0B3022] flex items-center justify-center text-xs font-bold uppercase">
                        {(adminUser?.first_name || adminUser?.nickname || 'A').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0B3022]">
                          {`${adminUser?.first_name || ''} ${adminUser?.last_name || ''}`.trim() || adminUser?.nickname || 'Circle Admin'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {adminUser?.phone || 'Verified Organizer'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold bg-[#0B3022] text-[#C5A059] px-2.5 py-1 rounded-full inline-block">
                        Admin Trustee
                      </span>
                      {adminBankName && (
                        <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span>{adminBankName} {adminRawAcct ? `(•••• ${adminRawAcct.slice(-4)})` : ''}</span>
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {adminUser?.bvn_verified ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Verified BVN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        Pending Verification
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0B3022] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
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
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FDFBF7]">
          <div>
            <h2 className="text-lg font-bold text-[#0B3022]">Contributors Roster ({contributingMembers.length}/{group.max_members})</h2>
            <p className="text-xs text-[#1F2937]/60 font-medium">
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
              <tr className="bg-gray-50 text-[#1F2937]/50 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">Turn</th>
                <th className="px-6 py-4">Contributor</th>
                <th className="px-6 py-4">Contribution Status</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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

                const isTurn = receivingMember?.id === m.id;
                const isPaid = paidUserIds.has(m.user_id);
                const hasFailedDebit = failedMemberUserIds.has(m.user_id);

                return (
                  <tr key={m.id} className={`transition-colors ${m.status === 'defaulted' ? 'bg-red-50' : isTurn ? 'bg-[#FDFBF7]' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.payout_turn ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isTurn 
                            ? "bg-[#0B3022] text-[#C5A059] shadow-sm border border-[#C5A059]/40" 
                            : "bg-[#0B3022]/5 text-[#0B3022] border border-[#0B3022]/10"
                        }`}>
                          <span>Turn {m.payout_turn}</span>
                          {isTurn && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" title="Receives Payout Next" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">
                          {m.role === 'admin' ? 'Admin Trustee' : 'Unassigned'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase ${m.status === 'defaulted' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${m.status === 'defaulted' ? 'text-red-700' : 'text-[#0B3022]'}`}>{displayName}</p>
                            {showAnonymousBadge && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                <EyeOff className="h-2.5 w-2.5" /> Anonymous
                              </span>
                            )}
                            {adminAliasNote && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                Alias: {adminAliasNote}
                              </span>
                            )}
                          </div>
                          {isTurn && (
                            <div className="flex items-center gap-3 mt-1.5">
                              <p className="text-xs text-[#C5A059] font-bold bg-[#C5A059]/10 border border-[#C5A059]/20 px-2 py-0.5 rounded">
                                Receives Payout Next
                              </p>
                              {m.status === 'defaulted' ? (
                                <span className="text-xs text-red-600 font-bold">Cannot process payout while defaulted</span>
                              ) : unpaidUserIds.length > 0 ? (
                                <span 
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg"
                                  title="Turn contributions must be debited from members before payout can be disbursed"
                                >
                                  <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                  <span>
                                    {paidUserIds.size === 0 
                                      ? "Awaiting Turn Debits" 
                                      : `Awaiting Debits (${paidUserIds.size}/${contributingMembers.length} Paid)`}
                                  </span>
                                </span>
                              ) : (
                                <ProcessPayoutClient 
                                  group={group} 
                                  receivingMember={receivingMember} 
                                  isAdmin={isAdmin} 
                                  currentTurn={currentTurn}
                                  adminGroupCount={adminGroupCount || 1}
                                  customPlatformFeePct={customPlatformFeePct}
                                />
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

                        if (m.role === 'admin') {
                          return (
                            <span className="text-xs text-[#C5A059] font-bold bg-[#0B3022] text-white px-2.5 py-1 rounded-full inline-block whitespace-nowrap">
                              <span className="hidden sm:inline">Admin Settlement Mandate</span>
                              <span className="sm:hidden">Admin</span>
                            </span>
                          );
                        }

                        if (isReserveCovered) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Advanced by Reserve Pool
                            </span>
                          );
                        }

                        if (isPaid) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                              <CheckCircle2 className="h-4 w-4 text-green-600" /> {isManualPaid ? "Paid (Manual Transfer)" : "Paid (Auto-Debit)"}
                            </span>
                          );
                        }

                        if (isPending) {
                          return (
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                                <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" /> Transfer Awaiting Review
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
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 border border-red-200 px-3 py-1 rounded-full">
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
                              adminBankDetails={{
                                bankName: adminBankName,
                                accountNumber: adminRawAcct,
                                accountHolder: adminAccountHolder
                              }}
                            />
                          );
                        }

                        return (
                          <span className="text-xs text-[#1F2937]/50 font-bold uppercase tracking-wider">
                            Pending Sweep
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        {userProfile?.bvn_verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 text-green-600" /> Verified BVN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                            Unverified
                          </span>
                        )}

                        {m.role !== 'admin' && (() => {
                          const memMandate = memberMandateMap.get(m.user_id);
                          if (memMandate?.mandateStatus === 'approved') {
                            return (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> Mandate Active
                                </span>
                              </div>
                            );
                          }
                          if (memMandate?.mandateStatus === 'awaiting_authorization') {
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3 text-amber-600" /> Mandate Pending
                                </span>
                                {isAdmin && memMandate?.mandateUrl && (
                                  <a
                                    href={memMandate.mandateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-amber-700 hover:underline font-bold"
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
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                <AlertCircle className="h-3 w-3 text-zinc-500" /> Mandate Needed
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {m.status === 'defaulted' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                            DEFAULTED
                          </span>
                        ) : (
                          <span className="text-xs text-[#0B3022] font-bold uppercase tracking-wider">Active</span>
                        )}

                        {/* Admin Flagging Action */}
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
            <div className="p-8 text-center text-[#1F2937]/50 font-medium">
              No contributors have joined this group yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
