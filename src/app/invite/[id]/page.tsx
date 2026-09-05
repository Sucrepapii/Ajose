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
  ArrowRight,
  ShieldAlert,
  FileText,
  X,
  ExternalLink,
  ShieldCheck
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

        // 3. If logged in, fetch profile and check if already a member
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
          setUser({ ...user, profile });

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
    if (!acceptedTerms) {
      toast.error("Please agree to the Terms of Service and Direct Debit Mandate to proceed.");
      return;
    }
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
              <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Min. Credit Score</span>
                </div>
                <span className="font-bold text-emerald-400">{group?.min_credit_score || 0} Points</span>
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
              user.profile?.credit_score < (group?.min_credit_score || 0) ? (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-left">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-400 font-bold mb-1">Credit Score Too Low</h4>
                      <p className="text-red-400/80 text-sm leading-relaxed">
                        Your Ajo Credit Score is <strong>{user.profile?.credit_score || 50}</strong>. This premium group requires a minimum score of <strong>{group?.min_credit_score}</strong> to join.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-left">
                  {/* Terms & Conditions Acceptance Box */}
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox"
                        id="termsAgreement"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-900 cursor-pointer"
                      />
                      <label htmlFor="termsAgreement" className="text-xs text-zinc-300 leading-relaxed cursor-pointer select-none">
                        I confirm my participation in <strong>{group?.name || 'this group'}</strong>. I accept the{" "}
                        <button 
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-emerald-400 font-bold underline hover:text-emerald-300 transition-colors"
                        >
                          Terms & Conditions
                        </button>{" "}
                        and authorize the automated direct debit mandate for my scheduled turns.
                      </label>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        CBN-Regulated PSSP Model
                      </span>
                      <button 
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        Read terms &rarr;
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleJoin}
                    disabled={!acceptedTerms || isJoining}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:shadow-none"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        Accept Invitation & Join
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  
                  {!acceptedTerms && (
                    <p className="text-[11px] text-center text-zinc-500">
                      You must agree to the Terms & Conditions and Mandate to join.
                    </p>
                  )}
                </div>
              )
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

      {/* Terms & Conditions Review Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Terms of Service & Mandate</h2>
                  <p className="text-xs text-zinc-400">Rotational Savings Agreement</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-300 leading-relaxed divide-y divide-zinc-900">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  1. Non-Custodial Direct Pass-Through Architecture
                </div>
                <p>
                  Ajo Circle operates under Nigerian payment processing frameworks and is <strong>not a commercial deposit bank</strong>. We do not hold, leverage, or escrow pooled funds. All member contributions pass directly through the Group Admin's designated settlement bank account and are automatically debited directly to the receiving member on their scheduled payout turn.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  2. Continuous Direct Debit Mandate
                </div>
                <p>
                  By joining this Ajo, you authorize an automated direct debit mandate on your linked primary bank account. On each contribution due date, the agreed amount of <strong>₦{group?.contribution_amount?.toLocaleString()}</strong> will be automatically swept into the Admin's settlement account.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  3. Default Remedies & BVN Reporting
                </div>
                <p>
                  Failure to fund your account for an automated debit or attempting to evade contribution after receiving a rotational payout will result in immediate blacklisting, automated deduction retries, reporting of your BVN/NIN to licensed Credit Bureaus, and formal debt recovery procedures.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Users className="h-4 w-4 text-emerald-400" />
                  4. Peer Transparency & Admin Accountability
                </div>
                <p>
                  The Group Admin also tenders an account governed by an automated debit mandate for recipient payouts. If an Admin payout debit fails, all members will be immediately notified in the group ledger.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link 
                href="/terms" 
                target="_blank"
                className="text-xs text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
              >
                Open Full Terms Agreement <ExternalLink className="h-3 w-3" />
              </Link>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg text-xs transition-colors flex-1 sm:flex-none"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setAcceptedTerms(true);
                    setShowTermsModal(false);
                    toast.success("Terms accepted!");
                  }}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-colors flex-1 sm:flex-none shadow-sm"
                >
                  Accept & Continue
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
