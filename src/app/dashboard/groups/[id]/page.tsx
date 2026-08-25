import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  ArrowLeft, 
  Settings, 
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { CopyInviteButton } from "@/components/CopyInviteButton";
import { RulesModal } from "@/components/RulesModal";
import { ProcessPayoutClient } from "@/components/ProcessPayoutClient";
import { StartCycleClient } from "@/components/StartCycleClient";
import { MakeContributionClient } from "@/components/MakeContributionClient";
import { FlagMemberClient } from "@/components/FlagMemberClient";
import { SendRemindersClient } from "@/components/SendRemindersClient";

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

  // Fetch the members of the group, joined with their user profile data
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
        auto_sweep_enabled
      )
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  const membersList = members || [];
  
  // Fetch contributions for the current cycle
  const currentTurn = group.current_turn || 1; 

  const { data: currentTransactions } = await supabase
    .from('transactions')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('cycle_turn', currentTurn)
    .eq('type', 'contribution');

  const paidUserIds = new Set((currentTransactions || []).map(tx => tx.user_id));

  // The admin just manages the group, they do not contribute or receive payout.
  const contributingMembers = membersList.filter(m => m.role !== 'admin');
  
  // Basic calculated fields
  const totalPool = group.contribution_amount * contributingMembers.length;

  const isAdmin = membersList.some(m => m.user_id === user.id && m.role === 'admin');
  
  // Find whose turn it is to get the payout
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

  // Find users who haven't paid this turn
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
              <span className="text-[#1F2937]/70 text-sm font-medium">Admin-Managed</span>
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
          <h3 className="text-white/60 text-sm font-bold mb-1 uppercase tracking-wider relative z-10">Collecting Next</h3>
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

      {/* Escrow & Security Banner */}
      <div className="bg-[#FDFBF7] border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B3022]/5 rounded-full blur-2xl"></div>
        <div className="flex gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[#0B3022] font-bold mb-1">Admin-Managed Escrow Active</h3>
            <p className="text-[#1F2937]/70 text-sm leading-relaxed font-medium">
              Funds are managed and disbursed by the Group Admin. The total pool (minus {group.admin_commission_pct}% admin fee and 2% platform fee) is sent directly to the collector's primary account upon payout processing.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex gap-3">
          <RulesModal />
        </div>
      </div>

      {/* Member List */}
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
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {membersList.map((m, i) => {
                const userProfile = m.users;
                
                // Determine the display name: Nickname > First Last > Phone > ID
                let displayName = `User-${m.user_id.substring(0, 4)}`;
                if (userProfile?.nickname) {
                  displayName = userProfile.nickname;
                } else if (userProfile?.first_name || userProfile?.last_name) {
                  displayName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
                } else if (userProfile?.phone) {
                  displayName = userProfile.phone;
                }
                const isTurn = receivingMember?.id === m.id;

                return (
                  <tr key={m.id} className={`transition-colors ${m.status === 'defaulted' ? 'bg-red-50' : isTurn ? 'bg-[#FDFBF7]' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase ${m.status === 'defaulted' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${m.status === 'defaulted' ? 'text-red-700' : 'text-[#0B3022]'}`}>{displayName}</p>
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
                      {m.role === 'admin' ? (
                        <span className="text-sm text-[#C5A059] font-bold">Admin (No Payout)</span>
                      ) : paidUserIds.has(m.user_id) ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-green-600" /> Paid
                        </span>
                      ) : m.user_id === user.id && group.status === 'active' ? (
                        <MakeContributionClient 
                          groupId={groupId} 
                          userId={user.id} 
                          amount={group.contribution_amount} 
                          currentTurn={currentTurn} 
                        />
                      ) : (
                        <span className="text-sm text-[#1F2937]/50 font-bold uppercase tracking-wider">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {userProfile?.bvn_verified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Verified
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
                          (!paidUserIds.has(m.user_id) && group.status === 'active' || m.status === 'defaulted') && (
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
