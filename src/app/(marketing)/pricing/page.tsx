import { CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { InteractiveRevenueCalculator } from "@/components/InteractiveRevenueCalculator";
import { MemberFeeCalculator } from "@/components/MemberFeeCalculator";

export const metadata: Metadata = {
  title: "Simple, Transparent Pricing | Àjọṣe",
  description: "No hidden fees, no subscriptions. Select the schedule that works best for your circle: Monthly at standard 2% on debits (as low as 0.5%), Weekly at ₦300/tx, and Daily at ₦100/tx with 0% payout deductions.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#F3EEE3] py-20 md:py-28">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 text-[#0B3022] text-[11px] font-mono font-bold uppercase tracking-[0.16em] mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
            Clean, Flat-Rate Commercial Pricing
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-[#0B3022] mb-6 leading-[1.06]">
            Simple, transparent{" "}
            <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-8">
              pricing.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#0B3022]/75 leading-relaxed font-normal">
            No hidden fees, no subscriptions. Select the schedule that works best for your circle.
          </p>
        </div>

        {/* 3 Schedule Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-16">
          
          {/* TIER 1: Daily Groups */}
          <div className="bg-white p-7 md:p-8 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)] flex flex-col hover:border-[#D4A843]/50 transition-all duration-300 relative group">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#0B3022] bg-[#F3EEE3] px-3 py-1 rounded-full">
                Daily Groups
              </span>
              <span className="text-[11px] font-mono font-bold text-[#0B3022] bg-[#D4A843]/20 border border-[#D4A843]/40 px-2.5 py-0.5 rounded-full">
                0% Payout Fee
              </span>
            </div>

            <div className="mb-4">
              <div className="text-4xl md:text-5xl font-bold text-[#0B3022] tracking-tight font-mono">
                ₦100
                <span className="text-sm font-sans font-medium text-[#0B3022]/55 ml-1.5">/ transaction</span>
              </div>
              <p className="text-xs font-bold text-[#0B3022]/70 mt-1.5">
                Zero fees deducted at payout
              </p>
            </div>

            <p className="text-sm text-[#0B3022]/70 mb-6 flex-1 leading-relaxed">
              Engineered for high-frequency thrift, business micro-collections, and daily rotating savings circles.
            </p>

            <ul className="space-y-3.5 mb-8 text-xs font-medium text-[#0B3022]/85">
              {[
                "Flat ₦100 automated processing fee per transaction",
                "0% payout fees — collector receives entire cycle pot",
                "Automated daily direct debit sweep via Mono Open Banking",
                "Instant ledger update upon morning sweep",
                "Habitual defaulter prevention & real-time tracking"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="bg-[#D4A843]/20 rounded-full p-0.5 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B3022]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/signup" 
              className="w-full py-3.5 px-4 bg-[#F3EEE3] hover:bg-[#0B3022] hover:text-[#F3EEE3] text-[#0B3022] border border-[#0B3022]/20 font-bold text-center rounded-full transition-all text-sm"
            >
              Start Daily Group
            </Link>
          </div>

          {/* TIER 2: Weekly Groups (Highlighted / Featured) */}
          <div className="bg-[#0B3022] p-7 md:p-8 rounded-3xl shadow-[0_24px_50px_rgba(11,48,34,0.22)] flex flex-col relative overflow-hidden border-2 border-[#D4A843] transform md:-translate-y-2 transition-all duration-300">
            <div className="flex items-center justify-between mb-5 relative z-10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#0B3022] bg-[#D4A843] px-3 py-1 rounded-full">
                Weekly Groups
              </span>
              <span className="text-[11px] font-mono font-bold text-[#D4A843] bg-[#D4A843]/15 border border-[#D4A843]/40 px-2.5 py-0.5 rounded-full">
                0% Payout Fee
              </span>
            </div>

            <div className="mb-4 relative z-10">
              <div className="text-4xl md:text-5xl font-bold text-[#F3EEE3] tracking-tight font-mono">
                ₦300
                <span className="text-sm font-sans font-medium text-[#F3EEE3]/65 ml-1.5">/ transaction</span>
              </div>
              <p className="text-xs font-bold text-[#D4A843] mt-1.5">
                Zero fees deducted at payout
              </p>
            </div>

            <p className="text-sm text-[#F3EEE3]/75 mb-6 flex-1 leading-relaxed relative z-10">
              The premier choice for market traders, artisans, weekly income earners, and fast-paced rotating pools.
            </p>

            <ul className="space-y-3.5 mb-8 text-xs font-medium text-[#F3EEE3]/90 relative z-10">
              {[
                "Flat ₦300 automated processing fee per transaction",
                "0% payout fees — collector receives entire cycle pot",
                "2-day grace period (Opens Monday, cutoff Tuesday)",
                "Automated direct debit & live statement reconciliation",
                "Trust Score protection & automated member reminders"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="bg-[#D4A843]/20 rounded-full p-0.5 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A843]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/signup" 
              className="w-full py-3.5 px-4 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-center rounded-full transition-all shadow-lg text-sm relative z-10"
            >
              Start Weekly Group
            </Link>
          </div>

          {/* TIER 3: Monthly Groups */}
          <div className="bg-white p-7 md:p-8 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)] flex flex-col hover:border-[#D4A843]/50 transition-all duration-300 relative group">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#0B3022] bg-[#F3EEE3] px-3 py-1 rounded-full">
                Monthly Groups
              </span>
              <span className="text-[11px] font-mono font-bold text-[#0B3022] bg-[#D4A843]/20 border border-[#D4A843]/40 px-2.5 py-0.5 rounded-full">
                ₦10k Cap Max
              </span>
            </div>

            <div className="mb-4">
              <div className="text-4xl md:text-5xl font-bold text-[#0B3022] tracking-tight font-mono">
                2%
                <span className="text-sm font-sans font-medium text-[#0B3022]/55 ml-1.5">/ debit</span>
              </div>
              <p className="text-xs font-bold text-[#0B3022]/70 mt-1.5">
                Zero fees deducted at payout
              </p>
            </div>

            <p className="text-sm text-[#0B3022]/70 mb-6 flex-1 leading-relaxed">
              Standard for salary earners, tech circles, rent pools, and high-value institutional contributions.
            </p>

            <ul className="space-y-3.5 mb-8 text-xs font-medium text-[#0B3022]/85">
              {[
                "Standard 2% platform fee on monthly debits (as low as 0.5% with referrals)",
                "Strictly capped at ₦10,000 maximum per debit",
                "0% payout fees — collector receives 100% of the target pot complete",
                "5-day grace period aligned with salary cycles (1st to 5th)",
                "Automated pass-through settlement to recipient bank account"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="bg-[#D4A843]/20 rounded-full p-0.5 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B3022]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/signup" 
              className="w-full py-3.5 px-4 bg-[#F3EEE3] hover:bg-[#0B3022] hover:text-[#F3EEE3] text-[#0B3022] border border-[#0B3022]/20 font-bold text-center rounded-full transition-all text-sm"
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
