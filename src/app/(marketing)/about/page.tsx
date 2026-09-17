import { Users, Target, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-6">
            About Àjọṣe
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-3xl mx-auto">
            We are redefining community finance. Àjọṣe brings institutional trust, accountability, and seamless software to the world's oldest form of collaborative contribution.
          </p>
        </div>

        {/* The Meaning of Àjọṣe Section */}
        <div className="mb-20 bg-gradient-to-b from-[#0B3022] to-[#072418] text-white rounded-3xl p-8 sm:p-12 border border-[#C5A059]/30 shadow-xl relative overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider">Etymology &amp; Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              What does <span className="text-[#C5A059] font-serif">Àjọṣe</span> mean?
            </h2>

            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto mb-10">
              The name <strong className="text-white font-serif">Àjọṣe</strong> means <strong className="text-[#C5A059]">&ldquo;joint gain&rdquo;</strong> or <strong className="text-[#C5A059]">&ldquo;together we prosper&rdquo;</strong> <span className="text-gray-300">[in Yoruba]</span>.
            </p>

            <p className="text-xs uppercase tracking-widest text-[#C5A059] font-bold mb-6">
              Here is the breakdown of why it means that:
            </p>

            {/* 3 Component Breakdown Cards */}
            <div className="grid sm:grid-cols-3 gap-5 mb-10 text-left">
              
              {/* Card 1: A */}
              <div className="bg-[#0B3827]/80 hover:bg-[#0E4430] border border-[#C5A059]/30 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] shadow-lg group">
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-serif font-black text-2xl mb-4 group-hover:scale-110 transition-transform">
                  A
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">Part 1</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">Pronoun</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">&ldquo;A&rdquo;</h4>
                  <p className="text-gray-300 text-sm leading-relaxed pt-1">
                    This part means <strong className="text-[#C5A059]">&ldquo;we.&rdquo;</strong> It speaks to the collective community — no one journeys alone.
                  </p>
                </div>
              </div>

              {/* Card 2: Jo */}
              <div className="bg-[#0B3827]/80 hover:bg-[#0E4430] border border-[#C5A059]/30 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] shadow-lg group">
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-serif font-black text-2xl mb-4 group-hover:scale-110 transition-transform">
                  Jọ
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">Part 2</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">Unity</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">&ldquo;Jọ&rdquo; <span className="text-xs font-normal text-gray-400">(Jo)</span></h4>
                  <p className="text-gray-300 text-sm leading-relaxed pt-1">
                    This part means <strong className="text-[#C5A059]">&ldquo;together.&rdquo;</strong> Bringing people together in mutual solidarity.
                  </p>
                </div>
              </div>

              {/* Card 3: Se */}
              <div className="bg-[#0B3827]/80 hover:bg-[#0E4430] border border-[#C5A059]/30 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] shadow-lg group">
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-serif font-black text-2xl mb-4 group-hover:scale-110 transition-transform">
                  Ṣe
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">Part 3</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">Action</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">&ldquo;Ṣe&rdquo; <span className="text-xs font-normal text-gray-400">(Se)</span></h4>
                  <p className="text-gray-300 text-sm leading-relaxed pt-1">
                    This part means <strong className="text-[#C5A059]">&ldquo;to do&rdquo;</strong> or <strong className="text-[#C5A059]">&ldquo;to make.&rdquo;</strong> Taking disciplined action toward a goal.
                  </p>
                </div>
              </div>

            </div>

            {/* Literal Idea Highlight Banner */}
            <div className="bg-[#072B1D]/90 border border-[#C5A059]/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left shadow-md">
              <div className="w-12 h-12 rounded-full bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059] shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">Literal Idea</p>
                <p className="text-base sm:text-lg font-medium text-white">
                  It carries the idea of doing things together to achieve success or wealth.
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 mx-auto flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-xl font-bold text-[#0B3022] mb-3">Community First</h3>
            <p className="text-[#1F2937]/70 leading-relaxed">
              Rotational contribution groups are built on trust between people. We provide the tools to scale that trust securely across wider networks.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 mx-auto flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-xl font-bold text-[#0B3022] mb-3">Institutional Grade</h3>
            <p className="text-[#1F2937]/70 leading-relaxed">
              We treat group contributions with the same regulatory compliance, encryption, and rigor as a private bank.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 mx-auto flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-xl font-bold text-[#0B3022] mb-3">Financial Inclusion</h3>
            <p className="text-[#1F2937]/70 leading-relaxed">
              Our mission is to help people build credit and achieve financial goals through disciplined, collective contribution.
            </p>
          </div>
        </div>

        <div className="bg-[#0B3022] rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-[#C5A059]/10 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Our Story: The Future of Trust, Reimagined</h2>
          <div className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto relative z-10 space-y-6 text-left md:text-center">
            <p>
              For centuries, across continents and cultures, the "circle" has been a sacred promise. Known as Ajo in Nigeria, Esusu in the Caribbean, Susu in West Africa, and Hui in Asia, it is the quiet engine of community wealth—the invisible hand that has helped families buy homes, educated children, and launched dreams that banks deemed too small to notice. It is a system built not on credit scores, but on a currency more powerful than money itself: trust.
            </p>
            <p>
              But even trust has its limits. For every success story, there is a tale of a circle broken—a member who vanished with the pot, a ledger lost to a spilled drink, an argument over who paid what. These age-old systems, while beautiful in their intent, have always been plagued by administrative friction, a frustrating lack of transparency, and the devastating risk of default. The fear of loss has always been the shadow cast by the light of mutual aid.
            </p>
            <p className="font-bold text-white text-xl">
              We founded Àjọṣe to banish that shadow for good.
            </p>
            <p>
              We saw an opportunity to elevate a time-honored tradition by giving it a modern backbone. We didn't come to replace the soul of the circle; we came to fortify it. By weaving in ironclad KYC protocols, we replace blind trust with verifiable identity. By introducing automated, tamper-proof ledgers, we replace the anxiety of manual counting with absolute, real-time clarity. And with seamless, direct bank payouts, we replace the risk of a lost envelope with the certainty of a digital transaction.
            </p>
            <p>
              We are not just building an app; we are building a renaissance in collaborative finance. We are preserving the profound human connection of the circle, while stripping away the fear that has held it back for centuries. Àjọṣe is where ancient tradition meets modern engineering. It is where the collective strength of the community is safeguarded by the unshakeable reliability of code.
            </p>
            <p className="font-bold text-[#C5A059]">
              We are building a world where contributing together is not a leap of faith, but a guarantee. We are building the modern standard for collaborative finance.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
