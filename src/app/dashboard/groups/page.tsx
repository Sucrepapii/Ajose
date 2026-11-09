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
          <h1 className="text-3xl font-bold text-[#0B3022] tracking-tight">
            My{" "}
            <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
              Circles.
            </span>
          </h1>
          <p className="text-sm text-[#0B3022]/65 mt-1">Manage and view your active Ajo contribution circles.</p>
        </div>
        <Link 
          href="/dashboard/groups/create"
          className="bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" /> Create Circle
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {activeGroups.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-[#0B3022]/15 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#F3EEE3] rounded-2xl flex items-center justify-center mb-4 border border-[#0B3022]/10">
              <Users className="h-8 w-8 text-[#0B3022]" />
            </div>
            <h3 className="text-xl font-bold text-[#0B3022] mb-2">You haven&apos;t joined any circles</h3>
            <p className="text-[#0B3022]/65 text-sm max-w-sm mb-6">
              Create an Admin-Managed Ajo circle or wait to be invited to a private circle by a friend.
            </p>
            <Link 
              href="/dashboard/groups/create"
              className="bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4 text-[#D4A843]" /> Start a New Circle
            </Link>
          </div>
        ) : (
          activeGroups.map((membership: any) => {
            const group = membership.groups;
            const totalPool = group.contribution_amount * group.max_members;
            
            return (
              <div key={membership.id} className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 hover:border-[#D4A843] transition-colors flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0B3022] rounded-2xl flex items-center justify-center text-[#D4A843] font-bold text-lg font-mono uppercase">
                      {(group?.name || "A").substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#0B3022]">{group?.name || "Ajo Circle"}</h4>
                      <p className="text-xs font-mono uppercase tracking-wider text-[#0B3022]/60 mt-0.5">{group.max_members} Members • {group.frequency}</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <span className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full border ${
                      group.status === 'active'
                        ? 'bg-[#0B3022] text-[#D4A843] border-[#0B3022]'
                        : 'bg-[#D4A843]/20 text-[#0B3022] border-[#D4A843]/40'
                    }`}>
                      {group.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-[#F3EEE3]/60 border border-[#0B3022]/10 flex-1">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#0B3022]/55 mb-1">Contribution</p>
                    <p className="text-lg font-bold font-mono text-[#0B3022]">₦{group.contribution_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#0B3022]/55 mb-1">Total Pool</p>
                    <p className="text-lg font-bold font-mono text-[#0B3022]">₦{totalPool.toLocaleString()}</p>
                  </div>
                </div>

                <Link href={`/dashboard/groups/${group.id}`} className="w-full py-3 bg-[#0B3022] hover:bg-[#124532] rounded-full text-[#F3EEE3] text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-auto">
                  View Details <ArrowRight className="h-4 w-4 text-[#D4A843]" />
                </Link>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
}
