import Link from "next/link";
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Gift, 
  Coins, 
  Check
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
      referrals: "40+ active friends",
      fee: "0.5%",
      discount: "Up to 75% Off",
      badge: "Legend VIP",
      highlight: false,
      desc: "Our top-tier rate with as low as 0.5% platform fee."
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
      desc: "Your friend signs up and securely completes their BVN identity verification on Àjọṣe."
    },
    {
      number: "03",
      title: "Joins Circle & First Debit",
      desc: "A friend counts as active once they join a savings circle and successfully complete their first scheduled contribution debit."
    },
    {
      number: "04",
      title: "Automatic Fee Reduction",
      desc: "Your account automatically climbs to the next fee tier. Enjoy reduced fees on your scheduled contribution debits."
    }
  ];

  const faqs = [
    {
      q: "How does the referral discount apply to my circles?",
      a: "When your referred friends become active, your custom platform fee percentage drops automatically. On monthly circles, your contribution debit fee drops from standard 2.0% down to as low as 0.5% (up to 75% off), while payouts remain 100% complete with 0% deducted."
    },
    {
      q: "What qualifies a friend as an 'Active' referral?",
      a: "To ensure real savings circles without spam or fake accounts, a friend counts as an active referral only after three milestones: (1) completing BVN verification, (2) joining a savings circle, and (3) completing their first scheduled contribution debit."
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
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#F3EEE3] py-20 md:py-28">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 text-[#0B3022] text-[11px] font-mono font-bold uppercase tracking-[0.16em] mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
            Àjọṣe Referral Tier Program
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-[#0B3022] mb-6 leading-[1.06]">
            Refer friends,{" "}
            <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-8">
              slash your fees.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#0B3022]/75 leading-relaxed mb-8">
            Turn by turn, no wahala. Bring friends, family, and colleagues to automated Ajo savings. 
            Reduce your monthly contribution fee from <strong className="text-[#0B3022]">2.0%</strong> down to <strong className="text-[#0B3022]">as low as 0.5%</strong> (up to 75% off).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0B3022] hover:bg-[#134934] text-[#F3EEE3] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Start Referring Today</span>
              <ArrowRight className="w-4 h-4 text-[#D4A843]" />
            </Link>
            <Link
              href="/dashboard/referrals"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#0B3022]/20 hover:border-[#D4A843] bg-white text-[#0B3022] font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4 text-[#D4A843]" />
              <span>Open Member Dashboard</span>
            </Link>
          </div>
        </div>

        {/* 5 Tiers Grid */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-[#0B3022] tracking-tight mb-2">
              Transparent tiered{" "}
              <span className="font-editorial italic font-normal">discounts.</span>
            </h2>
            <p className="text-sm text-[#0B3022]/65 font-medium">
              Every verified active referral moves you closer to our lowest 0.5% fee tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tiers.map((t) => (
              <div 
                key={t.name}
                className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 relative ${
                  t.highlight 
                    ? "bg-[#0B3022] text-[#F3EEE3] border-[#D4A843] shadow-xl ring-2 ring-[#D4A843]/40 scale-105 z-10" 
                    : "bg-white text-[#0B3022] border-[#0B3022]/10 shadow-sm hover:border-[#D4A843]/50"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4A843] text-[#0B3022] font-mono font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    Popular Milestone
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${t.highlight ? "text-[#D4A843]" : "text-[#0B3022]"}`}>
                      {t.name}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      t.highlight ? "bg-[#F3EEE3]/10 text-[#F3EEE3]" : "bg-[#F3EEE3] text-[#0B3022]/75"
                    }`}>
                      {t.referrals}
                    </span>
                  </div>

                  <div className="my-3">
                    <div className={`text-4xl font-bold font-mono tracking-tight ${t.highlight ? "text-[#F3EEE3]" : "text-[#0B3022]"}`}>
                      {t.fee}
                    </div>
                    <span className={`text-xs font-medium ${t.highlight ? "text-[#F3EEE3]/65" : "text-[#0B3022]/55"}`}>
                      monthly platform fee
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed mb-6 ${t.highlight ? "text-[#F3EEE3]/75" : "text-[#0B3022]/70"}`}>
                    {t.desc}
                  </p>
                </div>

                <div className={`pt-4 border-t text-xs font-mono font-bold ${
                  t.highlight ? "border-[#F3EEE3]/10 text-[#D4A843]" : "border-[#0B3022]/10 text-[#0B3022]"
                }`}>
                  {t.discount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Savings Comparison Box */}
        <div className="bg-[#0B3022] text-[#F3EEE3] rounded-3xl p-8 md:p-12 border border-[#F3EEE3]/10 shadow-2xl mb-20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#D4A843]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/35 uppercase tracking-[0.14em] mb-4">
                <Coins className="w-3.5 h-3.5" />
                <span>Tangible Debit Savings</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
                How much more money stays in your{" "}
                <span className="font-editorial italic font-normal text-[#D4A843]">pocket?</span>
              </h3>
              <p className="text-[#F3EEE3]/75 text-sm leading-relaxed mb-6">
                On an active monthly circle contribution of ₦200,000, your platform fee drops from ₦4,000 to just ₦1,000 per debit once you reach the Legend tier.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#F3EEE3]/80">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#D4A843]" /> Automated calculations
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#D4A843]" /> Never expires while friends save
                </span>
              </div>
            </div>

            <div className="bg-[#F3EEE3]/[0.05] border border-[#F3EEE3]/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#F3EEE3]/10">
                  <span className="text-[#F3EEE3]/60 font-medium">Standard Fee (2.0%)</span>
                  <span className="font-mono font-bold text-[#F3EEE3]/50 line-through">₦4,000 / debit</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F3EEE3]/10">
                  <span className="text-[#D4A843] font-bold">Legend Tier Fee (0.5%)</span>
                  <span className="font-mono font-bold text-[#F3EEE3] text-lg">₦1,000 / debit</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#F3EEE3] font-bold">Your Direct Savings</span>
                  <span className="font-mono font-bold text-[#D4A843] text-xl">₦3,000 saved / debit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-[#0B3022] tracking-tight mb-2">
              How the referral journey{" "}
              <span className="font-editorial italic font-normal">works.</span>
            </h2>
            <p className="text-sm text-[#0B3022]/65 font-medium">
              4 straightforward steps to verified savings and lower fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white border border-[#0B3022]/10 rounded-3xl p-6 shadow-xs relative">
                <div className="text-3xl font-bold text-[#D4A843] font-mono mb-3">
                  {step.number}
                </div>
                <h4 className="font-bold text-base text-[#0B3022] mb-2">{step.title}</h4>
                <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-Gaming Trust Section */}
        <div className="bg-white border border-[#0B3022]/10 rounded-3xl p-8 mb-20">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0B3022] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#D4A843]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-2">
                Built on Trust: Why We Enforce Real Circle Activity
              </h3>
              <p className="text-sm text-[#0B3022]/75 leading-relaxed mb-4">
                Unlike platforms with fake bots or phantom referral codes, Àjọṣe only counts referrals who verify their bank BVN and participate in savings circles. This ensures that every member in our community is real, verified, and committed to turn-by-turn financial discipline.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-[#0B3022]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A843] shrink-0" />
                  <span>Prevents automated referral gaming</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A843] shrink-0" />
                  <span>Guarantees safety for all circle members</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mb-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-[#0B3022] tracking-tight mb-2">
              Frequently asked{" "}
              <span className="font-editorial italic font-normal">questions.</span>
            </h2>
            <p className="text-sm text-[#0B3022]/65 font-medium">
              Everything you need to know about Àjọṣe referral tiers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-[#0B3022]/10 rounded-2xl p-6">
                <h4 className="font-bold text-base text-[#0B3022] mb-2">{faq.q}</h4>
                <p className="text-sm text-[#0B3022]/75 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-[#0B3022] text-[#F3EEE3] rounded-3xl p-8 md:p-12 text-center border border-[#F3EEE3]/10 shadow-xl relative overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-96 bg-[#D4A843]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to slash your{" "}
              <span className="font-editorial italic font-normal text-[#D4A843]">platform fee?</span>
            </h3>
            <p className="text-[#F3EEE3]/75 text-sm md:text-base mb-8">
              Sign up today, invite your circle members, and enjoy automatic fee reductions down to 0.5%.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#D4A843] hover:bg-[#dfba59] text-[#0B3022] font-bold text-sm rounded-full shadow-lg transition-all"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#F3EEE3]/[0.08] hover:bg-[#F3EEE3]/15 text-[#F3EEE3] font-bold text-sm rounded-full border border-[#F3EEE3]/20 transition-all"
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
