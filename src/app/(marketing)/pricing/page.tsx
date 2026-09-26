import { CheckCircle2, Sparkles, Calculator, Briefcase } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { InteractiveRevenueCalculator } from "@/components/InteractiveRevenueCalculator";
import { MemberFeeCalculator } from "@/components/MemberFeeCalculator";

export const metadata: Metadata = {
  title: "Simple, Transparent Pricing | Àjọṣe",
  description: "No hidden fees, no subscriptions. Select the schedule that works best for your circle: Monthly at 2% (capped at ₦10k), Weekly at ₦300/tx, and Daily at ₦100/tx.",
};

export default function PricingPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-20 md:py-28">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#0B3022]/5 rounded-full blur-[110px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 max-w-6xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/10 border border-[#0B3022]/15 text-[#0B3022] text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            Clean, Flat-Rate Commercial Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0B3022] mb-6 font-serif">
            Simple, Transparent <span className="text-[#C5A059]">Pricing</span>
          </h1>
          <p className="text-lg md:text-xl text-[#1F2937]/80 leading-relaxed font-medium">
            No hidden fees, no subscriptions. Select the schedule that works best for your circle.
          </p>
        </div>

        {/* 3 Schedule Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* TIER 1: Daily Groups */}
          <div className="bg-white p-7 md:p-8 rounded-3xl border border-gray-200/90 shadow-lg flex flex-col hover:shadow-xl transition-all duration-300 relative group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3022] bg-[#0B3022]/10 px-3 py-1 rounded-full">
                📌 Daily Groups
              </span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                0% Payout Fees!
              </span>
            </div>

            <div className="mb-4">
              <div className="text-4xl md:text-5xl font-black text-[#0B3022] tracking-tight">
                ₦100
                <span className="text-sm font-semibold text-gray-500 ml-1.5">/ transaction</span>
              </div>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                Zero fees deducted at payout
              </p>
            </div>

            <p className="text-sm text-[#1F2937]/75 mb-6 flex-1 font-medium leading-relaxed">
              Engineered for high-frequency thrift, business micro-collections, and daily rotating savings circles.
            </p>

            <ul className="space-y-3.5 mb-8 text-xs font-medium text-[#1F2937]/90">
              {[
                "Flat ₦100 automated processing fee per transaction",
                "0% payout fees — collector receives entire cycle pot",
                "Automated daily direct debit sweep via Mono Open Banking",
                "Instant ledger update upon morning sweep",
                "Habitual defaulter prevention & real-time tracking"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="bg-[#0B3022]/10 rounded-full p-0.5 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B3022]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/signup" 
              className="w-full py-3.5 px-4 bg-[#FDFBF7] hover:bg-[#0B3022] hover:text-[#C5A059] text-[#0B3022] border-2 border-[#0B3022] font-black text-center rounded-xl transition-all shadow-sm text-sm"
            >
              Start Daily Group
            </Link>
          </div>

          {/* TIER 2: Weekly Groups (Highlighted / Featured) */}
          <div className="bg-[#0B3022] p-7 md:p-8 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border-2 border-[#C5A059] transform md:-translate-y-2 hover:shadow-[0_20px_50px_rgba(11,48,34,0.35)] transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C5A059]/20 rounded-full blur-[45px] pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3022] bg-[#C5A059] px-3 py-1 rounded-full">
                🗓 Weekly Groups
              </span>
              <span className="text-xs font-black text-[#0B3022] bg-[#C5A059]/30 border border-[#C5A059] px-2.5 py-0.5 rounded-full text-[#C5A059]">
                0% Payout Fees!
              </span>
            </div>

            <div className="mb-4 relative z-10">
              <div className="text-4xl md:text-5xl font-black text-white tracking-tight">
                ₦300
                <span className="text-sm font-semibold text-gray-300 ml-1.5">/ transaction</span>
              </div>
              <p className="text-xs font-bold text-[#C5A059] mt-1">
                Zero fees deducted at payout
              </p>
            </div>

            <p className="text-sm text-white/80 mb-6 flex-1 font-medium leading-relaxed relative z-10">
              The premier choice for market traders, artisans, weekly income earners, and fast-paced rotating pools.
            </p>

            <ul className="space-y-3.5 mb-8 text-xs font-medium text-white/90 relative z-10">
              {[
                "Flat ₦300 automated processing fee per transaction",
                "0% payout fees — collector receives entire cycle pot",
                "2-day grace period (Opens Monday, cutoff Tuesday)",
                "Automated direct debit & live statement reconciliation",
                "Ajo Credit Score protection & automated member reminders"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="bg-[#C5A059]/20 rounded-full p-0.5 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/signup" 
              className="w-full py-3.5 px-4 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-black text-center rounded-xl transition-all shadow-lg text-sm relative z-10"
            >
              Start Weekly Group
            </Link>
          </div>

          {/* TIER 3: Monthly Groups */}
          <div className="bg-white p-7 md:p-8 rounded-3xl border border-gray-200/90 shadow-lg flex flex-col hover:shadow-xl transition-all duration-300 relative group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3022] bg-[#0B3022]/10 px-3 py-1 rounded-full">
                📅 Monthly Groups
              </span>
              <span className="text-xs font-bold text-[#0B3022] bg-[#C5A059]/20 border border-[#C5A059]/40 px-2.5 py-0.5 rounded-full">
                Capped at ₦10,000 Max
              </span>
            </div>

            <div className="mb-4">
              <div className="text-4xl md:text-5xl font-black text-[#0B3022] tracking-tight">
                2%
                <span className="text-sm font-semibold text-gray-500 ml-1.5">/ payout</span>
              </div>
              <p className="text-xs font-bold text-gray-500 mt-1">
                Zero per-transaction fees on contributions
              </p>
            </div>

            <p className="text-sm text-[#1F2937]/75 mb-6 flex-1 font-medium leading-relaxed">
              Standard for salary earners, tech circles, rent pools, and high-value institutional contributions.
            </p>

            <ul className="space-y-3.5 mb-8 text-xs font-medium text-[#1F2937]/90">
              {[
                "2% flat fee deducted only on successful payouts",
                "Strictly capped at ₦10,000 maximum per payout",
                "₦0 per-transaction automation fee on member debits",
                "5-day grace period aligned with salary cycles (1st to 5th)",
                "Automated pass-through payout to recipient bank account"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="bg-[#0B3022]/10 rounded-full p-0.5 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B3022]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/signup" 
              className="w-full py-3.5 px-4 bg-[#FDFBF7] hover:bg-[#0B3022] hover:text-[#C5A059] text-[#0B3022] border-2 border-[#0B3022] font-black text-center rounded-xl transition-all shadow-sm text-sm"
            >
              Start Monthly Group
            </Link>
          </div>

        </div>

        {/* Member Fee & Net Payout Calculator */}
        <div className="mb-20">
          <MemberFeeCalculator />
        </div>

        {/* B2B Organizer Revenue Simulator */}
        <div className="mt-12 mb-8">
          <InteractiveRevenueCalculator showTitle={true} />
        </div>

      </div>
    </main>
  );
}

