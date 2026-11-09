"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Plane,
  Calculator
} from "lucide-react";
import { CountryFlag } from "@/components/CountryFlag";

interface FxRate {
  symbol: string;
  name: string;
  code: "GBP" | "USD" | "CAD" | "EUR";
  flagCode: string;
  rateToNgn: number;
}

const FX_RATES: Record<string, FxRate> = {
  GBP: { symbol: "£", name: "British Pound", code: "GBP", flagCode: "GB", rateToNgn: 2150 },
  USD: { symbol: "$", name: "US Dollar", code: "USD", flagCode: "US", rateToNgn: 1620 },
  CAD: { symbol: "C$", name: "Canadian Dollar", code: "CAD", flagCode: "CA", rateToNgn: 1180 },
  EUR: { symbol: "€", name: "Euro", code: "EUR", flagCode: "EUR", rateToNgn: 1780 },
};

export default function DiasporaPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<"GBP" | "USD" | "CAD" | "EUR">("GBP");
  const [monthlyContribution, setMonthlyContribution] = useState<number>(200);
  const [membersCount, setMembersCount] = useState<number>(10);

  const currentFx = FX_RATES[selectedCurrency];
  const potInForeign = monthlyContribution * membersCount;
  const potInNgn = potInForeign * currentFx.rateToNgn;

  return (
    <main className="flex-1 flex flex-col items-center bg-[#F3EEE3] text-[#0B3022] relative overflow-hidden">
      
      {/* Hero Section — Deep Forest */}
      <section className="w-full py-20 md:py-28 bg-[#0B3022] text-[#F3EEE3] relative z-10 border-b border-[#F3EEE3]/10 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 text-[#F3EEE3] text-[11px] font-mono uppercase tracking-[0.16em] mb-7">
            <Globe className="w-3.5 h-3.5 text-[#D4A843]" />
            Cross-Border Thrift Circles &bull; Diaspora Portal
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-[-0.03em] text-[#F3EEE3] mb-6 leading-[1.05]">
            Save with family &amp; friends back home. <br />
            <span className="font-editorial italic font-normal text-[#D4A843]">
              From anywhere in the world.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#F3EEE3]/70 max-w-3xl mx-auto leading-relaxed mb-10">
            Contribute in <strong className="text-[#F3EEE3]">GBP (£)</strong>, <strong className="text-[#F3EEE3]">USD ($)</strong>, <strong className="text-[#F3EEE3]">CAD (C$)</strong>, or <strong className="text-[#F3EEE3]">EUR (€)</strong>. The collector receives their full bulk pot directly in <strong className="text-[#D4A843]">Naira (₦)</strong> with bank-grade security, automated accounting, and zero remittance stress.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto py-4 px-8 bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>Launch a Diaspora Circle</span>
              <ArrowRight className="w-4 h-4 text-[#0B3022] group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#calculator"
              className="w-full sm:w-auto py-4 px-8 bg-[#F3EEE3]/[0.06] hover:bg-[#F3EEE3]/[0.12] text-[#F3EEE3] border border-[#F3EEE3]/20 font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4 text-[#D4A843]" />
              <span>Simulate FX Payout</span>
            </a>
          </div>

          {/* Supported Diaspora Hubs */}
          <div className="mt-14 pt-8 border-t border-[#F3EEE3]/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono uppercase tracking-wider text-[#F3EEE3]/75">
            <div className="flex items-center gap-2.5">
              <CountryFlag code="GB" className="w-5 h-3.5 rounded-xs shadow-xs" />
              <span>United Kingdom (London, Manchester)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CountryFlag code="US" className="w-5 h-3.5 rounded-xs shadow-xs" />
              <span>United States (Atlanta, Houston, NY)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CountryFlag code="CA" className="w-5 h-3.5 rounded-xs shadow-xs" />
              <span>Canada (Toronto, Calgary)</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive FX & Diaspora Calculator Section */}
      <section id="calculator" className="w-full py-24 bg-[#F3EEE3] border-b border-[#0B3022]/10 relative z-10">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0B3022]/60 block mb-2.5">
              Live Currency Calculator
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#0B3022]">
              Calculate your{" "}
              <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
                cross-border pot.
              </span>
            </h2>
            <p className="text-sm text-[#0B3022]/65 mt-3">
              See what each member contributes abroad and what the collector receives in Nigeria.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-[#0B3022] rounded-3xl p-6 sm:p-10 border border-[#0B3022] text-[#F3EEE3] shadow-[0_24px_60px_rgba(11,48,34,0.12)]">
            
            {/* Currency Selector */}
            <div className="mb-8">
              <label className="block text-[11px] font-mono uppercase tracking-[0.16em] text-[#F3EEE3]/60 mb-3">
                Select Your Contribution Currency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.values(FX_RATES).map((fx) => (
                  <button
                    key={fx.code}
                    type="button"
                    onClick={() => setSelectedCurrency(fx.code)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedCurrency === fx.code
                        ? "bg-[#D4A843] text-[#0B3022] border-[#D4A843] shadow-lg"
                        : "bg-[#F3EEE3]/[0.05] hover:bg-[#F3EEE3]/[0.1] text-[#F3EEE3] border-[#F3EEE3]/12"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-bold">{fx.code}</span>
                      <CountryFlag code={fx.flagCode} className="w-4 h-3 rounded-xs" />
                    </div>
                    <span className="text-xs block font-bold truncate">{fx.symbol} {fx.name}</span>
                    <span className="text-[11px] font-mono opacity-75 block mt-1">1 {fx.code} ≈ ₦{fx.rateToNgn.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-[#F3EEE3]/10">
              
              {/* Contribution Slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#F3EEE3]/75">Monthly Contribution / Member</span>
                  <span className="text-lg font-bold text-[#D4A843] px-3 py-1 bg-[#F3EEE3]/[0.08] border border-[#F3EEE3]/12 rounded-xl font-mono">
                    {currentFx.symbol}{monthlyContribution}
                  </span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#F3EEE3]/20 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#F3EEE3]/45 mt-1.5">
                  <span>{currentFx.symbol}50</span>
                  <span>{currentFx.symbol}500</span>
                  <span>{currentFx.symbol}1,500</span>
                </div>
              </div>

              {/* Members Slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#F3EEE3]/75">Circle Members</span>
                  <span className="text-lg font-bold text-[#D4A843] px-3 py-1 bg-[#F3EEE3]/[0.08] border border-[#F3EEE3]/12 rounded-xl font-mono">
                    {membersCount} Savers
                  </span>
                </div>
                <input 
                  type="range"
                  min="3"
                  max="20"
                  value={membersCount}
                  onChange={(e) => setMembersCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#F3EEE3]/20 rounded-lg appearance-none cursor-pointer accent-[#D4A843]"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#F3EEE3]/45 mt-1.5">
                  <span>3 Savers</span>
                  <span>10 Savers</span>
                  <span>20 Savers</span>
                </div>
              </div>

            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-[#F3EEE3]/[0.05] border border-[#F3EEE3]/12 rounded-2xl p-5 text-left space-y-2.5 text-xs">
                <div className="flex justify-between text-[#F3EEE3]/75">
                  <span>Foreign Pool Collected:</span>
                  <strong className="text-[#F3EEE3] font-mono text-sm">{currentFx.symbol}{potInForeign.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-[#F3EEE3]/75">
                  <span>Current Indicative Rate:</span>
                  <strong className="text-[#D4A843] font-mono">1 {currentFx.code} = ₦{currentFx.rateToNgn.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-[#F3EEE3]/75">
                  <span>Settlement Method:</span>
                  <strong className="text-[#F3EEE3]">Direct NIP Bank Deposit in Nigeria</strong>
                </div>
              </div>

              <div className="bg-[#F3EEE3]/[0.06] p-6 rounded-2xl border border-[#D4A843]/50 text-center">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#F3EEE3]/65 block mb-1">
                  Total Recipient Payout in Nigeria
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-[#D4A843] tracking-tight my-1">
                  ₦{potInNgn.toLocaleString()}
                </div>
                <p className="text-[11px] font-mono text-[#F3EEE3]/65">
                  Direct to recipient account upon round maturity
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3 Core Value Pillars for Diaspora */}
      <section className="w-full py-24 bg-[#F3EEE3] relative z-10 border-b border-[#0B3022]/10">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#0B3022]">
              Why diaspora circles choose{" "}
              <span className="font-editorial italic font-normal underline decoration-[#D4A843] decoration-2 underline-offset-4">
                Àjọṣe.
              </span>
            </h2>
            <p className="text-[#0B3022]/65 mt-3 text-base">
              Say goodbye to uncoordinated bank transfers, manual spreadsheets, and trust issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-8 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)]">
              <div className="w-12 h-12 rounded-2xl bg-[#0B3022] flex items-center justify-center text-[#D4A843] mb-6">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-2.5">Seamless Remote Collections</h3>
              <p className="text-sm text-[#0B3022]/65 leading-relaxed">
                Members in London, Atlanta, and Toronto contribute on schedule. No more chasing relatives for monthly remittance proofs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)]">
              <div className="w-12 h-12 rounded-2xl bg-[#0B3022] flex items-center justify-center text-[#D4A843] mb-6">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-2.5">100% Transparent Ledger</h3>
              <p className="text-sm text-[#0B3022]/65 leading-relaxed">
                Every member across time zones sees the exact rotation schedule, whose turn is next, and verified transaction receipts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)]">
              <div className="w-12 h-12 rounded-2xl bg-[#0B3022] flex items-center justify-center text-[#D4A843] mb-6">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-2.5">Direct Pass-Through to Nigeria</h3>
              <p className="text-sm text-[#0B3022]/65 leading-relaxed">
                When it’s the recipient’s turn, funds are paid straight into their Nigerian bank account without high traditional remittance fees.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Community Testimonials Highlight */}
      <section className="w-full py-20 bg-white relative z-10 border-b border-[#0B3022]/10">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl text-center">
          
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#D4A843] block mb-3">
            Diaspora Voice
          </span>
          
          <blockquote className="text-2xl sm:text-3xl font-editorial italic text-[#0B3022] leading-relaxed mb-6">
            &ldquo;Managing our family circle between London and Lagos used to cause endless WhatsApp confusion. With Àjọṣe, everyone knows their turn, contributions are recorded instantly, and the pot lands directly in our parents&rsquo; account when it&rsquo;s their turn.&rdquo;
          </blockquote>

          <div className="flex items-center justify-center gap-3">
            <CountryFlag code="GB" className="w-5 h-3.5 rounded-xs shadow-xs" />
            <span className="font-bold text-sm text-[#0B3022]">Aisha B. &bull; London, UK Circle Organizer</span>
          </div>

        </div>
      </section>

      {/* CTA Footer */}
      <section className="w-full py-24 bg-[#0B3022] text-[#F3EEE3] text-center relative z-10">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#F3EEE3] mb-5">
            Ready to start your{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">
              diaspora circle?
            </span>
          </h2>
          <p className="text-base text-[#F3EEE3]/70 mb-8 max-w-xl mx-auto">
            Set your rules, invite members from anywhere in the world, and experience stress-free rotational thrift.
          </p>
          <Link
            href="/signup"
            className="inline-flex py-4 px-8 bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] font-bold text-sm rounded-full transition-all items-center gap-2 group"
          >
            <span>Create a Group Free</span>
            <ArrowRight className="w-4 h-4 text-[#0B3022] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </main>
  );
}
