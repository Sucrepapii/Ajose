import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-2xl mx-auto">
            Ajo Circle is completely free for group members. We only charge a small flat fee to the group administrator upon successful payouts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Member Plan */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-[#0B3022] mb-2">Group Members</h3>
            <div className="text-4xl font-bold text-[#C5A059] mb-6">Free</div>
            <p className="text-[#1F2937]/80 mb-8 flex-1">
              Join an existing Ajo group, make contributions, and receive your payouts without any hidden fees.
            </p>
            <ul className="space-y-4 mb-8">
              {['Join unlimited groups', 'Automated reminders', 'Real-time ledger access', 'Secure payouts directly to bank'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#0B3022]" />
                  <span className="text-[#1F2937]">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="w-full py-4 px-4 bg-[#FDFBF7] border-2 border-[#0B3022] hover:bg-[#F4F1EA] text-[#0B3022] font-bold text-center rounded-lg transition-colors">
              Join a Group
            </Link>
          </div>

          {/* Admin Plan */}
          <div className="bg-[#0B3022] p-8 md:p-12 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-[30px]" />
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Group Admins</h3>
            <div className="text-4xl font-bold text-[#C5A059] mb-6 relative z-10">1.5% <span className="text-xl text-gray-300 font-normal">/ payout</span></div>
            <p className="text-gray-300 mb-8 flex-1 relative z-10">
              Create and manage ROSCA groups with institutional-grade tools and zero manual tracking.
            </p>
            <ul className="space-y-4 mb-8 relative z-10">
              {['Automated turn scheduling', 'Default risk management', 'One-click payouts', 'Group performance analytics'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
                  <span className="text-gray-100">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="w-full py-4 px-4 bg-[#C5A059] hover:bg-[#A48243] text-[#0B3022] font-bold text-center rounded-lg transition-colors relative z-10 shadow-lg">
              Create a Group Free
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
