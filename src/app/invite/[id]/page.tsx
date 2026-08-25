"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  PiggyBank, 
  Users, 
  Wallet, 
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function InvitePage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ name?: string }> }) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  
  const groupId = params.id;
  const urlGroupName = searchParams.name;

  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Check Auth Status
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // 2. Fetch Group Details
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError || !groupData) throw new Error("Group not found or invalid link.");
        setGroup(groupData);

        // 3. If logged in, check if already a member
        if (user) {
          const { data: membership } = await supabase
            .from('memberships')
            .select('id')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .single();

          if (membership) {
            setAlreadyMember(true);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [groupId, supabase]);

  const handleJoin = async () => {
    if (!user) return;
    setIsJoining(true);
    
    try {
      // Get current member count (excluding admins) to determine next payout turn
      const { count } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .neq('role', 'admin');
        
      const nextTurn = (count || 0) + 1;

      const { error } = await supabase
        .from('memberships')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
          status: 'active',
          payout_turn: nextTurn
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          setAlreadyMember(true);
          toast.success("You are already a member!");
          router.push(`/dashboard/groups/${groupId}`);
          return;
        }
        throw error;
      }

      toast.success("Successfully joined the group!");
      router.push(`/dashboard/groups/${groupId}`);
      router.refresh();

    } catch (err: any) {
      toast.error(err.message || "Failed to join group.");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 mt-4">Loading invitation...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Invalid Invite</h1>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">{errorMsg}</p>
        <Link href="/" className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-medium hover:bg-zinc-800 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Simple Header */}
      <header className="p-6 flex items-center justify-center">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <PiggyBank className="h-5 w-5 text-zinc-950" />
          </div>
          <span className="font-bold text-lg">Ajo Circle</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl text-center">
            
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">You've been invited!</h1>
            <p className="text-zinc-400 text-sm mb-8">
              You have been invited to join the <strong className="text-white">{group?.name || urlGroupName}</strong> savings group on Ajo Circle.
            </p>

            {/* Group Details Card */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 mb-8 text-left space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Wallet className="h-4 w-4" />
                  <span>Contribution</span>
                </div>
                <span className="font-bold text-white">₦{group?.contribution_amount?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  <span>Frequency</span>
                </div>
                <span className="font-bold text-white capitalize">{group?.frequency}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Max Members</span>
                </div>
                <span className="font-bold text-white">{group?.max_members}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {alreadyMember ? (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-emerald-400 font-medium mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                  You are already a member
                </div>
                <Link 
                  href={`/dashboard/groups/${groupId}`}
                  className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors border border-zinc-700"
                >
                  View Group
                </Link>
              </div>
            ) : user ? (
              <button 
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-70"
              >
                {isJoining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    Accept Invitation
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => router.push(`/signup?next=/invite/${groupId}`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Sign Up to Join
                </button>
                <button 
                  onClick={() => router.push(`/login?next=/invite/${groupId}`)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Log In to Join
                </button>
                <p className="text-xs text-zinc-500 mt-4">
                  Note: You must pass our strict credit verification to be accepted into this group.
                </p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
