"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Rocket, Lock, ArrowRight, Zap, PiggyBank, Users, CheckSquare, CreditCard, Landmark, ChevronDown, Globe2, Activity } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        {/* Hero Section */}
        <section className="w-full pt-32 pb-24 md:pt-40 md:pb-32 flex flex-col items-center text-center px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300 mb-8 backdrop-blur-md">
              <Globe2 className="h-4 w-4 text-emerald-400" />
              <span>The modern standard for Rotating Savings</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter max-w-5xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-8 leading-[1.1]">
              Managing your Ajo group just got world-class.
            </h1>
            
            <p className="max-w-[700px] mx-auto text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed">
              Ditch the spreadsheets and WhatsApp groups. AjoCore brings institutional-grade tracking and accountability to your ROSCA (Rotating Savings and Credit Association).
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                href="/signup"
                className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:bg-zinc-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 gap-2 group w-full sm:w-auto"
              >
                Create a Group Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-white transition-all hover:bg-white/10 backdrop-blur-md w-full sm:w-auto"
              >
                See how it works
              </Link>
            </div>
          </motion.div>

          {/* Floating Hero UI Elements */}
          <motion.div 
            className="mt-24 w-full max-w-5xl relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-20 h-[150%] pointer-events-none"></div>
            
            <div className="relative z-10 bg-[#0F0F0F] border border-white/10 rounded-3xl p-4 shadow-2xl mx-auto w-full md:w-[800px] overflow-hidden">
              <div className="flex items-center gap-2 mb-4 px-2 opacity-50">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-white font-bold text-lg">Group Roster</h3>
                      <p className="text-zinc-500 text-sm">October Cycle</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">ACTIVE</div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: "Sarah J.", status: "Paid", icon: CheckSquare, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { name: "Michael O.", status: "Paid", icon: CheckSquare, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { name: "David K.", status: "Pending", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" }
                    ].map((user, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-white">{user.name[0]}</div>
                          <span className="text-sm font-medium text-zinc-300">{user.name}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.bg} ${user.color}`}>
                          <user.icon className="w-3 h-3" />
                          {user.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl p-6 border border-amber-500/20 flex flex-col justify-between">
                  <div>
                    <h3 className="text-amber-500/80 font-medium text-sm mb-2">Admin Projected Earnings</h3>
                    <p className="text-3xl font-bold text-white">₦450,000</p>
                  </div>
                  <div className="mt-8 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-200">Across 3 active groups managed</p>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
        </section>



        {/* Features Section */}
        <section id="features" className="w-full py-24 md:py-32 relative z-10">
          <motion.div 
            className="container mx-auto px-4 md:px-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center justify-center text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Engineered for Trust & Transparency
              </h2>
              <p className="max-w-2xl text-zinc-400 text-lg md:text-xl">
                We've taken the traditional Ajo and wrapped it in a premium software experience. Everything you need to manage your group effortlessly.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
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
                <div key={i} className="flex flex-col items-start p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:-translate-y-1 group">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
            </motion.div>
          </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-24 md:py-32 bg-black relative z-10 border-t border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          
          <motion.div 
            className="container mx-auto px-4 md:px-6"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                How AjoCore Works
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                Four simple steps to secure, transparent rotating savings.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-white/10 z-0"></div>
              
              {[
                {
                  icon: Users,
                  title: "1. Create Group",
                  desc: "Set the contribution rules and invite trusted peers."
                },
                {
                  icon: CheckSquare,
                  title: "2. Members Join",
                  desc: "System assigns turns and locks the roster when active."
                },
                {
                  icon: CreditCard,
                  title: "3. Contribute",
                  desc: "Members pay their share directly to the Admin."
                },
                {
                  icon: Landmark,
                  title: "4. Payout",
                  desc: "Admin routes the pooled funds to the receiving member."
                }
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-20 h-20 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center mb-6 shadow-xl group-hover:border-emerald-500/50 transition-colors">
                    <step.icon className="h-8 w-8 text-white group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
                </div>
              ))}
            </div>
            </motion.div>
          </section>

        {/* FAQ Section */}
        <section className="w-full py-24 md:py-32 bg-[#0A0A0A] relative z-10">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  q: "Where does the money go?",
                  a: "The money is collected by the Group Admin. Members pay their contributions directly to the Admin's bank account, and the Admin is responsible for transferring the final pool to the receiver. AjoCore simply provides the software to track these payments and turns."
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
                <details key={i} className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:bg-white/[0.04] transition-colors">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg text-zinc-200 hover:text-white transition-colors">
                    {faq.q}
                    <ChevronDown className="h-5 w-5 text-zinc-500 group-open:rotate-180 transition-transform duration-300" />
                  </summary>
                  <div className="px-6 pb-6 text-zinc-400 leading-relaxed">
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
