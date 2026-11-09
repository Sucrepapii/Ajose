import { ShieldCheck, Zap, Repeat, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | Àjọṣe",
  description: "Discover the powerful features of Àjọṣe that make rotational contributions secure, automated, and effortless.",
  alternates: {
    canonical: "/features",
  },
};

export default function FeaturesPage() {
  return (
    <main className="flex-1 bg-[#F3EEE3]">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-[#0B3022] border-b border-[#F3EEE3]/10">
        <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-[#D4A843]/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 text-[#F3EEE3] text-[11px] font-mono uppercase tracking-[0.16em] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            Platform Capabilities
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#F3EEE3] mb-6 tracking-[-0.03em] leading-[1.05]">
            Built for{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">trust.</span>{" "}
            <br className="hidden sm:block" />
            Engineered for{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">scale.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#F3EEE3]/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Àjọṣe combines bank-grade open finance integrations with intuitive tools to completely automate and secure your Ajo contribution groups.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#F3EEE3]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 lg:p-11 border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)] hover:border-[#D4A843]/50 transition-all group">
              <div className="w-14 h-14 bg-[#0B3022] rounded-2xl flex items-center justify-center mb-7">
                <ShieldCheck className="h-7 w-7 text-[#D4A843]" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#D4A843] font-bold block mb-2">
                01 / Identity Lock
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold text-[#0B3022] mb-3 tracking-tight">
                Identity &amp; BVN Verification
              </h3>
              <p className="text-[#0B3022]/75 text-base leading-relaxed">
                Every member must pass a strict BVN verification process through our open-banking partners. Eliminate anonymous defaults and ensure you know exactly who is in your pool.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0B3022] rounded-3xl p-8 lg:p-11 border border-[#0B3022] shadow-[0_18px_40px_rgba(11,48,34,0.14)] transition-all group">
              <div className="w-14 h-14 bg-[#D4A843]/15 rounded-2xl flex items-center justify-center mb-7 border border-[#D4A843]/30">
                <Zap className="h-7 w-7 text-[#D4A843]" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#D4A843] font-bold block mb-2">
                02 / Automated Collection
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold text-[#F3EEE3] mb-3 tracking-tight">
                Direct Debit Auto-Sweep
              </h3>
              <p className="text-[#F3EEE3]/75 text-base leading-relaxed">
                No more chasing members for payments. Upon joining, members establish a direct debit mandate. Contributions are automatically swept from their linked bank accounts precisely when due.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0B3022] rounded-3xl p-8 lg:p-11 border border-[#0B3022] shadow-[0_18px_40px_rgba(11,48,34,0.14)] transition-all group">
              <div className="w-14 h-14 bg-[#D4A843]/15 rounded-2xl flex items-center justify-center mb-7 border border-[#D4A843]/30">
                <Repeat className="h-7 w-7 text-[#D4A843]" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#D4A843] font-bold block mb-2">
                03 / Reputation Ledger
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold text-[#F3EEE3] mb-3 tracking-tight">
                Àjọṣe Trust Score
              </h3>
              <p className="text-[#F3EEE3]/75 text-base leading-relaxed">
                We track every successful payment and default across the platform to generate a verifiable financial reputation score. Admins can restrict their groups to only allow members with high trust scores.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-8 lg:p-11 border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)] hover:border-[#D4A843]/50 transition-all group">
              <div className="w-14 h-14 bg-[#0B3022] rounded-2xl flex items-center justify-center mb-7">
                <MessageCircle className="h-7 w-7 text-[#D4A843]" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#D4A843] font-bold block mb-2">
                04 / Real-Time Alerts
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold text-[#0B3022] mb-3 tracking-tight">
                WhatsApp Integration
              </h3>
              <p className="text-[#0B3022]/75 text-base leading-relaxed">
                Receive instant notifications for payouts, upcoming debits, and group updates directly on WhatsApp. Keep your group engaged without requiring them to check the app daily.
              </p>
            </div>

          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm transition-all shadow-[0_12px_30px_rgba(212,168,67,0.25)]"
            >
              <span>Start Your Circle Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
