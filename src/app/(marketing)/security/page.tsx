import { ShieldCheck, Lock, Eye, FileText, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Trust | Ajo Circle",
  description: "Learn how Ajo Circle protects your savings with bank-grade encryption, BVN verification, and the Ajo Credit Penalty System.",
};

export default function SecurityPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0B3022]/5 rounded-full blur-[100px] -translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0B3022] mb-6 font-serif">
            Institutional-Grade <span className="text-[#C5A059]">Security</span>
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Your savings are protected by rigorous identity verification, an immutable ledger system, and strict credit penalty enforcement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
            <div className="w-16 h-16 rounded-2xl bg-[#0B3022] flex items-center justify-center shadow-lg mb-6">
              <Lock className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-2xl font-black text-[#0B3022] mb-3">End-to-End Encryption</h3>
            <p className="text-[#1F2937]/80 leading-relaxed font-medium">
              All financial data and personal information is encrypted both in transit and at rest using AES-256 standards. We never store raw banking credentials.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
            <div className="w-16 h-16 rounded-2xl bg-[#0B3022] flex items-center justify-center shadow-lg mb-6">
              <ShieldCheck className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="text-2xl font-black text-[#0B3022] mb-3">Identity Verification</h3>
            <p className="text-[#1F2937]/80 leading-relaxed font-medium">
              Every member on Ajo Circle must pass our strict Know Your Customer (KYC) protocols using valid BVN before they can join an active savings group.
            </p>
          </div>
        </div>

        {/* Credit Penalty Section */}
        <div className="bg-[#0B3022] p-10 md:p-16 rounded-[2.5rem] shadow-2xl border border-[#0B3022]/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#C5A059]/20 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="md:w-1/3 shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#C5A059]/10 border-4 border-[#C5A059]/30 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-[#C5A059]" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-black text-white mb-4">The Ajo Credit Penalty System</h2>
              <p className="text-white/80 leading-relaxed font-medium text-lg mb-6">
                Trust is the foundation of cooperative savings. To protect the pool, we enforce a strict penalty system:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  </div>
                  <p className="text-white font-medium">Defaulting on a payment results in an immediate <strong>-50 point</strong> penalty to your global Ajo Credit Score.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#C5A059]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 bg-[#C5A059] rounded-full"></span>
                  </div>
                  <p className="text-white font-medium">Users with poor credit scores are automatically restricted from joining premium or high-value groups.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
