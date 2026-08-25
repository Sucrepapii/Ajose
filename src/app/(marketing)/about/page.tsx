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
          <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Our Story</h2>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto relative z-10">
            For generations, Rotating Savings and Credit Associations (Ajo, Esusu, Susu) have been the backbone of community wealth building. However, they've always been plagued by administrative friction, lack of transparency, and the devastating risk of member defaults. 
            <br/><br/>
            Ajo Circle was founded to solve this. By integrating strict KYC protocols, automated ledgers, and seamless bank payouts, we've removed the anxiety from group savings. We are building the modern standard for collaborative finance.
          </p>
        </div>
      </div>
    </main>
  );
}
