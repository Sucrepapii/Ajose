"use client";

import { useState } from "react";
import { 
  Calculator, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Award,
  ShieldCheck,
  TrendingUp
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
  showTitle = true
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
    if (count > 10) return { name: "Power Organizer Tier", fee: "1.0% platform fee", discount: "50% Platform Discount", badge: "bg-purple-100 text-purple-900 border-purple-300" };
    if (count >= 6) return { name: "Pro Organizer Tier", fee: "1.5% platform fee", discount: "25% Platform Discount", badge: "bg-blue-100 text-blue-900 border-blue-300" };
    return { name: "Standard Organizer Tier", fee: "2.0% platform fee", discount: "Standard Rate", badge: "bg-emerald-100 text-emerald-900 border-emerald-300" };
  };

  const currentTier = getTier(circlesCount);

  return (
    <div className="w-full bg-[#0B3022] rounded-3xl border-2 border-[#C5A059]/40 shadow-2xl p-6 sm:p-10 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-wider mb-4">
            <Coins className="w-3.5 h-3.5 text-[#C5A059]" />
            B2B Organizer Monetization
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-serif mb-4">
            Turn Your Community into <span className="text-[#C5A059]">Sustainable Revenue</span>
          </h2>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium">
            Whether you run an office thrift, church welfare pool, alumni circle, or market cooperative, Àjọṣe handles the automated collections while you earn your custom organizer commission.
          </p>
        </div>
      )}

      {/* Main Grid: Interactive Controls + Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left 7 Columns: Interactive Sliders */}
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          
          {/* Slider 1: Circles */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Active Circles Managed</span>
              </label>
              <span className="text-base sm:text-lg font-black text-[#C5A059] px-3 py-1 rounded-xl bg-white/10 border border-white/15">
                {circlesCount} {circlesCount === 1 ? "Circle" : "Circles"}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={circlesCount}
              onChange={(e) => setCirclesCount(parseInt(e.target.value))}
              className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
            <div className="flex justify-between text-[11px] text-white/50 mt-1.5 font-medium">
              <span>1 Circle</span>
              <span>6 Circles (Pro)</span>
              <span>15 Circles (Power)</span>
            </div>
          </div>

          {/* Slider 2: Average Pool Size */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Average Pool Size per Circle
              </label>
              <span className="text-base sm:text-lg font-black text-[#C5A059] px-3 py-1 rounded-xl bg-white/10 border border-white/15">
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
              className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
            <div className="flex justify-between text-[11px] text-white/50 mt-1.5 font-medium">
              <span>₦200k (Friends)</span>
              <span>₦2.5M (Business)</span>
              <span>₦5.0M (High Net Worth)</span>
            </div>
          </div>

          {/* Slider 3: Commission Percentage */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Your Organizer Commission Cut
              </label>
              <span className="text-base sm:text-lg font-black text-[#0B3022] px-3.5 py-1 rounded-xl bg-[#C5A059]">
                {commissionPct}%
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-2">
              {[2, 3.5, 5, 7.5, 10].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setCommissionPct(pct)}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    commissionPct === pct
                      ? "bg-[#C5A059] text-[#0B3022] shadow-md scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white/90"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <p className="text-[11px] text-white/60">
              You choose your rate (0% to 15%) upon circle creation. Deducted automatically upon payout.
            </p>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>Direct Bank Settlement via Mono</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>Zero Cash Handling / Safe Escrow</span>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Result Card & CTA */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#124230] to-[#0D3526] border-2 border-[#C5A059] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#C5A059]/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/50 text-[#C5A059] text-xs font-bold uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5" />
              {currentTier.name}
            </div>

            <span className="text-xs uppercase tracking-wider text-white/70 font-semibold block mb-1">
              Estimated Monthly Organizer Earnings
            </span>

            <div className="text-4xl sm:text-5xl font-black text-[#C5A059] tracking-tight my-2">
              ₦{monthlyCommission.toLocaleString()}
              <span className="text-xs sm:text-sm font-semibold text-white/70 block mt-1">/ cycle volume</span>
            </div>

            <p className="text-xs font-bold text-emerald-300 mb-6">
              ~₦{annualCommission.toLocaleString()} projected annual run-rate
            </p>

            <div className="bg-white/10 rounded-2xl p-4 text-xs space-y-2 mb-6 text-left">
              <div className="flex justify-between text-white/80">
                <span>Total Pool Volume:</span>
                <strong className="text-white font-mono">₦{totalVolume.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Organizer Incentive Tier:</span>
                <strong className="text-[#C5A059]">{currentTier.discount}</strong>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Collections:</span>
                <strong className="text-emerald-300">100% Automated Direct Debit</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/signup"
              className="w-full py-4 px-6 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-black text-sm sm:text-base rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 group"
            >
              <span>Start Your First Circle Free</span>
              <ArrowRight className="w-4 h-4 text-[#0B3022] group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="text-[11px] text-white/60">
              No subscription fee &bull; Free to create &bull; Zero risk non-custodial
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
