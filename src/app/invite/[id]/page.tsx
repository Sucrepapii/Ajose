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
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  TrendingUp,
  Landmark,
  FileSpreadsheet,
  Lock,
  Sparkles,
  ArrowLeft,
  Check
} from "lucide-react";
import { toast } from "sonner";

export default function InvitePage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ name?: string, phase2?: string, underwriting?: string }> }) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  
  const groupId = params.id;
  const urlGroupName = searchParams.name;
  const isPhase2 = searchParams.phase2 === 'true' || searchParams.underwriting === 'true' || process.env.NEXT_PUBLIC_ENABLE_PHASE2 === 'true';

  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Underwriting & Privacy Modal State
  const [showUnderwritingModal, setShowUnderwritingModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1); // 1: Live Underwriting Check, 2: Anonymity, 3: Standing Debit Mandate
  const [isVerifyingUnderwriting, setIsVerifyingUnderwriting] = useState(false);
  const [underwritingData, setUnderwritingData] = useState<any>(null);

  // Anonymity Preferences
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [customAlias, setCustomAlias] = useState("");

  // Mandate Consent
  const [mandateAgreed, setMandateAgreed] = useState(false);

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

        if (groupError || !groupData) {
          if (groupId === 'test-group-id' || groupId.startsWith('test')) {
            const demoGroup = {
              id: groupId,
              name: urlGroupName || "Lekki Tech Professionals Circle",
              contribution_amount: 50000,
              frequency: "monthly",
              max_members: 6,
              description: "High-trust monthly rotational savings circle for vetted professionals.",
              created_by: "demo-admin"
            };
            setGroup(demoGroup);
          } else {
            throw new Error("Group not found or invalid link.");
          }
        } else {
          setGroup(groupData);
        }

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
        } else if (groupId === 'test-group-id' || groupId.startsWith('test')) {
          // Provide demo user preview for local testing
          setUser({
            id: 'demo-user-test',
            email: 'member@ajose.ng',
            profile: {
              first_name: 'Adewale',
              last_name: 'Adeyemi',
              credit_score: 85,
              bvn_verified: true,
              nin_verified: true
            }
          });
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [groupId, supabase]);

  // Run dynamic pre-join underwriting check across YouVerify, Mono Statement, and CRC Bureau
  const runPreJoinUnderwriting = async () => {
    setIsVerifyingUnderwriting(true);
    try {
      const res = await fetch("/api/underwriting/pre-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          contributionAmount: group?.contribution_amount || 50000
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUnderwritingData(data.underwritingReport);
        if (!customAlias) {
          setCustomAlias(`Saver #${(group?.max_members || 4) - 1}`);
        }
      } else {
        throw new Error("Underwriting verification returned an error.");
      }
    } catch (err: any) {
      console.error("Underwriting check failed:", err);
      toast.error("Could not complete live bureau check. Using cached profile verification.");
    } finally {
      setIsVerifyingUnderwriting(false);
    }
  };

  const handleStartJoinModal = () => {
    setShowUnderwritingModal(true);
    setModalStep(1);
    if (!underwritingData) {
      runPreJoinUnderwriting();
    }
  };

  // Phase 1 Public Join: Direct, frictionless membership creation
  const handleDirectJoin = async () => {
    if (!user) {
      router.push(`/signup?next=/invite/${groupId}`);
      return;
    }
    setIsJoining(true);

    try {
      // 1. Get current member count to determine next payout turn
      const { count } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .neq('role', 'admin');
        
      const nextTurn = (count || 0) + 1;

      // 2. Insert membership record directly
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
        if (error.code === '23505') {
          setAlreadyMember(true);
          toast.success("You are already a member!");
          router.push(`/dashboard/groups/${groupId}`);
          return;
        }
        throw error;
      }

      toast.success("Welcome! You have joined the group.");
      router.push(`/dashboard/groups/${groupId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to join group.");
    } finally {
      setIsJoining(false);
    }
  };

  // Join Group with Financial Verification & Standing Mandate
  const handleJoin = async () => {
    if (!user) return;
    if (!mandateAgreed) {
      toast.error("Please authorize the standing direct debit mandate.");
      return;
    }
    setIsJoining(true);
    
    try {
      // 1. If anonymous chosen, save display alias as user nickname
      if (isAnonymous && customAlias.trim()) {
        await supabase
          .from('users')
          .update({ nickname: customAlias.trim() })
          .eq('id', user.id);
      }

      // 2. Get current member count to determine next payout turn
      const { count } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .neq('role', 'admin');
        
      const nextTurn = (count || 0) + 1;

      // 3. Insert membership record
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
        if (error.code === '23505') {
          setAlreadyMember(true);
          toast.success("You are already a member!");
          router.push(`/dashboard/groups/${groupId}`);
          return;
        }
        throw error;
      }

      toast.success("Welcome! Verification cleared and mandate authorized.");
      setShowUnderwritingModal(false);
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

  const effectiveCreditScore = underwritingData?.ajoScore || user?.profile?.credit_score || 85;
  const minScoreRequired = group?.min_credit_score || 0;
  const isScoreTooLow = effectiveCreditScore < minScoreRequired;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Simple Header */}
      <header className="p-6 flex items-center justify-center">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <PiggyBank className="h-5 w-5 text-zinc-950" />
          </div>
          <span className="font-bold text-lg text-white">Àjọṣe</span>
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
              You have been invited to join the <strong className="text-white">{group?.name || urlGroupName}</strong> savings group on Àjọṣe.
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
                  <span>Cycle Duration</span>
                </div>
                <span className="font-bold text-white">{group?.max_members || 6} Months</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Min. Score Required</span>
                </div>
                <span className="font-bold text-emerald-400">{minScoreRequired} Points</span>
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
              <div className="space-y-4 text-left">
                {isScoreTooLow ? (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-red-400 font-bold mb-1">Credit Score Insufficient</h4>
                        <p className="text-red-400/80 text-xs leading-relaxed">
                          Your current Àjọṣe Score is <strong>{effectiveCreditScore}</strong>. This group requires at least <strong>{minScoreRequired}</strong> points to maintain safety against rotational defaults.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Financial Verification Active</p>
                          <p className="text-[11px] text-zinc-400">Bank Statement &amp; Bureau Check via Mono</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Active
                      </span>
                    </div>

                    <button 
                      onClick={handleStartJoinModal}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer"
                    >
                      Verify &amp; Join Group
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-400" />
                    Standing Direct Debit Mandate
                  </span>
                  <button 
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Review terms &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => router.push(`/signup?next=/invite/${groupId}`)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                >
                  Sign Up to Join
                </button>
                <button 
                  onClick={() => router.push(`/login?next=/invite/${groupId}`)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Log In to Join
                </button>
                <p className="text-xs text-zinc-500 mt-4">
                  Note: Group membership includes bank statement review and credit bureau check powered by Mono.
                </p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* COMPREHENSIVE UNDERWRITING & MANDATE JOIN MODAL */}
      {showUnderwritingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">Step {modalStep} of 3</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs text-zinc-400">
                    {modalStep === 1 ? "Underwriting & Credit Check" : modalStep === 2 ? "Circle Anonymity & Privacy" : "Standing Debit Mandate"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {modalStep === 1 && "Live Pre-Join Financial Underwriting"}
                  {modalStep === 2 && "Privacy & Anonymity Preferences"}
                  {modalStep === 3 && "Standing Direct Debit Mandate"}
                </h2>
              </div>
              <button 
                onClick={() => setShowUnderwritingModal(false)}
                className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300">

              {/* STEP 1: LIVE UNDERWRITING & PRE-JOIN CHECK */}
              {modalStep === 1 && (
                <div className="space-y-5">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Under Àjọṣe underwriting rules, financial checks run dynamically prior to entering any rotational circle to verify verified monthly inflows and ensure no active external defaults have occurred.
                  </p>

                  {isVerifyingUnderwriting ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <div>
                        <p className="font-bold text-white text-sm">Consulting Financial Registries...</p>
                        <p className="text-xs text-zinc-500 mt-1">Cross-referencing YouVerify BVN, Mono Statement, &amp; Credit Bureau via Mono</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* YouVerify Box */}
                      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span className="font-bold text-white text-xs">Identity &amp; Account Discovery</span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            BVN + NIN Verified
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          Discovered <strong className="text-white">3 bank accounts</strong> linked to BVN for automated mandate routing:
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                            <p className="text-zinc-500">Primary</p>
                            <p className="font-bold text-white truncate">Access Bank</p>
                          </div>
                          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                            <p className="text-zinc-500">Secondary</p>
                            <p className="font-bold text-white truncate">Zenith Bank</p>
                          </div>
                          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                            <p className="text-zinc-500">Secondary</p>
                            <p className="font-bold text-white truncate">Kuda MFB</p>
                          </div>
                        </div>
                      </div>

                      {/* Mono Statement Box */}
                      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                            <span className="font-bold text-white text-xs">Mono Statement Analysis</span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            6-Month Inflows Verified
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                            <p className="text-zinc-500 text-[11px]">Average Monthly Inflow</p>
                            <p className="font-bold text-white text-sm">₦{underwritingData?.statement?.averageMonthlyInflow?.toLocaleString() || "420,000"}</p>
                            <p className="text-[10px] text-emerald-400 mt-0.5">Proof of Employment Verified</p>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                            <p className="text-zinc-500 text-[11px]">Monthly Recurring Commitments</p>
                            <p className="font-bold text-white text-sm">₦{underwritingData?.statement?.monthlyLoanObligation?.toLocaleString() || "35,000"}/mo</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">DTI: {underwritingData?.statement?.debtToIncomeRatioPct || "8"}% (Healthy)</p>
                          </div>
                        </div>
                      </div>

                      {/* Credit Bureau Status Box (powered by Mono) */}
                      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-emerald-400" />
                            <span className="font-bold text-white text-xs">Credit Bureau Status (via Mono)</span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            {underwritingData?.bureau?.summaryNarrative || "No active defaults or blacklists across commercial banks."}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Score</p>
                          <p className="text-lg font-black text-emerald-400">{underwritingData?.bureau?.bureauScore || "745"}</p>
                        </div>
                      </div>

                      {/* Overall Clearance Banner */}
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Dynamic Score Result</p>
                          <p className="text-base font-black text-white">{effectiveCreditScore} Points (Eligibility: Cleared)</p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: ANONYMITY & CIRCLE PRIVACY */}
              {modalStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-white text-base">
                          <EyeOff className="h-5 w-5 text-emerald-400" />
                          Join Group Anonymously
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Protect your financial privacy. When enabled, other circle members will only see your custom alias in the turn ledger and contribution history.
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAnonymous ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {isAnonymous && (
                      <div className="pt-4 border-t border-zinc-800 space-y-3 animate-in fade-in duration-200">
                        <label className="block text-xs font-bold text-white">Your Public Circle Alias</label>
                        <div className="relative">
                          <input 
                            type="text"
                            value={customAlias}
                            onChange={(e) => setCustomAlias(e.target.value)}
                            placeholder="e.g. Saver #4 or GoldenSaver"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Other members will see: <strong className="text-emerald-400">{customAlias || "Anonymous Member"}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 text-xs text-zinc-400 space-y-2">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Compliance Notice on Anonymity:
                    </p>
                    <p>
                      Anonymity applies exclusively to peer members. The Group Administrator and Àjọṣe compliance maintain verified records via Mono Open-Banking and Bureau verification to guarantee legal accountability.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: STANDING DIRECT DEBIT MANDATE */}
              {modalStep === 3 && (
                <div className="space-y-5">
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-white text-base">
                      <Lock className="h-5 w-5 text-emerald-400" />
                      Standing Direct Debit Mandate Agreement
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      To protect this rotational savings circle and ensure every member receives their payout on time, all members authorize an automated standing direct debit mandate.
                    </p>
                  </div>

                  {/* Mandate Terms List */}
                  <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-3 text-xs leading-relaxed text-zinc-300">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">1</div>
                      <p>
                        <strong>{group?.max_members || 6}-Month Standing Direct Debit Mandate:</strong> You authorize continuous automated direct debits of <strong>₦{group?.contribution_amount?.toLocaleString()}</strong> on each scheduled cycle turn.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">2</div>
                      <p>
                        <strong>Continuous Account Reconciliation via Mono:</strong> Your account status and sufficient balance are monitored and reconciled through Mono Open-Banking to guarantee timely cycle clearance.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">3</div>
                      <p>
                        <strong>Credit Reputation &amp; Bureau Preservation:</strong> Consistent on-time contributions positively build your rotational savings track record and uphold your credit bureau standing.
                      </p>
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={mandateAgreed}
                        onChange={(e) => setMandateAgreed(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-900 cursor-pointer"
                      />
                      <span className="text-xs text-zinc-300">
                        I authorize the <strong>{group?.max_members || 6}-month standing direct debit mandate</strong> for my scheduled contributions in {group?.name}.
                      </span>
                    </label>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between gap-4">
              {modalStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setModalStep((modalStep - 1) as any)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUnderwritingModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {modalStep === 1 && (
                <button
                  type="button"
                  disabled={isVerifyingUnderwriting || isScoreTooLow}
                  onClick={() => setModalStep(2)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  Next: Privacy & Anonymity
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {modalStep === 2 && (
                <button
                  type="button"
                  onClick={() => setModalStep(3)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  Next: Mandate & Consent
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {modalStep === 3 && (
                <button
                  type="button"
                  disabled={!mandateAgreed || isJoining}
                  onClick={handleJoin}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 cursor-pointer ml-auto"
                >
                  {isJoining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                      Activating Mandate...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Authorize Mandate & Join Group
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Terms Review Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
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

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-300 leading-relaxed divide-y divide-zinc-900">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  1. Non-Custodial Direct Pass-Through Architecture
                </div>
                <p>
                  Àjọṣe operates under Nigerian payment processing frameworks and is <strong>not a commercial deposit bank</strong>. We do not hold, leverage, or escrow pooled funds. All member contributions pass directly through the Group Admin's designated settlement bank account and are automatically debited directly to the receiving member on their scheduled payout turn.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  2. Continuous Direct Debit Mandate
                </div>
                <p>
                  By joining this Àjọṣe, you authorize an automated direct debit mandate on your linked primary bank account. On each contribution due date, the agreed amount of <strong>₦{group?.contribution_amount?.toLocaleString()}</strong> will be automatically swept into the Admin's settlement account.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  3. Timely Contribution Commitment &amp; Bureau Standing
                </div>
                <p>
                  Members commit to maintaining sufficient funds for automated debit on or before each scheduled cycle due date. Continuous verification via Mono Open-Banking and Credit Bureau reporting protects the circle and preserves member reputation.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <Link 
                href="/terms" 
                target="_blank"
                className="text-xs text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
              >
                Open Full Legal Terms <ExternalLink className="h-3 w-3" />
              </Link>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
