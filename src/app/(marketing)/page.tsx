"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ShieldCheck, Rocket, Lock, ArrowRight, Zap, Users, CheckSquare, CreditCard, Landmark, ChevronDown, Activity, Check, Star, X, ShieldAlert, Smartphone, LineChart, Percent, LayoutDashboard, History, Quote, Globe } from "lucide-react";
import { CountryFlag } from "@/components/CountryFlag";
import { CommunityTestimonialsCarousel } from "@/components/CommunityTestimonialsCarousel";
import { InteractiveRevenueCalculator } from "@/components/InteractiveRevenueCalculator";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  rating?: number;
  country?: string;
  countryCode?: string;
  location?: string;
}

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

  const [communityTestimonials, setCommunityTestimonials] = useState<TestimonialItem[]>([
    {
      quote: "Finally, a way to do Ajo without the endless WhatsApp arguments. The automated turns feature is a lifesaver.",
      author: "Bisi A.",
      role: "Group Admin",
      rating: 5,
      country: "Nigeria",
      countryCode: "NG",
      location: "Lagos, Nigeria"
    },
    {
      quote: "I love the transparency. Being able to see exactly who has paid and who is next builds so much trust.",
      author: "Emeka O.",
      role: "Member",
      rating: 5,
      country: "Nigeria",
      countryCode: "NG",
      location: "Enugu, Nigeria"
    },
    {
      quote: "We moved our alumni contribution group here. The dashboard makes managing millions of Naira completely stress-free.",
      author: "Tola F.",
      role: "Alumni President",
      rating: 5,
      country: "Nigeria",
      countryCode: "NG",
      location: "Ibadan, Nigeria"
    },
    {
      quote: "The Open-Banking auto-debit has completely transformed our medical diaspora monthly pool. Payouts arrive directly without delay.",
      author: "Dr. Kunle A.",
      role: "Diaspora Circle Lead",
      rating: 5,
      country: "United Kingdom",
      countryCode: "GB",
      location: "London, UK"
    },
    {
      quote: "We run our cross-border tech founders Susu on Àjọṣe. The ledger accuracy and payout countdown give everybody peace of mind.",
      author: "Kwame M.",
      role: "Susu Circle Organizer",
      rating: 5,
      country: "Ghana",
      countryCode: "GH",
      location: "Accra, Ghana"
    },
    {
      quote: "Our Nigerian-American family pool has 12 members across 4 states. Everyone knows their turn date and nobody has to chase cousin payments.",
      author: "Chinwe & Chidi N.",
      role: "Family Circle Admins",
      rating: 5,
      country: "United States",
      countryCode: "US",
      location: "Atlanta, GA"
    },
    {
      quote: "Running our civil service thrift pool used to take hours of manual bank confirmation. Àjọṣe automated the entire verification cycle.",
      author: "Fatima Y.",
      role: "Cooperative Lead",
      rating: 5,
      country: "Nigeria",
      countryCode: "NG",
      location: "Abuja, Nigeria"
    },
    {
      quote: "We organize our quarterly business expansion circle from Ontario. The non-custodial structure is exactly what we needed to trust the platform.",
      author: "David O.",
      role: "Business Circle Member",
      rating: 5,
      country: "Canada",
      countryCode: "CA",
      location: "Toronto, Canada"
    }
  ]);

  useEffect(() => {
    fetch("/api/feedback?featured=true")
      .then((res) => res.json())
      .then((data) => {
        if (data?.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          setCommunityTestimonials(data.testimonials);
        }
      })
      .catch((err) => console.warn("Dynamic testimonials fetch fallback:", err));
  }, []);

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

              {/* Above-The-Fold Regulatory & Compliance Trust Bar */}
              <motion.div 
                variants={fadeIn}
                className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-white/80"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span><strong>CBN-Regulated Settlement</strong> via Paylode PSSP</span>
                </div>
                <span className="hidden sm:inline text-white/30">•</span>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span><strong>Mono Open Banking</strong> (NDPR Compliant)</span>
                </div>
                <span className="hidden sm:inline text-white/30">•</span>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span><strong>100% Non-Custodial</strong> Direct Pass-Through</span>
                </div>
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

          {/* Architecture & Capability Truth Strip */}
          <motion.div 
            variants={fadeIn}
            className="mt-16 pt-10 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center text-white relative z-20"
          >
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
              <span className="block text-lg sm:text-xl font-black text-[#C5A059] font-mono mb-1.5">
                ₦10,000 to ₦10,000,000+
              </span>
              <span className="text-xs text-gray-300 font-medium leading-relaxed">
                Built for circles of any size from micro-thrift to major capital pools.
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
              <span className="block text-lg sm:text-xl font-black text-emerald-400 font-serif mb-1.5">
                Automated Enforcement
              </span>
              <span className="text-xs text-gray-300 font-medium leading-relaxed">
                No more chasing defaulters or sending awkward WhatsApp reminders.
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
              <span className="block text-lg sm:text-xl font-black text-white font-serif mb-1.5">
                Direct Bank-to-Bank
              </span>
              <span className="text-xs text-gray-300 font-medium leading-relaxed">
                Àjọṣe never holds your money, funds settle directly to each recipient.
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
              <span className="block text-lg sm:text-xl font-black text-[#C5A059] font-serif mb-1.5">
                Home &amp; Diaspora
              </span>
              <span className="text-xs text-gray-300 font-medium leading-relaxed">
                Built for Nigerians saving together across states and borders.
              </span>
            </div>
          </motion.div>
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
              Four simple steps to secure, transparent rotating contributions.
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

      {/* Unified Platform & Trust Showcase Section (Side by Side) */}
      <section id="features" className="w-full py-24 md:py-32 bg-[#F4F1EA] relative z-10 border-b border-gray-200 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 max-w-7xl"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left Column: Engineered for Trust & Transparency */}
            <div className="flex flex-col h-full">
              <motion.div variants={fadeIn} className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
                  System Architecture
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B3022] font-serif mb-4">
                  Engineered for Trust &amp; Transparency
                </h2>
                <p className="text-[#1F2937]/80 text-base leading-relaxed">
                  We&rsquo;ve taken the traditional Ajo and wrapped it in a premium software experience. Everything you need to manage your group effortlessly.
                </p>
              </motion.div>

              {/* Feature Tab Selectors */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/60 border border-gray-200 mb-6">
                {[
                  { title: "Immutable Records", icon: ShieldCheck },
                  { title: "Automated Turns", icon: Rocket },
                  { title: "Admin Control", icon: Lock }
                ].map((feature, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFeatureTab(i)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      activeFeatureTab === i 
                        ? "bg-[#0B3022] text-[#C5A059] shadow-md" 
                        : "text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-black/5"
                    }`}
                  >
                    <feature.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{feature.title}</span>
                  </button>
                ))}
              </div>

              {/* Feature Detail Card */}
              <motion.div variants={fadeIn} className="flex-1">
                <div className="bg-[#FDFBF7] rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xl h-full flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-[40px] pointer-events-none" />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeatureTab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-10 flex flex-col h-full justify-between"
                    >
                      {[
                        {
                          icon: ShieldCheck,
                          title: "Immutable Records",
                          tagline: "Total transparency for every member.",
                          points: [
                            "Tamper-proof contribution logging",
                            "Real-time Open-Banking payment verification",
                            "Permanent, downloadable ledger audit history"
                          ]
                        },
                        {
                          icon: Rocket,
                          title: "Automated Turns",
                          tagline: "Set it up once, let the system run.",
                          points: [
                            "Fair, randomized or custom member sequencing",
                            "Automatic turn assignment & morning sweeps",
                            "Instant fallback alerts & countdown timers"
                          ]
                        },
                        {
                          icon: Lock,
                          title: "Admin Control",
                          tagline: "Total authority to protect the group.",
                          points: [
                            "Freeze defaulting members with credit penalty",
                            "One-click fund disbursement confirmation",
                            "Modify active rosters securely before round starts"
                          ]
                        }
                      ].filter((_, i) => i === activeFeatureTab).map((content, i) => (
                        <div key={i} className="flex flex-col h-full justify-between gap-6">
                          <div>
                            <div className="w-12 h-12 rounded-xl bg-[#0B3022] flex items-center justify-center shadow-md mb-4">
                              <content.icon className="w-6 h-6 text-[#C5A059]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#0B3022] mb-1">{content.title}</h3>
                            <p className="text-sm text-[#1F2937]/70 font-medium mb-6">{content.tagline}</p>
                            <ul className="space-y-3">
                              {content.points.map((point, j) => (
                                <li key={j} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#1F2937] font-medium">
                                  <div className="shrink-0 w-5 h-5 rounded-full bg-[#C5A059]/20 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                                  </div>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span>Turn by turn, guaranteed.</span>
                            <span className="font-semibold text-[#0B3022]">Bank-grade automation</span>
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
                <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
                  Live UI Experience
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B3022] font-serif mb-4">
                  Everything in one place
                </h2>
                <p className="text-[#1F2937]/80 text-base leading-relaxed">
                  A beautifully designed dashboard to manage every aspect of your Ajo group.
                </p>
              </motion.div>

              {/* Showcase Tab Selectors */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/60 border border-gray-200 mb-6">
                {[
                  { title: "Overview", icon: LayoutDashboard },
                  { title: "Roster", icon: Users },
                  { title: "Ledger", icon: History }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveShowcase(i)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      activeShowcase === i 
                        ? "bg-[#0B3022] text-[#C5A059] shadow-md" 
                        : "text-[#1F2937]/70 hover:text-[#0B3022] hover:bg-black/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
              </div>

              {/* Interactive Showcase Mockup Window */}
              <motion.div variants={fadeIn} className="flex-1">
                <div className="bg-[#0B3022] rounded-3xl p-6 sm:p-8 shadow-2xl relative h-full flex flex-col justify-between overflow-hidden border-2 border-gray-800 text-white min-h-[360px]">
                  {/* Mac window header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">ajose.app/dashboard</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeShowcase}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.04 }}
                      transition={{ duration: 0.25 }}
                      className="flex-1 flex flex-col justify-center"
                    >
                      {activeShowcase === 0 && (
                        <div className="bg-[#FDFBF7] rounded-2xl p-5 text-[#0B3022] shadow-lg flex flex-col gap-4">
                          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <div>
                              <h4 className="font-bold text-sm">Tech Savers Circle</h4>
                              <p className="text-[11px] text-gray-500">October Round 4 of 10</p>
                            </div>
                            <span className="text-[#C5A059] font-black text-lg font-mono">₦1,200,000</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#F4F1EA] p-3 rounded-xl">
                              <p className="text-[10px] text-gray-500 font-bold mb-0.5">TOTAL MEMBERS</p>
                              <p className="text-xl font-black text-[#0B3022]">12 Savers</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                              <p className="text-[10px] text-emerald-700 font-bold mb-0.5">NEXT PAYOUT</p>
                              <p className="text-lg font-bold text-emerald-800">Oct 15 (₦1.2M)</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeShowcase === 1 && (
                        <div className="bg-[#FDFBF7] rounded-2xl p-5 text-[#0B3022] shadow-lg space-y-2.5">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">Turn Sequence</h4>
                          {[
                            { name: "Dr. Kunle A.", turn: "Turn 1", status: "Paid Out ✓", bg: "bg-emerald-100 text-emerald-800" },
                            { name: "Bisi A.", turn: "Turn 2", status: "Paid Out ✓", bg: "bg-emerald-100 text-emerald-800" },
                            { name: "David K.", turn: "Turn 3 (Current)", status: "Collecting 🎯", bg: "bg-amber-100 text-amber-900" }
                          ].map((m, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F1EA] text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#0B3022] text-white flex items-center justify-center font-bold text-[10px]">
                                  {m.name[0]}
                                </div>
                                <span className="font-semibold text-gray-800">{m.name}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${m.bg}`}>{m.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeShowcase === 2 && (
                        <div className="bg-[#FDFBF7] rounded-2xl p-5 text-[#0B3022] shadow-lg space-y-2.5">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">Real-Time Open Banking Ledger</h4>
                          {[
                            { title: "Direct Debit: Sarah J.", time: "Today, 08:00 AM", amount: "+₦100,000" },
                            { title: "Direct Debit: Michael O.", time: "Today, 08:01 AM", amount: "+₦100,000" },
                            { title: "Auto Payout: David K.", time: "Today, 08:05 AM", amount: "-₦1,000,000" }
                          ].map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 border-b border-gray-100 last:border-0 text-xs">
                              <div>
                                <p className="font-bold text-gray-900">{t.title}</p>
                                <p className="text-[10px] text-gray-400">{t.time}</p>
                              </div>
                              <span className={`font-mono font-bold ${t.amount.startsWith('+') ? 'text-emerald-600' : 'text-[#C5A059]'}`}>
                                {t.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                    <span>Live Mono Open Banking Feed</span>
                    <span className="text-[#C5A059] font-bold">100% Non-Custodial</span>
                  </div>
                </div>
              </motion.div>
            </div>

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
          {/* 3-Way Direct Head-to-Head Comparison */}
          <div className="max-w-6xl mx-auto mb-20">
            <motion.div variants={fadeIn} className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
                Uncompromising Distinction
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B3022] font-serif mb-4">
                How Àjọṣe Compares to WhatsApp Groups &amp; Solo Apps
              </h2>
              <p className="text-[#1F2937]/80 text-base md:text-lg max-w-2xl mx-auto">
                Why Nigeria&rsquo;s smartest circles choose automated enforcement over manual WhatsApp chaos or solo-saving apps.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-[#FDFBF7] rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="bg-[#0B3022] text-white">
                      <th className="p-5 md:p-6 text-sm font-bold w-1/4">Key Capability</th>
                      <th className="p-5 md:p-6 text-sm font-bold text-gray-300 w-1/4 text-center">
                        <span className="block text-white">WhatsApp Groups</span>
                        <span className="text-[10px] text-gray-400 font-normal">Traditional Peer Thrift</span>
                      </th>
                      <th className="p-5 md:p-6 text-sm font-bold text-gray-300 w-1/4 text-center">
                        <span className="block text-white">Solo Apps</span>
                        <span className="text-[10px] text-gray-400 font-normal">Isolated Personal Lock</span>
                      </th>
                      <th className="p-5 md:p-6 text-sm font-bold text-[#C5A059] w-1/4 text-center bg-[#072418]">
                        <span className="block text-[#C5A059]">Àjọṣe Platform</span>
                        <span className="text-[10px] text-[#C5A059]/80 font-normal">Automated Rotational Engine</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs md:text-sm">
                    {[
                      {
                        title: "Rotating Lump-Sum Payout",
                        desc: "Get large capital multiplier on your assigned turn",
                        whatsapp: { text: "High Default Risk", sub: "People vanish after collecting", status: "warn" },
                        fintech: { text: "No (Solo Only)", sub: "Save alone with zero leverage", status: "bad" },
                        ajose: { text: "Automated & Enforced", sub: "Guaranteed turns with identity locks", status: "good" }
                      },
                      {
                        title: "Automated Bank Sweeps",
                        desc: "Morning direct-debit on contribution date",
                        whatsapp: { text: "Manual Transfers", sub: "Fake receipt screenshots & drama", status: "bad" },
                        fintech: { text: "Automated Debit", sub: "Debited into company omnibus pool", status: "neutral" },
                        ajose: { text: "Direct Open-Banking", sub: "Automated via Mono (NIBSS rail)", status: "good" }
                      },
                      {
                        title: "Defaulter Protection",
                        desc: "Sanctions when a member misses their turn payment",
                        whatsapp: { text: "None (Endless Wahala)", sub: "Damaged relationships & lost money", status: "bad" },
                        fintech: { text: "N/A", sub: "No peer group accountability", status: "neutral" },
                        ajose: { text: "Credit Score Penalty", sub: "Nationwide blacklist & 15% fine", status: "good" }
                      },
                      {
                        title: "Fund Custody & Safety",
                        desc: "Where your contributions are held",
                        whatsapp: { text: "Admin Personal Acct", sub: "Risky phone custody with organizer", status: "bad" },
                        fintech: { text: "Corporate Omnibus", sub: "Fintech company holds the funds", status: "neutral" },
                        ajose: { text: "100% Non-Custodial", sub: "Direct pass-through to collector", status: "good" }
                      },
                      {
                        title: "Organizer Monetization",
                        desc: "Commission for running circles",
                        whatsapp: { text: "Awkward Deductions", sub: "Manual cuts cause group suspicion", status: "bad" },
                        fintech: { text: "0% Admin Cut", sub: "Platform keeps all yield & spread", status: "bad" },
                        ajose: { text: "0–15% Automated Cut", sub: "Verified earnings paid directly to Admin", status: "good" }
                      }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/20 transition-colors">
                        <td className="p-4 md:p-6 font-bold text-[#0B3022]">
                          <div>{row.title}</div>
                          <div className="text-[11px] text-gray-500 font-normal mt-0.5">{row.desc}</div>
                        </td>
                        <td className="p-4 md:p-6 text-center text-gray-700 bg-red-50/10">
                          <span className="font-semibold text-rose-800 text-xs block">{row.whatsapp.text}</span>
                          <span className="text-[10px] text-gray-500">{row.whatsapp.sub}</span>
                        </td>
                        <td className="p-4 md:p-6 text-center text-gray-700">
                          <span className="font-semibold text-gray-800 text-xs block">{row.fintech.text}</span>
                          <span className="text-[10px] text-gray-500">{row.fintech.sub}</span>
                        </td>
                        <td className="p-4 md:p-6 text-center bg-[#C5A059]/10 border-x border-[#C5A059]/30">
                          <span className="font-bold text-[#0B3022] text-xs flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {row.ajose.text}
                          </span>
                          <span className="text-[10px] text-[#0B3022]/80 font-medium block mt-0.5">{row.ajose.sub}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Left: Pricing Section */}
            <div className="flex flex-col h-full">
              <motion.div variants={fadeIn} className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B3022] mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-[#1F2937]/80 text-lg">
                  No hidden fees, no subscriptions. Select the schedule that works best for your circle.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="flex-1 bg-white rounded-3xl shadow-xl border-2 border-[#C5A059] overflow-hidden flex flex-col transform hover:scale-[1.01] transition-transform duration-300">
                <div className="bg-[#0B3022] p-6 text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[#C5A059]/10"></div>
                  <h3 className="text-2xl font-bold relative z-10">Flexible Circle Plans</h3>
                  <p className="text-[#C5A059] text-xs font-bold uppercase tracking-wider mt-1 relative z-10">
                    Zero Hidden Fees &bull; Guaranteed Rotations
                  </p>
                </div>
                
                {/* 3 Schedule Options Breakdown */}
                <div className="p-6 divide-y divide-gray-100 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FDFBF7] border border-gray-200">
                      <div>
                        <span className="text-xs font-bold text-[#0B3022] flex items-center gap-1.5">
                          📅 Monthly Groups
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5">Open-Banking Protection fee &bull; 0% on member debits</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-[#0B3022]">2%</span>
                        <span className="text-[10px] text-gray-400 block font-semibold">Capped at ₦10k Max</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <div>
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          🗓 Weekly Groups
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-0.5">0% payout fees! Auto-debit via Mono</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-[#0B3022]">₦300</span>
                        <span className="text-[10px] text-emerald-700 block font-bold">/ transaction</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                      <div>
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          📌 Daily Groups
                        </span>
                        <p className="text-[11px] text-amber-800 mt-0.5">0% payout fees! Daily thrift micro-debit</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-[#0B3022]">₦100</span>
                        <span className="text-[10px] text-amber-700 block font-bold">/ transaction</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2.5 text-xs text-[#1F2937]/80 font-medium">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Free to create an account &amp; join unlimited circles</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct pass-through bank settlement &amp; immutable ledger</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <Link
                      href="/signup"
                      className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-[#0B3022] hover:bg-[#154634] text-sm font-bold text-white shadow-md transition-all"
                    >
                      Create a Group Free
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex h-12 items-center justify-center px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-bold text-[#0B3022] transition-all"
                    >
                      Full Pricing
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Default Protection Protocol Guarantee */}
            <div className="flex flex-col h-full mt-12 lg:mt-0">
              <motion.div variants={fadeIn} className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B3022] mb-4">
                  What Happens If Someone Doesn&rsquo;t Pay?
                </h2>
                <p className="text-[#1F2937]/80 text-lg">
                  Every rotational circle is protected by automated enforcement rails.
                </p>
              </motion.div>

              <motion.div variants={fadeIn} className="flex-1 bg-white rounded-3xl shadow-xl border-2 border-emerald-600/30 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-6">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Multi-Layer Default Protection Protocol</span>
                  </div>

                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0B3022] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0B3022]">Automated Retry Sweeps</h4>
                        <p className="text-xs text-gray-600 mt-0.5">If morning sweep fails due to insufficient balance, automatic retry sweeps trigger at 12:00 PM and 6:00 PM.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0B3022] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0B3022]">Credit Bureau Score Degradation</h4>
                        <p className="text-xs text-gray-600 mt-0.5">The defaulter&rsquo;s Ajo Credit Score drops by -10 points and automatically freezes them from joining other circles nationwide.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0B3022] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0B3022]">Automated Fallback Notifications</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Instant 1-click fallback bank transfer link sent directly via SMS and WhatsApp.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0B3022] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0B3022]">15% Penalty Redistribution</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Late settlement penalties (15%) are distributed directly to compensate the affected circle members.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Turn by turn, guaranteed.</span>
                  <Link href="/pricing" className="text-xs font-bold text-[#0B3022] hover:text-[#C5A059] flex items-center gap-1">
                    <span>Calculate Your Pot Payout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Interactive Organizer Revenue Simulator (B2B Engine) */}
      <section className="w-full py-20 md:py-28 bg-[#FDFBF7] relative z-10 border-t border-gray-200">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          <InteractiveRevenueCalculator showTitle={true} />
        </div>
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

      {/* Testimonials Section: "Loved by Communities" */}
      <section id="testimonials" className="w-full py-24 md:py-32 bg-gradient-to-b from-[#FAF7F0] via-[#F4F1EA] to-[#ECE7DC] relative z-10 border-t border-gray-200 overflow-hidden">
        
        {/* Multi-layered Atmospheric Background of Country Flags */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#C5A059]/12 blur-[130px] rounded-full" />
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-700/8 blur-[120px] rounded-full" />

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
            { code: "TT", name: "Trinidad", tag: "Sou-sou", pos: "top-[5%] right-[20%] hidden xl:flex", anim: "animate-float-slow" }
          ].map((item, idx) => (
            <div key={idx} className={`absolute ${item.pos} ${item.anim} hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-[#C5A059]/30 shadow-[0_6px_20px_rgba(11,48,34,0.06)] z-0`}>
              <CountryFlag code={item.code} size="xs" rounded={true} />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-bold text-[#0B3022] tracking-tight">{item.name}</span>
                <span className="text-[9px] text-[#C5A059] font-medium tracking-wide">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="container mx-auto px-6 lg:px-12 relative z-10"
        >
          {/* Header Block with Diaspora Indicator */}
          <motion.div variants={fadeIn} className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-[#C5A059]/40 shadow-xs backdrop-blur-md mb-4">
              <div className="flex items-center gap-1.5">
                <CountryFlag code="NG" size="xs" />
                <CountryFlag code="GB" size="xs" />
                <CountryFlag code="US" size="xs" />
                <CountryFlag code="CA" size="xs" />
                <CountryFlag code="GH" size="xs" />
                <CountryFlag code="KE" size="xs" />
              </div>
              <span className="text-xs font-bold text-[#0B3022] tracking-wide">
                Built for Nigerians at Home &amp; Diaspora Circles
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">
              Loved by Communities
            </h2>
            <p className="text-[#1F2937]/80 max-w-2xl mx-auto text-base sm:text-lg">
              From Lagos and London to Accra and Atlanta, hear how circle organizers and savers manage their rotations with trust and zero wahala.
            </p>
          </motion.div>
          
          {/* Interactive Community Testimonials Carousel: Pause on Hover (Desktop), Pause on Tap, Native Touch Swipe/Scroll (Mobile) */}
          {communityTestimonials.length > 2 ? (
            <CommunityTestimonialsCarousel testimonials={communityTestimonials} />
          ) : (
            /* Classic Static Grid for <= 2 items */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {communityTestimonials.map((testimonial, i) => (
                <motion.div 
                  variants={fadeIn}
                  key={i} 
                  className="bg-[#FDFBF7] p-8 rounded-2xl shadow-md border border-[#C5A059]/25 flex flex-col justify-between hover:shadow-xl hover:border-[#C5A059]/60 transition-all duration-300"
                  whileHover={{ y: -5, boxShadow: "0px 12px 35px rgba(0,0,0,0.06)" }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B3022]/5 border border-[#0B3022]/10 text-xs font-semibold text-[#0B3022]">
                        <CountryFlag code={testimonial.countryCode || "NG"} size="xs" />
                        <span>{testimonial.location || testimonial.country || "Nigeria"}</span>
                      </div>
                    </div>
                    <p className="text-[#1F2937]/90 text-lg leading-relaxed mb-8 italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-[#0B3022] flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.author ? testimonial.author[0] : "A"}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0B3022]">{testimonial.author}</h4>
                      <p className="text-sm text-[#1F2937]/60">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
              { q: "When are contributions and payouts collected?", a: "Collection schedules are tailored by frequency to align with Nigerian cashflows: Daily groups sweep every morning with 24-hr turn payouts; Weekly groups feature a 2-day grace period (opens Monday, cutoff Tuesday); and Monthly groups feature a 5-day grace period (opens 1st, cutoff and payouts on the 5th) to match monthly salary cycles." },
              { q: "What happens if someone refuses to pay?", a: "Ajo is built on trust. As an Admin, you should only invite people you trust. If someone misses a payment, the Admin can manually mark them as defaulted on the platform, freezing their payouts and warning the group. Defaulting also incurs a -50 point penalty to their global Ajo Credit Score." },
              { q: "Can I leave a group before the cycle ends?", a: "Once a group cycle is marked as 'Active' by the Admin, the roster is locked. This ensures that people who have already collected their payout cannot abandon the group before paying back into the pool." },
              { q: "What is the Ajo Credit Score?", a: "Your Ajo Credit Score is a global metric that tracks your reliability across all groups. You gain points for successful contributions and lose 50 points immediately if you default. A low score will automatically restrict you from joining high-value groups." },
              { q: "Are there any fees?", a: "Simple, transparent pricing with no hidden fees or subscriptions! Our commercial fees depend on your circle schedule: 📅 Monthly Groups: 2% flat fee deducted only on successful payouts (strictly capped at ₦10,000 max, ₦0 per-transaction fee); 🗓 Weekly Groups: 0% payout fees! Just a flat ₦300 automated processing fee per transaction; 📌 Daily Groups: 0% payout fees! Just a flat ₦100 automated processing fee per transaction. Group Admins may also set an optional management commission percentage, clearly displayed before you join." },
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
            Ready to secure your Ajo group?
          </motion.h2>
          <motion.p variants={fadeIn} className="text-xl text-gray-300 mb-10 max-w-2xl">
            Upgrade from stressful WhatsApp groups and manual ledgers to Àjọṣe. Turn by turn, no wahala.
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

