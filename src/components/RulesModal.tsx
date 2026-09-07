"use client";

import { useState } from "react";
import { ShieldCheck, X, Landmark, AlertTriangle, Zap, Users } from "lucide-react";

export function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#0B3022]/10 hover:bg-[#0B3022]/20 text-[#0B3022] text-xs font-bold rounded-lg transition-colors border border-[#0B3022]/20 cursor-pointer"
      >
        View Group Rules
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FDFBF7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B3022]/5 border border-[#0B3022]/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[#C5A059]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B3022]">Governance & Settlement Rules</h2>
                  <p className="text-xs text-[#1F2937]/70">Rotational Savings Framework</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#1F2937]/80 leading-relaxed divide-y divide-gray-100">
              <div className="space-y-1.5">
                <h3 className="font-bold text-[#0B3022] flex items-center gap-2 text-sm">
                  <Landmark className="h-4 w-4 text-[#C5A059]" />
                  1. Non-Custodial Pass-Through Architecture
                </h3>
                <p>
                  Àjọṣe is a licensed technology provider and is <strong>not a commercial deposit bank</strong>. We do not hold user money. Each Admin tenders an authorized settlement bank account. Contributions are deposited directly into this account and rotational payouts are automatically debited from it.
                </p>
              </div>

              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-[#0B3022] flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-[#C5A059]" />
                  2. Automatic Member Debits (Auto-Sweep)
                </h3>
                <p>
                  On the scheduled cycle due date, the exact contribution is automatically swept from each member's linked primary bank account under the authorized direct debit mandate.
                </p>
              </div>

              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-[#0B3022] flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-[#C5A059]" />
                  3. Admin Auto-Debit Payouts & Transparency
                </h3>
                <p>
                  When cycle payouts are disbursed, the Admin's tendered settlement account is automatically debited to credit the receiving member. If an Admin auto-debit fails (e.g., due to insufficient funds), <strong>all members will immediately see the failure alert in real time</strong>.
                </p>
              </div>

              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-[#0B3022] text-sm">
                  4. Fee Distribution
                </h3>
                <p>Before disbursement, the pooled funds account for:</p>
                <ul className="list-disc pl-5 text-[#1F2937]/70 space-y-1 mt-1">
                  <li><strong>Admin Commission:</strong> The customized percentage determined by the Admin upon group creation.</li>
                  <li><strong>Platform Fee:</strong> 2% for open-banking infrastructure and ledger maintenance.</li>
                </ul>
              </div>

              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-red-600 flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  5. Defaults, Credit Bureau Reporting & Penalties
                </h3>
                <p>
                  If an automatic debit fails after receiving a payout, the defaulter faces immediate credit score degradation, mandatory blacklisting across PSSP networks, and BVN/NIN credit bureau reporting.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#FDFBF7]">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-[#0B3022] hover:bg-[#0B3022]/90 text-[#C5A059] font-bold rounded-xl text-xs transition-colors"
              >
                I Understand & Agree
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
