import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowRight,
  Users,
  Coins,
  Gift
} from "lucide-react";
import { OrganizerShareKitModal } from "@/components/OrganizerShareKitModal";

export default async function DashboardOverview() {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's profile details
  const { data: profile } = await supabase
    .from('users')
    .select('credit_score, auto_sweep_enabled, bvn_verified')
    .eq('id', user.id)
    .single();

  if (!profile?.bvn_verified) {
    redirect("/dashboard/verify");
  }

  const creditScore = profile?.credit_score ?? (profile?.bvn_verified ? 30 : 0);

  const getTrustTier = (score: number) => {
    if (score >= 80) return { label: 'Excellent', status: 'Eligible for all Pro circles' };
    if (score >= 60) return { label: 'Good Standing', status: 'Direct debit mandate active' };
    if (score >= 30) return { label: 'Identity Verified', status: 'Authorize mandate to reach 60' };
    return { label: 'Unverified', status: 'Link bank & BVN to start' };
  };
  const trustTier = getTrustTier(creditScore);

  // Fetch the user's active memberships with the related group data
  const { data: memberships } = await supabase
    .from('memberships')
    .select(`
      *,
      groups (
        id,
        name,
        contribution_amount,
        max_members,
        status,
        frequency,
        admin_commission_pct
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  const adminClient = createAdminClient();
  const activeGroups = memberships || [];
  const userMembershipIds = activeGroups.map(m => m.id);
  const groupIds = Array.from(new Set(activeGroups.map(m => (m.groups as any)?.id).filter(Boolean)));

  // Calculate contributing member counts and derive real active turns for active groups
  const groupMemberCounts = new Map<string, number>();
  const groupMaxPaidTurns = new Map<string, number>();

  if (groupIds.length > 0) {
    const { data: allGroupMemberships } = await adminClient
      .from('memberships')
      .select('id, group_id, role, payout_turn, status')
      .in('group_id', groupIds)
      .eq('status', 'active');

    const memToGroup = new Map<string, string>();
    const allMemIds = (allGroupMemberships || []).map((m: any) => {
      memToGroup.set(m.id, m.group_id);
      const isContributing = m.role !== 'admin' || (m.payout_turn !== null && m.payout_turn !== undefined && m.payout_turn > 0);
      if (isContributing) {
        groupMemberCounts.set(m.group_id, (groupMemberCounts.get(m.group_id) || 0) + 1);
      }
      return m.id;
    });

    if (allMemIds.length > 0) {
      const { data: payoutTxs } = await adminClient
        .from('transactions')
        .select('membership_id, cycle_turn')
        .in('membership_id', allMemIds)
        .eq('type', 'payout')
        .eq('status', 'successful');

      (payoutTxs || []).forEach((tx: any) => {
        const gId = memToGroup.get(tx.membership_id);
        if (gId) {
          const currentMax = groupMaxPaidTurns.get(gId) || 0;
          if (tx.cycle_turn > currentMax) {
            groupMaxPaidTurns.set(gId, tx.cycle_turn);
          }
        }
      });
    }
  }

  // Calculate real total saved from successful contribution transactions in the database
  let totalSaved = 0;
  if (userMembershipIds.length > 0) {
    const { data: userContributions } = await adminClient
      .from('transactions')
      .select('amount')
      .in('membership_id', userMembershipIds)
      .eq('type', 'contribution')
      .eq('status', 'successful');

    totalSaved = (userContributions || []).reduce((acc: number, tx: any) => acc + (Number(tx.amount) || 0), 0);
  }

  // Fetch real recent activity from transactions ledger
  const { data: recentTxs } = userMembershipIds.length > 0
    ? await adminClient
        .from('transactions')
        .select(`
          id,
          amount,
          type,
          status,
          created_at,
          cycle_turn,
          memberships (
            groups ( name )
          )
        `)
        .in('membership_id', userMembershipIds)
        .order('created_at', { ascending: false })
        .limit(4)
    : { data: [] };

  // Calculate projected admin earnings
  let totalAdminEarnings = 0;
  let adminGroupCount = 0;

  activeGroups.forEach(membership => {
    if (membership.role === 'admin' && membership.groups) {
      adminGroupCount++;
      const group = membership.groups;
      const poolPerCycle = group.contribution_amount * group.max_members;
      const commissionPerCycle = poolPerCycle * ((group.admin_commission_pct || 0) / 100);
      const totalCommission = commissionPerCycle * group.max_members;
      
      totalAdminEarnings += totalCommission;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Verification Banner */}
      {!profile?.bvn_verified && (
        <div className="bg-white border border-[#D4A843] rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#D4A843]/15 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle className="h-6 w-6 text-[#0B3022]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0B3022] mb-1">Action Required: Connect Your Bank</h3>
              <p className="text-[#0B3022]/70 text-sm max-w-2xl">
                You must verify your BVN and establish a direct debit mandate via Mono before you can create or join Ajo cycles.
              </p>
            </div>
          </div>
          <Link 
            href="/dashboard/verify"
            className="shrink-0 px-6 py-3 bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold text-sm rounded-full transition-all text-center w-full md:w-auto"
          >
            Verify Now
          </Link>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Trust Score Card */}
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-[#0B3022]/60 font-bold">Àjọṣe Trust Score</h3>
            <div className="p-2.5 bg-[#F3EEE3] rounded-xl border border-[#0B3022]/10">
              <TrendingUp className="h-4 w-4 text-[#0B3022]" />
            </div>
          </div>
          <div className="flex items-end gap-2 relative z-10">
            <span className="text-4xl font-bold font-mono text-[#0B3022]">{creditScore}</span>
            <span className="text-[#0B3022]/45 font-mono text-sm mb-1">/ 100</span>
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4A843]/20 text-[#0B3022] font-bold mb-1.5 ml-1">
              {trustTier.label}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#0B3022]/10 relative z-10">
            <p className="text-xs text-[#0B3022]/70 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-[#D4A843]" />
              {trustTier.status}
            </p>
          </div>
        </div>

        {/* Total Contributions */}
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-[#0B3022]/60 font-bold">Total Saved</h3>
            <div className="p-2.5 bg-[#F3EEE3] rounded-xl border border-[#0B3022]/10">
              <Wallet className="h-4 w-4 text-[#D4A843]" />
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-4xl font-bold font-mono text-[#0B3022]">₦{totalSaved.toLocaleString()}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#0B3022]/10 relative z-10">
            <p className="text-xs text-[#0B3022]/70 font-medium">Across {activeGroups.length} active circles</p>
          </div>
        </div>

        {/* Admin Earnings Status */}
        <div className="bg-[#0B3022] border border-[#0B3022] rounded-3xl p-6 relative overflow-hidden text-[#F3EEE3]">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-xs font-mono uppercase tracking-[0.14em] text-[#F3EEE3]/65 font-bold">Projected Earnings</h3>
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold rounded-full bg-[#D4A843]/20 text-[#D4A843] flex items-center gap-1 border border-[#D4A843]/30">
              <Coins className="h-3 w-3" /> ADMIN
            </div>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-3xl font-bold font-mono text-[#D4A843] mb-1 tracking-tight">
              ₦{totalAdminEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[#F3EEE3]/70 text-xs flex items-center gap-2 font-medium">
              <Users className="h-3.5 w-3.5 text-[#D4A843]" />
              Managing {adminGroupCount} active {adminGroupCount === 1 ? 'Ajo' : 'Ajos'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F3EEE3]/10 relative z-10">
            <p className="text-xs text-[#F3EEE3]/65">
              Total commission expected over the life of your circles.
            </p>
          </div>
        </div>

      </div>

      {/* Referral Promotion Strip */}
      <div className="bg-[#0B3022] rounded-3xl p-5 sm:p-6 text-[#F3EEE3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#0B3022]">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#D4A843]/15 flex items-center justify-center shrink-0 border border-[#D4A843]/30">
            <Gift className="w-5 h-5 text-[#D4A843]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="font-bold text-sm sm:text-base text-[#F3EEE3]">
                Refer friends &amp;{" "}
                <span className="font-editorial italic font-normal text-[#D4A843]">
                  slash your fees
                </span>
              </h4>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D4A843] text-[#0B3022] px-2.5 py-0.5 rounded-full">
                Down to 0.5%
              </span>
            </div>
            <p className="text-xs text-[#F3EEE3]/65 mt-0.5">
              Invite your circle members. Unlock tiered discounts on your monthly rotational payouts.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/referrals"
          className="shrink-0 px-5 py-2.5 bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <span>View Referrals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Active Groups & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0B3022] tracking-tight">
              Active{" "}
              <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
                Circles.
              </span>
            </h2>
            <Link href="/dashboard/groups" className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022] hover:text-[#D4A843] flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            
            {activeGroups.length === 0 ? (
              <div className="bg-white border border-[#0B3022]/15 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-[#F3EEE3] rounded-2xl flex items-center justify-center mb-4 border border-[#0B3022]/10">
                  <Users className="h-6 w-6 text-[#0B3022]" />
                </div>
                <h3 className="text-lg font-bold text-[#0B3022] mb-1.5">No Active Circles</h3>
                <p className="text-[#0B3022]/65 text-sm max-w-sm">
                  You haven&apos;t joined any Ajo contribution circles yet. Create an Admin-Managed circle to get started.
                </p>
              </div>
            ) : (
              activeGroups.map((membership: any) => {
                const group = membership.groups;
                if (!group) return null;
                const totalPool = group.contribution_amount * group.max_members;
                const isAdmin = membership.role === 'admin';
                const currentCount = groupMemberCounts.get(group.id) || 0;
                const isFull = currentCount >= group.max_members;
                const isPending = group.status === 'pending';
                
                return (
                  <Link key={membership.id} href={`/dashboard/groups/${group.id}`} className="block bg-white border border-[#0B3022]/10 rounded-3xl p-6 hover:border-[#D4A843] transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0B3022] rounded-2xl flex items-center justify-center text-[#D4A843] font-bold text-lg font-mono uppercase group-hover:bg-[#D4A843] group-hover:text-[#0B3022] transition-colors">
                          {(group?.name || "A").substring(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-[#0B3022]">{group?.name || "Ajo Circle"}</h4>
                            {isAdmin && (
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D4A843]/20 text-[#0B3022] border border-[#D4A843]/40 px-2.5 py-0.5 rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono uppercase tracking-wider text-[#0B3022]/60 mt-0.5">
                            {isPending 
                              ? `${currentCount} of ${group.max_members} Members` 
                              : `${group.max_members} Members`} • <span className="capitalize">{group.frequency}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                        <div className="text-left md:text-right">
                          <p className="text-lg font-bold font-mono text-[#0B3022]">₦{group.contribution_amount.toLocaleString()}<span className="text-xs text-[#0B3022]/50 font-sans font-normal">/cycle</span></p>
                          <p className="text-xs text-[#0B3022]/65">Pool: <span className="font-bold font-mono text-[#0B3022]">₦{totalPool.toLocaleString()}</span></p>
                        </div>
                        {isAdmin && (
                          <div>
                            <OrganizerShareKitModal
                              groupId={group.id}
                              groupName={group.name}
                              amount={group.contribution_amount}
                              frequency={group.frequency}
                              maxMembers={group.max_members}
                              adminCommissionPct={group.admin_commission_pct ?? 0}
                              buttonLabel="Invite Kit"
                              variant="compact"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="rounded-2xl p-4 border border-[#0B3022]/10 bg-[#F3EEE3]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          isFull ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-[#0B3022]" />
                              <span className="text-xs font-mono uppercase tracking-wider text-[#0B3022] font-bold">
                                Roster Full ({currentCount}/{group.max_members})
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-[#D4A843]" />
                              <span className="text-xs font-mono uppercase tracking-wider text-[#0B3022]/75 font-bold">
                                Awaiting members ({currentCount}/{group.max_members})
                              </span>
                            </>
                          )
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-[#D4A843]"></div>
                            {(() => {
                              const maxPaid = groupMaxPaidTurns.get(group.id) || 0;
                              const derivedTurn = maxPaid + 1;
                              const isCompleted = derivedTurn > (group.max_members || 1);

                              if (isCompleted) {
                                return (
                                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022] flex items-center gap-1.5">
                                    <span>All {group.max_members} Turns Completed</span>
                                  </span>
                                );
                              }

                              if (isAdmin && !membership.payout_turn) {
                                return (
                                  <span className="text-xs text-[#0B3022]/80 font-medium flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0B3022] text-[#F3EEE3] px-2 py-0.5 rounded-md">
                                      Circle Trustee
                                    </span>
                                    <span className="text-[#0B3022]/30">•</span>
                                    <span>Active Turn: <strong className="text-[#0B3022] font-mono">Turn {derivedTurn} of {group.max_members}</strong></span>
                                  </span>
                                );
                              }

                              return (
                                <span className="text-xs text-[#0B3022]/80 font-medium flex items-center gap-2 flex-wrap">
                                  <span>Your Turn: <strong className="text-[#0B3022] font-mono">Turn {membership.payout_turn}</strong></span>
                                  <span className="text-[#0B3022]/30">•</span>
                                  <span>Now on: <strong className="text-[#0B3022] font-mono">Turn {derivedTurn}</strong></span>
                                </span>
                              );
                            })()}
                          </>
                        )}
                      </div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022] group-hover:text-[#D4A843] flex items-center gap-1.5 transition-colors">
                        {isPending ? (
                          isFull ? (
                            isAdmin ? 'Launch Cycle →' : 'Ready to Start'
                          ) : (
                            `Needs ${group.max_members - currentCount} more`
                          )
                        ) : (() => {
                          const maxPaid = groupMaxPaidTurns.get(group.id) || 0;
                          const derivedTurn = maxPaid + 1;
                          const isCompleted = derivedTurn > (group.max_members || 1);
                          return isCompleted ? 'Completed' : `Turn ${derivedTurn} Active`;
                        })()}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}

          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-[#0B3022] border border-[#0B3022] rounded-3xl p-7 text-center relative overflow-hidden text-[#F3EEE3]">
            <div className="w-14 h-14 bg-[#D4A843]/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4A843]/30 relative z-10">
              <Plus className="h-6 w-6 text-[#D4A843]" />
            </div>
            <h3 className="text-xl font-bold text-[#F3EEE3] mb-2 relative z-10">
              Create a{" "}
              <span className="font-editorial italic font-normal text-[#D4A843]">
                circle.
              </span>
            </h3>
            <p className="text-[#F3EEE3]/70 text-xs leading-relaxed mb-6 relative z-10">
              Start your own admin-managed rotational circle. Set the rules and invite trusted friends.
            </p>
            <Link 
              href="/dashboard/groups/create"
              className="block w-full bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold text-sm py-3.5 px-4 rounded-full transition-all relative z-10"
            >
              Create Circle
            </Link>
          </div>

          <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.14em] font-bold text-[#0B3022]">Recent Activity</h3>
              <Link href="/dashboard/transactions" className="text-xs font-mono uppercase tracking-wider font-bold text-[#0B3022] hover:text-[#D4A843] underline decoration-[#D4A843]">
                See all
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentTxs && recentTxs.length > 0 ? (
                recentTxs.map((tx: any) => {
                  const groupName = (tx.memberships as any)?.groups?.name || "Ajo Circle";
                  const isFailed = tx.status === 'failed';
                  const isPayout = tx.type === 'payout';

                  const dotColor = isFailed ? 'bg-red-500' : isPayout ? 'bg-[#D4A843]' : 'bg-[#0B3022]';
                  const title = isPayout
                    ? `Turn ${tx.cycle_turn} Lump-Sum Payout`
                    : `Turn ${tx.cycle_turn} Contribution`;
                  const amountStr = `₦${Number(tx.amount).toLocaleString()}`;
                  const dateStr = new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                  return (
                    <div key={tx.id} className="flex items-start justify-between gap-3 text-left">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`}></div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0B3022] truncate">{title}</p>
                          <p className="text-xs text-[#0B3022]/60 truncate">{groupName} • {dateStr}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-mono font-bold ${isFailed ? 'text-red-600' : 'text-[#0B3022]'}`}>
                          {isPayout ? `+${amountStr}` : amountStr}
                        </span>
                        {isFailed && <p className="text-[10px] font-bold text-red-500">Failed</p>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A843] mt-2 shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-[#0B3022]">Identity Verified</p>
                      <p className="text-xs text-[#0B3022]/60">Bank BVN connected</p>
                    </div>
                  </div>
                  {activeGroups.length > 0 && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#0B3022] mt-2 shrink-0"></div>
                      <div>
                        <p className="text-sm font-bold text-[#0B3022]">Joined {activeGroups[0].groups?.name}</p>
                        <p className="text-xs text-[#0B3022]/60">Active Member</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
