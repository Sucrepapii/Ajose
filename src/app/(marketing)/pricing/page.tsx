import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Ajo Circle",
  description: "Simple, transparent pricing. Ajo Circle is free for group members with a small platform fee for administrators.",
};

export default function PricingPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0B3022]/5 rounded-full blur-[100px] -translate-y-1/2"></div>

      <div className="container mx-auto px-6 lg:px-12 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0B3022] mb-6 font-serif">
            Simple, Transparent <span className="text-[#C5A059]">Pricing</span>
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-2xl mx-auto font-medium">
            Ajo Circle is completely free for group members. We only charge a small flat fee to the group administrator upon successful payouts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Member Plan */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl flex flex-col hover:shadow-2xl transition-shadow">
            <h3 className="text-2xl font-black text-[#0B3022] mb-2">Group Members</h3>
            <div className="text-5xl font-black text-[#C5A059] mb-6">Free</div>
            <p className="text-[#1F2937]/80 mb-8 flex-1 font-medium">
              Join an existing Ajo group, make contributions, and receive your payouts without any hidden fees.
            </p>
            <ul className="space-y-5 mb-10">
              {['Join unlimited groups', 'Automated reminders', 'Real-time ledger access', 'Secure payouts directly to bank'].map((feature, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="bg-[#0B3022]/10 rounded-full p-1">
                    <CheckCircle2 className="w-5 h-5 text-[#0B3022]" />
                  </div>
                  <span className="text-[#1F2937] font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="w-full py-4 px-4 bg-white border-2 border-[#0B3022] hover:bg-[#0B3022] hover:text-[#C5A059] text-[#0B3022] font-black text-center rounded-xl transition-colors shadow-sm">
              Join a Group
            </Link>
          </div>

          {/* Admin Plan */}
          <div className="bg-[#0B3022] p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden hover:shadow-[0_20px_50px_rgba(11,48,34,0.3)] transition-shadow">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#C5A059]/20 rounded-full blur-[50px]" />
            <h3 className="text-2xl font-black text-white mb-2 relative z-10">Group Admins</h3>
            <div className="text-5xl font-black text-[#C5A059] mb-6 relative z-10">2% <span className="text-xl text-white/50 font-medium">/ payout</span></div>
            <p className="text-white/80 mb-8 flex-1 relative z-10 font-medium">
              Create and manage ROSCA groups with institutional-grade tools and zero manual tracking.
            </p>
            <ul className="space-y-5 mb-10 relative z-10">
              {['Automated turn scheduling', 'Default risk management', 'One-click payouts', 'Group performance analytics'].map((feature, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="bg-[#C5A059]/20 rounded-full p-1">
                    <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <span className="text-white font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="w-full py-4 px-4 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-black text-center rounded-xl transition-colors relative z-10 shadow-lg">
              Create a Group Free
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
