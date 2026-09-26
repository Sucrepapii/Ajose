"use client";

import { useState } from "react";
import { 
  Calculator, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Award
} from "lucide-react";
import Link from "next/link";

interface OrganizerEarningsCalculatorProps {
  currentAdminCircles?: number;
  currentProjectedEarnings?: number;
}

export function OrganizerEarningsCalculator({
  currentAdminCircles = 0,
  currentProjectedEarnings = 0
}: OrganizerEarningsCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [circlesCount, setCirclesCount] = useState<number>(Math.max(1, currentAdminCircles || 2));
  const [avgPoolSize, setAvgPoolSize] = useState<number>(1000000);
  const [commissionPct, setCommissionPct] = useState<number>(5);

  // Calculations
  const totalVolume = circlesCount * avgPoolSize;
  const monthlyCommission = Math.round((commissionPct / 100) * totalVolume);
  const annualCommission = monthlyCommission * 12;

  // Organizer Tier
  const getTier = (count: number) => {
    if (count > 10) return { name: "Power Organizer", fee: "1.0% platform fee", discount: "50% Fee Discount", badge: "bg-purple-100 text-purple-800 border-purple-300" };
    if (count >= 6) return { name: "Pro Organizer", fee: "1.5% platform fee", discount: "25% Fee Discount", badge: "bg-blue-100 text-blue-800 border-blue-300" };
    return { name: "Standard Organizer", fee: "2.0% platform fee", discount: "Standard", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  const currentTier = getTier(circlesCount);

  return (
    <div className="bg-gradient-to-br from-[#0B3022] to-[#124230] border border-[#C5A059]/40 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Column: Current Status & Hook */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#C5A059]" />
            Organizer Engine &bull; {currentTier.name}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
            Monetize Your Thrift Network with Àjọṣe
          </h3>

          <p className="text-sm text-white/80 leading-relaxed font-medium">
            Run your church, market, office, or family circles with <strong>automated open-banking sweeps</strong>. Earn a transparent organizer commission per circle with zero manual cash chasing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-white/90">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
              <span>Direct Bank-to-Bank (Non-Custodial)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
              <span>Automated Mono Direct Debits</span>
            </div>
          </div>
        </div>

        {/* Right Column: Earnings Summary & Simulator Trigger */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 shrink-0 flex flex-col justify-between gap-4 md:min-w-[280px]">
          <div>
            <span className="text-xs uppercase tracking-wider text-white/70 font-semibold block mb-1">
              Active Circle Commission
            </span>
            <div className="text-3xl font-black text-[#C5A059] tracking-tight">
              ₦{currentProjectedEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-white/60 mt-1">
              Managing {currentAdminCircles} circle{currentAdminCircles === 1 ? "" : "s"} currently
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full py-2.5 px-4 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulate Earnings</span>
            </button>

            <Link
              href="/dashboard/groups/create"
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <span>Create New Circle</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C5A059]" />
            </Link>
          </div>
        </div>

      </div>

      {/* Interactive Simulator Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white text-gray-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0B3022] text-white p-6 relative overflow-hidden shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-[#C5A059] text-[#0B3022] px-2.5 py-0.5 rounded-full">
                  Organizer Revenue Simulator
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-2xl font-black text-white font-serif">
                How Much Can You Earn?
              </h3>
              <p className="text-xs text-white/80 mt-1 font-medium">
                Adjust the sliders below to calculate your projected income as an Àjọṣe organizer.
              </p>
            </div>

            {/* Modal Body: Sliders */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Slider 1: Circles Count */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#0B3022] uppercase tracking-wider">
                    Number of Circles Managed
                  </label>
                  <span className="text-base font-black text-[#0B3022] px-3 py-0.5 rounded-lg bg-gray-100">
                    {circlesCount} {circlesCount === 1 ? "Circle" : "Circles"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={circlesCount}
                  onChange={(e) => setCirclesCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0B3022]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                  <span>1 Circle</span>
                  <span>5 Circles (Pro Tier)</span>
                  <span>15+ (Power Tier)</span>
                </div>
              </div>

              {/* Slider 2: Average Pool Size */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#0B3022] uppercase tracking-wider">
                    Average Pool Size per Circle
                  </label>
                  <span className="text-base font-black text-[#0B3022] px-3 py-0.5 rounded-lg bg-gray-100">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0B3022]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                  <span>₦200,000</span>
                  <span>₦2,500,000</span>
                  <span>₦5,000,000</span>
                </div>
              </div>

              {/* Slider 3: Commission Percentage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#0B3022] uppercase tracking-wider">
                    Your Commission Rate
                  </label>
                  <span className="text-base font-black text-[#C5A059] px-3 py-0.5 rounded-lg bg-[#0B3022]">
                    {commissionPct}%
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  {[2, 3.5, 5, 7.5, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCommissionPct(pct)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        commissionPct === pct 
                          ? "bg-[#0B3022] text-[#C5A059] shadow-sm" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Card */}
              <div className="bg-gradient-to-br from-[#0B3022] to-[#124230] rounded-2xl p-5 text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs text-white/70 font-medium">Estimated Monthly Earnings</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${currentTier.badge}`}>
                    {currentTier.name}
                  </span>
                </div>

                <div className="text-center py-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#C5A059] tracking-tight">
                    ₦{monthlyCommission.toLocaleString()}
                    <span className="text-xs text-white/70 font-normal ml-1.5">/ cycle volume</span>
                  </div>
                  <p className="text-xs text-emerald-300 font-medium mt-1">
                    ~₦{annualCommission.toLocaleString()} projected annual revenue
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-3 text-[11px] text-white/80 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Managed Pool Volume:</span>
                    <strong className="text-white">₦{totalVolume.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Volume Discount:</span>
                    <strong className="text-[#C5A059]">{currentTier.discount}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                Close Simulator
              </button>
              <Link
                href="/dashboard/groups/create"
                onClick={() => setIsOpen(false)}
                className="py-2.5 px-5 bg-[#0B3022] hover:bg-[#154634] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Launch New Circle</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
