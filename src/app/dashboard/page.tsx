import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowRight,
  Users,
  Coins
} from "lucide-react";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  // Fetch the user's profile details
  const { data: profile } = await supabase
    .from('users')
    .select('credit_score, auto_sweep_enabled')
    .eq('id', user.id)
    .single();

  const dbScore = profile?.credit_score ?? 50;
  const creditScore = dbScore === 0 ? 50 : dbScore;
  const isAutoSweep = profile?.auto_sweep_enabled || false;

  // Fetch the user's active memberships with the related group data
  // Note: We use an inner join on groups to get the group details
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

  // Calculate total saved (mock calculation based on contribution * turn for now, 
  // since we don't have real historical transactions set up yet)
  let totalSaved = 0;
  const activeGroups = memberships || [];
  
  if (activeGroups.length > 0) {
    totalSaved = activeGroups.reduce((acc, curr) => {
      // Assuming they've paid for previous turns. 
      // If payout_turn is 3, they've saved 2 months worth (mock logic)
      const monthsSaved = curr.payout_turn > 1 ? curr.payout_turn - 1 : 0;
      const amount = curr.groups?.contribution_amount || 0;
      return acc + (monthsSaved * amount);
    }, 0);
  }

  // Calculate projected admin earnings
  let totalAdminEarnings = 0;
  let adminGroupCount = 0;

  activeGroups.forEach(membership => {
    if (membership.role === 'admin' && membership.groups) {
      adminGroupCount++;
      const group = membership.groups;
      // Formula: (Contribution * (Members - 1)) * (Commission / 100) * (Members - 1) 
      // Wait, let's keep it simpler: Pool size per cycle * Admin Commission * Number of Cycles
      // Pool Size per cycle = contribution_amount * max_members (even if admin doesn't contribute, let's assume they take a cut of the total expected pool size)
      const poolPerCycle = group.contribution_amount * group.max_members;
      const commissionPerCycle = poolPerCycle * ((group.admin_commission_pct || 0) / 100);
      const totalCommission = commissionPerCycle * group.max_members; // max_members is the number of cycles
      
      totalAdminEarnings += totalCommission;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Credit Score Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[#1F2937]/70 font-medium">Ajo Circle Credit Score</h3>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
              <TrendingUp className="h-5 w-5 text-[#0B3022]" />
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-4xl font-bold text-[#0B3022]">{creditScore}</span>
            <span className="text-green-600 font-bold mb-1">
              {creditScore >= 80 ? 'Excellent' : creditScore >= 60 ? 'Good' : 'Fair'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
            <p className="text-sm text-[#1F2937]/70 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Eligible for all Pro groups
            </p>
          </div>
        </div>

        {/* Total Contributions */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 group hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-2xl group-hover:bg-[#C5A059]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-[#1F2937]/70 font-medium">Total Saved</h3>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
              <Wallet className="h-5 w-5 text-[#C5A059]" />
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-4xl font-bold text-[#0B3022]">₦{totalSaved.toLocaleString()}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
            <p className="text-sm text-[#1F2937]/70 font-medium">Across {activeGroups.length} active groups</p>
          </div>
        </div>

        {/* Admin Earnings Status */}
        <div className="bg-gradient-to-br from-[#0B3022] to-[#0B3022]/90 border border-[#0B3022]/20 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl bg-[#C5A059]/20"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-medium text-white/80">Projected Earnings</h3>
            <div className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#C5A059]/20 text-[#C5A059] flex items-center gap-1 border border-[#C5A059]/30">
              <Coins className="h-3 w-3" /> ADMIN
            </div>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-3xl font-bold text-white mb-2 tracking-tight">
              ₦{totalAdminEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-white/70 text-sm flex items-center gap-2 font-medium">
              <Users className="h-4 w-4 text-[#C5A059]" />
              Managing {adminGroupCount} active {adminGroupCount === 1 ? 'Ajo' : 'Ajos'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
            <p className="text-xs text-[#C5A059]/90 font-medium">
              Total commission expected over the life of your groups.
            </p>
          </div>
        </div>

      </div>

      {/* Active Groups & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0B3022]">Active Ajos</h2>
            <Link href="/dashboard/groups" className="text-sm font-bold text-[#C5A059] hover:text-[#A48243] flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            
            {activeGroups.length === 0 ? (
              <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-[#0B3022] mb-2">No Active Groups</h3>
                <p className="text-[#1F2937]/70 text-sm max-w-sm">
                  You haven't joined any savings groups yet. Create an Admin-Managed group to get started.
                </p>
              </div>
            ) : (
              activeGroups.map((membership: any) => {
                const group = membership.groups;
                const totalPool = group.contribution_amount * group.max_members;
                
                return (
                  <div key={membership.id} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:border-[#C5A059]/30 hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0B3022] rounded-xl flex items-center justify-center text-[#C5A059] font-bold text-xl uppercase shadow-inner">
                          {group.name.substring(0, 1)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-[#0B3022]">{group.name}</h4>
                          <p className="text-sm text-[#1F2937]/70 font-medium">{group.max_members} Members • <span className="capitalize">{group.frequency}</span></p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-lg font-bold text-[#0B3022]">₦{group.contribution_amount.toLocaleString()}<span className="text-sm text-[#1F2937]/50 font-normal">/cycle</span></p>
                        <p className="text-sm text-[#1F2937]/70 font-medium">Total pool: <span className="font-bold text-[#0B3022]">₦{totalPool.toLocaleString()}</span></p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {group.status === 'pending' ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-[#C5A059]" />
                            <span className="text-sm text-[#1F2937] font-medium">Awaiting members</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-sm text-[#1F2937] font-medium">Your turn: <strong className="text-[#0B3022]">Cycle {membership.payout_turn}</strong></span>
                          </>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[#1F2937]/50 uppercase tracking-wide">
                        {group.status === 'pending' ? 'Starts when full' : `Status: ${membership.status}`}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-[#0B3022] border border-[#0B3022]/10 shadow-xl rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-2xl"></div>
            <div className="w-16 h-16 bg-[#C5A059]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C5A059]/30 relative z-10">
              <Plus className="h-8 w-8 text-[#C5A059]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Create an Ajo</h3>
            <p className="text-white/70 text-sm mb-6 relative z-10">
              Start your own admin-managed group. Set the rules and invite trusted friends.
            </p>
            <Link 
              href="/dashboard/groups/create"
              className="block w-full bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold py-3 px-4 rounded-xl transition-all shadow-lg relative z-10"
            >
              Create Group
            </Link>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <h3 className="text-base font-bold text-[#0B3022] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-[#1F2937]">Identity Verified</p>
                  <p className="text-xs text-[#1F2937]/60 font-medium">Recently</p>
                </div>
              </div>
              {/* Could fetch from transactions table here later */}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
