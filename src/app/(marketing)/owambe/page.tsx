import type { Metadata } from "next";
import { Sparkles, ShieldCheck, Users, Calendar, MapPin, ArrowRight } from "lucide-react";
import { TableFundCreator } from "@/components/TableFundCreator";

export const metadata: Metadata = {
  title: "The Owambe Party Table Fund | Split VIP Tables with Friends — Àjọṣe",
  description: "Split a Silver (₦500k) or Gold (₦1M) table for The Owambe Party: Wazobia Extravaganza with 8 friends. Safe, automated, zero WhatsApp chasing. Powered by Àjọṣe.",
  alternates: {
    canonical: "/owambe",
  },
};

export default function OwambeTableFundPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FAF7F0] py-16 md:py-24">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A843]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#0B3022]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 max-w-5xl relative z-10 text-center">
        
        {/* Co-Branded Header Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 text-[#0B3022] text-xs font-mono font-bold uppercase tracking-wider mb-6">
          <span>Àjọṣe</span>
          <span className="text-[#D4A843]">✕</span>
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

        {/* Event Quick Meta Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-[#0B3022]/80 bg-white border border-[#0B3022]/10 py-3.5 px-6 rounded-2xl max-w-2xl mx-auto shadow-xs mb-12">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4A843]" />
            <span>Event: <strong>20 Dec 2026</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D4A843]" />
            <span>Amore Gardens, Lekki</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4A843]" />
            <span>Deadline: <strong>10 Dec 2026</strong></span>
          </div>
        </div>

        {/* Interactive Creator Component */}
        <TableFundCreator />

        {/* 3 Step How It Works Box */}
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

      </div>
    </main>
  );
}
