"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Rocket, Lock, ArrowRight, Zap, Users, CheckSquare, CreditCard, Landmark, ChevronDown, Activity, Check } from "lucide-react";

export default function Home() {
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#FDFBF7]">
      
      {/* Hero Section */}
      <section className="w-full bg-[#0B3022] pt-24 pb-32 md:pt-32 md:pb-40 relative z-10 overflow-hidden">
        {/* Subtle gold accent background element */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#C5A059]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Text */}
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
                The modern standard for Rotating Savings
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
                Managing your Ajo group just got world-class. Ditch the spreadsheets and WhatsApp groups. Ajo Circle brings institutional-grade tracking and accountability to your ROSCA.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-md bg-[#C5A059] px-8 text-base font-bold text-[#0B3022] shadow-lg hover:bg-[#A48243] transition-all"
                >
                  Create a Group Free
                </Link>
                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-md border-2 border-[#C5A059] px-8 text-base font-medium text-[#C5A059] hover:bg-[#C5A059]/10 transition-all"
                >
                  See how it works
                </Link>
              </div>
            </div>

            {/* Hero Dashboard Interactive Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative w-full fill-mode-both z-20"
            >
              <div className="bg-[#FDFBF7] rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>

                <div className="bg-[#F4F1EA] rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-[#0B3022] font-bold text-lg">Group Roster</h3>
                      <p className="text-[#1F2937]/70 text-sm">October Cycle</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">ACTIVE</div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { name: "Sarah J.", status: "Paid", icon: CheckSquare, color: "text-emerald-700", bg: "bg-emerald-100" },
                      { name: "Michael O.", status: "Paid", icon: CheckSquare, color: "text-emerald-700", bg: "bg-emerald-100" },
                      { name: "David K.", status: "Pending", icon: Activity, color: "text-amber-600", bg: "bg-amber-100" }
                    ].map((user, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#FDFBF7] border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0B3022] flex items-center justify-center text-xs font-bold text-white">{user.name[0]}</div>
                          <span className="text-sm font-semibold text-[#1F2937]">{user.name}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${user.bg} ${user.color}`}>
                          <user.icon className="w-3 h-3" />
                          {user.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0B3022] rounded-xl p-6 border border-[#0B3022] shadow-inner text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-gray-300 font-medium text-sm mb-1">Admin Projected Earnings</h3>
                    <p className="text-3xl font-bold text-[#C5A059]">₦450,000</p>
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

      {/* Value Proposition Section */}
      <section id="features" className="w-full py-24 md:py-32 bg-[#F4F1EA] relative z-10 border-b border-gray-200">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">
              Engineered for Trust & Transparency
            </h2>
            <p className="max-w-2xl text-[#1F2937]/80 text-lg">
              We've taken the traditional Ajo and wrapped it in a premium software experience. Everything you need to manage your group effortlessly.
            </p>
          </div>
          
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
                <button
                  key={i}
                  onClick={() => setActiveFeatureTab(i)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ${activeFeatureTab === i ? "border-[#C5A059] bg-[#FDFBF7] shadow-md" : "border-transparent hover:bg-[#FDFBF7]/50"}`}
                >
                  <h3 className={`text-xl font-bold mb-2 ${activeFeatureTab === i ? "text-[#0B3022]" : "text-[#1F2937]/70"}`}>{feature.title}</h3>
                  <p className={`text-sm leading-relaxed ${activeFeatureTab === i ? "text-[#1F2937]" : "text-[#1F2937]/50"}`}>
                    {feature.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Right side: Active Tab Display */}
            <div className="lg:w-2/3">
              <div className="bg-[#FDFBF7] rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl h-full flex flex-col justify-center relative overflow-hidden min-h-[400px]">
                {/* Decorative background flair */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-[50px] pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeatureTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
                              <li key={j} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C5A059]/20 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-[#C5A059]" />
                                </div>
                                <span className="text-[#1F2937] font-medium">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="w-full py-24 md:py-32 bg-[#FDFBF7] relative z-10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-4">
              How Ajo Circle Works
            </h2>
            <p className="text-[#1F2937]/80 max-w-2xl mx-auto text-lg">
              Four simple steps to secure, transparent rotating savings.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-1 bg-gray-100 z-0">
              <div className="absolute top-0 left-0 h-full bg-[#C5A059] w-full origin-left transform scale-x-100 transition-transform"></div>
            </div>
            
            {[
              {
                icon: Users,
                title: "Create Group",
                desc: "Set the contribution rules and invite trusted peers."
              },
              {
                icon: CheckSquare,
                title: "Members Join",
                desc: "System assigns turns and locks the roster when active."
              },
              {
                icon: CreditCard,
                title: "Contribute",
                desc: "Members pay their share directly to the Admin."
              },
              {
                icon: Landmark,
                title: "Payout",
                desc: "Admin routes the pooled funds to the receiving member."
              }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full bg-[#FDFBF7] border-4 border-[#C5A059] flex items-center justify-center mb-6 shadow-md z-10">
                  <step.icon className="h-8 w-8 text-[#0B3022]" />
                </div>
                <div className="bg-[#F4F1EA] rounded-lg p-5 border border-gray-100 w-full h-full shadow-sm">
                  <h3 className="text-sm font-bold text-[#C5A059] mb-1">STEP {i + 1}</h3>
                  <h4 className="text-xl font-bold text-[#0B3022] mb-3">{step.title}</h4>
                  <p className="text-[#1F2937]/80 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Block */}
      <section className="w-full py-24 md:py-32 bg-[#0B3022] relative z-10">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "Where does the money go?",
                a: "The money is collected by the Group Admin. Members pay their contributions directly to the Admin's bank account, and the Admin is responsible for transferring the final pool to the receiver. Ajo Circle simply provides the software to track these payments and turns."
              },
              {
                q: "What happens if someone refuses to pay?",
                a: "Ajo is built on trust. As an Admin, you should only invite people you trust. If someone misses a payment, the Admin can manually mark them as defaulted on the platform, freezing their payouts and warning the group."
              },
              {
                q: "Can I leave a group before the cycle ends?",
                a: "Once a group cycle is marked as 'Active' by the Admin, the roster is locked. This ensures that people who have already collected their payout cannot abandon the group before paying back into the pool."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-[#FDFBF7]/5 border border-white/10 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:bg-[#FDFBF7]/10 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg text-white">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-[#C5A059] group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="px-6 pb-6 text-gray-300 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
