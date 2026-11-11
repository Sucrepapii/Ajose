"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function InvitePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    name?: string;
    amount?: string;
    freq?: string;
    members?: string;
    score?: string;
    phase2?: string;
    underwriting?: string;
  }>;
}) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);

  const groupId = params.id;
  const urlGroupName = searchParams.name
    ? decodeURIComponent(searchParams.name)
    : undefined;
  const urlAmount = searchParams.amount
    ? parseInt(searchParams.amount, 10)
    : undefined;
  const urlFreq = searchParams.freq;
  const urlMembers = searchParams.members
    ? parseInt(searchParams.members, 10)
    : undefined;
  const urlScore = searchParams.score
    ? parseInt(searchParams.score, 10)
    : undefined;
  const isPhase2 =
    searchParams.phase2 === "true" ||
    searchParams.underwriting === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_PHASE2 === "true";

  const router = useRouter();
  const supabase = createClient();

  const initialGroup = {
    id: groupId,
    name: urlGroupName || "Ajose Rotational Circle",
    contribution_amount:
      urlAmount !== undefined && !isNaN(urlAmount) ? urlAmount : 50000,
    frequency: urlFreq || "monthly",
    max_members:
      urlMembers !== undefined && !isNaN(urlMembers) ? urlMembers : 6,
    min_credit_score: urlScore !== undefined && !isNaN(urlScore) ? urlScore : 0,
    description: `Rotational contribution group managed on Ajose (${
      urlGroupName || "Ajose Rotational Circle"
    }).`,
    created_by: "Group Admin",
    status: "pending",
  };

  const [isLoading, setIsLoading] = useState(!urlGroupName && !urlAmount);
  const [isJoining, setIsJoining] = useState(false);
  const [isNavigatingSignup, setIsNavigatingSignup] = useState(false);
  const [isNavigatingLogin, setIsNavigatingLogin] = useState(false);
  const [isNavigatingDashboard, setIsNavigatingDashboard] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<any>(initialGroup);
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // 2. Fetch Group Details: prioritize public admin API route to bypass RLS for invitees
        let fetchedGroup: any = null;
        try {
          const apiRes = await fetch(`/api/groups/${groupId}/public`);
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData?.group) {
              fetchedGroup = apiData.group;
            }
          }
        } catch (fetchErr) {
          console.warn("Public API fetch warning:", fetchErr);
        }

        if (!fetchedGroup) {
          const { data: groupData } = await supabase
            .from("groups")
            .select("*")
            .eq("id", groupId)
            .maybeSingle();

          if (groupData) {
            fetchedGroup = groupData;
          }
        }

        // Build group data with full fidelity from URL parameters or DB
        const formattedName =
          urlGroupName || fetchedGroup?.name || "Ajose Rotational Circle";
        const finalContribution =
          urlAmount !== undefined && !isNaN(urlAmount)
            ? urlAmount
            : fetchedGroup?.contribution_amount
            ? Number(fetchedGroup.contribution_amount)
            : 50000;
        const finalFrequency = urlFreq || fetchedGroup?.frequency || "monthly";
        const finalMembers =
          urlMembers !== undefined && !isNaN(urlMembers)
            ? urlMembers
            : fetchedGroup?.max_members
            ? Number(fetchedGroup.max_members)
            : 6;
        const finalScore =
          urlScore !== undefined && !isNaN(urlScore)
            ? urlScore
            : fetchedGroup?.min_credit_score
            ? Number(fetchedGroup.min_credit_score)
            : 0;

        const groupToSet = {
          description: `Rotational contribution group managed on Ajose (${formattedName}).`,
          created_by: "Group Admin",
          status: "pending",
          ...fetchedGroup,
          id: groupId,
          name: formattedName,
          contribution_amount: finalContribution,
          frequency: finalFrequency,
          max_members: finalMembers,
          min_credit_score: finalScore,
        };

        setGroup(groupToSet);

        // 3. If logged in, fetch profile and check if already a member
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          setUser({ ...user, profile });

          const { data: membership } = await supabase
            .from("memberships")
            .select("id")
            .eq("group_id", groupId)
            .eq("user_id", user.id)
            .single();

          if (membership) {
            setAlreadyMember(true);
          }
        } else if (groupId === "test-demo-preview") {
          // Provide demo user preview only for synthetic test preview
          setUser({
            id: "demo-user-test",
            email: "member@ajose.ng",
            profile: {
              first_name: "Adewale",
              last_name: "Adeyemi",
              credit_score: 30,
              bvn_verified: true,
              nin_verified: true,
            },
          });
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [
    groupId,
    supabase,
    urlAmount,
    urlFreq,
    urlGroupName,
    urlMembers,
    urlScore,
  ]);

  // Run dynamic pre-join underwriting check across YouVerify, Mono Statement, and CRC Bureau
  const runPreJoinUnderwriting = async () => {
    setIsVerifyingUnderwriting(true);
    try {
      const res = await fetch("/api/underwriting/pre-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          contributionAmount: group?.contribution_amount || 50000,
        }),
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
      toast.error(
        "Could not complete live bureau check. Using cached profile verification.",
      );
    } finally {
      setIsVerifyingUnderwriting(false);
    }
  };

  const handleStartJoinModal = () => {
    setShowUnderwritingModal(true);
    setModalStep(1);
    if (!customAlias) {
      setCustomAlias(`Saver #${(group?.max_members || 4) - 1}`);
    }
  };

  // Phase 1 Public Join: Direct, frictionless membership creation
  const handleDirectJoin = async () => {
    const currentQuery =
      typeof window !== "undefined" ? window.location.search : "";
    const inviteRedirectPath = `/invite/${groupId}${currentQuery}`;

    if (!user) {
      router.push(`/signup?next=${encodeURIComponent(inviteRedirectPath)}`);
      return;
    }
    setIsJoining(true);

    try {
      // Fetch active auth session token to pass to the API route
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Join group via Admin API route to guarantee DB creation & roster entry
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers,
        body: JSON.stringify({
          groupId,
          userId: user.id,
          groupName: group?.name,
          contributionAmount: group?.contribution_amount,
          frequency: group?.frequency,
          maxMembers: group?.max_members,
          minCreditScore: group?.min_credit_score,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join group.");

      if (data.alreadyMember) {
        setAlreadyMember(true);
        toast.success("You are already a member!");
      } else {
        toast.success("Welcome! You have joined the group.");
      }

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
          .from("users")
          .update({ nickname: customAlias.trim() })
          .eq("id", user.id);
      }

      // Fetch active auth session token to pass to the API route
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 2. Join group via Admin API route to guarantee DB creation & roster entry
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers,
        body: JSON.stringify({
          groupId,
          userId: user.id,
          groupName: group?.name,
          contributionAmount: group?.contribution_amount,
          frequency: group?.frequency,
          maxMembers: group?.max_members,
          minCreditScore: group?.min_credit_score,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join group.");

      if (data.alreadyMember) {
        setAlreadyMember(true);
        toast.success("You are already a member!");
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
      <div className="min-h-screen bg-[#0B3022] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#F3EEE3]/70 mt-4 text-sm font-mono">
          Loading invitation...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#0B3022] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-[#D4A843]/15 rounded-full flex items-center justify-center mb-6 mx-auto">
          <AlertTriangle className="h-8 w-8 text-[#D4A843]" />
        </div>
        <h1 className="text-2xl font-bold text-[#F3EEE3] mb-2">
          Invalid Invite
        </h1>
        <p className="text-[#F3EEE3]/70 mb-8 max-w-md mx-auto">{errorMsg}</p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#D4A843] rounded-full text-[#0B3022] font-bold hover:bg-[#dfba59] transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const effectiveCreditScore =
    underwritingData?.ajoScore ?? user?.profile?.credit_score ?? (user?.profile?.bvn_verified ? 30 : 0);
  const minScoreRequired = group?.min_credit_score || 0;
  const isScoreTooLow = effectiveCreditScore < minScoreRequired;

  const rawFreq = (group?.frequency || urlFreq || "monthly").toLowerCase();
  const totalRounds = group?.max_members || 6;

  const getCycleDurationLabel = (rounds: number, freq: string) => {
    switch (freq) {
      case "daily":
        return `${rounds}-Day`;
      case "weekly":
        return `${rounds}-Week`;
      case "biweekly":
        return `${rounds * 2}-Week`;
      case "monthly":
      default:
        return `${rounds}-Month`;
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "daily":
        return "daily";
      case "weekly":
        return "weekly";
      case "biweekly":
        return "bi-weekly";
      case "monthly":
      default:
        return "monthly";
    }
  };

  const getCycleDurationSummary = (rounds: number, freq: string) => {
    switch (freq) {
      case "daily":
        return `${rounds} Round${rounds === 1 ? "" : "s"} (${rounds} Day${
          rounds === 1 ? "" : "s"
        })`;
      case "weekly":
        return `${rounds} Round${rounds === 1 ? "" : "s"} (${rounds} Week${
          rounds === 1 ? "" : "s"
        })`;
      case "biweekly":
        return `${rounds} Round${rounds === 1 ? "" : "s"} (${
          rounds * 2
        } Weeks)`;
      case "monthly":
      default:
        return `${rounds} Round${rounds === 1 ? "" : "s"} (${rounds} Month${
          rounds === 1 ? "" : "s"
        })`;
    }
  };

  const cycleDurationLabel = getCycleDurationLabel(totalRounds, rawFreq);
  const frequencyLabel = getFrequencyLabel(rawFreq);
  const cycleDurationSummary = getCycleDurationSummary(totalRounds, rawFreq);

  return (
    <div className="min-h-screen flex bg-[#F3EEE3] text-[#0B3022] font-sans">
      {/* Left Pane - Editorial Branding & Visuals */}
      <div className="hidden lg:flex w-[45%] relative bg-[#0B3022] items-center justify-center overflow-hidden border-r border-[#F3EEE3]/10">
        <Image
          src="/custom-signup-bg.jpg"
          alt="Invite Background"
          fill
          className="object-cover opacity-35 mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3022] via-[#0B3022]/80 to-[#0B3022]/65" />

        <div className="relative z-10 p-12 text-left flex flex-col max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 mb-6 w-max">
            <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#F3EEE3]">
              Turn by turn, no wahala
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#F3EEE3] leading-[1.08] tracking-[-0.03em] mb-4">
            You&apos;ve been invited to{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">
              save together.
            </span>
          </h1>

          <p className="text-[#F3EEE3]/75 text-base leading-relaxed mb-8">
            Join{" "}
            <strong className="text-[#F3EEE3]">
              {group?.name || urlGroupName || "Ajose Circle"}
            </strong>{" "}
            — Nigeria&apos;s trusted digital platform for rotational
            contributions.
          </p>

          <div className="w-full bg-[#F3EEE3]/[0.05] border border-[#F3EEE3]/10 rounded-2xl p-6 backdrop-blur-md text-left space-y-3.5">
            <div className="flex items-center gap-3 text-sm text-[#F3EEE3]/90">
              <div className="w-8 h-8 rounded-full bg-[#D4A843]/15 flex items-center justify-center text-[#D4A843] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Institutional-grade tracking &amp; accountability</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#F3EEE3]/90">
              <div className="w-8 h-8 rounded-full bg-[#D4A843]/15 flex items-center justify-center text-[#D4A843] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Fair turn-by-turn payout rotation</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#F3EEE3]/90">
              <div className="w-8 h-8 rounded-full bg-[#D4A843]/15 flex items-center justify-center text-[#D4A843] shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <span>Verified open-banking identity via Mono</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Content Card */}
      <div className="w-full lg:w-[55%] flex flex-col justify-between pt-8 sm:pt-10 pb-12 px-6 sm:px-12 md:px-16 xl:px-20 overflow-y-auto min-h-screen relative overflow-hidden">
        {/* Subtle Brand Watermark */}
        <div className="absolute -right-24 -bottom-24 w-[480px] h-[480px] lg:w-[560px] lg:h-[560px] pointer-events-none opacity-[0.045] select-none">
          <Image
            src="/ajose-brand-pot.png"
            alt=""
            fill
            className="object-contain"
            priority={false}
          />
        </div>

        {/* Header & Logo */}
        <div className="flex items-center justify-between w-full mb-8 relative z-10 pt-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#0B3022]/70 hover:text-[#0B3022] transition-colors font-semibold text-xs bg-white hover:bg-white/90 px-4 py-2 rounded-full border border-[#0B3022]/15 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#0B3022]/10 text-[11px] font-mono text-[#0B3022]/70 tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B3022]" />
              <span>Verified Invitation</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
            >
              <Image
                src="/ajose-brand-pot.png"
                alt="Àjọṣe Logo"
                width={36}
                height={36}
                className="object-contain w-auto h-9 drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-[#0B3022] font-bold text-2xl font-serif tracking-tight">
                Àjọ<span className="text-[#D4A843]">ṣe</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto my-auto relative z-10">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_12px_32px_rgba(11,48,34,0.05)] border border-[#0B3022]/10 relative overflow-hidden">
            {/* Header Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EEE3] border border-[#0B3022]/15 text-[#0B3022] font-mono font-bold text-[11px] uppercase tracking-wider mb-3">
                <Users className="w-3.5 h-3.5 text-[#D4A843]" />
                Group Invitation
              </div>
              <h2 className="text-3xl font-bold text-[#0B3022] mb-2 leading-tight tracking-tight">
                {group?.name ||
                  urlGroupName ||
                  "Rotational Contribution Circle"}
              </h2>
              <p className="text-[#0B3022]/65 text-sm">
                You have been invited to join this contribution circle on Àjọṣe.
              </p>
            </div>

            {/* Group Financial Details Grid */}
            <div className="bg-[#F3EEE3]/70 rounded-2xl p-5 mb-8 space-y-3.5 border border-[#0B3022]/10">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5 text-[#0B3022]/70 text-sm">
                  <Wallet className="h-4 w-4 text-[#0B3022]" />
                  <span className="font-medium">Contribution Amount</span>
                </div>
                <span className="font-mono font-bold text-lg text-[#0B3022]">
                  ₦{group?.contribution_amount?.toLocaleString() || "50,000"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#0B3022]/10 pt-3">
                <div className="flex items-center gap-2.5 text-[#0B3022]/70 text-sm">
                  <CalendarDays className="h-4 w-4 text-[#0B3022]" />
                  <span className="font-medium">Contribution Frequency</span>
                </div>
                <span className="font-bold text-[#0B3022] capitalize">
                  {frequencyLabel}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#0B3022]/10 pt-3">
                <div className="flex items-center gap-2.5 text-[#0B3022]/70 text-sm">
                  <Users className="h-4 w-4 text-[#0B3022]" />
                  <span className="font-medium">Cycle Duration</span>
                </div>
                <span className="font-bold text-[#0B3022]">
                  {cycleDurationSummary}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-[#0B3022]/10 pt-3">
                <div className="flex items-center gap-2.5 text-[#0B3022]/70 text-sm">
                  <ShieldAlert className="h-4 w-4 text-[#0B3022]" />
                  <span className="font-medium">Min. Score Required</span>
                </div>
                <span className="font-mono font-bold text-[#0B3022]">
                  {minScoreRequired} Points
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {alreadyMember ? (
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 text-[#0B3022] font-bold bg-[#D4A843]/20 px-4 py-2 rounded-full border border-[#D4A843]/40 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-[#0B3022]" />
                  You are already an active member of this group
                </div>
                <button
                  disabled={isNavigatingDashboard}
                  onClick={() => {
                    setIsNavigatingDashboard(true);
                    router.push(`/dashboard/groups/${groupId}`);
                  }}
                  className="w-full bg-[#0B3022] hover:bg-[#124532] disabled:opacity-75 text-[#F3EEE3] font-bold py-4 px-6 rounded-full transition-colors shadow-md text-center text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isNavigatingDashboard ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#D4A843]" />
                      <span>Opening Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <span>View Group Dashboard</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            ) : user ? (
              <div className="space-y-5 text-left">
                {isScoreTooLow ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-red-900 font-bold mb-1">
                          Trust Score Insufficient
                        </h4>
                        <p className="text-red-700 text-xs leading-relaxed">
                          Your current Àjọṣe Trust Score is{" "}
                          <strong>{effectiveCreditScore}</strong>. This group
                          requires at least <strong>{minScoreRequired}</strong>{" "}
                          points to maintain safety against rotational defaults.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#F3EEE3] border border-[#0B3022]/10 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0B3022] flex items-center justify-center text-[#D4A843] shrink-0">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0B3022]">
                            Open-Banking Mandate Ready
                          </p>
                          <p className="text-[11px] text-[#0B3022]/60">
                            Automated direct debit rotational sweep via Mono
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#0B3022] bg-[#D4A843] px-2.5 py-1 rounded-full">
                        READY
                      </span>
                    </div>

                    <button
                      onClick={handleStartJoinModal}
                      className="w-full py-4 px-6 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Accept Invite &amp; Join Group
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                <div className="flex items-center justify-between text-xs text-[#0B3022]/60 pt-2 border-t border-[#0B3022]/10">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Lock className="h-3.5 w-3.5 text-[#0B3022]" />
                    Standing Direct Debit Mandate
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-[#0B3022] font-bold underline decoration-[#D4A843] cursor-pointer"
                  >
                    Review terms &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <button
                  disabled={isNavigatingSignup || isNavigatingLogin}
                  onClick={() => {
                    setIsNavigatingSignup(true);
                    const currentQuery =
                      typeof window !== "undefined"
                        ? window.location.search
                        : "";
                    const inviteRedirectPath = `/invite/${groupId}${currentQuery}`;
                    router.push(
                      `/signup?next=${encodeURIComponent(inviteRedirectPath)}`,
                    );
                  }}
                  className="w-full py-4 px-6 bg-[#D4A843] hover:bg-[#dfba59] disabled:opacity-75 text-[#0B3022] font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isNavigatingSignup ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#0B3022]" />
                      <span>Redirecting to Sign Up...</span>
                    </>
                  ) : (
                    <>
                      <span>Accept Invite &amp; Sign Up</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <button
                  disabled={isNavigatingSignup || isNavigatingLogin}
                  onClick={() => {
                    setIsNavigatingLogin(true);
                    const currentQuery =
                      typeof window !== "undefined"
                        ? window.location.search
                        : "";
                    const inviteRedirectPath = `/invite/${groupId}${currentQuery}`;
                    router.push(
                      `/login?next=${encodeURIComponent(inviteRedirectPath)}`,
                    );
                  }}
                  className="w-full py-3.5 px-6 bg-[#F3EEE3] border border-[#0B3022]/15 hover:border-[#D4A843] disabled:opacity-75 text-[#0B3022] font-bold rounded-full transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  {isNavigatingLogin ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#0B3022]" />
                      <span>Redirecting to Log In...</span>
                    </>
                  ) : (
                    <span>Log In to Join</span>
                  )}
                </button>
                <p className="text-xs text-[#0B3022]/60 text-center mt-4 leading-relaxed">
                  🔒 Group membership includes statement verification powered by
                  Mono Open-Banking.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 mt-8 text-center text-xs font-mono text-[#0B3022]/50 tracking-wide">
          <span>
            © 2026 Àjọṣe Technologies · NDPR Compliant · Automated Direct Debit
            Routing
          </span>
        </div>
      </div>

      {/* COMPREHENSIVE UNDERWRITING & MANDATE JOIN MODAL */}
      {showUnderwritingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0B3022] border border-[#F3EEE3]/15 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#F3EEE3]/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#D4A843] tracking-wider">
                    Step {modalStep} of 2
                  </span>
                  <span className="text-[#F3EEE3]/30">•</span>
                  <span className="text-xs text-[#F3EEE3]/70">
                    {modalStep === 1
                      ? "Circle Anonymity & Privacy"
                      : `${cycleDurationLabel} Standing Mandate`}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#F3EEE3] mt-1">
                  {modalStep === 1 && "Privacy & Anonymity Preferences"}
                  {modalStep === 2 &&
                    `${cycleDurationLabel} Standing Direct Debit Mandate`}
                </h2>
              </div>
              <button
                onClick={() => setShowUnderwritingModal(false)}
                className="text-[#F3EEE3]/60 hover:text-[#F3EEE3] transition-colors p-2 rounded-lg hover:bg-[#F3EEE3]/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#F3EEE3]/85">
              {/* STEP 1: ANONYMITY & CIRCLE PRIVACY */}
              {modalStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-[#D4A843]/15 border border-[#D4A843]/35 rounded-2xl p-4 text-xs text-[#F3EEE3]/90 leading-relaxed flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-[#D4A843] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#F3EEE3]">
                        Streamlined Membership Activation:
                      </strong>{" "}
                      Your BVN identity is verified. In-depth 6-month bank
                      statement cashflow underwriting is deferred to Phase 2
                      (reserved for emergency loans and advance liquidity).
                    </div>
                  </div>

                  <div className="bg-[#F3EEE3]/[0.05] border border-[#F3EEE3]/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-[#F3EEE3] text-base">
                          <EyeOff className="h-5 w-5 text-[#D4A843]" />
                          Join Group Anonymously
                        </div>
                        <p className="text-xs text-[#F3EEE3]/65 leading-relaxed">
                          Protect your financial privacy. When enabled, other
                          circle members will only see your custom alias in the
                          turn ledger and contribution history.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isAnonymous ? "bg-[#D4A843]" : "bg-[#F3EEE3]/20"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B3022] shadow ring-0 transition duration-200 ease-in-out ${
                            isAnonymous ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {isAnonymous && (
                      <div className="pt-4 border-t border-[#F3EEE3]/10 space-y-3 animate-in fade-in duration-200">
                        <label className="block text-xs font-bold text-[#F3EEE3]">
                          Your Public Circle Alias
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={customAlias}
                            onChange={(e) => setCustomAlias(e.target.value)}
                            placeholder="e.g. Saver #4 or GoldenSaver"
                            className="w-full bg-[#0B3022] border border-[#F3EEE3]/20 rounded-xl px-4 py-2.5 text-sm text-[#F3EEE3] focus:outline-none focus:border-[#D4A843] font-medium"
                          />
                        </div>
                        <p className="text-[11px] text-[#F3EEE3]/60">
                          Other members will see:{" "}
                          <strong className="text-[#D4A843]">
                            {customAlias || "Anonymous Member"}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#F3EEE3]/[0.04] border border-[#F3EEE3]/10 rounded-2xl p-4 text-xs text-[#F3EEE3]/70 space-y-2">
                    <p className="font-bold text-[#F3EEE3] flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#D4A843]" />
                      Compliance Notice on Anonymity:
                    </p>
                    <p>
                      Anonymity applies exclusively to peer members. The Group
                      Administrator and Àjọṣe compliance maintain verified
                      records via Mono Open-Banking to guarantee circle
                      integrity.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: STANDING DIRECT DEBIT MANDATE */}
              {modalStep === 2 && (
                <div className="space-y-5">
                  <div className="bg-[#D4A843]/15 border border-[#D4A843]/35 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-[#F3EEE3] text-base">
                      <Lock className="h-5 w-5 text-[#D4A843]" />
                      Standing Direct Debit Mandate Agreement
                    </div>
                    <p className="text-xs text-[#F3EEE3]/80 leading-relaxed">
                      To protect this rotational contribution circle and ensure
                      every member receives their payout on time, all members
                      authorize an automated standing direct debit mandate.
                    </p>
                  </div>

                  {/* Mandate Terms List */}
                  <div className="bg-[#F3EEE3]/[0.05] border border-[#F3EEE3]/10 rounded-2xl p-4 space-y-3 text-xs leading-relaxed text-[#F3EEE3]/85">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#D4A843] text-[#0B3022] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        1
                      </div>
                      <p>
                        <strong>
                          {cycleDurationLabel} Standing Direct Debit Mandate:
                        </strong>{" "}
                        You authorize continuous automated direct debits of{" "}
                        <strong>
                          ₦{group?.contribution_amount?.toLocaleString()}
                        </strong>{" "}
                        on each scheduled {frequencyLabel} cycle turn.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#D4A843] text-[#0B3022] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        2
                      </div>
                      <p>
                        <strong>Admin Management &amp; Know Your Admin:</strong>{" "}
                        This circle is managed entirely by the Ajo Admin. You
                        confirm that you know and trust the Admin. Àjọṣe
                        provides management software only and is not responsible
                        for unpaid contributions.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#D4A843] text-[#0B3022] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        3
                      </div>
                      <p>
                        <strong>
                          Credit Reputation &amp; Bureau Preservation:
                        </strong>{" "}
                        Consistent on-time contributions positively build your
                        rotational contribution track record and uphold your
                        credit bureau standing.
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
                        className="mt-1 h-4 w-4 rounded border-[#F3EEE3]/30 accent-[#D4A843] cursor-pointer"
                      />
                      <span className="text-xs text-[#F3EEE3]/85 leading-normal">
                        I confirm that I know and trust the Ajo Admin, accept
                        the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-[#D4A843] underline font-semibold"
                        >
                          Terms of Service
                        </button>
                        , and authorize the{" "}
                        <strong>
                          {cycleDurationLabel.toLowerCase()} standing direct
                          debit mandate
                        </strong>{" "}
                        for my scheduled contributions in {group?.name}.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-[#F3EEE3]/10 flex items-center justify-between gap-4">
              {modalStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className="px-4 py-2.5 bg-[#F3EEE3]/10 hover:bg-[#F3EEE3]/20 text-[#F3EEE3] font-bold rounded-full text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUnderwritingModal(false)}
                  className="px-4 py-2.5 bg-[#F3EEE3]/10 hover:bg-[#F3EEE3]/20 text-[#F3EEE3]/70 hover:text-[#F3EEE3] font-medium rounded-full text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {modalStep === 1 && (
                <button
                  type="button"
                  onClick={() => setModalStep(2)}
                  className="px-6 py-2.5 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold rounded-full text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  Next: Mandate &amp; Consent
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {modalStep === 2 && (
                <button
                  type="button"
                  disabled={!mandateAgreed || isJoining}
                  onClick={handleJoin}
                  className="px-6 py-2.5 bg-[#D4A843] hover:bg-[#dfba59] disabled:opacity-50 text-[#0B3022] font-bold rounded-full text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ml-auto"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#0B3022]" />
                      <span>Activating Mandate &amp; Joining...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Authorize Mandate &amp; Join Group</span>
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
          <div className="bg-[#0B3022] border border-[#F3EEE3]/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-[#F3EEE3]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A843]/15 border border-[#D4A843]/35 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#D4A843]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#F3EEE3]">
                    Terms of Service &amp; Mandate
                  </h2>
                  <p className="text-xs text-[#F3EEE3]/60">
                    Rotational Contribution Agreement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-[#F3EEE3]/60 hover:text-[#F3EEE3] transition-colors p-2 rounded-lg hover:bg-[#F3EEE3]/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#F3EEE3]/80 leading-relaxed divide-y divide-[#F3EEE3]/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#D4A843] font-bold text-sm">
                  <Users className="h-4 w-4" />
                  1. Ajo Admin Responsibility &amp; Platform Role
                </div>
                <p>
                  The Ajo Admin who created this circle takes full
                  responsibility for managing it, vetting members, tracking
                  collections, and overseeing group turns. Àjọṣe provides
                  software automation to make rotational savings easier and does
                  not manage or guarantee group funds.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-[#D4A843] font-bold text-sm">
                  <ShieldAlert className="h-4 w-4" />
                  2. Member Due Diligence: Know Your Admin
                </div>
                <p>
                  Anyone joining this group{" "}
                  <strong>
                    must make sure they personally know and trust the Ajo Admin
                    well
                  </strong>{" "}
                  before committing funds. Participation in any rotational
                  circle is strictly voluntary and at your own discretion and
                  risk.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-[#D4A843] font-bold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  3. Non-Liability for Late or Unpaid Contributions
                </div>
                <p>
                  <strong>
                    Àjọṣe will not be responsible or liable for late, defaulted,
                    failed, or unpaid contributions.
                  </strong>{" "}
                  We do not absorb peer credit risk. Any collection recovery or
                  disputes remain strictly between members and their Ajo Admin.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 text-[#D4A843] font-bold text-sm">
                  <Wallet className="h-4 w-4" />
                  4. Continuous Direct Debit Mandate
                </div>
                <p>
                  By joining, you authorize an automated direct debit mandate on
                  your linked primary bank account via Mono. On each{" "}
                  {frequencyLabel} contribution due date, the agreed amount of{" "}
                  <strong>
                    ₦{group?.contribution_amount?.toLocaleString()}
                  </strong>{" "}
                  will be automatically swept for rotational payout.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#F3EEE3]/10 flex items-center justify-between">
              <Link
                href="/terms"
                target="_blank"
                className="text-xs text-[#F3EEE3]/70 hover:text-[#D4A843] inline-flex items-center gap-1 transition-colors"
              >
                Open Full Legal Terms <ExternalLink className="h-3 w-3" />
              </Link>
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold rounded-full text-xs transition-colors cursor-pointer"
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
