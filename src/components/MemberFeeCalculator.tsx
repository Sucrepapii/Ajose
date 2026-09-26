"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

type Schedule = "DAILY" | "WEEKLY" | "MONTHLY";

export function MemberFeeCalculator() {
  const [schedule, setSchedule] = useState<Schedule>("MONTHLY");
  const [contribution, setContribution] = useState<number>(50000);
  const [members, setMembers] = useState<number>(10);

  // Calculations
  const totalPot = contribution * members;
  
  let fee = 0;
  let feeDescription = "";
  
  if (schedule === "MONTHLY") {
    // 2% standard capped at 10,000
    fee = Math.min(totalPot * 0.02, 10000);
    feeDescription = totalPot * 0.02 > 10000 ? "2% Capped at ₦10,000 Max" : "2% Open-Banking Protection Fee";
  } else if (schedule === "WEEKLY") {
    fee = 300;
    feeDescription = "₦300 Open-Banking Sweep Fee";
  } else {
    fee = 100;
    feeDescription = "₦100 Micro-Thrift Processing Fee";
  }

  const netPayout = Math.max(0, totalPot - fee);
  const effectivePercentage = totalPot > 0 ? ((fee / totalPot) * 100).toFixed(2) : "0";

  return (
    <div className="bg-[#0B3022] rounded-3xl p-6 sm:p-10 border-2 border-[#C5A059]/40 text-white shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Payout Simulator</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-serif text-white">
            Calculate Your Pot &amp; Protection Fee
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            See exactly how much arrives in your bank account when it&rsquo;s your turn to collect.
          </p>
        </div>

        {/* Schedule Selector */}
        <div className="flex items-center bg-black/30 p-1.5 rounded-2xl border border-white/10 shrink-0">
          {(["DAILY", "WEEKLY", "MONTHLY"] as Schedule[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSchedule(s);
                if (s === "DAILY" && contribution > 50000) setContribution(5000);
                if (s === "WEEKLY" && contribution > 150000) setContribution(25000);
                if (s === "MONTHLY" && contribution < 20000) setContribution(50000);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                schedule === s
                  ? "bg-[#C5A059] text-[#0B3022] shadow-md scale-102"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {s === "DAILY" ? "Daily" : s === "WEEKLY" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contribution Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Contribution Per Member ({schedule.toLowerCase()})
              </label>
              <span className="font-mono text-xl sm:text-2xl font-black text-[#C5A059]">
                ₦{contribution.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={schedule === "DAILY" ? 1000 : schedule === "WEEKLY" ? 5000 : 10000}
              max={schedule === "DAILY" ? 50000 : schedule === "WEEKLY" ? 250000 : 500000}
              step={schedule === "DAILY" ? 1000 : 5000}
              value={contribution}
              onChange={(e) => setContribution(Number(e.target.value))}
              className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {(schedule === "DAILY"
                ? [2000, 5000, 10000, 20000]
                : schedule === "WEEKLY"
                ? [10000, 25000, 50000, 100000]
                : [20000, 50000, 100000, 250000]
              ).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setContribution(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    contribution === preset
                      ? "bg-[#C5A059]/30 border-[#C5A059] text-[#C5A059] font-bold"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Members Count Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Circle Size (Total Savers)
              </label>
              <span className="font-mono text-xl sm:text-2xl font-black text-white">
                {members} <span className="text-sm font-normal text-gray-400">members</span>
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              step={1}
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
            {/* Member Presets */}
            <div className="flex gap-2 mt-2">
              {[5, 8, 10, 12, 15].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMembers(m)}
                  className={`text-[11px] px-3 py-1 rounded-lg border transition-colors ${
                    members === m
                      ? "bg-[#C5A059]/30 border-[#C5A059] text-[#C5A059] font-bold"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {m} savers
                </button>
              ))}
            </div>
          </div>

          {/* Value Callout */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-gray-300">
            <ShieldCheck className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">What does this fee cover?</span>
              Mono Open-Banking direct account sweeps, BVN identity lock, credit score enforcement, and 100% direct bank payout. Funds never sit in an omnibus holding account.
            </div>
          </div>

        </div>

        {/* Right: Net Payout Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 text-[#0B3022] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Gross Pool Collected
              </span>
              <span className="font-mono text-base font-black text-gray-700">
                ₦{totalPot.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Automation &amp; Protection
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">{feeDescription}</span>
              </div>
              <span className="font-mono text-base font-black text-rose-600">
                -₦{fee.toLocaleString()}
              </span>
            </div>

            {/* Net Payout Highlight */}
            <div className="p-4 rounded-xl bg-[#0B3022]/5 border border-[#0B3022]/10 mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#0B3022]">
                  Net Take-Home Payout
                </span>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {effectivePercentage}% effective fee
                </span>
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-[#0B3022] tracking-tight">
                ₦{netPayout.toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-600 mt-1">
                Disbursed straight to your verified Nigerian bank account on your scheduled turn.
              </p>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full py-3.5 px-6 bg-[#0B3022] hover:bg-[#154634] text-white font-bold text-center rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group text-sm"
          >
            <span>Launch This Circle</span>
            <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
