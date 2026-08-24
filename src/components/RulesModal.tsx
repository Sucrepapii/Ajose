"use client";

import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

export function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500/20 text-blue-400 text-sm font-bold rounded-lg hover:bg-blue-500/30 transition-colors"
      >
        View Rules
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Escrow Rules</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-sm text-zinc-300">
              <div className="space-y-2">
                <h3 className="font-bold text-white">1. Immutable Escrow Active</h3>
                <p>Funds are locked securely in our escrow system. No member, not even the admin, can manually withdraw funds out of turn.</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white">2. Automatic Debits (Auto-Sweep™)</h3>
                <p>On the due date of each cycle, the exact contribution amount is automatically swept from every member's linked primary account. Ensure your account is funded.</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white">3. Payout Calculation & Fees</h3>
                <p>The total pooled amount is calculated based on successful debits. Before disbursement, the system automatically deducts:</p>
                <ul className="list-disc pl-5 text-zinc-400 space-y-1 mt-2">
                  <li><strong className="text-zinc-300">Admin Fee:</strong> Paid to the group creator for managing the group (usually 3%).</li>
                  <li><strong className="text-zinc-300">Platform Fee:</strong> 2% paid to AjoCore for escrow security and auto-sweep automation.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white">4. Direct Disbursement</h3>
                <p>The remaining funds are instantly and automatically credited to the bank account of the member whose turn it is to collect.</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-red-400">5. Defaults & Penalties</h3>
                <p>If an automatic debit fails, the member is marked as 'Defaulted' and their credit score drops significantly. The group will continue with the remaining pool.</p>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
              >
                I Understand
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
