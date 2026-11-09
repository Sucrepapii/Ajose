"use client";

import { useState } from "react";
import { 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  TrendingDown, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Clock, 
  Award,
  Info,
  Pencil
} from "lucide-react";
import { toast } from "sonner";
import { UserReferralSummary, REFERRAL_TIERS, ReferralTierName } from "@/utils/referralTiers";

interface ReferralDashboardClientProps {
  initialSummary: UserReferralSummary;
}

function getTierDiscountPct(feePct: number): number {
  return Math.max(0, Math.round(((2.0 - feePct) / 2.0) * 100));
}

export function ReferralDashboardClient({ initialSummary }: ReferralDashboardClientProps) {
  const [summary, setSummary] = useState<UserReferralSummary>(initialSummary);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Custom referral code state
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState("");
  const [isSavingCode, setIsSavingCode] = useState(false);

  // Redeem code form state
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const copyLink = () => {
    if (!summary?.referralLink) return;
    navigator.clipboard.writeText(summary.referralLink);
    setCopiedLink(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyCode = () => {
    if (!summary?.referralCode) return;
    navigator.clipboard.writeText(summary.referralCode);
    setCopiedCode(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const shareOnWhatsApp = () => {
    if (!summary?.referralLink) return;
    const msg = `Hey! I'm running my savings circles on Àjọṣe — automated debits, scheduled turns, and instant bank payouts without chasing anyone. Join with my link: ${summary.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    setIsRedeeming(true);
    const toastId = toast.loading("Applying referral code...");
    try {
      const res = await fetch("/api/user/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to apply referral code");
      }

      toast.success(data.message || "Referral code linked successfully!", { id: toastId });
      setRedeemCode("");

      const refreshRes = await fetch("/api/user/referrals");
      const refreshData = await refreshRes.json();
      if (refreshData?.summary) {
        setSummary(refreshData.summary);
      }
    } catch (err: any) {
      toast.error(err.message || "Could not apply referral code.", { id: toastId });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleSaveCustomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCodeInput.trim()) return;

    setIsSavingCode(true);
    const toastId = toast.loading("Updating your referral code...");
    try {
      const res = await fetch("/api/user/referrals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: customCodeInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update referral code");
      }

      toast.success(data.message || "Referral code updated!", { id: toastId });
      setSummary(prev => ({
        ...prev,
        referralCode: data.referralCode,
        referralLink: data.referralLink || prev.referralLink,
      }));
      setIsEditingCode(false);
    } catch (err: any) {
      toast.error(err.message || "Could not customize referral code", { id: toastId });
    } finally {
      setIsSavingCode(false);
    }
  };

  const tierOrder: ReferralTierName[] = ["Standard", "Advocate", "Champion", "Ambassador", "Legend"];
  const currentDiscountPct = getTierDiscountPct(summary.tier.feePct);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#0B3022] rounded-2xl">
            <Gift className="h-6 w-6 text-[#D4A843]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold mb-1 uppercase tracking-wider bg-[#0B3022] text-[#F3EEE3]">
              <TrendingDown className="w-3 h-3 text-[#D4A843]" />
              <span>Platform Fee Slash Engine</span>
            </div>
            <h1 className="text-3xl font-bold text-[#0B3022] tracking-tight">
              Refer &amp;{" "}
              <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
                Earn.
              </span>
            </h1>
            <p className="text-[#0B3022]/65 text-sm">
              Invite friends to Àjọṣe and slash your monthly platform fee from 2.0% down to 0.5%.
            </p>
          </div>
        </div>

        {/* Current Fee Highlight Badge */}
        <div className="bg-[#0B3022] text-[#F3EEE3] p-5 rounded-3xl border border-[#0B3022] flex items-center justify-between md:justify-end gap-5 shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4A843] block">
              Your Monthly Rate
            </span>
            <span className="text-3xl font-bold font-mono text-[#F3EEE3] tracking-tight">
              {summary.effectiveFeePct.toFixed(1)}%
            </span>
          </div>
          <div className="border-l border-[#F3EEE3]/15 pl-4 text-right">
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#D4A843] text-[#0B3022]">
              {summary.tier.badgeTitle}
            </span>
            <p className="text-[11px] text-[#F3EEE3]/70 font-medium mt-1">
              {currentDiscountPct > 0 ? `${currentDiscountPct}% Fee Discount` : "Standard Tier"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#0B3022]/60">Active Friends</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EEE3] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#0B3022]" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-[#0B3022]">{summary.activeCount}</div>
          <p className="text-[11px] text-[#0B3022]/65 mt-1">Qualified &amp; verified</p>
        </div>

        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#0B3022]/60">Pending Friends</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EEE3] flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#D4A843]" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-[#0B3022]">{summary.pendingCount}</div>
          <p className="text-[11px] text-[#0B3022]/65 mt-1">Awaiting 1st debit / BVN</p>
        </div>

        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#0B3022]/60">Total Invited</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EEE3] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#0B3022]" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-[#0B3022]">{summary.totalReferrals}</div>
          <p className="text-[11px] text-[#0B3022]/65 mt-1">Total link signups</p>
        </div>

        <div className="bg-white border border-[#D4A843]/40 rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#0B3022]/60">Fee Discount</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4A843]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#0B3022]" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-[#0B3022]">
            {currentDiscountPct}%
          </div>
          <p className="text-[11px] text-[#0B3022]/75 font-bold mt-1">Off standard 2.0% fee</p>
        </div>
      </div>

      {/* Progress to Next Tier Card */}
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="font-bold text-base text-[#0B3022] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4A843]" />
              <span>Next Tier Milestones</span>
            </h3>
            {summary.tier.nextTierName ? (
              <p className="text-xs text-[#0B3022]/70 mt-0.5">
                Need <strong className="text-[#0B3022] font-bold">{summary.referralsNeededForNext}</strong> more active {summary.referralsNeededForNext === 1 ? "friend" : "friends"} to unlock{" "}
                <strong className="text-[#0B3022] font-bold">{summary.tier.nextTierName}</strong> tier (
                {REFERRAL_TIERS[summary.tier.nextTierName as ReferralTierName]?.feePct.toFixed(1)}%).
              </p>
            ) : (
              <p className="text-xs text-[#0B3022] font-bold mt-0.5">
                Legend Tier Unlocked! You are at the highest discount level (0.5% fee).
              </p>
            )}
          </div>

          <button
            onClick={() => setShowRules(!showRules)}
            className="text-xs text-[#0B3022] font-bold underline decoration-[#D4A843] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <Info className="w-3.5 h-3.5 text-[#D4A843]" />
            <span>How friends qualify</span>
          </button>
        </div>

        {/* Progress Bar */}
        {summary.tier.nextTierName && (
          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between text-xs text-[#0B3022]/65 font-mono">
              <span>{summary.activeCount} active friends</span>
              <span className="font-bold text-[#0B3022]">{summary.progressPct}% to {summary.tier.nextTierName}</span>
            </div>
            <div className="w-full h-3 bg-[#F3EEE3] rounded-full overflow-hidden p-0.5 border border-[#0B3022]/10">
              <div 
                className="h-full bg-[#D4A843] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(summary.progressPct, 4)}%` }}
              />
            </div>
          </div>
        )}

        {/* Quality Guidelines Modal / Expandable */}
        {showRules && (
          <div className="mt-5 p-5 rounded-2xl bg-[#0B3022] text-[#F3EEE3] border border-[#0B3022] text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-[#D4A843] uppercase tracking-wider text-[11px]">
                4 Rules for an Active / Qualified Referral
              </span>
              <button 
                onClick={() => setShowRules(false)}
                className="text-[#F3EEE3]/60 hover:text-[#F3EEE3] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[#F3EEE3]/75 text-[11px] leading-relaxed">
              To keep circles safe, secure, and prevent bot gaming, referrals qualify once your friend completes four milestones:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2 bg-[#F3EEE3]/[0.06] p-2.5 rounded-xl border border-[#F3EEE3]/10">
                <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                <span>1. Signs up with verified email/phone</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F3EEE3]/[0.06] p-2.5 rounded-xl border border-[#F3EEE3]/10">
                <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                <span>2. Verifies BVN via Bank mandate</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F3EEE3]/[0.06] p-2.5 rounded-xl border border-[#F3EEE3]/10">
                <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                <span>3. Joins or starts an active circle</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F3EEE3]/[0.06] p-2.5 rounded-xl border border-[#F3EEE3]/10">
                <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                <span>4. Completes first successful auto-debit</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Kit Card */}
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 space-y-5">
        <div>
          <h3 className="font-bold text-lg text-[#0B3022]">Your Share Kit</h3>
          <p className="text-xs text-[#0B3022]/65">
            Share your unique referral code or link with friends, family, or colleagues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Referral Code Box */}
          <div className="bg-[#F3EEE3]/60 border border-[#0B3022]/10 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono font-bold text-[#0B3022]/60 uppercase tracking-wider block">
                  Your Referral Code
                </span>
                {!isEditingCode && (
                  <button
                    onClick={() => {
                      setCustomCodeInput(summary.referralCode);
                      setIsEditingCode(true);
                    }}
                    className="text-[11px] text-[#0B3022] font-bold underline decoration-[#D4A843] flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3 text-[#D4A843]" />
                    <span>Customize</span>
                  </button>
                )}
              </div>

              {isEditingCode ? (
                <form onSubmit={handleSaveCustomCode} className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={customCodeInput}
                    onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. TUNDE or EMEKA"
                    disabled={isSavingCode}
                    className="w-full bg-white border border-[#0B3022]/15 rounded-xl px-3 py-2 text-sm text-[#0B3022] font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSavingCode || !customCodeInput.trim()}
                      className="px-4 py-1.5 bg-[#0B3022] text-[#F3EEE3] text-xs font-bold rounded-full hover:bg-[#124532] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingCode ? "Saving..." : "Save Code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      disabled={isSavingCode}
                      className="px-4 py-1.5 bg-white border border-[#0B3022]/15 text-[#0B3022] text-xs font-bold rounded-full transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-xl font-mono font-bold text-[#0B3022] tracking-wider select-all">
                  {summary.referralCode}
                </div>
              )}
            </div>

            {!isEditingCode && (
              <button
                onClick={copyCode}
                className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-[#0B3022]/15 hover:border-[#D4A843] bg-white text-[#0B3022] font-bold text-xs transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#D4A843]" /> : <Copy className="w-3.5 h-3.5 text-[#0B3022]/60" />}
                <span>{copiedCode ? "Code Copied!" : "Copy Code"}</span>
              </button>
            )}
          </div>

          {/* Referral Link Box */}
          <div className="bg-[#F3EEE3]/60 border border-[#0B3022]/10 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#0B3022]/60 uppercase tracking-wider block mb-1">
                Your Invite Link
              </span>
              <p className="text-xs text-[#0B3022] font-mono truncate select-all bg-white p-2.5 rounded-xl border border-[#0B3022]/10">
                {summary.referralLink}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border border-[#0B3022]/15 hover:border-[#D4A843] bg-white text-[#0B3022] font-bold text-xs transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#D4A843]" /> : <Copy className="w-3.5 h-3.5 text-[#0B3022]/60" />}
                <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-bold text-xs transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#D4A843]" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Breakdown Comparison Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-[#0B3022]">All 5 Referral Tiers</h3>
          <span className="text-xs text-[#0B3022]/60 font-mono">Automatic tiered fee reductions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {tierOrder.map((name) => {
            const tierData = REFERRAL_TIERS[name];
            const isCurrent = summary.tier.name === name;

            return (
              <div 
                key={name}
                className={`rounded-3xl p-5 border transition-all flex flex-col justify-between relative ${
                  isCurrent 
                    ? "bg-[#0B3022] text-[#F3EEE3] border-[#D4A843]" 
                    : "bg-white text-[#0B3022] border-[#0B3022]/10"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#D4A843] text-[#0B3022] font-mono font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Current Tier
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isCurrent ? "text-[#D4A843]" : "text-[#0B3022]"}`}>
                      {name}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isCurrent ? "bg-[#F3EEE3]/10 text-[#F3EEE3]" : "bg-[#F3EEE3] text-[#0B3022]/70"
                    }`}>
                      {tierData.maxReferrals !== null 
                        ? `${tierData.minReferrals}–${tierData.maxReferrals} refs` 
                        : "40+ refs"}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className={`text-2xl font-bold font-mono ${isCurrent ? "text-[#F3EEE3]" : "text-[#0B3022]"}`}>
                      {tierData.feePct.toFixed(1)}%
                    </span>
                    <span className={`text-[11px] block ${isCurrent ? "text-[#F3EEE3]/65" : "text-[#0B3022]/60"}`}>
                      monthly platform fee
                    </span>
                  </div>
                </div>

                <div className={`pt-2 border-t text-[11px] font-bold ${
                  isCurrent ? "border-[#F3EEE3]/10 text-[#D4A843]" : "border-[#0B3022]/10 text-[#0B3022]"
                }`}>
                  {getTierDiscountPct(tierData.feePct) > 0 ? `${getTierDiscountPct(tierData.feePct)}% OFF standard fee` : "Standard baseline rate"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referred Friends Activity Ledger */}
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#0B3022]/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#0B3022]">Referred Friends Ledger</h3>
            <p className="text-xs text-[#0B3022]/60">
              Real-time audit checklist of friends who signed up with your code.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#0B3022] bg-[#F3EEE3] px-3 py-1 rounded-full">
            {summary.friends.length} {summary.friends.length === 1 ? "Friend" : "Friends"}
          </span>
        </div>

        {summary.friends.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3EEE3]/70 text-[#0B3022]/60 font-mono font-bold uppercase tracking-wider border-b border-[#0B3022]/10">
                  <th className="px-6 py-3.5">Friend</th>
                  <th className="px-6 py-3.5 text-center">BVN Verified</th>
                  <th className="px-6 py-3.5 text-center">Circle Joined</th>
                  <th className="px-6 py-3.5 text-center">1st Auto-Debit</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B3022]/10">
                {summary.friends.map((friend) => (
                  <tr key={friend.id} className="hover:bg-[#F3EEE3]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0B3022]">{friend.name}</div>
                      <div className="text-[11px] text-[#0B3022]/55">{friend.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {friend.hasBvnVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0B3022] inline-block" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#0B3022]/30 inline-block" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {friend.hasJoinedCircle ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0B3022] inline-block" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#0B3022]/30 inline-block" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {friend.hasAutoDebited ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0B3022] inline-block" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#0B3022]/30 inline-block" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {friend.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#0B3022] text-[#D4A843]">
                          <Check className="w-3 h-3" /> Qualified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#D4A843]/20 text-[#0B3022] border border-[#D4A843]/40">
                          <Clock className="w-3 h-3" /> In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#F3EEE3] rounded-2xl flex items-center justify-center mb-3 border border-[#0B3022]/10">
              <Users className="w-6 h-6 text-[#0B3022]" />
            </div>
            <h4 className="text-base font-bold text-[#0B3022] mb-1">No Referred Friends Yet</h4>
            <p className="text-xs text-[#0B3022]/65 max-w-sm mb-4">
              Share your invite link above. Once friends join, verify BVN, and make their first circle debit, they will appear here and your platform fee will decrease.
            </p>
            <button
              onClick={shareOnWhatsApp}
              className="px-5 py-2.5 bg-[#0B3022] text-[#F3EEE3] rounded-full text-xs font-bold hover:bg-[#124532] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        )}
      </div>

      {/* Redeem / Link a Friend's Referral Code */}
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6">
        <div className="max-w-xl">
          <h3 className="font-bold text-base text-[#0B3022] mb-1">Were you referred by someone?</h3>
          <p className="text-xs text-[#0B3022]/65 mb-4">
            If a friend or circle admin invited you and you haven&apos;t entered their code yet, enter it below to link your account.
          </p>

          <form onSubmit={handleRedeemCode} className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="e.g. AJOS-CHUKWUDI-21"
              disabled={isRedeeming}
              className="flex-1 bg-[#F3EEE3]/60 border border-[#0B3022]/15 rounded-full px-5 py-2.5 text-xs text-[#0B3022] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
            />
            <button
              type="submit"
              disabled={isRedeeming || !redeemCode.trim()}
              className="px-6 py-2.5 bg-[#0B3022] hover:bg-[#124532] disabled:opacity-50 text-[#F3EEE3] text-xs font-bold rounded-full transition-all cursor-pointer shrink-0"
            >
              {isRedeeming ? "Applying..." : "Apply Code"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
