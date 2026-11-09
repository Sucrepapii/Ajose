"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Smartphone, Check } from "lucide-react";

export function MobileAppShowcase() {
  return (
    <section
      id="mobile-app"
      className="w-full py-24 md:py-32 bg-[#071F16] text-[#F3EEE3] relative z-10 overflow-hidden border-b border-white/10"
    >
      {/* Subtle Architectural Grid & Ambient Glow */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #F3EEE3 1px, transparent 1px), linear-gradient(to bottom, #F3EEE3 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute bottom-[-15%] right-[-5%] w-[560px] h-[560px] bg-[#D4A843]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Copy & Coming Soon Status */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Pill Badge: Mobile App */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-[#F3EEE3] text-xs font-mono uppercase tracking-widest mb-6 sm:mb-8"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Native Mobile Experience</span>
            </motion.div>

            {/* Main Headline — Sans + Italic Editorial Serif + Gold Underline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-[#F3EEE3] leading-[1.08] mb-6"
            >
              Turn-by-turn contribution,{" "}
              <span className="block mt-1">
                in your{" "}
                <span className="relative inline-block font-editorial italic font-normal text-white pr-1">
                  pocket.
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#D4A843]"
                    viewBox="0 0 180 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9C48 3 122 2.5 177 7.5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </motion.h2>

            {/* Body Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#F3EEE3]/75 text-base sm:text-lg leading-relaxed max-w-xl mb-8"
            >
              Take your contribution circle wherever you go. Track turns on the fly, automate daily and monthly sweeps seamlessly, and get real-time payout alerts directly to your phone.
            </motion.p>

            {/* Core Value Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 w-full max-w-lg"
            >
              {[
                "Real-Time Turn Notifications",
                "Zero WhatsApp Chasing",
                "Automated Direct Debit Sweeps",
                "Bank-Grade Biometrics & BVN",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10"
                >
                  <Check className="w-4 h-4 text-[#D4A843] shrink-0" />
                  <span className="text-xs font-medium text-[#F3EEE3]/90">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* Coming Soon Pill Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-1"
            >
              <div className="inline-flex items-center gap-4 px-5 py-3.5 rounded-full bg-[#F3EEE3] text-[#111613] shadow-lg">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022]">
                  <span className="w-2 h-2 rounded-full bg-[#0B3022] animate-pulse" />
                  <span>iOS &amp; Android</span>
                </div>
                <span className="h-4 w-px bg-[#111613]/15" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4A843] text-[#0B3022]">
                  Coming Soon
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Layered Mockup Visual with Offset Gold Frame */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative w-full max-w-2xl group"
            >
              {/* Offset Burnished Gold Architectural Frame */}
              <div className="absolute inset-0 rounded-3xl border-2 border-[#D4A843]/45 translate-x-3 translate-y-3 pointer-events-none" />

              {/* Mockup Frame */}
              <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#0B3022] shadow-[0_25px_70px_rgba(0,0,0,0.65)]">
                <Image
                  src="/mobile-app-showcase.jpg"
                  alt="Àjọṣe Rotational Savings Mobile App Mockup"
                  width={1200}
                  height={675}
                  priority
                  className="w-full h-auto object-cover transform group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                />

                {/* Floating Micro Badge 1 - Top Left */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-2.5 rounded-2xl bg-[#111613]/95 backdrop-blur-md border border-white/15 shadow-xl flex items-center gap-2.5 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-[#D4A843] animate-pulse" />
                  <div className="text-left">
                    <div className="text-[10px] font-mono text-[#D4A843] font-bold uppercase tracking-wider">
                      Next Payout Ready
                    </div>
                    <div className="text-xs font-mono font-bold text-[#F3EEE3]">
                      ₦1,500,000 &bull; In 2 Days
                    </div>
                  </div>
                </div>

                {/* Floating Micro Badge 2 - Bottom Right */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-2.5 rounded-2xl bg-[#F3EEE3] text-[#111613] border border-[#111613]/15 shadow-xl flex items-center gap-2.5 pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-[#0B3022] text-[#D4A843] flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-mono text-[#111613]/60 font-bold uppercase tracking-wider">
                      Automated Sweep
                    </div>
                    <div className="text-xs font-bold text-[#0B3022]">
                      Mono Direct Debit Active
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
