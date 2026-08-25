import { Users, Target, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-6">
            About Ajo Circle
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-3xl mx-auto">
            We are redefining community finance. Ajo Circle brings institutional trust, accountability, and seamless software to the world's oldest form of collaborative saving.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 mx-auto flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-xl font-bold text-[#0B3022] mb-3">Community First</h3>
            <p className="text-[#1F2937]/70 leading-relaxed">
              ROSCAs are built on trust between people. We provide the tools to scale that trust securely across wider networks.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 mx-auto flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-xl font-bold text-[#0B3022] mb-3">Institutional Grade</h3>
            <p className="text-[#1F2937]/70 leading-relaxed">
              We treat group savings with the same regulatory compliance, encryption, and rigor as a private bank.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 mx-auto flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-xl font-bold text-[#0B3022] mb-3">Financial Inclusion</h3>
            <p className="text-[#1F2937]/70 leading-relaxed">
              Our mission is to help people build credit and achieve financial goals through disciplined, collective saving.
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
              We founded Ajo Circle to banish that shadow for good.
            </p>
            <p>
              We saw an opportunity to elevate a time-honored tradition by giving it a modern backbone. We didn't come to replace the soul of the circle; we came to fortify it. By weaving in ironclad KYC protocols, we replace blind trust with verifiable identity. By introducing automated, tamper-proof ledgers, we replace the anxiety of manual counting with absolute, real-time clarity. And with seamless, direct bank payouts, we replace the risk of a lost envelope with the certainty of a digital transaction.
            </p>
            <p>
              We are not just building an app; we are building a renaissance in collaborative finance. We are preserving the profound human connection of the circle, while stripping away the fear that has held it back for centuries. Ajo Circle is where ancient tradition meets modern engineering. It is where the collective strength of the community is safeguarded by the unshakeable reliability of code.
            </p>
            <p className="font-bold text-[#C5A059]">
              We are building a world where saving together is not a leap of faith, but a guarantee. We are building the modern standard for collaborative finance.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
