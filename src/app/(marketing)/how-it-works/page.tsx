import { UserPlus, Shield, Users, ArrowRightLeft, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Àjọṣe",
  description: "Learn how to use Àjọṣe to create, join, and manage your cooperative rotational contribution groups with complete transparency and security.",
  alternates: {
    canonical: "/how-it-works",
  },
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      icon: <UserPlus className="h-5 w-5 text-[#D4A843]" />,
      title: "Create an Account",
      description: "Sign up and create your secure Àjọṣe profile in less than 2 minutes.",
      align: "right"
    },
    {
      num: "02",
      icon: <Shield className="h-5 w-5 text-[#D4A843]" />,
      title: "Verify Identity (BVN)",
      description: "We use Mono to securely verify your Bank Verification Number. This ensures everyone on the platform is a real, verified individual, protecting the pool from defaults.",
      align: "left"
    },
    {
      num: "03",
      icon: <Users className="h-5 w-5 text-[#D4A843]" />,
      title: "Join or Create a Group",
      description: "Start your own 'Ajo' as an Admin and invite trusted friends, or join a group that matches your contribution target. Groups only start when fully filled.",
      align: "right"
    },
    {
      num: "04",
      icon: <ArrowRightLeft className="h-5 w-5 text-[#D4A843]" />,
      title: "Automate Contributions",
      description: "Set up a secure direct debit mandate. When it's time to contribute, the funds are automatically swept from your account into the secure Ajo pool.",
      align: "left"
    },
    {
      num: "05",
      icon: <CheckCircle2 className="h-5 w-5 text-[#D4A843]" />,
      title: "Get Paid on Your Turn",
      description: "When it's your turn in the cycle, the entire pool is automatically disbursed directly to your verified bank account. No delays, no excuses.",
      align: "right"
    }
  ];

  return (
    <main className="flex-1 bg-[#F3EEE3]">
      {/* Hero Section */}
      <section className="py-24 lg:py-32 bg-[#0B3022] relative overflow-hidden border-b border-[#F3EEE3]/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4A843]/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EEE3]/[0.06] border border-[#F3EEE3]/15 text-[#F3EEE3] text-[11px] font-mono uppercase tracking-[0.16em] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            Step-by-Step Guide
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#F3EEE3] mb-6 tracking-[-0.03em] leading-[1.06]">
            How Àjọṣe{" "}
            <span className="font-editorial italic font-normal text-[#D4A843]">works.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#F3EEE3]/70 max-w-2xl mx-auto leading-relaxed">
            We&apos;ve digitized the traditional African Ajo rotational contribution model, adding bank-grade security and complete automation.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-5xl relative">
          
          {/* Central Line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-[#0B3022]/15 -translate-x-1/2" />

          <div className="space-y-12 md:space-y-20 relative">
            {steps.map((step, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row items-start md:items-center ${step.align === 'left' ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Timeline Dot */}
                <div className="absolute left-[28px] md:left-1/2 w-14 h-14 bg-[#0B3022] rounded-full flex items-center justify-center -translate-x-1/2 border-4 border-[#F3EEE3] shadow-md z-10">
                  {step.icon}
                </div>

                {/* Content Box */}
                <div className={` pl-20 md:pl-0 w-full md:w-1/2 ${step.align === 'left' ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                  <div className="bg-white p-8 rounded-3xl border border-[#0B3022]/10 shadow-[0_12px_32px_rgba(11,48,34,0.04)] hover:border-[#D4A843]/60 transition-all relative group">
                    <span className="inline-block font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#D4A843] mb-2">
                      Step {step.num}
                    </span>
                    <h3 className="text-2xl font-bold text-[#0B3022] mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-[#0B3022]/75 text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#0B3022] hover:bg-[#124532] text-[#F3EEE3] font-bold text-sm transition-all shadow-lg"
            >
              <span>Create Your Circle</span>
              <ArrowRight className="w-4 h-4 text-[#D4A843]" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
