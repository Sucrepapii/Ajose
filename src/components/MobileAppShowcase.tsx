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
      {/* Ambient Glow */}
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

            {/* App Store Download & Launch Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-2 flex flex-wrap items-center gap-4"
            >
              {/* Google Play Store Live Button */}
              <a
                href="https://play.google.com/store/apps/details?id=ng.ajose.app&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#F3EEE3] text-[#0B3022] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all hover:scale-[1.02] active:scale-95 group"
                aria-label="Get Àjọṣe on Google Play Store"
              >
                <svg className="w-7 h-7 text-[#0B3022] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186a1.986 1.986 0 0 1-.22-.914V2.728c0-.334.08-.65.22-.914zm11.233 11.234l2.124 2.124-11.83 6.702 9.706-8.826zm2.846-1.776l3.356 1.903a1.493 1.493 0 0 1 0 2.585l-3.356 1.903-2.383-2.383 2.383-2.408zm-2.846-1.777L5.137 2.13l11.83 6.702-2.124 2.124z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-wider text-[#0B3022]/70">
                    GET IT ON
                  </span>
                  <span className="block text-base font-bold text-[#0B3022] tracking-tight">
                    Google Play
                  </span>
                </div>
              </a>

              {/* iOS App Store Badge (Coming Soon) */}
              <div className="inline-flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white/[0.06] border border-white/15 text-[#F3EEE3]/80 backdrop-blur-sm">
                <svg className="w-6 h-6 text-[#F3EEE3]/80 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.34-.56.64-.99 1.71-.86 2.73 1.01.08 2.02-.51 2.55-1.22z"/>
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-wider text-[#D4A843]">
                    APPLE APP STORE
                  </span>
                  <span className="block text-sm font-semibold text-[#F3EEE3]">
                    Coming Soon
                  </span>
                </div>
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
