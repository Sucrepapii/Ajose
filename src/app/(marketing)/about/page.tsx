import { Users, Target, ShieldCheck, Sparkles, HeartHandshake, Quote } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Àjọṣe",
  description: "Saving together should never cost you your money. Àjọṣe brings accountability and simple software to the oldest way people save together: the circle.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-20 md:py-28">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        
        {/* Hero Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/5 border border-[#0B3022]/15 mb-6">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span className="text-xs font-semibold text-[#0B3022] uppercase tracking-wider">Our Purpose</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B3022] mb-6 font-serif">
            About Àjọṣe
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-[#0B3022] max-w-3xl mx-auto leading-snug mb-4">
            Saving together should never cost you your money.
          </p>
          <p className="text-lg md:text-xl text-[#1F2937]/80 leading-relaxed max-w-2xl mx-auto">
            Àjọṣe brings accountability and simple software to the oldest way people save together: the circle.
          </p>
        </div>

        {/* What Àjọṣe means Section */}
        <div className="mb-20 bg-gradient-to-b from-[#0B3022] to-[#072418] text-white rounded-3xl p-8 sm:p-12 border border-[#C5A059]/30 shadow-xl relative overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 mb-6 backdrop-blur-md">
              <HeartHandshake className="w-4 h-4 text-[#C5A059]" />
              <span className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider">Etymology &amp; Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 font-serif">
              What Àjọṣe means
            </h2>

            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-8">
              <strong className="text-white font-serif">Àjọṣe</strong> is a Yoruba word for relationship and cooperation, people doing things together. It comes from <strong className="text-[#C5A059]">a</strong> (we), <strong className="text-[#C5A059]">jọ</strong> (together), and <strong className="text-[#C5A059]">ṣe</strong> (to do).
            </p>

            {/* Root Word Breakdown Cards: A, Jọ, Ṣe */}
            <div className="grid sm:grid-cols-3 gap-5 mb-8 text-left max-w-3xl mx-auto">
              
              {/* Card 1: A */}
              <div className="bg-[#0B3827]/80 border border-[#C5A059]/30 rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-serif font-black text-2xl mb-3">
                  A
                </div>
                <h4 className="text-xl font-bold text-white mb-1">&ldquo;A&rdquo;</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Means <strong className="text-[#C5A059]">&ldquo;we.&rdquo;</strong> It speaks to the collective community — no one journeys alone.
                </p>
              </div>

              {/* Card 2: Jo */}
              <div className="bg-[#0B3827]/80 border border-[#C5A059]/30 rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-serif font-black text-2xl mb-3">
                  Jọ
                </div>
                <h4 className="text-xl font-bold text-white mb-1">&ldquo;Jọ&rdquo;</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Means <strong className="text-[#C5A059]">&ldquo;together.&rdquo;</strong> Bringing people together in mutual solidarity and trust.
                </p>
              </div>

              {/* Card 3: Se */}
              <div className="bg-[#0B3827]/80 border border-[#C5A059]/30 rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-serif font-black text-2xl mb-3">
                  Ṣe
                </div>
                <h4 className="text-xl font-bold text-white mb-1">&ldquo;Ṣe&rdquo;</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Means <strong className="text-[#C5A059]">&ldquo;to do.&rdquo;</strong> Taking disciplined, collaborative action toward a goal.
                </p>
              </div>

            </div>

            {/* Hope Banner */}
            <div className="bg-[#072B1D]/90 border border-[#C5A059]/40 rounded-2xl p-6 text-center shadow-md">
              <p className="text-base sm:text-lg font-medium text-white">
                For us it also carries a hope: <span className="text-[#C5A059] font-semibold">when we do it together, we prosper together.</span>
              </p>
            </div>

          </div>
        </div>

        {/* What we believe Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B3022] font-serif mb-3">
              What we believe
            </h2>
            <p className="text-[#1F2937]/70 text-base max-w-xl mx-auto">
              The fundamental principles that guide every feature we build.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col hover:border-[#C5A059]/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#C5A059]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">Community first.</h3>
              <p className="text-[#1F2937]/80 leading-relaxed text-sm">
                Ajo runs on trust between people. We keep that, and add the tools that protect it.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col hover:border-[#C5A059]/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-[#C5A059]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">Accountability built in.</h3>
              <p className="text-[#1F2937]/80 leading-relaxed text-sm">
                Members are verified. Contributions are collected automatically on the due date. Payouts go straight to the member’s bank account. Every round is on a ledger the whole group can see.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col hover:border-[#C5A059]/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-[#C5A059]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">Saving that reaches real goals.</h3>
              <p className="text-[#1F2937]/80 leading-relaxed text-sm">
                School fees, rent, a trip, stock for the shop. We want disciplined group saving to be safe and simple for everyone, including people the banks overlook.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-[#0B3022] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-[#C5A059]/30">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C5A059]/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#10B981]/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <Quote className="w-5 h-5" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif">
                Our story
              </h2>
            </div>

            <div className="space-y-6 text-gray-200 text-base md:text-lg leading-relaxed">
              <p>
                Ajo took me to the UK. It helped me fund part of my master’s, and I’ll always be grateful for it.
              </p>
              
              <p>
                Ajo also cost me money. A friend and I joined a circle to save for a trip, and the admin ran away with the pot. Years later, it still comes up in our group chat.
              </p>
              
              <p>
                What I learned is that Ajo doesn’t run on credit scores. It runs on trust, and trust is worth more than money. But trust alone is a risky thing to build on: one person holding everyone’s money, a ledger in someone’s notebook, a payment that’s late because the bank had a problem and a good member suddenly looks like a defaulter.
              </p>
              
              <div className="py-2">
                <p className="text-xl md:text-2xl font-bold text-white border-l-4 border-[#C5A059] pl-4 italic">
                  I didn’t want to replace Ajo. I wanted to protect it.
                </p>
              </div>

              <p>
                Ajo, Esusu, Susu, Hui. Different names in different places, but the same promise: we’ll look after each other, turn by turn. Àjọṣe is how I keep that promise safe.
              </p>

              <p>
                It’s for families saving together, salary earners, students, traders, church groups, alumni circles and cooperatives. Anyone who saves together deserves a circle that doesn’t break.
              </p>

              {/* Motto callout */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#072418] to-[#0B3827] border border-[#C5A059]/40 my-8 shadow-inner">
                <p className="text-xl md:text-2xl font-serif font-bold text-[#C5A059] text-center">
                  Your turn should come. Turn by turn, no wahala.
                </p>
              </div>

              {/* Founder Sign-off */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-white">Samuel Olatomide Akinboro</h4>
                  <p className="text-sm text-[#C5A059]">Founder, Àjọṣe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
