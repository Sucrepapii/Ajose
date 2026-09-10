"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ShieldCheck, Rocket, Lock, ArrowRight, Zap, Users, CheckSquare, CreditCard, Landmark, ChevronDown, Activity, Check, Star, X, ShieldAlert, Smartphone, LineChart, Percent, LayoutDashboard, History } from "lucide-react";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeShowcase, setActiveShowcase] = useState(0);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#FDFBF7]">
      
      {/* Hero Section */}
      <section className="w-full bg-[#0B3022] pt-24 pb-32 md:pt-32 md:pb-40 relative z-10 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#C5A059]/10 blur-[120px] rounded-full pointer-events-none" />
        <motion.div 
          className="absolute top-[20%] left-[5%] w-64 h-64 bg-[#C5A059]/10 blur-[80px] rounded-full pointer-events-none"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[30%] w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"
          animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Text */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="z-20"
            >
              <motion.div 
                variants={fadeIn} 
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#C5A059]/25 via-[#D4AF37]/15 to-[#C5A059]/25 border border-[#C5A059]/50 shadow-[0_0_25px_rgba(197,160,89,0.3)] backdrop-blur-md mb-8 group hover:scale-[1.03] transition-all duration-300 cursor-default"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C5A059]"></span>
                </span>
                <span className="text-base md:text-lg font-extrabold tracking-wide text-[#FDFBF7] drop-shadow-sm">
                  Turn by turn, no wahala.
                </span>
              </motion.div>

              <motion.h1 
                variants={fadeIn}
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15]"
              >
                Because life is turn by turn, Ajose makes sure yours comes.
              </motion.h1>
              
              <motion.p 
                variants={fadeIn}
                className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl"
              >
                Run your Ajo. Track every round. Trust every naira. Ditch messy WhatsApp groups and handwritten ledgers for an automated, transparent contribution platform built for Nigeria.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-md bg-[#C5A059] px-8 text-base font-bold text-[#0B3022] shadow-lg hover:bg-[#A48243] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Start Your Ajo Group
                </Link>
                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-md border-2 border-[#C5A059] px-8 text-base font-medium text-[#C5A059] hover:bg-[#C5A059]/10 transition-all"
                >
                  See how it works
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Dashboard Interactive Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 40, rotateY: -15, perspective: 1000 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3, type: "spring", bounce: 0.2 }}
              className="relative w-full z-20"
            >
              <div className="bg-[#FDFBF7] rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col gap-6 transform hover:scale-[1.01] transition-transform duration-500">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>

                <div className="bg-[#F4F1EA] rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-[#0B3022] font-bold text-lg">Group Roster</h3>
                      <p className="text-[#1F2937]/70 text-sm">October Payout Cycle</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">ACTIVE ROUND</div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { name: "Sarah J.", status: "E don pay ✓", icon: CheckSquare, color: "text-emerald-700", bg: "bg-emerald-100" },
                      { name: "Michael O.", status: "E don pay ✓", icon: CheckSquare, color: "text-emerald-700", bg: "bg-emerald-100" },
                      { name: "David K.", status: "Your turn don reach 🎯", icon: Activity, color: "text-amber-700", bg: "bg-amber-100" }
                    ].map((user, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + (i * 0.1) }}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#FDFBF7] border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0B3022] flex items-center justify-center text-xs font-bold text-white">{user.name[0]}</div>
                          <span className="text-sm font-semibold text-[#1F2937]">{user.name}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${user.bg} ${user.color}`}>
                          <user.icon className="w-3 h-3" />
                          {user.status}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0B3022] rounded-xl p-6 border border-[#0B3022] shadow-inner text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-gray-300 font-medium text-sm mb-1">Admin Projected Earnings</h3>
                    <motion.p 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      className="text-3xl font-bold text-[#C5A059]"
                    >
                      ₦450,000
                    </motion.p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <p className="text-sm text-gray-200">Across 3 active groups managed</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Process Section (How Àjọṣe Works) */}
      <section id="how-it-works" className="w-full py-24 md:py-32 bg-[#FDFBF7] relative z-10 border-b border-gray-200 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">
              How Àjọṣe Works
            </h2>
            <p className="text-[#1F2937]/80 max-w-2xl mx-auto text-lg">
              Four simple steps to secure, transparent rotating savings.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Animated Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-1 bg-gray-100 z-0 overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                whileInView={{ x: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-[#C5A059] w-full"
              />
            </div>
            
            {[
              { icon: Users, title: "Create Group", desc: "Set the contribution rules and invite trusted peers." },
              { icon: CheckSquare, title: "Members Join", desc: "System assigns turns and locks the roster when active." },
              { icon: CreditCard, title: "Contribute", desc: "Members pay their share directly to the Admin." },
              { icon: Landmark, title: "Payout", desc: "Admin routes the pooled funds to the receiving member." }
            ].map((step, i) => (
              <motion.div 
                variants={fadeIn} 
                key={i} 
                className="relative z-10 flex flex-col items-center text-center group"
                whileHover={{ y: -10 }}
              >
                <div className="w-20 h-20 rounded-full bg-[#FDFBF7] border-4 border-[#C5A059] flex items-center justify-center mb-6 shadow-md z-10 group-hover:bg-[#C5A059] group-hover:border-[#0B3022] transition-colors duration-300">
                  <step.icon className="h-8 w-8 text-[#0B3022] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="bg-[#F4F1EA] rounded-lg p-5 border border-gray-100 w-full h-full shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-sm font-bold text-[#C5A059] mb-1">STEP {i + 1}</h3>
                  <h4 className="text-xl font-bold text-[#0B3022] mb-3">{step.title}</h4>
                  <p className="text-[#1F2937]/80 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Value Proposition Section (Engineered for Trust & Transparency) */}
      <section id="features" className="w-full py-24 md:py-32 bg-[#F4F1EA] relative z-10 border-b border-gray-200 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12"
        >
          <motion.div variants={fadeIn} className="flex flex-col items-center justify-center text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">
              Engineered for Trust & Transparency
            </h2>
            <p className="max-w-2xl text-[#1F2937]/80 text-lg">
              We've taken the traditional Ajo and wrapped it in a premium software experience. Everything you need to manage your group effortlessly.
            </p>
          </motion.div>
          
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Left side: Tabs list */}
            <div className="lg:w-1/3 flex flex-col gap-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Immutable Records",
                  desc: "Every contribution is logged in a transparent ledger. No more disputes over who paid when."
                },
                {
                  icon: Rocket,
                  title: "Automated Turns",
                  desc: "The system automatically assigns and tracks payout turns, taking the administrative burden off the creator."
                },
                {
                  icon: Lock,
                  title: "Admin Control",
                  desc: "Powerful dashboard allowing admins to flag defaulters, manage earnings, and control the group lifecycle."
                }
              ].map((feature, i) => (
                <motion.button
                  variants={fadeIn}
                  key={i}
                  onClick={() => setActiveFeatureTab(i)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ${activeFeatureTab === i ? "border-[#C5A059] bg-[#FDFBF7] shadow-md" : "border-transparent hover:bg-[#FDFBF7]/50"}`}
                >
                  <h3 className={`text-xl font-bold mb-2 ${activeFeatureTab === i ? "text-[#0B3022]" : "text-[#1F2937]/70"}`}>{feature.title}</h3>
                  <p className={`text-sm leading-relaxed ${activeFeatureTab === i ? "text-[#1F2937]" : "text-[#1F2937]/50"}`}>
                    {feature.desc}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Right side: Active Tab Display */}
            <motion.div variants={fadeIn} className="lg:w-2/3">
              <div className="bg-[#FDFBF7] rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl h-full flex flex-col justify-center relative overflow-hidden min-h-[400px]">
                {/* Decorative background flair */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-[50px] pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeatureTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row items-center gap-8 relative z-10"
                  >
                    {[
                      {
                        icon: ShieldCheck,
                        title: "Immutable Records",
                        tagline: "Total transparency for every member.",
                        points: ["Tamper-proof contribution logging", "Real-time payment verification", "Historical ledger access"]
                      },
                      {
                        icon: Rocket,
                        title: "Automated Turns",
                        tagline: "Set it up once, let the system run.",
                        points: ["Fair, randomized member sequencing", "Automatic turn assignment", "Next-in-line alerts"]
                      },
                      {
                        icon: Lock,
                        title: "Admin Control",
                        tagline: "Total authority to protect the group.",
                        points: ["Freeze defaulting members", "One-click fund disbursement", "Modify active rosters securely"]
                      }
                    ].filter((_, i) => i === activeFeatureTab).map((content, i) => (
                      <div key={i} className="flex-1 w-full flex flex-col gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#0B3022] flex items-center justify-center shadow-lg">
                          <content.icon className="w-8 h-8 text-[#C5A059]" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-[#0B3022] mb-3">{content.title}</h3>
                          <p className="text-xl text-[#1F2937]/70 font-medium mb-8">{content.tagline}</p>
                          <ul className="space-y-4">
                            {content.points.map((point, j) => (
                              <motion.li 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (j * 0.1) }}
                                key={j} 
                                className="flex items-center gap-3"
                              >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C5A059]/20 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-[#C5A059]" />
                                </div>
                                <span className="text-[#1F2937] font-medium">{point}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Comparison & Pricing Section */}
      <section className="w-full py-24 md:py-32 bg-[#F4F1EA] relative z-10 border-t border-gray-200">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Left: Comparison Table */}
            <div className="flex flex-col h-full">
              <motion.div variants={fadeIn} className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B3022] mb-4">
                  Why switch to Àjọṣe?
                </h2>
                <p className="text-[#1F2937]/80 text-lg">
                  Say goodbye to messy spreadsheets and unverified WhatsApp messages.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="flex-1 bg-[#FDFBF7] rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
                <div className="grid grid-cols-3 bg-[#0B3022] text-white p-6 md:p-8 font-bold text-sm md:text-base">
                  <div>Feature</div>
                  <div className="text-center text-gray-400">Traditional</div>
                  <div className="text-center text-[#C5A059]">Àjọṣe</div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  {[
                    { feature: "Record Keeping", traditional: "Manual", ajo: "Automated" },
                    { feature: "Turn Assignment", traditional: "Arguments", ajo: "System" },
                    { feature: "Defaulter Protection", traditional: "None", ajo: "Credit Score" },
                    { feature: "Payment Tracking", traditional: "Screenshots", ajo: "1-Click Verify" },
                    { feature: "Admin Stress", traditional: "High", ajo: "Zero" },
                  ].map((row, i) => (
                    <div key={i} className={`flex-1 grid grid-cols-3 p-4 md:p-6 border-t border-gray-100 items-center transition-colors hover:bg-[#F4F1EA]/50 ${i % 2 === 0 ? 'bg-[#FDFBF7]' : 'bg-[#FDFBF7]'}`}>
                      <div className="font-semibold text-[#0B3022] text-sm">{row.feature}</div>
                      <div className="flex flex-col items-center text-center text-[#1F2937]/70 text-sm">
                        <X className="w-4 h-4 text-red-400 mb-1" />
                        {row.traditional}
                      </div>
                      <div className="flex flex-col items-center text-center font-bold text-[#0B3022] text-sm">
                        <Check className="w-4 h-4 text-emerald-500 mb-1" />
                        {row.ajo}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Pricing Section */}
            <div className="flex flex-col h-full mt-12 lg:mt-0">
              <motion.div variants={fadeIn} className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B3022] mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-[#1F2937]/80 text-lg">
                  No hidden fees, no subscriptions. You only pay a tiny fraction when the group succeeds.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="flex-1 bg-white rounded-3xl shadow-xl border-2 border-[#C5A059] overflow-hidden flex flex-col transform hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-[#0B3022] p-6 text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[#C5A059]/10"></div>
                  <h3 className="text-2xl font-bold relative z-10">Standard Plan</h3>
                  <div className="mt-4 mb-2 flex items-center justify-center gap-1 relative z-10">
                    <span className="text-5xl font-bold">2</span>
                    <Percent className="w-8 h-8 text-[#C5A059]" />
                  </div>
                  <p className="text-gray-300 relative z-10">flat platform fee on payouts</p>
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <ul className="space-y-4 mb-8">
                    {[
                      "Free to create an account",
                      "Free to create or join groups",
                      "Automated turn management",
                      "Ajo Credit Score protection",
                      "Immutable transaction ledger"
                    ].map((perk, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-[#1F2937] font-medium text-sm md:text-base">{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="w-full inline-flex h-14 items-center justify-center rounded-xl bg-[#0B3022] px-8 text-base font-bold text-white shadow-lg hover:bg-[#154634] transition-all mt-auto"
                  >
                    Get Started Now
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* App Showcase / UI Carousel */}
      <section className="w-full py-24 md:py-32 bg-[#FDFBF7] relative z-10 border-t border-gray-200 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">
              Everything in one place
            </h2>
            <p className="text-[#1F2937]/80 max-w-2xl mx-auto text-lg">
              A beautifully designed dashboard to manage every aspect of your savings group.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
            {/* Sidebar Controls */}
            <div className="lg:w-1/3 flex flex-col gap-4 w-full">
              {[
                { icon: LayoutDashboard, title: "Overview Dashboard", desc: "Track total contributions and upcoming payouts at a glance." },
                { icon: Users, title: "Member Roster", desc: "See exactly whose turn is next and who has already been paid." },
                { icon: History, title: "Immutable Ledger", desc: "A permanent history of every payment verified by the admin." }
              ].map((item, i) => (
                <motion.button
                  variants={fadeIn}
                  key={i}
                  onClick={() => setActiveShowcase(i)}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`flex flex-col text-left p-6 rounded-2xl border-2 transition-all duration-300 ${activeShowcase === i ? "border-[#0B3022] bg-[#0B3022] text-white shadow-xl" : "border-gray-200 bg-[#F4F1EA] text-[#0B3022] hover:border-[#C5A059]"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className={`w-5 h-5 ${activeShowcase === i ? "text-[#C5A059]" : "text-[#0B3022]"}`} />
                    <h3 className="text-lg font-bold">{item.title}</h3>
                  </div>
                  <p className={`text-sm leading-relaxed ${activeShowcase === i ? "text-gray-300" : "text-[#1F2937]/70"}`}>{item.desc}</p>
                </motion.button>
              ))}
            </div>

            {/* Showcase Visuals */}
            <motion.div variants={fadeIn} className="lg:w-2/3 w-full">
              <div className="bg-[#0B3022] rounded-3xl p-4 md:p-8 shadow-2xl relative min-h-[450px] flex items-center justify-center overflow-hidden border-4 border-gray-900">
                {/* Mac window dots */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeShowcase}
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-lg mt-8"
                  >
                    {activeShowcase === 0 && (
                      <div className="bg-[#FDFBF7] rounded-xl p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                          <h4 className="font-bold text-[#0B3022]">Total Pool</h4>
                          <span className="text-[#C5A059] font-bold text-xl">₦1,200,000</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#F4F1EA] p-4 rounded-lg">
                            <p className="text-xs text-gray-500 font-bold mb-1">MEMBERS</p>
                            <p className="text-2xl font-bold text-[#0B3022]">12</p>
                          </div>
                          <div className="bg-emerald-50 p-4 rounded-lg">
                            <p className="text-xs text-emerald-600 font-bold mb-1">NEXT PAYOUT</p>
                            <p className="text-xl font-bold text-emerald-700">Oct 15</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeShowcase === 1 && (
                      <div className="bg-[#FDFBF7] rounded-xl p-6 flex flex-col gap-3">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-[#F4F1EA]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#0B3022] rounded-full"></div>
                              <div className="h-4 w-24 bg-gray-300 rounded"></div>
                            </div>
                            <div className="h-6 w-16 bg-emerald-100 rounded-full"></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeShowcase === 2 && (
                      <div className="bg-[#FDFBF7] rounded-xl p-6 flex flex-col gap-3">
                        <h4 className="font-bold text-[#0B3022] mb-2">Transaction History</h4>
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="font-bold text-sm text-[#0B3022]">Contribution Received</p>
                              <p className="text-xs text-gray-400">Today, 14:30</p>
                            </div>
                            <span className="text-emerald-600 font-bold text-sm">+₦100,000</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Security & Trust Section */}
      <section className="w-full py-24 md:py-32 bg-[#0B3022] relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
            {[
              { icon: ShieldAlert, title: "Bank-Grade Security", desc: "Your data is secured with AES-256 encryption, the same standard used by leading banks worldwide." },
              { icon: Lock, title: "Automated Fraud Prevention", desc: "Our built-in Ajo Credit Score automatically flags and prevents habitual defaulters from joining new groups." },
              { icon: Smartphone, title: "100% Mobile Ready", desc: "Manage your group from anywhere. No need to carry laptops or physical ledgers." }
            ].map((item, i) => (
              <motion.div variants={fadeIn} key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 flex items-center justify-center mb-6 border border-[#C5A059]/20">
                  <item.icon className="w-8 h-8 text-[#C5A059]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24 md:py-32 bg-[#F4F1EA] relative z-10 border-t border-gray-200">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">
              Loved by Communities
            </h2>
            <p className="text-[#1F2937]/80 max-w-2xl mx-auto text-lg">
              See what our beta users are saying about the Àjọṣe experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Finally, a way to do Ajo without the endless WhatsApp arguments. The automated turns feature is a lifesaver.",
                author: "Bisi A.",
                role: "Group Admin"
              },
              {
                quote: "I love the transparency. Being able to see exactly who has paid and who is next builds so much trust.",
                author: "Emeka O.",
                role: "Member"
              },
              {
                quote: "We moved our alumni contribution group here. The dashboard makes managing millions of Naira completely stress-free.",
                author: "Tola F.",
                role: "Alumni President"
              }
            ].map((testimonial, i) => (
              <motion.div 
                variants={fadeIn}
                key={i} 
                className="bg-[#FDFBF7] p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between"
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0,0,0,0.05)" }}
              >
                <div>
                  <div className="flex items-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-[#C5A059] text-[#C5A059]" />
                    ))}
                  </div>
                  <p className="text-[#1F2937]/90 text-lg leading-relaxed mb-8 italic">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0B3022] flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0B3022]">{testimonial.author}</h4>
                    <p className="text-sm text-[#1F2937]/60">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ Accordion Block */}
      <section className="w-full py-24 md:py-32 bg-[#F4F1EA] relative z-10 border-t border-gray-200">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 max-w-3xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B3022] mb-4">Frequently Asked Questions</h2>
          </motion.div>
          
          <div className="space-y-4">
            {[
              { q: "Where does the money go?", a: "The money is collected by the Group Admin. Members pay their contributions directly to the Admin's bank account, and the Admin is responsible for transferring the final pool to the receiver. Àjọṣe simply provides the software to track these payments and turns." },
              { q: "What happens if someone refuses to pay?", a: "Ajo is built on trust. As an Admin, you should only invite people you trust. If someone misses a payment, the Admin can manually mark them as defaulted on the platform, freezing their payouts and warning the group. Defaulting also incurs a -50 point penalty to their global Ajo Credit Score." },
              { q: "Can I leave a group before the cycle ends?", a: "Once a group cycle is marked as 'Active' by the Admin, the roster is locked. This ensures that people who have already collected their payout cannot abandon the group before paying back into the pool." },
              { q: "What is the Ajo Credit Score?", a: "Your Ajo Credit Score is a global metric that tracks your reliability across all groups. You gain points for successful contributions and lose 50 points immediately if you default. A low score will automatically restrict you from joining high-value groups." },
              { q: "Are there any fees?", a: "Àjọṣe charges a flat 2% platform fee per payout to maintain our secure infrastructure. Group Admins may also choose to charge their own management commission (between 0% and 5%), which is clearly displayed before you join." },
              { q: "Is my personal data secure?", a: "Yes. All data, including verification details and ledger history, is secured with AES-256 bank-grade encryption and protected by strict security policies." }
            ].map((faq, i) => (
              <motion.div 
                variants={fadeIn}
                key={i} 
                className="bg-[#FDFBF7] border border-gray-200 shadow-sm rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 cursor-pointer font-bold text-lg text-[#0B3022] text-left hover:bg-[#FDFBF7]/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: activeFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-[#C5A059]" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-[#1F2937]/80 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA Banner */}
      <section className="w-full py-20 bg-[#0B3022] relative z-10 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-[#C5A059]/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-50%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center"
        >
          <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Ready to secure your savings group?
          </motion.h2>
          <motion.p variants={fadeIn} className="text-xl text-gray-300 mb-10 max-w-2xl">
            Join thousands of smart savers who have upgraded from spreadsheets to Àjọṣe.
          </motion.p>
          <motion.div variants={fadeIn}>
            <Link
              href="/signup"
              className="inline-flex h-16 items-center justify-center rounded-xl bg-[#C5A059] px-10 text-lg font-bold text-[#0B3022] shadow-2xl hover:bg-[#A48243] hover:scale-105 active:scale-95 transition-all"
            >
              Create a Group Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

