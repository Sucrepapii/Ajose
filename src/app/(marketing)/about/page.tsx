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
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#F3EEE3] py-20 md:py-28">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        
        {/* Hero Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B3022]/[0.06] border border-[#0B3022]/15 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
            <span className="text-[11px] font-mono font-bold text-[#0B3022] uppercase tracking-[0.16em]">Our Purpose</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-[#0B3022] mb-6 leading-[1.06]">
            About{" "}
            <span className="font-editorial italic font-normal text-[#0B3022] underline decoration-[#D4A843] decoration-2 underline-offset-8">
              Àjọṣe.
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-[#0B3022] max-w-3xl mx-auto leading-snug mb-4 tracking-tight">
            Saving together should never cost you your money.
          </p>
          <p className="text-lg md:text-xl text-[#0B3022]/75 leading-relaxed max-w-2xl mx-auto">
            Àjọṣe brings accountability and simple software to the oldest way people save together: the circle.
          </p>
        </div>

        {/* What Àjọṣe means Section */}
        <div className="mb-20 bg-[#0B3022] text-[#F3EEE3] rounded-3xl p-8 sm:p-12 border border-[#F3EEE3]/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A843]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A843]/15 border border-[#D4A843]/35 mb-6">
              <HeartHandshake className="w-4 h-4 text-[#D4A843]" />
              <span className="text-[11px] font-mono font-bold text-[#D4A843] uppercase tracking-[0.16em]">Etymology &amp; Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              What{" "}
              <span className="font-editorial italic font-normal text-[#D4A843]">Àjọṣe</span>{" "}
              means.
            </h2>

            <p className="text-lg sm:text-xl text-[#F3EEE3]/80 leading-relaxed mb-8">
              <strong className="text-[#F3EEE3]">Àjọṣe</strong> is a Yoruba word for relationship and cooperation, people doing things together. It comes from <strong className="text-[#D4A843]">a</strong> (we), <strong className="text-[#D4A843]">jọ</strong> (together), and <strong className="text-[#D4A843]">ṣe</strong> (to do).
            </p>

            {/* Root Word Breakdown Cards: A, Jọ, Ṣe */}
            <div className="grid sm:grid-cols-3 gap-5 mb-8 text-left max-w-3xl mx-auto">
              
              {/* Card 1: A */}
              <div className="bg-[#F3EEE3]/[0.05] border border-[#F3EEE3]/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#D4A843]/15 border border-[#D4A843]/35 flex items-center justify-center text-[#D4A843] font-editorial italic text-3xl mb-3">
                  A
                </div>
                <h4 className="text-xl font-bold text-[#F3EEE3] mb-1">&ldquo;A&rdquo;</h4>
                <p className="text-[#F3EEE3]/75 text-sm leading-relaxed">
                  Means <strong className="text-[#D4A843]">&ldquo;we.&rdquo;</strong> It speaks to the collective community — no one journeys alone.
                </p>
              </div>

              {/* Card 2: Jo */}
              <div className="bg-[#F3EEE3]/[0.05] border border-[#F3EEE3]/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#D4A843]/15 border border-[#D4A843]/35 flex items-center justify-center text-[#D4A843] font-editorial italic text-3xl mb-3">
                  Jọ
                </div>
                <h4 className="text-xl font-bold text-[#F3EEE3] mb-1">&ldquo;Jọ&rdquo;</h4>
                <p className="text-[#F3EEE3]/75 text-sm leading-relaxed">
                  Means <strong className="text-[#D4A843]">&ldquo;together.&rdquo;</strong> Bringing people together in mutual solidarity and trust.
                </p>
              </div>

              {/* Card 3: Se */}
              <div className="bg-[#F3EEE3]/[0.05] border border-[#F3EEE3]/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#D4A843]/15 border border-[#D4A843]/35 flex items-center justify-center text-[#D4A843] font-editorial italic text-3xl mb-3">
                  Ṣe
                </div>
                <h4 className="text-xl font-bold text-[#F3EEE3] mb-1">&ldquo;Ṣe&rdquo;</h4>
                <p className="text-[#F3EEE3]/75 text-sm leading-relaxed">
                  Means <strong className="text-[#D4A843]">&ldquo;to do.&rdquo;</strong> Taking disciplined, collaborative action toward a goal.
                </p>
              </div>

            </div>

            {/* Hope Banner */}
            <div className="bg-[#F3EEE3]/[0.04] border border-[#D4A843]/35 rounded-2xl p-6 text-center">
              <p className="text-base sm:text-lg font-medium text-[#F3EEE3]">
                For us it also carries a hope:{" "}
                <span className="font-editorial italic text-xl text-[#D4A843]">
                  when we do it together, we prosper together.
                </span>
              </p>
            </div>

          </div>
        </div>

        {/* What we believe Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-[#0B3022] tracking-tight mb-3">
              What we{" "}
              <span className="font-editorial italic font-normal">believe.</span>
            </h2>
            <p className="text-[#0B3022]/70 text-base max-w-xl mx-auto">
              The fundamental principles that guide every feature we build.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            <div className="bg-white p-8 rounded-3xl border border-[#0B3022]/10 shadow-xs flex flex-col hover:border-[#D4A843]/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#0B3022] flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#D4A843]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">Community first.</h3>
              <p className="text-[#0B3022]/75 leading-relaxed text-sm">
                Ajo runs on trust between people. We keep that, and add the tools that protect it.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-[#0B3022]/10 shadow-xs flex flex-col hover:border-[#D4A843]/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#0B3022] flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-[#D4A843]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">Accountability built in.</h3>
              <p className="text-[#0B3022]/75 leading-relaxed text-sm">
                Members are verified. Contributions are collected automatically on the due date. Payouts go straight to the member’s bank account. Every round is on a ledger the whole group can see.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#0B3022]/10 shadow-xs flex flex-col hover:border-[#D4A843]/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#0B3022] flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-[#D4A843]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3022] mb-3">Saving that reaches real goals.</h3>
              <p className="text-[#0B3022]/75 leading-relaxed text-sm">
                School fees, rent, a trip, stock for the shop. We want disciplined group saving to be safe and simple for everyone, including people the banks overlook.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-[#0B3022] rounded-3xl p-8 sm:p-14 text-[#F3EEE3] relative overflow-hidden shadow-2xl border border-[#F3EEE3]/10">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#D4A843]/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#D4A843]/15 border border-[#D4A843]/35 flex items-center justify-center text-[#D4A843]">
                <Quote className="w-5 h-5" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#F3EEE3] tracking-tight">
                Our{" "}
                <span className="font-editorial italic font-normal text-[#D4A843]">story.</span>
              </h2>
            </div>

            <div className="space-y-6 text-[#F3EEE3]/85 text-base md:text-lg leading-relaxed">
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
                <p className="text-2xl md:text-3xl font-editorial italic text-[#F3EEE3] border-l-4 border-[#D4A843] pl-5">
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
              <div className="p-6 rounded-2xl bg-[#F3EEE3]/[0.05] border border-[#D4A843]/35 my-8">
                <p className="text-2xl md:text-3xl font-editorial italic text-[#D4A843] text-center">
                  Your turn should come. Turn by turn, no wahala.
                </p>
              </div>

              {/* Founder Sign-off */}
              <div className="pt-4 border-t border-[#F3EEE3]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-[#F3EEE3]">Samuel Olatomide Akinboro</h4>
                  <p className="text-xs font-mono uppercase tracking-wider text-[#D4A843]">Founder, Àjọṣe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
