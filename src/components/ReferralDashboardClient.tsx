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
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Award,
  Zap,
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

  const shareOnTwitter = () => {
    if (!summary?.referralLink) return;
    const msg = `Turn by turn, no wahala! I save with automated Ajo circles on @ajoseapp. Use my invite code ${summary.referralCode} or sign up here: ${summary.referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`, "_blank");
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

      // Refresh referral summary
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
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0B3022]/5 rounded-2xl border border-[#0B3022]/10">
            <Gift className="h-7 w-7 text-[#0B3022]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-1 uppercase tracking-wider bg-[#0B3022]/10 text-[#0B3022] border-[#0B3022]/20">
              <TrendingDown className="w-3 h-3 text-[#C5A059]" />
              <span>Platform Fee Slash Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B3022] font-serif tracking-tight">
              Refer &amp; Earn
            </h1>
            <p className="text-[#1F2937]/70 text-sm font-medium">
              Invite friends to Àjọṣe and slash your monthly platform fee from 2.0% down to 0.5%.
            </p>
          </div>
        </div>

        {/* Current Fee Highlight Badge */}
        <div className="bg-gradient-to-br from-[#0B3022] to-[#082319] text-white p-4 rounded-2xl shadow-md border border-[#C5A059]/30 flex items-center justify-between md:justify-end gap-5 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block">
              Your Monthly Rate
            </span>
            <span className="text-3xl font-black text-white tracking-tight">
              {summary.effectiveFeePct.toFixed(1)}%
            </span>
          </div>
          <div className="border-l border-white/10 pl-4 text-right">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${summary.tier.badgeClass}`}>
              {summary.tier.badgeTitle}
            </span>
            <p className="text-[11px] text-gray-300 font-medium mt-1">
              {currentDiscountPct > 0 ? `${currentDiscountPct}% Fee Discount` : "Standard Tier"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Friends */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-5 hover:border-[#C5A059]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Active Friends</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B3022]">{summary.activeCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Qualified &amp; verified</p>
        </div>

        {/* Pending Referrals */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-5 hover:border-[#C5A059]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Pending Friends</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B3022]">{summary.pendingCount}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Awaiting 1st debit / BVN</p>
        </div>

        {/* Total Invited */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-5 hover:border-[#C5A059]/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Total Invited</span>
            <div className="w-8 h-8 rounded-lg bg-[#0B3022]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#0B3022]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B3022]">{summary.totalReferrals}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Total link signups</p>
        </div>

        {/* Fee Saved / Discount */}
        <div className="bg-white border border-[#C5A059]/30 shadow-xs rounded-2xl p-5 hover:border-[#C5A059] transition-colors relative overflow-hidden">
          <div className="absolute right-0 top-0 w-20 h-20 bg-[#C5A059]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Fee Discount</span>
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B3022]">
            {currentDiscountPct}%
          </div>
          <p className="text-[11px] text-[#A48243] font-bold mt-1">Off standard 2.0% fee</p>
        </div>
      </div>

      {/* Progress to Next Tier Card */}
      <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="font-bold text-base text-[#0B3022] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C5A059]" />
              <span>Next Tier Milestones</span>
            </h3>
            {summary.tier.nextTierName ? (
              <p className="text-xs text-[#1F2937]/70 font-medium mt-0.5">
                Need <strong className="text-[#0B3022] font-bold">{summary.referralsNeededForNext}</strong> more active {summary.referralsNeededForNext === 1 ? "friend" : "friends"} to unlock{" "}
                <strong className="text-[#0B3022] font-bold">{summary.tier.nextTierName}</strong> tier (
                {REFERRAL_TIERS[summary.tier.nextTierName as ReferralTierName]?.feePct.toFixed(1)}%).
              </p>
            ) : (
              <p className="text-xs text-emerald-800 font-bold mt-0.5">
                🎉 Legend Tier Unlocked! You are at the highest discount level (0.5% fee).
              </p>
            )}
          </div>

          <button
            onClick={() => setShowRules(!showRules)}
            className="text-xs text-[#C5A059] hover:text-[#997839] font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <Info className="w-3.5 h-3.5" />
            <span>How friends qualify</span>
          </button>
        </div>

        {/* Progress Bar */}
        {summary.tier.nextTierName && (
          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{summary.activeCount} active friends</span>
              <span className="font-bold text-[#0B3022]">{summary.progressPct}% to {summary.tier.nextTierName}</span>
            </div>
            <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden p-0.5 border border-gray-300/40">
              <div 
                className="h-full bg-gradient-to-r from-[#C5A059] to-[#0B3022] rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.max(summary.progressPct, 4)}%` }}
              />
            </div>
          </div>
        )}

        {/* Quality Guidelines Modal / Expandable */}
        {showRules && (
          <div className="mt-5 p-4 rounded-xl bg-[#0B3022] text-white border border-[#C5A059]/40 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#C5A059] uppercase tracking-wider text-[11px]">
                4 Rules for an Active / Qualified Referral
              </span>
              <button 
                onClick={() => setShowRules(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              To keep circles safe, secure, and prevent bot gaming, referrals qualify once your friend completes four milestones:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1. Signs up with verified email/phone</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>2. Verifies BVN via Bank mandate</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>3. Joins or starts an active circle</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>4. Completes first successful auto-debit</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Kit Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-bold text-lg text-[#0B3022]">Your Share Kit</h3>
          <p className="text-xs text-[#1F2937]/70 font-medium">
            Share your unique referral code or link with friends, family, or colleagues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Referral Code Box */}
          <div className="bg-[#FAF8F5] border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Your Referral Code
                </span>
                {!isEditingCode && (
                  <button
                    onClick={() => {
                      setCustomCodeInput(summary.referralCode);
                      setIsEditingCode(true);
                    }}
                    className="text-[11px] text-[#C5A059] hover:text-[#997839] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
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
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-[#0B3022] font-mono font-bold uppercase placeholder:font-sans placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSavingCode || !customCodeInput.trim()}
                      className="px-3 py-1 bg-[#0B3022] text-white text-xs font-bold rounded-lg hover:bg-[#134934] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingCode ? "Saving..." : "Save Code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      disabled={isSavingCode}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Use your name or handle (3–25 letters/numbers).
                  </p>
                </form>
              ) : (
                <div className="text-xl font-mono font-black text-[#0B3022] tracking-wider select-all">
                  {summary.referralCode}
                </div>
              )}
            </div>

            {!isEditingCode && (
              <button
                onClick={copyCode}
                className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-300 hover:border-[#C5A059] bg-white text-[#0B3022] font-bold text-xs transition-all shadow-xs cursor-pointer hover:bg-gray-50"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copiedCode ? "Code Copied!" : "Copy Code"}</span>
              </button>
            )}
          </div>

          {/* Referral Link Box */}
          <div className="bg-[#FAF8F5] border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Your Invite Link
              </span>
              <p className="text-xs text-[#0B3022] font-medium truncate select-all bg-white p-2 rounded border border-gray-200">
                {summary.referralLink}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-300 hover:border-[#C5A059] bg-white text-[#0B3022] font-bold text-xs transition-all shadow-xs cursor-pointer hover:bg-gray-50"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0B3022] hover:bg-[#134934] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
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
          <span className="text-xs text-gray-500 font-medium">Automatic tiered fee reductions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {tierOrder.map((name) => {
            const tierData = REFERRAL_TIERS[name];
            const isCurrent = summary.tier.name === name;

            return (
              <div 
                key={name}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative ${
                  isCurrent 
                    ? "bg-[#0B3022] text-white border-[#C5A059] shadow-lg ring-2 ring-[#C5A059]/40" 
                    : "bg-white text-[#1F2937] border-gray-200 shadow-xs hover:border-gray-300"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#C5A059] text-[#0B3022] font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Current Tier
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${isCurrent ? "text-[#C5A059]" : "text-[#0B3022]"}`}>
                      {name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isCurrent ? "bg-white/10 text-gray-200" : "bg-gray-100 text-gray-600"
                    }`}>
                      {tierData.maxReferrals !== null 
                        ? `${tierData.minReferrals}–${tierData.maxReferrals} refs` 
                        : "40+ refs"}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className={`text-2xl font-black ${isCurrent ? "text-white" : "text-[#0B3022]"}`}>
                      {tierData.feePct.toFixed(1)}%
                    </span>
                    <span className={`text-[11px] block font-medium ${isCurrent ? "text-gray-300" : "text-gray-500"}`}>
                      monthly platform fee
                    </span>
                  </div>
                </div>

                <div className={`pt-2 border-t text-[11px] font-bold ${
                  isCurrent ? "border-white/10 text-[#C5A059]" : "border-gray-100 text-emerald-700"
                }`}>
                  {getTierDiscountPct(tierData.feePct) > 0 ? `${getTierDiscountPct(tierData.feePct)}% OFF standard fee` : "Standard baseline rate"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referred Friends Activity Ledger */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#0B3022]">Referred Friends Ledger</h3>
            <p className="text-xs text-gray-500 font-medium">
              Real-time audit checklist of friends who signed up with your code.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {summary.friends.length} {summary.friends.length === 1 ? "Friend" : "Friends"}
          </span>
        </div>

        {summary.friends.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-3.5">Friend</th>
                  <th className="px-6 py-3.5 text-center">BVN Verified</th>
                  <th className="px-6 py-3.5 text-center">Circle Joined</th>
                  <th className="px-6 py-3.5 text-center">1st Auto-Debit</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary.friends.map((friend) => (
                  <tr key={friend.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0B3022]">{friend.name}</div>
                      <div className="text-[11px] text-gray-400 font-medium">{friend.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {friend.hasBvnVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-300 inline-block" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {friend.hasJoinedCircle ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-300 inline-block" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {friend.hasAutoDebited ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-300 inline-block" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {friend.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> Qualified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
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
            <div className="w-12 h-12 bg-[#0B3022]/5 rounded-full flex items-center justify-center mb-3 border border-[#0B3022]/10">
              <Users className="w-6 h-6 text-[#0B3022]/40" />
            </div>
            <h4 className="text-base font-bold text-[#0B3022] mb-1">No Referred Friends Yet</h4>
            <p className="text-xs text-[#1F2937]/70 font-medium max-w-sm mb-4">
              Share your invite link above. Once friends join, verify BVN, and make their first circle debit, they will appear here and your platform fee will decrease.
            </p>
            <button
              onClick={shareOnWhatsApp}
              className="px-4 py-2 bg-[#0B3022] text-white rounded-xl text-xs font-bold hover:bg-[#134934] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        )}
      </div>

      {/* Redeem / Link a Friend's Referral Code */}
      <div className="bg-[#FAF8F5] border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="max-w-xl">
          <h3 className="font-bold text-base text-[#0B3022] mb-1">Were you referred by someone?</h3>
          <p className="text-xs text-[#1F2937]/70 font-medium mb-4">
            If a friend or circle admin invited you and you haven&apos;t entered their code yet, enter it below to link your account.
          </p>

          <form onSubmit={handleRedeemCode} className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="e.g. AJOS-CHUKWUDI-21"
              disabled={isRedeeming}
              className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-[#0B3022] font-mono uppercase placeholder:font-sans placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]"
            />
            <button
              type="submit"
              disabled={isRedeeming || !redeemCode.trim()}
              className="px-5 py-2.5 bg-[#0B3022] hover:bg-[#134934] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              {isRedeeming ? "Applying..." : "Apply Code"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
