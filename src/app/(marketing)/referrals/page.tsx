import Link from "next/link";
import { 
  Sparkles, 
  TrendingDown, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Gift, 
  Coins, 
  Share2, 
  Check, 
  HelpCircle,
  Award
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer Friends, Slash Your Fee | Àjọṣe Referral Program",
  description: "Turn by turn, no wahala. Refer verified friends to Àjọṣe and reduce your monthly platform fee from 2.0% down to 0.5%.",
  alternates: {
    canonical: "/referrals",
  },
};

export default function ReferralsMarketingPage() {
  const tiers = [
    {
      name: "Standard",
      referrals: "0 – 4 friends",
      fee: "2.0%",
      discount: "Baseline rate",
      badge: "Member",
      highlight: false,
      desc: "Default starting tier for all verified circle members."
    },
    {
      name: "Advocate",
      referrals: "5 – 9 friends",
      fee: "1.8%",
      discount: "10% Fee Discount",
      badge: "Advocate",
      highlight: false,
      desc: "Your first milestone as you introduce close friends and colleagues."
    },
    {
      name: "Champion",
      referrals: "10 – 19 friends",
      fee: "1.5%",
      discount: "25% Fee Discount",
      badge: "Champion",
      highlight: true,
      desc: "Quarter of your fees eliminated. Great for small community trustees."
    },
    {
      name: "Ambassador",
      referrals: "20 – 39 friends",
      fee: "1.0%",
      discount: "50% Fee Discount",
      badge: "Ambassador",
      highlight: false,
      desc: "Half off platform fees. Ideal for multi-group circle coordinators."
    },
    {
      name: "Legend",
      referrals: "40+ friends",
      fee: "0.5%",
      discount: "75% Fee Discount",
      badge: "Legend VIP",
      highlight: false,
      desc: "The absolute lowest fee floor across the entire platform."
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Share Your Link or Code",
      desc: "Copy your personalized invite link or code from your Àjọṣe dashboard and send via WhatsApp, Instagram, or SMS."
    },
    {
      number: "02",
      title: "Friend Joins & Verifies BVN",
      desc: "Your friend signs up and securely establishes an authorized direct-debit mandate via Mono for automated turn savings."
    },
    {
      number: "03",
      title: "Active Circle Participation",
      desc: "Friend joins or starts their first Ajo circle and makes their scheduled auto-debit contribution."
    },
    {
      number: "04",
      title: "Automatic Fee Reduction",
      desc: "Your account automatically climbs to the next fee tier. Enjoy lower deductions on every cycle payout turn."
    }
  ];

  const faqs = [
    {
      q: "How does the referral discount apply to my circles?",
      a: "When your referred friends become active, your custom platform fee percentage drops automatically. On monthly circles, your payout deduction drops from 2.0% to as low as 0.5%."
    },
    {
      q: "What qualifies a friend as an 'Active' referral?",
      a: "To ensure real savings circles without spam or fake accounts, a friend counts as active once they sign up, verify their BVN, join a circle, and complete their first auto-debit contribution."
    },
    {
      q: "Can circle organizers use their referral code for members?",
      a: "Yes! If you start a group and invite your members using your referral code, all eligible members count toward your active referrals, helping you slash your organizer fees."
    },
    {
      q: "Where do I track my referral progress?",
      a: "Logged in members have a dedicated 'Refer & Earn' page in their dashboard showing their active count, pending friends, progress bar, and copyable share kit."
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-20 md:py-28">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#0B3022]/5 rounded-full blur-[110px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 max-w-6xl relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/10 border border-[#0B3022]/15 text-[#0B3022] text-xs font-bold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            Àjọṣe Referral Tier Program
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0B3022] mb-6 font-serif">
            Refer Friends, <span className="text-[#C5A059]">Slash Your Fees</span>
          </h1>
          <p className="text-lg md:text-xl text-[#1F2937]/80 leading-relaxed font-medium mb-8">
            Turn by turn, no wahala. Bring friends, family, and colleagues to automated Ajo savings. 
            Reduce your monthly platform fee from <strong className="text-[#0B3022]">2.0%</strong> down to <strong className="text-[#0B3022]">0.5%</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0B3022] hover:bg-[#134934] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Start Referring Today</span>
              <ArrowRight className="w-4 h-4 text-[#C5A059]" />
            </Link>
            <Link
              href="/dashboard/referrals"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-gray-300 hover:border-[#C5A059] bg-white text-[#0B3022] font-bold text-sm shadow-xs transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4 text-[#C5A059]" />
              <span>Open Member Dashboard</span>
            </Link>
          </div>
        </div>

        {/* 5 Tiers Grid */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B3022] font-serif mb-2">
              Transparent Tiered Discounts
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              Every verified active referral moves you closer to the lowest fee rate in Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tiers.map((t) => (
              <div 
                key={t.name}
                className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 relative ${
                  t.highlight 
                    ? "bg-[#0B3022] text-white border-[#C5A059] shadow-xl ring-2 ring-[#C5A059]/40 scale-105 z-10" 
                    : "bg-white text-[#1F2937] border-gray-200/90 shadow-md hover:shadow-lg hover:border-gray-300"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C5A059] text-[#0B3022] font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    Popular Milestone
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-black uppercase tracking-wider ${t.highlight ? "text-[#C5A059]" : "text-[#0B3022]"}`}>
                      {t.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.highlight ? "bg-white/10 text-gray-200" : "bg-gray-100 text-gray-600"
                    }`}>
                      {t.referrals}
                    </span>
                  </div>

                  <div className="my-3">
                    <div className={`text-4xl font-black tracking-tight ${t.highlight ? "text-white" : "text-[#0B3022]"}`}>
                      {t.fee}
                    </div>
                    <span className={`text-xs font-semibold ${t.highlight ? "text-gray-300" : "text-gray-500"}`}>
                      monthly platform fee
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed mb-6 font-medium ${t.highlight ? "text-gray-300" : "text-gray-600"}`}>
                    {t.desc}
                  </p>
                </div>

                <div className={`pt-4 border-t text-xs font-bold ${
                  t.highlight ? "border-white/10 text-[#C5A059]" : "border-gray-100 text-emerald-700"
                }`}>
                  {t.discount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Savings Comparison Box */}
        <div className="bg-gradient-to-br from-[#0B3022] to-[#061A12] text-white rounded-3xl p-8 md:p-12 border border-[#C5A059]/30 shadow-2xl mb-20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 uppercase tracking-wider mb-4">
                <Coins className="w-3.5 h-3.5" />
                <span>Tangible Take-Home Savings</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black font-serif mb-4 leading-tight">
                How Much More Money Stays In Your Pocket?
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                On an active monthly circle payout of ₦200,000, your platform deduction drops from ₦4,000 to just ₦1,000 once you reach the Legend tier.
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Automated calculations
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Never expires while friends save
                </span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-gray-400 font-medium">Standard Fee (2.0%)</span>
                  <span className="font-bold text-gray-300 line-through">₦4,000 / payout</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[#C5A059] font-bold">Legend Tier Fee (0.5%)</span>
                  <span className="font-black text-emerald-400 text-lg">₦1,000 / payout</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-white font-bold">Your Direct Savings</span>
                  <span className="font-black text-[#C5A059] text-xl">₦3,000 saved per turn</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B3022] font-serif mb-2">
              How the Referral Journey Works
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              4 straightforward steps to verified savings and lower fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs relative">
                <div className="text-3xl font-black text-[#C5A059]/40 font-mono mb-3">
                  {step.number}
                </div>
                <h4 className="font-bold text-base text-[#0B3022] mb-2">{step.title}</h4>
                <p className="text-xs text-[#1F2937]/70 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-Gaming Trust Section */}
        <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-3xl p-8 mb-20">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0B3022] flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-2">
                Built on Trust: Why We Enforce Real Circle Activity
              </h3>
              <p className="text-sm text-[#1F2937]/80 leading-relaxed mb-4">
                Unlike platforms with fake bots or phantom referral codes, Àjọṣe only counts referrals who verify their bank BVN and participate in savings circles. This ensures that every member in our community is real, verified, and committed to turn-by-turn financial discipline.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-[#0B3022]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prevents automated referral gaming</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Guarantees safety for all circle members</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mb-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B3022] font-serif mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              Everything you need to know about Àjọṣe referral tiers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
                <h4 className="font-bold text-base text-[#0B3022] mb-2">{faq.q}</h4>
                <p className="text-sm text-[#1F2937]/80 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-[#0B3022] text-white rounded-3xl p-8 md:p-12 text-center border border-[#C5A059]/30 shadow-xl relative overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-96 bg-[#C5A059]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-extrabold font-serif mb-4">
              Ready to Slash Your Platform Fee?
            </h3>
            <p className="text-gray-300 text-sm md:text-base font-medium mb-8">
              Sign up today, invite your circle members, and enjoy automatic fee reductions down to 0.5%.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C5A059] hover:bg-[#d8b56f] text-[#0B3022] font-black text-sm rounded-xl shadow-lg transition-all hover:scale-105"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-all"
              >
                Sign In to View Your Code
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
