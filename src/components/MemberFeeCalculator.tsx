"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, ShieldCheck } from "lucide-react";

type Schedule = "DAILY" | "WEEKLY" | "MONTHLY";

export function MemberFeeCalculator() {
  const [schedule, setSchedule] = useState<Schedule>("MONTHLY");
  const [contribution, setContribution] = useState<number>(50000);
  const [members, setMembers] = useState<number>(10);

  const totalPot = contribution * members;
  
  let totalFee = 0;
  let feeDescription = "";
  
  if (schedule === "MONTHLY") {
    totalFee = Math.min(totalPot * 0.02, 10000);
    feeDescription = totalPot * 0.02 > 10000 ? "2% Capped at ₦10,000 Max" : "2% Open-Banking Protection Fee";
  } else if (schedule === "WEEKLY") {
    totalFee = 300 * members;
    feeDescription = "₦300 Sweep Fee per Debit";
  } else {
    totalFee = 100 * members;
    feeDescription = "₦100 Processing Fee per Debit";
  }

  const memberFee = totalFee / members;
  const memberTotalDebit = contribution + memberFee;
  const netPayout = totalPot;

  return (
    <div className="bg-[#0B3022] rounded-3xl p-6 sm:p-10 border border-[#F3EEE3]/10 text-[#F3EEE3] shadow-[0_24px_60px_rgba(11,48,34,0.2)] relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#F3EEE3]/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A843]/15 border border-[#D4A843]/30 text-[#D4A843] text-[11px] font-mono font-bold uppercase tracking-[0.14em] mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Payout Simulator</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-[#F3EEE3] tracking-[-0.025em]">
            Calculate your pot &amp;{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">protection fee.</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#F3EEE3]/65 mt-1">
            See exactly how much arrives in your bank account when it&rsquo;s your turn to collect.
          </p>
        </div>

        {/* Schedule Selector */}
        <div className="flex items-center bg-[#F3EEE3]/[0.06] p-1.5 rounded-full border border-[#F3EEE3]/10 shrink-0">
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
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                schedule === s
                  ? "bg-[#D4A843] text-[#0B3022] shadow-md"
                  : "text-[#F3EEE3]/75 hover:text-[#F3EEE3]"
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
              <label className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#F3EEE3]/70">
                Contribution Per Member ({schedule.toLowerCase()})
              </label>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#D4A843]">
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
              className="w-full h-2 bg-[#F3EEE3]/15 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2.5">
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
                  className={`text-[11px] font-mono px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                    contribution === preset
                      ? "bg-[#D4A843]/25 border-[#D4A843] text-[#D4A843] font-bold"
                      : "bg-[#F3EEE3]/[0.05] border-[#F3EEE3]/10 text-[#F3EEE3]/70 hover:bg-[#F3EEE3]/10"
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
              <label className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#F3EEE3]/70">
                Circle Size (Total Savers)
              </label>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#F3EEE3]">
                {members} <span className="text-sm font-normal text-[#F3EEE3]/50">members</span>
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              step={1}
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              className="w-full h-2 bg-[#F3EEE3]/15 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
            />
            {/* Member Presets */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[5, 8, 10, 12, 15].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMembers(m)}
                  className={`text-[11px] font-mono px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                    members === m
                      ? "bg-[#D4A843]/25 border-[#D4A843] text-[#D4A843] font-bold"
                      : "bg-[#F3EEE3]/[0.05] border-[#F3EEE3]/10 text-[#F3EEE3]/70 hover:bg-[#F3EEE3]/10"
                  }`}
                >
                  {m} savers
                </button>
              ))}
            </div>
          </div>

          {/* Value Callout */}
          <div className="p-4 rounded-2xl bg-[#F3EEE3]/[0.04] border border-[#F3EEE3]/10 flex items-start gap-3 text-xs text-[#F3EEE3]/70">
            <ShieldCheck className="w-5 h-5 text-[#D4A843] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#F3EEE3] block mb-0.5">What does this fee cover?</span>
              Mono Open-Banking direct account sweeps, BVN identity lock, Trust Score enforcement, and 100% direct bank payout. Standard baseline rate shown (can be reduced lower via referral tiers or custom Admin partner rates).
            </div>
          </div>

        </div>

        {/* Right: Net Payout Card */}
        <div className="lg:col-span-5 bg-[#F3EEE3] rounded-3xl p-6 sm:p-7 text-[#0B3022] shadow-xl flex flex-col justify-between border border-[#0B3022]/10">
          <div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#0B3022]/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B3022]/60">
                Total Member Debit (Base + Fee)
              </span>
              <span className="font-mono text-base font-bold text-[#0B3022]">
                ₦{memberTotalDebit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})} /saver
              </span>
            </div>

            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#0B3022]/10">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B3022]/60 block">
                  Platform Automation Fee
                </span>
                <span className="text-[10px] text-[#0B3022]/50 font-semibold">{feeDescription}</span>
              </div>
              <span className="font-mono text-base font-bold text-[#0B3022]/70">
                +₦{totalFee.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
              </span>
            </div>

            {/* Net Payout Highlight */}
            <div className="p-5 rounded-2xl bg-white border border-[#0B3022]/10 mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B3022]">
                  Target Pot Payout
                </span>
                <span className="text-[10px] font-mono font-bold text-[#0B3022] bg-[#D4A843]/25 px-2.5 py-0.5 rounded-full">
                  100% Disbursed
                </span>
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-bold text-[#0B3022] tracking-tight">
                ₦{netPayout.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#0B3022]/65 mt-1.5">
                The full target savings pot disbursed directly to the recipient&apos;s verified bank account.
              </p>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full py-3.5 px-6 bg-[#0B3022] hover:bg-[#154634] text-[#F3EEE3] font-bold text-center rounded-full transition-all shadow-md flex items-center justify-center gap-2 group text-sm"
          >
            <span>Launch This Circle</span>
            <ArrowRight className="w-4 h-4 text-[#D4A843] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
