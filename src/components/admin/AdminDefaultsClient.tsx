"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Coins, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  FileSpreadsheet,
  Building2,
  Lock
} from "lucide-react";
import { toast } from "sonner";

export function AdminDefaultsClient() {
  const [activeTab, setActiveTab] = useState<"fines" | "defaulters">("fines");

  // Sample real-time tracking items for demonstration and operations audit
  const exitFines = [
    {
      id: "fine-101",
      memberName: "Babatunde Lawal",
      phone: "0803***8821",
      groupName: "Ikeja Tech Savers",
      departureDate: "2026-09-15",
      type: "Pre-Payout Departure",
      status: "Waiting Turn",
      payoutTurn: 7,
      currentTurn: 3,
      poolAmount: 100000,
      totalFine15Pct: 15000,
      adminCut10Pct: 10000,
      ajoseCut5Pct: 5000,
      payoutAction: "Will disburse net ₦85,000 on Turn 7",
      recoveryStatus: "Resolved (Mandate Withheld)"
    },
    {
      id: "fine-102",
      memberName: "Ngozi Eze",
      phone: "0814***1920",
      groupName: "Victoria Island Circle #2",
      departureDate: "2026-09-12",
      type: "Pre-Payout Departure",
      status: "Waiting Turn",
      payoutTurn: 5,
      currentTurn: 4,
      poolAmount: 200000,
      totalFine15Pct: 30000,
      adminCut10Pct: 20000,
      ajoseCut5Pct: 10000,
      payoutAction: "Will disburse net ₦170,000 on Turn 5",
      recoveryStatus: "Resolved (Mandate Withheld)"
    },
    {
      id: "fine-103",
      memberName: "Emeka Okonkwo",
      phone: "0902***4412",
      groupName: "Mainland Merchants",
      departureDate: "2026-09-08",
      type: "Post-Payout Defaulter",
      status: "Defaulter Flagged",
      payoutTurn: 1,
      currentTurn: 3,
      poolAmount: 150000,
      totalFine15Pct: 22500,
      adminCut10Pct: 15000,
      ajoseCut5Pct: 7500,
      payoutAction: "Collected ₦150k on Turn 1; skipped Turn 2 & 3",
      recoveryStatus: "Automated Mono Sweep Active"
    }
  ];

  const handleTriggerRecovery = (id: string, name: string) => {
    toast.success(`Automated Mono Direct Debit recovery initiated for ${name}. Cross-bank routing active via BVN.`);
  };

  const handleReportBureau = (name: string) => {
    toast.success(`Default record for ${name} submitted to CRC & FirstCentral credit bureaus.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("fines")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "fines"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          15% Exit Fine Breakdown (10% Admin / 5% Àjọṣe)
        </button>

        <button
          onClick={() => setActiveTab("defaulters")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "defaulters"
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          Defaulters &amp; Credit Bureau Blacklist Desk
        </button>
      </div>

      {activeTab === "fines" ? (
        <div className="space-y-6">
          
          {/* Policy Overview Callout */}
          <div className="bg-[#0C120E] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">15% Early Departure Split Policy (Req 7 &amp; 8)</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  When a member leaves mid-cycle, a 15% exit fine is levied. <strong className="text-emerald-400">10%</strong> is credited to the circle Admin trustee as compensation for re-balancing the roster, and <strong className="text-[#C5A059]">5%</strong> is retained by Àjọṣe. Members awaiting payout must wait their turn to collect net funds.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase font-mono text-zinc-500">Fine Revenue Share</p>
              <p className="text-lg font-black text-[#C5A059]">10% Admin • 5% Àjọṣe</p>
            </div>
          </div>

          {/* Fines Table */}
          <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 text-[10px]">
                    <th className="px-5 py-4">Exited Member &amp; Circle</th>
                    <th className="px-5 py-4">Exit Type &amp; Status</th>
                    <th className="px-5 py-4">Total 15% Fine</th>
                    <th className="px-5 py-4">10% Admin Split</th>
                    <th className="px-5 py-4">5% Àjọṣe Split</th>
                    <th className="px-5 py-4">Resolution Action</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {exitFines.map((fine) => (
                    <tr key={fine.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white text-sm">{fine.memberName}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{fine.groupName}</p>
                        <p className="text-[10px] font-mono text-zinc-500">{fine.phone}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          fine.type === "Post-Payout Defaulter"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {fine.type}
                        </span>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          {fine.status} (Turn {fine.payoutTurn})
                        </p>
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                        ₦{fine.totalFine15Pct.toLocaleString()}
                        <p className="text-[10px] text-zinc-500 font-normal">of ₦{fine.poolAmount.toLocaleString()}</p>
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-emerald-400 text-sm">
                        ₦{fine.adminCut10Pct.toLocaleString()}
                        <p className="text-[10px] text-zinc-500 font-normal">To Admin Bank</p>
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-[#C5A059] text-sm">
                        ₦{fine.ajoseCut5Pct.toLocaleString()}
                        <p className="text-[10px] text-zinc-500 font-normal">Platform Fee</p>
                      </td>

                      <td className="px-5 py-4 text-zinc-300">
                        <p className="text-xs leading-relaxed">{fine.payoutAction}</p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1">{fine.recoveryStatus}</p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {fine.type === "Post-Payout Defaulter" && (
                          <button
                            onClick={() => handleTriggerRecovery(fine.id, fine.memberName)}
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Sweep Mono
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6">
          
          <div className="bg-[#0C120E] border border-red-500/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Defaulter Enforcement &amp; Bureau Blacklisting</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Members who collect rotational funds early and refuse subsequent contributions undergo automated multi-bank recovery sweeps through Mono Open-Banking. Irrecoverable accounts are automatically reported to CRC Credit Bureau &amp; FirstCentral via verified BVN / NIN records.
              </p>
            </div>
          </div>

          <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div>
                <h4 className="font-bold text-white text-sm">Active Defaulter Recovery Queue</h4>
                <p className="text-xs text-zinc-400">1 active recovery ongoing via linked Mono direct debit</p>
              </div>
              <button
                onClick={() => handleReportBureau("Emeka Okonkwo")}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Report to Bureau (CRC)
              </button>
            </div>

            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Emeka Okonkwo (Mainland Merchants Circle)</span>
                <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  ARREARS: ₦100,000
                </span>
              </div>
              <p className="text-zinc-400 text-xs">
                Collected ₦150,000 on Turn 1. Defaulted on Round 2 &amp; 3. Total fine levied: ₦22,500 (15%). 
                Mono Standing Debit Mandate is attempting daily background sweeps against registered Access Bank and Zenith Bank BVN accounts.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
