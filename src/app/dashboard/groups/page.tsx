import Link from "next/link";
import { Users, Plus, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let activeGroups: any[] = [];
  
  if (user) {
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
          frequency
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false });
      
    activeGroups = memberships || [];
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Groups</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and view your active Ajo savings groups.</p>
        </div>
        <Link 
          href="/dashboard/groups/create"
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" /> Create Group
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {activeGroups.length === 0 ? (
          <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You haven't joined any groups</h3>
            <p className="text-zinc-400 text-sm max-w-sm mb-6">
              Create an Admin-Managed Ajo or wait to be invited to a private group by a friend.
            </p>
            <Link 
              href="/dashboard/groups/create"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" /> Start a New Ajo
            </Link>
          </div>
        ) : (
          activeGroups.map((membership: any) => {
            const group = membership.groups;
            const totalPool = group.contribution_amount * group.max_members;
            
            return (
              <div key={membership.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${group.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {group.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Contribution</p>
                    <p className="text-lg font-bold text-white">₦{group.contribution_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Total Pool</p>
                    <p className="text-lg font-bold text-white">₦{totalPool.toLocaleString()}</p>
                  </div>
                </div>

                <Link href={`/dashboard/groups/${group.id}`} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors mt-auto">
                  View Details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
}
