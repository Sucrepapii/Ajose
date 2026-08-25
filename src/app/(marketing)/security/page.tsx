import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function SecurityPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#0B3022] mb-6">
            Bank-Grade Security
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-2xl mx-auto">
            Your savings are protected by institutional-grade encryption, rigorous identity verification, and an immutable ledger system.
          </p>
        </div>

        <div className="space-y-12">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-[#0B3022] flex items-center justify-center shadow-lg shrink-0">
              <Lock className="w-8 h-8 text-[#C5A059]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#0B3022] mb-3">End-to-End Encryption</h3>
              <p className="text-[#1F2937]/80 leading-relaxed">
                All financial data and personal information is encrypted both in transit and at rest using AES-256 standards. We never store raw banking credentials.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-[#0B3022] flex items-center justify-center shadow-lg shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#C5A059]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#0B3022] mb-3">Identity Verification (KYC)</h3>
              <p className="text-[#1F2937]/80 leading-relaxed">
                Every member on Ajo Circle must pass our strict Know Your Customer (KYC) protocols using valid BVN/NIN before they can join an active savings group.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-[#0B3022] flex items-center justify-center shadow-lg shrink-0">
              <FileText className="w-8 h-8 text-[#C5A059]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#0B3022] mb-3">Immutable Ledger</h3>
              <p className="text-[#1F2937]/80 leading-relaxed">
                Once a contribution or payout is logged, it cannot be deleted or altered without consensus. This creates a 100% transparent history for all members to audit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
