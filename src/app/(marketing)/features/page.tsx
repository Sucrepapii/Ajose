import { ShieldCheck, Zap, Repeat, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | Ajo Circle",
  description: "Discover the powerful features of Ajo Circle that make cooperative savings secure, automated, and effortless.",
};

export default function FeaturesPage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-[#0B3022]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0B3022] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-[#C5A059]/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight font-serif leading-tight">
            Built for <span className="text-[#C5A059]">Trust</span>. <br/> Engineered for <span className="text-[#C5A059]">Scale</span>.
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Ajo Circle combines bank-grade open finance integrations with intuitive tools to completely automate and secure your savings groups.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-10 lg:p-12 shadow-xl border border-gray-100 hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-2xl group-hover:bg-[#C5A059]/20 transition-all"></div>
              <div className="w-16 h-16 bg-[#0B3022] rounded-2xl flex items-center justify-center mb-8 shadow-md">
                <ShieldCheck className="h-8 w-8 text-[#C5A059]" />
              </div>
              <h3 className="text-3xl font-black text-[#0B3022] mb-4">Identity & BVN Verification</h3>
              <p className="text-[#1F2937]/80 text-lg leading-relaxed font-medium">
                Every member must pass a strict BVN verification process through our open-banking partners. Eliminate anonymous defaults and ensure you know exactly who is in your pool.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0B3022] rounded-3xl p-10 lg:p-12 shadow-xl border border-[#0B3022]/10 hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-2xl group-hover:bg-[#C5A059]/20 transition-all"></div>
              <div className="w-16 h-16 bg-[#C5A059]/20 rounded-2xl flex items-center justify-center mb-8 border border-[#C5A059]/30">
                <Zap className="h-8 w-8 text-[#C5A059]" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Direct Debit Auto-Sweep</h3>
              <p className="text-white/80 text-lg leading-relaxed font-medium">
                No more chasing members for payments. Upon joining, members establish a direct debit mandate. Contributions are automatically swept from their linked bank accounts precisely when due.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-10 lg:p-12 shadow-xl border border-gray-100 hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-2xl group-hover:bg-[#C5A059]/20 transition-all"></div>
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100">
                <Repeat className="h-8 w-8 text-[#0B3022]" />
              </div>
              <h3 className="text-3xl font-black text-[#0B3022] mb-4">Ajo Circle Credit Score</h3>
              <p className="text-[#1F2937]/80 text-lg leading-relaxed font-medium">
                We track every successful payment and default across the platform to generate a universal credit score. Admins can restrict their groups to only allow members with high trust scores.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#082319] rounded-3xl p-10 lg:p-12 shadow-xl border border-[#0B3022]/10 hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-2xl group-hover:bg-[#C5A059]/20 transition-all"></div>
              <div className="w-16 h-16 bg-[#C5A059]/20 rounded-2xl flex items-center justify-center mb-8 border border-[#C5A059]/30">
                <MessageCircle className="h-8 w-8 text-[#C5A059]" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">WhatsApp Integration</h3>
              <p className="text-white/80 text-lg leading-relaxed font-medium">
                Receive instant notifications for payouts, upcoming debits, and group updates directly on WhatsApp. Keep your group engaged without requiring them to check the app daily.
              </p>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
