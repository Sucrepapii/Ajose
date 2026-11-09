import { ShieldCheck, Lock, AlertTriangle, Landmark } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Trust | Àjọṣe",
  description: "Learn how Àjọṣe protects your contributions with bank-grade encryption, BVN verification, and the Ajo Credit Penalty System.",
  alternates: {
    canonical: "/security",
  },
};

export default function SecurityPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#F3EEE3] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 text-[#0B3022] text-[11px] font-mono font-bold uppercase tracking-[0.16em] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            Security Architecture
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-[#0B3022] mb-6 leading-[1.06]">
            Institutional-grade{" "}
            <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-8">
              security.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#0B3022]/75 leading-relaxed max-w-3xl mx-auto">
            Your contributions are protected by verified BVN identity checks, an audited transaction ledger, and automated circle default protections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 md:p-11 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)] hover:border-[#D4A843]/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#0B3022] flex items-center justify-center mb-6">
              <Lock className="w-7 h-7 text-[#D4A843]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0B3022] mb-3 tracking-tight">End-to-End Encryption</h3>
            <p className="text-[#0B3022]/75 leading-relaxed">
              All financial data and personal information is encrypted both in transit and at rest using AES-256 standards. We never store raw banking credentials.
            </p>
          </div>

          <div className="bg-white p-8 md:p-11 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)] hover:border-[#D4A843]/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#0B3022] flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-[#D4A843]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0B3022] mb-3 tracking-tight">Identity Verification</h3>
            <p className="text-[#0B3022]/75 leading-relaxed">
              Every member on Àjọṣe must pass our strict Know Your Customer (KYC) protocols using valid BVN before they can join an active Ajo group.
            </p>
          </div>
        </div>

        {/* Credit Penalty Section */}
        <div className="bg-[#0B3022] p-10 md:p-14 rounded-3xl shadow-[0_24px_60px_rgba(11,48,34,0.18)] border border-[#0B3022] relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#D4A843]/15 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
            <div className="md:w-1/4 shrink-0 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-[#D4A843]/15 border-2 border-[#D4A843]/40 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-[#D4A843]" />
              </div>
            </div>
            <div className="md:w-3/4">
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#D4A843] font-bold block mb-2">
                Reputation Enforcement
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#F3EEE3] mb-4 tracking-tight">
                The Àjọṣe Trust Score{" "}
                <span className="font-editorial italic font-normal text-[#D4A843]">penalty system.</span>
              </h2>
              <p className="text-[#F3EEE3]/75 leading-relaxed text-base mb-6">
                Trust is the foundation of cooperative contributions. To protect the pool, we enforce a strict penalty system:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4A843]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 bg-[#D4A843] rounded-full" />
                  </div>
                  <p className="text-[#F3EEE3]/90">
                    Defaulting on a payment results in an immediate <strong className="text-[#D4A843]">-50 point</strong> penalty to your global Àjọṣe Trust Score.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4A843]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 bg-[#D4A843] rounded-full" />
                  </div>
                  <p className="text-[#F3EEE3]/90">
                    Users with poor trust scores are automatically restricted from joining premium or high-value groups.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Regulatory & Licensing Framework Card */}
        <div className="mt-12 bg-white p-8 md:p-12 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)] relative overflow-hidden">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0B3022] flex items-center justify-center text-[#D4A843] shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#D4A843]">
                Platform Disclosure &amp; Operational Architecture
              </span>
              <h3 className="text-2xl font-bold text-[#0B3022] tracking-tight">Payment Infrastructure &amp; Open Banking Rails</h3>
            </div>
          </div>

          <p className="text-[#0B3022]/80 leading-relaxed text-base mb-6">
            <strong>Platform Disclosure:</strong> Àjọṣe is a financial technology platform, not a bank. Contributions are collected automatically by bank debit through Mono on the contribution date. Once NIBSS settles the funds into Àjọṣe&apos;s wallet, the payout is credited automatically to the member whose turn it is. Àjọṣe doesn&apos;t hold onto group funds.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#0B3022]/10 text-xs font-mono">
            {[
              "Mono Direct Debit",
              "NIBSS Settlement",
              "Automated Payouts",
              "Transparent Ledger",
            ].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEE3] text-[#0B3022] border border-[#0B3022]/15 font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
                {badge}
              </span>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
