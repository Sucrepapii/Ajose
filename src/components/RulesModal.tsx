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
                  1. Non-Custodial Pass-Through Architecture
                </h3>
                <p>
                  Àjọṣe is a licensed technology provider and is <strong>not a commercial deposit bank</strong>. We do not hold user money. Each Admin tenders an authorized settlement bank account. Contributions are deposited directly into this account and rotational payouts are automatically debited from it. If an auto-debit fails, manual bank transfers must be sent directly to the Admin&apos;s settlement account with your unique narration code, never to Àjọṣe.
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
                  <li><strong>Daily Groups:</strong> 24-hour collection cadence (opens morning, collection &amp; payout cutoff same day).</li>
                  <li><strong>Weekly Groups:</strong> 2-day grace period (opens Monday, final collection &amp; payout cutoff on <strong>Tuesday</strong>).</li>
                  <li><strong>Bi-Weekly Groups:</strong> 3-day grace period (opens Monday, final collection &amp; payout cutoff on <strong>Wednesday</strong>).</li>
                  <li><strong>Monthly Groups:</strong> 5-day grace period (opens 1st, final collection &amp; payout cutoff on the <strong>5th of the new month</strong>).</li>
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
                  4. Fee Distribution
                </h3>
                <p>Before disbursement, the pooled funds account for:</p>
                <ul className="list-disc pl-5 text-[#1F2937]/70 space-y-1 mt-1">
                  <li><strong>Admin Commission:</strong> The customized percentage determined by the Admin upon group creation.</li>
                  <li><strong>Platform Fee:</strong> 2% (capped at ₦15,000 maximum) for open-banking infrastructure and ledger maintenance.</li>
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

              <div className="space-y-1.5 pt-4">
                <h3 className="font-bold text-[#0B3022] flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-[#C5A059]" />
                  6. Mid-Cycle Exits, 15% Departure Fine & Settlement Rules
                </h3>
                <p>
                  Rotational contributions depend on mutual commitment throughout all rounds:
                </p>
                <ul className="list-disc pl-5 text-[#1F2937]/70 space-y-1.5 mt-1">
                  <li><strong>Before Cycle Launch (Pending):</strong> The Admin trustee can freely add or remove members with <strong>zero fines or penalties</strong>.</li>
                  <li><strong>Mid-Cycle Exit (Awaiting Payout):</strong> If a member leaves or is removed before their turn, a mandatory <strong>15% Early Departure Fine</strong> is assessed (<strong>10% to the Admin</strong> for schedule disruption and managing replacement, and <strong>5% to Àjọṣe</strong>). <em>Crucially, they must wait until their scheduled turn to collect their reconciled past contributions minus the 15% fine.</em> No premature cashouts are permitted.</li>
                  <li><strong>Mid-Cycle Exit (Already Collected):</strong> Members who already received their Ajo Pot payout cannot abandon subsequent rounds. They <strong>must pay the 15% fine immediately</strong>, their ongoing Mono Direct Debit mandate remains fully active to recover all remaining contributions, their credit score is penalized (-50 points), and credit bureau default reporting is initiated.</li>
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
