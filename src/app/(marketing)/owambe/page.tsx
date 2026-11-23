import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShieldCheck, Users, Calendar, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { TableFundCreator } from "@/components/TableFundCreator";
import { isOwambeExpired } from "@/utils/owambeConfig";

export const metadata: Metadata = {
  title: "The Owambe Party Table Fund | Split VIP Tables with Friends — Àjọṣe",
  description: "Split a Silver (₦500k) or Gold (₦1M) table for The Owambe Party: Wazobia Extravaganza with 8 friends. Safe, automated, zero WhatsApp chasing. Powered by Àjọṣe.",
  alternates: {
    canonical: "/owambe",
  },
  openGraph: {
    title: "The Owambe Party Table Fund | Split VIP Tables with Friends — Àjọṣe",
    description: "Split a Silver (₦500k) or Gold (₦1M) table for The Owambe Party: Wazobia Extravaganza with 8 friends. Safe, automated, zero WhatsApp chasing.",
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
    title: "The Owambe Party Table Fund | Split VIP Tables with Friends — Àjọṣe",
    description: "Split a Silver (₦500k) or Gold (₦1M) table for The Owambe Party: Wazobia Extravaganza with 8 friends. Powered by Àjọṣe.",
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
          className="w-full h-full max-w-5xl bg-no-repeat bg-contain bg-center opacity-[0.06] select-none filter contrast-125"
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

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#0B3022] font-serif mb-4 leading-tight">
          Split a VIP Table with Your Squad,{" "}
          <span className="font-editorial italic font-normal text-[#D4A843]">
            Turn by Turn, No Wahala.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#0B3022]/75 max-w-2xl mx-auto mb-8 leading-relaxed">
          Headed to the <strong>Wazobia Extravaganza</strong> on 20 December? Don&apos;t get stuck chasing 7 friends on WhatsApp for table money. Split a Silver or Gold Table through a verified <strong>Table Fund</strong>.
        </p>

        {/* Featured Official Event Showcase Card */}
        <div className="max-w-3xl mx-auto mb-10 bg-white border border-[#D4A843]/30 rounded-3xl p-5 sm:p-6 shadow-md text-left flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-44 sm:w-48 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-[#D4A843]/40 bg-[#0B3022]">
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
              <span>Official Event Financing Rail</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0B3022]">
              The Owambe Party: Wazobia Extravaganza
            </h2>
            <p className="text-xs sm:text-sm text-[#0B3022]/70 leading-relaxed">
              Brought to you by <strong>Spotlight by Mmakamba</strong> and supported by <strong>23/25 Entertainment</strong>. Live performances, cultural fashion, premium hospitality, and VIP squad tables.
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B3022]/60 block font-semibold">Venue</span>
                <span className="font-bold text-[#0B3022] flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A843]" />
                  <span>Amore Gardens, Lekki</span>
                </span>
              </div>
            </div>
            <div className="pt-2 text-[11px] font-mono text-[#0B3022]/70 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A843]" />
              <span>100% Escrow Protection &bull; Payment Deadline: <strong>10 Dec 2026</strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Creator Component */}
        <TableFundCreator />

        {/* 3 Step How It Works Box (Only shown if active) */}
        {!expired && (
          <div className="mt-20 pt-16 border-t border-[#0B3022]/10 text-left">
            <div className="text-center mb-12">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4A843] bg-[#0B3022] px-3 py-1 rounded-full inline-block mb-3">
                Simple 3-Step Flow
              </span>
              <h2 className="text-3xl font-bold font-serif text-[#0B3022]">How the Table Fund Works</h2>
              <p className="text-sm text-[#0B3022]/70 mt-1 max-w-lg mx-auto">
                Nobody gets stuck paying for everyone, and no table is booked until the money is complete.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-7 rounded-3xl border border-[#0B3022]/10 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3022] text-[#D4A843] font-mono font-bold flex items-center justify-center mb-4 text-base">
                  1
                </div>
                <h3 className="font-bold text-base text-[#0B3022] mb-2">Open Squad Table Fund</h3>
                <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                  The squad leader picks a Silver Table (₦500k) or Gold Table (₦1M) and enters their squad name to get an instant invite link.
                </p>
              </div>

              <div className="bg-white p-7 rounded-3xl border border-[#0B3022]/10 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3022] text-[#D4A843] font-mono font-bold flex items-center justify-center mb-4 text-base">
                  2
                </div>
                <h3 className="font-bold text-base text-[#0B3022] mb-2">8 Friends Pay Equal Share</h3>
                <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                  Each member clicks the WhatsApp link and pays their exact share (₦64,375 for Silver, ₦128,750 for Gold) before 10 December.
                </p>
              </div>

              <div className="bg-white p-7 rounded-3xl border border-[#0B3022]/10 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-[#0B3022] text-[#D4A843] font-mono font-bold flex items-center justify-center mb-4 text-base">
                  3
                </div>
                <h3 className="font-bold text-base text-[#0B3022] mb-2">Funds Released & Table Booked</h3>
                <p className="text-xs text-[#0B3022]/70 leading-relaxed">
                  Once 100% funded, funds release directly to The Owambe Party in one payment. If not funded by Dec 10, everyone gets an automatic refund.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
