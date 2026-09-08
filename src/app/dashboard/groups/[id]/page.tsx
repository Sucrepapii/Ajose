import { createClient } from "@/utils/supabase/server";
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
  EyeOff
} from "lucide-react";
import { CopyInviteButton } from "@/components/CopyInviteButton";
import { RulesModal } from "@/components/RulesModal";
import { ProcessPayoutClient } from "@/components/ProcessPayoutClient";
import { StartCycleClient } from "@/components/StartCycleClient";
import { MakeContributionClient } from "@/components/MakeContributionClient";
import { FlagMemberClient } from "@/components/FlagMemberClient";
import { SendRemindersClient } from "@/components/SendRemindersClient";
import { ConfirmTransferClient } from "@/components/ConfirmTransferClient";

export default async function GroupDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const groupId = params.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  // Fetch the group details
  const { data: group, error: groupError } = await supabase
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
  const { data: members, error: membersError } = await supabase
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
    .order('joined_at', { ascending: true });

  const membersList = members || [];
  const currentTurn = group.current_turn || 1; 

  // Fetch group transactions to track payments and any auto-debit failures (Req 7: members should see if failed too)
  const { data: groupTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  const txList = groupTransactions || [];

  // Completed contributions for this turn
  const paidUserIds = new Set(
    txList
      .filter(tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && tx.status === 'completed')
      .map(tx => tx.user_id)
  );

  // Pending manual bank transfers awaiting admin confirmation
  const pendingTransactions = txList.filter(
    tx => tx.cycle_turn === currentTurn && tx.type === 'contribution' && tx.status === 'pending_confirmation'
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

  // The admin manages the group; contributing members receive rotational turns
  const contributingMembers = membersList.filter(m => m.role !== 'admin');
  const totalPool = group.contribution_amount * contributingMembers.length;
  const isAdmin = membersList.some(m => m.user_id === user.id && m.role === 'admin');

  // Admin Profile & Settlement Bank Account Details
  const adminMembership = membersList.find(m => m.role === 'admin');
  const adminUser = adminMembership?.users;
  const adminBankName = adminUser?.bank_name || 'Zenith Bank (Settlement)';
  const adminRawAcct = adminUser?.account_number || '0248194821';
  const adminMaskedAccount = adminRawAcct.length >= 6 
    ? `${adminRawAcct.substring(0, 3)}****${adminRawAcct.substring(adminRawAcct.length - 3)}`
    : adminRawAcct;
  const adminAccountHolder = adminUser?.account_name || (
    adminUser?.first_name ? `${adminUser.first_name} ${adminUser.last_name || ''}`.trim() : 'Group Admin'
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
      receivingMemberProfileName = `User-${receivingMember.user_id.substring(0, 4)}`;
    }
  }

  // Users who haven't paid yet
  const unpaidUserIds = contributingMembers
    .filter(m => !paidUserIds.has(m.user_id) && m.status === 'active')
    .map(m => m.user_id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      
      {/* Header with Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/groups" className="p-2 rounded-xl bg-white border border-gray-200 text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0B3022]">{group.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${group.status === 'active' ? 'bg-green-500/10 text-green-700 border border-green-500/20' : 'bg-[#C5A059]/10 text-[#0B3022] border border-[#C5A059]/20'}`}>
                {group.status.toUpperCase()}
              </span>
              <span className="text-[#1F2937]/70 text-sm font-medium">Rotational Savings</span>
              <span className="text-gray-300 text-sm">•</span>
              <span className="text-[#1F2937]/50 text-sm font-mono truncate max-w-[150px]">ID: {groupId}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && group.status === 'active' && (
            <SendRemindersClient 
              unpaidUserIds={unpaidUserIds} 
              groupName={group.name} 
              currentTurn={currentTurn}
              amount={group.contribution_amount} 
            />
          )}
          <Link 
            href={`/dashboard/groups/${groupId}/settings`}
            className="p-2 rounded-xl bg-white border border-gray-200 text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-gray-50 transition-colors hidden md:block shadow-sm"
          >
            <Settings className="h-5 w-5" />
          </Link>
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
        <StartCycleClient groupId={groupId} />
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
                Àjọṣe is not a bank. We do not hold pooled money. All contributions flow directly into this tendered account and are auto-debited to each turn's recipient (minus {group.admin_commission_pct}% admin cut and 2% platform fee).
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

      {/* Member List Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FDFBF7]">
          <h2 className="text-lg font-bold text-[#0B3022]">Group Roster ({contributingMembers.length}/{group.max_members})</h2>
          
          {contributingMembers.length < group.max_members && (
            <CopyInviteButton groupId={groupId} groupName={group.name} />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#1F2937]/50 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Contribution Status</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {membersList.map((m) => {
                const userProfile = m.users;
                
                const realName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || `User-${m.user_id.substring(0, 4)}`;
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
                              ) : (
                                <ProcessPayoutClient 
                                  group={group} 
                                  receivingMember={receivingMember} 
                                  isAdmin={isAdmin} 
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
                            <span className="text-xs text-[#C5A059] font-bold bg-[#0B3022] text-white px-2.5 py-1 rounded-full">
                              Admin Settlement Mandate
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
                      {userProfile?.bvn_verified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Verified BVN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                          Unverified
                        </span>
                      )}
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
          
          {membersList.length === 0 && (
            <div className="p-8 text-center text-[#1F2937]/50 font-medium">
              No members found in this group.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
