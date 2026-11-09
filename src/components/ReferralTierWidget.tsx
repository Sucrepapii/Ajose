"use client";

import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  TrendingDown, 
  Sparkles, 
  Info
} from "lucide-react";
import { toast } from "sonner";

interface FriendItem {
  id: string;
  name: string;
  statusLabel: string;
  hasBvnVerified: boolean;
  hasJoinedCircle: boolean;
  hasAutoDebited: boolean;
  isActive: boolean;
}

interface ReferralSummary {
  referralCode: string;
  referralLink: string;
  tier: {
    name: string;
    feePct: number;
    discountLabel: string;
    badgeTitle: string;
    badgeClass: string;
    nextTierName: string | null;
    nextTierTarget: number | null;
  };
  activeCount: number;
  pendingCount: number;
  totalReferrals: number;
  referralsNeededForNext: number;
  progressPct: number;
  effectiveFeePct: number;
  friends: FriendItem[];
}

export function ReferralTierWidget() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReferralSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    fetch("/api/user/referrals")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.summary) {
          setData(res.summary);
        }
      })
      .catch((err) => console.error("Could not fetch referrals:", err))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    if (!data?.referralLink) return;
    const msg = `Hey! I'm running my savings circles on Àjọṣe — automated debits, scheduled turns, and instant bank payouts without chasing anyone. Join with my link: ${data.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 animate-pulse">
        <div className="h-4 bg-[#F3EEE3] rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-[#F3EEE3] rounded w-1/2 mb-3"></div>
        <div className="h-2 bg-[#F3EEE3] rounded w-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const { tier, activeCount, effectiveFeePct, referralsNeededForNext, progressPct } = data;

  return (
    <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 relative overflow-hidden">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold mb-1.5 uppercase tracking-wider bg-[#0B3022] text-[#F3EEE3]">
            <TrendingDown className="w-3 h-3 text-[#D4A843]" />
            <span>Slash Your Platform Fee</span>
          </div>
          <h3 className="text-xl font-bold text-[#0B3022] tracking-tight">
            Refer friends &amp;{" "}
            <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
              drop your %.
            </span>
          </h3>
        </div>

        {/* Current Fee Badge */}
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold font-mono text-[#0B3022] tracking-tight">
            {effectiveFeePct.toFixed(1)}%
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#0B3022]/55">Your Monthly Fee</span>
        </div>
      </div>

      {/* Active Referrals & Tier Status Card */}
      <div className="bg-[#F3EEE3]/70 border border-[#0B3022]/10 rounded-2xl p-4 mb-5 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#0B3022] text-[#D4A843]">
              {tier.badgeTitle}
            </span>
            <span className="text-xs text-[#0B3022]/75 font-medium">
              <strong className="text-[#0B3022] font-mono">{activeCount}</strong> Active {activeCount === 1 ? "Referral" : "Referrals"}
            </span>
          </div>

          <button
            onClick={() => setShowRules(!showRules)}
            className="text-[11px] text-[#0B3022] font-bold underline decoration-[#D4A843] flex items-center gap-0.5 cursor-pointer"
          >
            <Info className="w-3 h-3 text-[#D4A843]" />
            <span>What counts as active?</span>
          </button>
        </div>

        {/* Progress Bar towards Next Tier */}
        {tier.nextTierName && (
          <div className="space-y-1.5 mt-3">
            <div className="flex justify-between text-xs text-[#0B3022]/75">
              <span className="font-medium text-[11px]">
                {referralsNeededForNext} more active to reach <strong className="text-[#0B3022]">{tier.nextTierName} ({tier.nextTierName === "Advocate" ? "1.8%" : tier.nextTierName === "Champion" ? "1.5%" : tier.nextTierName === "Ambassador" ? "1.0%" : "0.5%"})</strong>
              </span>
              <span className="font-bold font-mono text-[#0B3022] text-[11px]">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-[#0B3022]/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#D4A843] transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Legend Tier Achieved */}
        {!tier.nextTierName && (
          <div className="mt-2 text-xs font-bold text-[#0B3022] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
            <span>Maximum discount reached! You enjoy our lowest rate (0.5%).</span>
          </div>
        )}
      </div>

      {/* Anti-Gaming Rules Breakdown Modal/Drawer */}
      {showRules && (
        <div className="bg-[#0B3022] text-[#F3EEE3] rounded-2xl p-4 mb-5 text-xs space-y-2 border border-[#0B3022] relative z-10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold font-mono text-[#D4A843] uppercase tracking-wider text-[11px]">
              Anti-Gaming / Quality Rule
            </span>
            <button 
              onClick={() => setShowRules(false)}
              className="text-[#F3EEE3]/60 hover:text-[#F3EEE3] text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-[#F3EEE3]/75 leading-relaxed text-[11px]">
            To prevent bot gaming and keep circles safe, a referral officially counts as <strong>Active</strong> when your friend:
          </p>
          <ul className="space-y-1.5 text-[#F3EEE3]/90 text-[11px] pl-1">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
              <span>Signs up with verified email &amp; phone</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
              <span>Completes bank BVN verification</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
              <span>Joins their first savings circle</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
              <span>Completes their first circle auto-debit</span>
            </li>
          </ul>
        </div>
      )}

      {/* Share Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-[#0B3022]/15 hover:border-[#D4A843] bg-white text-[#0B3022] font-bold text-xs transition-all cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#D4A843]" /> : <Copy className="w-3.5 h-3.5 text-[#0B3022]/60" />}
          <span>{copied ? "Link Copied!" : "Copy Invite Link"}</span>
        </button>

        <button
          onClick={shareOnWhatsApp}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-bold text-xs transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-[#D4A843]" />
          <span>Share on WhatsApp</span>
        </button>
      </div>

      {/* Tier Overview Pill Strip */}
      <div className="mt-4 pt-3 border-t border-[#0B3022]/10 flex items-center justify-between text-[11px] font-mono text-[#0B3022]/60 overflow-x-auto gap-2 scrollbar-none">
        <span>Standard: 2.0%</span>
        <span>•</span>
        <span className={activeCount >= 5 && activeCount < 10 ? "font-bold text-[#0B3022]" : ""}>Advocate (5+): 1.8%</span>
        <span>•</span>
        <span className={activeCount >= 10 && activeCount < 20 ? "font-bold text-[#0B3022]" : ""}>Champion (10+): 1.5%</span>
        <span>•</span>
        <span className={activeCount >= 20 && activeCount < 40 ? "font-bold text-[#0B3022]" : ""}>Ambassador (20+): 1.0%</span>
        <span>•</span>
        <span className={activeCount >= 40 ? "font-bold text-[#0B3022]" : ""}>Legend (40+): 0.5%</span>
      </div>
    </div>
  );
}
