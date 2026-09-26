"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Globe, 
  Coins, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Building2, 
  Users, 
  Check, 
  Plane,
  Calculator,
  Lock
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
    <main className="flex-1 flex flex-col items-center bg-[#FDFBF7] text-[#1F2937] relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#0B3022]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="w-full py-20 md:py-28 relative z-10 border-b border-gray-200/80">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/10 border border-[#0B3022]/15 text-[#0B3022] text-xs font-bold uppercase tracking-wider mb-6">
            <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
            Cross-Border Thrift Circles &bull; Diaspora Portal
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#0B3022] font-serif mb-6 leading-[1.1]">
            Save with Family &amp; Friends Back Home. <br />
            <span className="text-[#C5A059]">From Anywhere in the World.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#1F2937]/80 max-w-3xl mx-auto leading-relaxed font-medium mb-10">
            Contribute in <strong>GBP (£)</strong>, <strong>USD ($)</strong>, <strong>CAD (C$)</strong>, or <strong>EUR (€)</strong>. Recipient collects their full bulk pot directly in <strong>Naira (₦)</strong> with bank-grade security, automated accounting, and zero remittance stress.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto py-4 px-8 bg-[#0B3022] hover:bg-[#154634] text-white font-bold text-base rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2.5 group"
            >
              <span>Launch a Diaspora Circle</span>
              <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#calculator"
              className="w-full sm:w-auto py-4 px-8 bg-white hover:bg-gray-50 text-[#0B3022] border-2 border-gray-200 font-bold text-base rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4 text-[#C5A059]" />
              <span>Simulate FX Payout</span>
            </a>
          </div>

          {/* Supported Diaspora Hubs */}
          <div className="mt-12 pt-8 border-t border-gray-200/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-[#0B3022]">
            <div className="flex items-center gap-2">
              <CountryFlag code="GB" className="w-5 h-3.5 rounded-xs shadow-xs" />
              <span>United Kingdom (London, Manchester)</span>
            </div>
            <div className="flex items-center gap-2">
              <CountryFlag code="US" className="w-5 h-3.5 rounded-xs shadow-xs" />
              <span>United States (Atlanta, Houston, NY)</span>
            </div>
            <div className="flex items-center gap-2">
              <CountryFlag code="CA" className="w-5 h-3.5 rounded-xs shadow-xs" />
              <span>Canada (Toronto, Calgary)</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive FX & Diaspora Calculator Section */}
      <section id="calculator" className="w-full py-20 bg-white border-b border-gray-200 relative z-10">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
              Live Currency Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B3022] font-serif">
              Calculate Your Cross-Border Pot
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              See what each member contributes abroad and what the collector receives in Nigeria.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-[#0B3022] rounded-3xl p-6 sm:p-10 border-2 border-[#C5A059]/40 text-white shadow-2xl">
            
            {/* Currency Selector */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-3">
                Select Your Contribution Currency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.values(FX_RATES).map((fx) => (
                  <button
                    key={fx.code}
                    type="button"
                    onClick={() => setSelectedCurrency(fx.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedCurrency === fx.code
                        ? "bg-[#C5A059] text-[#0B3022] border-[#C5A059] shadow-lg scale-102"
                        : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-black">{fx.code}</span>
                      <CountryFlag code={fx.flagCode} className="w-4 h-3 rounded-xs" />
                    </div>
                    <span className="text-xs block font-bold truncate">{fx.symbol} {fx.name}</span>
                    <span className="text-[10px] opacity-75 block mt-1">1 {fx.code} ≈ ₦{fx.rateToNgn.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/10">
              
              {/* Contribution Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80">Monthly Contribution / Member</span>
                  <span className="text-lg font-black text-[#C5A059] px-3 py-1 bg-white/10 rounded-xl font-mono">
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
                  className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <div className="flex justify-between text-[11px] text-white/50 mt-1">
                  <span>{currentFx.symbol}50</span>
                  <span>{currentFx.symbol}500</span>
                  <span>{currentFx.symbol}1,500</span>
                </div>
              </div>

              {/* Members Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80">Circle Members</span>
                  <span className="text-lg font-black text-[#C5A059] px-3 py-1 bg-white/10 rounded-xl font-mono">
                    {membersCount} Savers
                  </span>
                </div>
                <input 
                  type="range"
                  min="3"
                  max="20"
                  value={membersCount}
                  onChange={(e) => setMembersCount(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <div className="flex justify-between text-[11px] text-white/50 mt-1">
                  <span>3 Savers</span>
                  <span>10 Savers</span>
                  <span>20 Savers</span>
                </div>
              </div>

            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-white/10 rounded-2xl p-5 text-left space-y-2 text-xs">
                <div className="flex justify-between text-white/80">
                  <span>Foreign Pool Collected:</span>
                  <strong className="text-white font-mono text-sm">{currentFx.symbol}{potInForeign.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Current Indicative Rate:</span>
                  <strong className="text-[#C5A059] font-mono">1 {currentFx.code} = ₦{currentFx.rateToNgn.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Settlement Method:</span>
                  <strong className="text-emerald-300">Direct NIP Bank Deposit in Nigeria</strong>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#124230] to-[#0D3526] p-6 rounded-2xl border border-[#C5A059] text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1">
                  Total Recipient Payout in Nigeria
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#C5A059] tracking-tight my-1">
                  ₦{potInNgn.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Direct to recipient account upon round maturity
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3 Core Value Pillars for Diaspora */}
      <section className="w-full py-20 bg-[#FDFBF7] relative z-10 border-b border-gray-200">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B3022] font-serif">
              Why Diaspora Groups Choose Àjọṣe
            </h2>
            <p className="text-gray-600 mt-2 text-base">
              Say goodbye to uncoordinated bank transfers, manual spreadsheets, and trust issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-6">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">Seamless Remote Collections</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Members in London, Atlanta, and Toronto contribute on schedule. No more chasing relatives for monthly remittance proofs.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/20 flex items-center justify-center text-[#0B3022] mb-6">
                <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">100% Transparent Ledger</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every member across time zones sees the exact rotation schedule, whose turn is next, and verified transaction receipts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">Direct Pass-Through to Nigeria</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                When it’s the recipient’s turn, funds are paid straight into their Nigerian bank account without high traditional remittance fees.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Community Testimonials Highlight */}
      <section className="w-full py-20 bg-white relative z-10 border-b border-gray-200">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl text-center">
          
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
            Diaspora Voice
          </span>
          
          <blockquote className="text-xl sm:text-2xl font-serif text-[#0B3022] italic leading-relaxed mb-6">
            &ldquo;Managing our family circle between London and Lagos used to cause endless WhatsApp confusion. With Àjọṣe, everyone knows their turn, contributions are recorded instantly, and the pot lands directly in our parents&rsquo; account when it&rsquo;s their turn.&rdquo;
          </blockquote>

          <div className="flex items-center justify-center gap-3">
            <CountryFlag code="GB" className="w-5 h-3.5 rounded-xs shadow-xs" />
            <span className="font-bold text-sm text-[#0B3022]">Aisha B. &bull; London, UK Circle Organizer</span>
          </div>

        </div>
      </section>

      {/* CTA Footer */}
      <section className="w-full py-20 bg-[#0B3022] text-white text-center relative z-10">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <h2 className="text-3xl sm:text-5xl font-black font-serif text-white mb-6">
            Ready to Start Your Diaspora Circle?
          </h2>
          <p className="text-base text-white/80 mb-8 max-w-xl mx-auto">
            Set your rules, invite members from anywhere in the world, and experience stress-free rotational thrift.
          </p>
          <Link
            href="/signup"
            className="inline-flex py-4 px-8 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-black text-base rounded-2xl transition-all shadow-xl items-center gap-2 group"
          >
            <span>Create a Group Free</span>
            <ArrowRight className="w-4 h-4 text-[#0B3022] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </main>
  );
}
