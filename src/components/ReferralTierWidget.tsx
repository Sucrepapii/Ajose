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
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-100 rounded w-1/2 mb-3"></div>
        <div className="h-2 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const { tier, activeCount, effectiveFeePct, referralsNeededForNext, progressPct } = data;

  return (
    <div className="bg-white border border-[#C5A059]/30 shadow-md rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-lg">
      {/* Background ambient gold gradient */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-1.5 uppercase tracking-wider bg-[#0B3022]/10 text-[#0B3022] border-[#0B3022]/20">
            <TrendingDown className="w-3 h-3 text-[#C5A059]" />
            <span>Slash Your Platform Fee</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0B3022] font-serif tracking-tight">
            Refer Friends &amp; Drop Your %
          </h3>
        </div>

        {/* Current Fee Badge */}
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-[#0B3022] tracking-tight">
            {effectiveFeePct.toFixed(1)}%
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Your Monthly Fee</span>
        </div>
      </div>

      {/* Active Referrals & Tier Status Card */}
      <div className="bg-[#FAF8F5] border border-[#EBE6DE] rounded-xl p-4 mb-5 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${tier.badgeClass}`}>
              {tier.badgeTitle}
            </span>
            <span className="text-xs text-gray-600 font-medium">
              <strong className="text-[#0B3022]">{activeCount}</strong> Active {activeCount === 1 ? "Referral" : "Referrals"}
            </span>
          </div>

          <button
            onClick={() => setShowRules(!showRules)}
            className="text-[11px] text-[#C5A059] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Info className="w-3 h-3" />
            <span>What counts as active?</span>
          </button>
        </div>

        {/* Progress Bar towards Next Tier */}
        {tier.nextTierName && (
          <div className="space-y-1.5 mt-3">
            <div className="flex justify-between text-xs text-gray-600">
              <span className="font-medium text-[11px]">
                {referralsNeededForNext} more active to reach <strong className="text-[#0B3022]">{tier.nextTierName} ({tier.nextTierName === "Advocate" ? "1.8%" : tier.nextTierName === "Champion" ? "1.5%" : tier.nextTierName === "Ambassador" ? "1.0%" : "0.5%"})</strong>
              </span>
              <span className="font-bold text-[#0B3022] text-[11px]">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#C5A059] to-[#0B3022] transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Legend Tier Achieved */}
        {!tier.nextTierName && (
          <div className="mt-2 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Maximum discount reached! You enjoy our lowest rate (0.5%).</span>
          </div>
        )}
      </div>

      {/* Anti-Gaming Rules Breakdown Modal/Drawer */}
      {showRules && (
        <div className="bg-[#0B3022] text-white rounded-xl p-4 mb-5 text-xs space-y-2 border border-[#C5A059]/40 relative z-10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#C5A059] uppercase tracking-wider text-[11px]">
              Anti-Gaming / Quality Rule
            </span>
            <button 
              onClick={() => setShowRules(false)}
              className="text-gray-400 hover:text-white text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 leading-relaxed text-[11px]">
            To prevent bot gaming and keep circles safe, a referral officially counts as <strong>Active</strong> when your friend:
          </p>
          <ul className="space-y-1.5 text-gray-200 text-[11px] pl-1">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Signs up with verified email &amp; phone</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Completes bank BVN verification</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Joins their first savings circle</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Completes their first circle auto-debit</span>
            </li>
          </ul>
        </div>
      )}

      {/* Share Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-300 hover:border-[#C5A059] bg-white text-[#0B3022] font-bold text-xs transition-all shadow-sm cursor-pointer hover:bg-gray-50 active:scale-[0.98]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
          <span>{copied ? "Link Copied!" : "Copy Invite Link"}</span>
        </button>

        <button
          onClick={shareOnWhatsApp}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B3022] hover:bg-[#134934] text-white font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-[0.98]"
        >
          <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Share on WhatsApp</span>
        </button>
      </div>

      {/* Tier Overview Pill Strip */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 overflow-x-auto gap-2 scrollbar-none">
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
