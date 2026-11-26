import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShieldCheck, Users, Calendar, ArrowLeft } from "lucide-react";
import { TableFundCreator } from "@/components/TableFundCreator";
import { isOwambeExpired } from "@/utils/owambeConfig";

export const metadata: Metadata = {
  title: "The Owambe Party Table Fund | Split VIP Tables of 10 with Friends — Àjọṣe",
  description: "Split a Silver (₦500k) or Gold (₦1M) VIP table of 10 for The Owambe Party: Wazobia Extravaganza with your squad. Safe, automated, zero WhatsApp chasing. Powered by Àjọṣe.",
  alternates: {
    canonical: "/owambe",
  },
  openGraph: {
    title: "The Owambe Party Table Fund | Your Table. Your Squad. Your Owambe!",
    description: "Good times are better shared! Split a Silver (₦500k) or Gold (₦1M) table of 10 for The Owambe Party with your squad. Powered by Àjọṣe.",
    url: "https://ajose.ng/owambe",
    siteName: "Àjọṣe",
    images: [
      {
        url: "/owambe-poster.jpg",
        width: 1080,
        height: 1350,
        alt: "The Owambe Party (Wazobia Extravaganza) Official Poster",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Owambe Party Table Fund | Split VIP Tables of 10 — Àjọṣe",
    description: "Your Table. Your Squad. Your Owambe! Split a Silver (₦500k) or Gold (₦1M) table of 10 with a low 1% fee.",
    images: ["/owambe-poster.jpg"],
  },
};

export default function OwambeTableFundPage() {
  const expired = isOwambeExpired();

  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FAF7F0] py-16 md:py-24">
      {/* Official Event Poster Watermark Backdrop */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <div 
          className="w-full h-full max-w-5xl bg-no-repeat bg-contain bg-center opacity-[0.05] select-none filter contrast-125"
          style={{ backgroundImage: "url('/owambe-poster.jpg')" }}
        />
      </div>

      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A843]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#0B3022]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 max-w-5xl relative z-10 text-center">
        
        {/* Back to Home Button */}
        <div className="w-full flex justify-start mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold bg-[#D4A843] hover:bg-[#dfba5b] text-[#0B3022] px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Co-Branded Header Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 text-[#0B3022] text-xs font-mono font-bold uppercase tracking-wider mb-6">
          <span>Àjọṣe</span>
          <span className="text-[#D4A843]">&times;</span>
          <span>The Owambe Party</span>
        </div>

        {/* Hero Title Matching Campaign Poster */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#0B3022] font-serif mb-3 leading-tight">
          YOUR TABLE. YOUR SQUAD.{" "}
          <span className="font-editorial italic font-normal text-[#D4A843] block sm:inline">
            YOUR OWAMBE!
          </span>
        </h1>

        <p className="text-xs sm:text-sm font-bold text-[#D4A843] uppercase tracking-[0.2em] font-mono mb-4">
          GOOD TIMES ARE BETTER SHARED!
        </p>

        <p className="text-base sm:text-lg text-[#0B3022]/75 max-w-2xl mx-auto mb-8 leading-relaxed">
          Bring your favourite people together and experience the ultimate Owambe celebration on 20 December at Amore Gardens, Lekki. With Àjọṣe, splitting a Table of 10 with your squad is seamless—no awkward WhatsApp chasing, no upfront burden.
        </p>

        {/* Featured Official Event Showcase Card */}
        <div className="max-w-3xl mx-auto mb-10 bg-white border border-[#D4A843]/30 rounded-3xl p-5 sm:p-6 shadow-md text-left flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-44 sm:w-52 aspect-[4/5] shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-[#D4A843]/40 bg-[#0B3022]">
            <Image
              src="/owambe-poster.jpg"
              alt="The Owambe Party (Wazobia Extravaganza) Official Poster"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A843]/15 border border-[#D4A843]/30 text-[#0B3022] text-[11px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>Official Event Financing Partner &bull; Dec 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0B3022]">
              The Owambe Party: Wazobia Extravaganza
            </h2>
            <p className="text-xs sm:text-sm text-[#0B3022]/70 leading-relaxed">
              Brought to you by <strong>Spotlight by Mmakamba</strong> and supported by <strong>23/25 Entertainment</strong>. Premium VIP table hospitality, cultural fashion, and live musical entertainment.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B3022]/60 block font-semibold">Date &amp; Time</span>
                <span className="font-bold text-[#0B3022] flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4A843]" />
                  <span>Sunday, 20 Dec 2026 &bull; 5 PM</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B3022]/60 block font-semibold">Table Capacity</span>
                <span className="font-bold text-[#0B3022] flex items-center gap-1.5 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-[#D4A843]" />
                  <span>10 People per Table</span>
                </span>
              </div>
            </div>
            <div className="pt-2 text-[11px] font-mono text-[#0B3022]/70 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>100% Escrow Protection &bull; Payment Deadline: <strong>20 Dec 2026 (Event Day)</strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Creator Component */}
        <TableFundCreator />

        {/* 5-Step How It Works Box (Direct from Guide Flyer) */}
        {!expired && (
          <div className="mt-20 pt-16 border-t border-[#0B3022]/10 text-left">
            <div className="text-center mb-12">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4A843] bg-[#0B3022] px-3.5 py-1.5 rounded-full inline-block mb-3">
                HOW IT WORKS
              </span>
              <h2 className="text-3xl font-bold font-serif text-[#0B3022]">How the Squad Table Fund Works</h2>
              <p className="text-sm text-[#0B3022]/70 mt-1 max-w-lg mx-auto">
                Nobody gets stuck paying for everyone, and no table is booked until the money is complete.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#0B3022]/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-[#0B3022] text-[#D4A843] font-mono font-bold flex items-center justify-center mb-3 text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-sm text-[#0B3022] mb-1.5">Get Your Squad Together</h3>
                  <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                    Round up your favourite circle of 10 friends, colleagues, or family members.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#0B3022]/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-[#0B3022] text-[#D4A843] font-mono font-bold flex items-center justify-center mb-3 text-sm">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-[#0B3022] mb-1.5">Choose Preferred Table</h3>
                  <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                    Pick a Silver Table (₦500k = ₦50,000 each) or Gold Table (₦1M = ₦100,000 each).
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#0B3022]/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-[#0B3022] text-[#D4A843] font-mono font-bold flex items-center justify-center mb-3 text-sm">
                    3
                  </div>
                  <h3 className="font-bold text-sm text-[#0B3022] mb-1.5">Create Àjọṣe Table Fund</h3>
                  <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                    Enter your squad name to generate your instant WhatsApp shareable link. No sign-up required.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#0B3022]/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-[#0B3022] text-[#D4A843] font-mono font-bold flex items-center justify-center mb-3 text-sm">
                    4
                  </div>
                  <h3 className="font-bold text-sm text-[#0B3022] mb-1.5">Everyone Contributes</h3>
                  <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                    Each member clicks the WhatsApp link and pays their exact share directly on or before 20 December (the day of the event).
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#0B3022]/10 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-[#D4A843] text-[#0B3022] font-mono font-bold flex items-center justify-center mb-3 text-sm">
                    5
                  </div>
                  <h3 className="font-bold text-sm text-[#0B3022] mb-1.5">Get Ready to Party!</h3>
                  <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                    Once 10/10 have paid, your table is automatically confirmed and locked with the event organizers.
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Bottom Ribbon Banner */}
            <div className="mt-8 bg-gradient-to-r from-[#0B3022] via-[#124230] to-[#0B3022] border-2 border-[#D4A843] rounded-2xl py-4 px-6 text-center shadow-lg">
              <span className="font-mono font-extrabold text-sm sm:text-base tracking-[0.2em] text-[#D4A843] uppercase">
                SQUAD UP. SPLIT SMART. PARTY TOGETHER!
              </span>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
