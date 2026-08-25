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

  const creditScore = profile?.credit_score || 0;
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-zinc-400 font-medium">Ajo Circle Credit Score</h3>
            <div className="p-2 bg-zinc-800 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-4xl font-bold text-white">{creditScore}</span>
            <span className="text-emerald-400 font-medium mb-1">
              {creditScore >= 80 ? 'Excellent' : creditScore >= 60 ? 'Good' : 'Fair'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800 relative z-10">
            <p className="text-sm text-zinc-500 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Eligible for all Pro groups
            </p>
          </div>
        </div>

        {/* Total Contributions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Total Saved</h3>
            <div className="p-2 bg-zinc-800 rounded-lg">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">₦{totalSaved.toLocaleString()}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">Across {activeGroups.length} active groups</p>
          </div>
        </div>

        {/* Admin Earnings Status */}
        <div className="bg-gradient-to-br from-zinc-900 to-amber-950/20 border border-amber-900/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl bg-amber-500/10"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-medium text-amber-200/70">Projected Earnings</h3>
            <div className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
              <Coins className="h-3 w-3" /> ADMIN
            </div>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-3xl font-bold text-white mb-2">
              ₦{totalAdminEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-zinc-400 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" />
              Managing {adminGroupCount} active {adminGroupCount === 1 ? 'Ajo' : 'Ajos'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-900/30 relative z-10">
            <p className="text-xs text-amber-400/80">
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
            <h2 className="text-xl font-bold text-white">Active Ajos</h2>
            <Link href="/dashboard/groups" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            
            {activeGroups.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Active Groups</h3>
                <p className="text-zinc-400 text-sm max-w-sm">
                  You haven't joined any savings groups yet. Create an Admin-Managed group to get started.
                </p>
              </div>
            ) : (
              activeGroups.map((membership: any) => {
                const group = membership.groups;
                const totalPool = group.contribution_amount * group.max_members;
                
                return (
                  <div key={membership.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xl uppercase">
                          {group.name.substring(0, 1)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{group.name}</h4>
                          <p className="text-sm text-zinc-400">{group.max_members} Members • {group.frequency}</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-lg font-bold text-white">₦{group.contribution_amount.toLocaleString()}<span className="text-sm text-zinc-500 font-normal">/cycle</span></p>
                        <p className="text-sm text-zinc-400">Total pool: ₦{totalPool.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {group.status === 'pending' ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-zinc-300">Awaiting members</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-zinc-300">Your turn: <strong className="text-white">Cycle {membership.payout_turn}</strong></span>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-zinc-400">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Plus className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Create an Ajo</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Start your own admin-managed group. Set the rules and invite trusted friends.
            </p>
            <Link 
              href="/dashboard/groups/create"
              className="block w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Create Group
            </Link>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm text-white">Identity Verified</p>
                  <p className="text-xs text-zinc-500">Recently</p>
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
