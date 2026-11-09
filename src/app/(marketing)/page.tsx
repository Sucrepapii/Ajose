"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ShieldCheck,
  Rocket,
  Lock,
  ArrowRight,
  Zap,
  Users,
  CheckSquare,
  CreditCard,
  Landmark,
  Activity,
  Check,
  ShieldAlert,
  Smartphone,
  LayoutDashboard,
  History,
  Building2,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import { CountryFlag } from "@/components/CountryFlag";
import { InteractiveRevenueCalculator } from "@/components/InteractiveRevenueCalculator";
import { MobileAppShowcase } from "@/components/MobileAppShowcase";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function Home() {
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [activeShowcase, setActiveShowcase] = useState(0);

  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#F3EEE3] text-[#111613]">
      {/* Hero Section — Deep Forest (#0B3022), Warm Cream (#F3EEE3), Burnished Gold (#D4A843) */}
      <section className="w-full bg-[#0B3022] pt-16 pb-20 md:pt-24 md:pb-28 relative z-10 overflow-hidden border-b border-white/10">
        {/* Subtle Architectural Grid & Ambient Glow */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #F3EEE3 1px, transparent 1px), linear-gradient(to bottom, #F3EEE3 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-[-15%] right-[-5%] w-[560px] h-[560px] bg-[#D4A843]/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[10%] w-[440px] h-[440px] bg-emerald-400/5 blur-[130px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-12 items-center">
            {/* Left Column: Editorial Headline + Pill CTAs */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 z-20"
            >
              {/* Sleek Editorial Announcement Pill (Volta / Tab style) */}
              <motion.div
                variants={fadeIn}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md mb-8"
              >
                <span className="px-2 py-0.5 rounded-full bg-[#D4A843] text-[#0B3022] text-[10px] font-black uppercase tracking-wider">
                  New
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#F3EEE3]/90 tracking-tight">
                  Turn by turn, no wahala — Automated Ajo for Home &amp; Diaspora
                </span>
              </motion.div>

              {/* Mixed Sans + Italic Editorial Serif Headline with Gold Underline Swoop */}
              <motion.h1
                variants={fadeIn}
                className="text-4xl sm:text-6xl lg:text-[4.35rem] font-bold tracking-[-0.03em] text-[#F3EEE3] mb-6 leading-[1.06]"
              >
                Run your Ajo{" "}
                <span className="block mt-1">
                  without{" "}
                  <span className="relative inline-block font-editorial italic font-normal text-white pr-1">
                    the chasing.
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3 text-[#D4A843]"
                      viewBox="0 0 240 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 10.5C62 3.5 154 2.5 237 8.5"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-base sm:text-lg md:text-xl text-[#F3EEE3]/75 mb-9 leading-relaxed max-w-xl font-normal"
              >
                Automated bank debits collect every member&rsquo;s contribution on schedule, while a shared live ledger tracks every turn — no excuses, no awkward reminders.
              </motion.p>

              {/* High-Contrast Pill CTAs */}
              <motion.div
                variants={fadeIn}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              >
                <Link
                  href="/signup"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-[#D4A843] px-8 text-base font-bold text-[#0B3022] shadow-[0_8px_30px_rgba(212,168,67,0.3)] hover:bg-[#e0b654] hover:scale-[1.02] active:scale-95 transition-all gap-2.5"
                >
                  <span>Start an Ajo Circle</span>
                  <ArrowRight className="w-4 h-4 text-[#0B3022]" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-[#F3EEE3]/20 bg-white/[0.04] hover:bg-white/[0.09] px-7 text-sm font-semibold text-[#F3EEE3] transition-all gap-2 backdrop-blur-sm"
                >
                  <span>Have an invite code? Join circle &rarr;</span>
                </Link>
              </motion.div>

              {/* Restrained Trust Microcopy */}
              <motion.div
                variants={fadeIn}
                className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#F3EEE3]/65 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
                  Free to start
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
                  2-minute setup
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
                  Powered by Mono Open Banking
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: 3-Plane Layered Product Collage (Mesa / Tab style) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 relative w-full z-20 pt-4 pb-6 sm:px-4"
            >
              {/* Plane 1: Offset Burnished Gold Architectural Frame */}
              <div className="absolute inset-x-4 sm:inset-x-8 top-8 bottom-2 rounded-3xl border-2 border-[#D4A843]/45 bg-[#071F16]/60 translate-x-3 translate-y-3 pointer-events-none" />

              {/* Plane 3A (Top-Right Floating Overlapping Card — Mesa "While you slept" style) */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="hidden sm:block absolute -top-3 -right-2 z-30 w-64 rounded-2xl bg-[#111613] text-[#F3EEE3] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-white/10"
              >
                <div className="flex items-center justify-between text-[11px] text-[#F3EEE3]/60 font-mono pb-2.5 mb-2.5 border-b border-white/10">
                  <span className="font-semibold text-[#F3EEE3]">Morning Auto-Sweep</span>
                  <span className="text-[#D4A843]">06:02 AM</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#F3EEE3]/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                      Sarah J. debited
                    </span>
                    <span className="font-mono font-semibold text-[#F3EEE3]">₦100k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#F3EEE3]/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                      Michael O. debited
                    </span>
                    <span className="font-mono font-semibold text-[#F3EEE3]">₦100k</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <span className="text-[11px] text-[#D4A843] font-medium">12/12 turns funded</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D4A843]/15 text-[#D4A843]">
                      Complete
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Plane 2: Main Warm Cream Editorial Product Card (No fake macOS dots) */}
              <div className="relative z-20 bg-[#F3EEE3] text-[#111613] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.4)] border border-[#111613]/10 flex flex-col gap-5">
                {/* Clean Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#111613]/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0B3022]" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#111613]/60 font-semibold">
                        Lagos Tech Founders Circle
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#111613] tracking-tight mt-1">
                      October Payout Cycle
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#111613]/50 block">
                      Total Pool
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#0B3022]">
                      ₦1,200,000
                    </span>
                  </div>
                </div>

                {/* Member Roster Rows */}
                <div className="space-y-2.5">
                  {[
                    {
                      name: "Sarah J.",
                      role: "Turn 01 • Settled",
                      status: "E don pay ✓",
                      amount: "₦100,000",
                      active: false,
                    },
                    {
                      name: "Michael O.",
                      role: "Turn 02 • Settled",
                      status: "E don pay ✓",
                      amount: "₦100,000",
                      active: false,
                    },
                    {
                      name: "David K.",
                      role: "Turn 03 • Current Recipient",
                      status: "Your turn don reach 🎯",
                      amount: "₦1,200,000",
                      active: true,
                    },
                  ].map((member, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        member.active
                          ? "bg-[#0B3022] text-[#F3EEE3] border-[#0B3022] shadow-md"
                          : "bg-[#FAF7F0] text-[#111613] border-[#111613]/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                            member.active
                              ? "bg-[#D4A843] text-[#0B3022]"
                              : "bg-[#0B3022] text-[#F3EEE3]"
                          }`}
                        >
                          {member.name[0]}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold leading-tight ${
                              member.active ? "text-[#F3EEE3]" : "text-[#111613]"
                            }`}
                          >
                            {member.name}
                          </p>
                          <p
                            className={`text-[11px] font-mono mt-0.5 ${
                              member.active ? "text-[#F3EEE3]/70" : "text-[#111613]/55"
                            }`}
                          >
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            member.active
                              ? "bg-[#D4A843] text-[#0B3022]"
                              : "bg-[#0B3022]/10 text-[#0B3022]"
                          }`}
                        >
                          {member.status}
                        </span>
                        <span
                          className={`block text-xs font-mono font-bold mt-1 ${
                            member.active ? "text-[#D4A843]" : "text-[#111613]/70"
                          }`}
                        >
                          {member.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Organizer Earnings Strip inside Card */}
                <div className="rounded-2xl bg-[#EAE3D2] p-4 border border-[#111613]/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111613]">
                        Organizer Commission
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#111613]/10 text-[#111613]/80 font-semibold">
                        Simulation*
                      </span>
                    </div>
                    <p className="text-[11px] text-[#111613]/65 mt-0.5">
                      Across 3 circles at 5% organizer rate
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-[#0B3022]">
                      ₦450,000
                    </span>
                    <span className="block text-[10px] text-[#111613]/55">
                      Auto-settled
                    </span>
                  </div>
                </div>
              </div>

              {/* Plane 3B (Bottom-Left Floating Pill — Tab real-time payout pill style) */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="hidden sm:flex items-center gap-3 absolute -bottom-2 -left-2 z-30 rounded-full bg-[#111613] text-[#F3EEE3] px-4 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-white/10"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4A843] animate-pulse" />
                <span className="text-xs font-medium">
                  <strong className="text-white">Direct NIBSS Payout</strong> &bull; Zero platform custody
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Hairline Editorial Metric Strip (Volta style) */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mt-16 pt-10 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/15 text-[#F3EEE3]"
          >
            {[
              {
                metric: "₦10k – ₦10M+",
                label: "Circle Pool Capacity",
                sub: "From micro-thrift to major capital pools",
              },
              {
                metric: "100%",
                label: "Automated Enforcement",
                sub: "Scheduled direct-debit bank sweeps",
              },
              {
                metric: "T+1",
                label: "Direct Bank Payouts",
                sub: "Àjọṣe never holds onto group funds",
              },
              {
                metric: "Home & Diaspora",
                label: "Cross-Border Ready",
                sub: "Save together across states & borders",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`py-4 sm:py-2 ${
                  idx === 0 ? "sm:pr-6" : "sm:px-6"
                } flex flex-col justify-between`}
              >
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F3EEE3] mb-1">
                  {item.metric}
                </span>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#D4A843]">
                    {item.label}
                  </span>
                  <span className="block text-xs text-[#F3EEE3]/65 mt-0.5 leading-snug">
                    {item.sub}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 2: How Àjọṣe Works — Warm Editorial Cream (#F3EEE3) */}
      <section
        id="how-it-works"
        className="w-full py-24 md:py-32 bg-[#F3EEE3] relative z-10 border-b border-[#111613]/10 overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 max-w-7xl"
        >
          <motion.div
            variants={fadeIn}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3022]/70 block mb-3">
                — The Rotational Protocol
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.025em] text-[#111613] leading-[1.08]">
                Four steps.{" "}
                <span className="font-editorial italic font-normal text-[#0B3022]">
                  Zero wahala.
                </span>
              </h2>
            </div>
            <p className="text-[#111613]/70 max-w-md text-base sm:text-lg leading-relaxed">
              Set the rules once. Àjọṣe handles the verification, morning bank sweeps, and turn-by-turn settlement automatically.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 border-t border-l border-[#111613]/12 bg-[#FAF7F0]">
            {[
              {
                num: "01",
                icon: Users,
                title: "Create Circle",
                desc: "Set your contribution amount, schedule, and invite trusted peers via a private link.",
              },
              {
                num: "02",
                icon: CheckSquare,
                title: "Members Verify",
                desc: "Participants verify their BVN and link their bank mandate. The roster locks when full.",
              },
              {
                num: "03",
                icon: CreditCard,
                title: "Automated Sweep",
                desc: "Direct debits collect every member’s contribution automatically on the due date.",
              },
              {
                num: "04",
                icon: Landmark,
                title: "Turn Payout",
                desc: "Once settled, Mono auto-disburses the pooled pot directly to the turn recipient.",
              },
            ].map((step, i) => (
              <motion.div
                variants={fadeIn}
                key={i}
                className="p-7 sm:p-8 border-r border-b border-[#111613]/12 flex flex-col justify-between group hover:bg-[#0B3022] hover:text-[#F3EEE3] transition-colors duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono font-bold tracking-widest text-[#111613]/45 group-hover:text-[#D4A843] transition-colors">
                      STEP {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#0B3022]/8 group-hover:bg-[#D4A843] flex items-center justify-center transition-colors">
                      <step.icon className="w-4 h-4 text-[#0B3022] group-hover:text-[#0B3022]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#111613] group-hover:text-[#F3EEE3] mb-2.5 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#111613]/70 group-hover:text-[#F3EEE3]/75 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#111613]/10 group-hover:border-white/15 flex items-center justify-between text-[11px] font-mono text-[#111613]/50 group-hover:text-[#D4A843]">
                  <span>Automated</span>
                  <span>&rarr;</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 3: Unified Platform & Trust Showcase */}
      <section
        id="features"
        className="w-full py-24 md:py-32 bg-[#EAE3D2] relative z-10 border-b border-[#111613]/10 overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 max-w-7xl"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column: Engineered for Trust & Transparency */}
            <div className="flex flex-col h-full">
              <motion.div variants={fadeIn} className="mb-8">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3022] block mb-2">
                  — How We Protect Your Circle
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.025em] text-[#111613] mb-4 leading-[1.1]">
                  Engineered for{" "}
                  <span className="font-editorial italic font-normal text-[#0B3022]">
                    trust &amp; transparency.
                  </span>
                </h2>
                <p className="text-[#111613]/75 text-base leading-relaxed">
                  Traditional Ajo discipline wrapped in bank-grade software enforcement. Every naira is accounted for in real time.
                </p>
              </motion.div>

              {/* Pill Segmented Control */}
              <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-full bg-[#F3EEE3] border border-[#111613]/12 mb-6">
                {[
                  { title: "Audited Records", icon: ShieldCheck },
                  { title: "Automated Turns", icon: Rocket },
                  { title: "Admin Control", icon: Lock },
                ].map((feature, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFeatureTab(i)}
                    className={`py-2.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeFeatureTab === i
                        ? "bg-[#0B3022] text-[#F3EEE3] shadow-sm"
                        : "text-[#111613]/65 hover:text-[#111613]"
                    }`}
                  >
                    <feature.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{feature.title}</span>
                  </button>
                ))}
              </div>

              {/* Feature Detail Card */}
              <motion.div variants={fadeIn} className="flex-1">
                <div className="bg-[#F3EEE3] rounded-3xl p-7 md:p-8 border border-[#111613]/12 shadow-sm h-full flex flex-col justify-between relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeatureTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.22 }}
                      className="relative z-10 flex flex-col h-full justify-between"
                    >
                      {[
                        {
                          icon: ShieldCheck,
                          title: "Audited Records",
                          tagline: "Total visibility for every circle member.",
                          points: [
                            "Cryptographically verified contribution logging",
                            "Real-time Open-Banking payment verification",
                            "Exportable, tamper-evident ledger history",
                          ],
                        },
                        {
                          icon: Rocket,
                          title: "Automated Turns",
                          tagline: "Set it up once, let the system run.",
                          points: [
                            "Fair, randomized or custom member sequencing",
                            "Automatic turn assignment & morning sweeps",
                            "Automated reminder alerts & countdown timers",
                          ],
                        },
                        {
                          icon: Lock,
                          title: "Admin Control",
                          tagline: "Total authority to protect the group.",
                          points: [
                            "Enforce circle rules with Trust Score penalties",
                            "Two-way payout confirmation handshake",
                            "Modify active rosters securely before round starts",
                          ],
                        },
                      ]
                        .filter((_, i) => i === activeFeatureTab)
                        .map((content, i) => (
                          <div key={i} className="flex flex-col h-full justify-between gap-6">
                            <div>
                              <div className="w-11 h-11 rounded-2xl bg-[#0B3022] flex items-center justify-center mb-5">
                                <content.icon className="w-5 h-5 text-[#D4A843]" />
                              </div>
                              <h3 className="text-2xl font-bold text-[#111613] mb-1 tracking-tight">
                                {content.title}
                              </h3>
                              <p className="text-sm text-[#111613]/65 font-medium mb-6">
                                {content.tagline}
                              </p>
                              <ul className="space-y-3.5">
                                {content.points.map((point, j) => (
                                  <li
                                    key={j}
                                    className="flex items-center gap-3 text-xs sm:text-sm text-[#111613] font-medium"
                                  >
                                    <div className="shrink-0 w-5 h-5 rounded-full bg-[#0B3022] flex items-center justify-center">
                                      <Check className="w-3 h-3 text-[#D4A843]" />
                                    </div>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-4 border-t border-[#111613]/10 flex items-center justify-between text-xs font-mono text-[#111613]/60">
                              <span>Turn by turn, no wahala.</span>
                              <span className="font-bold text-[#0B3022]">
                                Automated Direct Debit
                              </span>
                            </div>
                          </div>
                        ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Everything in one place */}
            <div className="flex flex-col h-full">
              <motion.div variants={fadeIn} className="mb-8">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3022] block mb-2">
                  — Live Product Telemetry
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.025em] text-[#111613] mb-4 leading-[1.1]">
                  Everything in{" "}
                  <span className="font-editorial italic font-normal text-[#0B3022]">
                    one place.
                  </span>
                </h2>
                <p className="text-[#111613]/75 text-base leading-relaxed">
                  A clean, high-contrast command center to track every member, sweep, and payout turn.
                </p>
              </motion.div>

              {/* Showcase Tab Selectors */}
              <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-full bg-[#F3EEE3] border border-[#111613]/12 mb-6">
                {[
                  { title: "Overview", icon: LayoutDashboard },
                  { title: "Roster", icon: Users },
                  { title: "Ledger", icon: History },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveShowcase(i)}
                    className={`py-2.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeShowcase === i
                        ? "bg-[#0B3022] text-[#F3EEE3] shadow-sm"
                        : "text-[#111613]/65 hover:text-[#111613]"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
              </div>

              {/* Clean Architectural Dark Preview Window (No fake macOS traffic lights) */}
              <motion.div variants={fadeIn} className="flex-1">
                <div className="bg-[#0B3022] rounded-3xl p-6 sm:p-8 shadow-xl relative h-full flex flex-col justify-between overflow-hidden border border-[#111613]/15 text-[#F3EEE3] min-h-[360px]">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#F3EEE3]/70">
                        Live Circle Telemetry
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#F3EEE3]/50">
                      ajose.ng/dashboard
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeShowcase}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.22 }}
                      className="flex-1 flex flex-col justify-center"
                    >
                      {activeShowcase === 0 && (
                        <div className="bg-[#F3EEE3] rounded-2xl p-5 text-[#111613] shadow-lg flex flex-col gap-4">
                          <div className="flex justify-between items-center pb-3 border-b border-[#111613]/10">
                            <div>
                              <h4 className="font-bold text-sm text-[#111613]">
                                Tech Savers Circle
                              </h4>
                              <p className="text-[11px] font-mono text-[#111613]/60">
                                October Round 4 of 10
                              </p>
                            </div>
                            <span className="text-[#0B3022] font-black text-lg font-mono">
                              ₦1,200,000
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#EAE3D2] p-3.5 rounded-xl border border-[#111613]/8">
                              <p className="text-[10px] font-mono text-[#111613]/60 font-bold mb-0.5">
                                TOTAL MEMBERS
                              </p>
                              <p className="text-xl font-black font-mono text-[#111613]">
                                12 Savers
                              </p>
                            </div>
                            <div className="bg-[#0B3022] p-3.5 rounded-xl text-[#F3EEE3]">
                              <p className="text-[10px] font-mono text-[#D4A843] font-bold mb-0.5">
                                NEXT PAYOUT
                              </p>
                              <p className="text-lg font-bold font-mono text-[#F3EEE3]">
                                Oct 15 (₦1.2M)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeShowcase === 1 && (
                        <div className="bg-[#F3EEE3] rounded-2xl p-5 text-[#111613] shadow-lg space-y-2.5">
                          <h4 className="font-bold text-[11px] font-mono uppercase tracking-wider text-[#111613]/60 mb-2">
                            Turn Sequence
                          </h4>
                          {[
                            {
                              name: "Dr. Kunle A.",
                              turn: "Turn 01",
                              status: "Paid Out ✓",
                              active: false,
                            },
                            {
                              name: "Bisi A.",
                              turn: "Turn 02",
                              status: "Paid Out ✓",
                              active: false,
                            },
                            {
                              name: "David K.",
                              turn: "Turn 03 (Current)",
                              status: "Collecting 🎯",
                              active: true,
                            },
                          ].map((m, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                                m.active
                                  ? "bg-[#0B3022] text-[#F3EEE3]"
                                  : "bg-[#EAE3D2] text-[#111613]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-[10px] ${
                                    m.active
                                      ? "bg-[#D4A843] text-[#0B3022]"
                                      : "bg-[#0B3022] text-[#F3EEE3]"
                                  }`}
                                >
                                  {m.name[0]}
                                </div>
                                <span className="font-semibold">{m.name}</span>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                  m.active
                                    ? "bg-[#D4A843] text-[#0B3022]"
                                    : "bg-[#0B3022]/10 text-[#0B3022]"
                                }`}
                              >
                                {m.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeShowcase === 2 && (
                        <div className="bg-[#F3EEE3] rounded-2xl p-5 text-[#111613] shadow-lg space-y-2.5">
                          <h4 className="font-bold text-[11px] font-mono uppercase tracking-wider text-[#111613]/60 mb-2">
                            Real-Time Open Banking Ledger
                          </h4>
                          {[
                            {
                              title: "Direct Debit: Sarah J.",
                              time: "Today, 08:00 AM",
                              amount: "+₦100,000",
                            },
                            {
                              title: "Direct Debit: Michael O.",
                              time: "Today, 08:01 AM",
                              amount: "+₦100,000",
                            },
                            {
                              title: "Auto Payout: David K.",
                              time: "Today, 08:05 AM",
                              amount: "-₦1,000,000",
                            },
                          ].map((t, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 border-b border-[#111613]/10 last:border-0 text-xs"
                            >
                              <div>
                                <p className="font-bold text-[#111613]">{t.title}</p>
                                <p className="text-[10px] font-mono text-[#111613]/50">
                                  {t.time}
                                </p>
                              </div>
                              <span
                                className={`font-mono font-bold ${
                                  t.amount.startsWith("+")
                                    ? "text-[#0B3022]"
                                    : "text-[#111613]"
                                }`}
                              >
                                {t.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#F3EEE3]/65">
                    <span>Live Mono Open Banking Feed</span>
                    <span className="text-[#D4A843] font-bold">Automated Settlement</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 4: Comparison, Pricing & Default Protection — Warm Editorial Cream (#F3EEE3) */}
      <section className="w-full py-24 md:py-32 bg-[#F3EEE3] relative z-10 border-b border-[#111613]/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 max-w-7xl"
        >
          {/* 3-Way Direct Head-to-Head Comparison */}
          <div className="max-w-6xl mx-auto mb-24">
            <motion.div variants={fadeIn} className="text-center mb-14">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3022]/75 block mb-2">
                — Uncompromising Distinction
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.025em] text-[#111613] mb-4 leading-[1.1]">
                Built for circles,{" "}
                <span className="font-editorial italic font-normal text-[#0B3022]">
                  not WhatsApp chaos.
                </span>
              </h2>
              <p className="text-[#111613]/70 text-base md:text-lg max-w-2xl mx-auto">
                Why Nigeria&rsquo;s smartest circles choose automated enforcement over manual WhatsApp reminders or solo-saving apps.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-[#FAF7F0] rounded-3xl shadow-sm border border-[#111613]/15 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[#111613]/12 bg-[#EAE3D2]">
                      <th className="p-5 md:p-6 text-xs font-mono uppercase tracking-wider text-[#111613]/70 w-1/4">
                        Capability
                      </th>
                      <th className="p-5 md:p-6 text-sm font-bold text-[#111613] w-1/4 text-center">
                        <span className="block">WhatsApp Groups</span>
                        <span className="text-[10px] font-mono text-[#111613]/55 font-normal">
                          Manual Peer Thrift
                        </span>
                      </th>
                      <th className="p-5 md:p-6 text-sm font-bold text-[#111613] w-1/4 text-center">
                        <span className="block">Solo Apps</span>
                        <span className="text-[10px] font-mono text-[#111613]/55 font-normal">
                          Isolated Personal Lock
                        </span>
                      </th>
                      <th className="p-5 md:p-6 text-sm font-bold text-[#F3EEE3] w-1/4 text-center bg-[#0B3022]">
                        <span className="block text-[#D4A843]">Àjọṣe Platform</span>
                        <span className="text-[10px] font-mono text-[#F3EEE3]/70 font-normal">
                          Automated Rotational Engine
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111613]/10 text-xs md:text-sm">
                    {[
                      {
                        title: "Rotating Lump-Sum Payout",
                        desc: "Get large capital multiplier on your assigned turn",
                        whatsapp: {
                          text: "High Default Risk",
                          sub: "People vanish after collecting",
                        },
                        fintech: {
                          text: "No (Solo Only)",
                          sub: "Save alone with zero leverage",
                        },
                        ajose: {
                          text: "Mono Auto-Disburse (T+1)",
                          sub: "Scheduled turns with automated payout",
                        },
                      },
                      {
                        title: "Automated Bank Sweeps",
                        desc: "Morning direct-debit on contribution date",
                        whatsapp: {
                          text: "Manual Transfers",
                          sub: "Fake receipt screenshots & drama",
                        },
                        fintech: {
                          text: "Automated Debit",
                          sub: "Debited into company omnibus pool",
                        },
                        ajose: {
                          text: "Mono Direct Debit",
                          sub: "Automated sweeps via NIBSS rail",
                        },
                      },
                      {
                        title: "Defaulter Protection",
                        desc: "Sanctions when a member misses their turn payment",
                        whatsapp: {
                          text: "None (Endless Wahala)",
                          sub: "Damaged relationships & lost money",
                        },
                        fintech: {
                          text: "N/A",
                          sub: "No peer group accountability",
                        },
                        ajose: {
                          text: "Platform Trust Penalty",
                          sub: "Circle suspension & agreed late fee",
                        },
                      },
                      {
                        title: "Fund Custody & Safety",
                        desc: "Where your contributions are held",
                        whatsapp: {
                          text: "Admin Personal Acct",
                          sub: "Risky phone custody with organizer",
                        },
                        fintech: {
                          text: "Corporate Omnibus",
                          sub: "Fintech company holds the funds",
                        },
                        ajose: {
                          text: "Automated Payouts",
                          sub: "Doesn't hold onto group funds",
                        },
                      },
                      {
                        title: "Organizer Monetization",
                        desc: "Commission for running circles",
                        whatsapp: {
                          text: "Awkward Deductions",
                          sub: "Manual cuts cause group suspicion",
                        },
                        fintech: {
                          text: "0% Admin Cut",
                          sub: "Platform keeps all yield & spread",
                        },
                        ajose: {
                          text: "0–15% Automated Cut",
                          sub: "Verified earnings paid directly to Admin",
                        },
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#EAE3D2]/40 transition-colors">
                        <td className="p-4 md:p-6 font-bold text-[#111613]">
                          <div>{row.title}</div>
                          <div className="text-[11px] text-[#111613]/55 font-normal mt-0.5">
                            {row.desc}
                          </div>
                        </td>
                        <td className="p-4 md:p-6 text-center text-[#111613]/75">
                          <span className="font-semibold text-[#111613] block">
                            {row.whatsapp.text}
                          </span>
                          <span className="text-[10px] text-[#111613]/50">
                            {row.whatsapp.sub}
                          </span>
                        </td>
                        <td className="p-4 md:p-6 text-center text-[#111613]/75">
                          <span className="font-semibold text-[#111613] block">
                            {row.fintech.text}
                          </span>
                          <span className="text-[10px] text-[#111613]/50">
                            {row.fintech.sub}
                          </span>
                        </td>
                        <td className="p-4 md:p-6 text-center bg-[#0B3022] text-[#F3EEE3]">
                          <span className="font-bold text-[#F3EEE3] flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
                            {row.ajose.text}
                          </span>
                          <span className="text-[10px] text-[#F3EEE3]/70 font-medium block mt-0.5">
                            {row.ajose.sub}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Pricing & Default Protection Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left: Pricing Card */}
            <div className="flex flex-col h-full">
              <motion.div variants={fadeIn} className="mb-8">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3022]/75 block mb-2">
                  — Clear Economics
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-[#111613] mb-3">
                  Simple,{" "}
                  <span className="font-editorial italic font-normal text-[#0B3022]">
                    transparent pricing.
                  </span>
                </h2>
                <p className="text-[#111613]/70 text-base">
                  No hidden fees, no subscriptions. Select the schedule that works best for your circle.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="flex-1 bg-[#FAF7F0] rounded-3xl border border-[#111613]/15 overflow-hidden flex flex-col justify-between p-6 md:p-8 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#111613]/10">
                    <div>
                      <h3 className="text-xl font-bold text-[#111613]">
                        Flexible Circle Plans
                      </h3>
                      <p className="text-xs text-[#111613]/60 mt-0.5">
                        0% deducted on payout &bull; Automated NIBSS settlement
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#0B3022] text-[#D4A843] text-[10px] font-mono font-bold uppercase tracking-wider">
                      Pay As You Sweep
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      {
                        label: "Monthly Circles",
                        sub: "2% fee on monthly debits • Capped at ₦10k max",
                        rate: "2%",
                        unit: "capped at ₦10k",
                      },
                      {
                        label: "Weekly Circles",
                        sub: "Flat fee per automated weekly direct debit",
                        rate: "₦300",
                        unit: "/ transaction",
                      },
                      {
                        label: "Daily Circles",
                        sub: "Flat fee for daily thrift micro-debits",
                        rate: "₦100",
                        unit: "/ transaction",
                      },
                    ].map((plan, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-2xl bg-[#F3EEE3] border border-[#111613]/10"
                      >
                        <div>
                          <span className="text-sm font-bold text-[#111613] block">
                            {plan.label}
                          </span>
                          <p className="text-xs text-[#111613]/60 mt-0.5">
                            {plan.sub}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black font-mono text-[#0B3022]">
                            {plan.rate}
                          </span>
                          <span className="text-[10px] font-mono text-[#111613]/55 block">
                            {plan.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="pt-4 border-t border-[#111613]/10 space-y-2 text-xs text-[#111613]/75 font-medium mb-6">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0B3022] shrink-0" />
                      <span>Free to create an account &amp; join unlimited circles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0B3022] shrink-0" />
                      <span>Mono automated Direct Debit sweeps &amp; T+1 auto-disburse</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/signup"
                      className="flex-1 inline-flex h-12 items-center justify-center rounded-full bg-[#0B3022] hover:bg-[#144532] text-sm font-bold text-[#F3EEE3] transition-all"
                    >
                      Create a Circle Free
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex h-12 items-center justify-center px-5 rounded-full border border-[#111613]/20 hover:bg-[#EAE3D2] text-sm font-bold text-[#111613] transition-all"
                    >
                      Full Pricing
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Default Protection Protocol */}
            <div className="flex flex-col h-full mt-12 lg:mt-0">
              <motion.div variants={fadeIn} className="mb-8">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0B3022]/75 block mb-2">
                  — Enforcement Rails
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-[#111613] mb-3">
                  What happens if{" "}
                  <span className="font-editorial italic font-normal text-[#0B3022]">
                    someone defaults?
                  </span>
                </h2>
                <p className="text-[#111613]/70 text-base">
                  Every rotational circle is backed by automated recovery and accountability rules.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="flex-1 bg-[#FAF7F0] rounded-3xl border border-[#111613]/15 p-6 md:p-8 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B3022] text-[#F3EEE3] text-[11px] font-mono font-bold mb-6">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4A843]" />
                    <span>4-Step Default Protection</span>
                  </div>

                  <ol className="space-y-4">
                    {[
                      {
                        num: "01",
                        title: "Automated Retry Sweeps",
                        desc: "If the morning sweep fails due to insufficient balance, automatic retry sweeps trigger at 12:00 PM and 6:00 PM.",
                      },
                      {
                        num: "02",
                        title: "Trust Score Penalty & Circle Lockout",
                        desc: "The defaulter’s Àjọṣe Trust Score is penalized, freezing them from joining or creating other circles on the platform.",
                      },
                      {
                        num: "03",
                        title: "Automated Fallback Payment Link",
                        desc: "Instant 1-click fallback bank transfer link dispatched automatically via SMS and WhatsApp.",
                      },
                      {
                        num: "04",
                        title: "Circle-Agreed Late Fee Compensation",
                        desc: "Organizer-defined late settlement fees are applied and distributed to compensate the affected turn recipient.",
                      },
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#0B3022] text-[#D4A843] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                          {step.num}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#111613]">
                            {step.title}
                          </h4>
                          <p className="text-xs text-[#111613]/65 mt-0.5 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-8 pt-5 border-t border-[#111613]/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#111613]/55">
                    Turn by turn, no wahala.
                  </span>
                  <Link
                    href="/pricing"
                    className="text-xs font-bold text-[#0B3022] hover:underline flex items-center gap-1"
                  >
                    <span>Calculate Your Pot Payout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 5: Interactive Organizer Revenue Simulator */}
      <section className="w-full py-20 md:py-28 bg-[#EAE3D2] relative z-10 border-b border-[#111613]/10">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          <InteractiveRevenueCalculator showTitle={true} />
        </div>
      </section>

      {/* Section 6: Architectural Security Band (Volta Hairline Grid Style) */}
      <section className="w-full py-20 md:py-24 bg-[#071F16] text-[#F3EEE3] relative z-10 border-b border-white/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 max-w-7xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/15">
            {[
              {
                icon: ShieldAlert,
                tag: "BANK-GRADE ENCRYPTION",
                title: "AES-256 Data Protection",
                desc: "Your identity records and payment mandates are secured with AES-256 encryption and powered by CBN-licensed Open Banking partners (Mono).",
              },
              {
                icon: Lock,
                tag: "IDENTITY SCREENING",
                title: "BVN & Trust Score Verification",
                desc: "Every participant is verified against NIBSS BVN records and screened by our Àjọṣe Trust Score before joining a circle.",
              },
              {
                icon: Smartphone,
                tag: "ANYWHERE ACCESS",
                title: "100% Mobile & Web Ready",
                desc: "Run or join circles from your phone in Lagos, London, Houston, or Toronto — zero paper ledgers or cash envelopes.",
              },
            ].map((item, i) => (
              <motion.div
                variants={fadeIn}
                key={i}
                className={`py-8 md:py-4 ${
                  i === 0 ? "md:pr-10" : i === 1 ? "md:px-10" : "md:pl-10"
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#D4A843]">
                      {item.tag}
                    </span>
                    <item.icon className="w-5 h-5 text-[#D4A843]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#F3EEE3] mb-2.5 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#F3EEE3]/65 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 7: Communities & Diaspora Use Cases — Warm Cream (#F3EEE3) */}
      <section
        id="testimonials"
        className="w-full py-24 md:py-32 bg-[#F3EEE3] relative z-10 border-b border-[#111613]/10 overflow-hidden"
      >
        {/* Multi-layered Atmospheric Background of Country Flags */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#D4A843]/12 blur-[130px] rounded-full" />
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#0B3022]/8 blur-[120px] rounded-full" />

          {/* Faint Subtle World Flag Tapestry Watermark Pattern */}
          <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply flex flex-wrap items-center justify-around gap-16 p-12 scale-105">
            {["NG", "GB", "US", "CA", "GH", "KE", "ZA", "JM", "CM", "TT", "IE", "AE", "NG", "GB", "GH", "CA"].map((code, i) => (
              <div key={i} className="transform rotate-[-8deg] filter grayscale contrast-125">
                <CountryFlag code={code} size="lg" rounded={true} />
              </div>
            ))}
          </div>

          {/* Floating Glassmorphic Country Flag Badges (Global Diaspora Circles) */}
          {[
            { code: "NG", name: "Nigeria", tag: "Àjọ / Esusu", pos: "top-[6%] left-[3%] lg:left-[6%]", anim: "animate-float-slow" },
            { code: "GB", name: "UK Diaspora", tag: "Pardna", pos: "top-[8%] right-[3%] lg:right-[7%]", anim: "animate-float-reverse" },
            { code: "US", name: "United States", tag: "Rotational Fund", pos: "top-[20%] left-[2%] lg:left-[5%]", anim: "animate-float-reverse" },
            { code: "CA", name: "Canada", tag: "Diaspora Circle", pos: "top-[22%] right-[2%] lg:right-[6%]", anim: "animate-float-slow" },
            { code: "GH", name: "Ghana", tag: "Susu Pool", pos: "bottom-[5%] left-[4%] lg:left-[8%]", anim: "animate-float-slow" },
            { code: "KE", name: "Kenya", tag: "Chama Circle", pos: "bottom-[6%] right-[4%] lg:right-[8%]", anim: "animate-float-reverse" },
            { code: "ZA", name: "South Africa", tag: "Stokvel", pos: "top-[14%] left-[18%] hidden 2xl:flex", anim: "animate-float-slow" },
            { code: "JM", name: "Jamaica", tag: "Partner Scheme", pos: "bottom-[5%] right-[20%] hidden lg:flex", anim: "animate-float-reverse" },
            { code: "CM", name: "Cameroon", tag: "Njangi", pos: "bottom-[4%] left-[24%] hidden lg:flex", anim: "animate-float-reverse" },
            { code: "TT", name: "Trinidad", tag: "Sou-sou", pos: "top-[5%] right-[20%] hidden xl:flex", anim: "animate-float-slow" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`absolute ${item.pos} ${item.anim} hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FAF7F0]/85 backdrop-blur-md border border-[#111613]/15 shadow-[0_6px_20px_rgba(11,48,34,0.08)] z-0`}
            >
              <CountryFlag code={item.code} size="xs" rounded={true} />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-bold text-[#0B3022] tracking-tight">{item.name}</span>
                <span className="text-[9px] font-mono text-[#111613]/65 font-semibold tracking-wide">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FAF7F0] border border-[#111613]/12 shadow-2xs mb-5">
              <div className="flex items-center gap-1.5">
                <CountryFlag code="NG" size="xs" />
                <CountryFlag code="GB" size="xs" />
                <CountryFlag code="US" size="xs" />
                <CountryFlag code="CA" size="xs" />
                <CountryFlag code="GH" size="xs" />
                <CountryFlag code="KE" size="xs" />
              </div>
              <span className="text-xs font-bold text-[#0B3022] tracking-tight">
                Built for Circles at Home &amp; Across the Diaspora
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.025em] text-[#111613] mb-4 leading-[1.1]">
              Designed for how{" "}
              <span className="font-editorial italic font-normal text-[#0B3022]">
                communities save.
              </span>
            </h2>
            <p className="text-[#111613]/70 max-w-2xl mx-auto text-base sm:text-lg">
              From family circles and diaspora savings to alumni funds and workplace thrift pools, Àjọṣe removes manual tracking and awkward follow-ups.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: HeartHandshake,
                category: "Family & Diaspora",
                title: "Cross-Border Family Circles",
                desc: "Keep family savings coordinated across London, Atlanta, Toronto, and Lagos. Members contribute via secure Open Banking while turn recipients collect directly in Naira.",
                highlight: "Zero Remittance Hassle",
              },
              {
                icon: Briefcase,
                category: "Workplace & Office",
                title: "Salary-Aligned Thrift",
                desc: "Synchronize monthly rotations with payday. Automated direct debits ensure colleagues never miss a contribution, keeping workplace friendships intact.",
                highlight: "Payday Direct Debit",
              },
              {
                icon: GraduationCap,
                category: "Alumni & Friends",
                title: "High-Volume Capital Pools",
                desc: "Manage high-value pots with total accountability. A live roster and 2-way payout handshake ensure everyone sees who has paid before the turn advances.",
                highlight: "Two-Way Handshake",
              },
              {
                icon: Building2,
                category: "Markets & Co-ops",
                title: "Daily & Weekly Thrift",
                desc: "High-frequency micro-rotations built for traders and cooperative members. Automated morning sweeps with flat ₦100 or ₦300 fees eliminate cash risks.",
                highlight: "Flat ₦100/₦300 Sweeps",
              },
            ].map((useCase, idx) => (
              <motion.div
                variants={fadeIn}
                key={idx}
                className="bg-[#FAF7F0] p-6 rounded-3xl border border-[#111613]/12 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-[#0B3022] flex items-center justify-center text-[#D4A843]">
                      <useCase.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EAE3D2] text-[#111613]/80 px-2.5 py-1 rounded-full">
                      {useCase.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111613] mb-2 leading-snug tracking-tight">
                    {useCase.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#111613]/70 leading-relaxed mb-5">
                    {useCase.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#111613]/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#0B3022]">
                    ✓ {useCase.highlight}
                  </span>
                  <Link
                    href="/signup"
                    className="text-xs font-bold text-[#111613] hover:text-[#0B3022] flex items-center gap-0.5"
                  >
                    Start &rarr;
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Mobile App Showcase Section */}
      <MobileAppShowcase />

      {/* Section 8: Final CTA Banner — Deep Forest (#0B3022) + Burnished Gold Pill */}
      <section className="w-full py-24 md:py-28 bg-[#0B3022] relative z-10 overflow-hidden">
        <div className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-[#D4A843]/12 blur-[140px] rounded-full pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center max-w-4xl"
        >
          <motion.span
            variants={fadeIn}
            className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4A843] mb-4"
          >
            — Turn by turn, no wahala
          </motion.span>
          <motion.h2
            variants={fadeIn}
            className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] text-[#F3EEE3] mb-6 leading-[1.08]"
          >
            Ready to secure your{" "}
            <span className="relative inline-block font-editorial italic font-normal text-white pr-1">
              next round?
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#D4A843]"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 9C55 3 135 2.5 197 7.5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h2>
          <motion.p
            variants={fadeIn}
            className="text-lg sm:text-xl text-[#F3EEE3]/75 mb-10 max-w-2xl leading-relaxed"
          >
            Upgrade from stressful WhatsApp groups and manual chasing to automated Àjọṣe circles.
          </motion.p>
          <motion.div variants={fadeIn} className="flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-15 items-center justify-center rounded-full bg-[#D4A843] px-10 text-base sm:text-lg font-bold text-[#0B3022] shadow-[0_8px_30px_rgba(212,168,67,0.3)] hover:bg-[#e0b654] hover:scale-[1.02] active:scale-95 transition-all gap-2.5"
            >
              <span>Start an Ajo Circle</span>
              <ArrowRight className="w-5 h-5 text-[#0B3022]" />
            </Link>
            <p className="text-xs font-mono text-[#F3EEE3]/60">
              Free to start &bull; Takes 2 minutes &bull; No paperwork
            </p>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
