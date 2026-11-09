"use client";

import { useState } from "react";
import {
  Coins,
  CheckCircle2,
  ArrowRight,
  Award,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface InteractiveRevenueCalculatorProps {
  initialCircles?: number;
  initialPool?: number;
  initialCommission?: number;
  showTitle?: boolean;
}

export function InteractiveRevenueCalculator({
  initialCircles = 3,
  initialPool = 1000000,
  initialCommission = 5,
  showTitle = true,
}: InteractiveRevenueCalculatorProps) {
  const [circlesCount, setCirclesCount] = useState<number>(initialCircles);
  const [avgPoolSize, setAvgPoolSize] = useState<number>(initialPool);
  const [commissionPct, setCommissionPct] = useState<number>(initialCommission);

  // Calculations
  const totalVolume = circlesCount * avgPoolSize;
  const monthlyCommission = Math.round((commissionPct / 100) * totalVolume);
  const annualCommission = monthlyCommission * 12;

  // Tier info
  const getTier = (count: number) => {
    if (count > 10)
      return {
        name: "Power Organizer Tier",
        fee: "1.0% platform fee",
        discount: "50% Platform Discount",
      };
    if (count >= 6)
      return {
        name: "Pro Organizer Tier",
        fee: "1.5% platform fee",
        discount: "25% Platform Discount",
      };
    return {
      name: "Standard Organizer Tier",
      fee: "2.0% platform fee",
      discount: "Standard Rate",
    };
  };

  const currentTier = getTier(circlesCount);

  return (
    <div className="w-full bg-[#0B3022] rounded-3xl border border-[#111613]/15 shadow-xl p-6 sm:p-10 text-[#F3EEE3] relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4A843]/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Header */}
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[#D4A843] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <Coins className="w-3.5 h-3.5 text-[#D4A843]" />
            <span>Organizer Monetization</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.025em] text-[#F3EEE3] mb-4 leading-[1.1]">
            Turn your community into{" "}
            <span className="font-editorial italic font-normal text-white">
              sustainable revenue.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#F3EEE3]/75 leading-relaxed">
            Whether you run an office thrift, church welfare pool, alumni circle, or market cooperative, Àjọṣe handles the automated collections while you earn your custom organizer commission.
          </p>
        </div>
      )}

      {/* Main Grid: Interactive Controls + Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Left 7 Columns: Interactive Sliders */}
        <div className="lg:col-span-7 bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {/* Slider 1: Circles */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-mono font-bold text-[#F3EEE3]/85 uppercase tracking-wider">
                Active Circles Managed
              </label>
              <span className="text-sm sm:text-base font-bold font-mono text-[#D4A843] px-3 py-1 rounded-full bg-white/[0.08] border border-white/10">
                {circlesCount} {circlesCount === 1 ? "Circle" : "Circles"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={circlesCount}
              onChange={(e) => setCirclesCount(parseInt(e.target.value))}
              className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#F3EEE3]/50 mt-1.5">
              <span>1 Circle</span>
              <span>6 Circles (Pro)</span>
              <span>15 Circles (Power)</span>
            </div>
          </div>

          {/* Slider 2: Average Pool Size */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-mono font-bold text-[#F3EEE3]/85 uppercase tracking-wider">
                Average Pool Size per Circle
              </label>
              <span className="text-sm sm:text-base font-bold font-mono text-[#D4A843] px-3 py-1 rounded-full bg-white/[0.08] border border-white/10">
                ₦{avgPoolSize.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="200000"
              max="5000000"
              step="100000"
              value={avgPoolSize}
              onChange={(e) => setAvgPoolSize(parseInt(e.target.value))}
              className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#F3EEE3]/50 mt-1.5">
              <span>₦200k (Friends)</span>
              <span>₦2.5M (Business)</span>
              <span>₦5.0M (Capital Pool)</span>
            </div>
          </div>

          {/* Slider 3: Commission Percentage */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-mono font-bold text-[#F3EEE3]/85 uppercase tracking-wider">
                Your Organizer Commission Cut
              </label>
              <span className="text-sm sm:text-base font-bold font-mono text-[#0B3022] px-3 py-0.5 rounded-full bg-[#D4A843]">
                {commissionPct}%
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-2">
              {[2, 3.5, 5, 7.5, 10].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setCommissionPct(pct)}
                  className={`py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    commissionPct === pct
                      ? "bg-[#D4A843] text-[#0B3022] shadow-sm"
                      : "bg-white/[0.06] hover:bg-white/[0.12] text-[#F3EEE3]/85 border border-white/10"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#F3EEE3]/60">
              You choose your rate (0% to 15%) upon circle creation. Deducted automatically upon payout.
            </p>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#F3EEE3]/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4A843] shrink-0" />
              <span>Direct Bank Settlement via Mono</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4A843] shrink-0" />
              <span>Zero Cash Handling / Automated Payouts</span>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Warm Cream Result Card & Pill CTA */}
        <div className="lg:col-span-5 bg-[#F3EEE3] text-[#111613] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between text-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B3022] text-[#D4A843] text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5" />
              <span>{currentTier.name}</span>
            </div>

            <span className="text-[11px] font-mono uppercase tracking-wider text-[#111613]/60 font-semibold block mb-1">
              Illustrative Monthly Commission
            </span>

            <div className="text-4xl sm:text-5xl font-bold font-mono text-[#0B3022] tracking-tight my-2">
              ₦{monthlyCommission.toLocaleString()}
              <span className="text-xs font-sans font-medium text-[#111613]/60 block mt-1">
                per cycle volume
              </span>
            </div>

            <p className="text-xs font-mono font-bold text-[#0B3022] mb-6">
              ~₦{annualCommission.toLocaleString()} illustrative annual estimate*
            </p>

            <div className="bg-[#EAE3D2] rounded-2xl p-4 text-xs space-y-2.5 mb-6 text-left border border-[#111613]/10">
              <div className="flex justify-between text-[#111613]/75">
                <span>Total Pool Volume:</span>
                <strong className="text-[#111613] font-mono">
                  ₦{totalVolume.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between text-[#111613]/75">
                <span>Organizer Incentive Tier:</span>
                <strong className="text-[#0B3022] font-mono">
                  {currentTier.discount}
                </strong>
              </div>
              <div className="flex justify-between text-[#111613]/75">
                <span>Collections:</span>
                <strong className="text-[#0B3022]">100% Automated Debit</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/signup"
              className="w-full py-4 px-6 bg-[#D4A843] hover:bg-[#e0b654] text-[#0B3022] font-bold text-sm sm:text-base rounded-full transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Start Your First Circle Free</span>
              <ArrowRight className="w-4 h-4 text-[#0B3022] group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-[11px] font-mono text-[#111613]/60">
              No subscription fee &bull; Free to create &bull; Automated settlement
            </p>
            <p className="text-[10px] text-[#111613]/50 italic leading-tight text-center pt-1">
              *Illustrative simulation only, not a guaranteed return or income claim. Actual earnings depend on circle size, member counts, and the commission percentage set by the organizer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
