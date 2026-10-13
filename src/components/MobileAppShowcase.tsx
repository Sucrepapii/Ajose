"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Smartphone, Check } from "lucide-react";

export function MobileAppShowcase() {
  return (
    <section id="mobile-app" className="w-full py-20 sm:py-28 md:py-36 bg-[#04130C] relative z-10 overflow-hidden border-t border-emerald-950/60">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-[-10%] w-[520px] h-[520px] bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#C5A059]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(16,185,129,0.06),rgba(0,0,0,0))] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy & Coming Soon Status */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            {/* Pill Badge: Mobile App */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d2a20]/90 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md mb-6 sm:mb-8 shadow-[0_0_20px_rgba(20,184,166,0.18)]"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>Mobile App</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6"
            >
              Turn-by-turn contribution,
              <br />
              <span className="text-[#2DD4BF]">in your </span>
              <span className="text-[#FBBF24]">pocket.</span>
            </motion.h2>

            {/* Body Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-300/90 text-base sm:text-lg leading-relaxed max-w-xl mb-8"
            >
              Take your contribution circle wherever you go. Track turns on the fly, automate daily and monthly sweeps seamlessly, and get real-time payout notifications directly to your phone.
            </motion.p>

            {/* Core Value Highlights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 w-full max-w-lg"
            >
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-gray-200">Real-Time Turn Notifications</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-gray-200">Zero WhatsApp Chasing</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-gray-200">Automated Direct Debit Sweeps</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-gray-200">Bank-Grade Biometrics &amp; BVN</span>
              </div>
            </motion.div>

            {/* Bottom Controls: Currently "Coming Soon", Store buttons ready below when launched */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-2"
            >
              {/* CURRENT ACTIVE STATE: Coming Soon Badge */}
              <div className="inline-flex flex-col items-start px-6 py-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl shadow-xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>iOS &amp; Android</span>
                </div>
                <span className="text-sm sm:text-base font-black text-[#FBBF24] tracking-wider mt-1">
                  COMING SOON
                </span>
              </div>

              {/* 
              ========================================================================
              PRODUCTION STORE BUTTONS (Uncomment when App Store / Play Store / APK are ready)
              ========================================================================
              <div className="flex flex-wrap items-center gap-3.5 mt-4">
                // Apple App Store / TestFlight
                <a
                  href="https://apps.apple.com/app/ajose/idXXXXXXXXX" // OR TestFlight: "https://testflight.apple.com/join/XXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white shadow-xl transition-all hover:scale-105 active:scale-95 group"
                >
                  <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.88-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.75-.95 2.79 1.02.08 2.06-.52 2.69-1.28z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Download on the</div>
                    <div className="text-sm font-bold text-white tracking-wide">App Store</div>
                  </div>
                </a>

                // Google Play / Android APK
                <a
                  href="https://play.google.com/store/apps/details?id=com.ajose.app" // OR APK direct download: "/downloads/ajose.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white shadow-xl transition-all hover:scale-105 active:scale-95 group"
                >
                  <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186c-.378-.344-.61-.837-.61-1.386V3.2c0-.549.232-1.042.609-1.386zm11.238 11.242l2.368 2.368-12.04 6.949 9.672-9.317zm0-2.112L5.175 1.627l12.04 6.949-2.368 2.368zm1.055 1.056l3.522 2.032c.983.567.983 1.492 0 2.06l-3.522 2.032-2.128-2.128 2.128-2.128z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">GET IT ON</div>
                    <div className="text-sm font-bold text-white tracking-wide">Google Play</div>
                  </div>
                </a>
              </div>
              */}
            </motion.div>

          </div>

          {/* Right Column: 3D Phone Mockup Visual */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full max-w-2xl group"
            >
              {/* Outer halo and glow effect */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500/20 via-emerald-500/15 to-[#C5A059]/25 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-300" />
              
              {/* Mockup Frame */}
              <div className="relative rounded-3xl overflow-hidden border border-emerald-500/25 bg-[#03100B] shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
                <Image
                  src="/mobile-app-showcase.jpg"
                  alt="Àjọṣe Rotational Savings Mobile App Mockup"
                  width={1200}
                  height={675}
                  priority
                  className="w-full h-auto object-cover transform group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                />

                {/* Floating Micro Badge 1 - Top Left */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3.5 py-2 rounded-2xl bg-[#061811]/90 backdrop-blur-md border border-emerald-500/40 shadow-xl flex items-center gap-2.5 pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="text-left">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Next Payout Ready</div>
                    <div className="text-xs font-black text-white">₦1,500,000 • In 2 Days</div>
                  </div>
                </div>

                {/* Floating Micro Badge 2 - Bottom Right */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-3.5 py-2 rounded-2xl bg-[#061811]/90 backdrop-blur-md border border-[#C5A059]/50 shadow-xl flex items-center gap-2.5 pointer-events-none">
                  <div className="w-7 h-7 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-xs">
                    ⚡
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-[#F3E5C8] font-bold uppercase tracking-wider">Automated Sweep</div>
                    <div className="text-xs font-black text-white">Mono Direct Debit Active</div>
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
