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
                  <p className="text-xs text-[#1F2937]/70">Rotational Contribution Framework</p>
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
                  1. Automated Collection &amp; Payout Architecture
                </h3>
                <p>
                  Contributions are collected automatically by bank debit through Mono on the contribution date. Once NIBSS settles the funds into Àjọṣe&apos;s wallet, the payout is credited automatically to the member whose turn it is. Àjọṣe doesn&apos;t hold onto group funds. If an auto-debit fails, manual bank transfers must be sent directly to the Admin&apos;s settlement account with your unique narration code.
                </p>
              </div>

              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-[#0B3022] flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-[#C5A059]" />
                  2. Frequency-Based Grace Periods & Automated Collection Cutoffs
                </h3>
                <p>
                  To ensure predictable liquidity and smooth banking settlements, all contribution cycles feature structured grace periods before automated debits and rotational payouts execute:
                </p>
                <ul className="list-disc pl-5 text-[#1F2937]/70 space-y-1 mt-1">
                  <li><strong>Daily Groups:</strong> Automated daily direct-debit collection sweep with real-time turn payout.</li>
                  <li><strong>Weekly Groups:</strong> 2-day grace period (opens Monday, final collection & payout cutoff on <strong>Tuesday</strong>).</li>
                  <li><strong>Bi-Weekly Groups:</strong> 3-day grace period (opens Monday, final collection & payout cutoff on <strong>Wednesday</strong>).</li>
                  <li><strong>Monthly Groups:</strong> 5-day grace period (opens 1st, final collection & payout cutoff on the <strong>5th of the new month</strong>).</li>
                </ul>
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
                  4. Commercial Fee Distribution
                </h3>
                <p>Transparent fee rules depending on your chosen group schedule:</p>
                <ul className="list-disc pl-5 text-[#1F2937]/70 space-y-1.5 mt-1">
                  <li><strong>Monthly Groups:</strong> 0% payout fee! 2% platform fee (or custom admin rate) included at auto-debit so turn collectors receive 100% of their savings pot complete.</li>
                  <li><strong>Weekly Groups:</strong> 0% payout fee! Flat ₦300 automated processing fee per transaction.</li>
                  <li><strong>Daily Groups:</strong> 0% payout fee! Flat ₦100 automated processing fee per transaction.</li>
                  <li><strong>Admin Commission:</strong> The customized percentage determined by the Admin upon group creation to compensate for management and trust.</li>
                </ul>
              </div>

              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-red-600 flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  5. Defaults, Trust Score Penalties &amp; Recovery
                </h3>
                <p>
                  If an automatic debit fails after receiving a payout, the defaulter faces immediate Àjọṣe Trust Score reduction, platform account suspension, circle-defined recovery procedures, and potential legal recourse through agreed circle covenants.
                </p>
              </div>

              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-[#0B3022] flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-[#C5A059]" />
                  6. Mid-Cycle Exits, Agreed Departure Fees &amp; Settlement Rules
                </h3>
                <p>
                  Rotational contributions depend on mutual commitment throughout all rounds:
                </p>
                <ul className="list-disc pl-5 text-[#1F2937]/70 space-y-1.5 mt-1">
                  <li><strong>Before Cycle Launch (Pending):</strong> The Admin trustee can freely adjust member slots with <strong>zero fines or penalties</strong>.</li>
                  <li><strong>Mid-Cycle Exit (Awaiting Payout):</strong> If a member requests to leave or is removed before their turn, an agreed <strong>15% Early Departure Administrative Fee</strong> is assessed (10% to the Circle Organizer for disruption and replacement management, and 5% platform fee). Reconciled past contributions minus the administrative fee are settled on their scheduled turn. No premature cashouts that disrupt ongoing turns are permitted.</li>
                  <li><strong>Mid-Cycle Exit (Already Collected):</strong> Members who already received their Ajo Pot payout cannot abandon subsequent rounds. Their ongoing Direct Debit authorization remains active to fulfill all scheduled contributions, their platform Trust Score is penalized, and they are restricted from future circles.</li>
                </ul>
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
